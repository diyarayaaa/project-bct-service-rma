import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import storeInfo from "../../../../../data/store-info.json";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function SuratJalanPrintPage({ params }: PageProps) {
  const { id } = await params;

  // Fetch Delivery Note with relations
  const note = await db.deliveryNote.findFirst({
    where: {
      OR: [
        { id: id },
        { suratJalanNumber: id },
      ],
    },
    include: {
      vendor: true,
      tickets: {
        include: {
          customer: true,
        },
      },
    },
  });

  if (!note) {
    notFound();
  }

  return (
    <div className="bg-white text-zinc-950 min-h-screen">
      {/* Control bar - hidden during print */}
      <div className="no-print bg-zinc-900 text-white p-3 flex items-center justify-between shadow-md">
        <span className="text-xs font-semibold">
          Preview Cetak Surat Jalan: <span className="font-mono bg-zinc-800 px-1.5 py-0.5 rounded">{note.suratJalanNumber}</span>
        </span>
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-1 rounded-lg text-xs transition-colors"
          >
            Cetak Sekarang
          </button>
          <button
            onClick={() => window.close()}
            className="text-zinc-400 hover:text-white text-xs px-2"
          >
            Tutup
          </button>
        </div>
      </div>

      {/* CSS style overrides for print */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          .no-print { display: none !important; }
          body { background-color: white !important; color: black !important; }
          @page { margin: 1cm; }
        }
      `}} />

      {/* A4 SURAT JALAN TEMPLATE */}
      <div className="max-w-4xl mx-auto p-10 font-sans text-xs space-y-6 bg-white my-6 border border-zinc-200 shadow-sm">
        {/* Header (Company details) */}
        <div className="flex justify-between border-b border-zinc-300 pb-5">
          <div className="space-y-1">
            <h1 className="text-xl font-bold uppercase tracking-tight text-zinc-900">{storeInfo.storeName}</h1>
            <p className="text-[10px] text-zinc-500 italic">{storeInfo.tagline}</p>
            <p className="max-w-sm text-zinc-600 mt-1 leading-relaxed">{storeInfo.address}</p>
            <p className="text-zinc-600 font-medium">WhatsApp/Telp: {storeInfo.whatsapp}</p>
          </div>
          <div className="text-right space-y-1">
            <h2 className="text-lg font-bold uppercase tracking-wider text-zinc-900">SURAT JALAN VENDOR</h2>
            <div className="text-sm font-bold font-mono text-zinc-700">{note.suratJalanNumber}</div>
            <div className="text-zinc-500">
              Tanggal Kirim: {new Date(note.shippingDate).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </div>
            {note.courierName && (
              <div className="text-[10px] text-zinc-500">
                Ekspedisi: <span className="font-semibold text-zinc-700">{note.courierName}</span>
                {note.trackingNumber && ` (Resi: ${note.trackingNumber})`}
              </div>
            )}
          </div>
        </div>

        {/* Vendor Destination details */}
        <div className="grid grid-cols-2 py-2 gap-4">
          <div className="space-y-1">
            <span className="font-bold text-[10px] uppercase text-zinc-400 tracking-wider">Kepada Yth.</span>
            <div className="font-bold text-sm text-zinc-900">{note.vendor.name}</div>
            <div className="text-zinc-600 leading-relaxed max-w-xs">{note.vendor.address || "No Address"}</div>
            {note.vendor.contactPerson && (
              <div className="text-[10px] text-zinc-500">
                PIC: <span className="font-semibold text-zinc-700">{note.vendor.contactPerson}</span> ({note.vendor.phone || "-"})
              </div>
            )}
          </div>
          {note.notes && (
            <div className="space-y-1 border-l border-zinc-200 pl-4">
              <span className="font-bold text-[10px] uppercase text-zinc-400 tracking-wider">Catatan Pengiriman</span>
              <p className="text-zinc-600 italic mt-0.5">&quot;{note.notes}&quot;</p>
            </div>
          )}
        </div>

        {/* Table of items */}
        <div className="space-y-2">
          <h3 className="font-bold text-[10px] uppercase text-zinc-400 tracking-wider">Daftar Barang Dikirim</h3>
          <div className="overflow-hidden rounded-lg border border-zinc-300">
            <table className="w-full text-left border-collapse">
              <thead className="bg-zinc-50 border-b border-zinc-300 font-semibold text-zinc-700 text-[10px] uppercase">
                <tr>
                  <th className="px-3 py-2.5 w-8 text-center border-r border-zinc-200">No</th>
                  <th className="px-3 py-2.5 w-24 border-r border-zinc-200">No Layanan</th>
                  <th className="px-4 py-2.5 border-r border-zinc-200">Nama & Seri Barang</th>
                  <th className="px-3 py-2.5 border-r border-zinc-200">Serial Number (S/N)</th>
                  <th className="px-4 py-2.5 border-r border-zinc-200">Keluhan</th>
                  <th className="px-3 py-2.5">Kelengkapan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 text-zinc-800 text-xs">
                {note.tickets.map((ticket, index) => (
                  <tr key={ticket.id} className="hover:bg-zinc-50/20">
                    <td className="px-3 py-3 text-center font-semibold border-r border-zinc-200 text-zinc-500">{index + 1}</td>
                    <td className="px-3 py-3 font-mono font-bold text-zinc-900 border-r border-zinc-200">{ticket.ticketNumber}</td>
                    <td className="px-4 py-3 font-semibold text-zinc-900 border-r border-zinc-200">{ticket.deviceName}</td>
                    <td className="px-3 py-3 font-mono border-r border-zinc-200">{ticket.serialNumber}</td>
                    <td className="px-4 py-3 italic border-r border-zinc-200">{ticket.complaint}</td>
                    <td className="px-3 py-3 text-[10px] text-zinc-600">{ticket.accessories.join(", ") || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer (Terms & signs) */}
        <div className="pt-8">
          <p className="text-[10px] text-zinc-400 text-center italic">
            Surat jalan ini merupakan dokumen sah pengiriman unit Best Computel ke partner vendor terkait. Mohon lakukan verifikasi saat kedatangan unit.
          </p>
        </div>

        {/* Signatures */}
        <div className="grid grid-cols-3 text-center text-xs pt-10">
          <div className="space-y-16">
            <span>Pengirim (Best Computel),</span>
            <div className="border-b border-zinc-300 mx-10"></div>
            <span className="font-semibold text-zinc-900">( Admin RMA )</span>
          </div>
          <div className="space-y-16">
            <span>Ekspedisi / Kurir,</span>
            <div className="border-b border-zinc-300 mx-10"></div>
            <span className="font-semibold text-zinc-900">( ......................... )</span>
          </div>
          <div className="space-y-16">
            <span>Penerima (Vendor),</span>
            <div className="border-b border-zinc-300 mx-10"></div>
            <span className="font-semibold text-zinc-900">( ......................... )</span>
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
