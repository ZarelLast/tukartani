# 05 — Aksi Pemain (6 aksi)

> **Tujuan file:** mendefinisikan efek tiap aksi ke `GameState` + validasi.
> Reducer merangkai: validasi → panggil rumus (`03`) → state baru.
>
> **Bergantung pada:** `02-tipe-dan-state.md` (tipe `Aksi`, `GameState`),
> `03-ekonomi.md` (semua rumus & konstanta).
> **Dipakai oleh:** `07-frontend-react.md` (tombol → dispatch).
> **JANGAN:** mengarang konstanta (ambil dari `03`); menambah aksi ke-7 (scope!).

Pemain boleh melakukan beberapa aksi dalam satu Fase Keputusan sampai menekan
**"Lanjut ke bulan depan"** (`LANJUT_BULAN`).

---

## 1. JUAL_KOPI `{ kg, konversiKeSelga }`
- Validasi: `0 < kg <= stokKopi` DAN `stokBBM >= Math.ceil(kg / KAPASITAS_KG_PER_BBM)`.
- `hasilGC = kg * HARGA_KOPI_GC * eksporModifierAktif` (§harga).
- `stokKopi -= kg`; `stokBBM -= Math.ceil(kg / KAPASITAS_KG_PER_BBM)`.
- Konversi nilai ke Selga: `nilaiSelga = gcKeSelga(hasilGC, kurs)`.
- `omzetSebelumnya = s.omzetTahunIni`; `s.omzetTahunIni += nilaiSelga`.
- **PPh Final UMKM (0.5%)**: Jika omzet melampaui PTKP 500 juta, potong pajak.
  `porsiKenaPajak = Math.max(0, s.omzetTahunIni - Math.max(omzetSebelumnya, PTKP_UMKM))`.
  `potonganPajak = porsiKenaPajak * PPH_FINAL_UMKM`.
- Jika `konversiKeSelga`: `kasSelga += (nilaiSelga - potonganPajak)`.
- Jika tidak: `kasGC += hasilGC`; `kasSelga -= potonganPajak` (pajak dibayar pakai kas lokal).
- *Pelajaran: jual saat Selga lemah. Omzet di atas 500 juta memicu PPh riil. Jangan menimbun kopi terlalu lama karena akan membusuk (Spoilage) 5% tiap bulan!*

## 2. BELI_IMPOR `{ pupuk, bbm, bibit }`
- `biaya = (pupuk*HARGA_PUPUK_GC + bbm*HARGA_BBM_GC + bibit*HARGA_BIBIT_GC) * kurs` (§harga).
- Validasi: `biaya <= kasSelga` (tidak boleh minus dari aksi ini).
- `kasSelga -= biaya`; `stokPupuk += pupuk`; `stokBBM += bbm`; `stokBibit += bibit`.
- *Pelajaran: beli barang modal (impor) saat Selga kuat (kurs rendah) = hemat.*

## 3. TUKAR `{ arah, jumlah }`
- `SELGA_KE_GC`: validasi `jumlah <= kasSelga`; `kasSelga -= jumlah`;
  `kasGC += selgaKeGc(jumlah, kurs)`.
- `GC_KE_SELGA`: validasi `jumlah <= kasGC`; `kasGC -= jumlah`;
  `kasSelga += gcKeSelga(jumlah, kurs)`.
- Keduanya kena `SPREAD` (§konversi). GC tidak menghasilkan bunga.
- *Pelajaran: kenapa orang nyimpen dolar — tapi bukan tombol menang.*

## 4. TANAM `{ jumlahBibit }`
- Validasi: `jumlahBibit <= stokBibit`.
- `stokBibit -= jumlahBibit`; panggil `tanam(s, jumlahBibit)` (§investasi) →
  `faktorTanam` naik, dibatasi `FAKTOR_TANAM_MAKS`.
- Risiko: bibit diimpor di waktu yang tepat untuk melawan penyusutan kebun (Capital Depreciation) tiap akhir tahun.

## 5. KOPERASI `{ aksi, jumlah }`
- `PINJAM`: validasi `jumlah <= pinjamMaks(s, cfg)` (§koperasi). `kasSelga += jumlah`;
  `pinjaman += jumlah`. Hati-hati jebakan utang.
