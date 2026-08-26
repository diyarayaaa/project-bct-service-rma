import { getOperationalReportDataAction } from "@/actions/report";
import OperationalReportClient from "./operational-report-client";

export const revalidate = 0;

export default async function OperationalReportPage() {
  // Get today's local date string (GMT+7)
  const now = new Date();
  const tzoffset = 7 * 60 * 60000; // GMT+7 in ms
  const localTime = new Date(now.getTime() + tzoffset);
  const todayStr = localTime.toISOString().split("T")[0];

  const res = await getOperationalReportDataAction(todayStr);
  const initialData = res.success && res.data ? res.data : { block1: [], block2: [], block3: [], block4: [] };

  return (
    <OperationalReportClient
      initialDate={todayStr}
      initialData={initialData}
    />
  );
}
