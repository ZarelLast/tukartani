# 07 — Frontend React (UI, Mobile-First, Save, RNG)

> **Tujuan file:** struktur React, komponen, layout mobile, persistence, RNG,
> input nama. Tidak ada rumus ekonomi di sini (panggil dari `03`).
>
> **Bergantung pada:** `02-tipe-dan-state.md` (state & aksi), `05-aksi-pemain.md`
> (dispatch), `04-difficulty.md` (layar pilih mode).
> **Dipakai oleh:** `09-deployment.md` (di-serve sebagai `dist`).
> **JANGAN:** menaruh logika ekonomi di komponen; menaruh API key di frontend.

---

## Arsitektur Integrasi: Phaser JS + React (The "Orion" Protocol)

Game ini menggunakan arsitektur hybrid (bukan full DOM):
- **Phaser JS (`GameCanvas.jsx`):** Bertanggung jawab atas rendering dunia game (background Desa Senandu, karakter Pak Tani Elf, partikel koin, cuaca, animasi objek). Berjalan di dalam elemen `<canvas>`.
- **React (DOM Overlay):** Bertanggung jawab atas UI yang kompleks (HUD, Menu Aksi, Grafik Recharts, Advisor Chat). Dirender di atas kanvas Phaser menggunakan `position: absolute` dengan `z-index` tinggi.

Interaksi antar keduanya dirancang secara ketat untuk menjaga performa dan "Game Feel":

1. **Sinkronisasi Animasi (Visual Delay):** React tidak akan langsung memperbarui angka di HUD saat tombol aksi ditekan. React menahan *update* visual sampai Phaser selesai mengeksekusi animasi dan menembakkan *event* `ANIMATION_COMPLETE` ke Global Event Bus.
2. **Koordinat Lintas-Dunia (Responsive Bridge):** Karena UI React bergeser responsif mengikuti layar pemain, komponen React akan memanggil `getBoundingClientRect()` dan mengirim koordinat absolut (x,y) ke Phaser via Event Bus. Phaser menggunakan titik ini sebagai target pendaratan partikel koin/kopi.
3. **Pemisahan State & UX Lock (Anti-Spam):**
   - **`LogicalState`**: Dihitung instan oleh `useReducer` saat tombol ditekan (mencegah *race condition*).
   - **`VisualState`**: Tertinggal dari `LogicalState` menunggu partikel Phaser mendarat.
   - Selama animasi berlangsung (saat partikel terbang), tombol aksi di React akan dikunci (*disabled*) untuk mencegah pemain melakukan *spam-click* yang merusak antrean asinkronus.

---

## Arsitektur File```
src/
  App.jsx                // useReducer untuk GameState (mesin status)
  gameReducer.js         // transisi: JUAL_KOPI, BELI_IMPOR, TUKAR, TANAM, KOPERASI, LEWATI, LANJUT_BULAN
  ekonomi.js             // fungsi murni dari 03 (panen, harga, konversi, biaya) — mudah di-test
  rng.js                 // PRNG ber-seed (lihat §RNG)
  api/llm.js             // helper panggil proxy LLM (06 + 09)
  components/
    StartScreen.jsx      // pilih mode + input nama (§input-nama)
    Dashboard.jsx        // kas Selga/GC, kurs, stok, kesejahteraan, biaya hidup
    KursChart.jsx        // grafik garis riwayatKurs (recharts)
    NewsPanel.jsx        // headline + penjelasan
    DecisionPanel.jsx    // tombol 6 aksi + slider jumlah
    AdvisorChat.jsx      // tanya-jawab Penasihat (06b) — input ketik + suara (§voice)
    VoiceControls.jsx    // tombol mic (STT) + toggle TTS; degrade jika API tak ada
    EndScreen.jsx        // skor + rapor edukasi (08)
