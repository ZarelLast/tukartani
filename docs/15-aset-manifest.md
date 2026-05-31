# 15 — Manifest Aset & Struktur Sistem

> **Tujuan file:** SATU daftar terkonsolidasi semua aset (gambar, spritesheet,
> partikel, audio) + struktur folder + konvensi penamaan + pemetaan aset →
> komponen. Diturunkan dari `12-ui-ux-design.md` (interaksi/layout), `13-aset-objek.md`
> (objek/karakter/VFX), `14-aset-layout-ui.md` (panel/tombol/HUD). Ini **checklist
> produksi** untuk illustrator dan **peta loader** untuk developer.
>
> **Bergantung pada:** `12`, `13`, `14` (spesifikasi visual), `07-frontend-react.md`
> (komponen & arsitektur "Orion Protocol" yang memuat aset), `05` (aksi → ikon).
> **Dipakai oleh:** illustrator (produksi aset), `07` (loader Phaser + React).
> **JANGAN:** menetapkan gaya/warna baru di sini (itu milik `12/13`); menambah
> mekanik. File ini hanya **menginventaris & menata** apa yang sudah didefinisikan.

> **Kapan dikerjakan:** lapisan poles **Lapis 5** (`10-roadmap-build.md`). Lapis
> 1–4 berjalan DOM-only tanpa aset final (placeholder). Manifest ini = target
> akhir, bukan prasyarat MVP.

---

## 1. Konvensi Penamaan & Format Ekspor

Patuhi aturan ekspor di `14 §1` (9-slice, state tombol, transparansi). Ringkasan:

- **Format:** PNG transparan untuk semua objek/UI/VFX; JPEG hi-quality boleh untuk
  background buram (`bg/`). Audio: `.mp3` (kompatibel luas) atau `.ogg`.
- **Penamaan:** `snake_case`, prefix kategori. Pola: `<kategori>_<nama>[_<state>][@2x].png`.
  Contoh: `char_paktani_panik.png`, `btn_op_gudang_pressed.png`, `ui_panel_kayu.png`.
- **State tombol** (3 file atau 1 spritesheet, lihat `14 §1`): `_normal`, `_hover`, `_pressed`.
- **9-slice:** ekspor bujur sangkar (mis. 128×128) dengan sudut tegas + tepi
  repeatable + tengah seamless. Tandai dengan suffix `_9slice` bila perlu.
- **Resolusi ganda (retina):** sediakan `@2x` untuk aset UI penting; base `@1x`.
- **Spritesheet animasi:** sertakan JSON atlas (TexturePacker/Phaser format),
  frame seragam, beri sufiks jumlah frame jika manual (mis. `_4f`).

---

## 2. Struktur Folder Aset

Dipisah mengikuti arsitektur "Orion Protocol" (`07`): aset **dunia game** dimuat
Phaser; aset **UI/DOM** dipakai komponen React.

```
public/assets/
├── bg/                 # background scene (Phaser) — JPEG/PNG 1920x1080
├── char/               # karakter + ekspresi (Phaser/overlay) — PNG ~800x1000
├── props/              # mata uang, komoditas, hati (Phaser HUD/partikel) — PNG 128x128
├── vfx/                # spritesheet & partikel (Phaser particles) — PNG + JSON atlas
├── audio/
│   ├── sfx/            # efek pendek
│   └── music/          # loop latar & stinger
└── ui/                 # aset DOM (React) — panel/tombol/HUD/modal/endgame/chat
    ├── panels/         # 9-slice papan kayu, perkamen, nota, scroll
    ├── buttons/        # tombol + state, FAB, close, stepper
    ├── icons/          # ikon overlay aksi & indikator
    ├── hud/            # kalender, pill uang, slot inventaris, meter, indikator biaya
    ├── modal/          # widget per-menu (slider, toggle, tab, progress, stempel)
    ├── endgame/        # panel victory/gameover + ornamen
    └── chat/           # dialog box, bubble, mic
```

