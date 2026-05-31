/**
 * DecisionPanel.jsx — Tombol Aksi & Modal Interaksi
 * Dari docs/05-aksi-pemain.md + docs/12-ui-ux-design.md §3e, §6
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';

import {
  HARGA_KOPI_GC, HARGA_PUPUK_GC, HARGA_BBM_GC, HARGA_BIBIT_GC,
  KAPASITAS_KG_PER_BBM, SPREAD, FAKTOR_TANAM_MAKS,
  PTKP_UMKM, PPH_FINAL_UMKM, KURS_AWAL,
} from '../ekonomi.js';
import { DIFFICULTY } from '../difficulty.js';

export default function DecisionPanel({ state, onDispatch, onLanjutBulan, onBukaChat, chatCount }) {
  const [modalAktif, setModalAktif] = useState(null);
  const [loading, setLoading] = useState(false);

  // ===== Action Handlers =====

  const handleJualKopi = (kg, konversiKeSelga) => {
    setLoading(true);
    setTimeout(() => {
      onDispatch({ type: 'JUAL_KOPI', payload: { kg, konversiKeSelga } });
      setLoading(false);
      setModalAktif(null);
    }, 400);
  };

  const handleBeliImpor = (pupuk, bbm, bibit) => {
    setLoading(true);
    setTimeout(() => {
      onDispatch({ type: 'BELI_IMPOR', payload: { pupuk, bbm, bibit } });
      setLoading(false);
      setModalAktif(null);
    }, 400);
  };

  const handleTukar = (arah, jumlah) => {
    setLoading(true);
    setTimeout(() => {
      onDispatch({ type: 'TUKAR', payload: { arah, jumlah } });
      setLoading(false);
      setModalAktif(null);
    }, 400);
  };

  const handleTanam = (jumlahBibit) => {
    setLoading(true);
    setTimeout(() => {
      onDispatch({ type: 'TANAM', payload: { jumlahBibit } });
      setLoading(false);
      setModalAktif(null);
    }, 400);
  };

  const handleKoperasi = (aksi, jumlah) => {
    setLoading(true);
    setTimeout(() => {
      onDispatch({ type: 'KOPERASI', payload: { aksi, jumlah } });
      setLoading(false);
      setModalAktif(null);
    }, 400);
  };

  const handleLanjutBulan = () => {
    setLoading(true);
    setTimeout(() => {
      onLanjutBulan();
      setLoading(false);
    }, 600);
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 z-20 p-2 md:p-4 pb-4 md:pb-6" style={{ background: 'linear-gradient(to top, rgba(92, 74, 46, 0.95) 0%, rgba(92, 74, 46, 0.7) 60%, transparent 100%)' }}>
      {/* Tombol Aksi Grid + FAB */}
      <div className="flex items-center justify-center gap-2 md:gap-3">
        {/* Gudang */}
        <ActionButton
          emoji="📦"
          label="Gudang"
          sub="Jual Kopi"
          onClick={() => setModalAktif('jual')}
          disabled={loading || state.stokKopi <= 0}
          color="#8B6F47"
          hint={state.stokKopi <= 0 ? "Stok kopi habis" : null}
        />
        {/* Pelabuhan */}
        <ActionButton
          emoji="🚢"
          label="Pelabuhan"
          sub="Beli Impor"
          onClick={() => setModalAktif('impor')}
          disabled={loading}
          color="#4A6B8B"
        />
        {/* Bank */}
        <ActionButton
          emoji="🏦"
          label="Bank"
          sub="Tukar Uang"
          onClick={() => setModalAktif('tukar')}
          disabled={loading}
          color="#6B8B4A"
        />
        {/* Ladang */}
        <ActionButton
          emoji="🌱"
          label="Ladang"
          sub="Tanam Bibit"
          onClick={() => setModalAktif('tanam')}
          disabled={loading || state.stokBibit <= 0}
          color="#8B8B4A"
          hint={state.stokBibit <= 0 ? "Beli bibit di Pelabuhan" : null}
        />
        {/* Koperasi */}
        <ActionButton
          emoji="🤝"
          label="Koperasi"
          sub="Pinjam/Bantu"
          onClick={() => setModalAktif('koperasi')}
          disabled={loading}
          color="#8B4A6B"
        />

        {/* FAB Lanjut Bulan - inline dengan tombol aksi */}
        <button
          onClick={handleLanjutBulan}
          disabled={loading}
          className="w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center text-2xl md:text-3xl font-bold transition-transform transform hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ml-2"
          style={{
            background: 'linear-gradient(135deg, #FFD700, #B8960F)',
            color: '#3D2B0F',
            boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
            fontFamily: "'Fredoka One', cursive",
          }}
        >
          ⏩
        </button>
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="text-4xl animate-bounce">⏳</div>
        </div>
      )}

      {/* Modals */}
      {modalAktif === 'jual' && (
        <ModalJual
          state={state}
          onJual={handleJualKopi}
          onClose={() => setModalAktif(null)}
        />
      )}
      {modalAktif === 'impor' && (
        <ModalImpor
          state={state}
          onBeli={handleBeliImpor}
          onClose={() => setModalAktif(null)}
        />
      )}
      {modalAktif === 'tukar' && (
        <ModalTukar
          state={state}
          onTukar={handleTukar}
          onClose={() => setModalAktif(null)}
        />
      )}
      {modalAktif === 'tanam' && (
        <ModalTanam
          state={state}
          onTanam={handleTanam}
          onClose={() => setModalAktif(null)}
        />
      )}
      {modalAktif === 'koperasi' && (
        <ModalKoperasi
          state={state}
          onAksi={handleKoperasi}
          onClose={() => setModalAktif(null)}
        />
      )}
    </div>
  );
}

