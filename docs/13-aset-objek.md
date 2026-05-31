# 13 — Panduan Aset Objek, Karakter, & Animasi

> **Tujuan file:** Mendokumentasikan spesifikasi teknis dan panduan visual untuk aset **Objek (Karakter, Barang, Background, dan Animasi)**. 
> *(Untuk aset Tampilan Layout UI, Tombol, dan Panel, lihat `14-aset-layout-ui.md`)*

---

## 1. Teori Visual & Psikologi "Cartoonish Simulation" (Modern Fantasy Elf)

Gaya visual "Cartoonish" dalam game simulasi ekonomi ini dibumbui oleh lore **"Modern Fantasy Elf"**—sebuah dunia yang sangat mirip dengan bumi saat ini (memiliki teknologi modern, perbankan, ekspor-impor) namun dihuni oleh ras fantasi seperti Elf. Ini bukan sekadar pilihan estetika, melainkan alat komunikasi UX dan kontrol psikologis pemain.

- **Kognisi & Siluet (Gestalt Theory):** Otak manusia lebih cepat memproses bentuk sederhana yang di-eksagerasi (*exaggerated*). Dengan memperbesar proporsi objek penting (seperti karung kopi atau koin emas) dan membulatkan sudut (*rounded corners*), kita mengurangi *cognitive load*. Pemain tahu mana yang bisa di-klik dalam 0.5 detik.
- **Psikologi Warna (Color Psychology):**
  - **Warna Hangat/Pastel (Kuning, Hijau Muda, Kayu):** Menurunkan hormon stres (kortisol). Pemain merasa sedang bersantai ("Cozy"), yang krusial karena *core-loop* game ini sebenarnya adalah manajemen ekonomi yang kompleks. Visual yang *cute* menyamarkan kerumitan angka.
  - **Kontras Aksi (Red vs Blue/Green):** Warna merah murni (destruktif/bahaya) sangat dibatasi, hanya muncul saat kas hampir habis atau ada krisis. Ini memicu *urgency* instan karena sangat kontras dengan lingkungan hijau-biru.
- **Affordance & Material (UX):** Objek dibuat tebal (*chunky*) dan memiliki tekstur yang dikenali dunia nyata (kayu, kertas, emas). Secara insting (*affordance*), otak tahu bahwa benda timbul bisa ditekan, dan kertas bisa dibaca.

## 2. Backgrounds (Latar Belakang Utama)
**Dimensi Target:** 1920x1080px (16:9). Ekspor sebagai JPEG high-quality atau PNG untuk layar utama.
**Art Style:** Lukisan digital tanpa *lineart* (painterly/vector), palet warna pastel/vibrant.
- **Negara Elf - Desa Senandu (Siang/Normal):** 
  - *Deskripsi Visual:* Kebun kopi berundak (terasering) dengan gubuk kayu yang memiliki sentuhan arsitektur khas Elf (atap melengkung elegan, sulur tanaman merambat) berpadu dengan elemen pertanian modern (seperti termometer tanah digital atau pompa irigasi).
  - *Warna:* Hijau rumput cerah, langit cyan, atap gubuk coklat bata dengan aksen emas atau hijau zamrud tipis.
- **Negara Elf - Desa Senandu (Mendung/Krisis):** 
  - *Deskripsi Visual:* Suasana sama, namun pencahayaan redup. Awan kelabu tebal, rintik hujan, dan elemen magis/alam terlihat kehilangan cahayanya (meredup).
  - *Warna:* Hijau kebiruan (*desaturated*), langit abu-abu, *overlay* biru gelap 20%.

