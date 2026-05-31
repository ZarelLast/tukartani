/**
 * LLM API Helper — Panggil proxy Gemini (06-ai-integrasi.md + 09-deployment.md)
 */

const API_BASE = import.meta.env.VITE_API_BASE || '';

export async function panggilLLM(prompt, options = {}) {
  const {
    maxRetries = 2,
    timeout = 15000,
    onRetry,
  } = options;

  let lastError;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    if (attempt > 0 && onRetry) onRetry(attempt);
    try {
      const controller = new AbortController();
      const tid = setTimeout(() => controller.abort(), timeout);
      const res = await fetch(`${API_BASE}/api/llm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
        signal: controller.signal,
      });
      clearTimeout(tid);

      if (!res.ok) throw new Error(`LLM HTTP ${res.status}`);
      const data = await res.json();

      // Parse response Gemini
      const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      // Bersihkan markdown code block
      const cleaned = raw.replace(/```json\s*|\s*```/g, '').trim();
      return cleaned;
    } catch (err) {
      lastError = err;
      if (attempt < maxRetries) {
        await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
      }
    }
  }
  throw lastError;
}

/**
 * Narasi berita per-entri (dipakai oleh newsCache.js)
 */
export async function narasiBerita(seed, mode) {
  const prompt = `Kamu mesin kejadian ekonomi (Jurnalis) untuk game simulasi di dunia fiksi bernama Sylvarion.
Mata uang lokal "Selga", mata uang dunia "Gold Coins (GC)".

Berikut adalah IDE DASAR (Seed) berita yang harus kamu kembangkan:
- Kategori: ${seed.kategori}
- Ide Headline: ${seed.headline}
- Ide Penjelasan: ${seed.penjelasan}

TUGASMU: Kembangkan ide dasar di atas menjadi berita yang jauh lebih hidup, imersif, dan dramatis. 
Kamu BEBAS menambahkan kutipan wawancara tokoh fiksi, mendeskripsikan lokasi, atau mendramatisir efeknya. Namun, pertahankan ESENSI dan KATEGORINYA.

ATURAN WAJIB:
- Seluruh kejadian fiksi. DILARANG menyebut entitas/peristiwa nyata mana pun.
- Pakai nama fiksi (Bank Agung, Benua Selatan, Kerajaan Seberang, dll).
- Patuhi rentang angka asli dari ide dasar.

Balas HANYA JSON valid, tanpa teks lain, tanpa markdown:
{ "kategori": "${seed.kategori}", "headline": "<headline>", "penjelasan": "<penjelasan>",
  "efek": { ...efek sama... } }`;

  const raw = await panggilLLM(prompt);
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Chat penasihat (dipakai oleh AdvisorChat)
 */
export async function chatPenasihat({ state, riwayat3, pertanyaan }) {
  const prompt = `Kamu "Pak Tani Bijak", penasihat di game edukasi ekonomi dunia fiksi Sylvarion.

BATAS TUGAS (WAJIB):
- Jawab HANYA tentang: kondisi kebun pemain, ekonomi Sylvarion (kurs Selga/GC, harga kopi/pupuk, kurs, pinjaman), dan cara kerja game ini.
- Jika ditanya hal DI LUAR itu, JANGAN jawab. Balas persis: "Maaf, saya cuma bisa bantu soal kebunmu dan ekonomi Desa Eldoria."
- DILARANG menyebut negara/tokoh/lembaga/peristiwa nyata. Semua fiksi.
- Maksimal 3 kalimat, bahasa sederhana, tanpa menggurui.

Kondisi pemain: kurs ${state.kurs} Selga/GC, kas ${state.kasSelga} Selga & ${state.kasGC} GC, stok kopi ${state.stokKopi} kg, pupuk ${state.stokPupuk}, kesejahteraan ${state.kesejahteraan}, pinjaman ${state.pinjaman}.
3 berita terakhir: ${JSON.stringify(riwayat3 || [])}.

Pertanyaan pemain: "${pertanyaan}"`;

  const raw = await panggilLLM(prompt);
  // Bersihkan markdown
  return raw.replace(/```[^]*```/g, '').trim();
}