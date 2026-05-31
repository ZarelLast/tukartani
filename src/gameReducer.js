/**
 * gameReducer — Mesin Status GameState
 * Reducer murni: validasi → panggil rumus ekonomi → state baru.
 * Dari docs/02-tipe-dan-state.md (tipe Aksi) + docs/05-aksi-pemain.md (logika)
 */

import { DIFFICULTY } from './difficulty.js';
import {
  KURS_AWAL, KURS_MIN, KURS_MAX,
  HARGA_KOPI_GC, KAPASITAS_KG_PER_BBM,
  SPREAD, PPH_FINAL_UMKM, PTKP_UMKM,
  FAKTOR_TANAM_MAKS, DECAY_SEJAHTERA, PENALTI_LIKUIDASI,
  clamp,
  gerakkanKurs, hitungHasilJualGC, hitungBiayaImpor,
  selgaKeGc, gcKeSelga,
  panen, pungutTagihanBulanan, pungutBunga,
  tekanKesejahteraan, coverDefisit, tanam, naikSejahtera,
} from './ekonomi.js';
import { rencanakanTahun } from './newsCache.js';
import { rngGiliran } from './rng.js';
import { EVENT_CADANGAN, narasiTemplate } from './eventCadangan.js';
import { simpanGame } from './save.js';

// ===== State Awal =====

/**
 * stateAwal() tanpa arg → fase 'belum_mulai' (StartScreen)
 * stateAwal(mode, nama, kebun, seed) → state game siap MULAI
 */
function _stateAwal(mode, namaPetani, namaKebun, seed) {
  const cfg = DIFFICULTY[mode];
  return {
    namaPetani: namaPetani || 'Pak Tani',
    namaKebun: namaKebun || 'Kebun Eldoria',
    mode,
    totalGiliran: cfg.totalGiliran,
    giliran: 1,
    seed,
    kasSelga: cfg.kasAwal,
    kasGC: 0,
    kurs: KURS_AWAL,
    riwayatKurs: [KURS_AWAL],
    stokKopi: 100,
    panenTerakhir: 0,
    stokPupuk: 4,
    stokBBM: 4,
    stokBibit: 0,
    faktorTanam: 1.0,
    pinjaman: 0,
    biayaKeluargaLokal: 1_650_000,
    biayaKeluargaImporGC: 38,
    omzetTahunIni: 0,
    kesejahteraan: 70,
    beritaTerkini: null,
    riwayatBerita: [],
    antrianBerita: [],
    log: [],
    fase: 'berita',
  };
}

export function stateAwal() {
  return {
    namaPetani: 'Pak Tani',
    namaKebun: 'Kebun Eldoria',
    mode: 'easy',
    totalGiliran: 12,
    giliran: 1,
    seed: 0,
    kasSelga: 24_000_000,
    kasGC: 0,
    kurs: KURS_AWAL,
    riwayatKurs: [KURS_AWAL],
    stokKopi: 100,
    panenTerakhir: 0,
    stokPupuk: 4,
    stokBBM: 4,
    stokBibit: 0,
    faktorTanam: 1.0,
    pinjaman: 0,
    biayaKeluargaLokal: 1_650_000,
    biayaKeluargaImporGC: 38,
    omzetTahunIni: 0,
    kesejahteraan: 70,
    beritaTerkini: null,
    riwayatBerita: [],
    antrianBerita: [],
    log: [],
    fase: 'belum_mulai',
  };
}

// ===== Reducer =====

