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
}

export async function getOperationalReportDataAction(
  dateStr: string
): Promise<ActionResponse<OperationalReportData>> {
  try {
    // Parse start and end of day in local timezone (GMT+7)
    const start = new Date(`${dateStr}T00:00:00+07:00`);
    const end = new Date(`${dateStr}T23:59:59.999+07:00`);

    // 1. BARANG KE BANDUNG [TGL HARI INI]
    // Filter: serviceType = GARANSI, vendorSentDate = Hari Ini, vendor.location = BDG
    const block1 = await db.serviceTicket.findMany({
      where: {
        serviceType: "GARANSI",
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

    // Internal stock criteria: customer name must contain STOCK BCT, STOK BCT, or GHITP
    const internalStockFilter = {
      OR: [
        { customer: { name: { contains: "STOCK BCT", mode: "insensitive" as const } } },
        { customer: { name: { contains: "STOK BCT", mode: "insensitive" as const } } },
        { customer: { name: { contains: "GHITP", mode: "insensitive" as const } } },
      ],
    };

    // 2. BARANG DI VENDOR BDG
    // Filter: customer = internal stock, status = PROSES_GARANSI, vendor.location = BDG
    const block2 = await db.serviceTicket.findMany({
      where: {
        ...internalStockFilter,
        status: "PROSES_GARANSI",
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

    // 3. BARANG DI VENDOR JKT
    // Filter: customer = internal stock, status = PROSES_GARANSI, vendor.location = JKT
    const block3 = await db.serviceTicket.findMany({
      where: {
        ...internalStockFilter,
        status: "PROSES_GARANSI",
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

    return {
      success: true,
      data: {
        block1,
        block2,
        block3,
      },
    };
  } catch (error) {
    console.error("Fetch Operational Report Error:", error);
    return { success: false, error: "Gagal mengambil data laporan operasional." };
  }
}