> **Pemuatan:** `bg/ char/ props/ vfx/ audio/` → Phaser `preload()` di `GameCanvas`
> (`07 game/`). `ui/` → React (CSS `background-image` 9-slice via `border-image`,
> atau `<img>`). Aset `endgame/` & `vfx/` victory **lazy-load** (hemat beban awal
> di mobile, lihat `12 §3` safe-area & performa).

---

## 3. Background (Scene) — sumber `13 §2`

Dimuat Phaser sebagai latar scene Desa Eldoria. JPEG hi-quality / PNG, 1920×1080.

| File | Kondisi | Catatan | Dipakai |
|---|---|---|---|
| `bg_eldoria_siang.jpg` | Normal/cerah | Kebun terasering, gubuk Elf, langit cyan | GameCanvas (default) |
| `bg_eldoria_krisis.jpg` | Mendung/krisis | Versi redup, awan kelabu, overlay biru 20% | GameCanvas (saat kategori `krisis_global`/`bencana_panen`) |

> Transisi siang↔krisis dipicu oleh `beritaTerkini.kategori` (`02`). `object-fit: cover`
> / pan-and-scan agar full-bleed di semua rasio (`12 §3`).

---

## 4. Karakter — "Pak Tani Elf" — sumber `13 §3`

Half-body ~800×1000 PNG transparan, **diekspor per-ekspresi** sebagai sprite terpisah.

| File | State | Pemicu | Dipakai |
|---|---|---|---|
| `char_paktani_idle.png` | Idle/senyum | Default, kondisi aman | HUD ikon penasihat, AdvisorChat |
| `char_paktani_serius.png` | Serius/mengingatkan | Kurs bergejolak / saldo menipis | AdvisorChat, NewsPanel |
| `char_paktani_panik.png` | Panik | Mendekati bangkrut / krisis | Resolusi defisit, NewsPanel |
| `char_paktani_victory.png` | Victory | Layar menang | EndScreen (victory) |

---

## 5. Props: Mata Uang, Komoditas, Status — sumber `13 §4`

PNG transparan 128×128 (HUD & sumber partikel), siluet *exaggerated*.

| File | Objek | Dipakai |
|---|---|---|
| `props_selga.png` | Uang kertas Selga (rune elven) | HUD pill uang, partikel jual |
| `props_gc.png` | Tumpukan Gold Coins | HUD pill uang, partikel tukar |
| `props_kopi.png` | Karung goni kopi | HUD slot, modal Gudang, partikel panen |
| `props_pupuk.png` | Karung pupuk (logo daun) | HUD slot, modal Pelabuhan |
| `props_bbm.png` | Jerigen BBM merah | HUD slot, modal Pelabuhan |
| `props_bibit.png` | Kantong bibit | HUD slot, modal Pelabuhan/Ladang |
| `props_hati.png` | Hati kesejahteraan (cherry red) | HUD meter, partikel Bantu Tetangga |

> Catatan: 4 komoditas (kopi/pupuk/BBM/bibit) wajib selaras dengan `stok*` di `02`
> dan aksi di `05`. Selga & GC selaras dengan dua kas di `02`.

---

## 6. UI Panel (9-Slice) — sumber `14 §5A, §2, §6, §7`

| File | Fungsi | 9-slice | Dipakai |
|---|---|---|---|
| `ui/panels/panel_kayu.png` | Papan kayu pinus universal modal | ✅ | semua modal aksi (`12 §6`) |
| `ui/panels/ledger_perkamen.png` | Kertas perkamen krem | ✅ | isi modal, grafik |
| `ui/panels/papan_judul.png` | Banner judul Start Screen | ✅ | StartScreen |
| `ui/panels/input_box.png` | Kotak teks ukiran kayu | ✅ | StartScreen (nama petani/kebun) |
| `ui/panels/papan_berita.png` | Papan pengumuman / surat perkamen + stempel lilin | ✅ | NewsPanel |
| `ui/panels/nota_tagihan.png` | Struk kasir bergerigi (memanjang) | ✅ | Fase Resolusi (`12 §3f`, `14 §5C`) |
| `ui/panels/grid_paper.png` | Kertas bergaris untuk latar grafik | ✅ | KursChart |