## 3. Karakter: "Pak Tani Elf" (Penasihat)
**Fungsi & UX:** Bertindak sebagai *onboarding guide* dan pemberi *feedback* emosional. Kehadiran wajah humanoid yang merespons aksi pemain menciptakan ikatan empati (*Parasocial Interaction*).
**Dimensi:** Half-body (sekitar 800x1000px, transparan PNG), siluet membulat.
- **Opsi Konsep:**
  - *Opsi A (Sederhana):* Petani dengan **telinga Elf panjang dan runcing** yang menonjol keluar dari bawah topi caping besarnya. Mengenakan kemeja kerja modern namun dengan motif kerah/manset elegan khas Elf.
  - *Opsi B (Ekspresif):* Tambahan kacamata bulat tebal, earpiece/headset modern menempel di telinga runcingnya, dan handuk kecil di leher, memperkuat kesan "Modern Fantasy".
- **State Ekspresi & Psikologi (Ekspor sebagai Sprite Terpisah):**
  1. **Idle / Senyum (Default):** Mata terbuka lebar, telinga Elf sedikit terangkat/tegak (menandakan energi dan rasa aman).
  2. **Serius / Mengingatkan:** Mata sedikit menyipit, alis mengerut, telinga agak turun. Menggeser *mood* ke fokus analitis.
  3. **Panik / Bangkrut:** Topi caping miring, telinga Elf turun lemas (*droopy*), *sweatdrop* komikal. Reaksi hiperbolik ini meredam frustrasi pemain.
  4. **Victory:** Tersenyum lebar dengan mata berbinar, mengangkat topi caping tinggi-tinggi.

## 4. Props & Barang (Inventory & Currency)
**Dimensi:** Bervariasi, disiapkan dalam grid 64x64px atau 128x128px (High Res). Ekspor sebagai transparan PNG transparan agar bisa ditaruh di HUD.
**Gaya:** Vektor bersih, siluet *exaggerated* (proporsi dibesar-besarkan), garis tepi (*outline*) tebal opsional untuk keterbacaan (atau gunakan kontras warna).

- **Mata Uang Lokal (Selga):** 
  - *Visual:* Uang kertas bergaya modern yang diikat karet gelang merah, namun desain motif pada kertasnya menampilkan ornamen daun/rune elven yang berpendar tipis.
- **Mata Uang Asing (GC / Gold Coins):** 
  - *Visual:* Tumpukan koin emas tebal bersinar (*glinting*) dengan ukiran lambang/rune ras luar negeri. Refleksi kuning terang pada koin teratas.
- **Aset Pertanian & Impor (Komoditas):** Sesuai dengan spesifikasi ekonomi (`03`), terdapat 4 barang logistik yang perlu divisualisasikan secara unik:
  - *Karung Kopi:* Karung goni coklat kasar (tekstur silang tipis), dengan biji kopi raksasa tumpah. Siluet bulat padat (buntal).
  - *Pupuk Subsidi:* Karung putih mulus dengan logo daun hijau tebal. Siluet lebih kotak/tegak.
  - *Jerigen BBM:* Jerigen logam/plastik merah gelap (khas bahan bakar) dengan stiker tetesan minyak kuning. Siluet asimetris dengan gagang mencolok.
  - *Kantong Bibit:* *Pouch* kain kecil coklat muda/hijau kusam, diikat tali rami, bergambar tunas daun. Siluetnya kecil seperti kantong emas namun lebih organik.
- **Kesejahteraan (Hati):**
  - *Visual:* Ikon Hati 3D kemerahan (*cherry red*) bergaya *cartoony*, sedikit miring asimetris untuk kesan dinamis. Terdapat kilauan putih di kiri atas.

## 5. Animasi & Sprite (Micro & Macro Interactions VFX)
Untuk menghidupkan *game feel*, interaksi mikro (aksi tombol) dan makro (perubahan state/layar) membutuhkan *feedback* visual. **Illustrator harus menyiapkan *spritesheet* (frame-by-frame) atau partikel terpisah untuk efek berikut:**

