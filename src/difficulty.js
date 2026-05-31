/**
 * 04 — Tingkat Kesulitan (Difficulty)
 * SUMBER KEBENARAN untuk parameter per-mode.
 * Dari docs/04-difficulty.md
 */

export const DIFFICULTY = {
  easy: {
    totalGiliran: 12,
    kasAwal: 24_000_000,
    volat: 0.03,
    maxArah: 2,
    peluangKrisis: 0.06,
    inflasiBiayaHidup: 0.03,
    bungaKoperasi: 0.03,
    capPinjaman: 1.0,
    peluangAI: 0.2,
    sasaranSkor: "rendah",
  },
  medium: {
    totalGiliran: 36,
    kasAwal: 18_000_000,
    volat: 0.05,
    maxArah: 3,
    peluangKrisis: 0.12,
    inflasiBiayaHidup: 0.05,
    bungaKoperasi: 0.04,
    capPinjaman: 1.0,
    peluangAI: 0.5,
    sasaranSkor: "sedang",
  },
  hard: {
    totalGiliran: 60,
    kasAwal: 12_000_000,
    volat: 0.08,
    maxArah: 3,
    peluangKrisis: 0.20,
    inflasiBiayaHidup: 0.08,
    bungaKoperasi: 0.05,
    capPinjaman: 0.5,
    peluangAI: 0.8,
    sasaranSkor: "tinggi",
  },
};