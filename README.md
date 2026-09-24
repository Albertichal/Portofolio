# Portfolio — M. Einstein Yudhistira (a.k.a AlbertIchal)

> **Catatan:** README ini fokus menjelaskan **struktur project**, supaya siapapun
> (termasuk Claude/AI) yang dilampirkan file ini bisa langsung tahu di mana harus
> mencari/menambah kode, tanpa perlu penjelasan ulang dari nol.

---

## 1. Ringkasan Project

Portofolio pribadi bertema **Spider-Man**, dibangun dengan **Next.js (App Router) + TypeScript**.
Formatnya **scroll-based single page**: satu route (`/`) berisi 5 "slide" full-screen yang
saling menimpa (stacking transition) saat di-scroll — bukan carousel/multi-route.

- **Bahasa kode/komentar:** komentar teknis di JS/CSS ditulis dalam **Bahasa Indonesia**
  (bahasa kerja owner); konten yang tampil ke user (headline, deskripsi) dalam **Bahasa Inggris**.
- **Styling:** CSS murni per-komponen, tidak pakai Tailwind meskipun tercantum di `package.json`
  (lihat catatan di bagian 4).

---

## 2. Tech Stack

| Bagian | Teknologi |
|---|---|
| Framework | Next.js (App Router), hampir semua komponen `"use client"` |
| Bahasa | TypeScript (TSX) |
| Styling | CSS biasa, satu file `.css` per komponen/slide |
| Grafis interaktif | SVG manual (animasi laba-laba/jaring), **WebGL custom shader** (dissolve foto di Hero), Canvas 2D (jejak kursor) |
| Font | `Geist` / `Geist Mono` via `next/font` di `layout.tsx`; `Big Shoulders Display` & `Archivo` sebagai CSS variable di `globals.css` |

---

## 3. Struktur Folder

```
Portofolio/
├── app/
│   ├── layout.tsx                     # Root layout: load font Geist, metadata SEO
│   ├── page.tsx                       # Route "/" — Slide 1 (Hero) + merender Slide2–5
│   ├── globals.css                    # Variabel warna/font global + reset + style Hero
│   ├── favicon.ico
│   │
│   ├── components/
│   │   ├── Climber/
│   │   │   ├── Climber.tsx            # Komponen SVG "Spider-Man memanjat benang"
│   │   │   └── climber.css            #   (transisi antar slide, dipakai di Slide2 & Slide3)
│   │   │
│   │   └── slides/
│   │       ├── Slide2/
│   │       │   ├── Slide2.tsx         # "The Journey So Far" — skills, tools, stats
│   │       │   └── slide2.css
│   │       ├── Slide3/
│   │       │   ├── Slide3.tsx         # Timeline karier/edukasi 2023–2026
│   │       │   └── slide3.css
│   │       ├── Slide4/
│   │       │   ├── Slide4.tsx         # "Selected Work" — showcase project lain
│   │       │   └── slide4.css
│   │       └── Slide5/
│   │           ├── Slide5.tsx         # "Let's build something" — ID card lanyard + kontak
│   │           └── slide5.css
│   │
│   └── lib/
│       └── slideUtils.ts              # Hook bersama useFitTitle() — auto-resize judul,
│                                       #   dipakai Slide2, Slide3, Slide4 & Slide5
│
├── public/
│   ├── assets/                        # Foto & aset pribadi (lihat isi folder langsung)
│   └── *.svg                          # Ikon bawaan scaffolding Next.js (belum dipakai)
│
├── AGENTS.md                          # Auto-generated oleh Next.js dev, bukan dokumentasi manual
└── ...config files (next.config.ts, tsconfig.json, eslint.config.mjs, postcss.config.mjs)
```

**Kenapa dikelompokkan begini:**
- `page.tsx` tetap di root `app/` karena itu **file route** Next.js (wajib bernama `page.tsx`
  di situ) — sekaligus berisi Slide 1 (Hero), yang paling erat dengan logic root.
- `components/Climber/` dipisah dari `components/slides/` karena `Climber` adalah komponen
  **shared** (dipakai ulang di beberapa slide), bukan bagian dari satu slide tertentu.
- Tiap slide punya folder sendiri (`Slide2/`, `Slide3/`, dst) berisi `.tsx` + `.css`-nya,
  supaya kalau nambah bagian baru di slide tertentu, semua filenya sudah satu tempat.
- `lib/` untuk hook/util yang dipakai lintas komponen (bukan spesifik satu slide).

**Alur render:** `page.tsx` → `<Slide2 />` → `<Slide3 />` → `<Slide4 />` → `<Slide5 />`,
kelimanya adalah satu halaman scroll panjang di route yang sama.

---

## 4. Hal yang Perlu Diketahui / Dicek

- **CV belum ada filenya:** tombol "Download CV" di Slide5 (`app/components/slides/Slide5/Slide5.tsx`)
  menunjuk ke `/assets/cv-einstein.pdf`, tapi file itu **belum ada** di `public/assets/`.
  Tombol akan 404 sampai file PDF-nya ditambahkan.
- **Tailwind terpasang tapi tidak aktif:** `tailwindcss` ada di `package.json` dan
  `postcss.config.mjs`, tapi tidak ada `@import "tailwindcss";` di file CSS manapun.
  Akibatnya class Tailwind di `layout.tsx` (`min-h-full`, `flex`, `flex-col`, `h-full`,
  `antialiased`) **tidak menghasilkan style apapun** saat ini. Kalau memang mau pakai
  Tailwind, tambahkan importnya; kalau tidak, class-class itu & dependency Tailwind bisa dilepas.
- **Climber belum dipasang di Slide4 & Slide5** — transisi panjat laba-laba baru ada di
  antara Slide2 → Slide3.
- **`AGENTS.md`** adalah file yang otomatis ditulis ulang oleh `next dev`, bukan dokumentasi
  yang perlu di-maintain manual.

---

## 5. Cara Pakai README Ini untuk Update ke Depan

1. Lampirkan README ini di awal chat.
2. Lampirkan **hanya file yang relevan** dengan perubahan yang diminta (cek path lewat
   struktur folder di atas).
3. Kalau ada file/folder baru, dipindah, atau dihapus, **update bagian struktur folder** di sini.
