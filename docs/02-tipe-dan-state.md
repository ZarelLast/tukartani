# 02 — Tipe & State (SUMBER KEBENARAN TIPE)

> **Tujuan file:** mendefinisikan semua bentuk data. **Tidak ada file lain yang
> boleh mendefinisikan ulang tipe ini.** Kalau butuh field baru, tambahkan di
> SINI, lalu beri tahu file yang terdampak.
>
> **Bergantung pada:** `01-konsep-dan-loop.md` (fase), `04-difficulty.md` (nilai awal).
> **Dipakai oleh:** semua file.
> **JANGAN sentuh di sini:** rumus (itu `03`), prompt AI (itu `06`).

---

## GameState

```ts
type GameState = {
  // identitas & meta
  namaPetani: string;       // input pemain (maks 20 char, default "Pak Tani")
  namaKebun: string;        // input pemain (maks 20 char, default "Kebun Mukti")
  mode: "easy" | "medium" | "hard";
  totalGiliran: number;     // dari DIFFICULTY (12/36/60) — lihat 04
  giliran: number;          // 1..totalGiliran
  seed: number;             // untuk RNG deterministik (anti save-scum) — lihat 07

  // uang & kurs
  kasSelga: number;            // uang lokal
  kasGC: number;            // simpanan mata uang dunia (TIDAK menghasilkan apa pun)
  kurs: number;             // Selga per 1 GC (mulai 15.000)
  riwayatKurs: number[];    // untuk grafik garis

  // produksi
  stokKopi: number;         // kg siap jual
  panenTerakhir: number;    // kg panen bulan ini (untuk menghitung tagihan listrik)
  stokPupuk: number;        // unit; habis = panen anjlok ke lantai 15%
  stokBBM: number;          // unit; wajib untuk transportasi saat JUAL_KOPI
  stokBibit: number;        // unit; wajib untuk aksi TANAM (ekspansi kebun)
  faktorTanam: number;      // 1.0 default; naik via aksi Investasi (maks 1.5)

  // kewajiban
  pinjaman: number;         // sisa pokok pinjaman koperasi (Selga)
  biayaKeluargaLokal: number;   // komponen lokal (Selga), naik tiap tahun
  biayaKeluargaImporGC: number; // komponen impor (GC), naik tiap tahun

  // kondisi & narasi
  omzetTahunIni: number;    // total penjualan dalam setahun (reset tiap kelipatan 12) untuk PTKP
  kesejahteraan: number;    // 0..100 — TARUHAN (jadi multiplier skor), bukan hiasan
  beritaTerkini: Berita | null;
  riwayatBerita: Berita[];  // berita yang SUDAH muncul (konteks penasihat + rapor). Append tiap giliran.
  antrianBerita: Berita[];  // CACHE berita pra-generate yang BELUM muncul (lihat 06 §news-cache)
  log: string[];            // narasi kejadian per giliran (bahan rapor edukasi)
  fase: Fase;
};

type Fase = "berita" | "panen" | "keputusan" | "resolusi" | "selesai";
```

### Nilai awal (kasSelga dari difficulty, sisanya tetap)

| Field | Nilai awal |
|---|---|
| kasGC | 0 |
| kurs | 15.000 |
| riwayatKurs | [15.000] |
| riwayatBerita | [] |
| antrianBerita | [] (diisi saat sesi mulai / awal tahun, lihat 06 §news-cache) |
| stokKopi | 100 |
| stokPupuk | 4 |
| stokBBM | 2 |
| stokBibit | 0 |
| faktorTanam | 1.0 |
| panenTerakhir | 0 |
| pinjaman | 0 |
| biayaKeluargaLokal | 150.000 |
| biayaKeluargaImporGC | 10 |
| omzetTahunIni | 0 |
| kesejahteraan | 70 |
| giliran | 1 |
| fase | "berita" |

> `kasSelga`, `totalGiliran`, dan parameter gejolak diisi dari `04-difficulty.md`.

---

## Berita (output mesin kejadian)

```ts
type KategoriBerita =
  | "kebijakan_moneter"   // -> gerak kurs
  | "permintaan_ekspor"   // -> hargaEksporModifier
  | "bencana_panen"       // -> stokKopiDelta (negatif)
  | "krisis_global"       // -> kurs POSITIF (Selga MELEMAH) + impor mahal via kurs
  | "harga_komoditas"     // -> hargaEksporModifier
  | "kondisi_lokal";      // flavor; dampak kecil/none

type Berita = {
  kategori: KategoriBerita;
  headline: string;         // maks 80 char
  penjelasan: string;       // 1-2 kalimat awam, maks 200 char
  efek: {                   // SEMUA opsional & SELALU di-clamp (lihat 06)
    kurs?: -3 | -2 | -1 | 0 | 1 | 2 | 3;   // + = Selga melemah
    stokKopiDelta?: number;                 // negatif kecil
    hargaEksporModifier?: number;           // 0.8..1.3
    // CATATAN: TIDAK ADA hargaImporModifier. Impor ikut kurs saja (lihat 03).
  };
};
```

---

## Kontrak Aksi Reducer (tipe action — logikanya di `05`)

```ts
type Aksi =
  | { type: "JUAL_KOPI";   payload: { kg: number; konversiKeSelga: boolean } }
  | { type: "BELI_IMPOR";  payload: { pupuk: number; bbm: number } }
  | { type: "TUKAR";       payload: { arah: "SELGA_KE_GC" | "GC_KE_SELGA"; jumlah: number } }
  | { type: "TANAM";       payload: { investasiSelga: number } }
  | { type: "KOPERASI";    payload: { aksi: "PINJAM" | "BAYAR" | "BANTU_TETANGGA"; jumlah: number } }
  | { type: "LEWATI" }
  | { type: "LANJUT_BULAN" }     // memicu Resolusi + Berita + Panen giliran berikut
  | { type: "MULAI";       payload: { mode; namaPetani; namaKebun; seed } }
  | { type: "MUAT";        payload: GameState };
```

> **Aturan reducer:** murni (tanpa side-effect), deterministik diberi `seed`.
> Semua perhitungan angka memanggil fungsi dari `03-ekonomi.md`. Reducer hanya
> merangkai: validasi → panggil rumus → state baru. Detail tiap aksi di `05`.
