# Portfolio — M. Einstein Yudhistira (a.k.a AlbertIchal)

> **Catatan untuk Claude (atau siapapun yang membaca file ini):**
> File ini adalah dokumentasi hidup untuk project portofolio pribadi berbasis Next.js.
> Tujuannya supaya setiap kali owner project ini kembali dan minta bantuan update/fitur baru,
> cukup lampirkan README ini (+ file terkait) tanpa perlu menjelaskan ulang struktur/konsep
> project dari nol. Update bagian **"Progress & Status"** setiap kali ada perubahan besar.

---

## 1. Konsep Project

Portofolio pribadi bertema **Spider-Man**, dibangun dengan **Next.js (App Router) + TypeScript**.
Formatnya **scroll-based single page** dengan 5 "slide" full-screen yang saling menimpa
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
- **Grafis interaktif:** SVG manual (animasi jalan/panjat laba-laba, jaring lanyard di Slide 5),
  **WebGL custom shader** (efek dissolve/transisi foto mask↔face di Hero), Canvas 2D (jejak
  kursor / cursor trail)
- **Font:** Google Fonts via `next/font` (`Geist`, `Geist Mono`) di `layout.tsx`, plus
  `Big Shoulders Display` & `Archivo` didefinisikan sebagai CSS variable di `globals.css`
  (perlu dicek apakah sudah di-load resmi via `next/font` juga atau masih andalan fallback)

---

## 3. Struktur Folder

portfolio/
├── app/
│   ├── layout.tsx          # Root layout, load font Geist, metadata SEO
│   ├── page.tsx            # SLIDE 1 (Hero) — komponen utama Home()
│   ├── globals.css         # Variabel warna/font global (--paper, --ink, --display, dst) + reset
│   │
│   ├── Slide2.tsx          # SLIDE 2 — "The Journey So Far" (skills, tools, stats)
│   ├── slide2.css          # Style khusus Slide2
│   │
│   ├── Slide3.tsx          # SLIDE 3 — Timeline karier/edukasi (2023–2026)
│   ├── slide3.css           # Style khusus Slide3 (termasuk laba-laba yang jalan di rail timeline)
│   │
│   ├── Slide4.tsx          # SLIDE 4 — "Selected Work" (showcase project lain, bukan portofolio ini)
│   ├── slide4.css          # Style khusus Slide4 (card horizontal-scroll + overlay detail project)
│   │
│   ├── Slide5.tsx          # SLIDE 5 — "Let's build something" (ID card lanyard draggable + about + kontak)
│   ├── slide5.css          # Style khusus Slide5 (kartu ID, jaring/tali SVG, daftar kontak)
│   │
│   ├── Climber.tsx         # Komponen SVG animasi "Spider-Man memanjat benang"
│   │                       # dipakai sebagai transisi antar slide (dipasang di Slide2 & Slide3)
│   ├── climber.css         # Style Climber (posisi nempel di tepi atas slide, animasi swing)
│   │
│   └── slideUtils.ts       # Hook bersama: useFitTitle() — auto-resize font judul (h1/h2)
│                           # supaya selalu pas dengan lebar layar, dipakai Slide2, Slide3 & Slide5
│
├── public/
│   └── assets/
│       ├── face.webp           # Foto asli (wajah tanpa topeng) — dipakai di Hero WebGL & kartu ID Slide5
│       ├── mask.webp           # Foto bertopeng Spider-Man — dipakai di Hero WebGL
│       ├── spiderman-bg.jpg    # Wallpaper background Slide2
│       ├── web.webp            # Tekstur jaring untuk elemen pojok interaktif (draggable)
│       ├── spider.webp         # Ikon laba-laba kecil untuk elemen pojok interaktif
│       ├── logo.png            # Logo yang muncul di preloader
│       └── cv-einstein.pdf     # File CV yang di-download dari tombol "Download CV" di Slide5
│                                # ⚠️ Perlu dicek manual: pastikan file ini sudah ada, belum diverifikasi
│
├── AGENTS.md               # Bawaan scaffolding framework, belum dikonfirmasi isinya relevan/tidak
└── ...config files (next.config.ts, tsconfig.json, eslint, dst — standar Next.js)


