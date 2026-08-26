"use client";

import { useState, useTransition } from "react";
import { createPresetAction, deletePresetAction } from "@/actions/preset";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Plus, Trash2, AlertTriangle, Package, CheckSquare, Edit } from "lucide-react";
import EditPresetDialog from "@/components/presets/edit-preset-dialog";
import { useRouter } from "next/navigation";
import { DeviceType } from "@prisma/client";

interface PresetOption {
  id: string;
  category: string;
  label: string;
  deviceType: string | null;
  createdAt: string;
}

interface PresetsClientProps {
  initialPresets: PresetOption[];
}

export default function PresetsClient({ initialPresets }: PresetsClientProps) {
  const [presets, setPresets] = useState<PresetOption[]>(initialPresets);
  const [activeTab, setActiveTab] = useState<"COMPLAINT" | "ACCESSORY">("COMPLAINT");
  const [label, setLabel] = useState("");
  const [presetToEdit, setPresetToEdit] = useState<PresetOption | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const activePresets = presets.filter((p) => p.category === activeTab);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!label.trim()) return;

    const formData = new FormData();
    formData.append("category", activeTab);
    formData.append("label", label.trim());

    startTransition(async () => {
      const res = await createPresetAction(null, formData);

      if (res.success && res.data) {
        toast.success(`Preset opsi ${activeTab === "COMPLAINT" ? "keluhan" : "kelengkapan"} berhasil ditambahkan`);
        setPresets([res.data as PresetOption, ...presets]);
        setLabel("");
      } else {
        toast.error(res.error || "Gagal menambahkan preset baru");
      }
    });
  };

  const handleDelete = async (id: string, itemLabel: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus opsi "${itemLabel}"?`)) return;

    const res = await deletePresetAction(id);
    if (res.success) {
      toast.success("Preset berhasil dihapus");
      setPresets(presets.filter((p) => p.id !== id));
    } else {
      toast.error(res.error || "Gagal menghapus preset");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Preset Opsi Form
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Kelola preset keluhan dan kelengkapan bawaan untuk mempermudah penginputan unit masuk.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-800">
        <button
          onClick={() => setActiveTab("COMPLAINT")}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold transition-all border-b-2 -mb-[2px] ${
            activeTab === "COMPLAINT"
              ? "border-zinc-900 text-zinc-900 dark:border-zinc-50 dark:text-zinc-50 font-bold"
              : "border-transparent text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
          }`}
        >
          <AlertTriangle className="h-4 w-4" />
          Keluhan (Complaints)
        </button>
        <button
          onClick={() => setActiveTab("ACCESSORY")}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold transition-all border-b-2 -mb-[2px] ${
            activeTab === "ACCESSORY"
              ? "border-zinc-900 text-zinc-900 dark:border-zinc-50 dark:text-zinc-50 font-bold"
              : "border-transparent text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
          }`}
        >
          <Package className="h-4 w-4" />
          Kelengkapan (Accessories)
        </button>
      </div>

      {/* Quick Add Form */}
      <form onSubmit={handleSubmit} className="flex gap-2 max-w-lg items-end">
        <div className="flex-1 space-y-1">
          <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
            Tambah Opsi {activeTab === "COMPLAINT" ? "Keluhan" : "Kelengkapan"} Baru
          </label>
          <Input
            type="text"
            placeholder={activeTab === "COMPLAINT" ? "Contoh: LCD Bergaris, Mati Total..." : "Contoh: Charger, Dusbook, Tas..."}
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            disabled={isPending}
            className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
          />
        </div>
        <Button
          type="submit"
          disabled={isPending || !label.trim()}
          className="bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 flex items-center gap-1.5"
        >
          <Plus className="h-4 w-4" />
          Tambah
        </Button>
      </form>

      {/* Preset List grid */}
      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {activePresets.length === 0 ? (
          <div className="col-span-full py-10 text-center text-zinc-400 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
            Belum ada opsi preset terdaftar untuk kategori ini.
          </div>
        ) : (
          activePresets.map((preset) => (
            <div
              key={preset.id}
              className="flex items-center justify-between p-3 rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700 shadow-sm transition-all"
            >
              <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100 font-medium text-sm">
                <CheckSquare className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>{preset.label}</span>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setPresetToEdit(preset)}
                  className="h-8 w-8 text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                  title="Edit Preset"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(preset.id, preset.label)}
                  className="h-8 w-8 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"
                  title="Hapus Preset"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {presetToEdit && (
        <EditPresetDialog
          key={presetToEdit.id}
          isOpen={!!presetToEdit}
          onOpenChange={(open) => !open && setPresetToEdit(null)}
          preset={{
            ...presetToEdit,
            deviceType: presetToEdit.deviceType as DeviceType | null,
          }}
          onSuccess={() => {
            setPresetToEdit(null);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}
