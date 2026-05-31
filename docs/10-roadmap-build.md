# 10 — Roadmap Build Bertahap + Acceptance Criteria

> **Tujuan file:** urutan membangun agar selalu ada versi yang *jalan*, plus
> kriteria lulus tiap lapis. Ini "manajer proyek" untuk AI executor.
>
> **Bergantung pada:** semua file.
> **Dipakai oleh:** —
> **JANGAN:** lompat lapis sebelum acceptance criteria lapis sekarang lulus.

---

## Prinsip

Bangun berlapis. Tiap lapis menghasilkan build yang bisa dijalankan. **Kalau
membosankan/pecah di lapis awal, AI tidak akan menyelamatkan.**

---

### Lapis 1 — MVP tanpa AI (fondasi + bukti fun)
Implementasi: `02-tipe`, `03-ekonomi` (LENGKAP, termasуk §jadwal/§kesejahteraan/
§bangkrut), `05-aksi`, reducer, `07 §RNG`, `07 §save`, `07 §mobile`,
`11-event-cadangan` (penggerak kurs). Satu mode (Easy).

**Acceptance:**
- [ ] Loop 5 fase jalan end-to-end, 12 giliran, tanpa crash. Giliran-1 punya
      berita+panen (lewat `mulaiGiliran` saat `MULAI`, `05`).
- [ ] Panen menghasilkan kopi tiap giliran; `bencana_panen` memotong stok.
- [ ] Biaya hidup dipungut tiap giliran; pasif total → bangkrut sebelum giliran 12.
- [ ] **Kesejahteraan turun -1/giliran**; abai BANTU_TETANGGA → terlihat menurun
      (di sesi panjang bisa "keluarga hancur"). Likuidasi paksa beri -8.
- [ ] **Auto-likuidasi** jalan: kas minus → jual GC lalu kopi; jika tetap minus →
      bangkrut (`03 §bangkrut`).
- [ ] **Uji exploit:** arbitrase tukar bolak-balik 5 giliran tanpa bertani →
      RUGI (spread + biaya hidup). Kalau untung, `03 §Invariant` dilanggar.
- [ ] **Cek kalibrasi (§kalibrasi):** sesi Easy "main wajar" → kekayaan akhir
      ~1,5–1,8× modal awal (bukan 2,5×+). Bertani terasa perlu.
- [ ] Reload halaman → lanjut dari giliran terakhir (save + RNG seed sama).

### Lapis 2 — Difficulty modes
Implementasi: `04-difficulty`, `07 StartScreen` (pilih mode + input nama `07
§input-nama`).

**Acceptance:**
- [ ] Tiga mode mengubah durasi, kas awal, volat, krisis, inflasi, **bunga & cap**.
- [ ] **Invariant sudah dipenuhi per-mode** (`bungaKoperasi` 0.03/0.04/0.05 > `DRIFT
      + volat/2`). Cukup verifikasi tak ada yang mengubahnya; arbitrase/leverage rugi.
- [ ] Nama tervalidasi (kosong→default, maks 20, filter kasar).

### Lapis 3 — Mesin Kejadian AI (cache, bukan per-giliran)
Implementasi: `06 §news-cache` + `06 §6a` (jadwal di kode → LLM narasi per-tahun
→ `bersihkanBerita` → `antrianBerita`/`riwayatBerita`). Tabel event tetap jadi
`EVENT_CADANGAN`.

**Acceptance:**
- [ ] News di-generate **per-tahun (1 panggilan/12 bulan)**, bukan tiap giliran.
- [ ] Fase Berita biasa **tanpa panggilan jaringan** (ambil dari `antrianBerita`).
- [ ] `riwayatBerita` terisi & dipakai konteks penasihat + rapor.
- [ ] Reload tidak mengubah berita yang akan datang (seeded; cek anti-reroll).
- [ ] **Uji keamanan:** paksa AI sebut entitas nyata → tertangkap → fallback.
- [ ] Krisis selalu melemahkan Selga (kurs ≥ +1) & frekuensinya sesuai `peluangKrisis`.
- [ ] Gemini mati/kuota habis → narasi template dipakai, mekanik tetap jalan.
- [ ] **Catat keputusan foreknowledge** (`06 §news-cache`): per-tahun (default)
      atau on-the-fly tanpa simpan (kalau leaderboard kompetitif).

