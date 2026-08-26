"use client";

import { useTransition } from "react";
import { createVendorAction } from "@/actions/vendor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";

interface QuickAddVendorDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (vendor: any) => void;
}

export default function QuickAddVendorDialog({
  isOpen,
  onOpenChange,
  onSuccess,
}: QuickAddVendorDialogProps) {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await createVendorAction(null, formData);

      if (res.success && res.data) {
        toast.success("Vendor baru berhasil ditambahkan secara instan");
        if (onSuccess) onSuccess(res.data);
        onOpenChange(false);
      } else {
        toast.error(res.error || "Gagal menambahkan vendor");
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-zinc-900 dark:text-zinc-50">Quick Add Vendor</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4 text-sm">
            <div className="space-y-1">
              <label htmlFor="quick-name" className="font-semibold text-zinc-700 dark:text-zinc-300">
                Nama Vendor *
              </label>
              <Input
                id="quick-name"
                name="name"
                type="text"
                required
                placeholder="Contoh: PT. ASIA RAYA COM"
                className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label htmlFor="quick-aliasCode" className="font-semibold text-zinc-700 dark:text-zinc-300">
                  Alias Code
                </label>
                <Input
                  id="quick-aliasCode"
                  name="aliasCode"
                  type="text"
                  placeholder="Contoh: ASIA RAYA"
                  className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="quick-location" className="font-semibold text-zinc-700 dark:text-zinc-300">
                  Lokasi *
                </label>
                <select
                  id="quick-location"
                  name="location"
                  defaultValue="BDG"
                  className="flex h-9 w-full rounded-md border border-zinc-200 bg-zinc-50 px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
                >
                  <option value="BDG">BDG (Bandung)</option>
                  <option value="JKT">JKT (Jakarta)</option>
                  <option value="OTHER">OTHER (Luar Kota)</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="quick-address" className="font-semibold text-zinc-700 dark:text-zinc-300">
                Alamat Lengkap
              </label>
              <textarea
                id="quick-address"
                name="address"
                rows={2}
                placeholder="Masukkan alamat lengkap..."
                className="flex min-h-[40px] w-full rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-zinc-200 dark:border-zinc-800"
            >
              Batal
            </Button>
            <Button type="submit" disabled={isPending} className="bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900">
              {isPending ? "Menyimpan..." : "Tambah"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
