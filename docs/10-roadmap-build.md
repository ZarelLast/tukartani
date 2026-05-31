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
      ~1,3–1,6× modal awal (bukan 2,5×+). Bertani terasa perlu.
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

### Lapis 5 — Skor & Rapor + Poles UX (termasuk Phaser & aset)
Implementasi: `08`, `07 EndScreen`, `KursChart`. **Di sinilah lapisan visual
game-first dipasang:** Phaser `GameCanvas` ("Orion Protocol" di `07`), scene &
karakter (`13`), panel/HUD/tombol (`14`), interaksi & juiciness (`12`),
**produksi aset mengikuti manifest `15`** (struktur folder, penamaan, prioritas
P0/P1), animasi/ikon/suara. Sebelum lapis ini, game berjalan DOM-only (React murni).

**Acceptance:**
- [ ] Skor pakai kesejahteraan sebagai multiplier (`08`).
- [ ] Rapor edukasi muncul (AI atau fallback deterministik).
- [ ] **Phaser terpasang tanpa mengubah logika:** `gameReducer`/`ekonomi` tak
      disentuh; canvas hanya membaca state & memutar animasi. Game tetap
      bisa dimainkan kalau canvas dimatikan (DOM fallback).
- [ ] **Visual Delay & UX-lock** (`07`/`12`): HUD update setelah partikel mendarat;
      tombol terkunci selama animasi (anti-spam) tanpa merusak `LogicalState`.
- [ ] **Uji mobile:** enak di 390px, tombol ≥44px (FAB Lanjut ≥64px), tak ada
      scroll horizontal, tak ada info hover-only, safe-area dihormati (`12`).

### Lapis 6 — Deploy
Implementasi: `09`. Bisa lebih awal untuk testing; pastikan stabil sebelum
penilaian.

**Acceptance:**
- [ ] `min-instances=1`, tanpa cold start saat juri coba.
- [ ] Key tidak ada di bundle frontend (cek `dist`).

---

## §kalibrasi — Dasar Angka (hasil simulasi, bukan tebakan)

Angka di `03/04` **di-anchor ke rupiah nyata** (GC ≈ USD, Selga ≈ IDR, kurs
15.000 ≈ IDR/USD). Contoh figur yang dilihat pemain di awal: harga kopi
~Rp 63.000/kg, biaya keluarga ~Rp 2,22 jt/bulan, listrik ~Rp 100–190 rb/bulan,
pupuk ~Rp 120 rb/karung, PBB ~Rp 500 rb/tahun — semuanya believable.

Disimulasi 500 seed/mode dengan model `03` terkini. **Hasil sangat bergantung
pada kualitas main — dan jurang itu memang pelajarannya:**

| Mode | Cermat¹ (growth · bangkrut) | Ceroboh² (bangkrut) |
|---|---|---|
| Easy (12) | ~1,42× · 0% | ~2% |
| Medium (36) | ~3,5× · 0% (welfare ~46) | ~20% |
| Hard (60) | ~8,0× · ~0% (welfare ~46) | ~22% |

¹ **Cermat** = jaga buffer kas ≥2× tagihan, hedge ke GC saat kurs murah, sesekali
BANTU_TETANGGA agar welfare tak jatuh.
² **Ceroboh** = timbun GC tanpa sisakan Selga untuk tagihan, abaikan tetangga →
likuidasi paksa beruntun (−8 welfare tiap kali) → bisa "keluarga hancur".

> **Inilah desain yang benar:** angka realistis membuat margin tani **tipis tapi
> positif** (seperti petani sungguhan). Pemain yang mengelola kas & lindung nilai
> menang stabil; yang ceroboh bangkrut. Crisis-stacking (`03 §makro`) memperbesar
> jurang ini — itu fitur, bukan bug. Hard 8× itu **nominal** (kurs naik selama 5
> thn); tekanan sebenarnya di welfare & risiko bangkrut.

> Saat playtest manusia, bandingkan: Easy main wajar harus **~1,3–1,6×, bangkrut
> 0%**. Kalau Easy >1,9× atau sering bangkrut, ada konstanta yang meleset dari
> tabel `03/04`.

> Saat playtest manusia, bandingkan dengan tabel ini. Kalau jauh meleset
> (mis. Easy >1,9× atau bangkrut Easy >0%), cek apakah ada konstanta yang
> berubah atau sebuah aksi yang belum kena sink.

## Pemetaan ke Kriteria Lomba

| Kriteria | Jawaban game |
|---|---|
| **Masalah (30%)** | Literasi ekonomi rendah; audiens pelajar & umum; scalable (skenario tak terbatas). Model ekonomi mengajarkan sebab-akibat BENAR (krisis → Selga melemah). |
| **Solusi (40%)** | Loop menegangkan + grafik + penasihat = UX delightful. Ekonomi punya trade-off asli (spread, drift, biaya hidup) → keputusan bermakna. Rapor = nilai terukur. **Fokus poles di sini.** |
| **Keunikan (30%)** | "Makroekonomi dari sudut pandang petani desa" segar & berani. AI = mesin kejadian dinamis + penasihat, bukan chatbot tempelan. |