```

**Pola state:** `useReducer` (game = mesin status). `dispatch({type, payload})` →
reducer **murni** menghitung state baru. Semua angka memanggil `ekonomi.js`
(implementasi dari `03`). Reducer hanya merangkai.

---

## §RNG — Deterministik (anti save-scum, adil leaderboard)

```js
function buatRng(seed) {                    // mulberry32
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function rngGiliran(seedDasar, giliran) {   // hasil giliran-N selalu sama
  return buatRng((seedDasar ^ (giliran * 2654435761)) >>> 0);
}
```
> **Wajib pakai ini, bukan `Math.random()`.** Dengan auto-save, `Math.random`
> memungkinkan reload-untuk-reroll (save-scum). RNG ber-seed bikin hasil giliran
> sama berapa kali pun di-reload → keputusan menentukan, bukan keberuntungan.
> `seed` disimpan di `GameState` (`02`). Dipakai di `gerakkanKurs` & peluang
> krisis.

---

## §save — Save State (WAJIB untuk Hard 60 giliran)

Seluruh game = satu objek `GameState` → menyimpan = serialisasi satu objek.
Game di-deploy sendiri (bukan Artifact), jadi `localStorage` normal.

```js
const SAVE_KEY = "tukartani_save";
const simpanGame  = (s) => { try { localStorage.setItem(SAVE_KEY, JSON.stringify(s)); } catch {} };
const muatGame    = () => { try { const r = localStorage.getItem(SAVE_KEY); return r ? JSON.parse(r) : null; } catch { return null; } };
const hapusSave   = () => localStorage.removeItem(SAVE_KEY);
```
- **Auto-save** tiap akhir giliran (diam-diam).
- Tombol **"Lanjutkan"** di layar judul, muncul hanya jika `muatGame()` ada.
- Hapus save saat selesai/bangkrut atau mulai sesi baru.
- Lintas-perangkat = butuh akun + backend (Firestore). **localStorage cukup
  untuk lomba.**

---

## §mobile — Desain Mobile-First (mayoritas pemain HP/iPad)

Rancang untuk ~390px dulu, lebarkan dengan breakpoint (`sm:`/`md:` Tailwind).
- **Kartu menumpuk vertikal**, hindari tabel lebar yang butuh scroll horizontal.
- **Target sentuh ≥44px**, beri jarak antar tombol.
- **Dashboard ringkas:** Selga/GC, kurs, stok, kesejahteraan, **biaya hidup bulan
  ini** kebaca sekilas tanpa scroll. Ikon + angka.
- **Grafik adaptif:** `recharts` `ResponsiveContainer`; di HP batasi titik data.
- **Tanpa hover-only:** semua info penting via *tap*, bukan hover.
- Uji di viewport sempit (DevTools mode HP) sejak awal, bukan di akhir.

---

## §input-nama — Personalisasi + Pengaman

Di `StartScreen` (bareng pilih mode): isi **nama petani** & **nama kebun**.
- Validasi: `trim()`, maks 20 char, kosong → default ("Pak Tani", "Kebun Mukti").
- Saring kata kasar/SARA (daftar kecil cukup untuk lomba).
- **Prompt injection:** perlakukan nama sebagai data tampilan; jangan kirim ke
  Mesin Kejadian. Detail bungkus aman di `06-ai-integrasi.md §6b`.

---

## §voice — Implementasi Suara Penasihat (UI)

Spec perilaku & keamanan ada di `06 §voice`. Di sini hanya UI/teknis browser.
Polish, **wajib degrade mulus** — game harus tetap utuh tanpa suara.

```js
// Deteksi dukungan SEKALI saat mount; sembunyikan tombol mic kalau tak ada
const STT = window.SpeechRecognition || window.webkitSpeechRecognition;
const adaSTT = !!STT;                       // iOS Safari sering false → mode ketik
const adaTTS = "speechSynthesis" in window;

// Output suara (TTS)
function ucapkan(teks) {
  if (!adaTTS || muted) return;
  const u = new SpeechSynthesisUtterance(teks);
  u.lang = "id-ID";
  speechSynthesis.cancel();                 // hentikan ucapan sebelumnya
  speechSynthesis.speak(u);
}

// Input suara (STT) — hasilnya MASUK alur tanya yang sama dgn ketik (06 §6b pengaman)
function mulaiDengar(onHasil) {
  if (!adaSTT) return;
  const r = new STT();
  r.lang = "id-ID"; r.interimResults = false; r.maxAlternatives = 1;
  r.onresult = (e) => onHasil(e.results[0][0].transcript); // -> tanyaPenasihat(teks)
  r.start();
}
```

Aturan UI:
- Tombol mic & toggle TTS hanya tampil jika `adaSTT`/`adaTTS` (jangan tampilkan
  kontrol mati).
- Indikator "🎤 mendengarkan…" saat aktif; mic butuh gesture + izin (mobile).
- Tombol ≥44px, tanpa hover (`§mobile`).
- **Hasil STT diperlakukan sama seperti teks ketik** → tetap lewat scope-lock +
  injection guard + cek output di `06 §6b`. Suara bukan jalan pintas.

---

## §news-cache (UI/state) — terkait `06 §news-cache`

- Saat sesi mulai & tiap awal tahun (giliran 13, 25, …): panggil generator narasi
  (`api/llm.js`) → isi `antrianBerita` (`02`). Tampilkan loading singkat sekali,
  bukan tiap giliran.
- Fase Berita biasa: `beritaTerkini = antrianBerita.shift()`, append ke
  `riwayatBerita`. **Tanpa panggilan jaringan** → instan, enak untuk demo.
- `KursChart` boleh anotasi titik dari `riwayatBerita` (mis. ikon krisis).
