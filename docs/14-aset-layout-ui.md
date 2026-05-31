# 14 — Panduan Aset Tampilan Layout & UI

> **Tujuan file:** Mendokumentasikan spesifikasi teknis dan panduan visual khusus untuk aset **Tampilan Layout In-Game (UI, Panel, dan Menu)** berdasarkan interaksi di `05-aksi-pemain.md` dan `12-ui-ux-design.md`. 
> **Penting untuk Illustrator/Designer:** Anda yang bertugas membuat *sprites* untuk elemen UI ini harus memperhatikan panduan *slicing* dan *export* di bawah agar aset dapat digunakan dengan baik oleh developer (React/CSS).

---

## 1. Instruksi Ekspor Sprite UI untuk Illustrator
Karena elemen UI akan disusun secara dinamis (mengikuti ukuran layar HP/PC), *sprites* yang Anda buat tidak boleh diekspor sebagai satu gambar statis penuh, melainkan dipotong-potong (sliced):
- **Sistem 9-Slice:** Panel, koran, dan tombol harus digambar dengan sudut (*corners*) yang jelas, tepi (*edges*) yang bisa diulang, dan bagian tengah (*center*) yang kosong/bertekstur *seamless*. Ekspor dalam bentuk bujur sangkar murni (misal 128x128px) untuk di-*stretch* oleh developer.
- **State Tombol:** Setiap tombol harus digambar dan diekspor dalam 3 file terpisah atau 1 *spritesheet*:
  1. `btn_normal.png` (Keadaan biasa)
  2. `btn_hover.png` (Lebih terang, sedikit membesar/terangkat)
  3. `btn_pressed.png` (Bayangan bawah hilang, posisi turun)
- **Transparansi:** Ekspor semua aset sebagai **PNG transparan**. Jangan sertakan background warna *solid* atau teks di dalam tombol (teks akan di-render menggunakan *font* oleh game engine).

---

## 2. Aset Layar Judul (Start Screen)
Panel pertama yang dilihat pemain sebelum masuk ke permainan.
- **Papan Judul Utama:** Papan kayu raksasa atau *banner* kain dengan tekstur kasar (9-Slice).
- **Input Box (Teks):** Wadah teks memanjang dengan gaya guratan pensil atau ukiran kayu (*carved wood*). Butuh dua buah untuk *Nama Petani* dan *Nama Kebun*.
- **Tombol Kesulitan (Difficulty Buttons):** 3 tombol sejajar. Siapkan variasi warna:
  - *Easy:* Hijau ramah.
  - *Medium:* Kuning hangat.
  - *Hard:* Merah menantang.

---

## 3. Aset HUD (Heads-Up Display)
Komponen penunjuk status di pinggir layar. Diekspor terpisah dari *background* utama.
- **Wadah Kalender/Bulan (Kiri Atas):** Bentuk sisa sobekan kalender meja kuno atau tepi gulungan kertas melengkung.
- **Wadah Uang (Kanan Atas):** Desain pil memanjang (*pill shape*) berbahan kayu gelap tebal. Memiliki dua *slot* ikon melingkar untuk tempat logo Selga dan GC.
- **Rentengan Inventaris Logistik (Bawah Wadah Uang):** Wadah kecil horizontal yang memiliki 4 *slot* (Kopi, Pupuk, BBM, Bibit) untuk memonitor stok sekilas tanpa membuka menu.
- **Meteran Kesejahteraan (Kanan Bawah):** Desain botol kaca bundar, termometer kuno, atau *bar* vertikal dengan bingkai kayu/besi tempa. (Siapkan *sprite* bingkai luar transparan dan tekstur cairan merah jambu).
- **Indikator Biaya Hidup Bulan Ini (Kanan Bawah, sebelah Hati):** Wadah kecil merah berdesain api kecil atau dompet bolong (*leaky wallet*) penanda jumlah tagihan yang akan ditagih saat Resolusi.

---

## 4. Aset Action Hub (Meja Kerja Pemain)
Berada di tengah bawah layar. Tombol-tombol ini adalah nyawa navigasi permainan sesuai 6 aksi di `05`.
- **5 Dasar Tombol Operasional (Min. 64x64px):**
  Bentuk dasar seragam (bulat penuh atau kotak *rounded*) berbahan kayu/batu terang yang *chunky*.
- **5 Ikon Overlay (Warna kontras/Putih tebal):**
  1. *Ikon Gudang:* Siluet kotak penyimpan/gudang kayu.
  2. *Ikon Pelabuhan:* Siluet jangkar atau kapal uap.
  3. *Ikon Bank:* Siluet timbangan kuno atau koin bersilang.
  4. *Ikon Ladang:* Siluet sekop atau tunas pohon.
  5. *Ikon Koperasi:* Siluet jabat tangan atau rumah ramah.
