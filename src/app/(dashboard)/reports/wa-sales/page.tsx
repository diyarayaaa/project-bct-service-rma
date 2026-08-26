import { getSalesReportDataAction } from "@/actions/sales-report";
import SalesReportClient from "./sales-report-client";

export const revalidate = 0;

export default async function SalesReportPage() {
  // Get today's local date string (GMT+7)
  const now = new Date();
  const tzoffset = 7 * 60 * 60000; // GMT+7 in ms
  const localTime = new Date(now.getTime() + tzoffset);
  const todayStr = localTime.toISOString().split("T")[0];

  const res = await getSalesReportDataAction(todayStr);
  const initialData = res.success && res.data ? res.data : { section1: [], section2: [], section3: [], section4: [] };

  return (
    <SalesReportClient
      initialDate={todayStr}
      initialData={initialData}
    />
  );
}
