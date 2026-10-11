# SpaceOS Design System & Direction

> Panduan arah desain resmi untuk SpaceOS, diformulasikan berdasarkan arahan pengguna.
> Dial: ENERGY 2 / RHYTHM 2 / MOTION 3

---

## 1. Identity & Personality (Karakter & Identitas)

* **Karakter Utama**: Teknis dan Presisi (Technical & Precision-Driven).
* **Filosofi**: Fungsionalitas dan kejernihan data di atas ornamen dekoratif. Setiap piksel, garis, dan angka memiliki tujuan analitis yang jelas.
* **Kesan Pengguna**: Terasa seperti kokpit analitik modern yang andal, tenang, dan responsif, baik saat menganalisis backtesting trading, menyusun jadwal mengajar, maupun mencatat jurnal harian.

---

## 2. Themes & Color Palette (Tema & Palet Warna)

Aplikasi mendukung Dark Mode sebagai tema utama dengan Light Mode yang dirawat setara dan memenuhi standar kontras WCAG AA (4.5:1 untuk teks normal).

### A. Dark Mode (Night Sky Theme - Utama)
* **Latar Belakang (Base Canvas)**: `#090D16` (Deep Night Void)
* **Permukaan Kartu & Panel (Surface)**: `#121826` (Night Slate)
* **Permukaan Terangkat (Elevated / Modal / Dropdown)**: `#1A2234`
* **Garis Pembatas (Border)**: `rgba(255, 255, 255, 0.08)` (subtle) / `rgba(56, 189, 248, 0.2)` (fokus/aktif)
* **Teks Utama (Headings & Values)**: `#F1F5F9` (High Contrast White)
* **Teks Sekunder (Labels & Metadata)**: `#94A3B8` (Slate Muted)
* **Warna Aksen Utama**: `#38BDF8` (Luminous Sky Blue untuk tombol aksi utama, indikator aktif, dan status penting)

### B. Light Mode (Clean Sky Theme - Pendukung)
* **Latar Belakang (Base Canvas)**: `#F8FAFC` (Pure Crisp Slate)
* **Permukaan Kartu & Panel (Surface)**: `#FFFFFF` (Pure White)
* **Permukaan Terangkat (Elevated / Modal / Dropdown)**: `#FFFFFF` dengan bayangan terukur `0 4px 20px rgba(0, 0, 0, 0.08)`
* **Garis Pembatas (Border)**: `#E2E8F0`
* **Teks Utama (Headings & Values)**: `#0F172A`
* **Teks Sekunder (Labels & Metadata)**: `#64748B`
* **Warna Aksen Utama**: `#0284C7` (Deep Sky Blue untuk keterbacaan kontras tinggi pada latar terang)

### C. Status & Semantic Colors
* **Positif / Profit**: `#10B981` (Emerald)
* **Negatif / Loss**: `#F43F5E` (Rose)
* **Peringatan / Pending**: `#F59E0B` (Amber)

---

## 3. Typography & Data Presentation (Tipografi & Data)

* **Font Antarmuka (Primary Sans)**: `Inter`, system-ui, -apple-system, sans-serif.
* **Font Angka & Analitik (Monospace)**: `JetBrains Mono`, monospace untuk nilai numerik, persentase profit/loss, ticker, tanggal, dan tabel analitik.
* **Tabular Numbers**: Seluruh angka keuangan dan statistik wajib menerapkan `font-variant-numeric: tabular-nums` agar lebar angka sejajar dan mudah dipindai mata.
* **Ikon**: Menggunakan ikon SVG vektor bergaris presisi (stroke 1.75px atau 2px). Dilarang menggunakan emoji mentah sebagai pengganti ikon antarmuka.

---

## 4. Layout & Spacing Density (Kepadatan Tampilan)

* **Density Level**: Balanced.
* **Struktur Halaman**:
  * Padding konten konsisten: 16px (mobile) hingga 24px (desktop).
  * Gap antar kartu informasi: 16px hingga 20px.
  * Border radius sistem: 8px (komponen kecil: tombol, input, badge) dan 12px (kontainer utama: kartu data, modal, panel).
* **Focal Point**: Setiap halaman harus memiliki satu kartu/area utama yang langsung menarik perhatian pertama (misal: grafik backtest utama atau ringkasan PnL), dengan elemen sekunder mengelilinginya secara tertib.
* **Sidebar**:
  * Mode penuh: 260px dengan struktur kategori modul yang jelas.
  * Mode ringkas (collapsed): 64px icon bar yang hemat ruang untuk memperluas area kerja data.

---

## 5. Motion & Tactile Interactions (Dial Level 3)

* **Dials**: `ENERGY 2 / RHYTHM 2 / MOTION 3`
* **Prinsip Gerakan**:
  * Animasi memiliki tujuan fungsional, bukan hiasan looping konstan (tanpa aurora acak, tanpa particle canvas berat, tanpa shimmer abadi).
  * Transisi instan dan taktil pada hover/active (150ms-200ms ease-out).
  * Expand/collapse panel dan sidebar menggunakan transisi cubic-bezier yang presisi (`cubic-bezier(0.2, 0, 0, 1)`).
  * Navigasi halaman menggunakan transisi halus yang tidak menggeser layout (fade transisi 150ms).
* **Aksesibilitas & Keyboard**:
  * Focus ring terlihat tajam saat menggunakan navigasi keyboard (`focus-visible:ring-2 focus-visible:ring-sky-500`).
  * Seluruh modal dan drawer wajib dapat ditutup dengan tombol `Escape`.
  * Dukungan Quick Search / Command Palette (`Ctrl+K` atau `Cmd+K`).
