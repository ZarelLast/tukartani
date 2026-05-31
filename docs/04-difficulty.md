# 04 — Tingkat Kesulitan (Difficulty)

> **Tujuan file:** konfigurasi per mode. Hanya **angka parameter**, bukan logika.
>
> **Bergantung pada:** `03-ekonomi.md` (parameter ini disuntik ke rumusnya).
> **Dipakai oleh:** `02` (nilai awal `kasSelga`, `totalGiliran`), `03` (`volat`,
> `inflasiBiayaHidup`), `06` (`peluangKrisis`), `07` (layar pilih mode).
> **JANGAN sentuh:** rumus ekonomi (`03`).

---

## Prinsip: lebih lama ≠ lebih sulit

Tanpa penyesuaian, sesi panjang malah lebih *mudah* (efek bola salju). Maka tiap
mode mengubah **beberapa parameter sekaligus**, bukan cuma durasi. Hard menahan
snowball lewat **biaya hidup yang naik lebih cepat** + **krisis lebih sering**.

| Mode | Durasi | Kas awal | volat | maxArah | peluangKrisis | inflasiBiayaHidup | bungaKoperasi | capPinjaman |
|---|---|---|---|---|---|---|---|---|
| Easy | 12 (1 thn) | 24.000.000 | 0.03 | 2 | 0.06 | 0.03 | 0.03 | 1.0 |
| Medium | 36 (3 thn) | 18.000.000 | 0.05 | 3 | 0.12 | 0.05 | 0.04 | 1.0 |
| Hard | 60 (5 thn) | 12.000.000 | 0.08 | 3 | 0.20 | 0.08 | 0.05 | 0.5 |

```ts
export const DIFFICULTY = {
  easy:   { totalGiliran: 12, kasAwal: 24_000_000, volat: 0.03, maxArah: 2,
            peluangKrisis: 0.06, inflasiBiayaHidup: 0.03,
            bungaKoperasi: 0.03, capPinjaman: 1.0, peluangAI: 0.2, sasaranSkor: "rendah" },
  medium: { totalGiliran: 36, kasAwal: 18_000_000, volat: 0.05, maxArah: 3,
            peluangKrisis: 0.12, inflasiBiayaHidup: 0.05,
            bungaKoperasi: 0.04, capPinjaman: 1.0, peluangAI: 0.5, sasaranSkor: "sedang" },
  hard:   { totalGiliran: 60, kasAwal: 12_000_000, volat: 0.08, maxArah: 3,
            peluangKrisis: 0.20, inflasiBiayaHidup: 0.08,
            bungaKoperasi: 0.05, capPinjaman: 0.5, peluangAI: 0.8, sasaranSkor: "tinggi" },
};
```

> **✅ Invariant terpenuhi di semua mode** (lihat tabel di `03-ekonomi.md
> §Invariant`): `bungaKoperasi` tiap mode > `DRIFT + volat/2`. Hard juga
> memperketat `capPinjaman` ke 0,5 sebagai sabuk pengaman ganda.

> Hard = 60 giliran → **save state WAJIB** (`07-frontend-react.md §save`).
