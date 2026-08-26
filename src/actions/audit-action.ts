"use server";

import { db } from "@/lib/db";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface ActionResponse<T = any> {
  success: boolean;
  error?: string;
  data?: T;
}

export interface AuditLogItem {
  id: string;
  ticketId: string;
  userId: string | null;
  action: string;
  description: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  previousData: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  newData: any;
  createdAt: Date;
  user: {
    id: string;
    username: string;
    fullName: string;
  } | null;
}

export async function getTicketAuditLogsAction(
  ticketId: string
): Promise<ActionResponse<AuditLogItem[]>> {
  try {
    const logs = await db.auditLog.findMany({
      where: {
        ticketId,
      },
      select: {
        id: true,
        ticketId: true,
        userId: true,
        action: true,
        description: true,
        previousData: true,
        newData: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            username: true,
            fullName: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return {
      success: true,
      data: logs as AuditLogItem[],
    };
  } catch (error) {
    console.error("Fetch Ticket Audit Logs Error:", error);
    return {
      success: false,
      error: "Gagal mengambil riwayat audit log tiket.",
    };
  }
}
