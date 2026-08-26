import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";

interface CreateAuditLogOptions {
  ticketId: string;
  userId?: string | null;
  action: string;
  description: string;
  previousData?: Record<string, unknown> | null;
  newData?: Record<string, unknown> | null;
}

export async function createAuditLogRecord(options: CreateAuditLogOptions) {
  try {
    await db.auditLog.create({
      data: {
        ticketId: options.ticketId,
        userId: options.userId || null,
        action: options.action,
        description: options.description,
        previousData: options.previousData ? (options.previousData as Prisma.InputJsonValue) : Prisma.JsonNull,
        newData: options.newData ? (options.newData as Prisma.InputJsonValue) : Prisma.JsonNull,
      },
    });
  } catch (error) {
    console.error("Failed to create AuditLog record:", error);
  }
}