---

## 7. Tombol & Ikon — sumber `14 §3, §4`, aksi `05`

**Tombol operasional (5 aksi)** — bentuk seragam kayu/batu chunky, min 64×64,
state `_normal/_hover/_pressed` (`14 §1`):

| Tombol (file basis) | Ikon overlay | Aksi (`05`) | Modal |
|---|---|---|---|
| `ui/buttons/btn_op_gudang` | `ui/icons/icon_gudang.png` (gudang) | `JUAL_KOPI` | Gudang |
| `ui/buttons/btn_op_pelabuhan` | `ui/icons/icon_pelabuhan.png` (jangkar/kapal) | `BELI_IMPOR` | Pelabuhan |
| `ui/buttons/btn_op_bank` | `ui/icons/icon_bank.png` (timbangan/koin) | `TUKAR` | Bank Desa |
| `ui/buttons/btn_op_ladang` | `ui/icons/icon_ladang.png` (tunas/sekop) | `TANAM` | Ladang |
| `ui/buttons/btn_op_koperasi` | `ui/icons/icon_koperasi.png` (jabat tangan) | `KOPERASI` | Koperasi |

**Tombol khusus:**

| File | Fungsi | Catatan |
|---|---|---|
| `ui/buttons/btn_fab_lanjut.png` | FAB "Lanjut Bulan" (transisi) | Bukan aksi ke-6; LEWATI = lanjut tanpa beraksi (`05`, `12 §3e.1`). Min 64×64, panah ganda ⏩ |
| `ui/buttons/btn_close.png` | Tutup modal (X merah) | universal |
| `ui/buttons/btn_difficulty_{easy,medium,hard}.png` | Pilih kesulitan | Hijau/Kuning/Merah (`14 §2`) |
| `ui/buttons/stepper_minus.png` / `stepper_plus.png` | `[ - ]` / `[ + ]` | modal Gudang/Pelabuhan |

---

## 8. HUD (Heads-Up Display) — sumber `12 §3b`, `14 §3`

| File | Elemen | Posisi | Mengikat state (`02`) |
|---|---|---|---|
| `ui/hud/hud_kalender.png` | Kalender/giliran | Kiri atas | `giliran` / `totalGiliran` |
| `ui/hud/hud_uang_pill.png` | Pill kayu 2 slot uang | Kanan atas | `kasSelga`, `kasGC` |
| `ui/hud/hud_inventaris_slot.png` | Rentengan 4 slot logistik | Bawah pill uang | `stokKopi/Pupuk/BBM/Bibit` |
| `ui/hud/hud_meter_kese_frame.png` + `hud_meter_kese_fill.png` | Meter kesejahteraan (bingkai + cairan) | Kanan bawah | `kesejahteraan` |
| `ui/hud/hud_indikator_biaya.png` | Indikator "Biaya Hidup Bulan Ini" (api/dompet bocor) | Kanan bawah | preview tagihan (`12 §3b` → rumus `03 §tagihan-bulanan`) |

---

## 9. Widget Modal per-Aksi — sumber `12 §6`, `14 §5B`

| File | Widget | Modal | Catatan |
|---|---|---|---|
| `ui/modal/slider_track.png` + `slider_knob.png` | Slider jumlah | Gudang | porsi kopi dijual |
| `ui/modal/meter_ptkp.png` | Bar progres "Omzet PTKP 500 jt" | Gudang | **aspirasional** (`03`/`14 §5B`): jarang penuh, jangan terkesan rusak |
| `ui/modal/stamp_pajak.png` | Stempel "PAJAK DIBAYAR" miring | Gudang | muncul saat PPh terpotong |
| `ui/modal/kurs_arrow_up.png` / `kurs_arrow_down.png` | Panah indikator kurs (merah naik / hijau turun) | Pelabuhan | impor mahal/murah |
| `ui/modal/bar_faktor_tanam_frame.png` + `bar_faktor_tanam_fill.png` | Progress sulur "Faktor Tanam" | Ladang | `faktorTanam` (maks 1.5) |
| `ui/modal/toggle_switch.png` | Sakelar Selga↔GC | Bank Desa | + label peringatan spread 1,5% |
| `ui/modal/tab_active.png` / `tab_passive.png` | Tab folder kertas | Koperasi | Pinjam / Donasi |

