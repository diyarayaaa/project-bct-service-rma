import { ReportTicketItem } from "@/actions/report";

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

export function generateOperationalReportText(
  dateStr: string,
  block1: ReportTicketItem[],
  block2: ReportTicketItem[],
  block3: ReportTicketItem[],
  block4: ReportTicketItem[] = []
): string {
  let text = "";

  // 1. BLOCK 1: BARANG KE BANDUNG [TGL HARI INI]
  const headerDate = formatDateToHeader(dateStr);
  text += `*BARANG KE BANDUNG ${headerDate}*\n\n`;

  if (block1.length === 0) {
    text += "Tidak ada barang.\n\n";
  } else {
    const groupedBlock1: { [vendorName: string]: ReportTicketItem[] } = {};
    for (const item of block1) {
      const vName = item.vendor ? item.vendor.name : "Tanpa Vendor";
      if (!groupedBlock1[vName]) {
        groupedBlock1[vName] = [];
      }
      groupedBlock1[vName].push(item);
    }

    const sortedVendors = Object.keys(groupedBlock1).sort();
    for (const vName of sortedVendors) {
      const cleanedVName = cleanVendorName(vName);
      text += `*${cleanedVName.toUpperCase()}*\n`;
      const items = groupedBlock1[vName];
      items.forEach((item) => {
        const userDisplay = item.customer.isInternalStock ? "STOCK BCT" : item.customer.name;
        const notesDisplay = item.notes ? item.notes.toUpperCase() : "-";
        
        text += `${item.deviceName.toUpperCase()}\n`;
        text += `├─ S/N: ${item.serialNumber.toUpperCase()}\n`;
        text += `├─ KELUHAN: ${item.complaint.toUpperCase()}\n`;
        text += `├─ USER: ${userDisplay}\n`;
        text += `└─ CATT: ${notesDisplay}\n`;
      });
      text += "\n";
    }
  }

  // 2. BLOCK 2: BARANG DI VENDOR BDG
  text += "*BARANG DI VENDOR BDG*\n";
  if (block2.length === 0) {
    text += "Tidak ada barang.\n\n";
  } else {
    const groupedBlock2: { [vendorName: string]: ReportTicketItem[] } = {};
    for (const item of block2) {
      const vName = item.vendor ? item.vendor.name : "Tanpa Vendor";
      if (!groupedBlock2[vName]) {
        groupedBlock2[vName] = [];
      }
      groupedBlock2[vName].push(item);
    }

    const sortedVendors = Object.keys(groupedBlock2).sort();
    for (const vName of sortedVendors) {
      const cleanedVName = cleanVendorName(vName);
      text += `*${cleanedVName.toUpperCase()}*\n`;
      const items = groupedBlock2[vName];
      items.forEach((item) => {
        const sentDateFormatted = formatDateToShort(item.vendorSentDate);
        const userDisplay = item.customer.isInternalStock ? "STOK" : item.customer.name;
        const notesDisplay = item.notes ? item.notes.toUpperCase() : "-";

        text += `${sentDateFormatted}\n`;
        text += `${item.deviceName.toUpperCase()}\n`;
        text += `├─ S/N: ${item.serialNumber.toUpperCase()}\n`;
        text += `├─ Keluhan: ${item.complaint.toUpperCase()}\n`;
        text += `├─ USER: ${userDisplay}\n`;
        text += `└─ Catt: ${notesDisplay}\n`;
      });
      text += "\n";
    }
  }

  // 3. BLOCK 3: BARANG DI VENDOR JKT
  text += "*BARANG DI VENDOR JKT*\n";
  if (block3.length === 0) {
    text += "Tidak ada barang.\n\n";
  } else {
    const groupedBlock3: { [vendorName: string]: ReportTicketItem[] } = {};
    for (const item of block3) {
      const vName = item.vendor ? item.vendor.name : "Tanpa Vendor";
      if (!groupedBlock3[vName]) {
        groupedBlock3[vName] = [];
      }
      groupedBlock3[vName].push(item);
    }

    const sortedVendors = Object.keys(groupedBlock3).sort();
    for (const vName of sortedVendors) {
      const cleanedVName = cleanVendorName(vName);
      text += `*${cleanedVName.toUpperCase()}*\n`;
      const items = groupedBlock3[vName];
      items.forEach((item) => {
        const sentDateFormatted = formatDateToShort(item.vendorSentDate);
        const userDisplay = item.customer.isInternalStock ? "STOK" : item.customer.name;
        const notesDisplay = item.notes ? item.notes.toUpperCase() : "-";

        text += `${sentDateFormatted}\n`;
        text += `${item.deviceName.toUpperCase()}\n`;
        text += `├─ S/N: ${item.serialNumber.toUpperCase()}\n`;
        text += `├─ Keluhan: ${item.complaint.toUpperCase()}\n`;
        text += `├─ USER: ${userDisplay}\n`;
        text += `└─ Catt: ${notesDisplay}\n`;
      });
      text += "\n";
    }
  }

  // 4. BLOCK 4: GARANSIAN BELUM DIPROSES
  text += "*GARANSIAN BELUM DIPROSES*\n";
  if (block4.length === 0) {
    text += "Tidak ada barang.\n";
  } else {
    const groupedBlock4: { [vendorName: string]: ReportTicketItem[] } = {};
    for (const item of block4) {
      const vName = item.vendor ? item.vendor.name : "Tanpa Vendor";
      if (!groupedBlock4[vName]) {
        groupedBlock4[vName] = [];
      }
      groupedBlock4[vName].push(item);
    }

    const sortedVendors = Object.keys(groupedBlock4).sort();
    for (const vName of sortedVendors) {
      const cleanedVName = cleanVendorName(vName);
      text += `*${cleanedVName.toUpperCase()}*\n`;
      const items = groupedBlock4[vName];
      items.forEach((item) => {
        const userDisplay = item.customer.isInternalStock ? "STOK" : item.customer.name;
        const notesDisplay = item.notes ? item.notes.toUpperCase() : "-";

        text += `${item.deviceName.toUpperCase()}\n`;
        text += `├─ S/N: ${item.serialNumber.toUpperCase()}\n`;
        text += `├─ Keluhan: ${item.complaint.toUpperCase()}\n`;
        text += `├─ USER: ${userDisplay}\n`;
        text += `└─ Catt: ${notesDisplay}\n`;
      });
      text += "\n";
    }
  }

  return text.trim();
}
