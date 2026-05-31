/**
 * EndScreen.jsx — Layar Akhir (Skor + Rapor Edukasi)
 * Dari docs/08-skor-dan-rapor.md
 */

import React from 'react';
import { HARGA_KOPI_GC } from '../ekonomi.js';

export default function EndScreen({ state, onMulaiUlang }) {
  // Hitung skor
  const kekayaanBersih = state.kasSelga + (state.kasGC * state.kurs) + (state.stokKopi * HARGA_KOPI_GC * state.kurs);
  const faktorSejahtera = Math.max(0, Math.min(1, state.kesejahteraan / 100)) * 1.2;
  const skor = Math.round(kekayaanBersih * faktorSejahtera);

  // Tentukan kondisi akhir
  const isBangkrut = state.kasSelga < 0 && state.log.some(l => l.includes('BANGKRUT'));
  const isKeluargaHancur = state.log.some(l => l.includes('KELUARGA HANCUR'));
  const isTamat = state.log.some(l => l.includes('PERMAINAN SELESAI'));

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div
        className={`max-w-md w-full rounded-2xl p-8 shadow-2xl ${
          isBangkrut || isKeluargaHancur ? 'animate-shake' : ''
        }`}
        style={{
          background: isBangkrut || isKeluargaHancur
            ? 'linear-gradient(135deg, #3D2B2B 0%, #2B1F1F 100%)'
            : 'linear-gradient(135deg, #8B6F47 0%, #6B5535 100%)',
          border: isBangkrut || isKeluargaHancur
            ? '4px solid #EF4444'
            : '4px solid #FFD700',
        }}
      >
        {/* Header */}
        <div className="text-center mb-6">
          {isTamat ? (
            <>
              <div className="text-5xl mb-2">🏆</div>
              <h1 className="text-3xl font-bold" style={{ color: '#FFD700', fontFamily: "'Fredoka One', cursive" }}>
                Permainan Selesai!
              </h1>
              <p className="text-sm mt-2" style={{ color: '#FFF8E7', fontFamily: "'Quicksand', sans-serif" }}>
                {state.namaKebun} bertahan selama {state.totalGiliran} bulan!
              </p>
            </>
          ) : isBangkrut ? (
            <>
              <div className="text-5xl mb-2">💸</div>
              <h1 className="text-3xl font-bold" style={{ color: '#EF4444', fontFamily: "'Fredoka One', cursive" }}>
                BANGKRUT!
              </h1>
              <p className="text-sm mt-2" style={{ color: '#FFF8E7', fontFamily: "'Quicksand', sans-serif" }}>
                Kas tetap minus setelah likuidasi paksa di bulan {state.giliran}.
              </p>
            </>
          ) : (
            <>
              <div className="text-5xl mb-2">💔</div>
              <h1 className="text-3xl font-bold" style={{ color: '#EF4444', fontFamily: "'Fredoka One', cursive" }}>
                Keluarga Hancur!
              </h1>
              <p className="text-sm mt-2" style={{ color: '#FFF8E7', fontFamily: "'Quicksand', sans-serif" }}>
                Kesejahteraan jatuh ke 0 di bulan {state.giliran}.
              </p>
            </>
          )}
        </div>

        {/* Rincian Kekayaan */}
        <div className="rounded-xl p-4 mb-4" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <h2 className="text-lg font-bold mb-3" style={{ color: '#FFD700', fontFamily: "'Fredoka One', cursive" }}>
            💰 Rincian Kekayaan
          </h2>
          <div className="space-y-1 text-sm" style={{ color: '#FFF8E7', fontFamily: "'Quicksand', sans-serif" }}>
            <div className="flex justify-between">
              <span>Kas Selga</span>
              <b style={{ color: '#FFD700' }}>{fmt(state.kasSelga)}</b>
            </div>
            <div className="flex justify-between">
              <span>Kas GC (× kurs)</span>
              <b style={{ color: '#FFD700' }}>{fmt(state.kasGC * state.kurs)}</b>
            </div>
            <div className="flex justify-between">
              <span>Stok Kopi ({state.stokKopi} kg)</span>
              <b style={{ color: '#FFD700' }}>{fmt(state.stokKopi * HARGA_KOPI_GC * state.kurs)}</b>
            </div>
            <div className="border-t border-amber-700 pt-1 flex justify-between font-bold">
              <span> Kekayaan Bruto</span>
              <b style={{ color: '#FFD700' }}>{fmt(kekayaanBersih)}</b>
            </div>
            <div className="flex justify-between">
              <span>Sisa Pinjaman</span>
              <b style={{ color: '#EF4444' }}>-{fmt(state.pinjaman)}</b>
            </div>
          </div>
        </div>

        {/* Multiplier Kesejahteraan */}
        <div className="rounded-xl p-4 mb-4" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <div className="flex justify-between items-center">
            <span className="text-sm" style={{ color: '#D4A76A' }}>
              ❤️ Kesejahteraan: {state.kesejahteraan}%
            </span>
            <span className="text-lg font-bold" style={{ color: state.kesejahteraan > 50 ? '#22C55E' : '#EF4444' }}>
              ×{faktorSejahtera.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Skor Akhir */}
        <div
          className="rounded-xl p-6 text-center mb-4"
          style={{ background: 'linear-gradient(135deg, rgba(255,215,0,0.2), rgba(184,150,15,0.2))', border: '2px solid #FFD700' }}
        >
          <div className="text-sm" style={{ color: '#D4A76A' }}>SKOR AKHIR</div>
          <div className="text-4xl font-bold" style={{ color: '#FFD700', fontFamily: "'Fredoka One', cursive" }}>
            {fmt(skor)}
          </div>
        </div>

        {/* Rapor Edukasi (deterministik dari log) */}
        <div className="rounded-xl p-4 mb-4" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <h2 className="text-lg font-bold mb-3" style={{ color: '#FFD700', fontFamily: "'Fredoka One', cursive" }}>
            📋 Rapor Edukasi — {state.namaKebun}
          </h2>
          <div className="space-y-2 text-sm" style={{ color: '#FFF8E7', fontFamily: "'Quicksand', sans-serif" }}>
            {generateRapor(state)}
          </div>
        </div>

        {/* Tombol Main Lagi */}
        <button
          onClick={onMulaiUlang}
          className="w-full py-4 rounded-lg font-bold text-lg transition-transform transform hover:scale-105 active:scale-95"
          style={{
            fontFamily: "'Fredoka One', cursive",
            background: 'linear-gradient(135deg, #FFD700, #B8960F)',
            color: '#3D2B0F',
            boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
          }}
        >
          🔄 Main Lagi
        </button>
      </div>
    </div>
  );
}

