/**
 * 03 — Model Ekonomi (SUMBER KEBENARAN RUMUS & KONSTANTA)
 * SATU-SATUNYA tempat rumus & konstanta ekonomi hidup.
 * Dari docs/03-ekonomi.md
 */

// ===== §Konstanta =====

// Kurs
export const KURS_AWAL = 15_000;
export const DRIFT = 0.004;          // Selga melemah ~0.4%/giliran
export const KURS_MIN = 8_000;
export const KURS_MAX = 30_000;
export const DAMPAK_PER_ARAH = 0.04; // tiap poin arah berita = ±4%

// Konversi
export const SPREAD = 0.015;         // 1.5% gesekan tiap tukar Selga<->GC

// Harga (dalam GC)
export const HARGA_KOPI_GC  = 4.2;   // GC per kg
export const HARGA_PUPUK_GC = 8.0;   // GC per unit
export const HARGA_BBM_GC   = 1.0;   // GC per unit
export const HARGA_BIBIT_GC = 12.0;  // GC per unit
export const KAPASITAS_KG_PER_BBM = 25; // 1 BBM bisa mengangkut max 25 kg kopi

// Panen & depresiasi
export const BASIS_PANEN = 60;       // kg per giliran kondisi ideal
export const KEBUTUHAN_PUPUK = 2;    // unit pupuk terpakai per panen
export const FAKTOR_TANAM_MAKS = 1.5;
export const KEBUTUHAN_BIBIT_PER_0_1 = 1;
export const PENYUSUTAN_KEBUN_TAHUNAN = 0.1;
export const LANTAI_PANEN = 0.15;    // panen minimum saat pupuk habis

// Inventaris
export const SPOILAGE_KOPI_BULANAN = 0.05; // 5% kopi membusuk tiap bulan

// Sink (biaya tetap & variabel)
export const BIAYA_KELUARGA_LOKAL = 1_650_000;
export const BIAYA_KELUARGA_IMPOR_GC = 38;
export const PBB_PER_0_1 = 50_000;
export const LISTRIK_DASAR = 100_000;
export const LISTRIK_PER_KG_PANEN = 1_500;

// Pajak PPh UMKM
export const PPH_FINAL_UMKM = 0.005;
export const PTKP_UMKM = 500_000_000;

// Kesejahteraan
export const DECAY_SEJAHTERA = 1;
export const PENALTI_LIKUIDASI = 8;

// ===== Utility =====

export function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

export function clampInt(val, min, max) {
  if (typeof val !== 'number' || isNaN(val)) return 0;
  return Math.round(clamp(val, min, max));
}

export function clampNum(val, min, max) {
  if (typeof val !== 'number' || isNaN(val)) return min;
  return clamp(val, min, max);
}

// ===== §kurs — Pergerakan Kurs =====

/**
 * Menggerakkan kurs berdasarkan arah berita, volatilitas, dan drift.
 * @param {number} kurs - Kurs saat ini
 * @param {number} arah - Arah berita (-3..3), + = Selga melemah
 * @param {number} volat - Volatilitas dari difficulty config
 * @param {function} rng - Fungsi RNG yang sudah di-seed
 */
export function gerakkanKurs(kurs, arah, volat, rng) {
  const dampak = arah * DAMPAK_PER_ARAH;
  const noise  = (rng() - 0.5) * 2 * volat;
  const kursBaru = kurs * (1 + dampak + noise + DRIFT);
  return Math.round(clamp(kursBaru, KURS_MIN, KURS_MAX));
}

// ===== §harga — Ekspor & Impor =====

/**
 * Menghitung hasil penjualan kopi dalam GC.
 */
export function hitungHasilJualGC(kg, hargaEksporModifier) {
  return kg * HARGA_KOPI_GC * hargaEksporModifier;
}

/**
 * Menghitung biaya beli impor dalam Selga.
 */
export function hitungBiayaImpor(pupuk, bbm, bibit, kurs) {
  return (pupuk * HARGA_PUPUK_GC + bbm * HARGA_BBM_GC + bibit * HARGA_BIBIT_GC) * kurs;
}

// ===== §panen — Faucet Kopi =====

/**
 * Melakukan panen: spoilage → hitung hasil → kurangi pupuk.
 * Memodifikasi state secara langsung.
 * @param {object} s - GameState
 */
export function panen(s) {
  // Spoilage
  s.stokKopi = Math.floor(s.stokKopi * (1 - SPOILAGE_KOPI_BULANAN));

  const efektivitas = clamp(s.stokPupuk / KEBUTUHAN_PUPUK, LANTAI_PANEN, 1.0);
  const hasil = Math.round(BASIS_PANEN * efektivitas * s.faktorTanam);
  s.stokKopi += hasil;
  s.panenTerakhir = hasil;
  s.stokPupuk = Math.max(0, s.stokPupuk - KEBUTUHAN_PUPUK);
  return hasil;
}

// ===== §konversi — Selga ↔ GC =====

export function selgaKeGc(jumlahSelga, kurs) {
  return (jumlahSelga / kurs) * (1 - SPREAD);
}

