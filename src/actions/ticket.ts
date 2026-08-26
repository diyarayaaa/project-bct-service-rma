"use server";

import { db } from "@/lib/db";
import { ticketSchema, updateStatusSchema } from "@/lib/validations";
import { cookies } from "next/headers";
import { verifyJWT } from "@/lib/auth";
import { Prisma, DeviceType, ServiceStatus, VendorResult } from "@prisma/client";
import { revalidatePath } from "next/cache";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface ActionResponse<T = any> {
  success: boolean;
  error?: string;
  data?: T;
}

export async function generateNextTicketNumber(): Promise<string> {
  const currentYear = new Date().getFullYear();
  const yearSuffix = String(currentYear).slice(-2); // e.g. "26" for 2026
  const yearPrefix = `BCTRS${yearSuffix}-`;

  try {
    const lastTicket = await db.serviceTicket.findFirst({
      where: {
        ticketNumber: {
          startsWith: yearPrefix,
        },
      },
      orderBy: {
        ticketNumber: "desc",
      },
      select: {
        ticketNumber: true,
      },
    });

    let nextSeq = 1;
    if (lastTicket) {
      const parts = lastTicket.ticketNumber.split("-");
      if (parts.length === 2) {
        const currentSeq = parseInt(parts[1], 10);
        if (!isNaN(currentSeq)) {
          nextSeq = currentSeq + 1;
        }
      }
    }

    const paddedSeq = String(nextSeq).padStart(4, "0");
    return `${yearPrefix}${paddedSeq}`;
  } catch (error) {
    console.error("Generate Ticket Number Error:", error);
    return `${yearPrefix}0001`;
  }
}

function formatCustomerName(name: string): string {
  const upperName = name.toUpperCase().trim();
  const isInternal = upperName.includes("STOCK BCT") || upperName.includes("GHITP");
  if (isInternal) {
    return upperName;
  }
  if (upperName.startsWith("TN/NY.")) {
    return upperName;
  }
  return `TN/NY. ${upperName}`;
}

export async function createTicketAction(
  prevState: ActionResponse | null,
  formData: FormData
): Promise<ActionResponse> {
  // Parse accessories
  const accessories = formData.getAll("accessories").map(String);

  // Raw data mapping
  const rawData = {
    ticketNumber: String(formData.get("ticketNumber")).trim(),
    entryDate: formData.get("entryDate") ? new Date(String(formData.get("entryDate"))) : new Date(),
    serviceType: String(formData.get("serviceType")) as "SERVICE" | "GARANSI",
    customerName: String(formData.get("customerName")).trim(),
    customerPhone: String(formData.get("customerPhone")).trim(),
    deviceType: String(formData.get("deviceType")) as DeviceType,
    deviceName: String(formData.get("deviceName")).trim(),
    serialNumber: String(formData.get("serialNumber")).trim(),
    complaint: String(formData.get("complaint")).trim(),
    accessories,
    estimatedCompletionDate: formData.get("estimatedCompletionDate")
      ? new Date(String(formData.get("estimatedCompletionDate")))
      : null,
    technicianId: String(formData.get("technicianId")),
    notes: String(formData.get("notes") || "").trim() || null,
    estimatedCost: Number(formData.get("estimatedCost") || 0),
    dpAmount: Number(formData.get("dpAmount") || 0),
  };

  // Validate with Zod
  const validation = ticketSchema.safeParse(rawData);
  if (!validation.success) {
    const errorMsg = validation.error.issues.map((e) => e.message).join(", ");
    return { success: false, error: errorMsg };
  }

  const data = validation.data;

  try {
    // 1. Get current user from token session
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    const currentUser = token ? await verifyJWT(token) : null;

    // 2. Resolve Customer (find or create)
    let customer = await db.customer.findFirst({
      where: { phone: data.customerPhone },
    });

    const formattedName = formatCustomerName(data.customerName);

    if (customer) {
      // Update name if changed (optional, but good for keeping it up to date)
      if (customer.name !== formattedName) {
        customer = await db.customer.update({
          where: { id: customer.id },
          data: { name: formattedName },
        });
      }
    } else {
      customer = await db.customer.create({
        data: {
          name: formattedName,
          phone: data.customerPhone,
        },
      });
    }

    // 3. Check if ticketNumber is unique
    const existingTicket = await db.serviceTicket.findUnique({
      where: { ticketNumber: data.ticketNumber },
    });

    if (existingTicket) {
      return { success: false, error: `Nomor tiket "${data.ticketNumber}" sudah terdaftar.` };
    }

    // 4. Calculate remaining cost
    const remaining = data.estimatedCost - data.dpAmount;

    // 5. Set default status based on service type
    const defaultStatus = data.serviceType === "SERVICE" ? "PROSES_SERVICE" : "PROSES_GARANSI";

    // 6. Create ServiceTicket
    const ticket = await db.serviceTicket.create({
      data: {
        ticketNumber: data.ticketNumber,
        entryDate: data.entryDate,
        serviceType: data.serviceType,
        customerId: customer.id,
        deviceType: data.deviceType,
        deviceName: data.deviceName.toUpperCase(),
        serialNumber: data.serialNumber.toUpperCase(),
        complaint: data.complaint,
        accessories: data.accessories,
        estimatedCompletionDate: data.estimatedCompletionDate,
        technicianId: data.technicianId,
        status: defaultStatus,
        notes: data.notes,
        estimatedCost: new Prisma.Decimal(data.estimatedCost),
        dpAmount: new Prisma.Decimal(data.dpAmount),
        remainingCost: new Prisma.Decimal(remaining),
      },
    });

    // 7. Write Audit Log
    await db.auditLog.create({
      data: {
        ticketId: ticket.id,
        userId: currentUser?.id || null,
        action: "CREATE",
        description: `Tiket dibuat oleh ${currentUser?.username || "System"}`,
        newData: JSON.parse(JSON.stringify(ticket)),
      },
    });

    revalidatePath("/");
    revalidatePath("/customers");

    return { success: true, data: { ticketNumber: ticket.ticketNumber } };
  } catch (error) {
    console.error("Create Ticket Error:", error);
    return { success: false, error: "Gagal menyimpan tiket baru ke database." };
  }
}