function generateRapor(state) {
  const insights = [];
  const log = state.log;

  // Analisis jual
  const jualCount = log.filter(l => l.includes('JUAL')).length;
  if (jualCount === 0) {
    insights.push('❌ Kamu tidak pernah menjual kopi — stok menumpuk dan membusuk sia-sia.');
  } else if (jualCount >= 5) {
    insights.push('✅ Rajin menjual kopi — cash flow terjaga.');
  }

  // Analisis bantu tetangga
  const bantuCount = log.filter(l => l.includes('BANTU_TETANGGA')).length;
  if (bantuCount === 0 && state.kesejahteraan < 50) {
    insights.push('⚠️ Kesejahteraan rendah karena tidak pernah bantu tetangga. Ini mengurangi skor akhir secara signifikan!');
  } else if (bantuCount >= 3) {
    insights.push(`✅ Bantu tetangga ${bantuCount} kali — kesejahteraan terjaga, skor terdongkrak!`);
  }

  // Analisis tukar
  const tukarCount = log.filter(l => l.includes('TUKAR')).length;
  if (tukarCount > 5) {
    insights.push('⚠️ Terlalu sering tukar uang — spread 1.5% menggerus kas.');
  }

  // Analisis pinjaman
  if (state.pinjaman > 0) {
    insights.push(`⚠️ Masih punya sisa pinjaman ${fmt(state.pinjaman)} Selga.`);
  } else if (log.some(l => l.includes('PINJAM'))) {
    insights.push('✅ Berhasil melunasi pinjaman koperasi.');
  }

  // Analisis kurs
  if (state.kurs > state.riwayatKurs[0]) {
    insights.push(`📈 Kurs akhir (${fmt(state.kurs)}) lebih tinggi dari awal — Selga melemah. Siapa yang jual kopi saat itu untung!`);
  } else {
    insights.push(`📉 Kurs akhir (${fmt(state.kurs)}) lebih rendah dari awal — Selga menguat. Siapa yang beli impor saat itu hemat!`);
  }

  // Pelajaran utama
  insights.push('💡 Ingat: Selga melemah = penjual untung, pembeli rugi. Selga menguat = sebaliknya.');

  return insights.map((i, idx) => <p key={idx}>{i}</p>);
}

function fmt(n) {
  return n.toLocaleString('id-ID');
}