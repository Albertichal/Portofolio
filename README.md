# Portfolio — M. Einstein Yudhistira (a.k.a AlbertIchal)

> **Catatan untuk Claude (atau siapapun yang membaca file ini):**
> File ini adalah dokumentasi hidup untuk project portofolio pribadi berbasis Next.js.
> Tujuannya supaya setiap kali owner project ini kembali dan minta bantuan update/fitur baru,
> cukup lampirkan README ini (+ file terkait) tanpa perlu menjelaskan ulang struktur/konsep
> project dari nol. Update bagian **"Progress & Status"** setiap kali ada perubahan besar.

---

## 1. Konsep Project

Portofolio pribadi bertema **Spider-Man**, dibangun dengan **Next.js (App Router) + TypeScript**.
Formatnya **scroll-based single page** dengan 3 "slide" full-screen yang saling menimpa
(stacking transition) saat di-scroll — bukan carousel/SPA router biasa.

Tone visual: dark mode, tipografi besar/bold ala poster (`Big Shoulders Display` untuk display,
`Archivo` untuk body text), aksen jaring laba-laba (web) dan animasi Spider-Man kecil
(disebut "Climber") yang memanjat benang di antara transisi slide.

**Bahasa kode/komentar:** campuran — komentar teknis di JS/CSS ditulis dalam **Bahasa Indonesia**
(karena itu bahasa kerja owner), tapi konten yang tampil ke user (headline, deskripsi, dsb)
dalam **Bahasa Inggris**.

---

## 2. Tech Stack

- **Framework:** Next.js (App Router, client components — hampir semua pakai `"use client"`)
- **Bahasa:** TypeScript (TSX)
- **Styling:** CSS murni per-komponen (file `.css` terpisah per slide), **tidak pakai Tailwind**
  meskipun "Tailwind CSS" disebut sebagai salah satu skill di konten Slide 2 (itu cuma teks/data,
  bukan tooling yang dipakai membangun situs ini)
- **Grafis interaktif:** SVG manual (animasi jalan/panjat laba-laba), **WebGL custom shader**
  (efek dissolve/transisi foto mask↔face di Hero), Canvas 2D (jejak kursor / cursor trail)
- **Font:** Google Fonts via `next/font` (`Geist`, `Geist Mono`) di `layout.tsx`, plus
  `Big Shoulders Display` & `Archivo` didefinisikan sebagai CSS variable di `globals.css`
  (perlu dicek apakah sudah di-load resmi via `next/font` juga atau masih andalan fallback)

---

## 3. Struktur Folder

```
portfolio/
├── app/
│   ├── layout.tsx        # Root layout, load font Geist, metadata SEO
│   ├── page.tsx          # SLIDE 1 (Hero) — komponen utama Home()
│   ├── globals.css       # Variabel warna/font global (--paper, --ink, --display, dst) + reset
│   │
│   ├── Slide2.tsx        # SLIDE 2 — "The Journey So Far" (skills, tools, stats)
│   ├── slide2.css        # Style khusus Slide2
│   │
│   ├── Slide3.tsx        # SLIDE 3 — Timeline karier/edukasi (2023–2026)
│   ├── slide3.css         # Style khusus Slide3 (termasuk laba-laba yang jalan di rail timeline)
│   │
│   ├── Climber.tsx       # Komponen SVG animasi "Spider-Man memanjat benang"
│   │                     # dipakai sebagai transisi antar slide (dipasang di Slide2 & Slide3)
│   ├── climber.css       # Style Climber (posisi nempel di tepi atas slide, animasi swing)
│   │
│   └── slideUtils.ts     # Hook bersama: useFitTitle() — auto-resize font judul (h1/h2)
│                         # supaya selalu pas dengan lebar layar, dipakai Slide2 & Slide3
│
├── public/
│   └── assets/
│       ├── face.webp          # Foto asli (wajah tanpa topeng) — dipakai di Hero WebGL
│       ├── mask.webp          # Foto bertopeng Spider-Man — dipakai di Hero WebGL
│       ├── spiderman-bg.jpg   # Wallpaper background Slide2
│       ├── web.webp           # Tekstur jaring untuk elemen pojok interaktif (draggable)
│       ├── spider.webp        # Ikon laba-laba kecil untuk elemen pojok interaktif
│       └── logo.png           # Logo yang muncul di preloader
│
├── AGENTS.md             # Bawaan scaffolding framework, belum dikonfirmasi isinya relevan/tidak
└── ...config files (next.config.ts, tsconfig.json, eslint, dst — standar Next.js)
```