---

## 10. Layar Akhir — sumber `12 §5`, `14 §6`

| File | Fungsi | Kondisi |
|---|---|---|
| `ui/endgame/panel_victory_scroll.png` | Gulungan putih + sulur emas (9-slice) | Menang (lewati batas waktu) |
| `ui/endgame/wax_seal.png` | Stempel lilin mengilap | Victory |
| `ui/endgame/pita_kemenangan.png` | Pita atas layar | Victory |
| `ui/endgame/panel_gameover_kayu.png` | Papan kayu retak (9-slice) | Bangkrut / keluarga hancur |
| `ui/endgame/stamp_bangkrut.png` | Stempel merah "BANGKRUT/DISITA" | Game over |
| `ui/endgame/coffee_stain.png` | Noda cipratan kopi | Game over (acak) |

> Kedua panel **wajib memuat Rapor Edukasi AI** (`08`, `12 §5`) di kotak dialog
> khusus — sediakan area teks yang cukup.

---

## 11. Chat / Penasihat AI — sumber `12 §3h`, `14 §7`

| File | Fungsi | Dipakai |
|---|---|---|
| `ui/chat/dialog_box.png` | Kotak dialog kayu/perkamen (9-slice) | AdvisorChat |
| `ui/chat/bubble_player.png` | Balon kata pemain (hijau/biru, ekor kanan, 9-slice) | AdvisorChat |
| `ui/chat/bubble_ai.png` | Balon kata AI (krem, ekor kiri, 9-slice) | AdvisorChat |
| `ui/chat/btn_mic.png` | Tombol mic retro (min 64×64) | VoiceControls (`07 §voice`) |
| `vfx/mic_glow_rings_3f.png` | Cincin denyut saat recording (spritesheet) | VoiceControls (STT aktif) |

> Mic & glow hanya tampil bila `adaSTT` (`07 §voice`); degrade mulus tanpa aset
> ini bila API absen.

---

## 12. VFX / Spritesheet / Partikel — sumber `13 §5`, `12 §4`

**Mikro (aksi pemain):**

| File | VFX | Aksi |
|---|---|---|
| `vfx/particle_coin_selga.png` | Koin Selga melayang (sistem partikel) | Jual Kopi |
| `vfx/particle_coin_gc.png` | Koin GC | Tukar / jual→GC |
| `vfx/sprite_ship_steam.png` + `vfx/crate_open_4f.png` | Kapal uap + peti kayu terbuka | Beli Impor |
| `vfx/sprout_grow_4f.png` | Tunas tumbuh (spritesheet 3–4 frame) | Tanam Bibit |
| `vfx/gold_sparks.png` | Percikan bintang silang | Tukar Uang |
| `vfx/sprite_heart_small.png` + `vfx/flower_petal.png` | Hati & kelopak melayang | Bantu Tetangga |

**Makro (fase/layar):**

| File | VFX | Fase |
|---|---|---|
| `vfx/calendar_page.png` + `vfx/calendar_torn.png` | Lembar kalender sobek tertiup | Transisi bulan (`12 §3g`) |
| `vfx/sprite_coffee_bean.png` | Biji kopi muncul→melesat ke HUD | Panen otomatis (`12 §3d`) |
| `vfx/stamp_lunas.png` | Stempel "LUNAS" merah | Resolusi tagihan (`12 §3f`) |
| `vfx/storm_cloud.png` | Awan mendung cartoony + vignette | Berita buruk/bencana (`12 §3c`) |
| `vfx/golden_leaf_{1,2,3}.png` | Daun emas turun (partikel) | Victory |
| `vfx/dust_motes.png` | Debu kelabu melayang | Game over |