export function gameReducer(state, action) {
  switch (action.type) {

    case 'MULAI': {
      const { mode, namaPetani, namaKebun, seed, antrianBerita } = action.payload;
      const cfg = DIFFICULTY[mode];
      const s = _stateAwal(mode, namaPetani, namaKebun, seed || Date.now());
      // Terima antrian berita dari App.jsx (sudah di-generate sync/async)
      s.antrianBerita = antrianBerita || [];
      const rng = rngGiliran(s.seed, s.giliran);
      mulaiGiliran(s, cfg, rng);
      return s;
    }

    case 'UPDATE_ANTRIAN': {
      // Dipanggil App.jsx saat awal tahun baru (generate berita via AI/sync)
      return { ...state, antrianBerita: action.payload || [] };
    }

    case 'PANEN_SELESAI': {
      // Transisi dari fase berita → keputusan (setelah pemain baca berita)
      if (state.fase !== 'berita') return state;
      return { ...state, fase: 'keputusan' };
    }

    case 'MUAT': {
      return { ...action.payload };
    }

    case 'JUAL_KOPI': {
      if (state.fase !== 'keputusan') return state;
      const { kg, konversiKeSelga } = action.payload;
      const s = { ...state, log: [...state.log] };

      // Validasi
      if (!kg || kg <= 0 || kg > s.stokKopi) return state;
      const bbmPerlu = Math.ceil(kg / KAPASITAS_KG_PER_BBM);
      if (s.stokBBM < bbmPerlu) return state;

      // Hitung hasil
      const eksporModifier = s.beritaTerkini?.efek?.hargaEksporModifier ?? 1.0;
      const hasilGC = hitungHasilJualGC(kg, eksporModifier);

      s.stokKopi -= kg;
      s.stokBBM -= bbmPerlu;

      // Konversi ke Selga untuk omzet
      const nilaiSelga = Math.round(gcKeSelga(hasilGC, s.kurs));
      const omzetSebelumnya = s.omzetTahunIni;
      s.omzetTahunIni += nilaiSelga;

      // PPh Final UMKM
      let potonganPajak = 0;
      const porsiKenaPajak = Math.max(0, s.omzetTahunIni - Math.max(omzetSebelumnya, PTKP_UMKM));
      if (porsiKenaPajak > 0) {
        potonganPajak = Math.round(porsiKenaPajak * PPH_FINAL_UMKM);
      }

      if (konversiKeSelga) {
        s.kasSelga += nilaiSelga - potonganPajak;
        if (potonganPajak > 0) {
          s.log.push(`[Bulan ${s.giliran}] JUAL ${kg}kg kopi → +${fmt(nilaiSelga - potonganPajak)} Selga (setelah PPh ${fmt(potonganPajak)})`);
        } else {
          s.log.push(`[Bulan ${s.giliran}] JUAL ${kg}kg kopi → +${fmt(nilaiSelga)} Selga`);
        }
      } else {
        s.kasGC += hasilGC;
        s.kasSelga -= potonganPajak;
        if (potonganPajak > 0) {
          s.log.push(`[Bulan ${s.giliran}] JUAL ${kg}kg kopi → +${fmtGC(hasilGC)} GC (PPh ${fmt(potonganPajak)} Selga)`);
        } else {
          s.log.push(`[Bulan ${s.giliran}] JUAL ${kg}kg kopi → +${fmtGC(hasilGC)} GC`);
        }
      }

      return s;
    }

    case 'BELI_IMPOR': {
      if (state.fase !== 'keputusan') return state;
      const { pupuk, bbm, bibit } = action.payload;
      const s = { ...state, log: [...state.log] };

      const totalPupuk = pupuk || 0;
      const totalBbm = bbm || 0;
      const totalBibit = bibit || 0;
      if (totalPupuk === 0 && totalBbm === 0 && totalBibit === 0) return state;

      const biaya = Math.round(hitungBiayaImpor(totalPupuk, totalBbm, totalBibit, s.kurs));
      if (biaya > s.kasSelga) return state;

      s.kasSelga -= biaya;
      s.stokPupuk += totalPupuk;
      s.stokBBM += totalBbm;
      s.stokBibit += totalBibit;
      s.log.push(`[Bulan ${s.giliran}] BELI IMPOR: ${totalPupuk}pupuk, ${totalBbm}BBM, ${totalBibit}bibit → -${fmt(biaya)} Selga`);
      return s;
    }

    case 'TUKAR': {
      if (state.fase !== 'keputusan') return state;
      const { arah, jumlah } = action.payload;
      const s = { ...state, log: [...state.log] };

      if (!jumlah || jumlah <= 0) return state;

      if (arah === 'SELGA_KE_GC') {
        if (jumlah > s.kasSelga) return state;
        s.kasSelga -= jumlah;
        const gcDapat = Math.round(selgaKeGc(jumlah, s.kurs) * 100) / 100;
        s.kasGC += gcDapat;
        s.log.push(`[Bulan ${s.giliran}] TUKAR ${fmt(jumlah)} Selga → ${fmtGC(gcDapat)} GC`);
      } else {
        if (jumlah > s.kasGC) return state;
        s.kasGC -= jumlah;
        s.kasSelga += Math.round(gcKeSelga(jumlah, s.kurs));
        s.log.push(`[Bulan ${s.giliran}] TUKAR ${jumlah} GC → +${fmt(s.kasSelga - state.kasSelga)} Selga`);
      }
      return s;
    }

    case 'TANAM': {
      if (state.fase !== 'keputusan') return state;
      const { jumlahBibit } = action.payload;
      const s = { ...state, log: [...state.log] };

      if (!jumlahBibit || jumlahBibit <= 0 || jumlahBibit > s.stokBibit) return state;

      s.stokBibit -= jumlahBibit;
      tanam(s, jumlahBibit);
      s.log.push(`[Bulan ${s.giliran}] TANAM ${jumlahBibit} bibit → faktorTanam = ${s.faktorTanam.toFixed(1)}`);
      return s;
    }

    case 'KOPERASI': {
      if (state.fase !== 'keputusan') return state;
      const { aksi, jumlah } = action.payload;
      const s = { ...state, log: [...state.log] };
      const cfg = DIFFICULTY[s.mode];

      if (aksi === 'PINJAM') {
        if (!jumlah || jumlah <= 0) return state;
        const maks = pinjamMaks(s, cfg);
        if (jumlah > maks) return state;
        s.kasSelga += jumlah;
        s.pinjaman += jumlah;
        s.log.push(`[Bulan ${s.giliran}] PINJAM ${fmt(jumlah)} Selga (sisa pinjaman: ${fmt(s.pinjaman)})`);
      } else if (aksi === 'BAYAR') {
        if (!jumlah || jumlah <= 0) return state;
        const bayar = Math.min(jumlah, s.kasSelga, s.pinjaman);
        if (bayar <= 0) return state;
        s.kasSelga -= bayar;
        s.pinjaman -= bayar;
        s.log.push(`[Bulan ${s.giliran}] BAYAR pinjaman ${fmt(bayar)} (sisa: ${fmt(s.pinjaman)})`);
      } else if (aksi === 'BANTU_TETANGGA') {
        if (!jumlah || jumlah <= 0) return state;
        if (jumlah > s.kasSelga) return state;
        s.kasSelga -= jumlah;
        const naik = naikSejahtera(jumlah);
        s.kesejahteraan = clamp(s.kesejahteraan + naik, 0, 100);
        s.log.push(`[Bulan ${s.giliran}] BANTU_TETANGGA ${fmt(jumlah)} → kesejahteraan +${naik} (= ${s.kesejahteraan})`);
      }
      return s;
    }

    case 'LANJUT_BULAN': {
      if (state.fase !== 'keputusan') return state;
      const s = { ...state, log: [...state.log] };
      const cfg = DIFFICULTY[s.mode];

      // Resolusi
      pungutBunga(s, cfg);
      pungutTagihanBulanan(s, cfg.inflasiBiayaHidup);
      tekanKesejahteraan(s);

      if (s.kasSelga < 0) {
        const masihDefisit = coverDefisit(s, cfg);
        if (masihDefisit) {
          s.fase = 'selesai';
          s.log.push(`[Bulan ${s.giliran}] BANGKRUT — kas tetap minus setelah likuidasi`);
          simpanGame(s);
          return s;
        }
      }

      if (s.kesejahteraan <= 0) {
        s.fase = 'selesai';
        s.log.push(`[Bulan ${s.giliran}] KELUARGA HANCUR — kesejahteraan = 0`);
        simpanGame(s);
        return s;
      }

      if (s.giliran >= s.totalGiliran) {
        s.fase = 'selesai';
        s.log.push(`[Bulan ${s.giliran}] PERMAINAN SELESAI — selamat!`);
        simpanGame(s);
        return s;
      }

      // Giliran berikut
      s.giliran++;
      const rng = rngGiliran(s.seed, s.giliran);
      mulaiGiliran(s, cfg, rng);
      simpanGame(s);
      return s;
    }

    case 'RESET': {
      return null;
    }

    default:
      return state;
  }
}

