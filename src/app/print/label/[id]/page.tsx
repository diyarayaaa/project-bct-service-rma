import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import storeInfo from "../../../../../data/store-info.json";
import PrintControlBar from "@/components/print/print-control-bar";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ShippingLabelPrintPage({ params }: PageProps) {
  const { id } = await params;

  // Fetch Delivery Note
  const note = await db.deliveryNote.findFirst({
    where: {
      OR: [
        { id: id },
        { suratJalanNumber: id },
      ],
    },
    include: {
      vendor: true,
    },
  });

  if (!note) {
    notFound();
  }

  return (
    <div className="bg-white text-zinc-950 min-h-screen">
      <PrintControlBar
        title="Preview Label Pengiriman:"
        subtitle={note.suratJalanNumber}
      />

      {/* CSS style overrides for print */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          .no-print { display: none !important; }
          body { background-color: white !important; color: black !important; }
          @page { margin: 0; }
        }
      `}} />

      {/* A6 SHIPPING LABEL STICKER TEMPLATE */}
      <div className="max-w-[105mm] mx-auto p-6 border-4 border-dashed border-zinc-950 font-sans text-xs bg-white shadow-sm space-y-6 my-10 relative overflow-hidden">
        {/* Header decoration */}
        <div className="border-b-2 border-zinc-950 pb-3 flex justify-between items-center">
          <span className="font-bold text-sm uppercase tracking-wider text-zinc-900">{storeInfo.storeName}</span>
          <span className="text-[9px] font-bold bg-zinc-900 text-white px-2 py-0.5 rounded uppercase tracking-widest font-mono">
            RMA PACKAGE
          </span>
        </div>

        {/* Penerima (Receiver) - Highlighted */}
        <div className="bg-zinc-100 p-4 rounded-xl border border-zinc-200 space-y-1.5">
          <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Penerima / Kepada:</div>
          <div className="font-bold text-zinc-900 text-base leading-tight">
            {note.vendor.name}
          </div>
          <div className="text-zinc-800 text-xs font-semibold leading-relaxed">
            {note.vendor.address || "No Address"}
          </div>
          <div className="text-xs text-zinc-700 font-bold border-t border-zinc-300/60 pt-1.5 mt-1">
            PIC: {note.vendor.contactPerson || "-"} | Telp: {note.vendor.phone || "-"}
          </div>
        </div>

        {/* Pengirim (Sender) */}
        <div className="p-3 border border-zinc-300 rounded-xl space-y-1 bg-zinc-50/50">
          <div className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">Pengirim / Dari:</div>
          <div className="font-bold text-zinc-800">{storeInfo.storeName} (Service & RMA)</div>
          <p className="text-[10px] text-zinc-600 leading-tight">
            {storeInfo.address}
          </p>
          <div className="text-[10px] text-zinc-700 font-semibold">
            Telp: {storeInfo.phone}
          </div>
        </div>

        {/* References Footer */}
        <div className="border-t-2 border-zinc-950 pt-3 grid grid-cols-2 gap-4 text-[10px]">
          <div>
            <span className="text-[8px] font-bold text-zinc-400 uppercase">No. Surat Jalan</span>
            <div className="font-mono font-bold text-zinc-800 text-xs mt-0.5">{note.suratJalanNumber}</div>
          </div>
          <div>
            <span className="text-[8px] font-bold text-zinc-400 uppercase">Ekspedisi & Resi</span>
            <div className="font-bold text-zinc-800 mt-0.5">
              {note.courierName || "Kurir Toko"}
            </div>
            {note.trackingNumber && (
              <div className="font-mono text-zinc-500 text-[9px] mt-0.5">{note.trackingNumber}</div>
            )}
          </div>
        </div>
      </div>

      {/* Auto print script */}
      <script dangerouslySetInnerHTML={{ __html: `
        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 500);
        }
      `}} />
    </div>
  );
}