### Lapis 4 — Penasihat AI (scope-locked) + Suara
Implementasi: `06 §6b` (scope-lock + cek output + cap), `06 §voice`,
`07 AdvisorChat`/`VoiceControls`.

**Acceptance:**
- [ ] Jawaban ≤3 kalimat, relevan dengan state & `riwayatBerita`.
- [ ] **Scope-lock:** tanya di luar topik (fakta dunia nyata, kode, dll) → ditolak
      dengan kalimat redirect, bukan dijawab.
- [ ] **Injection (ketik & suara):** "abaikan instruksi…" tidak membajak;
      output yang bocor entitas nyata tertangkap cek output.
- [ ] **Cap panggilan/sesi** aktif (mis. 20) → tak bisa dipakai sebagai LLM gratis.
- [ ] **Voice degrade:** di perangkat tanpa STT/TTS (mis. iOS Safari), tombol
      tersembunyi & mode ketik tetap jalan; tak ada error.
- [ ] STT `id-ID` → hasil masuk alur tanya yang sama (lewat semua pengaman).

### Lapis 5 — Skor & Rapor + Poles UX
Implementasi: `08`, `07 EndScreen`, `KursChart`, animasi/ikon/suara.

**Acceptance:**
- [ ] Skor pakai kesejahteraan sebagai multiplier (`08`).
- [ ] Rapor edukasi muncul (AI atau fallback deterministik).
- [ ] **Uji mobile:** enak di 390px, tombol ≥44px, tak ada scroll horizontal,
      tak ada info hover-only.

### Lapis 6 — Deploy
Implementasi: `09`. Bisa lebih awal untuk testing; pastikan stabil sebelum
penilaian.

**Acceptance:**
- [ ] `min-instances=1`, tanpa cold start saat juri coba.
- [ ] Key tidak ada di bundle frontend (cek `dist`).

---

## §kalibrasi — Dasar Angka (hasil simulasi, bukan tebakan)

Konstanta harga/panen di `03` dikalibrasi via simulasi 400 seed/mode, pemain
"jual-semua + jaga pupuk + hedge saat kurs lemah":

| Mode | Pertumbuhan kekayaan (median) | Bangkrut | Kesejahteraan akhir (abai tetangga) |
|---|---|---|---|
| Easy (12) | ~1,6× | 0% | ~58 |
| Medium (36) | ~4,1× | ~8% | ~34 |
| Hard (60) | ~10× nominal* | ~14% | ~10 (mepet kalah) |

\*Hard 10× itu **nominal** (kurs naik ~+30% dari drift+krisis selama 5 thn);
tekanan sebenarnya lewat **kesejahteraan & bangkrut**, bukan kekayaan — sesuai
desain. Default lama (`KOPI 2.0/BASIS 60`) memberi 2,7× di Easy tanpa risiko =
terlalu snowball; karena itu diturunkan ke `KOPI 1.6/PUPUK 6/BASIS 40`.

> Saat playtest manusia, bandingkan dengan tabel ini. Kalau jauh meleset
> (mis. Easy >2,2× atau bangkrut Easy >0%), cek apakah ada konstanta yang
> berubah atau sebuah aksi yang belum kena sink.

## Pemetaan ke Kriteria Lomba

| Kriteria | Jawaban game |
|---|---|
| **Masalah (30%)** | Literasi ekonomi rendah; audiens pelajar & umum; scalable (skenario tak terbatas). Model ekonomi mengajarkan sebab-akibat BENAR (krisis → Selga melemah). |
| **Solusi (40%)** | Loop menegangkan + grafik + penasihat = UX delightful. Ekonomi punya trade-off asli (spread, drift, biaya hidup) → keputusan bermakna. Rapor = nilai terukur. **Fokus poles di sini.** |
| **Keunikan (30%)** | "Makroekonomi dari sudut pandang petani desa" segar & berani. AI = mesin kejadian dinamis + penasihat, bukan chatbot tempelan. |
