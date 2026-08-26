import { db } from "@/lib/db";
import CustomersClient from "./customers-client";

export const dynamic = "force-dynamic";

export default async function CustomersPage() {
  // Fetch customers with their ticket counts
  const customers = await db.customer.findMany({
    include: {
      _count: {
        select: { tickets: true },
      },
    },
    orderBy: { name: "asc" },
  });

  // Map to clean format
  const mappedCustomers = customers.map((c) => ({
    id: c.id,
    name: c.name,
    phone: c.phone,
    isInternalStock: c.isInternalStock,
    createdAt: c.createdAt.toISOString(),
    ticketCount: c._count.tickets,
  }));

  return <CustomersClient initialCustomers={mappedCustomers} />;
}
