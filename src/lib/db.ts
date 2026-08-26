/**
 * Prisma Client Singleton
 *
 * Menggunakan pattern singleton agar Prisma Client tidak
 * membuat koneksi baru setiap kali hot-reload di development.
 *
 * @see https://www.prisma.io/docs/guides/other/troubleshooting-orm/help-articles/nextjs-prisma-client-dev-practices
 */

// TODO: Uncomment setelah Prisma di-setup (Issue #02)
// import { PrismaClient } from "@prisma/client";
//
// const globalForPrisma = globalThis as unknown as {
//   prisma: PrismaClient | undefined;
// };
//
// export const db =
//   globalForPrisma.prisma ??
//   new PrismaClient({
//     log:
//       process.env.NODE_ENV === "development"
//         ? ["query", "error", "warn"]
//         : ["error"],
//   });
//
// if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;

export {};
