# 11 — Event Cadangan (Tabel Fiksi Hardcoded)

> **Tujuan file:** 90 event fiksi siap pakai (masing-masing 15 per kategori). Dipakai di **tiga** tempat:
> (1) MVP lapis 1 (`10`) sebagai penggerak sebelum AI ada, (2) `EVENT_CADANGAN()`
> fallback saat output AI gagal validasi (`06 §6a`), (3) **Base/Seed untuk Prompt AI** 
> agar LLM tidak kehabisan ide dan memiliki panduan dasar untuk dikembangkan menjadi berita dramatis.
>
> **Bergantung pada:** `02-tipe-dan-state.md` (tipe `Berita`), `03-ekonomi.md`
> (rentang efek harus sah), `06-ai-integrasi.md` (aturan keamanan fiksi).
> **Dipakai oleh:** `06`, `10` (lapis 1).
> **JANGAN:** menyebut entitas nyata; melampaui rentang efek di `03`.

## Panduan untuk AI (LLM Prompt Seeding)
Item-item di dalam `EVENT_CADANGAN_LIST` ini pada dasarnya adalah **"Ide Mentah" (Base Seeds)**. Saat sistem memutuskan untuk menggunakan AI (berdasarkan persentase `peluangAI`), sistem akan mengirim salah satu teks dari tabel ini ke AI dengan instruksi: 
*"Kembangkan ide dasar ini menjadi berita yang dramatis, imersif, dan hidup. Tambahkan nama tokoh fiksi, lokasi fiksi di Sylvarion, atau kutipan wawancara, tapi pertahankan esensi efek makroekonominya."*

Dengan cara ini, AI tidak perlu mengarang dari nol, melainkan bertindak sebagai "Jurnalis" yang memoles ide mentah menjadi artikel berita yang sangat bagus di dalam game.

Semua sudah dalam rentang sah (`kurs -3..3`, `stokKopiDelta -40..0`,
`hargaEksporModifier 0.8..1.3`) sehingga **lolos `bersihkanBerita` apa adanya**.