**Catatan penting soal arsitektur:**
- Semua komponen slide **flat** langsung di dalam `app/`, tidak ada subfolder `components/`.
- `page.tsx` me-render `<Slide2 />`, `<Slide3 />`, `<Slide4 />`, dan `<Slide5 />` di bagian
  bawahnya — jadi kelimanya adalah **satu halaman scroll panjang**, bukan route terpisah.
  > ⚠️ Perlu dicek manual: pastikan `page.tsx` sudah meng-import & merender `<Slide5 />`.
- `Climber.tsx` adalah komponen bersama (shared) yang dipasang di dalam `Slide2` dan `Slide3`
  sebagai efek transisi, posisinya relatif terhadap `<section>` induknya (pakai `parentElement`).
  **Slide4 & Slide5 belum memakai `Climber`** (belum ada transisi panjat masuk ke slide-slide ini).
- `slideUtils.ts` (hook `useFitTitle`) juga shared, dipakai Slide2, Slide3, dan Slide5 untuk
  auto-sizing judul.

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
- Auto-fit ukuran font headline (`fitHeadline`) berdasarkan lebar layar.
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

### 4.3 Slide 3 — Timeline (`Slide3.tsx` + `slide3.css`)
- Timeline karier/edukasi 2023–2026, data di array `ITEMS` (mudah di-edit/tambah entri baru).
- Tiap item punya `kind`: `"main"` (card di tengah, biasanya event besar + `note` di sampingnya),
  `"left"` / `"right"` (card lebih kecil di kiri/kanan).
- Tahun berselang-seling kiri/kanan di desktop (index genap/ganjil), tapi konsisten rata kiri di
  mobile (breakpoint 899px).
- Ada laba-laba SVG kecil yang "berjalan" naik-turun rail tengah timeline mengikuti posisi scroll
  (arah `data-dir="up"/"down"` + animasi wiggle kaki saat bergerak).
- `Climber.tsx` juga dipasang di sini (transisi masuk dari Slide 2 → Slide 3).

### 4.4 Slide 4 — "Selected Work" (`Slide4.tsx` + `slide4.css`)
- Berbeda dari Slide2/3, slide ini **bukan bagian dari cerita "diri sendiri"** tapi showcase
  **project lain** yang pernah dibuat (di luar portofolio ini sendiri) — data project di array
  `PROJECTS` (id, name, stack, domain, readme). Gampang ditambah project baru tinggal push item baru ke array ini.
- Layout: **track horizontal-scroll** (card-card project berjejer ke samping, `scroll-snap`).
- Klik salah satu card → membuka **overlay detail project** (panel box di tengah layar dengan efek fade/scale yang bersih tanpa efek jaring-jaring).
- Overlay berisi: nama project, stack badge (`s4-chip`), deskripsi (`readme`), dan link keluar (`domain`) yang dibuka di tab baru.
- UX detail yang sudah ditangani: body scroll di-lock (`overflow: hidden`) selama overlay
  terbuka, bisa ditutup lewat tombol ✕ atau tombol `Escape`, dan ada fallback
  `prefers-reduced-motion` (animasi panel dimatikan, langsung tampil).
- **Project yang sudah didaftarkan saat ini:**
  1. **AlbertIchal Portfolio** — project ini sendiri (`albertichal.my.id`), Next.js + TypeScript + WebGL.
  2. **AlTrack** — aplikasi pencatat workout gym (`altrack.my.id`), Laravel + MySQL.
- `Slide4` **shared component yang dipakai ulang dari sini**: `useFitTitle` (dari `slideUtils.ts`)
  untuk judul "Selected Work." — sama seperti Slide2/Slide3.
- **Belum dipakai di Slide4:** komponen `Climber` (belum ada transisi panjat laba-laba masuk ke slide ini).

