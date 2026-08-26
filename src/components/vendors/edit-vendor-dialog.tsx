"use client";

import { useState, useTransition } from "react";
import { updateVendorAction } from "@/actions/vendor";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2, Edit } from "lucide-react";

interface VendorToEdit {
  id: string;
  name: string;
  aliasCode: string | null;
  location: "BDG" | "JKT" | "OTHER";
  address: string | null;
  contactPerson: string | null;
  phone: string | null;
}

interface EditVendorDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  vendor: VendorToEdit;
  onSuccess?: () => void;
}

export default function EditVendorDialog({
  isOpen,
  onOpenChange,
  vendor,
  onSuccess,
}: EditVendorDialogProps) {
  const [name, setName] = useState(vendor.name);
  const [aliasCode, setAliasCode] = useState(vendor.aliasCode || "");
  const [location, setLocation] = useState<"BDG" | "JKT" | "OTHER">(vendor.location);
  const [address, setAddress] = useState(vendor.address || "");
  const [contactPerson, setContactPerson] = useState(vendor.contactPerson || "");
  const [phone, setPhone] = useState(vendor.phone || "");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !location) {
      toast.error("Nama vendor dan lokasi wajib diisi.");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("aliasCode", aliasCode);
    formData.append("location", location);
    formData.append("address", address);
    formData.append("contactPerson", contactPerson);
    formData.append("phone", phone);

    startTransition(async () => {
      const res = await updateVendorAction(vendor.id, null, formData);
      if (res.success) {
        toast.success(`Data vendor "${name}" berhasil diperbarui!`);
        onOpenChange(false);
        if (onSuccess) onSuccess();
      } else {
        toast.error(res.error || "Gagal mengedit vendor.");
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
        <DialogHeader className="p-6 pb-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
          <DialogTitle className="text-lg font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            <Edit className="h-5 w-5 text-indigo-500" />
            Edit Master Vendor
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="font-medium text-zinc-700 dark:text-zinc-300 block mb-1">Nama Vendor / Distributor *</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: AGRES ID BDG"
              className="h-9 text-xs"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="font-medium text-zinc-700 dark:text-zinc-300 block mb-1">Kode Alias (Opsional)</label>
              <Input
                value={aliasCode}
                onChange={(e) => setAliasCode(e.target.value)}
                placeholder="Contoh: AGRES"
                className="h-9 text-xs"
              />
            </div>
            <div>
              <label className="font-medium text-zinc-700 dark:text-zinc-300 block mb-1">Lokasi Vendor *</label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value as "BDG" | "JKT" | "OTHER")}
                className="flex h-9 w-full rounded-md border border-zinc-200 bg-white dark:bg-zinc-900 px-3 py-1 text-xs shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring dark:border-zinc-800 dark:text-zinc-50"
              >
                <option value="BDG">Bandung (BDG)</option>
                <option value="JKT">Jakarta (JKT)</option>
                <option value="OTHER">Lainnya (OTHER)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-medium text-zinc-700 dark:text-zinc-300 block mb-1">Alamat Lengkap</label>
            <Input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Alamat distributor..."
              className="h-9 text-xs"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="font-medium text-zinc-700 dark:text-zinc-300 block mb-1">Contact Person (PIC)</label>
              <Input
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                placeholder="Nama PIC vendor..."
                className="h-9 text-xs"
              />
            </div>
            <div>
              <label className="font-medium text-zinc-700 dark:text-zinc-300 block mb-1">No. HP Vendor</label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="08123456789"
                className="h-9 text-xs"
              />
            </div>
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
