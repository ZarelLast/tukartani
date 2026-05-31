# 01 — Konsep & Loop Permainan

> **Tujuan file:** menjelaskan *apa* game ini & *kenapa* seru. Tidak ada rumus
> di sini (itu di `03-ekonomi.md`).
>
> **Bergantung pada:** —
> **Dipakai oleh:** semua (ini "kompas" desain).
> **JANGAN sentuh:** angka konstanta, tipe data. Hanya konsep & urutan fase.

---

## Premis

Kamu kepala keluarga petani kopi di **Desa Eldoria**. Hasil panen **diekspor**
(dibayar **GC / Gold Coins**), tapi pupuk & BBM kamu **diimpor** (harganya ikut
kurs). Kurs yang bergerak adalah jantung permainan—dan pisau bermata dua.

## Dilema Inti (yang harus pemain rasakan)

> "Oh, Selga melemah itu bikin aku **untung sebagai penjual** tapi **buntung
> sebagai pembeli**."

- **Selga melemah (kurs naik):** kopi laku lebih banyak Selga 👍, pupuk/BBM mahal 👎
- **Selga menguat (kurs turun):** ekspor dapat sedikit Selga 👎, impor murah 👍

**Dilema kedua (anti-dangkal):** pemain boleh pegang GC untuk lindung nilai,
**tapi GC tidak menghasilkan apa-apa** sementara Selga bisa diputar jadi pupuk →
panen → ekspor, dan tiap tukar kena spread. Jadi hedging = trade-off asli,
bukan tombol "menang". (Mekanismenya: `DRIFT`, `SPREAD` di `03-ekonomi.md`.)

Tugas pemain: **mengatur timing** jual & beli melawan pergerakan kurs.

---

## Loop: 1 giliran = 1 bulan, 5 fase

Urutan fase ini **mengikat** (file lain harus menghormatinya):

1. **Berita** — 1 kejadian ekonomi muncul (dari AI atau tabel hardcoded → lihat
   `06-ai-integrasi.md`). Kurs bergerak sebagai akibat (`03-ekonomi.md §kurs`).
2. **Panen** — kopi otomatis tumbuh sesuai pupuk & investasi
   (`03-ekonomi.md §panen`). **Ini satu-satunya sumber kopi.** Terjadi *sebelum*
   Keputusan agar pemain tahu stoknya sebelum memutuskan jual.
3. **Keputusan** — pemain melakukan satu/beberapa aksi (`05-aksi-pemain.md`)
   sampai menekan **"Lanjut ke bulan depan"**.
4. **Resolusi** — hitung dampak ke kas/stok/kesejahteraan, lalu **pungut biaya
   hidup** (sink wajib, `03-ekonomi.md §biaya-hidup`) & bunga pinjaman.
5. **Refleksi (opsional)** — pemain boleh tanya ke Penasihat AI
   (`06-ai-integrasi.md §penasihat`).

Setelah giliran terakhir → **Layar Akhir** (`08-skor-dan-rapor.md`).

```
[Berita] → [Panen] → [Keputusan] → [Resolusi+sink] → [Refleksi?] → giliran++
```

## Penjaga Scope (jangan dilanggar)

- Satu protagonis, satu komoditas (kopi), satu "tahun" per mode.
- Maksimal **6 aksi** (`05-aksi-pemain.md`). Tidak ada peta, multi-desa,
  multiplayer.
- Selesaikan MVP yang *fun* + ekonomi seimbang **sebelum** menyentuh AI.
