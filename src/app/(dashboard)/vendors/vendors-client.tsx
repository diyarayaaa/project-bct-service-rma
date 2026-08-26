"use client";

import { useState, useTransition } from "react";
import { createVendorAction, updateVendorAction, deleteVendorAction } from "@/actions/vendor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Search, Edit, Trash2, MapPin, User, Phone, Building } from "lucide-react";

interface Vendor {
  id: string;
  name: string;
  aliasCode: string | null;
  location: "BDG" | "JKT" | "OTHER";
  address: string | null;
  contactPerson: string | null;
  phone: string | null;
  isActive: boolean;
}

interface VendorsClientProps {
  initialVendors: Vendor[];
}

export default function VendorsClient({ initialVendors }: VendorsClientProps) {
  const [vendors, setVendors] = useState<Vendor[]>(initialVendors);
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [isPending, startTransition] = useTransition();

  // Filter vendors based on search query
  const filteredVendors = vendors.filter((v) => {
    const q = search.toLowerCase();
    return (
      v.name.toLowerCase().includes(q) ||
      (v.aliasCode?.toLowerCase() || "").includes(q) ||
      v.location.toLowerCase().includes(q) ||
      (v.contactPerson?.toLowerCase() || "").includes(q)
    );
  });

  const handleOpenAddDialog = () => {
    setSelectedVendor(null);
    setIsDialogOpen(true);
  };

  const handleOpenEditDialog = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      let res;
      if (selectedVendor) {
        res = await updateVendorAction(selectedVendor.id, null, formData);
      } else {
        res = await createVendorAction(null, formData);
      }

      if (res.success && res.data) {
        toast.success(selectedVendor ? "Vendor berhasil diubah" : "Vendor berhasil ditambahkan");
        
        // Update local state
        const updated = res.data as Vendor;
        if (selectedVendor) {
          setVendors(vendors.map((v) => (v.id === updated.id ? updated : v)));
        } else {
          setVendors([updated, ...vendors]);
        }
        
        setIsDialogOpen(false);
      } else {
        toast.error(res.error || "Gagal menyimpan data vendor");
      }
    });
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus vendor "${name}"?`)) return;

    const res = await deleteVendorAction(id);
    if (res.success) {
      toast.success("Vendor berhasil dihapus");
      setVendors(vendors.filter((v) => v.id !== id));
    } else {
      toast.error(res.error || "Gagal menghapus vendor");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Daftar Vendor / Distributor
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Kelola data vendor untuk alih service, garansi, dan pengiriman barang.
          </p>
        </div>
        <Button onClick={handleOpenAddDialog} className="w-full sm:w-auto flex items-center gap-2 bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900">
          <Plus className="h-4 w-4" />
          Tambah Vendor
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
        <Input
          type="text"
          placeholder="Cari vendor, alias, lokasi, atau PIC..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
        />
      </div>

      {/* Table List */}
      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm text-zinc-500 dark:text-zinc-400">
            <thead className="bg-zinc-50 text-xs font-semibold uppercase text-zinc-700 dark:bg-zinc-900/50 dark:text-zinc-300 border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                <th scope="col" className="px-6 py-4">Nama Vendor / Alias</th>
                <th scope="col" className="px-6 py-4">Lokasi</th>
                <th scope="col" className="px-6 py-4">Kontak (PIC) & HP</th>
                <th scope="col" className="px-6 py-4">Alamat Lengkap</th>
                <th scope="col" className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {filteredVendors.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-zinc-400">
                    Tidak ada vendor yang cocok dengan pencarian Anda.
                  </td>
                </tr>
              ) : (
                filteredVendors.map((vendor) => (
                  <tr key={vendor.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-zinc-900 dark:text-zinc-50 flex items-center gap-1.5">
                        <Building className="h-4 w-4 text-zinc-400" />
                        {vendor.name}
                      </div>
                      {vendor.aliasCode && (
                        <div className="text-xs text-zinc-400 mt-0.5">Alias: {vendor.aliasCode}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${
                        vendor.location === "BDG"
                          ? "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 border border-blue-100 dark:border-blue-900"
                          : vendor.location === "JKT"
                          ? "bg-purple-50 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400 border border-purple-100 dark:border-purple-900"
                          : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700"
                      }`}>
                        {vendor.location}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs">
                      {vendor.contactPerson ? (
                        <div className="font-medium text-zinc-900 dark:text-zinc-200 flex items-center gap-1">
                          <User className="h-3 w-3 text-zinc-400" />
                          {vendor.contactPerson}
                        </div>
                      ) : (
                        <span className="text-zinc-400 italic">No PIC</span>
                      )}
                      {vendor.phone && (
                        <div className="text-zinc-500 dark:text-zinc-400 mt-1 flex items-center gap-1">
                          <Phone className="h-3 w-3 text-zinc-400" />
                          {vendor.phone}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs max-w-xs truncate" title={vendor.address || ""}>
                      {vendor.address ? (
                        <div className="flex items-start gap-1">
                          <MapPin className="h-3 w-3 text-zinc-400 mt-0.5 shrink-0" />
                          <span className="line-clamp-2">{vendor.address}</span>
                        </div>
                      ) : (
                        <span className="text-zinc-400 italic">Alamat belum diatur</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenEditDialog(vendor)}
                          className="h-8 w-8 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(vendor.id, vendor.name)}
                          className="h-8 w-8 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/20"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle className="text-zinc-900 dark:text-zinc-50">
                {selectedVendor ? "Ubah Data Vendor" : "Tambah Vendor Baru"}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4 text-sm">
              <div className="space-y-1">
                <label htmlFor="name" className="font-semibold text-zinc-700 dark:text-zinc-300">
                  Nama Vendor / Toko *
                </label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  required
                  defaultValue={selectedVendor?.name || ""}
                  placeholder="Contoh: PT. ASIA RAYA COM"
                  className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="aliasCode" className="font-semibold text-zinc-700 dark:text-zinc-300">
                    Alias Code
                  </label>
                  <Input
                    id="aliasCode"
                    name="aliasCode"
                    type="text"
                    defaultValue={selectedVendor?.aliasCode || ""}
                    placeholder="Contoh: ASIA RAYA"
                    className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="location" className="font-semibold text-zinc-700 dark:text-zinc-300">
                    Lokasi *
                  </label>
                  <select
                    id="location"
                    name="location"
                    defaultValue={selectedVendor?.location || "BDG"}
                    className="flex h-9 w-full rounded-md border border-zinc-200 bg-zinc-50 px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
                  >
                    <option value="BDG">BDG (Bandung)</option>
                    <option value="JKT">JKT (Jakarta)</option>
                    <option value="OTHER">OTHER (Luar Kota)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="contactPerson" className="font-semibold text-zinc-700 dark:text-zinc-300">
                    Nama Kontak (PIC)
                  </label>
                  <Input
                    id="contactPerson"
                    name="contactPerson"
                    type="text"
                    defaultValue={selectedVendor?.contactPerson || ""}
                    placeholder="Contoh: Pak Amin"
                    className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="phone" className="font-semibold text-zinc-700 dark:text-zinc-300">
                    No Telepon
                  </label>
                  <Input
                    id="phone"
                    name="phone"
                    type="text"
                    defaultValue={selectedVendor?.phone || ""}
                    placeholder="Contoh: 08123456789"
                    className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="address" className="font-semibold text-zinc-700 dark:text-zinc-300">
                  Alamat Lengkap (Untuk Label Kirim)
                </label>
                <textarea
                  id="address"
                  name="address"
                  rows={3}
                  defaultValue={selectedVendor?.address || ""}
                  placeholder="Masukkan alamat lengkap pengiriman distributor..."
                  className="flex min-h-[60px] w-full rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="border-zinc-200 dark:border-zinc-800"
              >
                Batal
              </Button>
              <Button type="submit" disabled={isPending} className="bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900">
                {isPending ? "Menyimpan..." : "Simpan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
