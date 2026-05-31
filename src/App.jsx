/**
 * App.jsx — Main Game Container
 * Dari docs/07-frontend-react.md (useReducer, save, RNG, news-cache)
 */

import React, { useReducer, useEffect, useState, useCallback } from 'react';
import { DIFFICULTY } from './difficulty.js';
import { rngGiliran } from './rng.js';
import { simpanGame, muatGame, hapusSave } from './save.js';
import { gameReducer, stateAwal } from './gameReducer.js';
import { isiAntrianBeritaSync } from './newsCache.js';
import StartScreen from './components/StartScreen.jsx';
import Dashboard from './components/Dashboard.jsx';
import NewsPanel from './components/NewsPanel.jsx';
import DecisionPanel from './components/DecisionPanel.jsx';
import KursChart from './components/KursChart.jsx';
import EndScreen from './components/EndScreen.jsx';
import AdvisorChat from './components/AdvisorChat.jsx';
import GameCanvas from './game/GameCanvas.jsx';

export default function App() {
  const [state, dispatch] = useReducer(gameReducer, stateAwal());
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoadingNews, setIsLoadingNews] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showKursChart, setShowKursChart] = useState(false);

  // Load save on mount
  useEffect(() => {
    const save = muatGame();
    if (save) {
      dispatch({ type: 'MUAT', payload: save });
    }
    setIsLoaded(true);
  }, []);

  // Auto-save setiap state berubah (setelah loaded)
  useEffect(() => {
    if (isLoaded && state.fase !== 'belum_mulai') {
      simpanGame(state);
    }
  }, [state, isLoaded]);

  // Handle MULAI — generate antrian berita sync
  const handleMulai = useCallback((params) => {
    const cfg = DIFFICULTY[params.mode];
    // Generate antrian berita sync untuk tahun pertama
    const antrian = isiAntrianBeritaSync(params.seed, 0, cfg);
    dispatch({ type: 'MULAI', payload: { ...params, antrianBerita: antrian } });
  }, []);

  // Handle LANJUT_BULAN — jika awal tahun baru, generate berita baru
  const handleLanjutBulan = useCallback(() => {
    const tahunBaru = (state.giliran + 1 - 1) % 12 === 0; // giliran berikut = awal tahun?
    if (tahunBaru && state.antrianBerita.length === 0) {
      const tahunKe = Math.floor(state.giliran / 12);
      const cfg = DIFFICULTY[state.mode];
      const antrian = isiAntrianBeritaSync(state.seed, tahunKe, cfg);
      // Update antrian via dispatch khusus
      dispatch({ type: 'UPDATE_ANTRIAN', payload: antrian });
    }
    dispatch({ type: 'LANJUT_BULAN' });
  }, [state.giliran, state.antrianBerita.length, state.seed, state.mode]);

  // Handle reset game
  const handleDeleteSave = useCallback(() => {
    hapusSave();
    dispatch({ type: 'MUAT', payload: stateAwal() });
  }, []);


  if (!isLoaded) {
    return <div className="flex items-center justify-center min-h-screen text-amber-200" style={{ background: '#1B4332' }}>Memuat...</div>;
  }

  // Belum mulai → StartScreen
  if (state.fase === 'belum_mulai') {
    const hasSave = !!muatGame();
    return (
      <StartScreen
        onMulai={handleMulai}
        hasSave={hasSave}
        onLoad={() => { const s = muatGame(); if (s) dispatch({ type: 'MUAT', payload: s }); }}
        onDeleteSave={handleDeleteSave}
      />
    );
  }

  // Game selesai → EndScreen
  if (state.fase === 'selesai') {
    return <EndScreen state={state} onMulaiUlang={() => { hapusSave(); dispatch({ type: 'MUAT', payload: stateAwal() }); }} />;
  }

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: '#1B4332' }}>
      {/* Background — Phaser Canvas (placeholder untuk Lapis 5) */}
      <GameCanvas kategoriBerita={state.beritaTerkini?.kategori} />

      {/* HUD Overlay */}
      <Dashboard state={state} />

      {/* News Panel (fase berita) */}
      {state.fase === 'berita' && (
        <NewsPanel berita={state.beritaTerkini} kurs={state.kurs} onLanjut={() => dispatch({ type: 'PANEN_SELESAI' })} />
      )}

      {/* Decision Panel (fase keputusan) */}
      {state.fase === 'keputusan' && (
        <DecisionPanel
          state={state}
          onDispatch={(aksi) => dispatch(aksi)}
          onLanjutBulan={handleLanjutBulan}
          onBukaChat={() => setShowChat(true)}

        />
      )}

      {/* KursChart */}
      <KursChart riwayatKurs={state.riwayatKurs} riwayatBerita={state.riwayatBerita} isOpen={showKursChart} onClose={() => setShowKursChart(false)} />

      {/* Advisor Chat Modal */}
      {showChat && <AdvisorChat state={state} onClose={() => setShowChat(false)} />}
    </div>
  );
}