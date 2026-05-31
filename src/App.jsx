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
import EndScreen from './components/EndScreen.jsx';
import AdvisorChat from './components/AdvisorChat.jsx';
import GameCanvas from './game/GameCanvas.jsx';

export default function App() {
  const [state, dispatch] = useReducer(gameReducer, stateAwal());
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoadingNews, setIsLoadingNews] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

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
      <div className="relative min-h-screen w-full max-w-[600px] mx-auto" style={{ background: '#1B4332' }}>
        <StartScreen
          onMulai={handleMulai}
          hasSave={hasSave}
          onLoad={() => { const s = muatGame(); if (s) dispatch({ type: 'MUAT', payload: s }); }}
          onDeleteSave={handleDeleteSave}
        />
      </div>
    );
  }

  // Game selesai → EndScreen
  if (state.fase === 'selesai') {
    return (
      <div className="relative min-h-screen w-full max-w-[600px] mx-auto" style={{ background: '#1B4332' }}>
        <EndScreen state={state} onMulaiUlang={() => { hapusSave(); dispatch({ type: 'MUAT', payload: stateAwal() }); }} />
      </div>
    );
  }

  // Wrapper class: max 600px centered on desktop, full width when expanded
  const wrapperClass = isExpanded
    ? 'relative min-h-screen w-full'
    : 'relative min-h-screen w-full max-w-[600px] mx-auto';

  return (
    <div className={wrapperClass} style={{ background: '#1B4332' }}>
      {/* Viewport Toggle Button (only visible on desktop) */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="hidden md:flex absolute top-[11vh] left-4 z-50 items-center justify-center w-5 h-5 rounded-full bg-black/50 backdrop-blur-sm text-white hover:bg-black/70 transition-colors"
        title={isExpanded ? "Desktop Mode (600px)" : "Full Viewport"}
      >
        {isExpanded ? (
          /* Compress icon */
          <svg xmlns="http://www.w3.org/2000/svg" className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 14h6v6m10-6h-6m0 0V8M4 14h6m0 0v-6m0 6H4m16 0h-6m0 0V8" />
          </svg>
        ) : (
          /* Expand icon */
          <svg xmlns="http://www.w3.org/2000/svg" className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M16 4h4m0 0v4M4 16v4m0 0h4m12-4v4m0 0h-4" />
          </svg>
        )}
      </button>
      {/* Background — Scene dengan karakter */}
      <GameCanvas
        kategoriBerita={state.beritaTerkini?.kategori}
        kesejahteraan={state.kesejahteraan}
      />

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

      {/* Advisor Chat Modal */}
      {showChat && <AdvisorChat state={state} onClose={() => setShowChat(false)} />}
    </div>
  );
}