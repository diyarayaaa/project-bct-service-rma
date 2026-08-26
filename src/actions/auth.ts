"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { verifyPassword, signJWT } from "@/lib/auth";

export interface ActionResponse {
  success: boolean;
  error?: string;
}

export async function loginAction(
  prevState: ActionResponse | null,
  formData: FormData
): Promise<ActionResponse> {
  const usernameInput = formData.get("username");
  const passwordInput = formData.get("password");

  if (!usernameInput || !passwordInput) {
    return { success: false, error: "Username dan password wajib diisi." };
  }

  const username = String(usernameInput).trim().toLowerCase();
  const password = String(passwordInput);

  try {
    // 1. Cari user di database
    const user = await db.user.findUnique({
      where: { username },
    });

    if (!user || !user.isActive) {
      return { success: false, error: "Username atau password salah." };
    }

    // 2. Verifikasi password
    const isPasswordValid = verifyPassword(password, user.password);
    if (!isPasswordValid) {
      return { success: false, error: "Username atau password salah." };
    }

    // 3. Buat JWT Session
    const token = await signJWT({
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      role: user.role,
    });

    // 4. Set Cookie
    const cookieStore = await cookies();
    cookieStore.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 Hari
      path: "/",
    });
  } catch (error) {
    console.error("Login Action Error:", error);
    return { success: false, error: "Terjadi kesalahan pada server." };
  }

  // 5. Redirect ke dashboard
  redirect("/");
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.set("auth_token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0, // Hapus seketika
    path: "/",
  });

  redirect("/login");
}
