import { db } from "@/lib/db";
import PresetsClient from "./presets-client";

export const dynamic = "force-dynamic";

export default async function PresetsPage() {
  // Fetch all preset options
  const presets = await db.presetOption.findMany({
    orderBy: { label: "asc" },
  });

  return <PresetsClient initialPresets={JSON.parse(JSON.stringify(presets))} />;
}
