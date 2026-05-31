/**
 * StartScreen — Layar Judul (pilih mode + input nama)
 * Dari docs/07-frontend-react.md §input-nama + docs/12-ui-ux-design.md §3a
 */

import React, { useState } from 'react';
import { DIFFICULTY } from '../difficulty.js';

// Daftar kata kasar sederhana (filter minimal untuk lomba)
const KATA_KASAR = ['anjing', 'bangsat', 'kontol', 'goblok', 'bego', 'tolol', 'kampret', 'sialan', 'tai', 'burik'];

function saringNama(nama) {
  const lower = nama.toLowerCase();
  return KATA_KASAR.some(k => lower.includes(k));
}

export default function StartScreen({ onMulai, hasSave, onLoad, onDeleteSave }) {
  const [namaPetani, setNamaPetani] = useState('');
  const [namaKebun, setNamaKebun] = useState('');
  const [mode, setMode] = useState(null);
  const [error, setError] = useState('');

  const handleMulai = () => {
    if (!mode) {
      setError('Pilih tingkat kesulitan dulu!');
      return;
    }
    const np = namaPetani.trim().slice(0, 20) || 'Pak Tani';
    const nk = namaKebun.trim().slice(0, 20) || 'Kebun Eldoria';
    if (saringNama(np) || saringNama(nk)) {
      setError('Nama tidak pantas tidak diperbolehkan!');
      return;
    }
    setError('');
    onMulai({ mode, namaPetani: np, namaKebun: nk, seed: Date.now() });
  };

  const handleLoad = () => {
    onLoad();
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div
        className="panel-kayu max-w-md w-full p-8 text-center"
        style={{ background: 'linear-gradient(135deg, #8B6F47 0%, #6B5535 100%)' }}
      >
        {/* Judul */}
        <h1
          className="text-4xl md:text-5xl font-bold mb-2"
          style={{ fontFamily: "'Fredoka One', cursive", color: '#FFD700', textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}
        >
          🌿 Tukar Tani 🌿
        </h1>
        <p className="text-amber-100 text-sm mb-6" style={{ fontFamily: "'Quicksand', sans-serif" }}>
          Simulasi Ekonomi Petani Kopi Desa Eldoria
        </p>

        {/* Input Nama */}
        <div className="space-y-3 mb-6">
          <div>
            <label className="block text-left text-amber-200 text-sm font-semibold mb-1">Nama Petani</label>
            <input
              type="text"
              value={namaPetani}
              onChange={(e) => setNamaPetani(e.target.value)}
              maxLength={20}
              placeholder="Pak Tani"
              className="w-full px-4 py-3 rounded-lg bg-amber-900/40 border-2 border-amber-700 text-amber-100 placeholder-amber-400 focus:outline-none focus:border-amber-400"
              style={{ fontFamily: "'Quicksand', sans-serif" }}
            />
          </div>
          <div>
            <label className="block text-left text-amber-200 text-sm font-semibold mb-1">Nama Kebun</label>
            <input
              type="text"
              value={namaKebun}
              onChange={(e) => setNamaKebun(e.target.value)}
              maxLength={20}
              placeholder="Kebun Eldoria"
              className="w-full px-4 py-3 rounded-lg bg-amber-900/40 border-2 border-amber-700 text-amber-100 placeholder-amber-400 focus:outline-none focus:border-amber-400"
              style={{ fontFamily: "'Quicksand', sans-serif" }}
            />
          </div>
        </div>

        {/* Pilih Mode */}
        <div className="space-y-2 mb-6">
          <p className="text-amber-200 text-sm font-semibold mb-2">Tingkat Kesulitan</p>
          <div className="grid grid-cols-1 gap-2">
            {Object.entries(DIFFICULTY).map(([key, cfg]) => (
              <button
                key={key}
                onClick={() => setMode(key)}
                className={`py-3 px-4 rounded-lg font-bold transition-all transform hover:scale-105 ${
                  mode === key ? 'ring-2 ring-white ring-offset-2 ring-offset-transparent' : ''
                }`}
                style={{
                  fontFamily: "'Fredoka One', cursive",
                  background: key === 'easy' ? '#22C55E' : key === 'medium' ? '#EAB308' : '#EF4444',
                  color: key === 'medium' ? '#000' : '#FFF',
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="capitalize">{key}</span>
                  <span className="text-xs opacity-80">{cfg.totalGiliran} bulan</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <p className="text-red-300 text-sm mb-4">{error}</p>
        )}

        {/* Tombol Mulai */}
        <button
          onClick={handleMulai}
          className="w-full py-4 rounded-lg font-bold text-lg text-white transition-transform transform hover:scale-105 active:scale-95"
          style={{
            fontFamily: "'Fredoka One', cursive",
            background: 'linear-gradient(135deg, #FFD700, #B8960F)',
            color: '#3D2B0F',
            boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
          }}
        >
          🌱 Mulai Bertani!
        </button>

        {/* Tombol Load Save */}
        {hasSave && (
          <div className="mt-4 space-y-2">
            <button
              onClick={handleLoad}
              className="w-full py-3 rounded-lg font-bold text-amber-100 border-2 border-amber-600 hover:bg-amber-700/50 transition-colors"
              style={{ fontFamily: "'Fredoka One', cursive" }}
            >
              📂 Lanjutkan Permainan
            </button>
            <button
              onClick={onDeleteSave}
              className="w-full py-2 rounded-lg text-sm text-amber-400 hover:text-amber-200 transition-colors"
              style={{ fontFamily: "'Quicksand', sans-serif" }}
            >
              Hapus Save
            </button>
          </div>
        )}
      </div>
    </div>
  );
}