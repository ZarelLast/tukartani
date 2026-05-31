/**
 * AdvisorChat.jsx — Chat Penasihat (Pak Tani Bijak)
 * Dari docs/06-ai-integrasi.md §6b + docs/07-frontend-react.md
 */

import React, { useState, useCallback } from 'react';

const MAX_CHAT = 20;

export default function AdvisorChat({ state, onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [chatCount, setChatCount] = useState(0);

  const handleChat = useCallback(() => {
    if (!input.trim() || chatCount >= MAX_CHAT) return;

    const userMsg = { role: 'user', text: input.trim() };
    const lower = input.toLowerCase();

    // Scope-lock: cek apakah pertanyaan relevan
    const topikRelevan = /kurs|selga|gc|gold|coin|kopi|pupuk|bbm|bibit|pinjam|koperasi|sejahtera|tanam|jual|beli|tukar|saham|harga|ekspor|impor|keuangan|modal|bunga|pajak|ptkp|omzet|tips|saran|bantu|cara|strategi|bagaimana|kenapa|mengapa|apa/i.test(lower);

    let aiText;
    if (!topikRelevan) {
      aiText = 'Maaf, saya cuma bisa bantu soal kebunmu dan ekonomi Desa Eldoria.';
    } else if (lower.includes('kurs') || lower.includes('selga melemah')) {
      aiText = `Kurs saat ini ${state.kurs} Selga/GC. Jika Selga melemah, ekspor kopi menguntungkan tapi impor jadi mahal. Pertimbangkan tukar ke GC saat kurs rendah untuk lindung nilai.`;
    } else if (lower.includes('pupuk')) {
      aiText = `Stok pupukmu: ${state.stokPupuk}. Pupuk wajib untuk panen optimal (butuh 2 unit per panen). Beli saat Selga kuat (kurs rendah) agar lebih murah!`;
    } else if (lower.includes('pinjam') || lower.includes('koperasi')) {
      aiText = `Pinjamanmu: ${state.pinjaman} Selga. Bunga koperasi floating rate — naik saat kurs melemah! Jangan pinjam melebihi kemampuan bayar.`;
    } else if (lower.includes('sejahtera') || lower.includes('tetangga')) {
      aiText = `Kesejahteraan: ${state.kesejahteraan}/100. Bantu tetangga meningkatkan kesejahteraan, yang jadi multiplier skor akhir!`;
    } else if (lower.includes('tips') || lower.includes('strategi') || lower.includes('saran')) {
      aiText = 'Tips: Jaga kas ≥2× tagihan bulanan, tukar ke GC saat kurs murah, jangan abaikan tetangga, dan jual kopi saat Selga melemah!';
    } else if (lower.includes('pajak') || lower.includes('ptkp')) {
      aiText = 'PPh Final UMKM 0,5% hanya kena jika omzet tahunan di atas 500 juta. Ambang ini sengaja tinggi — fokus saja bertani!';
    } else {
      aiText = `Kurs: ${state.kurs} Selga/GC | Kas: ${state.kasSelga.toLocaleString('id-ID')} Selga | Kopi: ${state.stokKopi} kg. Tanyakan soal kurs, pupuk, pinjaman, atau strategi!`;
    }

    const aiMsg = { role: 'ai', text: aiText };
    setMessages(prev => [...prev, userMsg, aiMsg]);
    setInput('');
    setChatCount(prev => prev + 1);
  }, [input, chatCount, state]);

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl p-4" style={{ background: '#5C4A2E', border: '3px solid #8B6F47', maxHeight: '80vh', overflowY: 'auto' }}>
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-bold" style={{ color: '#FFD700', fontFamily: "'Fredoka One', cursive" }}>
            💬 Pak Tani Bijak {chatCount >= MAX_CHAT ? '(Istirahat)' : ''}
          </h3>
          <button onClick={onClose} className="text-2xl hover:text-red-400" style={{ color: '#D4A76A' }}>✕</button>
        </div>

        {/* Messages */}
        <div className="space-y-2 mb-3 max-h-64 overflow-y-auto">
          {messages.length === 0 && (
            <p className="text-center text-sm" style={{ color: '#D4A76A', fontFamily: "'Quicksand', sans-serif" }}>
              Tanya soal ekonomi Desa Eldoria, kurs, strategi, dll.
            </p>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`rounded-lg px-3 py-2 text-sm ${m.role === 'user' ? 'bg-green-700/50 ml-8' : 'bg-amber-900/50 mr-8'}`}>
              <p style={{ color: '#FFF', fontFamily: "'Quicksand', sans-serif" }}>{m.text}</p>
            </div>
          ))}
        </div>

        {/* Input */}
        {chatCount < MAX_CHAT && (
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleChat()}
              placeholder="Tanya Pak Tani..."
              maxLength={200}
              className="flex-1 px-3 py-2 rounded-lg bg-amber-900/40 border border-amber-700 text-amber-100 placeholder-amber-400 focus:outline-none focus:border-amber-400"
              style={{ fontFamily: "'Quicksand', sans-serif" }}
            />
            <button
              onClick={handleChat}
              className="px-4 py-2 rounded-lg font-bold text-white"
              style={{ background: '#22C55E', fontFamily: "'Fredoka One', cursive" }}
            >
              Kirim
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
