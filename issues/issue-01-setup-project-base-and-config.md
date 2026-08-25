# 📌 Issue #01: Setup Project Base, Tech Stack, & Environment Configuration

## 🎯 Deskripsi
Inisialisasi repositori web application menggunakan stack modern Next.js (App Router), TypeScript, Tailwind CSS, serta konfigurasi environment dan tooling.

---

## 🛠️ Spesifikasi Teknis
- **Framework:** Next.js 14/15 (App Router) + TypeScript
- **Styling:** Tailwind CSS + Lucide Icons + `shadcn/ui` (atau Radix UI primitives)
- **State Management / Data Fetching:** React Server Components + Server Actions / TanStack Query (jika dibutuhkan)
- **Validation:** Zod
- **Environment Variables (`.env.example`):**
  - `DATABASE_URL` (PostgreSQL Connection String)
  - `NEXTAUTH_SECRET` / `AUTH_SECRET`
  - `WA_GATEWAY_API_URL` (Opsional untuk integrasi API WhatsApp)
  - `WA_GATEWAY_API_KEY` (Opsional)
  - `SALES_WHATSAPP_NUMBER` (Default: `6282120081484`)

---

## 📁 Struktur Folder yang Direkomendasikan
```text
src/
├── app/
│   ├── (auth)/
│   ├── (dashboard)/
│   │   ├── intake/
│   │   ├── tickets/
│   │   ├── vendors/
│   │   ├── shipments/
│   │   ├── reports/
│   │   └── page.tsx
│   ├── api/
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/
│   ├── forms/
│   ├── print/
│   └── shared/
├── lib/
│   ├── db.ts (Prisma client)
│   ├── utils.ts
│   ├── wa-formatter.ts
│   └── validations/
├── types/
└── actions/
```

---

## 📋 Acceptance Criteria
- [ ] Project Next.js terinisialisasi dengan struktur folder rapi (`/src/app`, `/src/components`, `/src/lib`, `/src/types`, `/src/actions`).
- [ ] Tailwind CSS dan komponen dasar UI (Button, Input, Card, Modal, Badge, Toast) terkonfigurasi.
- [ ] File `.env.example` tersedia dengan dokumentasi yang jelas.
- [ ] Build project (`npm run build`) berjalan sukses tanpa error TypeScript.
