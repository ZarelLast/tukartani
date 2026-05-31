# 12 — Konsep UI/UX & Desain Interaksi (Game-First)

> **Tujuan file:** Memastikan antarmuka game benar-benar terasa seperti *game* (manajemen/simulasi) dengan sentuhan "Cartoonish Simulation" yang cozy, ceria, dan *vibrant*. Memadukan Phaser JS untuk rendering visual (Canvas) dan React untuk Overlay UI (DOM).
> *(Catatan: Untuk daftar aset spesifik komponen UI, tombol, dan panel, lihat `14-aset-layout-ui.md`)*

---

## 1. Pergeseran Paradigma (Web App ➔ Game)

| Elemen | Gaya Web App (Salah) | Gaya Game (Benar) |
|---|---|---|
| **Layout** | Konten menumpuk, scroll bawah | Fullscreen (fixed 16:9 / responsive safe-zone), HUD melayang |
| **Material** | Putih bersih, shadow halus, flat | Tekstur (kayu pinus terang, kertas perkamen), tombol *chunky* membal (*bouncy*) |
| **Penyampaian Info** | Tabel, teks panjang, *card* | Dialog karakter (Visual Novel box), *floating text* dengan *delay* |
| **Interaksi** | Klik tanpa efek (instan) | Jeda animasi, partikel koin/bintang, *screen-shake* ringan, efek suara (Juicy) |

## 2. Tema & Art Style (Visual Guidelines)

**Tema Inti: "Cartoonish Simulation" (Cozy & Vibrant)**
Tema ini dirancang tidak hanya untuk estetika, melainkan sebagai alat psikologis (menurunkan hormon stres / *Cozy Game Theory*) untuk menyamarkan kompleksitas simulasi ekonomi di baliknya.

- **Mood & Tone:** Hangat, mengundang (*inviting*), tidak mengintimidasi.
- **Harmoni UX & Psikologi (Gestalt & Affordance):** Selaras dengan [Panduan Aset](13-aset-objek.md), seluruh layout UI menggunakan *rounded corners* dan desain *chunky* untuk mengurangi *cognitive load*. Penggunaan tekstur *real-world* (kayu pinus, kertas perkamen) pada panel memberikan *affordance* yang jelas.
- **Palet Warna Utama (Color Psychology):** 
  - *Primary:* Hijau Alam (Teal/Mint) & Kuning Hangat (Sunrise) — memberikan efek relaksasi.
  - *Secondary:* Coklat Kayu (Wood/Leather) untuk UI panel pendukung.
  - *Accent:* Merah Tomat (Kritis/Peringatan) digunakan seminimal mungkin untuk memicu *urgency* instan, kontras dengan Biru Langit (Aksi Positif).
- **Tipografi:** Gunakan font *rounded* atau *hand-drawn* yang *chunky* (misal: Fredoka One atau Baloo) untuk heading/angka, dan font Sans-Serif bersih (misal: Quicksand) untuk body text agar tetap terbaca (*legible*).
- **Latar Belakang (Scene):** Pemandangan statis Desa Senandu atau area beranda gubuk petani dengan komposisi *rule of thirds*. Layar *dim* (hitam transparan 40%) saat popup menu terbuka.

## 3. Layout Layar Utama (The Game Scene) & Grid System

Resolusi target utama adalah **1920x1080 (Landscape 16:9)**. Namun, karena game ini mungkin diakses melalui smartphone, desain harus berpusat pada **Responsive Safe-Zone**.

### Panduan Layout Aman & Teori Responsive UI:
Untuk memastikan game tidak terasa seperti halaman web kaku saat dimainkan di smartphone, kita mengadopsi teori **"Anchor-Based Responsive UI"** (umum di *game engine* seperti Unity/Godot) yang diterjemahkan ke dalam teknik CSS modern.

1. **Konsep "Anchor Point" & "Safe Area":** 
   - UI dipasangkan (*anchored*) ke sudut-sudut atau tepi layar menggunakan CSS `position: fixed` atau `absolute` di dalam kontainer utama.
   - Kita menggunakan *environment variables* CSS seperti `env(safe-area-inset-top)` dan `env(safe-area-inset-bottom)` untuk mendeteksi keberadaan *notch*, kamera (*punch hole*), dan *gesture bar* di mobile, sehingga tombol tidak pernah tertutup oleh elemen fisik HP.
