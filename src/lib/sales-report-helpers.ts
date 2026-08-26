import { SalesReportTicketItem } from "@/actions/sales-report";

// Clean vendor name: Penanda BDG, JKT, OTHER dibersihkan dari nama vendor
const cleanVendorName = (name: string): string => {
  return name.replace(/\s+(BDG|JKT|OTHER)\b/gi, "").trim();
};

const formatDateToShort = (dateInput: Date | string | null): string => {
  if (!dateInput) return "-";
  const date = new Date(dateInput);
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yy = String(date.getFullYear()).slice(-2);
  return `${dd}/${mm}/${yy}`;
};

const formatDateToHeader = (dateStr: string): string => {
  const [year, month, day] = dateStr.split("-");
  return `${day}-${month}-${year}`;
};

export function generateSalesReportText(
  dateStr: string,
  section1: SalesReportTicketItem[],
  section2: SalesReportTicketItem[],
  section3: SalesReportTicketItem[],
  section4: SalesReportTicketItem[]
): string {
  let text = "";
  const headerDate = formatDateToHeader(dateStr);

  // 1. SECTION 1: GARANSIAN SELESAI [DD-MM-YYYY] (STOK BCT/GHITP)
  text += `*GARANSIAN SELESAI ${headerDate} (STOK BCT/GHITP)*\n\n`;

  if (section1.length === 0) {
    text += "Tidak ada barang.\n\n";
  } else {
    const grouped1: { [vendorName: string]: SalesReportTicketItem[] } = {};
    for (const item of section1) {
      const vName = item.vendor ? item.vendor.name : "Tanpa Vendor";
      if (!grouped1[vName]) grouped1[vName] = [];
      grouped1[vName].push(item);
    }

    const sortedVendors = Object.keys(grouped1).sort();
    for (const vName of sortedVendors) {
      const cleaned = cleanVendorName(vName);
      text += `*${cleaned.toUpperCase()}*\n`;
      grouped1[vName].forEach((item) => {
        const snLama = item.serialNumber ? item.serialNumber.toUpperCase() : "-";
        const snBaru = item.newSerialNumber ? item.newSerialNumber.toUpperCase() : "-";
        const catt = item.notes ? item.notes.toUpperCase() : "-";

        text += `${item.deviceName.toUpperCase()}\n`;
        text += `├─ S/N Lama: ${snLama}\n`;
        text += `├─ S/N Baru: ${snBaru}\n`;
        text += `└─ Catt: ${catt}\n`;
      });
      text += "\n";
    }
  }

  // 2. SECTION 2: GARANSIAN DI VENDOR BDG (STOK BCT/GHITP)
  text += "*GARANSIAN DI VENDOR BDG (STOK BCT/GHITP)*\n";
  if (section2.length === 0) {
    text += "Tidak ada barang.\n\n";
  } else {
    const grouped2: { [vendorName: string]: SalesReportTicketItem[] } = {};
    for (const item of section2) {
      const vName = item.vendor ? item.vendor.name : "Tanpa Vendor";
      if (!grouped2[vName]) grouped2[vName] = [];
      grouped2[vName].push(item);
    }

    const sortedVendors = Object.keys(grouped2).sort();
    for (const vName of sortedVendors) {
      const cleaned = cleanVendorName(vName);
      text += `*${cleaned.toUpperCase()}*\n`;
      grouped2[vName].forEach((item) => {
        const sentDateFormatted = formatDateToShort(item.vendorSentDate);
        const sn = item.serialNumber ? item.serialNumber.toUpperCase() : "-";
        const keluhan = item.complaint ? item.complaint.toUpperCase() : "-";
        const catt = item.notes ? item.notes.toUpperCase() : "-";

        text += `${sentDateFormatted}\n`;
        text += `${item.deviceName.toUpperCase()}\n`;
        text += `├─ S/N: ${sn}\n`;
        text += `├─ Keluhan: ${keluhan}\n`;
        text += `└─ Catt: ${catt}\n`;
      });
      text += "\n";
    }
  }

  // 3. SECTION 3: GARANSIAN DI VENDOR JKT (STOK BCT/GHITP)
  text += "*GARANSIAN DI VENDOR JKT (STOK BCT/GHITP)*\n";
  if (section3.length === 0) {
    text += "Tidak ada barang.\n\n";
  } else {
    const grouped3: { [vendorName: string]: SalesReportTicketItem[] } = {};
    for (const item of section3) {
      const vName = item.vendor ? item.vendor.name : "Tanpa Vendor";
      if (!grouped3[vName]) grouped3[vName] = [];
      grouped3[vName].push(item);
    }

    const sortedVendors = Object.keys(grouped3).sort();
    for (const vName of sortedVendors) {
      const cleaned = cleanVendorName(vName);
      text += `*${cleaned.toUpperCase()}*\n`;
      grouped3[vName].forEach((item) => {
        const sentDateFormatted = formatDateToShort(item.vendorSentDate);
        const sn = item.serialNumber ? item.serialNumber.toUpperCase() : "-";
        const keluhan = item.complaint ? item.complaint.toUpperCase() : "-";
        const catt = item.notes ? item.notes.toUpperCase() : "-";

        text += `${sentDateFormatted}\n`;
        text += `${item.deviceName.toUpperCase()}\n`;
        text += `├─ S/N: ${sn}\n`;
        text += `├─ Keluhan: ${keluhan}\n`;
        text += `└─ Catt: ${catt}\n`;
      });
      text += "\n";
    }
  }

  // DIVIDER
  text += "--------------------------------------------------\n";
  text += "--------------------------------------------------\n\n";

  // 4. SECTION 4: GARANSIAN BELUM DIPROSES (STOK BCT/GHITP)
  text += "*GARANSIAN BELUM DIPROSES (STOK BCT/GHITP)*\n\n";
  if (section4.length === 0) {
    text += "Tidak ada barang.\n";
  } else {
    const grouped4: { [vendorName: string]: SalesReportTicketItem[] } = {};
    for (const item of section4) {
      const vName = item.vendor ? item.vendor.name : "Tanpa Vendor";
      if (!grouped4[vName]) grouped4[vName] = [];
      grouped4[vName].push(item);
    }

    const sortedVendors = Object.keys(grouped4).sort();
    for (const vName of sortedVendors) {
      const cleaned = cleanVendorName(vName);
      text += `*${cleaned.toUpperCase()}*\n`;
      grouped4[vName].forEach((item) => {
        const sn = item.serialNumber ? item.serialNumber.toUpperCase() : "-";
        const keluhan = item.complaint ? item.complaint.toUpperCase() : "-";
        const catt = item.notes ? item.notes.toUpperCase() : "-";

        text += `${item.deviceName.toUpperCase()}\n`;
        text += `├─ S/N: ${sn}\n`;
        text += `├─ Keluhan: ${keluhan}\n`;
        text += `└─ Catt: ${catt}\n`;
      });
      text += "\n";
    }
  }

  return text.trim();
}
