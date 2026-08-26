"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { DeviceType } from "@prisma/client";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface ActionResponse<T = any> {
  success: boolean;
  error?: string;
  data?: T;
}

export async function createPresetAction(
  prevState: ActionResponse | null,
  formData: FormData
): Promise<ActionResponse> {
  const category = String(formData.get("category")).trim();
  const label = String(formData.get("label")).trim();
  const deviceTypeInput = formData.get("deviceType");
  const deviceType = deviceTypeInput ? (String(deviceTypeInput) as DeviceType) : null;

  if (!category || !label) {
    return { success: false, error: "Kategori dan label preset wajib diisi." };
  }

  try {
    // Cek apakah preset dengan kategori dan label tersebut sudah ada
    const existing = await db.presetOption.findFirst({
      where: { category, label },
    });

    if (existing) {
      return { success: false, error: "Preset dengan opsi ini sudah terdaftar." };
    }

    const newPreset = await db.presetOption.create({
      data: {
        category,
        label,
        deviceType: deviceType || null,
      },
    });

    revalidatePath("/presets");
    return { success: true, data: newPreset };
  } catch (error) {
    console.error("Create Preset Error:", error);
    return { success: false, error: "Gagal menyimpan preset baru." };
  }
}

export async function deletePresetAction(id: string): Promise<ActionResponse> {
  try {
    await db.presetOption.delete({
      where: { id },
    });

    revalidatePath("/presets");
    return { success: true };
  } catch (error) {
    console.error("Delete Preset Error:", error);
    return { success: false, error: "Gagal menghapus preset." };
  }
}