**Catatan penting soal arsitektur:**
- Semua komponen slide **flat** langsung di dalam `app/`, tidak ada subfolder `components/`.
- `page.tsx` me-render `<Slide2 />` dan `<Slide3 />` di bagian bawahnya — jadi ketiganya
  adalah **satu halaman scroll panjang**, bukan route terpisah.
- `Climber.tsx` adalah komponen bersama (shared) yang dipasang di dalam `Slide2` dan `Slide3`
  sebagai efek transisi, posisinya relatif terhadap `<section>` induknya (pakai `parentElement`).
- `slideUtils.ts` (hook `useFitTitle`) juga shared, dipakai Slide2 & Slide3 untuk auto-sizing judul.

---

## 4. Detail Per-Bagian

### 4.1 Slide 1 — Hero (`page.tsx` + `globals.css`)
- Preloader dengan animasi logo + jaring SVG yang "digambar" (stroke-dashoffset).
- Foto utama (`#stage`) pakai **WebGL custom shader** untuk efek dissolve antara `mask.webp`
  (bertopeng) dan `face.webp` (wajah asli), bisa di-toggle klik/tap.
- Ada **fallback non-WebGL**: kalau `getContext('webgl')` gagal, otomatis pakai `<img>` biasa
  dengan class `.nogl` / `.is-mask` untuk crossfade CSS.
- Efek "cursor trail": area yang pernah disentuh kursor/jari menampakkan sekilas foto sebaliknya
  (kalau lagi nampilin mask, area situ mengintip face, dan sebaliknya) — pakai canvas 2D kecil
  sebagai texture (`uTrail`) yang di-generate dari titik-titik "shard" acak.
- Hit-testing alpha channel foto (`buildHitMap`) supaya area transparan di sekitar foto **tidak**
  menangkap gesture (supaya swipe di area kosong tetap bisa scroll ke Slide 2 di mobile).
- 5 elemen "jaring pojok" (`.interactive-corner`) yang bisa di-drag dengan physics spring
  sederhana (kembali ke posisi semula setelah dilepas).
- Auto-fit ukuran font headline (`fitHeadline`) berdasarkan lebar layar — **ini logic terpisah**
  dari `useFitTitle` di `slideUtils.ts` (duplikat konsep, kalau mau di-refactor bisa disatukan).
- `.hero-wrap` diberi tinggi 150vh sebagai "jarak aman" scroll sebelum Slide 2 muncul (`.hero`
  itu sendiri `position: sticky`).

### 4.2 Slide 2 — "The Journey So Far" (`Slide2.tsx` + `slide2.css`)
- `position: sticky`, ditimpa oleh Slide 3 saat discroll lebih jauh.
- Konten: lede/bio singkat, daftar skill teknis dengan angka level, daftar tools AI yang dipakai
  (Claude, ChatGPT, Gemini) beserta perannya masing-masing, dan 1 statistik ("10 Projects shipped").
- Tinggi elemen di-observe (`ResizeObserver`) supaya kalau konten lebih tinggi dari layar (umum
  terjadi di mobile), posisi `top` disesuaikan negatif agar bagian bawah tetap terbaca sebelum
  Slide 3 datang.
- Ada `.s2-dwell` (spacer kosong tinggi 80vh) supaya Slide 2 "diam" dulu sebelum transisi ke Slide 3.
- **TODO/catatan dari komentar kode:** teks `LEDE` masih sementara (diambil dari situs referensi
  `ibnuhakim.id`), perlu diganti dengan tulisan sendiri.

### 4.3 Slide 3 — Timeline (`Slide3.tsx` + `slide3.css`)
- Timeline karier/edukasi 2023–2026, data di array `ITEMS` (mudah di-edit/tambah entri baru).
- Tiap item punya `kind`: `"main"` (card di tengah, biasanya event besar + `note` di sampingnya),
  `"left"` / `"right"` (card lebih kecil di kiri/kanan).
