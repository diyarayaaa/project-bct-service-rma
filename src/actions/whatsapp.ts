"use server";

export interface ActionResponse {
  success: boolean;
  error?: string;
}

export async function sendWhatsAppNotificationAction(
  phone: string,
  message: string
): Promise<ActionResponse> {
  const apiUrl = process.env.WA_GATEWAY_API_URL;
  const apiKey = process.env.WA_GATEWAY_API_KEY;

  if (!apiUrl || !apiKey || apiUrl.includes("your-wa-gateway.com") || apiKey.includes("your-wa-api-key")) {
    return {
      success: false,
      error: "WhatsApp Gateway tidak terkonfigurasi. Silakan kirim pesan secara manual via wa.me atau salin teks.",
    };
  }

  try {
    const response = await fetch(`${apiUrl}/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        phone: phone,
        message: message,
      }),
    });

    if (response.ok) {
      return { success: true };
    } else {
      const errText = await response.text();
      return { success: false, error: errText || "Gagal mengirim pesan melalui Gateway WA." };
    }
  } catch (error) {
    console.error("WhatsApp Gateway connection error:", error);
    return { success: false, error: "Gagal menghubungkan ke server Gateway WA." };
  }
}