### 4.5 Slide 5 — "Let's build something" (`Slide5.tsx` + `slide5.css`)
- Slide penutup: statement "about" singkat + daftar kontak (WhatsApp, Instagram, Email, Download CV).
- **Kartu ID digantung pakai "lanyard" jaring laba-laba** (bukan garis lurus biasa) yang bisa
  **ditarik bebas ke segala arah** di desktop — ini bagian paling kompleks di slide ini, jadi
  didokumentasikan detail supaya gampang di-debug/lanjutin ke depan:
  - Kartu (`.s5-id-card`) di-drag pakai Pointer Events (`pointerdown/move/up/cancel`), bukan
    native HTML5 drag-and-drop (foto profil di dalamnya sengaja `draggable={false}` +
    `e.preventDefault()` di `onDown` biar gak ketabrak native image drag browser).
  - **Fisika gerak** pakai model gravitasi + tali elastis (bukan pegas generik):
    - Sumbu X: pegas lembut biasa kembali ke tengah, kekuatan tariknya dibatasi (`MAX_X_PULL`)
      biar gak ekstrem kalau ditarik jauh.
    - Sumbu Y: kalau tali **kendor** (`currentY < 0`, kartu di atas posisi diam) → jatuh bebas
      kena gravitasi (`GRAVITY`) doang, gak ada tarikan. Begitu tali **kenceng**
      (`currentY >= 0`) → gaya pegas elastis (`SPRING_K`, dibatasi `MAX_Y_PULL`) + damping
      (`SPRING_DAMPING`) mulai narik balik, jadi mantul-mantul dulu sebelum diam.
    - Target drag (`targetX/targetY`) di-clamp ke rentang tertentu di `onMove` supaya tali gak
      "diregangkan" tanpa batas.
    - **Penting:** `targetX/targetY` di-reset ke posisi kartu saat ini setiap `onDown` — kalau
      lupa di-reset, target lama nyangkut dan kartu bisa keliatan "geser sendiri" pas cuma
      diklik tanpa digeser (bug yang pernah kejadian & sudah diperbaiki).
  - **Jaring/tali digambar pakai SVG** (`buildWebPath()`), dihitung ulang tiap frame dari posisi
    kartu (bukan div yang di-`rotate()`) — beberapa helai (`SPOKE_FRACS`) yang gak simetris +
    beberapa "cincin" penyilang yang jaggy (`CROSS_FRACS`/`CROSS_JITTER`) + 2 helai putus pendek,
    biar kesannya jaring beneran robek-robek, bukan pola geometris rapi.
  - Ada efek **"slack"**: kalau jarak kartu ke titik jangkar lebih pendek dari panjang tali
    alaminya (misal ditarik ke atas), helainya otomatis melengkung turun bikin loop longgar.
  - Titik jangkar tali diukur otomatis (`getComputedStyle` pada `.s5-inner` & `--lanyard-length`)
    supaya tali **mulai dari paling atas Slide 5** (bukan cuma dari atas kartu), dan otomatis
    nyesuain kalau ukuran layar berubah (ada listener `resize`).
  - `.s5-lanyard` diberi `z-index` tinggi supaya kartu+jaring **selalu di lapisan paling depan**,
    gak ketutup kolom teks/kontak di sebelahnya kalau ditarik ke area situ.
  - Di **mobile** (breakpoint 899px), drag dimatikan total (kartu statis) karena gesture drag di
    tengah alur scroll gampang rebutan sama scroll halaman — jaring tetap digambar sekali di
    posisi diam biar gak kosong.
- `Slide5` **shared component yang dipakai ulang dari sini**: `useFitTitle` (dari `slideUtils.ts`)
  untuk judul "Let's build something." — sama seperti Slide2/Slide3/Slide4.
- **Belum dipakai di Slide5:** komponen `Climber` (belum ada transisi panjat laba-laba masuk ke
  slide ini).
- **TODO dari owner:** nomor WhatsApp (`wa.me/62XXXXXXXXXX`), handle Instagram (`@username`),
  dan link download CV (`/assets/cv-einstein.pdf`) di array `CONTACTS` masih placeholder/perlu
  dicek — belum diganti dengan data asli.

