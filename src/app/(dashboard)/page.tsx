import { getDashboardDataAction } from "@/actions/dashboard";
import { db } from "@/lib/db";
import DashboardClient from "./dashboard-client";

export const revalidate = 0;

export default async function DashboardPage() {
  const res = await getDashboardDataAction();
  const initialData = res.success && res.data ? res.data : {
    metrics: {
      totalActiveService: 0,
      totalCompletedUnclaimed: 0,
      totalVendorActive: 0,
      totalTodayIntake: 0,
    },
    activeServices: [],
    completedUnclaimed: [],
    technicians: ["Wandi", "Satryo", "Derida", "Anzar"],
  };

  const vendors = await db.vendor.findMany({
    select: {
      id: true,
      name: true,
      aliasCode: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  return (
    <DashboardClient
      initialData={initialData}
      vendors={vendors}
    />
  );
}