- **Tombol FAB "Lanjut Bulan" (Aksi ke-6):**
  Desain sangat mencolok dan dominan. Bentuk lingkaran besar berbingkai emas dengan warna dasar kontras (Kuning Sunrise atau Biru Laut terang). Tambahkan ikon panah ganda (⏩) tebal di tengahnya.

---

## 5. Aset Pop-up Modal Interaksi (Spesifik per Aksi & Fase)
Panel-panel ini muncul menutupi layar. Semua menggunakan teknik 9-Slice.

### A. Komponen Universal Modal
- **Papan Kayu Utama (9-Slice):** Coklat kayu pinus. Tekstur serat kayu disederhanakan. Paku besi kelabu di keempat sudut.
- **Kertas/Ledger Utama (9-Slice):** Warna perkamen krem (*beige*). Tepi bergelombang alami.
- **Tombol Close (X):** Tombol merah kecil membulat dengan silang putih tebal.

### B. Kebutuhan UI Unik per Menu Aksi
- **Menu Gudang (Jual Kopi):**
  - *Slider Bar:* Jalur *slider* (garis kayu cekung panjang) dan kenop *slider* (batu/kayu bulat tebal).
  - *Stepper:* Tombol kecil kotak `[ - ]` dan `[ + ]`.
  - *Meteran Pajak:* Bar progres lurus/memanjang untuk indikator "Omzet PTKP 500 Juta".
  - *Stempel Pajak:* Aset stempel merah miring transparan bertuliskan "PAJAK DIBAYAR".
- **Menu Pelabuhan (Beli Impor):**
  - *Indikator Kurs:* Aset panah miring tebal berukuran kecil ke arah atas (merah/bahaya) dan ke bawah (hijau/aman).
- **Menu Ladang (Tanam Bibit):**
  - *Progress Bar Faktor Tanam:* Wadah memanjang berbingkai tekstur tanah/batu, dan isian *bar* berupa pola sulur/daun hijau (*repeatable pattern*).
- **Menu Bank Desa (Tukar Uang):**
  - *Toggle Switch:* Kenop sakelar geser tebal bergaya tuas mekanik (Kiri: Selga, Kanan: GC).
- **Menu Koperasi (Pinjam & Bantu):**
  - *Tab Navigation:* Desain tab folder kertas. (Siapkan state: *Tab Aktif* menyatu tanpa garis batas dengan kertas utama, *Tab Pasif* berwarna lebih gelap/redup dan berada di lapis belakang).
- **Menu Grafik Kurs (Buku Catatan):**
  - *Grid Paper:* Tekstur kertas buku tulis bergaris halus/kotak-kotak pudar (diekspor 9-slice untuk latar grafik).
  - *Ikon Krisis/Bencana:* Pin merah kecil atau stempel silang untuk dianotasikan pada titik grafik saat terjadi krisis/bencana.

### C. UI Spesifik Fase Resolusi
- **Nota Tagihan Bulanan:** Kertas struk kasir/kuitansi (*receipt*) memanjang ke bawah dengan tepian bergerigi di atas dan bawah. Digunakan untuk merinci Biaya Hidup, PBB, dan Bunga yang dipotong.

---

## 6. Aset Layar Akhir (End-Game Panels)
Panel megah untuk menutup permainan, mengakomodasi Skor dan Rapor Edukasi AI.
- **Panel Rapor Kemenangan (Victory UI):** Kertas gulung (scroll) putih bersih bersinar dengan aksen sulur daun/rune emas di pinggirannya (9-Slice). Pita kemenangan biru/merah di atas layar. Stempel lilin (*wax seal*) mengilap yang diekspor terpisah.
- **Panel Surat Sita Bank (Game Over UI):** Papan kayu kusam/retak memanjang (9-Slice). Stempel/cap peringatan merah transparan. Bercak/noda cipratan kopi hitam (ekspor terpisah untuk diletakkan acak).

---

## 7. Aset Chat & Interaksi AI (Pak Tani Bijak)
Antarmuka *Visual Novel / Chat App* kuno untuk Fase Refleksi.
- **Kotak Dialog (Dialog Box):** Papan kayu memanjang horizontal atau gulungan perkamen mendatar di sepertiga bawah layar (9-slice).
- **Balon Kata (Chat Bubbles):** Gelembung teks membulat tebal dengan "ekor" kecil (9-slice).
  - *Varian Pemain:* Hijau/Biru muda (ekor menunjuk ke kanan).
  - *Varian AI:* Krem/Kayu terang (ekor menunjuk ke kiri bawah arah karakter).
- **Tombol Voice/Mic (STT Input):** Tombol melingkar tebal dengan ikon mikrofon retro.
  - *State Recording:* Ornamen cincin bercahaya (*glow rings*) terpisah untuk dianimasikan berdenyut (*pulsing*) oleh sistem.