---

## 13. Audio — sumber `12 §3f, §3g, §4, §5`

| File | Suara | Pemicu |
|---|---|---|
| `audio/sfx/sfx_coin.mp3` | Denting koin tebal | Jual / perubahan kas |
| `audio/sfx/sfx_button_pop.mp3` | Bloop/pop | Tekan tombol |
| `audio/sfx/sfx_paper_rip.mp3` | Kertas disobek | Transisi bulan |
| `audio/sfx/sfx_whoosh.mp3` | Desiran angin magis | Transisi bulan |
| `audio/sfx/sfx_bird_chirp.mp3` | Kicau/kokok | Bulan baru dimulai |
| `audio/sfx/sfx_cash_register.mp3` | Mesin kasir berderik | Fase Resolusi |
| `audio/sfx/sfx_stamp_thud.mp3` | Hantaman stempel | "LUNAS" di nota |
| `audio/sfx/sfx_chimes_victory.mp3` | Lonceng peri riang | Layar menang |
| `audio/sfx/sfx_wood_thud.mp3` | Bantingan kayu keras | Layar kalah |
| `audio/music/music_cozy_loop.mp3` | Musik latar cozy (loop) | Gameplay |
| `audio/music/music_victory.mp3` | Orkestra triumphant cozy | Victory |
| `audio/music/music_gameover.mp3` | Tempo melambat/muram | Game over |

> Semua audio harus bisa di-mute (toggle, sejalan `07 §voice` & UX mobile). Mulai
> hanya setelah gesture pengguna (kebijakan autoplay browser).

---

## 14. Pemetaan Aset → Komponen React/Phaser (`07`)

| Komponen (`07`) | Aset utama |
|---|---|
| `GameCanvas.jsx` (Phaser) | `bg/*`, `char/*`, `props/*`, `vfx/*`, `audio/*` |
| `StartScreen.jsx` | `panels/papan_judul`, `panels/input_box`, `buttons/btn_difficulty_*` |
| `Dashboard.jsx` (HUD) | `hud/*`, `props/*` (ikon di slot) |
| `NewsPanel.jsx` | `panels/papan_berita`, `char_paktani_serius`, `vfx/storm_cloud` |
| `DecisionPanel.jsx` | `buttons/btn_op_*`, `icons/icon_*`, `buttons/btn_fab_lanjut`, `modal/*` |
| `KursChart.jsx` | `panels/grid_paper` (+ recharts), `modal/kurs_arrow_*` (anotasi) |
| `AdvisorChat.jsx` | `chat/*`, `char_paktani_idle` |
| `VoiceControls.jsx` | `chat/btn_mic`, `vfx/mic_glow_rings_3f` |
| `EndScreen.jsx` | `endgame/*`, `char_paktani_victory`, `vfx/golden_leaf_*` / `vfx/dust_motes` |

---

## 15. Prioritas Produksi (selaras `10` Lapis 5)

- **P0 (wajib untuk build poles):** 1 background, 4 ekspresi karakter, 7 props,
  panel kayu + perkamen + nota 9-slice, 5 tombol operasional + FAB + close,
  5 ikon aksi, set HUD lengkap, widget modal inti (slider/stepper/toggle/tab/
  progress), 2 panel endgame, dialog+bubble chat, partikel koin + biji kopi +
  stempel LUNAS, SFX inti (koin, pop, kasir, stamp) + 1 musik loop.
- **P1 (polish tambahan):** background krisis, kapal+peti impor, sprout grow,
  gold sparks, hati+kelopak, daun emas/dust victory-gameover, mic glow rings,
  variasi audio (whoosh, bird, chimes, wood thud), musik victory/gameover, @2x.

> **Catatan performa mobile (`12 §3`):** kemas spritesheet/atlas (mis. TexturePacker),
> kompres PNG, lazy-load aset `endgame/` & VFX besar. Target jepret < beberapa MB
> awal agar cepat di HP.
