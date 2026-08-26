"use server";

import { db } from "@/lib/db";
import { ticketSchema } from "@/lib/validations";
import { cookies } from "next/headers";
import { verifyJWT } from "@/lib/auth";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

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
    deviceType: String(formData.get("deviceType")) as any,
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
