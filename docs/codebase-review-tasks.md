# Hasil Tinjauan Codebase: Usulan 4 Tugas Prioritas

Dokumen ini merangkum empat tugas yang masing-masing mewakili kategori: salah ketik, bug, ketidaksesuaian komentar/dokumentasi, dan peningkatan pengujian.

## 1) Tugas perbaikan salah ketik (typo)
**Judul tugas:** Standarkan penulisan istilah produk GitHub "Codespace" di README.

- **Temuan:** README menuliskan "New codespace" (huruf kecil), sementara istilah produk umumnya ditulis "Codespace".
- **Dampak:** Menurunkan konsistensi dokumentasi dan dapat terlihat kurang rapi untuk pembaca baru.
- **Definisi selesai:**
  - Ubah frasa menjadi "New Codespace".
  - Lakukan pembacaan cepat README untuk konsistensi kapitalisasi istilah produk lain.

## 2) Tugas perbaikan bug
**Judul tugas:** Perbaiki data yang dikirim ke callback `onImagesGenerated` agar sesuai kontrak tipe.

- **Temuan:** Pada `useStoryGeneration`, callback `onImagesGenerated(urls, prompts)` menerima argumen kedua bernama `prompts`, namun implementasi saat ini mengirim `paragraphs`.
- **Dampak:** Komponen pemanggil berpotensi menerima data yang tidak sesuai ekspektasi (teks paragraf mentah alih-alih prompt yang sudah diperkaya), yang bisa memicu perilaku UI/fitur lanjutan tidak akurat.
- **Definisi selesai:**
  - Kirim `enhancedPrompts` sebagai argumen kedua callback.
  - Verifikasi alur preview/riwayat prompt tetap benar setelah perubahan.

## 3) Tugas perbaikan komentar kode / ketidaksesuaian dokumentasi
**Judul tugas:** Samakan komentar `handleParagraphSplit` dengan perilaku aktual fungsi.

- **Temuan:** Komentar menyebut fungsi menangani "kedua jenis line break", tetapi implementasi hanya `split` berbasis separator tanpa normalisasi baris (`\r\n` vs `\n`).
- **Dampak:** Dokumentasi internal menyesatkan; developer dapat berasumsi fungsi lebih robust daripada implementasi saat ini.
- **Definisi selesai:** pilih salah satu:
  1. **Perbaiki implementasi** dengan normalisasi line break sebelum split, atau
  2. **Perbaiki komentar** agar sesuai perilaku saat ini.

## 4) Tugas peningkatan pengujian
**Judul tugas:** Tambah unit test untuk logika pemisahan paragraf dan kontrak callback generasi gambar.

- **Temuan:** Belum ada pengujian otomatis untuk utilitas `handleParagraphSplit` dan alur `useStoryGeneration` yang rawan regresi.
- **Dampak:** Perubahan kecil pada parsing teks/callback bisa lolos tanpa terdeteksi sampai tahap manual QA.
- **Definisi selesai:**
  - Tambah test untuk skenario separator default, separator kustom, input kosong, dan line break campuran.
  - Tambah test hook (atau integration-level test ringan) yang memastikan `onImagesGenerated` menerima URL + prompt yang benar.
