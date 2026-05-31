/**
 * NewsPanel.jsx — Pop-up Berita Ekonomi
 * Dari docs/12-ui-ux-design.md §3c + docs/06-ai-integrasi.md
 */

import React, { useState } from 'react';

const KATEGORI_INFO = {
  kebijakan_moneter: { emoji: '🏛️', label: 'Kebijakan Moneter' },
  permintaan_ekspor: { emoji: '📦', label: 'Permintaan Ekspor' },
  bencana_panen: { emoji: '🌋', label: 'Bencana Panen' },
  krisis_global: { emoji: '💥', label: 'Krisis Global' },
  harga_komoditas: { emoji: '📊', label: 'Harga Komoditas' },
  kondisi_lokal: { emoji: '🏘️', label: 'Kondisi Lokal' },
};

export default function NewsPanel({ berita, kurs, onLanjut }) {
  const info = KATEGORI_INFO[berita.kategori] || { emoji: '📰', label: berita.kategori };
  const isBadNews = berita.kategori === 'krisis_global' || berita.kategori === 'bencana_panen';
  const isGoodNews = berita.kategori === 'permintaan_ekspor' || berita.kategori === 'harga_komoditas';

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
      <div
        className={`max-w-md w-full rounded-xl p-6 shadow-2xl transform transition-all ${
          isBadNews ? 'animate-shake' : ''
        }`}
        style={{
          background: isBadNews
            ? 'linear-gradient(135deg, #5C2B2B 0%, #3D1F1F 100%)'
            : isGoodNews
            ? 'linear-gradient(135deg, #2B5C2B 0%, #1F3D1F 100%)'
            : 'linear-gradient(135deg, #8B6F47 0%, #6B5535 100%)',
          border: isBadNews ? '3px solid #EF4444' : isGoodNews ? '3px solid #22C55E' : '3px solid #D4A76A',
        }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl">{info.emoji}</span>
          <div>
            <div className="text-xs font-semibold" style={{ color: '#D4A76A' }}>
              {info.label}
            </div>
            <h2
              className="text-xl font-bold"
              style={{ color: '#FFD700', fontFamily: "'Fredoka One', cursive" }}
            >
              {berita.headline}
            </h2>
          </div>
        </div>

        {/* Isi Berita */}
        <p
          className="text-sm leading-relaxed mb-4"
          style={{ color: '#FFF8E7', fontFamily: "'Quicksand', sans-serif" }}
        >
          {berita.penjelasan}
        </p>

        {/* Efek Indikator */}
        {berita.efek && (
          <div
            className="rounded-lg p-3 mb-4"
            style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <div className="text-xs font-semibold mb-2" style={{ color: '#D4A76A' }}>
              📋 Dampak Ekonomi:
            </div>
            <div className="space-y-1 text-sm" style={{ color: '#FFF8E7', fontFamily: "'Quicksand', sans-serif" }}>
              {berita.efek.kurs !== 0 && berita.efek.kurs !== undefined && (
                <div className="flex items-center gap-2">
                  <span>{berita.efek.kurs > 0 ? '📈 Selga melemah' : '📉 Selga menguat'}</span>
                  <span className="text-xs opacity-70">
                    ({berita.efek.kurs > 0 ? '+' : ''}{berita.efek.kurs} × {Math.abs(berita.efek.kurs) * 4}%)
                  </span>
                </div>
              )}
              {berita.efek.hargaEksporModifier && berita.efek.hargaEksporModifier !== 1.0 && (
                <div className="flex items-center gap-2">
                  <span>{berita.efek.hargaEksporModifier > 1 ? '🟢 Harga kopi naik' : '🔴 Harga kopi turun'}</span>
                  <span className="text-xs opacity-70">
                    ({berita.efek.hargaEksporModifier > 1 ? '+' : ''}{Math.round((berita.efek.hargaEksporModifier - 1) * 100)}%)
                  </span>
                </div>
              )}
              {berita.efek.stokKopiDelta && berita.efek.stokKopiDelta < 0 && (
                <div className="flex items-center gap-2">
                  <span>🔴 Stok kopi berkurang</span>
                  <span className="text-xs opacity-70">({berita.efek.stokKopiDelta} kg)</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Info Kurs */}
        <div
          className="rounded-lg px-3 py-2 mb-4 text-center"
          style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          <span className="text-xs" style={{ color: '#D4A76A', fontFamily: "'Quicksand', sans-serif" }}>
            Kurs saat ini: <b style={{ color: '#FFD700' }}>{kurs.toLocaleString('id-ID')} Selga/GC</b>
          </span>
        </div>

        {/* Tombol Lanjut */}
        <button
          onClick={onLanjut}
          className="w-full py-3 rounded-lg font-bold text-lg transition-transform transform hover:scale-105 active:scale-95"
          style={{
            fontFamily: "'Fredoka One', cursive",
            background: 'linear-gradient(135deg, #FFD700, #B8960F)',
            color: '#3D2B0F',
            boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
          }}
        >
          👍 Mengerti, lanjut bertani!
        </button>
      </div>
    </div>
  );
}