# Context-Aware Smart Exam (Strict CBT Version) 🎓

Aplikasi Ujian Berbasis Komputer (CBT) cerdas yang dirancang menggunakan prinsip **Komputasi Pervasif (Pervasive Computing)**. Proyek ini dibangun sebagai prototipe sistem yang mengubah aplikasi web statis menjadi "pengawas virtual" yang peka terhadap kondisi fisik, fokus layar, dan integritas pengguna secara *real-time*. 

Sistem ini dilengkapi dengan antarmuka ganda: **Panel Ujian Siswa** dengan keamanan tingkat tinggi dan **Dashboard Guru** terintegrasi untuk manajemen peserta serta pelaporan evaluasi.

## 🌟 Fitur Unggulan: Keamanan & Pervasif (Sisi Siswa)

### 1. Sistem Verifikasi Database (DPT / Whitelist)
Keamanan tingkat institusi di gerbang login. Siswa tidak dapat mengakses soal ujian jika Nama dan NIM mereka tidak terdaftar di dalam *database* resmi yang diunggah oleh pengawas.
* **Smart Case-Insensitive:** Sistem kebal terhadap kesalahan format huruf besar/kecil saat siswa mengetikkan nama, selama susunan hurufnya sesuai dengan *database*.
* **Strict RegEx Validation:** Kolom NIM wajib diisi dengan format angka murni, dan Nama wajib menggunakan alfabet.

### 2. Auto-Disqualification & Strict Proctoring
Sistem menerapkan "3 Strikes Rule" (Maksimal 3 pelanggaran) sebelum siswa didiskualifikasi secara otomatis:
* **Window Blur Sensor:** Mendeteksi jika siswa kehilangan fokus dari peramban (misal: mengklik aplikasi kalkulator atau layar lain).
* **Tab Visibility Monitor:** Mendeteksi percobaan membuka atau berpindah ke tab *browser* lain.
* **Fullscreen Lock:** Siswa dipaksa masuk ke mode layar penuh. Keluar dari mode ini akan langsung dihitung sebagai pelanggaran.

### 3. Smart Presence Tracker (AFK 2 Tahap)
Menggunakan 5 titik sensor fisik (*mousemove, keydown, scroll, click, touchstart*) untuk mendeteksi kehadiran peserta.
* **Peringatan Dini:** Peringatan visual pada detik ke-10 jika tidak ada aktivitas fisik.
* **Auto-Pause & Lock:** Pada detik ke-15, sistem memblokir layar ujian dan **menjeda (pause)** waktu agar adil bagi siswa hingga mereka kembali beraktivitas.

### 4. Anti-Cheat Mechanics & Auto-Save
* **Pengacak Soal Dinamis:** Algoritma *Fisher-Yates* memastikan urutan soal setiap siswa selalu berbeda.
* **Anti Copy-Paste:** Menonaktifkan klik kanan dan pintasan penyalinan teks.
* **Auto-Save Recovery:** Menyimpan progres setiap detik. Ujian kebal terhadap risiko *force majeure* (peramban tertutup/mati listrik).

## 👨‍🏫 Fitur Unggulan: Administrasi (Sisi Guru)

### 1. Manajemen Database Peserta (DPT)
Guru dapat mengunggah file Excel (format `.csv`) berisi daftar Nama dan NIM siswa yang sah. Sistem tidak akan membuka akses ujian sebelum file ini diunggah.

### 2. Laporan Transparan & Komprehensif
Tabel pelaporan merekam data analitik yang mendalam, meliputi: Skor Akhir, Rincian Jawaban per nomor, Akumulasi Pelanggaran, Total Waktu AFK (detik), dan Status Akhir (Selesai/Diskualifikasi).

### 3. Ekspor Data Sekali Klik
Guru dapat mengunduh seluruh data tabel menjadi file *spreadsheet* berformat **Excel (.csv)** untuk arsip nilai akademik.

## 🛠️ Arsitektur Direktori

Proyek ini menggunakan sisi *client-side* murni dengan simulasi *database* lintas folder via *Local Storage API*:

```text
📁 Proyek_Ujian_Pervasif
├── 📁 Siswa
│   ├── index.html
│   ├── script.js
│   └── style.css
└── 📁 Guru
    ├── guru.html
    ├── guru.js
    └── style.css