// ===== Tombol Aksi =====

function ActionButton({ emoji, label, sub, onClick, disabled, color, hint }) {
  return (
    <div className="relative">
      <button
        onClick={onClick}
        disabled={disabled}
        className="flex flex-col items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-xl shadow-lg transition-transform transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          background: `linear-gradient(135deg, ${color}, ${color}dd)`,
          border: `2px solid ${color}88`,
        }}
      >
        <span className="text-xl md:text-2xl">{emoji}</span>
        <span className="text-[10px] md:text-xs font-bold" style={{ color: '#FFF', fontFamily: "'Fredoka One', cursive" }}>
          {label}
        </span>
      </button>
      {/* Hint tooltip saat disabled */}
      {disabled && hint && (
        <div
          className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-1 rounded text-[9px] font-bold animate-pulse"
          style={{ background: '#EF4444', color: '#FFF' }}
        >
          {hint}
        </div>
      )}
    </div>
  );
}

// ===== Modal Jual Kopi =====

function ModalJual({ state, onJual, onClose }) {
  const [kg, setKg] = useState(1);
  const [konversiKeSelga, setKonversiKeSelga] = useState(true);

  const bbmMax = Math.floor(state.stokBBM * KAPASITAS_KG_PER_BBM);
  const kgMax = Math.min(state.stokKopi, bbmMax);
  const eksporModifier = state.beritaTerkini?.efek?.hargaEksporModifier ?? 1.0;
  const hargaPerKgGC = HARGA_KOPI_GC * eksporModifier;
  const hargaPerKgSelga = Math.round(hargaPerKgGC * state.kurs * (1 - SPREAD));

  // Kalkulasi pajak
  const nilaiSelga = kg * hargaPerKgSelga;
  const omzetProyeksi = state.omzetTahunIni + nilaiSelga;
  let pajak = 0;
  if (omzetProyeksi > PTKP_UMKM) {
    const kena = omzetProyeksi - Math.max(state.omzetTahunIni, PTKP_UMKM);
    if (kena > 0) pajak = Math.round(kena * PPH_FINAL_UMKM);
  }

  const totalDiterima = konversiKeSelga ? nilaiSelga - pajak : Math.round(kg * hargaPerKgGC * 100) / 100;

  return (
    <ModalShell title="📦 Gudang — Jual Kopi" onClose={onClose}>
      <div className="space-y-4">
        <div className="text-sm" style={{ color: '#D4A76A' }}>
          Stok: <b style={{ color: '#FFD700' }}>{state.stokKopi} kg</b> | BBM cukup untuk: <b>{bbmMax} kg</b>
        </div>
        <div className="text-xs" style={{ color: '#FFF8E7' }}>
          Harga: {hargaPerKgGC.toFixed(2)} GC/kg × kurs = <b>{fmt(hargaPerKgSelga)} Selga/kg</b>
          {eksporModifier !== 1.0 && (
            <span className="ml-1">({eksporModifier > 1 ? '🟢' : '🔴'} {((eksporModifier - 1) * 100).toFixed(0)}%)</span>
          )}
        </div>

        {/* Stepper */}
        <Stepper value={kg} min={1} max={kgMax || 1} onChange={setKg} />

        {/* PBB Meter */}
        <div className="rounded-lg p-2" style={{ background: 'rgba(0,0,0,0.3)' }}>
          <div className="text-xs" style={{ color: '#D4A76A' }}>
            📊 Progres Omzet Tahunan (PTKP): {fmt(state.omzetTahunIni)} / {fmt(PTKP_UMKM)}
          </div>
          <div className="w-full h-2 bg-amber-900 rounded-full mt-1 overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{ width: `${Math.min(100, (state.omzetTahunIni / PTKP_UMKM) * 100)}%`, background: '#22C55E' }}
            />
          </div>
          {pajak > 0 && (
            <div className="text-xs text-red-400 mt-1">⚠️ PPh 0.5%: -{fmt(pajak)} Selga</div>
          )}
        </div>

        {/* Preview */}
        <div className="rounded-lg p-3 text-center" style={{ background: 'rgba(34, 197, 94, 0.2)', border: '1px solid #22C55E' }}>
          <div className="text-lg font-bold" style={{ color: '#22C55E' }}>
            +{konversiKeSelga ? fmt(totalDiterima) + ' Selga' : totalDiterima + ' GC'}
          </div>
          <div className="text-xs" style={{ color: '#D4A76A' }}>
            {kg} kg × {fmt(hargaPerKgSelga)} Selga{pajak > 0 ? ` - pajak ${fmt(pajak)}` : ''}
          </div>
        </div>

        {/* Konversi Toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => setKonversiKeSelga(true)}
            className={`flex-1 py-2 rounded-lg text-sm font-bold ${konversiKeSelga ? 'bg-green-600 text-white' : 'bg-amber-800 text-amber-400'}`}
          >
            Terima Selga
          </button>
          <button
            onClick={() => setKonversiKeSelga(false)}
            className={`flex-1 py-2 rounded-lg text-sm font-bold ${!konversiKeSelga ? 'bg-green-600 text-white' : 'bg-amber-800 text-amber-400'}`}
          >
            Simpan GC
          </button>
        </div>

        <button
          onClick={() => onJual(kg, konversiKeSelga)}
          disabled={kgMax <= 0}
          className="w-full py-3 rounded-lg font-bold text-white bg-green-600 hover:bg-green-500 disabled:bg-gray-600"
        >
          ✅ Jual {kg} kg
        </button>
      </div>
    </ModalShell>
  );
}

// ===== Modal Beli Impor =====

function ModalImpor({ state, onBeli, onClose }) {
  const [pupuk, setPupuk] = useState(0);
  const [bbm, setBbm] = useState(0);
  const [bibit, setBibit] = useState(0);

  const hargaPupukSelga = HARGA_PUPUK_GC * state.kurs;
  const hargaBbmSelga = HARGA_BBM_GC * state.kurs;
  const hargaBibitSelga = HARGA_BIBIT_GC * state.kurs;

  const biayaPupuk = pupuk * hargaPupukSelga;
  const biayaBbm = bbm * hargaBbmSelga;
  const biayaBibit = bibit * hargaBibitSelga;
  const totalBiaya = Math.round(biayaPupuk + biayaBbm + biayaBibit);

  // Calculate max for each item based on remaining budget (excluding this item's cost)
  const sisaUntukPupuk = state.kasSelga - biayaBbm - biayaBibit;
  const sisaUntukBbm = state.kasSelga - biayaPupuk - biayaBibit;
  const sisaUntukBibit = state.kasSelga - biayaPupuk - biayaBbm;

  const items = [
    { label: 'Pupuk 🧪', harga: HARGA_PUPUK_GC, hargaSelga: hargaPupukSelga, value: pupuk, set: setPupuk, stok: state.stokPupuk, sisa: sisaUntukPupuk },
    { label: 'BBM ⛽', harga: HARGA_BBM_GC, hargaSelga: hargaBbmSelga, value: bbm, set: setBbm, stok: state.stokBBM, sisa: sisaUntukBbm },
    { label: 'Bibit 🌱', harga: HARGA_BIBIT_GC, hargaSelga: hargaBibitSelga, value: bibit, set: setBibit, stok: state.stokBibit, sisa: sisaUntukBibit },
  ];

  return (
    <ModalShell title="🚢 Pelabuhan — Beli Impor" onClose={onClose}>
      <div className="space-y-3">
        <div className="text-xs rounded-lg p-2" style={{ background: 'rgba(0,0,0,0.3)', color: '#FFF8E7' }}>
          Kurs: <b style={{ color: '#FFD700' }}>{fmt(state.kurs)} Selga/GC</b>
          <div className="text-xs mt-1" style={{ color: '#D4A76A' }}>
            💡 Beli saat kurs rendah = hemat!
          </div>
        </div>

        {items.map((item) => {
          const maxAfford = Math.max(0, Math.floor(item.sisa / item.hargaSelga));
          return (
            <div key={item.label} className="rounded-lg p-3" style={{ background: 'rgba(0,0,0,0.2)' }}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-bold" style={{ color: '#FFF8E7' }}>{item.label}</span>
                <span className="text-xs" style={{ color: '#D4A76A' }}>Stok: {item.stok}</span>
              </div>
              <div className="text-xs mb-2" style={{ color: '#D4A76A' }}>
                Harga: {item.harga} GC = <b>{fmt(Math.round(item.hargaSelga))} Selga</b>/unit
              </div>
              <Stepper value={item.value} min={0} max={maxAfford} onChange={item.set} />
            </div>
          );
        })}

        {/* Preview Total */}
        <div className="rounded-lg p-3 text-center" style={{ background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #EF4444' }}>
          <div className="text-lg font-bold" style={{ color: '#EF4444' }}>
            -{fmt(totalBiaya)} Selga
          </div>
          <div className="text-xs" style={{ color: '#D4A76A' }}>
            {pupuk}pupuk + {bbm}BBM + {bibit}bibit
          </div>
        </div>

        <button
          onClick={() => onBeli(pupuk, bbm, bibit)}
          disabled={totalBiaya <= 0 || totalBiaya > state.kasSelga}
          className="w-full py-3 rounded-lg font-bold text-white bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600"
        >
          ✅ Beli Impor
        </button>
      </div>
    </ModalShell>
  );
}

// ===== Modal Tukar =====

function ModalTukar({ state, onTukar, onClose }) {
  const [arah, setArah] = useState('SELGA_KE_GC');
  const [jumlah, setJumlah] = useState(0);

  const hasil = arah === 'SELGA_KE_GC'
    ? Math.round((jumlah / state.kurs) * (1 - SPREAD) * 100) / 100
    : Math.round(jumlah * state.kurs * (1 - SPREAD));

  const maxJumlah = arah === 'SELGA_KE_GC' ? state.kasSelga : Math.floor(state.kasGC);

  return (
    <ModalShell title="🏦 Bank Desa — Tukar Uang" onClose={onClose}>
      <div className="space-y-4">
        {/* Peringatan Spread */}
        <div className="rounded-lg p-3 text-center text-sm" style={{ background: 'rgba(234, 179, 8, 0.2)', border: '1px solid #EAB308', color: '#EAB308' }}>
          ⚠️ Spread {SPREAD * 100}% — Tukar bolak-balik = RUGI!
        </div>

        {/* Toggle Arah */}
        <div className="flex gap-2">
          <button
            onClick={() => { setArah('SELGA_KE_GC'); setJumlah(0); }}
            className={`flex-1 py-3 rounded-lg font-bold ${arah === 'SELGA_KE_GC' ? 'bg-green-600 text-white' : 'bg-amber-800 text-amber-400'}`}
          >
            Selga → GC
          </button>
          <button
            onClick={() => { setArah('GC_KE_SELGA'); setJumlah(0); }}
            className={`flex-1 py-3 rounded-lg font-bold ${arah === 'GC_KE_SELGA' ? 'bg-green-600 text-white' : 'bg-amber-800 text-amber-400'}`}
          >
            GC → Selga
          </button>
        </div>

        <div className="text-sm" style={{ color: '#D4A76A' }}>
          Saldo: <b style={{ color: '#FFD700' }}>
            {arah === 'SELGA_KE_GC' ? fmt(state.kasSelga) + ' Selga' : state.kasGC.toFixed(2) + ' GC'}
          </b>
        </div>

        <Stepper value={jumlah} min={0} max={maxJumlah} step={arah === 'SELGA_KE_GC' ? 100_000 : 1} onChange={setJumlah} />

        {/* Preview */}
        {jumlah > 0 && (
          <div className="rounded-lg p-3 text-center" style={{ background: 'rgba(34, 197, 94, 0.2)', border: '1px solid #22C55E' }}>
            <div className="text-lg font-bold" style={{ color: '#22C55E' }}>
              {arah === 'SELGA_KE_GC' ? hasil.toFixed(2) + ' GC' : fmt(hasil) + ' Selga'}
            </div>
            <div className="text-xs" style={{ color: '#D4A76A' }}>
              (setelah spread {(jumlah * SPREAD * 100 / (arah === 'SELGA_KE_GC' ? state.kurs : 1)).toFixed(0)})
            </div>
          </div>
        )}

        <button
          onClick={() => onTukar(arah, jumlah)}
          disabled={jumlah <= 0}
          className="w-full py-3 rounded-lg font-bold text-white bg-amber-600 hover:bg-amber-500 disabled:bg-gray-600"
        >
          💱 Tukar
        </button>
      </div>
    </ModalShell>
  );
}

// ===== Modal Tanam =====

function ModalTanam({ state, onTanam, onClose }) {
  const [jumlah, setJumlah] = useState(0);

  const faktorBaru = Math.min(FAKTOR_TANAM_MAKS, state.faktorTanam + jumlah * 0.1);
  const persenNaik = ((faktorBaru - state.faktorTanam) * 100).toFixed(0);

  return (
    <ModalShell title="🌱 Ladang — Tanam Bibit" onClose={onClose}>
      <div className="space-y-4">
        <div className="text-sm" style={{ color: '#D4A76A' }}>
          Stok bibit: <b style={{ color: '#FFD700' }}>{state.stokBibit}</b> | Faktor tanam: <b>{state.faktorTanam.toFixed(1)}</b> / {FAKTOR_TANAM_MAKS}
        </div>

        {/* Progress Bar Faktor Tanam */}
        <div className="rounded-lg p-3" style={{ background: 'rgba(0,0,0,0.3)' }}>
          <div className="text-xs mb-1" style={{ color: '#D4A76A' }}>Kapasitas Kebun</div>
          <div className="w-full h-4 bg-amber-900 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${((state.faktorTanam / FAKTOR_TANAM_MAKS) * 100)}%`,
                background: 'linear-gradient(90deg, #22C55E, #16A34A)',
              }}
            />
          </div>
          <div className="text-xs text-center mt-1" style={{ color: '#FFF8E7' }}>
            {state.faktorTanam.toFixed(1)} → {faktorBaru.toFixed(1)} (+{persenNaik}%)
          </div>
        </div>

        <Stepper value={jumlah} min={0} max={state.stokBibit} onChange={setJumlah} />

        <button
          onClick={() => onTanam(jumlah)}
          disabled={jumlah <= 0}
          className="w-full py-3 rounded-lg font-bold text-white bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-600"
        >
          🌿 Tanam {jumlah} bibit
        </button>
      </div>
    </ModalShell>
  );
}