export async function updateTicketStatusAction(
  ticketId: string,
  prevState: ActionResponse | null,
  formData: FormData
): Promise<ActionResponse> {
  const status = String(formData.get("status")) as ServiceStatus;
  const notes = String(formData.get("notes") || "").trim() || null;

  const vendorId = formData.get("vendorId") ? String(formData.get("vendorId")) : null;
  const vendorSentDate = formData.get("vendorSentDate") ? new Date(String(formData.get("vendorSentDate"))) : null;
  const vendorReceivedDate = formData.get("vendorReceivedDate") ? new Date(String(formData.get("vendorReceivedDate"))) : null;
  const vendorResult = formData.get("vendorResult") ? (String(formData.get("vendorResult")) as VendorResult) : null;
  const newSerialNumber = formData.get("newSerialNumber") ? String(formData.get("newSerialNumber")).trim() : null;

  const finalCostInput = formData.get("finalCost");
  const finalCost = finalCostInput ? Number(finalCostInput) : null;
  const pickupDate = formData.get("pickupDate") ? new Date(String(formData.get("pickupDate"))) : null;

  // Validate inputs
  const validation = updateStatusSchema.safeParse({
    status,
    notes,
    vendorId,
    vendorSentDate,
    vendorReceivedDate,
    vendorResult,
    newSerialNumber,
    finalCost,
    pickupDate,
  });

  if (!validation.success) {
    const errorMsg = validation.error.issues.map((e) => e.message).join(", ");
    return { success: false, error: errorMsg };
  }

  const validatedData = validation.data;

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    const currentUser = token ? await verifyJWT(token) : null;

    // Get old ticket for comparison
    const oldTicket = await db.serviceTicket.findUnique({
      where: { id: ticketId },
    });

    if (!oldTicket) {
      return { success: false, error: "Tiket tidak ditemukan." };
    }

    // Build update payload
    const updateData: Prisma.ServiceTicketUpdateInput = {
      status: validatedData.status,
      notes: validatedData.notes,
    };

    // If ALIH_SERVICE or PROSES_GARANSI, save vendor details
    if (validatedData.status === "ALIH_SERVICE" || validatedData.status === "PROSES_GARANSI") {
      if (validatedData.vendorId) {
        updateData.vendor = { connect: { id: validatedData.vendorId } };
      }
      updateData.vendorSentDate = validatedData.vendorSentDate;
      updateData.vendorReceivedDate = validatedData.vendorReceivedDate;
      updateData.vendorResult = validatedData.vendorResult;
      updateData.newSerialNumber = validatedData.newSerialNumber;
    } else {
      // Clear vendor details
      updateData.vendor = { disconnect: true };
      updateData.vendorSentDate = null;
      updateData.vendorReceivedDate = null;
      updateData.vendorResult = null;
      updateData.newSerialNumber = null;
    }

    // If SELESAI_DAN_DIAMBIL or GAGAL_SERVICE_GARANSI, save pickup and cost details
    if (validatedData.status === "SELESAI_DAN_DIAMBIL" || validatedData.status === "GAGAL_SERVICE_GARANSI") {
      const finalCostVal = validatedData.finalCost !== null && validatedData.finalCost !== undefined
        ? validatedData.finalCost
        : 0;
      updateData.finalCost = new Prisma.Decimal(finalCostVal);
      updateData.pickupDate = validatedData.pickupDate;
      
      const remaining = finalCostVal - Number(oldTicket.dpAmount);
      updateData.remainingCost = new Prisma.Decimal(Math.max(0, remaining));
    } else {
      updateData.pickupDate = null;
      updateData.finalCost = null;
    }

    const updatedTicket = await db.serviceTicket.update({
      where: { id: ticketId },
      data: updateData,
      include: {
        customer: true,
        technician: {
          select: {
            id: true,
            username: true,
            fullName: true,
          },
        },
        vendor: true,
      },
    });

    // Write Audit Log
    const changeDesc = `Status berubah dari ${oldTicket.status} ke ${updatedTicket.status} oleh ${currentUser?.username || "System"}`;
    await db.auditLog.create({
      data: {
        ticketId,
        userId: currentUser?.id || null,
        action: "STATUS_CHANGE",
        description: changeDesc,
        previousData: JSON.parse(JSON.stringify(oldTicket)),
        newData: JSON.parse(JSON.stringify(updatedTicket)),
      },
    });

    revalidatePath("/tickets");
    revalidatePath("/");
    return { success: true, data: JSON.parse(JSON.stringify(updatedTicket)) };
  } catch (error) {
    console.error("Update Status Error:", error);
    return { success: false, error: "Gagal menyimpan perubahan status tiket." };
  }
}

