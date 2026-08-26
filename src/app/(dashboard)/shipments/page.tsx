import { db } from "@/lib/db";
import { generateNextSuratJalanNumber } from "@/actions/delivery-note";
import ShipmentsClient from "./shipments-client";

export const dynamic = "force-dynamic";

export default async function ShipmentsPage() {
  // 1. Fetch active vendors for filtering
  const vendors = await db.vendor.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });

  // 2. Fetch pending tickets for shipping (ALIH_SERVICE or PROSES_GARANSI with no deliveryNoteId)
  const pendingTickets = await db.serviceTicket.findMany({
    where: {
      status: {
        in: ["ALIH_SERVICE", "PROSES_GARANSI"],
      },
      deliveryNoteId: null,
      vendorId: {
        not: null, // must be assigned to a vendor
      },
    },
    include: {
      customer: true,
      vendor: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  // 3. Fetch delivery notes history
  const deliveryNotes = await db.deliveryNote.findMany({
    include: {
      vendor: true,
      tickets: {
        include: {
          customer: true,
        },
      },
    },
    orderBy: {
      shippingDate: "desc",
    },
  });

  // 4. Generate next Surat Jalan number
  const nextSuratJalanNumber = await generateNextSuratJalanNumber();

  return (
    <ShipmentsClient
      initialVendors={JSON.parse(JSON.stringify(vendors))}
      initialPendingTickets={JSON.parse(JSON.stringify(pendingTickets))}
      initialDeliveryNotes={JSON.parse(JSON.stringify(deliveryNotes))}
      nextSuratJalanNumber={nextSuratJalanNumber}
    />
  );
}
