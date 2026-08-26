"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface ActionResponse<T = any> {
  success: boolean;
  error?: string;
  data?: T;
}

export async function getVendorsAction() {
  try {
    return await db.vendor.findMany({
      orderBy: { name: "asc" },
    });
  } catch (error) {
    console.error("Get Vendors Error:", error);
    return [];
  }
}

export async function createVendorAction(
  prevState: ActionResponse | null,
  formData: FormData
): Promise<ActionResponse> {
  const name = String(formData.get("name")).trim();
  const aliasCode = String(formData.get("aliasCode") || "").trim() || null;
  const location = String(formData.get("location")) as "BDG" | "JKT" | "OTHER";
  const address = String(formData.get("address") || "").trim() || null;
  const contactPerson = String(formData.get("contactPerson") || "").trim() || null;
  const phone = String(formData.get("phone") || "").trim() || null;

  if (!name || !location) {
    return { success: false, error: "Nama vendor dan lokasi wajib diisi." };
  }

  try {
    const newVendor = await db.vendor.create({
      data: {
        name,
        aliasCode,
        location,
        address,
        contactPerson,
        phone,
      },
    });

    revalidatePath("/vendors");
    return { success: true, data: newVendor };
  } catch (error) {
    console.error("Create Vendor Error:", error);
    return { success: false, error: "Gagal menyimpan vendor baru." };
  }
}

export async function updateVendorAction(
  id: string,
  prevState: ActionResponse | null,
  formData: FormData
): Promise<ActionResponse> {
  const name = String(formData.get("name")).trim();
  const aliasCode = String(formData.get("aliasCode") || "").trim() || null;
  const location = String(formData.get("location")) as "BDG" | "JKT" | "OTHER";
  const address = String(formData.get("address") || "").trim() || null;
  const contactPerson = String(formData.get("contactPerson") || "").trim() || null;
  const phone = String(formData.get("phone") || "").trim() || null;

  if (!name || !location) {
    return { success: false, error: "Nama vendor dan lokasi wajib diisi." };
  }

  try {
    const updatedVendor = await db.vendor.update({
      where: { id },
      data: {
        name,
        aliasCode,
        location,
        address,
        contactPerson,
        phone,
      },
    });

    revalidatePath("/vendors");
    return { success: true, data: updatedVendor };
  } catch (error) {
    console.error("Update Vendor Error:", error);
    return { success: false, error: "Gagal mengubah data vendor." };
  }
}

export async function deleteVendorAction(id: string): Promise<ActionResponse> {
  try {
    // Cek apakah vendor terikat dengan tiket servis
    const ticketCount = await db.serviceTicket.count({
      where: { vendorId: id },
    });

    if (ticketCount > 0) {
      return {
        success: false,
        error: "Vendor tidak bisa dihapus karena terikat dengan riwayat tiket servis.",
      };
    }

    await db.vendor.delete({
      where: { id },
    });

    revalidatePath("/vendors");
    return { success: true };
  } catch (error) {
    console.error("Delete Vendor Error:", error);
    return { success: false, error: "Gagal menghapus vendor." };
  }
}