export interface UpdateTicketDetailsInput {
  customerName: string;
  customerPhone: string;
  deviceType?: DeviceType;
  deviceName: string;
  serialNumber: string;
  complaint: string;
  accessories?: string[];
  notes?: string | null;
  estimatedCompletionDate?: Date | string | null;
  estimatedCost?: number;
  dpAmount?: number;
  technicianId?: string;
}

export async function updateTicketDetailsAction(
  ticketId: string,
  input: UpdateTicketDetailsInput
): Promise<ActionResponse> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    const currentUser = token ? await verifyJWT(token) : null;

    const oldTicket = await db.serviceTicket.findUnique({
      where: { id: ticketId },
      include: { customer: true },
    });

    if (!oldTicket) {
      return { success: false, error: "Tiket tidak ditemukan." };
    }

    const formattedName = formatCustomerName(input.customerName);

    // Update customer name & phone
    await db.customer.update({
      where: { id: oldTicket.customerId },
      data: {
        name: formattedName,
        phone: input.customerPhone,
      },
    });

    const estCost = input.estimatedCost !== undefined ? input.estimatedCost : Number(oldTicket.estimatedCost);
    const dp = input.dpAmount !== undefined ? input.dpAmount : Number(oldTicket.dpAmount);
    const remaining = Math.max(0, estCost - dp);

    const updateData: Prisma.ServiceTicketUpdateInput = {
      deviceName: input.deviceName.toUpperCase(),
      serialNumber: input.serialNumber.toUpperCase(),
      complaint: input.complaint,
      accessories: input.accessories || oldTicket.accessories,
      notes: input.notes !== undefined ? input.notes : oldTicket.notes,
      estimatedCompletionDate: input.estimatedCompletionDate
        ? new Date(input.estimatedCompletionDate)
        : oldTicket.estimatedCompletionDate,
      estimatedCost: new Prisma.Decimal(estCost),
      dpAmount: new Prisma.Decimal(dp),
      remainingCost: new Prisma.Decimal(remaining),
    };

    if (input.deviceType) {
      updateData.deviceType = input.deviceType;
    }

    if (input.technicianId) {
      updateData.technician = { connect: { id: input.technicianId } };
    }

    const updatedTicket = await db.serviceTicket.update({
      where: { id: ticketId },
      data: updateData,
      include: { customer: true, technician: true },
    });

    // Write Audit Log
    const desc = `Data tiket diperbarui oleh ${currentUser?.username || "System"} (Customer: ${oldTicket.customer.name} -> ${formattedName})`;
    await db.auditLog.create({
      data: {
        ticketId,
        userId: currentUser?.id || null,
        action: "UPDATE_DETAILS",
        description: desc,
        previousData: JSON.parse(JSON.stringify(oldTicket)),
        newData: JSON.parse(JSON.stringify(updatedTicket)),
      },
    });

    revalidatePath("/tickets");
    revalidatePath("/customers");
    revalidatePath("/");

    return { success: true, data: JSON.parse(JSON.stringify(updatedTicket)) };
  } catch (error) {
    console.error("Update Ticket Details Error:", error);
    return { success: false, error: "Gagal memperbarui detail tiket." };
  }
}

