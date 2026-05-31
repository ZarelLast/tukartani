/**
 * §RNG — Deterministik (anti save-scum)
 * Implementasi Mulberry32 PRNG dari 07-frontend-react.md §RNG
 */

/**
 * Membuat PRNG Mulberry32 dengan seed tertentu.
 * @param {number} seed - Seed awal (integer 32-bit unsigned)
 * @returns {() => number} Fungsi yang mengembalikan random float [0, 1)
 */
export function buatRng(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Membuat PRNG khusus untuk giliran tertentu.
 * Hasil giliran-N selalu sama untuk seed yang sama.
 * @param {number} seedDasar - Seed utama dari GameState
 * @param {number} giliran - Nomor giliran (1-based)
 * @returns {() => number} Fungsi RNG untuk giliran ini
 */
export function rngGiliran(seedDasar, giliran) {
  return buatRng((seedDasar ^ (giliran * 2654435761)) >>> 0);
}