// ===== Modal Koperasi =====

function ModalKoperasi({ state, onAksi, onClose }) {
  const [tab, setTab] = useState('pinjam');
  const [jumlah, setJumlah] = useState(0);

  const cfg = DIFFICULTY[state.mode] || DIFFICULTY.easy;
  // Net worth = kas - pinjaman (kekayaan bersih, bukan kas total)
  const netWorth = state.kasSelga - state.pinjaman;
  const batasTotal = Math.round(netWorth * cfg.capPinjaman);
  const bisaPinjam = Math.max(0, batasTotal - state.pinjaman);
  // Bunga floating: naik jika kurs melemah (di atas 15.000)
  const bungaAktual = cfg.bungaKoperasi * Math.max(1, state.kurs / KURS_AWAL);

  return (
    <ModalShell title="🤝 Koperasi Desa" onClose={onClose}>
      <div className="space-y-4">
        {/* Tab */}
        <div className="flex gap-1">
          {['pinjam', 'bayar', 'bantu'].map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setJumlah(0); }}
              className={`flex-1 py-2 rounded-t-lg text-sm font-bold transition-colors ${
                tab === t
                  ? 'bg-amber-800 text-white'
                  : 'bg-amber-900/50 text-amber-400 hover:bg-amber-900'
              }`}
            >
              {t === 'pinjam' ? '💳 Pinjam' : t === 'bayar' ? '💰 Bayar' : '❤️ Bantu'}
            </button>
          ))}
        </div>

        <div className="rounded-lg p-3" style={{ background: 'rgba(0,0,0,0.3)' }}>
          <div className="text-xs" style={{ color: '#D4A76A' }}>
            Pinjaman aktif: <b style={{ color: '#FFD700' }}>{fmt(state.pinjaman)} Selga</b>
          </div>
          <div className="text-xs mt-1" style={{ color: '#EF4444' }}>
            Bunga: {(bungaAktual * 100).toFixed(1)}%/bulan{bungaAktual > 0.05 ? ' (floating naik!)' : ''}
            {state.pinjaman > 0 && (
              <span> = <b>{fmt(Math.round(state.pinjaman * bungaAktual))}</b>/bulan</span>
            )}
          </div>
          {tab === 'pinjam' && (
            <>
              <div className="text-xs mt-1" style={{ color: '#22C55E' }}>
                Bisa pinjam maks: {fmt(bisaPinjam)}
              </div>
              {jumlah > 0 && (
                <div className="text-xs mt-1" style={{ color: '#F59E0B' }}>
                  ⚠️ Jika pinjam {fmt(jumlah)}, bunga/bulan: <b>{fmt(Math.round((state.pinjaman + jumlah) * bungaAktual))}</b>
                </div>
              )}
            </>
          )}
        </div>

        {tab === 'bantu' && (
          <div className="text-xs text-center" style={{ color: '#D4A76A' }}>
            +{Math.floor(jumlah / 100_000)} poin kesejahteraan per 100rb
          </div>
        )}

        <Stepper
          value={jumlah}
          min={0}
          max={
            tab === 'pinjam' ? bisaPinjam
            : tab === 'bayar' ? Math.min(state.kasSelga, state.pinjaman)
            : state.kasSelga
          }
          step={100_000}
          onChange={setJumlah}
        />

        <button
          onClick={() => {
            if (tab === 'pinjam') onAksi('PINJAM', jumlah);
            else if (tab === 'bayar') onAksi('BAYAR', jumlah);
            else onAksi('BANTU_TETANGGA', jumlah);
          }}
          disabled={jumlah <= 0}
          className={`w-full py-3 rounded-lg font-bold text-white ${
            tab === 'bantu' ? 'bg-pink-600 hover:bg-pink-500' : 'bg-purple-600 hover:bg-purple-500'
          } disabled:bg-gray-600`}
        >
          {tab === 'pinjam' ? '💳 Pinjam' : tab === 'bayar' ? '💰 Bayar' : '❤️ Bantu Tetangga'} {fmt(jumlah)}
        </button>
      </div>
    </ModalShell>
  );
}

