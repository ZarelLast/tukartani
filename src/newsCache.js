/**
 * newsCache.js — Jadwal mekanik + narasi + cache berita per-tahun
 * Dari docs/06-ai-integrasi.md §news-cache + docs/03-ekonomi.md §jadwal
 */

import { rngGiliran } from './rng.js';
import { EVENT_CADANGAN_LIST, EVENT_CADANGAN, KATEGORI_SAH, bersihkanBerita, narasiTemplate } from './eventCadangan.js';
import { narasiBerita } from './api/llm.js';

const KATEGORI = ["kebijakan_moneter", "permintaan_ekspor", "bencana_panen", "krisis_global", "harga_komoditas", "kondisi_lokal"];

/**
 * rencanakanTahun — scheduler mekanik deterministik (diambil dari 03 §jadwal)
 * Menghasilkan 12 entri { kategori, efek } tanpa narasi
 */
export function rencanakanTahun(seedDasar, tahunKe, cfg) {
  const rng = rngGiliran(seedDasar, 1000 + tahunKe);
  const out = [];
  for (let i = 0; i < 12; i++) {
    const r = rng();
    if (r < cfg.peluangKrisis) {
      out.push({
        kategori: "krisis_global",
        efek: { kurs: 1 + Math.floor(rng() * cfg.maxArah) },
      });
    } else {
      out.push(pilihNonKrisis(rng, cfg.maxArah));
    }
  }
  return out;
}

function pilihNonKrisis(rng, maxArah) {
  const k = rng();
  if (k < 0.25) {
    let a = Math.floor(rng() * (2 * maxArah + 1)) - maxArah;
    if (a === 0) a = 1;
    return { kategori: "kebijakan_moneter", efek: { kurs: a } };
  }
  if (k < 0.45) return { kategori: "permintaan_ekspor", efek: { hargaEksporModifier: rentang(rng, 0.8, 1.3) } };
  if (k < 0.65) return { kategori: "harga_komoditas", efek: { hargaEksporModifier: rentang(rng, 0.8, 1.3) } };
  if (k < 0.80) return { kategori: "bencana_panen", efek: { stokKopiDelta: -(10 + Math.floor(rng() * 31)) } };
  return { kategori: "kondisi_lokal", efek: {} };
}

function rentang(rng, lo, hi) {
  return Math.round((lo + rng() * (hi - lo)) * 100) / 100;
}


/**
 * isiAntrianBerita — generate 12 berita setahun, narasi AI atau template
 * Dipanggil di awal sesi dan awal tahun baru (giliran 13, 25, ...)
 */
export async function isiAntrianBerita(seedDasar, tahunKe, cfg) {
  const mekanik = rencanakanTahun(seedDasar, tahunKe, cfg);
  const rngAI = rngGiliran(seedDasar, 2000 + tahunKe); // untuk determinisme peluangAI
  const narasiPromises = mekanik.map(entri => {
    const chance = rngAI();
    if (chance <= cfg.peluangAI) {
      // Ambil seed dari tabel cadangan untuk prompt
      const seedMatch = EVENT_CADANGAN_LIST.filter(e => e.kategori === entri.kategori);
      const seed = seedMatch.length > 0 ? seedMatch[Math.floor(Math.random() * seedMatch.length)] : EVENT_CADANGAN_LIST[0];
      const seedWithEfek = { ...seed, efek: entri.efek };
      return narasiBerita(seedWithEfek, cfg)
        .then(result => {
          if (result) return bersihkanBerita(result, entri.efek);
          return narasiTemplate(entri);
        })
        .catch(() => narasiTemplate(entri));
    } else {
      return Promise.resolve(narasiTemplate(entri));
    }
  });

  const results = await Promise.all(narasiPromises);
  return results;
}

/**
 * Isi antrian berita sinkron (tanpa AI, untuk MVP/fallback)
 */
export function isiAntrianBeritaSync(seedDasar, tahunKe, cfg) {
  const mekanik = rencanakanTahun(seedDasar, tahunKe, cfg);
  return mekanik.map(entri => narasiTemplate(entri));
}