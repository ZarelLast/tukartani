# 03 — Model Ekonomi (SUMBER KEBENARAN RUMUS & KONSTANTA)

> **Tujuan file:** SATU-SATUNYA tempat rumus & konstanta ekonomi hidup. File
> lain **merujuk** nama konstanta, **tidak menyalin/mengarang** nilainya.
> Ini jantung game — kalau angka di sini berubah, balance berubah.
>
> **Bergantung pada:** `02-tipe-dan-state.md` (bentuk state).
> **Dipakai oleh:** `05-aksi`, `06-ai`, `08-skor`, `04-difficulty` (mengisi parameter).
> **JANGAN langgar:** bagian **§Invariant** di bawah. Mengubah angka boleh,
> melanggar invariant tidak.

---

## §Konstanta (semua angka tunggal ada di sini)

```ts
// kurs
export const KURS_AWAL = 15_000;
export const DRIFT = 0.004;          // Selga melemah ~0.4%/giliran (alasan pegang GC)
export const KURS_MIN = 8_000;
export const KURS_MAX = 30_000;
export const DAMPAK_PER_ARAH = 0.04; // tiap poin arah berita = ±4%

// konversi
export const SPREAD = 0.015;         // 1.5% gesekan tiap tukar Selga<->GC

// harga (dalam GC) — DIKALIBRASI via simulasi (lihat 10 §kalibrasi). Default
// lama (2.0/4.0/60) bikin snowball 2,7x di Easy; angka ini beri ramp ~1,6x.
export const HARGA_KOPI_GC  = 1.6;   // GC per kg, harga dunia dasar
export const HARGA_PUPUK_GC = 6.0;   // GC per unit
export const HARGA_BBM_GC   = 1.5;   // GC per unit
export const HARGA_BIBIT_GC = 15.0;  // GC per unit (bibit harganya ikut valas)
export const KAPASITAS_KG_PER_BBM = 20; // 1 BBM bisa mengangkut max 20 kg kopi

// panen
export const BASIS_PANEN = 40;       // kg per giliran kondisi ideal
export const KEBUTUHAN_PUPUK = 2;    // unit pupuk terpakai per panen
export const FAKTOR_TANAM_MAKS = 1.5;
export const KEBUTUHAN_BIBIT_PER_0_1 = 1; // butuh 1 bibit untuk naik faktor 0.1
export const LANTAI_PANEN = 0.15;    // panen minimum saat pupuk habis (hukuman agar tidak eksploit)

// sink (biaya tetap & variabel)
export const BIAYA_KELUARGA_LOKAL = 150_000;  // Kebutuhan dasar komponen lokal (Selga)
export const BIAYA_KELUARGA_IMPOR_GC = 10;    // Kebutuhan komponen impor (GC) -> INFLASI IMPOR
export const PBB_PER_0_1 = 30_000;            // Pajak Bumi & Bangunan per 0.1 faktorTanam
export const LISTRIK_DASAR = 25_000;          // Tagihan listrik statis
export const LISTRIK_PER_KG_PANEN = 500;      // Listrik dinamis pemrosesan kopi (per kg panen)

// pajak PPh UMKM Realistis (Omzet di atas 500 Juta)
export const PPH_FINAL_UMKM = 0.005;          // 0.5% dari omzet penjualan
export const PTKP_UMKM = 500_000_000;         // Batas Penghasilan Tidak Kena Pajak per tahun

// kesejahteraan
export const DECAY_SEJAHTERA = 1;     // turun tiap giliran (hidup keras); diimbangi BANTU_TETANGGA
export const PENALTI_LIKUIDASI = 8;   // hit saat terpaksa jual aset utk nutup biaya hidup

// koperasi — bunga & cap ADA DI cfg PER-MODE (lihat 04), BUKAN konstanta tunggal,
// karena invariant anti-leverage menuntut bunga > DRIFT + volat/2 (beda tiap mode).

// (biaya tanam kini menggunakan stokBibit)
```

