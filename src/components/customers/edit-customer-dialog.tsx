"use client";

import { useState, useTransition } from "react";
import { updateCustomerAction } from "@/actions/customer";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2, Edit } from "lucide-react";

interface CustomerToEdit {
  id: string;
  name: string;
  phone: string;
  isInternalStock: boolean;
}

interface EditCustomerDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  customer: CustomerToEdit;
  onSuccess?: () => void;
}

export default function EditCustomerDialog({
  isOpen,
  onOpenChange,
  customer,
  onSuccess,
}: EditCustomerDialogProps) {
  const [name, setName] = useState(customer.name);
  const [phone, setPhone] = useState(customer.phone);
  const [isInternalStock, setIsInternalStock] = useState(customer.isInternalStock);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !phone.trim()) {
      toast.error("Nama customer dan nomor telepon wajib diisi.");
      return;
    }

    startTransition(async () => {
      const res = await updateCustomerAction(customer.id, {
        name,
        phone,
        isInternalStock,
      });

      if (res.success) {
        toast.success(`Data customer "${name}" berhasil diperbarui!`);
        onOpenChange(false);
        if (onSuccess) onSuccess();
      } else {
        toast.error(res.error || "Gagal mengedit customer.");
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
        <DialogHeader className="p-6 pb-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
          <DialogTitle className="text-lg font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            <Edit className="h-5 w-5 text-indigo-500" />
            Edit Master Customer
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="font-medium text-zinc-700 dark:text-zinc-300 block mb-1">Nama Customer *</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: ASEP -> ANDI"
              className="h-9 text-xs"
            />
          </div>

          <div>
            <label className="font-medium text-zinc-700 dark:text-zinc-300 block mb-1">No. Telepon / WA *</label>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="08123456789"
              className="h-9 text-xs"
            />
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <input
              type="checkbox"
              id="edit-isInternalStock"
              checked={isInternalStock}
              onChange={(e) => setIsInternalStock(e.target.checked)}
              className="h-4 w-4 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-900"
            />
            <label
              htmlFor="edit-isInternalStock"
              className="text-xs font-medium text-zinc-700 dark:text-zinc-300 cursor-pointer select-none"
            >
              Penanda Stok Internal Toko (STOCK BCT / GHITP)
            </label>
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
