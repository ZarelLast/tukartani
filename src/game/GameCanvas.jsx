/**
 * GameCanvas.jsx — Scene Background dengan Mood Overlay
 * Dari docs/07-frontend-react.md + docs/12-ui-ux-design.md
 *
 * Pendekatan CSS-first untuk performa dan fleksibilitas.
 * Background: bg_eldoria_siang.png
 * Mood overlay berubah berdasarkan kategori berita.
 */

export default function GameCanvas({ kategoriBerita, kesejahteraan }) {
  // Deteksi mood berdasarkan kategori berita
  const isKrisis = kategoriBerita?.includes('krisis');
  const isBencana = kategoriBerita?.includes('bencana');
  const isNegatif = isKrisis || isBencana;
  const isPositif = (kategoriBerita?.includes('ekspor') || kategoriBerita?.includes('komoditas')) && !isNegatif;
  const isMoneter = kategoriBerita?.includes('moneter') && !isNegatif;

  // Pilih ekspresi karakter berdasarkan kondisi
  const getCharacterSprite = () => {
    if (isKrisis || isBencana) return '/assets/char/char_paktani_panik.png';
    if (isPositif) return '/assets/char/char_paktani_victory.png';
    if (kesejahteraan !== undefined && kesejahteraan < 30) return '/assets/char/char_paktani_serius.png';
    return '/assets/char/char_paktani_idle.png';
  };

  // Tentukan overlay style berdasarkan mood
  const getOverlayStyle = () => {
    if (isKrisis) {
      // Krisis global: dark blue-purple, feels ominous
      return 'linear-gradient(to bottom, rgba(25, 25, 60, 0.65) 0%, rgba(15, 15, 45, 0.75) 100%)';
    }
    if (isBencana) {
      // Bencana panen: dark with slight red tint
      return 'linear-gradient(to bottom, rgba(40, 20, 20, 0.6) 0%, rgba(30, 15, 15, 0.7) 100%)';
    }
    if (isPositif) {
      // Ekspor/komoditas positif: warm golden glow
      return 'linear-gradient(to bottom, rgba(255, 215, 0, 0.08) 0%, rgba(255, 180, 50, 0.12) 100%)';
    }
    if (isMoneter) {
      // Kebijakan moneter: subtle neutral tint
      return 'linear-gradient(to bottom, rgba(100, 100, 120, 0.15) 0%, rgba(80, 80, 100, 0.2) 100%)';
    }
    // Default: transparent (kondisi_lokal atau normal)
    return 'transparent';
  };

  // Filter CSS untuk efek tambahan
  const getFilterStyle = () => {
    if (isKrisis) return 'saturate(0.7) brightness(0.85)';
    if (isBencana) return 'saturate(0.8) brightness(0.9) sepia(0.1)';
    if (isPositif) return 'saturate(1.1) brightness(1.05)';
    return 'none';
  };

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Background Image - Desa Eldoria */}
      <div
        className="absolute inset-0 transition-all duration-1000 ease-in-out"
        style={{
          backgroundImage: `url('/assets/bg/bg_eldoria_siang.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          filter: getFilterStyle(),
        }}
      />

      {/* Mood Overlay - berubah berdasarkan event */}
      <div
        className="absolute inset-0 transition-all duration-1000 ease-in-out pointer-events-none"
        style={{
          background: getOverlayStyle(),
        }}
      />

      {/* Vignette effect untuk cinematic depth */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0, 0, 0, 0.35) 100%)',
        }}
      />

      {/* Subtle grain texture untuk game feel (optional) */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Karakter Pak Tani - ekspresi berubah sesuai kondisi */}
      <div
        className="absolute bottom-[10vh] left-[5%] pointer-events-none transition-all duration-500"
        style={{
          width: '80vw',
          height: '75vh',
          maxWidth: '400px',
          maxHeight: '580px',
        }}
      >
        <img
          src={getCharacterSprite()}
          alt="Pak Tani"
          className="w-full h-full object-contain transition-all duration-300"
          style={{
            filter: isNegatif ? 'brightness(0.9)' : 'brightness(0.95) contrast(1.05)',
            animation: isKrisis ? 'shake 0.5s ease-in-out' : isBencana ? 'shake 0.3s ease-in-out' : 'idle 3s ease-in-out infinite',
            objectPosition: 'bottom center',
          }}
        />
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes idle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
      `}</style>
    </div>
  );
}