> `volat`, `maxArah`, `peluangKrisis`, `inflasiBiayaHidup`, `kasAwal`,
> `totalGiliran`, **`bungaKoperasi`, `capPinjaman`** per-mode ada di
> `04-difficulty.md` dan disuntik ke fungsi sebagai `cfg`.

---

## §kurs — Pergerakan Kurs (dengan drift)

```ts
function gerakkanKurs(kurs, arah, volat, rng) {
  const dampak = arah * DAMPAK_PER_ARAH;
  const noise  = (rng() - 0.5) * 2 * volat;   // ±volat, rng ber-seed (lihat 07)
  const kursBaru = kurs * (1 + dampak + noise + DRIFT);
  return Math.round(clamp(kursBaru, KURS_MIN, KURS_MAX));
}
```

- **DRIFT positif** = Selga cenderung melemah pelan → alasan riil pegang GC.
- **Krisis global → arah POSITIF (Selga melemah)** karena modal lari ke GC.
  Konsistensi ini dipaksakan di `06-ai-integrasi.md` (clamp kategori krisis).

## §harga — Ekspor & Impor

```ts
// JUAL kopi → dibayar GC (lalu opsional tukar ke Selga via §konversi)
hasilGC = kg * HARGA_KOPI_GC * hargaEksporModifier;   // modifier 0.8..1.3

// BELI impor → harga Selga = harga GC * kurs. TANPA modifier ganda.
biayaPupukSelga = unit * HARGA_PUPUK_GC * kurs;
biayaBbmSelga   = unit * HARGA_BBM_GC   * kurs;
```

> **Catatan desain:** impor naik HANYA karena kurs naik. Tidak ada
> `hargaImporModifier` — itu akan menghitung efek kurs dua kali & mengaburkan
> sebab-akibat (fatal untuk game edukasi).

## §panen — Faucet Kopi

```ts
function panen(s) {
  const efektivitas = clamp(s.stokPupuk / KEBUTUHAN_PUPUK, LANTAI_PANEN, 1.0);
  const hasil = Math.round(BASIS_PANEN * efektivitas * s.faktorTanam);
  s.stokKopi += hasil;
  s.panenTerakhir = hasil; // Catat untuk tagihan listrik dinamis di akhir bulan
  s.stokPupuk = Math.max(0, s.stokPupuk - KEBUTUHAN_PUPUK);
  return hasil;
}
```
Tanpa pupuk → panen turun ke 15% (lantai), tidak nol, agar pemain bisa pulih.

## §konversi — Selga ↔ GC (spread, anti-arbitrase)

```ts
function selgaKeGc(jumlahSelga, kurs) { return (jumlahSelga / kurs) * (1 - SPREAD); }
function gcKeSelga(jumlahGC, kurs) { return (jumlahGC * kurs) * (1 - SPREAD); }
```

## §tagihan-bulanan — Sink Wajib (Utilitas, Pajak, Keluarga)

```ts
function pungutTagihanBulanan(s, inflasiBiayaHidup) {
  // 1. Tagihan Listrik (Dasar + Variabel berdasarkan mesin produksi)
  const tagihanListrik = LISTRIK_DASAR + (s.panenTerakhir * LISTRIK_PER_KG_PANEN);
  
  // 2. PBB (Pajak Bumi & Bangunan proporsional ukuran kebun) - DITARIK TAHUNAN
  let tagihanPBB = 0;
  if (s.giliran > 0 && s.giliran % 12 === 0) {
    // Menghitung pajak total dari ukuran utuh kebun (1.0 = 10 unit 0.1)
    tagihanPBB = s.faktorTanam * 10 * PBB_PER_0_1; 
  }
  
  // 3. Biaya Keluarga (Inflasi Impor = membengkak saat kurs naik)
  const biayaKeluargaBulanan = s.biayaKeluargaLokal + (s.biayaKeluargaImporGC * s.kurs);

  const totalTagihan = Math.round(tagihanListrik + tagihanPBB + biayaKeluargaBulanan);
  s.kasSelga -= totalTagihan;

  // inflasi biaya keluarga tiap awal tahun
  if (s.giliran > 1 && (s.giliran - 1) % 12 === 0) {
    s.biayaKeluargaLokal = Math.round(s.biayaKeluargaLokal * (1 + inflasiBiayaHidup));
    s.biayaKeluargaImporGC = Math.round(s.biayaKeluargaImporGC * (1 + inflasiBiayaHidup));
  }
}
```
Dipungut tiap Fase Resolusi, **sebelum** cek kalah (`08-skor-dan-rapor.md`).