2. **Dynamic Viewport Scaling (vh/vw/vmin/vmax):** 
   - Alih-alih satuan piksel statis (`px`), ukuran panel pop-up dan font akan menggunakan satuan berbasis viewport (contoh: `min(80vw, 400px)`). Ini memastikan UI terlihat proporsional; tidak terlalu besar di PC dan tidak terlalu kecil di mobile.
3. **Behavior Orientation (Media Query `orientation`):**
   - **Di PC/Landscape (`orientation: landscape`):** HUD menyebar ke sudut (Uang di kanan atas, Kalender di kiri atas). Memberikan ruang pandang (Focal Point) terbuka di tengah untuk scene Desa Senandu.
   - **Di Mobile/Portrait (`orientation: portrait`):** HUD akan melakukan teknik **Stacking & Wrapping** menggunakan CSS Flexbox (`flex-wrap: wrap; justify-content: center;`). Elemen yang terpisah jauh ditarik berdekatan ke area atas-tengah (*top-center*) agar masuk dalam jangkauan mata pengguna portrait.
4. **Action Ring & Fitts's Law (Touch Target Minimum):** 
   - Mengikuti hukum Fitts (Fitts's Law) dan pedoman *Human Interface Guidelines*, semakin dekat dan besar sebuah tombol, semakin cepat diakses. 
   - Tombol aksi utama ditempatkan di *Thumb Zone* (jangkauan ibu jari di bagian bawah layar) dan harus berukuran **minimal 48x48dp** agar nyaman ditekan tanpa risiko meleset (*miss-click*).
5. **Aspect Ratio Adaptif (Letterboxing vs Pan-and-Scan):**
   - Hindari *Letterboxing* (menyisakan ruang hitam/black bars di sisi layar). 
   - Terapkan *Pan-and-Scan* dengan CSS `object-fit: cover;` pada background *scene* sehingga *art* desa meluas menutupi seluruh layar (*full bleed*), sementara area yang boleh diklik (Karakter, Prop) dipastikan selalu berada di dalam **Safe Zone (Aspect Ratio 9:16 untuk portrait atau 4:3 untuk landscape sempit)**.

### a. Layar Judul (Start Screen) (Z-Index: 100)
- **Fungsi:** Tempat awal pemain memasukkan *Nama Petani*, *Nama Kebun*, dan memilih *Tingkat Kesulitan* (Easy/Medium/Hard).
- **Layout:** Kotak dialog kayu besar di tengah layar menutupi pemandangan Desa Senandu yang di-*blur*. Terdapat 2 *input box* teks sederhana dan 3 tombol tebal memanjang.

### b. HUD (Heads-Up Display) di Atas & Pinggir (Z-Index: 10)
- **Kiri Atas (Waktu):** Ikon Kalender/Musim (Giliran ke-X). Desain berbentuk sobekan kalender meja.
- **Kanan Atas (Keuangan & Logistik):** Bar uang (Selga & GC) dalam kontainer kayu (*pill shape*). Tepat di bawahnya, terdapat rentengan *slot* kotak kecil penunjuk stok Inventaris (Kopi, Pupuk, BBM, Bibit) yang mudah dilirik.
- **Kanan Bawah (Status Mental & Beban):** Bar Hati/Kesejahteraan, berdampingan dengan **Indikator Biaya Hidup Bulan Ini** (ikon api/koin dengan angka merah). Ini krusial agar pemain dapat mengantisipasi tagihan.

### c. Fase Berita (Pop-up Surat / Papan Pengumuman) (Z-Index: 50)
- **Animasi Masuk:** Slide dari bawah layar, lalu berhenti di tengah dengan efek *overshoot* (membal).
- **Material:** Papan pengumuman kayu atau surat perkamen dengan stempel lilin merah.
- **Juiciness:** Jika ada *bencana_panen*, layar bisa bergetar kecil (*screen shake* 3px selama 0.2 detik) atau menampilkan *vignette* gelap sesaat.

### d. Fase Panen Otomatis (Visual Feedback) (Z-Index: 30)
Panen terjadi secara otomatis sebelum pemain bisa menekan tombol aksi (Fase Keputusan).
- **Layout & Transisi:** Kamera (atau fokus UI) berpusat sejenak ke ladang kopi di *background*.
- **Visual Feedback:** Muncul angka `+XX kg Kopi` mengambang ke atas, diiringi animasi biji kopi bermunculan dari pohon di *background* dan melayang masuk ke indikator "Stok Kopi" di HUD. Ini vital agar pemain sadar mereka baru saja mendapat stok.

### e. Meja Kerja / Action Hub (Tengah & Bawah) (Z-Index: 20)
Pusat layar menampilkan interaksi utama. Terdapat **5 tombol aksi operasional** ditambah **1 tombol utama (Lewati/Lanjut)**:
1. 📦 **Gudang (Jual Kopi)**
2. 🚢 **Pelabuhan (Beli Impor BBM, Pupuk, Bibit)**
3. 🏦 **Bank Desa (Tukar Uang Selga ↔ GC)**
4. 🌱 **Ladang (Tanam Bibit)**
5. 🤝 **Koperasi/Tetangga (Pinjam/Bayar/Bantu)**
- ⏩ **TOMBOL LANJUT BULAN (Aksi ke-6):** Tombol terpisah berukuran besar (misal di pojok kanan bawah) untuk memicu Resolusi. Di mobile, ke-5 tombol operasional disusun dalam format grid *3-2 stacking*.

### f. Fase Resolusi (Tagihan Bulanan) (Z-Index: 60)
Terjadi instan setelah menekan Lanjut Bulan. Pemain "dipaksa" melihat uang mereka terpotong.
- **Visual Feedback:** Muncul pop-up nota tagihan memanjang. Biaya Hidup, PBB, dan Bunga Pinjaman ditulis baris demi baris. Koin dari kas HUD melayang dan "terisap" masuk ke nota tersebut, diakhiri cap stempel merah "LUNAS".
- **Audio:** Suara mesin kasir berderik (*cash register ring*), diakhiri dengan efek suara stempel tebal dihantamkan ke kertas (*heavy stamp thud* / *Ka-Ching*).

### g. Transisi Antar Bulan (Month Transition)
Pergantian bulan/giliran tidak boleh terjadi secara instan agar pemain merasakan aliran waktu.
- **Visual Efek:** Layar menggelap sebentar (*fade to dark*) kemudian muncul animasi lembaran kalender meja tersobek terbang tertiup angin.
- **Audio:** Suara kertas tebal yang disobek (*rip*), desiran angin (*magical whoosh*), disusul dengan kicauan burung/kokok ayam pertanda bulan/giliran baru dimulai.

### h. Fase Refleksi & Chat Penasihat (Pak Tani Bijak) (Z-Index: 50)
- **Akses:** Melalui ikon Wajah Pak Tani Elf di HUD.
- **Layout:** UI *overlay* seperti aplikasi *Visual Novel*. Dialog box kayu menampilkan teks AI.
- **Input Suara (STT):** Tombol Mikrofon bulat (minimal 64x64dp) di sebelah kolom teks yang berdenyut (*pulsing*) saat *recording*.

*Saran Implementasi:* Di mobile (*portrait*), ke-5 tombol operasional disusun dalam format grid *3-2 stacking* agar ukurannya tetap maksimal (minimal 48x48dp). Tombol "Lanjut Bulan" bertindak sebagai *Floating Action Button (FAB)* raksasa (minimal 64x64dp) di sudut kanan bawah, selalu mudah dijangkau jempol.

### e. Grafik Kurs (Buku Catatan / Ledger) (Z-Index: 40)
- **Akses:** Melalui ikon Buku Jurnal tebal di pojok kiri bawah.
- **Visual:** Grafik kurs menyerupai coretan pensil tebal (warna biru dongker/merah tua) di atas kertas bergaris (*grid paper*). Tidak ada garis grid digital, diganti dengan tekstur lipatan kertas.

## 4. Game Feel ("Juiciness") & Micro-Interactions
1. **Animasi Partikel & Visual Delay:** Saat Jual Kopi, ikon koin kecil muncul dari Phaser dan terbang ke indikator HUD React. Angka di HUD *tidak* akan bertambah sebelum koin tersebut mendarat (*Visual Delay*), memberikan efek sebab-akibat yang *juicy*.
2. **Floating Text:** Perubahan kas memicu teks (misal: `+500.000 Selga`) melayang ke atas dengan kecepatan konstan, memudar (*opacity* 1➔0) dalam 1 detik.
3. **Audio (SFX):** Suara *chunky* dan *satisfying*. Denting koin tebal, kertas *crisp* dibalik, *bloop/pop* saat tombol ditekan.
4. **Angka Berdetak (Rolling Numbers):** Perubahan skor atau uang dianimasikan bergulir cepat.
5. **Anti-Spam (UX Lock):** Saat aksi dipicu dan partikel sedang terbang, tombol aksi meredup (*disabled state*) selama 0.5-1 detik. Ini mencegah *spamming* yang dapat merusak integritas *Visual State* dan *Game Feel*.

## 5. Layar Akhir Permainan (End-Game Screens)
Sebagai penutup siklus permainan, UI harus memberikan penegasan kuat atas pencapaian pemain, baik saat berhasil bertahan hingga akhir batas waktu maupun saat kalah. **Sesuai `08-skor-dan-rapor.md`, layar akhir wajib menampilkan Rapor Edukasi AI.**

### a. Layar Kemenangan (Victory - Melewati Batas Waktu)
- **Layout & Transisi:** Layar perlahan *fade to white* atau *fade to warm yellow*. Sebuah panel perkamen raksasa berhias ukiran daun emas (*golden leaves*) meluncur elegan dari atas ke tengah layar.
- **Isi Panel (Skor & Rapor):** Menampilkan Total Aset, Kesejahteraan (sebagai multiplier), dan **Rapor Edukasi AI** (teks *insight* personal dari Pak Tani Bijak di dalam kotak dialog khusus). Diiringi efek partikel (*confetti* daun atau *magical sparkles*).
- **Audio:** Suara lonceng peri (*chimes*) yang riang dan musik orkestra *triumphant* namun tetap *cozy*.

### b. Layar Kekalahan (Game Over - Bangkrut / Keluarga Hancur)
- **Layout & Transisi:** *Screen-shake* keras (5px, 0.5s), lalu keseluruhan *scene* meredup drastis (*fade to dark blue/gray tint*). Sebuah panel kayu kusam yang sedikit retak menabrak kasar dari atas.
- **Isi Panel (Penyebab & Rapor):** Menampilkan stempel merah miring "BANGKRUT" atau "DISITA". Di bawahnya terdapat **Rapor Edukasi AI** bernada evaluasi (mengapa pemain bisa bangkrut). Diganti dengan debu tipis (*dust motes*) yang melayang lambat.
- **Audio:** Efek suara bantingan kayu keras (*heavy thud*), kertas diremas, disusul musik yang temponya melambat (*pitch down/tape stop*) dan berubah muram.

## 6. Rincian Pop-up Menu Interaksi (Layout & Interaksi Aktif)
Ketika pemain menekan salah satu tombol operasional di Action Hub, sebuah *pop-up modal* akan muncul di tengah menutupi layar (latar belakang menjadi *blur* atau redup 40%).

### a. Gudang (Jual Kopi)
- **Layout:** Panel bertekstur kayu. Menampilkan ilustrasi stok kopi (Karung Goni) di tengah. Ada *slider bar* tebal atau tombol `[ - ]` dan `[ + ]` berukuran besar untuk mengatur porsi kopi yang ingin dijual.
- **Visual Feedback:** Menampilkan estimasi pendapatan dalam Selga secara *real-time* (*live calculation*). Angkanya menyala hijau terang saat bertambah.

### b. Pelabuhan (Beli Impor)
- **Layout:** Panel bergaya dermaga/papan pengumuman laut. Memiliki tiga baris terpisah untuk Pupuk, BBM, dan Bibit. Tiap baris dilengkapi ikon barang dan *stepper* input `[ - ]` / `[ + ]`.
- **Visual Feedback:** Harga kurs saat ini terpampang besar di bagian atas panel. Terdapat panah indikator kecil berwarna merah (jika kurs mahal/naik) atau hijau (jika kurs murah/turun).

### c. Ladang (Tanam Bibit)
- **Layout:** Menggunakan *background* perkamen berisi gambar ladang tanah kosong. Menampilkan indikator stok Bibit yang dimiliki.
- **Visual Feedback:** Ada *Progress bar* "Faktor Tanam" berbentuk sulur hijau. Jika pemain menekan "Tanam", sulur daun perlahan menjalar mengisi bar tersebut.

### d. Bank Desa (Tukar Uang)
- **Layout:** Desain buku kas kuno. Dibagi menjadi dua bagian (kiri: Selga ➔ GC, kanan: GC ➔ Selga) dengan *toggle switch* besar di tengah.
- **Visual Feedback:** Tulisan *Peringatan Spread 1.5%* dicetak tebal dengan warna kontras muda di bawah kalkulasi agar pemain waspada.

### e. Koperasi/Tetangga (Pinjam & Bantu)
- **Layout:** Desain buku catatan bergaris dengan tab "Pinjam Uang" dan "Donasi Warga".
- **Visual Feedback:** Saat pemain menggeser *slider* donasi untuk tetangga, akan muncul *preview* ikon hati (Kesejahteraan) yang berdenyut (*pulsing*) menandakan kenaikan poin.