### A. Interaksi Mikro (Aksi Pemain)
- **Jual Kopi (Gudang):** 
  - *VFX:* Animasi karung kopi yang mengecil (*scale down*) seolah dilempar, disusul efek puluhan koin uang (Selga) yang melayang (*arc trajectory*) berhamburan dari tengah layar masuk langsung ke bar kas HUD di atas. (Siapkan *sprite* 1 koin Selga kecil untuk sistem partikel).
- **Beli Impor (Pelabuhan):** 
  - *VFX:* Siluet kapal laut uap kecil melintas cepat di layar bawah, menjatuhkan kotak kayu (*wooden crate*) ke daratan. Kotak itu memantul (*bouncing*) dan terbuka memunculkan ikon barang yang dibeli. (Siapkan *sprite* siluet kapal uap dan *spritesheet* kotak kayu terbuka).
- **Tanam Bibit (Ladang):**
  - *VFX:* Saat tombol tanam diklik, muncul partikel debu tanah menyembur ke atas, lalu tunas hijau menyala (*magical elf sprout*) melesat tumbuh ke atas dengan efek *popping* yang sangat *satisfying*. (Siapkan *spritesheet* urutan tunas tumbuh 3-4 frame).
- **Tukar Uang (Bank Desa):**
  - *VFX:* Dua anak panah saling melingkar secara instan, memunculkan efek percikan sihir magis (*gold sparks*) di titik perpotongannya, diiringi dentingan koin berat. (Siapkan partikel *gold sparks* berbentuk bintang silang).
- **Bantu Tetangga (Koperasi):**
  - *VFX:* Sprite Ikon Hati (*Kesejahteraan*) membesar gembira, lalu meletup mengeluarkan banyak hati-hati kecil merah jambu dan kelopak bunga yang melayang perlahan ke atas layar (seperti balon). (Siapkan *sprite* ikon hati kecil dan kelopak bunga pastel).

### B. Interaksi Makro (Perubahan State, Fase & Layar)
- **Transisi Antar Bulan (Turn End):**
  - *VFX:* Lembaran kalender kuno yang sobek dan terbang tertiup angin. (Siapkan *sprite* lembar kalender statis dan 1 lembar sobekan melayang).
- **Fase Panen Otomatis:**
  - *VFX:* Biji-biji kopi bermunculan (*pop-up*) di area ladang, membesar sesaat, lalu melesat (*arc trajectory*) masuk ke dalam kantong UI. (Siapkan *sprite* 1 biji kopi besar/berkilau).
- **Fase Resolusi (Tagihan Bulanan & Bunga):**
  - *VFX:* Koin dari kas pemain tersedot dengan cepat (*sucking/drain effect*) ke arah tengah layar, dan muncul partikel debu/asap kecil tanda uang habis. (Siapkan *sprite* stempel "LUNAS" merah tebal).
- **Fase Berita Buruk (Bencana Panen):**
  - *VFX:* Layar memiliki *vignette* gelap di pinggiran dan muncul ikon tanda seru merah/awan mendung kecil. (Siapkan *sprite* awan mendung *cartoony* transparan).
- **Fase Refleksi / Chat Penasihat (STT Voice):**
  - *VFX:* Ikon mikrofon akan berdenyut (*pulsing rings*) dan memunculkan gelombang suara (*sound waves*) kartunis saat menerima suara pemain. (Siapkan animasi *circle pulse* atau *sound wave* sederhana 3 frame).
- **Layar Kemenangan (Victory & Rapor Edukasi):**
  - *VFX:* Hujan partikel daun emas (*golden elven leaves*) dan *magical sparkles* yang turun perlahan di sekitar papan Rapor. (Siapkan 2-3 variasi siluet daun emas untuk sistem partikel).
- **Layar Kekalahan (Game Over - Bangkrut):**
  - *VFX:* Layar meredup dengan debu kusam yang melayang pelan (*dust motes*), menyertai panel Rapor kayu yang hancur. (Siapkan *sprite* partikel debu statis/kelabu).