export function gcKeSelga(jumlahGC, kurs) {
  return (jumlahGC * kurs) * (1 - SPREAD);
}

// ===== §tagihan-bulanan — Sink Wajib =====

/**
 * Memungut tagihan bulanan: Listrik, PBB, Biaya Keluarga.
 * Juga menangani inflasi & penyusutan tiap awal tahun.
 * @param {object} s - GameState
 * @param {number} inflasiBiayaHidup - Dari config difficulty
 */
export function pungutTagihanBulanan(s, inflasiBiayaHidup) {
  // 1. Tagihan Listrik
  const tagihanListrik = LISTRIK_DASAR + (s.panenTerakhir * LISTRIK_PER_KG_PANEN);

  // 2. PBB (hanya di akhir tahun pajak: giliran 12, 24, 36...)
  let tagihanPBB = 0;
  if (s.giliran > 0 && s.giliran % 12 === 0) {
    tagihanPBB = s.faktorTanam * 10 * PBB_PER_0_1;
  }

  // 3. Biaya Keluarga
  const biayaKeluargaBulanan = s.biayaKeluargaLokal + (s.biayaKeluargaImporGC * s.kurs);

  const totalTagihan = Math.round(tagihanListrik + tagihanPBB + biayaKeluargaBulanan);
  s.kasSelga -= totalTagihan;

  // Inflasi & penyusutan tiap awal tahun (giliran 13, 25, 37...)
  let inflasiTerjadi = false;
  if (s.giliran > 1 && (s.giliran - 1) % 12 === 0) {
    s.biayaKeluargaLokal = Math.round(s.biayaKeluargaLokal * (1 + inflasiBiayaHidup));
    s.biayaKeluargaImporGC = Math.round(s.biayaKeluargaImporGC * (1 + inflasiBiayaHidup));
    s.faktorTanam = Math.max(1.0, s.faktorTanam - PENYUSUTAN_KEBUN_TAHUNAN);
    inflasiTerjadi = true;
  }

  // Return info untuk logging
  return { totalTagihan, tagihanListrik, tagihanPBB, biayaKeluargaBulanan, inflasiTerjadi };
}

// ===== §koperasi — Pinjaman =====

export function pinjamMaks(s, cfg) {
  return s.kasSelga * cfg.capPinjaman;
}

export function pungutBunga(s, cfg) {
  if (s.pinjaman <= 0) return 0;

  // Bunga floating: naik jika kurs melemah
  const bungaAktual = cfg.bungaKoperasi * Math.max(1, s.kurs / KURS_AWAL);
  const bunga = Math.round(s.pinjaman * bungaAktual);

  // Bunga ditambahkan ke pinjaman (compound interest)
  s.pinjaman += bunga;

  return bunga; // Return untuk logging di reducer
}

// ===== §kesejahteraan =====

export function tekanKesejahteraan(s) {
  const sebelum = s.kesejahteraan;
  s.kesejahteraan = clamp(s.kesejahteraan - DECAY_SEJAHTERA, 0, 100);
  return sebelum - s.kesejahteraan; // Return decay amount
}

// ===== §bangkrut — Auto-Likuidasi =====

/**
 * Mencover defisit dengan menjual GC dan kopi paksa.
 * @param {object} s - GameState
 * @param {object} cfg - Difficulty config
 * @returns {boolean} true = tetap defisit → BANGKRUT
 */
export function coverDefisit(s, cfg) {
  let terpaksaJual = false;

  // 1) Jual GC secukupnya
  if (s.kasSelga < 0 && s.kasGC > 0) {
    const gcPerlu = Math.min(s.kasGC, (-s.kasSelga) / (s.kurs * (1 - SPREAD)));
    s.kasGC -= gcPerlu;
    s.kasSelga += gcKeSelga(gcPerlu, s.kurs);
    terpaksaJual = true;
  }

  // 2) Jual kopi paksa
  if (s.kasSelga < 0 && s.stokKopi > 0) {
    const selgaPerKg = HARGA_KOPI_GC * s.kurs * (1 - SPREAD);
    const kgJual = Math.min(s.stokKopi, Math.ceil((-s.kasSelga) / selgaPerKg));
    s.stokKopi -= kgJual;
    s.kasSelga += kgJual * selgaPerKg;
    terpaksaJual = true;
  }

  if (terpaksaJual) {
    s.kesejahteraan = clamp(s.kesejahteraan - PENALTI_LIKUIDASI, 0, 100);
  }

  return s.kasSelga < 0;
}


// ===== §investasi — Tanam =====

/**
 * Meningkatkan faktorTanam, dibatasi FAKTOR_TANAM_MAKS.
 * @param {object} s - GameState
 * @param {number} jumlahBibit - Bibit yang ditanam
 */
export function tanam(s, jumlahBibit) {
  const naik = (jumlahBibit / KEBUTUHAN_BIBIT_PER_0_1) * 0.1;
  s.faktorTanam = Math.min(FAKTOR_TANAM_MAKS, s.faktorTanam + naik);
}

// ===== §bantu tetangga =====

export function naikSejahtera(jumlah) {
  return Math.floor(jumlah / 100_000);
}