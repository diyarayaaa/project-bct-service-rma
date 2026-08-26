import { db } from "@/lib/db";
import VendorsClient from "./vendors-client";

export const dynamic = "force-dynamic";

export default async function VendorsPage() {
  const vendors = await db.vendor.findMany({
    orderBy: { name: "asc" },
  });

  return <VendorsClient initialVendors={JSON.parse(JSON.stringify(vendors))} />;
}
