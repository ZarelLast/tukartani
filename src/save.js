/**
 * §save — Save State (WAJIB untuk Hard 60 giliran)
 * Dari 07-frontend-react.md §save
 */

const SAVE_KEY = "tukartani_save";

/**
 * Menyimpan GameState ke localStorage.
 * @param {object} state - GameState lengkap
 */
export function simpanGame(state) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  } catch {
    // Silently fail — localStorage mungkin penuh/disabled
  }
}

/**
 * Memuat GameState dari localStorage.
 * @returns {object|null} GameState atau null jika tidak ada save
 */
export function muatGame() {
  try {
    const r = localStorage.getItem(SAVE_KEY);
    return r ? JSON.parse(r) : null;
  } catch {
    return null;
  }
}

/**
 * Menghapus save data.
 */
export function hapusSave() {
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch {
    // Silently fail
  }
}