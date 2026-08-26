"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export interface ActionResponse {
  success: boolean;
  error?: string;
}

export async function toggleInternalCustomerAction(
  id: string,
  isInternalStock: boolean
): Promise<ActionResponse> {
  try {
    await db.customer.update({
      where: { id },
      data: { isInternalStock },
    });

    revalidatePath("/customers");
    return { success: true };
  } catch (error) {
    console.error("Toggle Internal Customer Error:", error);
    return { success: false, error: "Gagal mengubah status internal stock." };
  }
}

export async function deleteCustomerAction(id: string): Promise<ActionResponse> {
  try {
    // Cek apakah customer terikat dengan tiket servis
    const ticketCount = await db.serviceTicket.count({
      where: { customerId: id },
    });

    if (ticketCount > 0) {
      return {
        success: false,
        error: "Customer tidak bisa dihapus karena memiliki riwayat tiket servis.",
      };
    }

    await db.customer.delete({
      where: { id },
    });

    revalidatePath("/customers");
    return { success: true };
  } catch (error) {
    console.error("Delete Customer Error:", error);
    return { success: false, error: "Gagal menghapus customer." };
  }
}
