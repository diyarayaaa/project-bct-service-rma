"use server";

import { db } from "@/lib/db";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface ActionResponse<T = any> {
  success: boolean;
  error?: string;
  data?: T;
}

export interface SalesReportTicketItem {
  id: string;
  deviceName: string;
  serialNumber: string;
  newSerialNumber: string | null;
  vendorResult: string | null;
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

export interface SalesReportData {
  section1: SalesReportTicketItem[];
  section2: SalesReportTicketItem[];
  section3: SalesReportTicketItem[];
  section4: SalesReportTicketItem[];
}

export async function getSalesReportDataAction(
  dateStr: string
): Promise<ActionResponse<SalesReportData>> {
  try {
    // Parse start and end of day in local timezone (GMT+7)
    const start = new Date(`${dateStr}T00:00:00+07:00`);
    const end = new Date(`${dateStr}T23:59:59.999+07:00`);

    // Strict filter for Sales: ONLY internal stock (STOCK BCT / GHITP) and NOT regular customer (TN/NY.)
    const salesCustomerFilter = {
      customer: {
        AND: [
          {
            OR: [
              { isInternalStock: true },
              { name: { contains: "STOCK BCT", mode: "insensitive" as const } },
              { name: { contains: "GHITP", mode: "insensitive" as const } },
              { name: { contains: "STOK", mode: "insensitive" as const } },
            ],
          },
          {
            name: {
              not: {
                contains: "TN/NY",
              },
            },
          },
        ],
      },
    };

    // Status filter for vendor active: ALIH_SERVICE for SERVICE or PROSES_GARANSI for GARANSI
    const vendorActiveStatusFilter = {
      OR: [
        { serviceType: "SERVICE" as const, status: "ALIH_SERVICE" as const },
        { serviceType: "GARANSI" as const, status: "PROSES_GARANSI" as const },
      ],
    };

    // 1. GARANSIAN SELESAI [TGL HARI INI] (STOK BCT/GHITP)
    const section1 = await db.serviceTicket.findMany({
      where: {
        ...salesCustomerFilter,
        status: {
          in: ["SELESAI_BELUM_DIAMBIL", "SELESAI_DAN_DIAMBIL"],
        },
        OR: [
          { pickupDate: { gte: start, lte: end } },
          { vendorReceivedDate: { gte: start, lte: end } },
          { updatedAt: { gte: start, lte: end } },
        ],
      },
      select: {
        id: true,
        deviceName: true,
        serialNumber: true,
        newSerialNumber: true,
        vendorResult: true,
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

    // 2. GARANSIAN DI VENDOR BDG (STOK BCT/GHITP)
    const section2 = await db.serviceTicket.findMany({
      where: {
        ...salesCustomerFilter,
        ...vendorActiveStatusFilter,
        vendor: {
          location: "BDG",
        },
      },
      select: {
        id: true,
        deviceName: true,
        serialNumber: true,
        newSerialNumber: true,
        vendorResult: true,
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

    // 3. GARANSIAN DI VENDOR JKT (STOK BCT/GHITP)
    const section3 = await db.serviceTicket.findMany({
      where: {
        ...salesCustomerFilter,
        ...vendorActiveStatusFilter,
        vendor: {
          location: "JKT",
        },
      },
      select: {
        id: true,
        deviceName: true,
        serialNumber: true,
        newSerialNumber: true,
        vendorResult: true,
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

    // 4. GARANSIAN BELUM DIPROSES (STOK BCT/GHITP)
    const section4 = await db.serviceTicket.findMany({
      where: {
        ...salesCustomerFilter,
        status: {
          in: ["PROSES_SERVICE", "PENDING_SERVICE"],
        },
      },
      select: {
        id: true,
        deviceName: true,
        serialNumber: true,
        newSerialNumber: true,
        vendorResult: true,
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
        section1,
        section2,
        section3,
        section4,
      },
    };
  } catch (error) {
    console.error("Fetch Sales Report Error:", error);
    return { success: false, error: "Gagal mengambil data laporan sales." };
  }
}
