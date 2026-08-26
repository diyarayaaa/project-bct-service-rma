import { db } from "@/lib/db";
import TicketsClient from "./tickets-client";

export const dynamic = "force-dynamic";

export default async function TicketsPage() {
  // Fetch tickets with related entities
  const tickets = await db.serviceTicket.findMany({
    include: {
      customer: true,
      technician: {
        select: {
          id: true,
          username: true,
          fullName: true,
        },
      },
      vendor: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Fetch vendors for status-dialog dropdown selection
  const vendors = await db.vendor.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });

  return (
    <TicketsClient
      initialTickets={JSON.parse(JSON.stringify(tickets))}
      vendors={JSON.parse(JSON.stringify(vendors))}
    />
  );
}
