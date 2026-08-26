"use client";

import { useState } from "react";
import { toggleInternalCustomerAction, deleteCustomerAction } from "@/actions/customer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Search, Trash2, User, Phone, ShieldCheck, History, Calendar, Edit } from "lucide-react";
import EditCustomerDialog from "@/components/customers/edit-customer-dialog";
import { useRouter } from "next/navigation";

interface Customer {
  id: string;
  name: string;
  phone: string;
  isInternalStock: boolean;
  createdAt: string;
  ticketCount: number;
}

interface CustomersClientProps {
  initialCustomers: Customer[];
}

export default function CustomersClient({ initialCustomers }: CustomersClientProps) {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [search, setSearch] = useState("");
  const [customerToEdit, setCustomerToEdit] = useState<Customer | null>(null);
  const router = useRouter();

  const filteredCustomers = customers.filter((c) => {
    const q = search.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.phone.includes(q);
  });

  const handleToggleInternal = async (id: string, currentVal: boolean) => {
    const newVal = !currentVal;
    
    // Optimistic Update
    setCustomers(customers.map((c) => (c.id === id ? { ...c, isInternalStock: newVal } : c)));

    const res = await toggleInternalCustomerAction(id, newVal);
    if (res.success) {
      toast.success("Status internal stock berhasil diubah");
    } else {
      // Revert if failed
      setCustomers(customers.map((c) => (c.id === id ? { ...c, isInternalStock: currentVal } : c)));
      toast.error(res.error || "Gagal mengubah status internal stock");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus pelanggan "${name}"?`)) return;

    const res = await deleteCustomerAction(id);
    if (res.success) {
      toast.success("Pelanggan berhasil dihapus");
      setCustomers(customers.filter((c) => c.id !== id));
    } else {
      toast.error(res.error || "Gagal menghapus pelanggan");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Direktori Customer
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Direktori data pelanggan beserta riwayat tiket service dan status internal stock.
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
        <Input
          type="text"
          placeholder="Cari pelanggan berdasarkan nama atau No HP..."
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
                <th scope="col" className="px-6 py-4">Nama Pelanggan</th>
                <th scope="col" className="px-6 py-4">Nomor HP</th>
                <th scope="col" className="px-6 py-4">Status</th>
                <th scope="col" className="px-6 py-4">Tanggal Register</th>
                <th scope="col" className="px-6 py-4">Riwayat Servis</th>
                <th scope="col" className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-zinc-400">
                    Tidak ada customer yang ditemukan.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-zinc-900 dark:text-zinc-50 flex items-center gap-1.5">
                        <User className="h-4 w-4 text-zinc-400" />
                        {customer.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs">
                      <div className="flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5 text-zinc-400" />
                        {customer.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleInternal(customer.id, customer.isInternalStock)}
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold transition-all border ${
                          customer.isInternalStock
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900 hover:bg-emerald-100 dark:hover:bg-emerald-900/40"
                            : "bg-zinc-50 text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                        }`}
                      >
                        <ShieldCheck className="h-3.5 w-3.5" />
                        {customer.isInternalStock ? "Internal Stock" : "Umum"}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-xs">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-zinc-400" />
                        {new Date(customer.createdAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-300">
                        <History className="h-3.5 w-3.5 text-zinc-400" />
                        <span className="font-semibold text-zinc-900 dark:text-zinc-50">
                          {customer.ticketCount}
                        </span>{" "}
                        Tiket
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setCustomerToEdit(customer)}
                          className="h-8 w-8 text-zinc-500 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400"
                          title="Edit Customer"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(customer.id, customer.name)}
                          className="h-8 w-8 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/20"
                          title="Hapus Customer"
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

      {customerToEdit && (
        <EditCustomerDialog
          key={customerToEdit.id}
          isOpen={!!customerToEdit}
          onOpenChange={(open) => !open && setCustomerToEdit(null)}
          customer={customerToEdit}
          onSuccess={() => {
            setCustomerToEdit(null);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}