- Tahun berselang-seling kiri/kanan di desktop (index genap/ganjil), tapi konsisten rata kiri di
  mobile (breakpoint 899px).
- Ada laba-laba SVG kecil yang "berjalan" naik-turun rail tengah timeline mengikuti posisi scroll
  (arah `data-dir="up"/"down"` + animasi wiggle kaki saat bergerak).
- `Climber.tsx` juga dipasang di sini (transisi masuk dari Slide 2 → Slide 3).

### 4.4 Komponen/Utility Bersama
- **`Climber.tsx`**: figur Spider-Man SVG sederhana (kaki, badan, kepala+topeng, lengan)
  dengan animasi `<animate>` native SVG (bukan CSS keyframes) untuk gerakan panjat kaki/tangan
  bergantian. Posisi & panjang "benang" (`--len`) dihitung on-scroll berdasarkan jarak section
  induk ke tepi atas layar.
- **`slideUtils.ts` → `useFitTitle`**: hook generik untuk auto-resize font judul (`h2` dengan
  `<span>` di dalamnya) supaya selalu proporsional terhadap lebar layar, beda rasio untuk
  desktop (≥900px) vs mobile.

---

## 5. Progress & Status

> Update bagian ini tiap ada perubahan berarti — supaya konteks selalu fresh.

**Status umum:** ✅ Fungsional secara keseluruhan (dianggap "selesai" untuk versi saat ini),
kemungkinan masih akan ada polish/estetika lanjutan, bukan perubahan struktural besar.

| Bagian | Status | Catatan |
|---|---|---|
| Slide 1 (Hero) | ✅ Selesai | WebGL + fallback jalan, preloader jalan |
| Slide 2 (Journey) | ✅ Selesai (konten sementara) | Teks `LEDE` masih placeholder dari situs lain, perlu ditulis ulang |
| Slide 3 (Timeline) | ✅ Selesai | Data timeline bisa terus ditambah seiring waktu |
| Climber (transisi) | ✅ Selesai | Dipasang di Slide2 & Slide3 |
| Responsif mobile | ✅ Sudah ditangani | Banyak logic touch-action khusus supaya scroll tidak "kebajak" oleh elemen interaktif |
| `AGENTS.md` | ❓ Belum dikonfirmasi | Kemungkinan bawaan scaffolding, isi belum direview |

**Riwayat perubahan terakhir yang diketahui (dari kode yang dilampirkan):**
- Implementasi awal Hero dengan WebGL dissolve + hit-map alpha untuk touch handling.
- Slide2 & Slide3 dengan sistem `Climber` sebagai transisi antar-slide.
- `useFitTitle` diekstrak jadi hook bersama di `slideUtils.ts`.

---

## 6. Cara Pakai README Ini untuk Update ke Depan

Saat mau minta bantuan Claude untuk lanjutin/ubah project ini:
1. Lampirkan README ini di awal chat.
2. Lampirkan **hanya file yang relevan** dengan perubahan yang diminta (tidak perlu semua file
   tiap kali) — README ini sudah cukup untuk kasih gambaran struktur besar & konteks komponen lain.
3. Kalau ada file baru/dihapus/dipindah, atau ada keputusan desain baru, **update bagian struktur
   folder & progress di atas** supaya dokumentasi ini tetap akurat.
4. Sebutkan status terbaru di bagian "Progress & Status" tiap kali fitur besar selesai.

---

## 7. Hal yang Masih Perlu Dikonfirmasi/Diputuskan

- Isi & relevansi `AGENTS.md`.
- Apakah `fitHeadline` di `page.tsx` mau di-refactor pakai `useFitTitle` dari `slideUtils.ts`
  supaya tidak duplikat logic.
- Teks final untuk `LEDE` di Slide 2 (masih placeholder).
- Apakah font `Big Shoulders Display` & `Archivo` sudah di-load resmi (mis. via `next/font/google`)
  atau masih mengandalkan fallback sistem — belum terlihat di kode yang dilampirkan.