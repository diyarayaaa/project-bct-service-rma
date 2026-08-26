import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import storeInfo from "../../../../../data/store-info.json";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ format?: string }>;
}

export default async function ReceiptPrintPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { format = "thermal" } = await searchParams;

  // Fetch ticket by id or ticketNumber
  const ticket = await db.serviceTicket.findFirst({
    where: {
      OR: [
        { id: id },
        { ticketNumber: id },
      ],
    },
    include: {
      customer: true,
      technician: {
        select: {
          fullName: true,
          username: true,
        },
      },
    },
  });

  if (!ticket) {
    notFound();
  }

  const isThermal = format === "thermal";

  return (
    <div className="bg-white text-zinc-950 min-h-screen">
      {/* Control bar - hidden during print */}
      <div className="no-print bg-zinc-900 text-white p-3 flex items-center justify-between shadow-md">
        <span className="text-xs font-semibold">
          Preview Cetak Nota: <span className="font-mono bg-zinc-800 px-1.5 py-0.5 rounded">{ticket.ticketNumber}</span>
        </span>
        <div className="flex items-center gap-3">
          <a
            href={`?format=thermal`}
            className={`px-3 py-1 text-xs font-bold rounded-lg border transition-all ${
              isThermal ? "bg-white text-zinc-900 border-white" : "border-zinc-700 hover:bg-zinc-800"
            }`}
          >
            Struk Thermal
          </a>
          <a
            href={`?format=a4`}
            className={`px-3 py-1 text-xs font-bold rounded-lg border transition-all ${
              !isThermal ? "bg-white text-zinc-900 border-white" : "border-zinc-700 hover:bg-zinc-800"
            }`}
          >
            Faktur A4
          </a>
          <button
            onClick={() => window.print()}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-1 rounded-lg text-xs transition-colors flex items-center gap-1"
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
          @page { margin: 0; }
        }
      `}} />

      {/* THERMAL TEMPLATE */}
      {isThermal ? (
        <div className="w-[76mm] mx-auto p-4 font-mono text-[11px] leading-tight space-y-4">
          {/* Header */}
          <div className="text-center space-y-1">
            <h1 className="text-sm font-bold uppercase tracking-wide">{storeInfo.storeName}</h1>
            <p className="text-[10px] italic">{storeInfo.tagline}</p>
            <p className="text-[9px] max-w-[220px] mx-auto leading-tight">{storeInfo.address}</p>
            <p className="text-[9px]">WhatsApp: {storeInfo.whatsapp} | Telp: {storeInfo.phone}</p>
          </div>

          <div className="border-b border-dashed border-zinc-900 my-2"></div>

          {/* Ticket Meta */}
          <div className="space-y-1">
            <div className="flex justify-between font-bold text-xs">
              <span>NO RMA:</span>
              <span>{ticket.ticketNumber}</span>
            </div>
            <div className="flex justify-between">
              <span>Tanggal:</span>
              <span>{new Date(ticket.entryDate).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}</span>
            </div>
            <div className="flex justify-between">
              <span>Layanan:</span>
              <span className="font-bold">{ticket.serviceType}</span>
            </div>
            <div className="flex justify-between">
              <span>Teknisi:</span>
              <span>{ticket.technician.fullName}</span>
            </div>
          </div>

          <div className="border-b border-dashed border-zinc-900 my-2"></div>

          {/* Customer & Device */}
          <div className="space-y-1">
            <div>
              <span className="text-[9px] uppercase font-bold text-zinc-500">Pelanggan:</span>
              <div className="font-bold">{ticket.customer.name}</div>
              <div className="font-mono">{ticket.customer.phone}</div>
            </div>
            <div className="mt-2">
              <span className="text-[9px] uppercase font-bold text-zinc-500">Perangkat:</span>
              <div className="font-bold">{ticket.deviceName}</div>
              <div>SN: {ticket.serialNumber}</div>
            </div>
            <div className="mt-2">
              <span className="text-[9px] uppercase font-bold text-zinc-500">Keluhan:</span>
              <div className="italic font-bold">&quot;{ticket.complaint}&quot;</div>
            </div>
            <div className="mt-2">
              <span className="text-[9px] uppercase font-bold text-zinc-500">Kelengkapan:</span>
              <div>{ticket.accessories.join(", ") || "-"}</div>
            </div>
            {ticket.estimatedCompletionDate && (
              <div className="mt-2">
                <span className="text-[9px] uppercase font-bold text-zinc-500">Estimasi Selesai:</span>
                <div className="font-bold">
                  {new Date(ticket.estimatedCompletionDate).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="border-b border-dashed border-zinc-900 my-2"></div>

          {/* Financials */}
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span>Estimasi Biaya:</span>
              <span className="font-mono">Rp {Number(ticket.estimatedCost).toLocaleString("id-ID")}</span>
            </div>
            <div className="flex justify-between">
              <span>DP (Down Payment):</span>
              <span className="font-mono">Rp {Number(ticket.dpAmount).toLocaleString("id-ID")}</span>
            </div>
            <div className="flex justify-between font-bold border-t border-dotted border-zinc-900 pt-1 mt-1 text-sm">
              <span>SISA BIAYA:</span>
              <span className="font-mono">Rp {Number(ticket.remainingCost).toLocaleString("id-ID")}</span>
            </div>
          </div>

          <div className="border-b border-dashed border-zinc-900 my-2"></div>

          {/* Terms */}
          <div className="space-y-1 text-[8px] leading-tight">
            <span className="font-bold uppercase tracking-wider block">Syarat & Ketentuan:</span>
            <ol className="list-decimal pl-3 space-y-0.5">
              {storeInfo.receiptTerms.map((term, index) => (
                <li key={index}>{term}</li>
              ))}
            </ol>
          </div>

          <div className="border-b border-dashed border-zinc-900 my-4"></div>

          {/* Signatures */}
          <div className="grid grid-cols-2 text-center text-[9px] pt-2">
            <div className="space-y-8">
              <span>Pelanggan,</span>
              <div className="border-b border-zinc-900 mx-6"></div>
              <span>(........................)</span>
            </div>
            <div className="space-y-8">
              <span>Penerima (BCT),</span>
              <div className="border-b border-zinc-900 mx-6"></div>
              <span>( {ticket.technician.fullName.split(" ")[0]} )</span>
            </div>
          </div>

          <div className="text-center text-[9px] pt-6 font-bold uppercase tracking-widest text-zinc-600">
            Terima Kasih
          </div>
        </div>
      ) : (
        /* A4 FACTUR TEMPLATE */
        <div className="max-w-4xl mx-auto p-8 font-sans text-sm space-y-6 bg-white border border-zinc-200 shadow-sm my-6">
          {/* Header */}
          <div className="flex items-start justify-between border-b border-zinc-200 pb-5">
            <div className="space-y-1.5">
              <h1 className="text-2xl font-bold uppercase tracking-tight text-zinc-900">{storeInfo.storeName}</h1>
              <p className="text-xs text-zinc-500 font-medium italic">{storeInfo.tagline}</p>
              <p className="text-xs text-zinc-600 max-w-sm mt-1">{storeInfo.address}</p>
              <p className="text-xs text-zinc-600 font-semibold">WA: {storeInfo.whatsapp} | Telp: {storeInfo.phone}</p>
            </div>
            <div className="text-right space-y-1">
              <span className="inline-flex rounded-md bg-zinc-900 px-3 py-1 text-xs font-bold uppercase text-white tracking-widest">
                Tanda Terima RMA
              </span>
              <div className="text-lg font-bold font-mono text-zinc-900 mt-2">{ticket.ticketNumber}</div>
              <div className="text-xs text-zinc-500">
                Tanggal: {new Date(ticket.entryDate).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          </div>

          {/* Billing Info Grid */}
          <div className="grid grid-cols-2 gap-8 py-2">
            <div className="space-y-2">
              <h4 className="font-bold text-xs uppercase text-zinc-400 tracking-wider">Data Pelanggan</h4>
              <div className="p-4 rounded-xl border border-zinc-100 bg-zinc-50/50 space-y-1">
                <div className="font-bold text-zinc-900 text-base">{ticket.customer.name}</div>
                <div className="font-mono text-xs text-zinc-600">{ticket.customer.phone}</div>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-bold text-xs uppercase text-zinc-400 tracking-wider">Detail Layanan</h4>
              <div className="p-4 rounded-xl border border-zinc-100 bg-zinc-50/50 grid grid-cols-2 gap-y-2 gap-x-4 text-xs">
                <div>
                  <span className="text-zinc-400">Jenis Layanan</span>
                  <div className="font-bold text-zinc-950">{ticket.serviceType}</div>
                </div>
                <div>
                  <span className="text-zinc-400">Teknisi PJ</span>
                  <div className="font-bold text-zinc-950">{ticket.technician.fullName}</div>
                </div>
                {ticket.estimatedCompletionDate && (
                  <div className="col-span-2 border-t border-zinc-200/50 pt-2 mt-1">
                    <span className="text-zinc-400">Estimasi Selesai</span>
                    <div className="font-bold text-zinc-950">
                      {new Date(ticket.estimatedCompletionDate).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Device Specification Table */}
          <div className="space-y-2">
            <h4 className="font-bold text-xs uppercase text-zinc-400 tracking-wider">Perangkat & Keluhan</h4>
            <div className="overflow-hidden rounded-xl border border-zinc-200">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-zinc-50 border-b border-zinc-200 font-semibold text-zinc-700">
                  <tr>
                    <th className="px-4 py-3">Nama / Seri Unit</th>
                    <th className="px-4 py-3">Serial Number</th>
                    <th className="px-4 py-3">Keluhan Masalah</th>
                    <th className="px-4 py-3">Kelengkapan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 text-zinc-800">
                  <tr>
                    <td className="px-4 py-3.5 font-semibold text-zinc-900">{ticket.deviceName}</td>
                    <td className="px-4 py-3.5 font-mono">{ticket.serialNumber}</td>
                    <td className="px-4 py-3.5 italic font-semibold text-zinc-900">&quot;{ticket.complaint}&quot;</td>
                    <td className="px-4 py-3.5">{ticket.accessories.join(", ") || "-"}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Financials & Notes grid */}
          <div className="grid grid-cols-5 gap-6 pt-2">
            {/* Notes */}
            <div className="col-span-3 space-y-2">
              <h4 className="font-bold text-xs uppercase text-zinc-400 tracking-wider">Catatan Tambahan</h4>
              <div className="p-4 rounded-xl border border-zinc-200 h-28 italic text-zinc-500 text-xs">
                {ticket.notes || "Tidak ada catatan tambahan."}
              </div>
            </div>
            {/* Total Cost */}
            <div className="col-span-2 space-y-2">
              <h4 className="font-bold text-xs uppercase text-zinc-400 tracking-wider text-right">Rincian Pembayaran</h4>
              <div className="p-4 rounded-xl border border-zinc-200 space-y-2 text-xs h-28 flex flex-col justify-between">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Estimasi Biaya</span>
                  <span className="font-mono font-semibold">Rp {Number(ticket.estimatedCost).toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between border-b border-zinc-100 pb-2">
                  <span className="text-zinc-500">Uang Muka / DP</span>
                  <span className="font-mono font-semibold text-emerald-600">- Rp {Number(ticket.dpAmount).toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between font-bold text-sm text-zinc-900">
                  <span>Sisa Pembayaran</span>
                  <span className="font-mono text-indigo-600">Rp {Number(ticket.remainingCost).toLocaleString("id-ID")}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Terms & Conditions */}
          <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-100 text-xs space-y-1.5">
            <h5 className="font-bold uppercase tracking-wider text-zinc-700">Syarat & Ketentuan Pengambilan</h5>
            <ol className="list-decimal pl-4 text-zinc-500 space-y-0.5">
              {storeInfo.receiptTerms.map((term, index) => (
                <li key={index}>{term}</li>
              ))}
            </ol>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-2 text-center text-xs pt-10">
            <div className="space-y-16">
              <span>Tanda Tangan Pelanggan,</span>
              <div className="border-b border-zinc-300 mx-20"></div>
              <span className="font-semibold text-zinc-900">( {ticket.customer.name.replace("TN/NY. ", "")} )</span>
            </div>
            <div className="space-y-16">
              <span>Penerima Unit (Best Computel),</span>
              <div className="border-b border-zinc-300 mx-20"></div>
              <span className="font-semibold text-zinc-900">( {ticket.technician.fullName} )</span>
            </div>
          </div>
        </div>
      )}

      {/* Auto print script */}
      <script dangerouslySetInnerHTML={{ __html: `
        // Auto trigger browser print on page load
        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 500);
        }
      `}} />
    </div>
  );
}
