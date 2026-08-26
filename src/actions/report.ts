"use server";

import { db } from "@/lib/db";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface ActionResponse<T = any> {
  success: boolean;
  error?: string;
  data?: T;
}

export interface ReportTicketItem {
  id: string;
  deviceName: string;
  serialNumber: string;
  complaint: string;
  notes: string | null;
  vendorSentDate: Date | null;
  customer: {
    name: string;
    isInternalStock: boolean;
  };
  vendor: {
    name: string;
    aliasCode: string | null;
    location: string;
  } | null;
}

export interface OperationalReportData {
  block1: ReportTicketItem[];
  block2: ReportTicketItem[];
  block3: ReportTicketItem[];
  block4: ReportTicketItem[];
}

export async function getOperationalReportDataAction(
  dateStr: string
): Promise<ActionResponse<OperationalReportData>> {
  try {
    // Parse start and end of day in local timezone (GMT+7)
    const start = new Date(`${dateStr}T00:00:00+07:00`);
    const end = new Date(`${dateStr}T23:59:59.999+07:00`);

    // Status filter for active vendor: SERVICE with ALIH_SERVICE or GARANSI with PROSES_GARANSI
    const vendorActiveStatusFilter = {
      OR: [
        { serviceType: "SERVICE" as const, status: "ALIH_SERVICE" as const },
        { serviceType: "GARANSI" as const, status: "PROSES_GARANSI" as const },
      ],
    };

    // 1. BARANG KE BANDUNG [TGL HARI INI] (Termasuk Customer & Internal Stock)
    const block1 = await db.serviceTicket.findMany({
      where: {
        ...vendorActiveStatusFilter,
        vendorSentDate: {
          gte: start,
          lte: end,
        },
        vendor: {
          location: "BDG",
        },
      },
      select: {
        id: true,
        deviceName: true,
        serialNumber: true,
        complaint: true,
        notes: true,
        vendorSentDate: true,
        customer: {
          select: {
            name: true,
            isInternalStock: true,
          },
        },
        vendor: {
          select: {
            name: true,
            aliasCode: true,
            location: true,
          },
        },
      },
      orderBy: {
        vendor: {
          name: "asc",
        },
      },
    });

    // 2. BARANG DI VENDOR BDG (Termasuk Customer & Internal Stock)
    const block2 = await db.serviceTicket.findMany({
      where: {
        ...vendorActiveStatusFilter,
        vendor: {
          location: "BDG",
        },
      },
      select: {
        id: true,
        deviceName: true,
        serialNumber: true,
        complaint: true,
        notes: true,
        vendorSentDate: true,
        customer: {
          select: {
            name: true,
            isInternalStock: true,
          },
        },
        vendor: {
          select: {
            name: true,
            aliasCode: true,
            location: true,
          },
        },
      },
      orderBy: {
        vendor: {
          name: "asc",
        },
      },
    });

    // 3. BARANG DI VENDOR JKT (Termasuk Customer & Internal Stock)
    const block3 = await db.serviceTicket.findMany({
      where: {
        ...vendorActiveStatusFilter,
        vendor: {
          location: "JKT",
        },
      },
      select: {
        id: true,
        deviceName: true,
        serialNumber: true,
        complaint: true,
        notes: true,
        vendorSentDate: true,
        customer: {
          select: {
            name: true,
            isInternalStock: true,
          },
        },
        vendor: {
          select: {
            name: true,
            aliasCode: true,
            location: true,
          },
        },
      },
      orderBy: {
        vendor: {
          name: "asc",
        },
      },
    });

    // 4. GARANSIAN BELUM DIPROSES (Semua unit dalam antrian awal/belum dikirim ke vendor)
    const block4 = await db.serviceTicket.findMany({
      where: {
        status: {
          in: ["PROSES_SERVICE", "PENDING_SERVICE"],
        },
      },
      select: {
        id: true,
        deviceName: true,
        serialNumber: true,
        complaint: true,
        notes: true,
        vendorSentDate: true,
        customer: {
          select: {
            name: true,
            isInternalStock: true,
          },
        },
        vendor: {
          select: {
            name: true,
            aliasCode: true,
            location: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return {
      success: true,
      data: {
        block1,
        block2,
        block3,
        block4,
      },
    };
  } catch (error) {
    console.error("Fetch Operational Report Error:", error);
    return { success: false, error: "Gagal mengambil data laporan operasional." };
  }
}