### 4.6 Komponen/Utility Bersama
- **`Climber.tsx`**: figur Spider-Man SVG sederhana dengan animasi `<animate>` native SVG.
- **`slideUtils.ts` → `useFitTitle`**: hook generik untuk auto-resize font judul (`h2` dengan
  `<span>` di dalamnya) supaya selalu proporsional terhadap lebar layar.

---

## 5. Progress & Status

> Update bagian ini tiap ada perubahan berarti — supaya konteks selalu fresh.

**Status umum:** ✅ Fungsional secara keseluruhan (dianggap "selesai" untuk versi saat ini).

| Bagian | Status | Catatan |
|---|---|---|
| Slide 1 (Hero) | ✅ Selesai | WebGL + fallback jalan, preloader jalan |
| Slide 2 (Journey) | ✅ Selesai (konten sementara) | Teks `LEDE` masih placeholder, perlu ditulis ulang |
| Slide 3 (Timeline) | ✅ Selesai | Data timeline bisa terus ditambah seiring waktu |
| Slide 4 (Selected Work) | ✅ Selesai | Card horizontal-scroll + panel detail bersih (efek jaring ditiadakan) |
| Slide 5 (Let's build something) | ✅ Selesai (kontak masih placeholder) | Lanyard draggable + fisika gravitasi/elastis + jaring SVG sudah matang lewat beberapa iterasi bugfix; nomor WA/IG/CV di `CONTACTS` masih perlu diganti data asli |
| Climber (transisi) | ⚠️ Parsial | Dipasang di Slide2 & Slide3, **belum** di Slide4 & Slide5 |
| Responsif mobile | ✅ Sudah ditangani (Slide1–3, Slide5) | Slide4 pakai scroll-snap horizontal; Slide5 kartu dibuat statis di mobile |
| `AGENTS.md` | ❓ Belum dikonfirmasi | Kemungkinan bawaan scaffolding, isi belum direview |

**Riwayat perubahan terakhir:**
- Implementasi Hero WebGL dissolve + hit-map alpha.
- Slide2 & Slide3 dengan sistem `Climber` transisi antar-slide.
- `useFitTitle` diekstrak jadi hook bersama di `slideUtils.ts`.
- Project live/deployed di **albertichal.my.id**.
- Penambahan `Slide4.tsx` (showcase project **AlbertIchal Portfolio** & **AlTrack**) dengan
  desain card horizontal-scroll dan modal detail yang bersih tanpa efek jaring.
- **[Terbaru]** Penambahan `Slide5.tsx` (about statement + daftar kontak + kartu ID lanyard
  draggable). Melalui beberapa iterasi perbaikan: (1) fix arah tali yang kebalik karena bug tanda
  di `atan2`/`rotate()` — diganti pendekatan SVG path yang dihitung langsung dari posisi kartu;
  (2) jaring dibikin lebih "berantakan" (banyak helai gak simetris + cincin jaggy + helai putus);
  (3) jaring dipanjangin supaya mulai dari paling atas section (bukan cuma atas kartu), dan diberi
  z-index tinggi biar gak ketutup teks; (4) drag dibebasin ke segala arah termasuk ke atas, dengan
  efek tali "kendor" (slack) kalau ditarik mendekati/lewat titik jangkar; (5) fisika direname jadi
  model gravitasi + tali elastis (jatuh natural + mantul teredam saat tali kenceng), plus fix bug
  "meledak ke atas" (gaya pegas gak dibatasi) dan bug "geser sendiri saat diklik" (target drag lama
  gak direset di `onDown`).

---

## 6. Cara Pakai README Ini untuk Update ke Depan

Saat mau minta bantuan Claude/AI untuk lanjutin/ubah project ini:
1. Lampirkan README ini di awal chat.
2. Lampirkan **hanya file yang relevan** dengan perubahan yang diminta.
3. Kalau ada file baru/dihapus atau keputusan desain baru, **update bagian struktur folder & progress di atas**.