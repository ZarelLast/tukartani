# Tukar Tani — Spesifikasi Modular (untuk AI Executor)

> Game web (React) untuk lomba **JuaraVibeCoding**, scope **#1 Game**.
> Simulasi ekonomi desa: petani kopi yang ekspor (dibayar GC) & impor (bayar ikut kurs).
> Spec ini dipecah jadi modul agar tiap AI/sesi fokus pada **satu** bagian tanpa bias.

---

## ⛔ ATURAN WAJIB SEBELUM MENGEKSEKUSI FILE MANA PUN

Tiga aturan ini mencegah AI mengarang ulang hal yang sudah ditetapkan
(penyebab utama implementasi yang tidak konsisten):

1. **SATU SUMBER KEBENARAN.**
   - Semua **tipe & bentuk state** hanya didefinisikan di `02-tipe-dan-state.md`.
   - Semua **rumus & konstanta ekonomi** hanya didefinisikan di `03-ekonomi.md`.
   - File lain **mengimpor/merujuk**, **tidak menulis ulang** angka atau tipe.
     Kalau sebuah file butuh konstanta, sebut namanya (mis. `SPREAD`) dan tunjuk
     ke `03-ekonomi.md` — jangan menyalin nilainya, apalagi mengarang nilai baru.

2. **PATUHI HEADER DEPENDENSI.** Tiap file diawali blok `Bergantung pada` /
   `Dipakai oleh` / `JANGAN sentuh`. Kalau tugasmu ada di file X, kamu **hanya**
   boleh mengubah hal yang jadi tanggung jawab X. Perubahan ke tipe/konstanta
   harus dilakukan di file pemiliknya, lalu file lain menyesuaikan.

3. **JANGAN LANGGAR INVARIANT BALANCE** di `03-ekonomi.md §Invariant`.
   Itu pertidaksamaan yang menjaga game tidak bisa dieksploitasi. Mengubah angka
   boleh, melanggar invariant tidak.

---

## Peta Modul & Tanggung Jawab

| File | Isi | Pemilik kontrak |
|---|---|---|
| `00-README.md` | (ini) peta, urutan, aturan | — |
| `01-konsep-dan-loop.md` | premis, dilema inti, 5 fase per giliran | konsep & urutan fase |
| `02-tipe-dan-state.md` | `GameState`, `Berita`, tipe aksi reducer | **TIPE** |
| `03-ekonomi.md` | semua rumus + konstanta + scheduler news (§jadwal) + invariant balance | **EKONOMI** |
| `04-difficulty.md` | konfigurasi Easy/Medium/Hard | tabel difficulty |
| `05-aksi-pemain.md` | 6 aksi → efek ke state, validasi jumlah | logika aksi |
| `06-ai-integrasi.md` | strategi cache news, mesin kejadian (§6a), penasihat scope-locked + suara (§6b, §voice), prompt, clamp, fallback | prompt, validasi AI, scope-lock |
| `07-frontend-react.md` | arsitektur, komponen, mobile-first, save state, RNG | UI & persistence |
| `08-skor-dan-rapor.md` | kondisi akhir, skor, rapor edukasi | endgame |
| `09-deployment.md` | Cloud Run + proxy Gemini | infra |
| `10-roadmap-build.md` | urutan build berlapis + acceptance criteria | proses |
| `11-event-cadangan.md` | 15 event fiksi hardcoded (MVP + fallback + template narasi) | tabel event |

---

## Graf Dependensi (siapa butuh siapa)

```
01 konsep ──┐
            ├─► 02 tipe ◄──────────── (semua file pakai tipe ini)
03 ekonomi ─┘        ▲
   ▲  ▲  ▲           │
   │  │  └── 05 aksi ─┤  (aksi memanggil rumus ekonomi, mengubah state)
   │  └───── 06 AI ───┤  (AI menghasilkan Berita → masuk efek ekonomi)
   └──────── 08 skor ─┘  (skor pakai rumus kekayaan & kesejahteraan)

04 difficulty ──► 03 ekonomi (mengisi parameter: volat, kasAwal, dst)
07 frontend ────► 02, 05 (render state, dispatch aksi) + RNG + save
09 deployment ──► 06 (proxy untuk panggilan AI)
10 roadmap ─────► semua (urutan & acceptance per lapis)
```

**Inti yang tak boleh kabur:** `03-ekonomi.md` adalah jantungnya. Kalau ragu,
file lain tunduk pada angka & invariant di sana.

---

## Urutan Build (ringkas — detail di `10-roadmap-build.md`)

1. `02-tipe-dan-state.md` + `03-ekonomi.md` → fondasi (tipe & rumus murni).
2. `05-aksi-pemain.md` + reducer + `11-event-cadangan.md` → loop bisa dimainkan
   headless (tanpa UI), digerakkan tabel event.
3. `04-difficulty.md` → tiga mode.
4. `07-frontend-react.md` → UI + mobile + save (game bisa dimainkan manusia).
5. `06-ai-integrasi.md` → ganti tabel event hardcoded dengan AI.
6. `08-skor-dan-rapor.md` → layar akhir.
7. `09-deployment.md` → rilis.

> **Prinsip:** tiap lapis menghasilkan versi yang *jalan*. Jangan lanjut lapis
> berikut sebelum lapis sekarang lulus acceptance criteria-nya (`10`).

---

## Mata Uang & Istilah (glosarium cepat)

- **Selga** = mata uang lokal Desa Senandu.
- **GC (Gold Coins)** = mata uang dunia, patokan ekspor & impor. **Tidak
  menghasilkan bunga** (biaya peluang memegangnya disengaja).
- **Kurs** = berapa Selga untuk 1 GC. **Kurs naik = Selga melemah.**
- Semua entitas dalam game **fiksi** (lihat aturan keamanan di `06-ai-integrasi.md`).