## §koperasi — Pinjaman (bunga & cap per-mode dari cfg)

```ts
function pinjamMaks(s, cfg) { return s.kasSelga * cfg.capPinjaman; }
function pungutBunga(s, cfg) { s.kasSelga -= Math.round(s.pinjaman * cfg.bungaKoperasi); }
```

## §kesejahteraan — Drain & Pemulihan (TANPA ini, kondisi kalah mustahil)

```ts
// turun tiap Resolusi (hidup keras). Naik via BANTU_TETANGGA (05).
function tekanKesejahteraan(s) {
  s.kesejahteraan = clamp(s.kesejahteraan - DECAY_SEJAHTERA, 0, 100);
}
```
> **Kenapa wajib:** tanpa drain, `kesejahteraan` hanya naik → kondisi kalah
> "keluarga hancur" (`<=0`) tak pernah tercapai & multiplier skor (`08`) selalu
> ke maksimum. Drain `-1`/giliran membuat **BANTU_TETANGGA jadi keputusan
> berulang**, bukan sekali klik. Di Hard (60 giliran), abai total → mendekati 10.

## §bangkrut — Auto-Likuidasi (aturan tegas, dipakai 05/08)

```ts
// dipanggil saat Resolusi jika kasSelga < 0 setelah biaya hidup & bunga
function coverDefisit(s, cfg) {
  let terpaksaJual = false;
  // 1) jual GC secukupnya
  if (s.kasSelga < 0 && s.kasGC > 0) {
    const gcPerlu = Math.min(s.kasGC, (-s.kasSelga) / (s.kurs * (1 - SPREAD)));
    s.kasGC -= gcPerlu; s.kasSelga += gcKeSelga(gcPerlu, s.kurs); terpaksaJual = true;
  }
  // 2) jual kopi paksa secukupnya (harga dasar, tanpa modifier)
  if (s.kasSelga < 0 && s.stokKopi > 0) {
    const selgaPerKg = HARGA_KOPI_GC * s.kurs * (1 - SPREAD);
    const kgJual = Math.min(s.stokKopi, Math.ceil((-s.kasSelga) / selgaPerKg));
    s.stokKopi -= kgJual; s.kasSelga += kgJual * selgaPerKg; terpaksaJual = true;
  }
  if (terpaksaJual) s.kesejahteraan = clamp(s.kesejahteraan - PENALTI_LIKUIDASI, 0, 100);
  return s.kasSelga < 0; // true = tetap defisit → BANGKRUT (08)
}
```

## §jadwal — rencanakanTahun (SCHEDULER NEWS, dipakai 06 §news-cache)

Menentukan **mekanik** 12 berita setahun secara deterministik dari `seed`,
menghormati `cfg.peluangKrisis` & `cfg.maxArah`. LLM hanya menarasikan (06).
Ini yang mengikat balance — kategori & angka **tidak** boleh diserahkan ke LLM.