// ===== Helper Internal =====

/**
 * Memulai giliran: isi antrian berita (awal tahun), ambil berita, gerak kurs, panen, terapkan efek stok.
 */
function mulaiGiliran(s, cfg, rng) {
  // Awal tahun: reset omzet & isi antrian berita
  if ((s.giliran - 1) % 12 === 0) {
    s.omzetTahunIni = 0;
    const tahunKe = Math.ceil(s.giliran / 12);
    const entries = rencanakanTahun(s.seed, tahunKe, cfg);
    s.antrianBerita = entries.map(e => ({
      ...narasiTemplate(e),
      efek: e.efek,
    }));
  }

  // Ambil berita
  if (s.antrianBerita.length > 0) {
    s.beritaTerkini = s.antrianBerita.shift();
  } else {
    // Fallback: event cadangan
    s.beritaTerkini = EVENT_CADANGAN();
  }
  s.riwayatBerita = [...s.riwayatBerita, s.beritaTerkini];

  // Kurs bergerak
  const arahKurs = s.beritaTerkini?.efek?.kurs ?? 0;
  s.kurs = gerakkanKurs(s.kurs, arahKurs, cfg.volat, rng);
  s.riwayatKurs = [...s.riwayatKurs, s.kurs];

  // Panen
  const hasilPanen = panen(s);

  // Efek stok dari berita
  const stokDelta = s.beritaTerkini?.efek?.stokKopiDelta ?? 0;
  s.stokKopi = Math.max(0, s.stokKopi + stokDelta);

  if (stokDelta < 0) {
    s.log.push(`[Bulan ${s.giliran}] ${s.beritaTerkini.headline} → stok kopi ${stokDelta}kg (panen: +${hasilPanen}kg)`);
  } else {
    s.log.push(`[Bulan ${s.giliran}] ${s.beritaTerkini.headline} (panen: +${hasilPanen}kg)`);
  }

  s.fase = 'berita';
}

function pinjamMaks(s, cfg) {
  return Math.round(s.kasSelga * cfg.capPinjaman);
}

// ===== Formatter =====

function fmt(n) {
  return n.toLocaleString('id-ID');
}

function fmtGC(n) {
  return n.toFixed(2);
}