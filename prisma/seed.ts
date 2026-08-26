import { PrismaClient } from "@prisma/client";
import { scryptSync, randomBytes } from "crypto";

const prisma = new PrismaClient();

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

async function main() {
  console.log("🌱 Starting seeder...");

  // 1. Seed Users
  console.log("Seeding Users...");
  const usersData = [
    { username: "wandi", fullName: "Wandi Aditya Putra", role: "TECHNICIAN" as const, password: "wandi123" },
    { username: "satryo", fullName: "Satryo", role: "TECHNICIAN" as const, password: "satryo123" },
    { username: "derida", fullName: "Derida", role: "TECHNICIAN" as const, password: "derida123" },
    { username: "anzar", fullName: "Anzar", role: "TECHNICIAN" as const, password: "anzar123" },
    { username: "admin", fullName: "Administrator", role: "ADMIN" as const, password: "password123" },
    { username: "sales", fullName: "Sales BCT", role: "SALES" as const, password: "password123" },
  ];

  for (const u of usersData) {
    const hashedPassword = hashPassword(u.password);
    await prisma.user.upsert({
      where: { username: u.username },
      update: {
        fullName: u.fullName,
        role: u.role,
        password: hashedPassword,
      },
      create: {
        username: u.username,
        fullName: u.fullName,
        role: u.role,
        password: hashedPassword,
      },
    });
  }

  // 2. Seed Vendors
  console.log("Seeding Vendors...");
  const vendorsData = [
    { name: "AGRES ID BDG", aliasCode: "AGRES ID", location: "BDG" as const },
    { name: "ASIA RAYA JKT", aliasCode: "ASIA RAYA", location: "JKT" as const },
    { name: "SC COMP JKT", aliasCode: "SC COMP", location: "JKT" as const },
    { name: "DTG BANDUNG BDG", aliasCode: "DTG", location: "BDG" as const },
    { name: "PAK AMIN (ELITE KOMPUTER)", aliasCode: "ELITE", location: "BDG" as const },
    { name: "CCK", aliasCode: "CCK", location: "JKT" as const },
    { name: "INTERAKSI CIPTA", aliasCode: "INTERAKSI", location: "JKT" as const },
    { name: "PT. ASIA GLOBAL SUKSESINDO (AGS)", aliasCode: "AGS", location: "JKT" as const },
  ];

  for (const v of vendorsData) {
    // We don't have a unique constraint on Vendor name in schema, but we can search by name to upsert manually
    const existing = await prisma.vendor.findFirst({
      where: { name: v.name },
    });

    if (existing) {
      await prisma.vendor.update({
        where: { id: existing.id },
        data: v,
      });
    } else {
      await prisma.vendor.create({
        data: v,
      });
    }
  }

  // 3. Seed Preset Customer Internal
  console.log("Seeding Internal Customers...");
  const internalCustomersData = [
    { name: "STOCK BCT", phone: "0800111222", isInternalStock: true },
    { name: "GHITP", phone: "0800111333", isInternalStock: true },
  ];

  for (const c of internalCustomersData) {
    const existing = await prisma.customer.findFirst({
      where: { name: c.name },
    });

    if (existing) {
      await prisma.customer.update({
        where: { id: existing.id },
        data: c,
      });
    } else {
      await prisma.customer.create({
        data: c,
      });
    }
  }

  // 4. Seed Preset Option Complaints
  console.log("Seeding Preset Options (Complaints)...");
  const complaintsData = [
    "Mati Total",
    "Lambat",
    "BSOD",
    "Fan Gak Nyala",
    "Panas Gak Normal",
    "Corrupt/No Detected",
    "Keyboard Eror",
    "Nyala Mati",
    "Cek Hardware",
  ];

  for (const label of complaintsData) {
    const existing = await prisma.presetOption.findFirst({
      where: { category: "COMPLAINT", label },
    });

    if (!existing) {
      await prisma.presetOption.create({
        data: {
          category: "COMPLAINT",
          label,
        },
      });
    }
  }

  console.log("🎉 Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
