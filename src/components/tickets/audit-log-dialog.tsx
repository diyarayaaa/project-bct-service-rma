"use client";

import { useEffect, useState, useTransition } from "react";
import { getTicketAuditLogsAction, AuditLogItem } from "@/actions/audit-action";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, History, User, Clock, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";

interface AuditLogDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  ticketId: string;
  ticketNumber: string;
}

const formatDateWithTime = (dateInput: Date | string): string => {
  const date = new Date(dateInput);
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  const hh = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  const ss = String(date.getSeconds()).padStart(2, "0");
  return `${dd}/${mm}/${yyyy} ${hh}:${min}:${ss}`;
};

const getActionBadge = (action: string) => {
  switch (action.toUpperCase()) {
    case "CREATE":
      return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-200">🆕 Registrasi Tiket</Badge>;
    case "STATUS_CHANGE":
      return <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200">🔄 Perubahan Status</Badge>;
    case "GENERATE_SJ":
      return <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-200">📦 Surat Jalan</Badge>;
    case "UPDATE_DETAILS":
      return <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border-purple-200">✏️ Edit Data Tiket</Badge>;
    default:
      return <Badge variant="outline">{action}</Badge>;
  }
};

export default function AuditLogDialog({
  isOpen,
  onOpenChange,
  ticketId,
  ticketNumber,
}: AuditLogDialogProps) {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (isOpen && ticketId) {
      startTransition(async () => {
        const res = await getTicketAuditLogsAction(ticketId);
        if (res.success && res.data) {
          setLogs(res.data);
        } else {
          toast.error(res.error || "Gagal memuat riwayat audit log.");
        }
      });
    }
  }, [isOpen, ticketId]);

  const toggleExpand = (logId: string) => {
    setExpandedLogId(expandedLogId === logId ? null : logId);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0 overflow-hidden dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
        {/* Header */}
        <DialogHeader className="p-6 pb-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
          <DialogTitle className="text-lg font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            <History className="h-5 w-5 text-indigo-500" />
            Riwayat Aktivitas & Audit Log (<span className="font-mono text-indigo-600 dark:text-indigo-400">{ticketNumber}</span>)
          </DialogTitle>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Rekam jejak kronologis setiap aktivitas, perubahan status, dan pembaruan data tiket.
          </p>
        </DialogHeader>

        {/* Content / Timeline */}
        <div className="p-6 flex-1 overflow-y-auto min-h-[300px]">
          {isPending ? (
            <div className="py-16 flex flex-col items-center justify-center gap-2">
              <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
              <span className="text-xs text-zinc-500 dark:text-zinc-400 font-semibold">Memuat riwayat audit log...</span>
            </div>
          ) : logs.length === 0 ? (
            <div className="py-16 text-center">
              <History className="h-10 w-10 text-zinc-300 dark:text-zinc-700 mx-auto mb-2" />
              <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">Belum ada riwayat aktivitas.</p>
            </div>
          ) : (
            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-zinc-200 dark:before:bg-zinc-800">
              {logs.map((log) => {
                const userFullName = log.user?.fullName || log.user?.username || "System Administrator";
                const isExpanded = expandedLogId === log.id;

                return (
                  <div key={log.id} className="relative group">
                    {/* Timeline dot */}
                    <div className="absolute -left-[23px] top-1 h-3.5 w-3.5 rounded-full border-2 border-white dark:border-zinc-900 bg-indigo-500 group-hover:scale-125 transition-transform" />

                    <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-955 space-y-2">
                      {/* Header line */}
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-100 dark:border-zinc-850 pb-2">
                        <div className="flex items-center gap-2">
                          {getActionBadge(log.action)}
                          <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1">
                            <User className="h-3 w-3 text-zinc-400" />
                            {userFullName}
                          </span>
                        </div>

                        <span className="text-[11px] font-mono text-zinc-400 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDateWithTime(log.createdAt)}
                        </span>
                      </div>

                      {/* Description */}
                      <p className="text-xs text-zinc-700 dark:text-zinc-300 font-medium leading-relaxed">
                        {log.description}
                      </p>

                      {/* Expandable JSON / data change detail button */}
                      {(log.previousData || log.newData) && (
                        <div className="pt-1">
                          <button
                            onClick={() => toggleExpand(log.id)}
                            className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                          >
                            {isExpanded ? (
                              <>
                                Sembunyikan Detail Perubahan <ChevronUp className="h-3 w-3" />
                              </>
                            ) : (
                              <>
                                Lihat Detail Perubahan Data <ChevronDown className="h-3 w-3" />
                              </>
                            )}
                          </button>

                          {isExpanded && (
                            <div className="mt-2 grid gap-2 sm:grid-cols-2 text-[10px] font-mono p-3 bg-zinc-50 dark:bg-zinc-900 border dark:border-zinc-800 rounded-lg overflow-x-auto">
                              {log.previousData && (
                                <div className="space-y-1">
                                  <span className="font-bold text-rose-500 dark:text-rose-400">Data Sebelum:</span>
                                  <pre className="p-2 bg-white dark:bg-zinc-950 rounded border dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap leading-tight">
                                    {JSON.stringify(log.previousData, null, 2)}
                                  </pre>
                                </div>
                              )}

                              {log.newData && (
                                <div className="space-y-1">
                                  <span className="font-bold text-emerald-500 dark:text-emerald-400">Data Sesudah:</span>
                                  <pre className="p-2 bg-white dark:bg-zinc-950 rounded border dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap leading-tight">
                                    {JSON.stringify(log.newData, null, 2)}
                                  </pre>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <DialogFooter className="p-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
          <Button
            onClick={() => onOpenChange(false)}
            variant="outline"
            className="border-zinc-200 dark:border-zinc-800 text-xs font-semibold"
          >
            Tutup
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