```ts
export const EVENT_CADANGAN_LIST: Berita[] = [
  // --- 1. KEBIJAKAN MONETER (gerak kurs: -3 hingga 3) ---
  { kategori: "kebijakan_moneter", headline: "Bank Agung naikkan suku bunga acuan", penjelasan: "Bunga lebih tinggi menarik modal masuk; Selga sedikit menguat.", efek: { kurs: -2 } },
  { kategori: "kebijakan_moneter", headline: "Gubernur Bank Sentral diganti mendadak", penjelasan: "Pasar panik dengan intervensi politik, Selga anjlok di pasar valas.", efek: { kurs: 3 } },
  { kategori: "kebijakan_moneter", headline: "Pemerintah cetak uang untuk proyek raksasa", penjelasan: "Uang beredar berlebih memicu inflasi, Selga melemah terhadap Gold Coins.", efek: { kurs: 2 } },
  { kategori: "kebijakan_moneter", headline: "Cadangan Gold Coins Sylvarion menembus rekor", penjelasan: "Kepercayaan investor tinggi, mata uang lokal Selga menguat tajam.", efek: { kurs: -3 } },
  { kategori: "kebijakan_moneter", headline: "Kebijakan pengetatan kredit diberlakukan", penjelasan: "Uang beredar menyusut, Selga terapresiasi tipis di bursa.", efek: { kurs: -1 } },
  { kategori: "kebijakan_moneter", headline: "Skandal korupsi elit politik terbongkar", penjelasan: "Ketidakstabilan politik membuat investor asing kabur, Selga melemah.", efek: { kurs: 2 } },
  { kategori: "kebijakan_moneter", headline: "Pemilu berakhir damai, pasar bereaksi positif", penjelasan: "Stabilitas politik memancing dana asing masuk, Selga menguat.", efek: { kurs: -2 } },
  { kategori: "kebijakan_moneter", headline: "Pemerintah luncurkan obligasi ritel", penjelasan: "Penyerapan dana masyarakat sukses, nilai Selga tertahan stabil.", efek: { kurs: -1 } },
  { kategori: "kebijakan_moneter", headline: "Subsidi energi dicabut mendadak", penjelasan: "Kejutan pasar memicu kepanikan jangka pendek, Selga terkoreksi.", efek: { kurs: 1 } },
  { kategori: "kebijakan_moneter", headline: "Bank Agung longgarkan kebijakan uang", penjelasan: "Suku bunga ditekan untuk dorong kredit, Selga cenderung melemah.", efek: { kurs: 2 } },
  { kategori: "kebijakan_moneter", headline: "Pembebasan pajak asing disahkan parlemen", penjelasan: "Aliran modal asing membanjiri Sylvarion, kurs Selga melonjak.", efek: { kurs: -3 } },
  { kategori: "kebijakan_moneter", headline: "Utang luar negeri Sylvarion gagal bayar", penjelasan: "Rating kredit turun drastis, kepanikan membuat Selga runtuh.", efek: { kurs: 3 } },
  { kategori: "kebijakan_moneter", headline: "Otoritas berlakukan batas penukaran valas", penjelasan: "Pembatasan devisa memicu pasar gelap, Selga melemah tipis.", efek: { kurs: 1 } },
  { kategori: "kebijakan_moneter", headline: "Penerimaan pajak negara lampaui target", penjelasan: "Keuangan negara super sehat, Selga perlahan terapresiasi.", efek: { kurs: -1 } },
  { kategori: "kebijakan_moneter", headline: "Isu denominasi mata uang dibatalkan", penjelasan: "Pasar kecewa dengan ketidakpastian regulasi, modal tertahan.", efek: { kurs: 1 } },

  // --- 2. KRISIS GLOBAL (Selga MELEMAH, arah positif: 1 hingga 3) ---
  { kategori: "krisis_global", headline: "Konflik di Benua Selatan ganggu pelayaran", penjelasan: "Ketidakpastian global; modal lari ke aset aman, Selga melemah tajam.", efek: { kurs: 3 } },
  { kategori: "krisis_global", headline: "Krisis utang melanda Kerajaan Seberang", penjelasan: "Investor panik cari Gold Coins; mata uang kecil seperti Selga tertekan.", efek: { kurs: 2 } },
  { kategori: "krisis_global", headline: "Pandemi flu buruh lumpuhkan industri global", penjelasan: "Rantai pasok dunia hancur, mata uang negara berkembang runtuh.", efek: { kurs: 3 } },
  { kategori: "krisis_global", headline: "Perang dagang raksasa ekonomi memanas", penjelasan: "Tarif balasan diberlakukan, investor memborong valas sebagai pelindung.", efek: { kurs: 2 } },
  { kategori: "krisis_global", headline: "Serangan siber lumpuhkan bank global", penjelasan: "Kepanikan pasar keuangan dunia memicu devaluasi massal di Sylvarion.", efek: { kurs: 3 } },
  { kategori: "krisis_global", headline: "Blokade jalur perdagangan terusan utama", penjelasan: "Logistik dunia terhambat, sentimen negatif memukul mata uang lokal.", efek: { kurs: 2 } },
  { kategori: "krisis_global", headline: "Harga minyak dunia meroket tajam", penjelasan: "Negara importir minyak seperti Sylvarion kehabisan devisa, Selga anjlok.", efek: { kurs: 3 } },
  { kategori: "krisis_global", headline: "Kegagalan panen serentak di utara", penjelasan: "Harga pangan global meledak, menekan daya beli dan nilai tukar.", efek: { kurs: 1 } },
  { kategori: "krisis_global", headline: "Bursa saham dunia anjlok seketika", penjelasan: "Runtuhnya indeks global menyeret jatuh aset berisiko termasuk Selga.", efek: { kurs: 2 } },
  { kategori: "krisis_global", headline: "Keruntuhan perusahaan logistik raksasa", penjelasan: "Krisis likuiditas menyebar, modal lari mencari perlindungan valas.", efek: { kurs: 2 } },
  { kategori: "krisis_global", headline: "Kabel data bawah laut global terputus", penjelasan: "Transaksi internasional terhenti berhari-hari, memicu panic selling lokal.", efek: { kurs: 3 } },
  { kategori: "krisis_global", headline: "Negara adidaya bekukan aset asing", penjelasan: "Ketakutan membeku, semua dana ditarik kembali ke pusat finansial global.", efek: { kurs: 3 } },
  { kategori: "krisis_global", headline: "Wabah ternak misterius lintas benua", penjelasan: "Perbatasan ditutup, roda ekonomi melambat membebani mata uang berkembang.", efek: { kurs: 1 } },
  { kategori: "krisis_global", headline: "Isu kejatuhan komet picu histeria massal", penjelasan: "Ketidakrasionalan pasar menekan semua instrumen investasi kecil.", efek: { kurs: 2 } },
  { kategori: "krisis_global", headline: "Boikot energi total di kawasan timur", penjelasan: "Biaya produksi global meroket menekan fundamental mata uang kita.", efek: { kurs: 2 } },

  // --- 3. PERMINTAAN EKSPOR (harga jual kopi modifier: 0.8 hingga 1.3) ---
  { kategori: "permintaan_ekspor", headline: "Kedai kopi menjamur di Teluk Bara", penjelasan: "Tren gaya hidup baru mendongkrak permintaan kopi ekspor.", efek: { hargaEksporModifier: 1.25 } },
  { kategori: "permintaan_ekspor", headline: "Selera dunia bergeser ke teh herbal", penjelasan: "Kampanye kesehatan menekan konsumsi kopi secara global.", efek: { hargaEksporModifier: 0.85 } },
  { kategori: "permintaan_ekspor", headline: "Penemuan medis puji manfaat kopi", penjelasan: "Studi mengklaim kopi perpanjang umur, pesanan ekspor meledak.", efek: { hargaEksporModifier: 1.3 } },
  { kategori: "permintaan_ekspor", headline: "Kampanye anti-kafein viral di media", penjelasan: "Anak muda mulai tinggalkan kopi, pesanan dari luar negeri lesu.", efek: { hargaEksporModifier: 0.8 } },
  { kategori: "permintaan_ekspor", headline: "Kesepakatan dagang baru dengan negara tetangga", penjelasan: "Tarif impor dihapus di negara tujuan, kopi kita laku keras.", efek: { hargaEksporModifier: 1.2 } },
  { kategori: "permintaan_ekspor", headline: "Boikot produk dari benua kita", penjelasan: "Tensi politik memicu boikot, kopi sulit masuk pasar utama.", efek: { hargaEksporModifier: 0.85 } },
  { kategori: "permintaan_ekspor", headline: "Minuman energi kopi instan populer", penjelasan: "Pabrikan besar memborong biji kopi mentah untuk bahan baku.", efek: { hargaEksporModifier: 1.15 } },
  { kategori: "permintaan_ekspor", headline: "Pajak barang mewah diterapkan pada kopi di Seberang", penjelasan: "Kopi dianggap barang tersier, daya beli konsumen asing turun.", efek: { hargaEksporModifier: 0.9 } },
  { kategori: "permintaan_ekspor", headline: "Kopi Sylvarion masuk menu resmi maskapai global", penjelasan: "Prestige naik, pembeli berani tawar dengan harga tinggi.", efek: { hargaEksporModifier: 1.25 } },
  { kategori: "permintaan_ekspor", headline: "Perlambatan ekonomi di negara tujuan ekspor", penjelasan: "Masyarakat luar negeri berhemat, permintaan kopi harian merosot.", efek: { hargaEksporModifier: 0.8 } },
  { kategori: "permintaan_ekspor", headline: "Aktor legendaris tertangkap kamera minum kopi Sylvarion", penjelasan: "Viral di sosial media memicu euforia pembelian instan di luar negeri.", efek: { hargaEksporModifier: 1.3 } },
  { kategori: "permintaan_ekspor", headline: "Regulasi Kerajaan Seberang larang kopi non-organik", penjelasan: "Sertifikasi ditangguhkan, sementara waktu akses pasar tertutup.", efek: { hargaEksporModifier: 0.8 } },
  { kategori: "permintaan_ekspor", headline: "Musim dingin ekstrem di negara tujuan", penjelasan: "Konsumsi minuman hangat melonjak, permintaan ekspor meningkat tajam.", efek: { hargaEksporModifier: 1.2 } },
  { kategori: "permintaan_ekspor", headline: "Substitusi minuman energi sintetis merajai", penjelasan: "Konsumen beralih ke kafein kimia, melupakan biji kopi panggang.", efek: { hargaEksporModifier: 0.85 } },
  { kategori: "permintaan_ekspor", headline: "Pameran agrikultur internasional borong kopi", penjelasan: "Distributor global beramai-ramai teken kontrak dengan petani lokal.", efek: { hargaEksporModifier: 1.25 } },

  // --- 4. HARGA KOMODITAS (harga kopi global modifier: 0.8 hingga 1.3) ---
  { kategori: "harga_komoditas", headline: "Panen kopi melimpah di Lembah Hijau", penjelasan: "Pasokan dunia berlebih menekan harga kopi global jatuh.", efek: { hargaEksporModifier: 0.8 } },
  { kategori: "harga_komoditas", headline: "Badai es hancurkan kebun kopi Pegunungan Auren", penjelasan: "Kelangkaan ekstrem di pasar global memicu lonjakan harga.", efek: { hargaEksporModifier: 1.3 } },
  { kategori: "harga_komoditas", headline: "Kartel pengekspor batasi kuota penjualan", penjelasan: "Penahanan pasokan buatan berhasil mengerek harga pasar dunia.", efek: { hargaEksporModifier: 1.2 } },
  { kategori: "harga_komoditas", headline: "Bursa komoditas Sylvarion catat rekor", penjelasan: "Spekulan masuk memborong kontrak kopi, harga terdongkrak.", efek: { hargaEksporModifier: 1.25 } },
  { kategori: "harga_komoditas", headline: "Standar mutu dunia tiba-tiba diperketat", penjelasan: "Hanya biji premium dihargai wajar, sisanya dihargai murah.", efek: { hargaEksporModifier: 0.9 } },
  { kategori: "harga_komoditas", headline: "Gudang raksasa melepaskan stok cadangan", penjelasan: "Pasar dibanjiri kopi simpanan lama, harga referensi merosot tajam.", efek: { hargaEksporModifier: 0.85 } },
  { kategori: "harga_komoditas", headline: "Kegagalan sistem lelang komoditas internasional", penjelasan: "Kekacauan bursa memicu panic buying sementara dari pabrikan.", efek: { hargaEksporModifier: 1.15 } },
  { kategori: "harga_komoditas", headline: "Teknologi sintesis kopi diumumkan", penjelasan: "Kopi buatan lab memicu kepanikan, harga kopi asli tertekan.", efek: { hargaEksporModifier: 0.85 } },
  { kategori: "harga_komoditas", headline: "Musim kemarau di tiga benua", penjelasan: "Produksi serentak anjlok, pembeli berebut sisa panen di pasar.", efek: { hargaEksporModifier: 1.3 } },
  { kategori: "harga_komoditas", headline: "Penemuan varietas kopi hasil kilat di utara", penjelasan: "Produktivitas pesaing berlipat ganda, harga pasar berangsur turun.", efek: { hargaEksporModifier: 0.9 } },
  { kategori: "harga_komoditas", headline: "Krisis kontainer global hambat distribusi", penjelasan: "Kopi tak bisa dikirim memicu penumpukan dan anjloknya harga spot.", efek: { hargaEksporModifier: 0.8 } },
  { kategori: "harga_komoditas", headline: "Harga bahan baku pupuk dunia meledak", penjelasan: "Ongkos produksi pesaing naik drastis memaksa penyesuaian harga global.", efek: { hargaEksporModifier: 1.15 } },
  { kategori: "harga_komoditas", headline: "Pengepul raksasa nyatakan bangkrut", penjelasan: "Banyak kopi terbuang, kepanikan membuat harga pasar sementara hancur.", efek: { hargaEksporModifier: 0.85 } },
  { kategori: "harga_komoditas", headline: "Bursa berjangka komoditas kopi baru dibuka", penjelasan: "Likuiditas meningkat memicu tren menanjak (bullish) untuk harga patokan.", efek: { hargaEksporModifier: 1.1 } },
  { kategori: "harga_komoditas", headline: "Negara adikuasa timbun cadangan strategis kopi", penjelasan: "Tindakan negara ini menyapu bersih stok global, harga melonjak.", efek: { hargaEksporModifier: 1.25 } },

  // --- 5. BENCANA PANEN (potong stok kopi: -10 hingga -40) ---
  { kategori: "bencana_panen", headline: "Hama penggerek serang kebun Eldoria", penjelasan: "Sebagian biji kopimu rusak membusuk sebelum sempat dipetik.", efek: { stokKopiDelta: -25 } },
  { kategori: "bencana_panen", headline: "Hujan deras membanjiri jalur pengeringan", penjelasan: "Sebagian stok kopi basah, berjamur, dan tak layak ekspor.", efek: { stokKopiDelta: -15 } },
  { kategori: "bencana_panen", headline: "Kemarau panjang memanggang bibit muda", penjelasan: "Cuaca ekstrem memangkas hasil drastis; kerugian panen besar.", efek: { stokKopiDelta: -35 } },
  { kategori: "bencana_panen", headline: "Pemogokan buruh petik lokal", penjelasan: "Kopi telat dipanen dan rontok ke tanah, hasil produksi berkurang.", efek: { stokKopiDelta: -20 } },
  { kategori: "bencana_panen", headline: "Abu vulkanik tutupi daun perkebunan", penjelasan: "Fotosintesis terhambat, buah kopi kerdil dan gagal panen.", efek: { stokKopiDelta: -30 } },
  { kategori: "bencana_panen", headline: "Longsor putus jalan desa", penjelasan: "Hasil panen menumpuk dan sebagian rusak sebelum bisa diangkut.", efek: { stokKopiDelta: -10 } },
  { kategori: "bencana_panen", headline: "Pencurian massal di gudang kebun", penjelasan: "Gerombolan pencuri membobol lumbung kopi di malam hari.", efek: { stokKopiDelta: -40 } },
  { kategori: "bencana_panen", headline: "Serangan jamur karat daun menyebar", penjelasan: "Epidemi tanaman mematikan ranting, panen menyusut drastis.", efek: { stokKopiDelta: -35 } },
  { kategori: "bencana_panen", headline: "Pupuk palsu beredar di pasaran lokal", penjelasan: "Tanaman kekurangan nutrisi asli, produksi bulan ini jeblok.", efek: { stokKopiDelta: -15 } },
  { kategori: "bencana_panen", headline: "Angin puting beliung rontokkan buah mentah", penjelasan: "Cuaca buruk merusak dahan, panen terpotong mendadak.", efek: { stokKopiDelta: -20 } },
  { kategori: "bencana_panen", headline: "Gajah liar tersesat masuk areal perkebunan", penjelasan: "Puluhan pohon tumbang dan stok tergencet mamalia besar.", efek: { stokKopiDelta: -25 } },
  { kategori: "bencana_panen", headline: "Karantina desa akibat wabah lokal", penjelasan: "Tidak ada warga yang berani ke kebun, panen menumpuk membusuk.", efek: { stokKopiDelta: -30 } },
  { kategori: "bencana_panen", headline: "Mesin pengupas kulit kopi rusak massal", penjelasan: "Proses panen terhenti, kopi segar menguning di keranjang.", efek: { stokKopiDelta: -15 } },
  { kategori: "bencana_panen", headline: "Serbuan ulat grayak memakan bunga kopi", penjelasan: "Gagal mekar, bakal buah mati di awal musim.", efek: { stokKopiDelta: -35 } },
  { kategori: "bencana_panen", headline: "Kebakaran semak menjalar ke tepi kebun", penjelasan: "Suhu ekstrem menghanguskan sebagian petak kopi siap panen.", efek: { stokKopiDelta: -40 } },

  // --- 6. KONDISI LOKAL (flavor, tanpa efek) ---
  { kategori: "kondisi_lokal", headline: "Pemilihan Kepala Desa Eldoria memanas", penjelasan: "Warga sibuk kampanye, namun aktivitas kebun tetap berjalan normal.", efek: {} },
  { kategori: "kondisi_lokal", headline: "Festival Panen tahunan digelar di alun-alun", penjelasan: "Suasana desa meriah; hiburan rakyat melepas penat warga.", efek: {} },
  { kategori: "kondisi_lokal", headline: "Koperasi Sylvarion buka layanan konsultasi", penjelasan: "Bantuan teknis kini tersedia; tak memengaruhi kas secara langsung.", efek: {} },
  { kategori: "kondisi_lokal", headline: "Jalan utama desa akhirnya diaspal", penjelasan: "Warga bersukacita, perjalanan ke pasar menjadi lebih nyaman.", efek: {} },
  { kategori: "kondisi_lokal", headline: "Gosip harta karun di hutan larangan", penjelasan: "Desa geger oleh rumor, meski tak ada yang berani membuktikan.", efek: {} },
  { kategori: "kondisi_lokal", headline: "Tim sepak bola Eldoria juarai liga antar-desa", penjelasan: "Euforia kemenangan menyelimuti desa selama beberapa hari.", efek: {} },
  { kategori: "kondisi_lokal", headline: "Pembangunan menara sinyal internet rampung", penjelasan: "Desa kini terkoneksi, warga sibuk mencoba gawai baru mereka.", efek: {} },
  { kategori: "kondisi_lokal", headline: "Kunjungan mendadak Wali Negeri ke kebun percontohan", penjelasan: "Aparat sibuk berbenah, warga hanya menonton dari jauh.", efek: {} },
  { kategori: "kondisi_lokal", headline: "Kemunculan satwa liar di pinggiran desa", penjelasan: "Petugas kehutanan turun tangan, tidak ada kebun yang rusak.", efek: {} },
  { kategori: "kondisi_lokal", headline: "Beredar mitos penjaga mata air desa", penjelasan: "Tetua adat menggelar syukuran kecil, kedamaian desa terjaga.", efek: {} },
  { kategori: "kondisi_lokal", headline: "Konser musik keliling singgah di Eldoria", penjelasan: "Hiburan semalam suntuk membuat buruh tani sedikit begadang.", efek: {} },
  { kategori: "kondisi_lokal", headline: "Renovasi pasar minggu telah selesai", penjelasan: "Lapak baru terlihat lebih bersih, aktivitas jual beli bergairah.", efek: {} },
  { kategori: "kondisi_lokal", headline: "Pernikahan mewah anak juragan tanah", penjelasan: "Jalanan sempat macet karena arak-arakan, namun segera lancar kembali.", efek: {} },
  { kategori: "kondisi_lokal", headline: "Pemuda desa galakkan aksi penghijauan", penjelasan: "Sebuah komunitas mulai menanam pohon rindang demi estetika desa.", efek: {} },
  { kategori: "kondisi_lokal", headline: "Desa tetangga pinjam alat pertanian", penjelasan: "Toleransi antar warga terjaga baik, alat segera dikembalikan utuh.", efek: {} }
];
```

## Cara pakai

```ts
// fallback acak (06 §6a)
function EVENT_CADANGAN() {
  return EVENT_CADANGAN_LIST[Math.floor(Math.random() * EVENT_CADANGAN_LIST.length)];
}

// template narasi (06 §news-cache, saat panggilan LLM gagal):
// untuk entri jadwal { kategori, efek }, ambil event cadangan ACAK yang
// kategorinya sama → pakai headline/penjelasan-nya, tapi PERTAHANKAN efek dari
// jadwal (karena efek = balance yang sudah diputuskan rencanakanTahun).
function narasiTemplate(entri) {
  const match = EVENT_CADANGAN_LIST.filter(e => e.kategori === entri.kategori);
  const c = match.length > 0 ? match[Math.floor(Math.random() * match.length)] : EVENT_CADANGAN_LIST[0];
  return { kategori: entri.kategori, headline: c.headline, penjelasan: c.penjelasan, efek: entri.efek };
}
```

> **Catatan:** Untuk `narasiTemplate`, kode di atas mengambil event cadangan secara acak berdasarkan kategori, untuk mencegah pengulangan berlebih jika AI gagal *generate* berulang kali. Efek dari jadwal (angka riil) akan dipertahankan.