"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { verifyJWT } from "@/lib/auth";

export interface ActionResponse<T = any> {
  success: boolean;
  error?: string;
  data?: T;
}

export async function generateNextSuratJalanNumber(): Promise<string> {
  const currentYear = new Date().getFullYear();
  const yearSuffix = String(currentYear).slice(-2); // e.g. "26"
  const prefix = `SJ-BCTRS-${yearSuffix}`;

  try {
    const lastNote = await db.deliveryNote.findFirst({
      where: {
        suratJalanNumber: {
          startsWith: prefix,
        },
      },
      orderBy: {
        suratJalanNumber: "desc",
      },
      select: {
        suratJalanNumber: true,
      },
    });

    let nextSeq = 1;
    if (lastNote) {
      // E.g. "SJ-BCTRS-260015"
      const numPart = lastNote.suratJalanNumber.replace("SJ-BCTRS-", ""); // e.g. "260015"
      const seqStr = numPart.slice(2); // e.g. "0015"
      const currentSeq = parseInt(seqStr, 10);
      if (!isNaN(currentSeq)) {
        nextSeq = currentSeq + 1;
      }
    }

    const paddedSeq = String(nextSeq).padStart(4, "0");
    return `${prefix}${paddedSeq}`;
  } catch (error) {
    console.error("Generate Surat Jalan Number Error:", error);
    return `${prefix}0001`;
  }
}

export async function createDeliveryNoteAction(
  prevState: ActionResponse | null,
  payload: {
    suratJalanNumber: string;
    vendorId: string;
    shippingDate: string;
    courierName?: string;
    trackingNumber?: string;
    notes?: string;
    selectedTicketIds: string[];
  }
): Promise<ActionResponse> {
  const {
    suratJalanNumber,
    vendorId,
    shippingDate,
    courierName,
    trackingNumber,
    notes,
    selectedTicketIds,
  } = payload;

  if (!suratJalanNumber || !vendorId || !selectedTicketIds || selectedTicketIds.length === 0) {
    return { success: false, error: "Nomor surat jalan, vendor, dan minimal 1 unit wajib diisi/dipilih." };
  }

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    const currentUser = token ? await verifyJWT(token) : null;

    // Check if duplicate surat jalan number
    const existing = await db.deliveryNote.findUnique({
      where: { suratJalanNumber },
    });

    if (existing) {
      return { success: false, error: `Nomor Surat Jalan "${suratJalanNumber}" sudah digunakan.` };
    }

    // Atomic transaction
    const deliveryNote = await db.$transaction(async (tx) => {
      // 1. Create delivery note
      const note = await tx.deliveryNote.create({
        data: {
          suratJalanNumber,
          vendorId,
          shippingDate: new Date(shippingDate),
          courierName: courierName || null,
          trackingNumber: trackingNumber || null,
          notes: notes || null,
        },
      });

      // 2. Update service tickets
      await tx.serviceTicket.updateMany({
        where: { id: { in: selectedTicketIds } },
        data: {
          deliveryNoteId: note.id,
          vendorSentDate: new Date(shippingDate),
          vendorId: vendorId, // bind vendorId in ticket to matching vendor
        },
      });

      // Fetch the updated tickets for audit logs
      const updatedTickets = await tx.serviceTicket.findMany({
        where: { id: { in: selectedTicketIds } },
      });

      // 3. Create Audit Logs for each ticket
      for (const ticket of updatedTickets) {
        await tx.auditLog.create({
          data: {
            ticketId: ticket.id,
            userId: currentUser?.id || null,
            action: "GENERATE_SJ",
            description: `Unit dimasukkan ke Surat Jalan ${suratJalanNumber} oleh ${currentUser?.username || "System"}`,
            newData: JSON.parse(JSON.stringify(ticket)),
          },
        });
      }

      const populatedNote = await tx.deliveryNote.findUnique({
        where: { id: note.id },
        include: {
          vendor: true,
          tickets: {
            include: {
              customer: true,
            },
          },
        },
      });

      return populatedNote;
    });

    revalidatePath("/shipments");
    revalidatePath("/tickets");
    revalidatePath("/");

    return { success: true, data: JSON.parse(JSON.stringify(deliveryNote)) };
  } catch (error) {
    console.error("Create Delivery Note Error:", error);
    return { success: false, error: "Gagal membuat Surat Jalan baru." };
  }
}
