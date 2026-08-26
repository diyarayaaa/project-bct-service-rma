"use client";

interface PrintControlBarProps {
  title: string;
  subtitle?: string;
  showFormatToggle?: boolean;
  format?: string;
}

export default function PrintControlBar({
  title,
  subtitle,
  showFormatToggle = false,
  format = "thermal",
}: PrintControlBarProps) {
  return (
    <div className="no-print bg-zinc-900 text-white p-3 flex items-center justify-between shadow-md">
      <span className="text-xs font-semibold">
        {title} {subtitle && <span className="font-mono bg-zinc-800 px-1.5 py-0.5 rounded">{subtitle}</span>}
      </span>
      <div className="flex items-center gap-3">
        {showFormatToggle && (
          <>
            <a
              href={`?format=thermal`}
              className={`px-3 py-1 text-xs font-bold rounded-lg border transition-all ${
                format === "thermal" ? "bg-white text-zinc-900 border-white" : "border-zinc-700 hover:bg-zinc-800"
              }`}
            >
              Struk Thermal
            </a>
            <a
              href={`?format=a4`}
              className={`px-3 py-1 text-xs font-bold rounded-lg border transition-all ${
                format !== "thermal" ? "bg-white text-zinc-900 border-white" : "border-zinc-700 hover:bg-zinc-800"
              }`}
            >
              Faktur A4
            </a>
          </>
        )}
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
  );
}
