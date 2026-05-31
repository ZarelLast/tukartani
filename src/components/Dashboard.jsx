/**
 * Dashboard.jsx — HUD (Heads-Up Display)
 * Dari docs/12-ui-ux-design.md §3b + docs/14-aset-layout-ui.md §3
 */

import React, { useState } from 'react';

export default function Dashboard({ state }) {
  const [showKursChart, setShowKursChart] = useState(false);

  // Kalkulasi biaya hidup bulan ini (preview)
  const biayaKeluargaBulanan = state.biayaKeluargaLokal + (state.biayaKeluargaImporGC * state.kurs);
  const tagihanListrik = 100_000 + (state.panenTerakhir * 1_500);
  const pbbBulanIni = (state.giliran > 0 && state.giliran % 12 === 0) ? state.faktorTanam * 10 * 50_000 : 0;
  const totalTagihan = Math.round(biayaKeluargaBulanan + tagihanListrik + pbbBulanIni);

  return (
    <>
      {/* Kiri Atas — Kalender/Giliran */}
      <div className="absolute top-2 left-2 md:top-4 md:left-4 z-10">
        <div
          className="rounded-lg px-3 py-2 text-center shadow-lg"
          style={{ background: '#D4A76A', border: '2px solid #8B6F47' }}
        >
          <div className="text-xs font-semibold" style={{ color: '#5C4A2E', fontFamily: "'Quicksand', sans-serif" }}>Bulan</div>
          <div className="text-xl font-bold" style={{ color: '#3D2B0F', fontFamily: "'Fredoka One', cursive" }}>
            {state.giliran}
          </div>
          <div className="text-xs" style={{ color: '#6B5535', fontFamily: "'Quicksand', sans-serif" }}>
            / {state.totalGiliran}
          </div>
        </div>
      </div>

      {/* Kanan Atas — Keuangan */}
      <div className="absolute top-2 right-2 md:top-4 md:right-4 z-10 space-y-1">
        {/* Kas Selga */}
        <div
          className="rounded-full px-4 py-1 flex items-center gap-2 shadow-lg"
          style={{ background: '#5C4A2E', border: '2px solid #8B6F47' }}
        >
          <span className="text-lg">💰</span>
          <div>
            <div className="text-xs" style={{ color: '#D4A76A', fontFamily: "'Quicksand', sans-serif" }}>Selga</div>
            <div className="text-sm font-bold" style={{ color: '#FFD700', fontFamily: "'Fredoka One', cursive" }}>
              {fmt(state.kasSelga)}
            </div>
          </div>
        </div>

        {/* Kas GC */}
        <div
          className="rounded-full px-4 py-1 flex items-center gap-2 shadow-lg"
          style={{ background: '#5C4A2E', border: '2px solid #8B6F47' }}
        >
          <span className="text-lg">🪙</span>
          <div>
            <div className="text-xs" style={{ color: '#D4A76A', fontFamily: "'Quicksand', sans-serif" }}>GC</div>
            <div className="text-sm font-bold" style={{ color: '#FFD700', fontFamily: "'Fredoka One', cursive" }}>
              {state.kasGC.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Kurs */}
        <div
          className="rounded-lg px-3 py-1 shadow-lg"
          style={{ background: '#5C4A2E', border: '2px solid #8B6F47' }}
        >
          <div className="text-xs" style={{ color: '#D4A76A', fontFamily: "'Quicksand', sans-serif" }}>Kurs</div>
          <div className="text-sm font-bold" style={{ color: '#FFD700', fontFamily: "'Fredoka One', cursive" }}>
            {fmt(state.kurs)} /GC
          </div>
        </div>

        {/* Tombol Grafik Kurs */}
        <button
          onClick={() => setShowKursChart(!showKursChart)}
          className="rounded-lg px-3 py-1 shadow-lg hover:scale-105 transition-transform"
          style={{ background: '#5C4A2E', border: '2px solid #8B6F47', fontFamily: "'Quicksand', sans-serif", fontSize: '12px', color: '#D4A76A' }}
        >
          📈 Grafik
        </button>
      </div>

      {/* Kanan Bawah — Stok Inventaris */}
      <div className="absolute bottom-20 md:bottom-24 right-2 md:right-4 z-10">
        <div
          className="rounded-lg px-2 py-2 shadow-lg"
          style={{ background: 'rgba(92, 74, 46, 0.9)', border: '2px solid #8B6F47' }}
        >
          <div className="text-xs mb-1 font-semibold" style={{ color: '#D4A76A', fontFamily: "'Quicksand', sans-serif" }}>Stok</div>
          <div className="grid grid-cols-2 gap-1 text-xs" style={{ fontFamily: "'Quicksand', sans-serif", color: '#FFF8E7' }}>
            <div>☕ Kopi: <b>{state.stokKopi}</b>kg</div>
            <div>🧪 Pupuk: <b>{state.stokPupuk}</b></div>
            <div>⛽ BBM: <b>{state.stokBBM}</b></div>
            <div>🌱 Bibit: <b>{state.stokBibit}</b></div>
          </div>
        </div>
      </div>

      {/* Kanan Bawah — Kesejahteraan & Biaya Hidup */}
      <div className="absolute bottom-20 md:bottom-44 right-2 md:right-4 z-10" style={{ marginRight: state.mode ? '0' : '0' }}>
        <div
          className="rounded-lg px-3 py-2 shadow-lg"
          style={{ background: 'rgba(92, 74, 46, 0.9)', border: '2px solid #8B6F47' }}
        >
          <div className="text-xs font-semibold" style={{ color: '#D4A76A', fontFamily: "'Quicksand', sans-serif" }}>
            ❤️ Kesejahteraan
          </div>
          <div className="w-24 h-3 bg-amber-900 rounded-full mt-1 overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${state.kesejahteraan}%`,
                background: state.kesejahteraan > 50 ? '#22C55E' : state.kesejahteraan > 20 ? '#EAB308' : '#EF4444',
              }}
            />
          </div>
          <div className="text-xs text-center mt-1" style={{ color: '#FFF8E7', fontFamily: "'Quicksand', sans-serif" }}>
            {state.kesejahteraan}%
          </div>
          {/* Biaya Hidup */}
          <div className="text-xs mt-2" style={{ color: '#EF4444', fontFamily: "'Quicksand', sans-serif", fontWeight: 'bold' }}>
            🔥 Tagihan: {fmt(totalTagihan)}
            {pbbBulanIni > 0 && <span className="ml-1 text-[10px]">(PBB!)</span>}
          </div>
          <div className="text-xs" style={{ color: '#D4A76A', fontFamily: "'Quicksand', sans-serif" }}>
            Pinjaman: {fmt(state.pinjaman)}
          </div>
        </div>
      </div>

      {/* Kurs Chart Modal */}
      {showKursChart && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div
            className="rounded-xl p-6 max-w-lg w-full"
            style={{ background: '#5C4A2E', border: '3px solid #8B6F47' }}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold" style={{ color: '#FFD700', fontFamily: "'Fredoka One', cursive" }}>
                📈 Grafik Kurs
              </h2>
              <button
                onClick={() => setShowKursChart(false)}
                className="text-white text-2xl hover:text-red-400"
              >
                ✕
              </button>
            </div>
            <div className="bg-amber-100/10 rounded-lg p-4 max-h-60 overflow-y-auto">
              <table className="w-full text-xs" style={{ color: '#FFF8E7', fontFamily: "'Quicksand', sans-serif" }}>
                <thead>
                  <tr className="border-b border-amber-700">
                    <th className="py-1">Bulan</th>
                    <th className="py-1">Kurs</th>
                    <th className="py-1">Trend</th>
                  </tr>
                </thead>
                <tbody>
                  {state.riwayatKurs.map((k, i) => (
                    <tr key={i} className={i === state.riwayatKurs.length - 1 ? 'font-bold text-amber-300' : ''}>
                      <td className="py-1">{i + 1}</td>
                      <td className="py-1">{fmt(k)}</td>
                      <td className="py-1">
                        {i > 0 && (
                          <span className={k > state.riwayatKurs[i - 1] ? 'text-red-400' : k < state.riwayatKurs[i - 1] ? 'text-green-400' : ''}>
                            {k > state.riwayatKurs[i - 1] ? '📈' : k < state.riwayatKurs[i - 1] ? '📉' : '➡️'}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function fmt(n) {
  return n.toLocaleString('id-ID');
}