// ===== Komponen Shared =====

function ModalShell({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/50 p-4">
      <div
        className="max-w-md w-full rounded-xl p-5 max-h-[80vh] overflow-y-auto shadow-2xl"
        style={{ background: '#5C4A2E', border: '3px solid #8B6F47' }}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold" style={{ color: '#FFD700', fontFamily: "'Fredoka One', cursive" }}>
            {title}
          </h2>
          <button onClick={onClose} className="text-white text-2xl hover:text-red-400">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Stepper({ value, min, max, step = 1, onChange }) {
  const intervalRef = useRef(null);
  const timeoutRef = useRef(null);
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState('');

  // Cleanup intervals on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const stopIncrement = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const startIncrement = useCallback((direction) => {
    const doStep = () => {
      onChange((prev) => {
        const newVal = direction === 'up'
          ? Math.min(max, prev + step)
          : Math.max(min, prev - step);
        return newVal;
      });
    };

    // Immediate first step
    doStep();

    // After 300ms delay, start rapid increment every 80ms
    timeoutRef.current = setTimeout(() => {
      intervalRef.current = setInterval(doStep, 80);
    }, 300);
  }, [max, min, step, onChange]);

  const handleInputSubmit = () => {
    const parsed = parseInt(inputValue.replace(/\D/g, ''), 10);
    if (!isNaN(parsed)) {
      const clamped = Math.max(min, Math.min(max, parsed));
      // Round to nearest step
      const rounded = Math.round(clamped / step) * step;
      onChange(rounded);
    }
    setIsEditing(false);
  };

  return (
    <div className="space-y-2">
      {/* Main stepper row */}
      <div className="flex items-center gap-2">
        <button
          onMouseDown={() => startIncrement('down')}
          onMouseUp={stopIncrement}
          onMouseLeave={stopIncrement}
          onTouchStart={() => startIncrement('down')}
          onTouchEnd={stopIncrement}
          disabled={value <= min}
          className="w-12 h-12 rounded-lg bg-amber-700 text-white font-bold text-xl hover:bg-amber-600 active:bg-amber-800 disabled:opacity-50 select-none"
        >
          −
        </button>

        {/* Editable value */}
        {isEditing ? (
          <input
            type="text"
            inputMode="numeric"
            autoFocus
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onBlur={handleInputSubmit}
            onKeyDown={(e) => e.key === 'Enter' && handleInputSubmit()}
            className="flex-1 text-center text-lg font-bold bg-amber-900 rounded-lg py-2 outline-none"
            style={{ color: '#FFD700', fontFamily: "'Fredoka One', cursive" }}
          />
        ) : (
          <button
            onClick={() => { setInputValue(String(value)); setIsEditing(true); }}
            className="flex-1 text-center text-lg font-bold py-2 rounded-lg hover:bg-amber-900/50 transition-colors"
            style={{ color: '#FFD700', fontFamily: "'Fredoka One', cursive" }}
            title="Klik untuk input langsung"
          >
            {fmt(value)}
          </button>
        )}

        <button
          onMouseDown={() => startIncrement('up')}
          onMouseUp={stopIncrement}
          onMouseLeave={stopIncrement}
          onTouchStart={() => startIncrement('up')}
          onTouchEnd={stopIncrement}
          disabled={value >= max}
          className="w-12 h-12 rounded-lg bg-amber-700 text-white font-bold text-xl hover:bg-amber-600 active:bg-amber-800 disabled:opacity-50 select-none"
        >
          +
        </button>
      </div>

      {/* Quick preset buttons */}
      <div className="flex gap-1 justify-center">
        {[
          { label: 'Min', pct: 0 },
          { label: '25%', pct: 0.25 },
          { label: '50%', pct: 0.5 },
          { label: '75%', pct: 0.75 },
          { label: 'Max', pct: 1 },
        ].map(({ label, pct }) => {
          const targetValue = pct === 0 ? min : pct === 1 ? max : Math.round((min + (max - min) * pct) / step) * step;
          // Use boundary checks for Min/Max to handle dynamic max recalculation
          const isActive = pct === 0 ? value <= min
                         : pct === 1 ? value >= max
                         : value === targetValue;
          return (
            <button
              key={label}
              onClick={() => !isActive && onChange(targetValue)}
              disabled={isActive}
              className={`px-3 py-1 text-xs rounded transition-colors ${
                isActive
                  ? 'bg-amber-600 text-white cursor-default'
                  : 'bg-amber-900/60 text-amber-300 hover:bg-amber-800'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function fmt(n) {
  return n.toLocaleString('id-ID');
}