"use server";

import { db } from "@/lib/db";
import { ServiceStatus } from "@prisma/client";

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

    const selectFields = {
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
    } as const;

    const vendorActiveStatusFilter = {
      status: {
        in: ["ALIH_SERVICE" as ServiceStatus, "PROSES_GARANSI" as ServiceStatus],
      },
    };

    // 1. BARANG KE BANDUNG [TGL HARI INI] (Barang yang dikirim ke vendor Bandung pada hari laporan dibuat)
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
      select: selectFields,
      orderBy: {
        vendor: {
          name: "asc",
        },
      },
    });

    const block1Ids = block1.map((b) => b.id);

    // 2. BARANG DI VENDOR BDG (Barang di vendor Bandung selain yang baru dikirim hari ini)
    const block2 = await db.serviceTicket.findMany({
      where: {
        ...vendorActiveStatusFilter,
        id: {
          notIn: block1Ids,
        },
        vendor: {
          location: "BDG",
        },
      },
      select: selectFields,
      orderBy: {
        vendor: {
          name: "asc",
        },
      },
    });

    const block2Ids = block2.map((b) => b.id);

    // 3. BARANG DI VENDOR JKT (Barang di vendor Jakarta/Lainnya)
    const block3 = await db.serviceTicket.findMany({
      where: {
        ...vendorActiveStatusFilter,
        id: {
          notIn: [...block1Ids, ...block2Ids],
        },
        vendor: {
          location: {
            in: ["JKT", "OTHER"],
          },
        },
      },
      select: selectFields,
      orderBy: {
        vendor: {
          name: "asc",
        },
      },
    });

    const block3Ids = block3.map((b) => b.id);

    // 4. GARANSIAN BELUM DIPROSES (Unit antrian awal atau belum dikirim ke vendor)
    const existingIds = [...block1Ids, ...block2Ids, ...block3Ids];

    const block4 = await db.serviceTicket.findMany({
      where: {
        status: {
          in: ["PROSES_SERVICE" as ServiceStatus, "PENDING_SERVICE" as ServiceStatus, "PROSES_GARANSI" as ServiceStatus, "ALIH_SERVICE" as ServiceStatus],
        },
        id: {
          notIn: existingIds,
        },
      },
      select: selectFields,
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
