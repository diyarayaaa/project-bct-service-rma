"use server";

import { db } from "@/lib/db";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface ActionResponse<T = any> {
  success: boolean;
  error?: string;
  data?: T;
}

export interface DashboardTicketItem {
  id: string;
  ticketNumber: string;
  entryDate: Date;
  serviceType: "SERVICE" | "GARANSI";
  status: string;
  deviceType: string;
  deviceName: string;
  serialNumber: string;
  complaint: string;
  accessories: string[];
  notes: string | null;
  technician: {
    id: string;
    username: string;
    fullName: string;
  } | null;
  createdAt: Date;
  updatedAt: Date;
  vendorSentDate: Date | null;
  vendorReceivedDate: Date | null;
  pickupDate: Date | null;
  estimatedCompletionDate: Date | null;
  estimatedCost: number | null;
  dpAmount: number | null;
  finalCost: number | null;
  vendorResult: string | null;
  newSerialNumber: string | null;
  vendorId: string | null;
  customer: {
    id: string;
    name: string;
    phone: string;
    isInternalStock: boolean;
  };
  vendor: {
    id: string;
    name: string;
    aliasCode: string | null;
    location: string;
  } | null;
}

export interface DashboardData {
  metrics: {
    totalActiveService: number;
    totalCompletedUnclaimed: number;
    totalVendorActive: number;
    totalTodayIntake: number;
  };
  activeServices: DashboardTicketItem[];
  completedUnclaimed: DashboardTicketItem[];
  technicians: string[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const serializeTicket = (t: any): DashboardTicketItem => ({
  ...t,
  estimatedCost: t.estimatedCost ? Number(t.estimatedCost) : null,
  dpAmount: t.dpAmount ? Number(t.dpAmount) : null,
  finalCost: t.finalCost ? Number(t.finalCost) : null,
});

export async function getDashboardDataAction(): Promise<ActionResponse<DashboardData>> {
  try {
    const now = new Date();
    const tzoffset = 7 * 60 * 60000;
    const localTime = new Date(now.getTime() + tzoffset);
    const todayStr = localTime.toISOString().split("T")[0];

    const startToday = new Date(`${todayStr}T00:00:00+07:00`);
    const endToday = new Date(`${todayStr}T23:59:59.999+07:00`);

    // 1. Summary Metrics
    const totalActiveService = await db.serviceTicket.count({
      where: {
        status: {
          in: ["PROSES_SERVICE", "PENDING_SERVICE"],
        },
      },
    });

    const totalCompletedUnclaimed = await db.serviceTicket.count({
      where: {
        status: "SELESAI_BELUM_DIAMBIL",
      },
    });

    const totalVendorActive = await db.serviceTicket.count({
      where: {
        status: {
          in: ["PROSES_GARANSI", "ALIH_SERVICE"],
        },
      },
    });

    const totalTodayIntake = await db.serviceTicket.count({
      where: {
        createdAt: {
          gte: startToday,
          lte: endToday,
        },
      },
    });

    // Select fields definition for dashboard ticket items
    const ticketSelect = {
      id: true,
      ticketNumber: true,
      entryDate: true,
      serviceType: true,
      status: true,
      deviceType: true,
      deviceName: true,
      serialNumber: true,
      complaint: true,
      accessories: true,
      notes: true,
      createdAt: true,
      updatedAt: true,
      vendorSentDate: true,
      vendorReceivedDate: true,
      pickupDate: true,
      estimatedCompletionDate: true,
      estimatedCost: true,
      dpAmount: true,
      finalCost: true,
      vendorResult: true,
      newSerialNumber: true,
      vendorId: true,
      technician: {
        select: {
          id: true,
          username: true,
          fullName: true,
        },
      },
      customer: {
        select: {
          id: true,
          name: true,
          phone: true,
          isInternalStock: true,
        },
      },
      vendor: {
        select: {
          id: true,
          name: true,
          aliasCode: true,
          location: true,
        },
      },
    };

    // 2. Active Services Queue (PROSES SERVICE & PENDING SERVICE)
    const rawActiveServices = await db.serviceTicket.findMany({
      where: {
        status: {
          in: ["PROSES_SERVICE", "PENDING_SERVICE"],
        },
      },
      select: ticketSelect,
      orderBy: {
        createdAt: "asc",
      },
    });

    // 3. Completed Unclaimed Queue (SELESAI BELUM DIAMBIL)
    const rawCompletedUnclaimed = await db.serviceTicket.findMany({
      where: {
        status: "SELESAI_BELUM_DIAMBIL",
      },
      select: ticketSelect,
      orderBy: {
        updatedAt: "asc",
      },
    });

    // Serialize Decimal objects to plain Javascript Numbers
    const activeServices = rawActiveServices.map(serializeTicket);
    const completedUnclaimed = rawCompletedUnclaimed.map(serializeTicket);

    // 4. Extract Technician List
    const defaultTechs = ["Wandi", "Satryo", "Derida", "Anzar"];
    const dbTechs = activeServices
      .map((t) => t.technician?.fullName)
      .filter((t): t is string => Boolean(t));
    
    const combinedTechs = Array.from(new Set([...defaultTechs, ...dbTechs])).sort();

    return {
      success: true,
      data: {
        metrics: {
          totalActiveService,
          totalCompletedUnclaimed,
          totalVendorActive,
          totalTodayIntake,
        },
        activeServices,
        completedUnclaimed,
        technicians: combinedTechs,
      },
    };
  } catch (error) {
    console.error("Get Dashboard Data Error:", error);
    return {
      success: false,
      error: "Gagal mengambil data dashboard.",
    };
  }
}