```ts
function rencanakanTahun(seedDasar, tahunKe, cfg) {
  const rng = rngGiliran(seedDasar, 1000 + tahunKe); // namespace ≠ noise kurs (07 §RNG)
  const out = [];
  for (let i = 0; i < 12; i++) {
    const r = rng();
    if (r < cfg.peluangKrisis) {
      // krisis: Selga MELEMAH (arah positif), dibatasi maxArah
      out.push({ kategori: "krisis_global",
                 efek: { kurs: 1 + Math.floor(rng() * cfg.maxArah) } }); // 1..maxArah
    } else {
      out.push(pilihNonKrisis(rng, cfg.maxArah));
    }
  }
  return out; // 12 entri { kategori, efek }  → diberi headline/penjelasan oleh LLM
}

function pilihNonKrisis(rng, maxArah) {
  const k = rng();
  if (k < 0.25) { // kebijakan_moneter: arah ± (boleh menguatkan Selga)
    let a = Math.floor(rng() * (2 * maxArah + 1)) - maxArah; // -maxArah..maxArah
    if (a === 0) a = 1;
    return { kategori: "kebijakan_moneter", efek: { kurs: a } };
  }
  if (k < 0.45) return { kategori: "permintaan_ekspor", efek: { hargaEksporModifier: rentang(rng, 0.8, 1.3) } };
  if (k < 0.65) return { kategori: "harga_komoditas",  efek: { hargaEksporModifier: rentang(rng, 0.8, 1.3) } };
  if (k < 0.80) return { kategori: "bencana_panen",    efek: { stokKopiDelta: -(10 + Math.floor(rng() * 31)) } }; // -10..-40
  return { kategori: "kondisi_lokal", efek: {} }; // flavor, tanpa efek
}
const rentang = (rng, lo, hi) => Math.round((lo + rng() * (hi - lo)) * 100) / 100;
```
> **Hasil:** `maxArah` & `peluangKrisis` (`04`) sekarang **benar-benar dikonsumsi**.
> Easy (`maxArah:2`) tak pernah kena swing ±3. Frekuensi krisis terkontrol per mode.

## §investasi — Tanam

```ts
// menaikkan faktorTanam, dibatasi FAKTOR_TANAM_MAKS
function tanam(s, jumlahBibit) {
  const naik = (jumlahBibit / KEBUTUHAN_BIBIT_PER_0_1) * 0.1;
  s.faktorTanam = Math.min(FAKTOR_TANAM_MAKS, s.faktorTanam + naik);
}
```

---

## §Invariant — JANGAN DILANGGAR (ini yang menjaga game tak bisa di-exploit)

Dua pertidaksamaan ini **harus** benar di semua mode. Kalau melanggar, arbitrase
& leverage jadi strategi dominan dan game mati:

1. **Anti-leverage:** `cfg.bungaKoperasi > DRIFT + (volat / 2)` (per mode, `04`)
   → pinjam untuk arbitrase selalu rugi secara ekspektasi.
2. **Anti-arbitrase:** `2 * SPREAD > gerak_kurs_yang_bisa_diprediksi_pemain`
   → tukar bolak-balik untung hanya kalau berani ambil risiko, bukan pasti.

**Status: TERSELESAIKAN per-mode.** Karena `bungaKoperasi` kini per-mode (`04`),
invariant #1 dipenuhi di tiap mode:

| Mode | DRIFT + volat/2 | bungaKoperasi | Aman? |
|---|---|---|---|
| Easy | 0,004 + 0,015 = 0,019 | 0,03 | ✅ |
| Medium | 0,004 + 0,025 = 0,029 | 0,04 | ✅ |
| Hard | 0,004 + 0,040 = 0,044 | 0,05 | ✅ |

Untuk #2 (anti-arbitrase), `2 × SPREAD = 0,03` menahan tukar bolak-balik yang
"pasti untung"; gerak yang melampaui itu selalu berisiko (noise + arah tak pasti).

> Kalau mengubah `volat` sebuah mode, **cek ulang tabel di atas**: `bungaKoperasi`
> mode itu harus tetap > `DRIFT + volat/2`. Ini satu-satunya aturan yang, jika
> dilanggar, menghidupkan kembali eksploit leverage.
