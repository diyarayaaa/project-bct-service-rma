"use client";

import { useState, useTransition } from "react";
import { updatePresetAction } from "@/actions/preset";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2, Edit } from "lucide-react";
import { DeviceType } from "@prisma/client";

interface PresetToEdit {
  id: string;
  category: string;
  label: string;
  deviceType: DeviceType | null;
}

interface EditPresetDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  preset: PresetToEdit;
  onSuccess?: () => void;
}

export default function EditPresetDialog({
  isOpen,
  onOpenChange,
  preset,
  onSuccess,
}: EditPresetDialogProps) {
  const [category, setCategory] = useState(preset.category);
  const [label, setLabel] = useState(preset.label);
  const [deviceType, setDeviceType] = useState<string>(preset.deviceType || "ALL");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!category.trim() || !label.trim()) {
      toast.error("Kategori dan label preset wajib diisi.");
      return;
    }

    startTransition(async () => {
      const selectedDevice = deviceType === "ALL" ? null : (deviceType as DeviceType);
      const res = await updatePresetAction(preset.id, category, label, selectedDevice);

      if (res.success) {
        toast.success(`Preset "${label}" berhasil diperbarui!`);
        onOpenChange(false);
        if (onSuccess) onSuccess();
      } else {
        toast.error(res.error || "Gagal mengedit preset.");
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
        <DialogHeader className="p-6 pb-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
          <DialogTitle className="text-lg font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            <Edit className="h-5 w-5 text-indigo-500" />
            Edit Preset Opsi Form
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="font-medium text-zinc-700 dark:text-zinc-300 block mb-1">Kategori Preset *</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="flex h-9 w-full rounded-md border border-zinc-200 bg-white dark:bg-zinc-900 px-3 py-1 text-xs shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring dark:border-zinc-800 dark:text-zinc-50"
            >
              <option value="COMPLAINT">Keluhan (COMPLAINT)</option>
              <option value="ACCESSORY">Aksesoris (ACCESSORY)</option>
            </select>
          </div>

          <div>
            <label className="font-medium text-zinc-700 dark:text-zinc-300 block mb-1">Label Opsi *</label>
            <Input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Contoh: Mati Total / Charger Original"
              className="h-9 text-xs"
            />
          </div>

          <div>
            <label className="font-medium text-zinc-700 dark:text-zinc-300 block mb-1">Tipe Perangkat Spesifik (Opsional)</label>
            <select
              value={deviceType}
              onChange={(e) => setDeviceType(e.target.value)}
              className="flex h-9 w-full rounded-md border border-zinc-200 bg-white dark:bg-zinc-900 px-3 py-1 text-xs shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring dark:border-zinc-800 dark:text-zinc-50"
            >
              <option value="ALL">Semua Tipe Perangkat</option>
              <option value="LAPTOP">Laptop</option>
              <option value="PC_DESKTOP">PC Desktop</option>
              <option value="PRINTER">Printer</option>
              <option value="MONITOR">Monitor</option>
              <option value="STORAGE">Storage (SSD/HDD)</option>
              <option value="NETWORKING">Networking</option>
              <option value="PERIPHERAL">Peripheral</option>
              <option value="OTHER">Lainnya</option>
            </select>
          </div>

          <DialogFooter className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-9 text-xs"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold h-9 text-xs flex items-center gap-1.5"
            >
              {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Simpan
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