- `BAYAR`: validasi `jumlah <= min(kasSelga, pinjaman)`. `kasSelga -= jumlah`;
  `pinjaman -= jumlah`.
- `BUNGA`: dipungut otomatis tiap bulan pada Fase Resolusi (`pungutBunga()`). Suku bunga bersifat *Floating Rate*: jika kurs Selga melemah (krisis), bunga utang otomatis meroket!
- `BANTU_TETANGGA`: validasi `jumlah <= kasSelga`. `kasSelga -= jumlah`;
  `kesejahteraan = clamp(kesejahteraan + naikSejahtera(jumlah), 0, 100)`.
  Saran: `naikSejahtera = floor(jumlah / 100_000)` poin (mis. 500rb → +5).
- *Karena kesejahteraan jadi MULTIPLIER skor (`08`), bantu tetangga punya nilai
  kompetitif di late game, bukan sekadar donasi buta.*

## 6. LEWATI
- Tidak melakukan apa-apa. **Tapi tagihan bulanan tetap dipungut saat Resolusi** →
  pasif total = pelan-pelan kalah. Kadang tetap pilihan terbaik (menunggu kurs).
- **Pemetaan UI (`12`):** LEWATI **tidak punya tombol khusus** — pemain cukup
  menekan "Lanjut Bulan" tanpa beraksi. Jadi UI = 5 tombol operasional + 1 FAB
  Lanjut Bulan (transisi), bukan 6 tombol.

---

## Transisi giliran (mulaiGiliran + LANJUT_BULAN)

Satu helper dipakai dua tempat agar tak ada duplikasi & giliran-1 tak terlupa:

```
// dipakai saat MULAI (giliran 1) DAN di akhir LANJUT_BULAN (giliran berikut)
function mulaiGiliran(s, cfg, rng):
  // di awal tahun (giliran 1, 13, 25, ...)
  if (s.giliran - 1) % 12 == 0: 
    isiAntrianBerita(s, cfg)   // rencanakanTahun + narasi LLM
    s.omzetTahunIni = 0        // reset omzet untuk PTKP pajak
    
  s.beritaTerkini = s.antrianBerita.shift()
  s.riwayatBerita.push(s.beritaTerkini)
  // 1) kurs gerak akibat berita (arah = efek.kurs)
  s.kurs = gerakkanKurs(s.kurs, s.beritaTerkini.efek.kurs ?? 0, cfg.volat, rng)
  push s.kurs ke s.riwayatKurs
  // 2) panen (faucet kopi)
  panen(s)                                           // 03 §panen
  // 3) terapkan efek stok dari berita (bencana_panen)
  s.stokKopi = max(0, s.stokKopi + (s.beritaTerkini.efek.stokKopiDelta ?? 0))
  s.fase = "keputusan"

// MULAI: set state awal (02 + DIFFICULTY) lalu:
//   s.giliran = 1; mulaiGiliran(s, cfg, rngGiliran(s.seed, 1))
// LANJUT_BULAN:
//   resolusi(s, cfg)
//   if s.fase != "selesai": s.giliran++; mulaiGiliran(s, cfg, rngGiliran(s.seed, s.giliran))
```

> `eksporModifierAktif` yang dipakai JUAL_KOPI = `beritaTerkini.efek.hargaEksporModifier ?? 1.0`.
> Urutan fase ini sesuai `01-konsep-dan-loop.md`.

## Pseudo-logic resolusi (lengkap)
```
function resolusi(s, cfg):
  pungutBunga(s, cfg)                          // 03 §koperasi
  pungutTagihanBulanan(s, cfg.inflasiBiayaHidup) // 03 §tagihan-bulanan (Keluarga, Listrik, PBB)
  tekanKesejahteraan(s)                        // 03 §kesejahteraan (drain -1)
  if s.kasSelga < 0:
    masihDefisit = coverDefisit(s, cfg)        // 03 §bangkrut (auto-likuidasi + penalti)
    if masihDefisit: s.fase = "selesai"  // BANGKRUT (08)
  if s.kesejahteraan <= 0: s.fase = "selesai"  // keluarga hancur (08)
  if s.giliran >= s.totalGiliran: s.fase = "selesai"  // tamat normal (08)
```
