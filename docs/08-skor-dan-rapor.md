# 08 — Akhir Permainan, Skor & Rapor Edukasi

> **Tujuan file:** kondisi menang/kalah, rumus skor, rapor edukasi AI.
> Ini gameplay inti — sengaja dipisah dari deployment.
>
> **Bergantung pada:** `02-tipe-dan-state.md` (state), `03-ekonomi.md`
> (`HARGA_KOPI_GC`, kurs), `06-ai-integrasi.md` (Penasihat untuk rapor).
> **Dipakai oleh:** `07` (EndScreen.jsx), `05` (cek kalah di resolusi).
> **JANGAN:** menjadikan kesejahteraan bonus kecil (harus multiplier — lihat alasan).

---

## Kondisi Akhir

- **Bangkrut (game over dini):** saat Resolusi, jika `kasSelga < 0`, sistem
  menjalankan auto-likuidasi (`03 §bangkrut`: jual GC lalu kopi paksa). Jika
  **setelah** likuidasi `kasSelga` masih `< 0` → bangkrut.
- **Keluarga hancur (game over dini):** `kesejahteraan <= 0`. Kesejahteraan
  turun `-1`/giliran (`03 §kesejahteraan`) + `-8` tiap kali terpaksa likuidasi,
  dan hanya pulih lewat BANTU_TETANGGA (`05`) → ini taruhan nyata, bukan hiasan.
- **Selesai:** bertahan sampai `giliran === totalGiliran` (sesuai mode).

Semua cek ini di Fase Resolusi (`05-aksi-pemain.md`), **setelah** memungut
bunga & biaya hidup dan menerapkan drain kesejahteraan.

---

## Skor — Kesejahteraan = MULTIPLIER (bukan bonus)

```ts
const kekayaanBersih =
  s.kasSelga + (s.kasGC * s.kurs) + (s.stokKopi * HARGA_KOPI_GC * s.kurs);

const faktorSejahtera = clamp(s.kesejahteraan / 100, 0, 1) * 1.2; // 0..1.2
const skor = Math.round(kekayaanBersih * faktorSejahtera);
```

> **Kenapa multiplier, bukan `+ kesejahteraan*10000`:** dengan penjumlahan,
> saat kekayaan puluhan juta, kontribusi kesejahteraan <5% → aksi "Bantu
> Tetangga" jadi *dominated* (selalu kalah dibanding numpuk uang). Sebagai
> **multiplier**, mengabaikan keluarga menggerus skor langsung → dimensi sosial
> jadi taruhan nyata. (Konsisten dengan efek `BANTU_TETANGGA` di `05`.)

---

## Rapor Edukasi (nilai jual ke juri)

Di EndScreen, tampilkan 1–2 insight personal yang di-generate AI dari `s.log`.
Kirim ringkasan log ke Penasihat (`06b`) dan minta insight, mis.:

> "Kamu menjual kopi saat Selga sedang kuat 3 kali—itu menggerus pendapatanmu.
> Lain kali tahan stok saat kurs naik. Tapi kamu rajin bantu tetangga—
> kesejahteraan tinggi melipatgandakan skor akhirmu."

Tanpa AI (MVP / fallback): pakai aturan deterministik dari `log` (mis. hitung
berapa kali jual saat kurs di bawah rata-rata) → kalimat template. Ini mengubah
game dari sekadar seru menjadi **teman belajar terukur**.

> Sebutkan `namaKebun` di rapor untuk personalisasi ("Laporan akhir {namaKebun}").
