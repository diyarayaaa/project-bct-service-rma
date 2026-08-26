import { db } from "@/lib/db";
import { generateNextTicketNumber } from "@/actions/ticket";
import IntakeClient from "./intake-client";

export const dynamic = "force-dynamic";

export default async function IntakePage() {
  // 1. Fetch all users/technicians
  const technicians = await db.user.findMany({
    orderBy: { username: "asc" },
  });

  // 2. Fetch all customers for auto-fill/autocomplete suggestions
  const customers = await db.customer.findMany({
    orderBy: { name: "asc" },
  });

  // 3. Fetch preset options
  const presets = await db.presetOption.findMany({
    orderBy: { label: "asc" },
  });

  // 4. Generate next sequential ticket number
  const nextTicketNumber = await generateNextTicketNumber();

  // Clean data for Client Component serialization
  const cleanTechnicians = technicians.map((t) => ({
    id: t.id,
    username: t.username,
    fullName: t.fullName,
    role: t.role,
  }));

  const cleanCustomers = customers.map((c) => ({
    id: c.id,
    name: c.name,
    phone: c.phone,
    isInternalStock: c.isInternalStock,
  }));

  const cleanPresets = presets.map((p) => ({
    id: p.id,
    category: p.category,
    label: p.label,
    deviceType: p.deviceType,
  }));

  return (
    <IntakeClient
      initialTicketNumber={nextTicketNumber}
      technicians={cleanTechnicians}
      customers={cleanCustomers}
      presets={cleanPresets}
    />
  );
}
