/**
 * GameCanvas.jsx — Wadah Phaser 3 (Orion Protocol)
 * Dari docs/07-frontend-react.md
 * Lapis 5: Scene Desa Eldoria, karakter, partikel/VFX
 * Saat ini: placeholder dengan gradient background
 */

import React, { useEffect, useRef } from 'react';

export default function GameCanvas({ kategoriBerita }) {
  const containerRef = useRef(null);
  const gameRef = useRef(null);

  // Placeholder — Phaser akan diinisialisasi di Lapis 5
  // Saat ini hanya render background gradient yang responsif
  useEffect(() => {
    // TODO Lapis 5: Inisialisasi Phaser.Game di sini
    // const config = { type: Phaser.AUTO, parent: containerRef.current, ... };
    // gameRef.current = new Phaser.Game(config);
    
    return () => {
      // Cleanup Phaser instance saat unmount
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  const isKrisis = kategoriBerita?.includes('krisis') || kategoriBerita?.includes('bencana');

  return (
    <div
      ref={containerRef}
      className="absolute inset-0"
      style={{
        background: isKrisis
          ? 'linear-gradient(135deg, #2C3E50 0%, #1B4332 100%)'
          : 'linear-gradient(135deg, #2D6A4F 0%, #40916C 50%, #52B788 100%)',
        transition: 'background 1s ease',
      }}
    />
  );
}
