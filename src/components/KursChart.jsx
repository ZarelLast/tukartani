/**
 * KursChart.jsx — Grafik Kurs (menggunakan Recharts)
 * Dari docs/07-frontend-react.md + docs/12-ui-ux-design.md §3i
 */

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

export default function KursChart({ riwayatKurs, riwayatBerita, isOpen, onClose }) {
  if (!isOpen || riwayatKurs.length === 0) return null;

  const data = riwayatKurs.map((k, i) => {
    // riwayatBerita[i] sesuai dengan kurs pada bulan i (kurs awal = index 0, tidak ada berita)
    const berita = riwayatBerita?.[i - 1];
    const kategori = berita?.kategori || '';
    return {
      bulan: i,
      kurs: k,
      headline: berita?.headline || (i === 0 ? 'Kurs Awal' : ''),
      isKrisis: kategori.includes('krisis'),
      isBencana: kategori.includes('bencana'),
      isPositif: kategori.includes('ekspor') || (kategori.includes('komoditas') && berita?.efek?.hargaEksporModifier > 1),
    };
  });

  const minKurs = Math.min(...riwayatKurs);
  const maxKurs = Math.max(...riwayatKurs);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div
        className="rounded-xl p-5 max-w-lg w-full"
        style={{ background: '#5C4A2E', border: '3px solid #8B6F47', boxShadow: '0 8px 32px rgba(0,0,0,0.6)' }}
      >
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-bold" style={{ color: '#FFD700', fontFamily: "'Fredoka One', cursive" }}>
            📈 Grafik Kurs Selga/GC
          </h2>
          <button onClick={onClose} className="text-2xl hover:text-red-400" style={{ color: '#D4A76A' }}>✕</button>
        </div>

        <div className="rounded-lg p-3" style={{ background: '#D4A76A22' }}>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
              <XAxis
                dataKey="bulan"
                tick={{ fontSize: 10, fill: '#D4A76A' }}
                tickLine={false}
                axisLine={{ stroke: '#8B6F4755' }}
              />
              <YAxis
                domain={['auto', 'auto']}
                tick={{ fontSize: 10, fill: '#D4A76A' }}
                tickLine={false}
                axisLine={{ stroke: '#8B6F4755' }}
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                formatter={(value) => [value.toLocaleString('id-ID') + ' Selga/GC', 'Kurs']}
                labelFormatter={(label, payload) => {
                  const item = payload?.[0]?.payload;
                  if (item?.headline) return `Bulan ${label}: ${item.headline}`;
                  return `Bulan ${label}`;
                }}
                contentStyle={{ background: '#5C4A2E', border: '1px solid #8B6F47', borderRadius: 8, color: '#FFF8E7', fontFamily: "'Quicksand', sans-serif", fontSize: 12, maxWidth: 250 }}
              />
              <ReferenceLine y={15000} stroke="#8B6F4755" strokeDasharray="5 5" />
              <Line
                type="monotone"
                dataKey="kurs"
                stroke="#2563EB"
                strokeWidth={3}
                dot={(props) => {
                  const { cx, cy, payload } = props;
                  if (payload.isKrisis) return <circle key={`dot-${payload.bulan}`} cx={cx} cy={cy} r={6} fill="#EF4444" stroke="#FFF" strokeWidth={2} />;
                  if (payload.isBencana) return <circle key={`dot-${payload.bulan}`} cx={cx} cy={cy} r={5} fill="#F59E0B" stroke="#FFF" strokeWidth={2} />;
                  if (payload.isPositif) return <circle key={`dot-${payload.bulan}`} cx={cx} cy={cy} r={4} fill="#22C55E" stroke="#FFF" strokeWidth={1} />;
                  return <circle key={`dot-${payload.bulan}`} cx={cx} cy={cy} r={3} fill="#2563EB" stroke="#FFF" strokeWidth={1} />;
                }}
                activeDot={{ r: 6, fill: '#FFD700' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="flex flex-wrap justify-between mt-2 text-xs gap-1" style={{ color: '#D4A76A', fontFamily: "'Quicksand', sans-serif" }}>
          <span>📉 Min: {minKurs.toLocaleString('id-ID')}</span>
          <span>📈 Max: {maxKurs.toLocaleString('id-ID')}</span>
        </div>
        <div className="flex flex-wrap gap-3 mt-1 text-xs" style={{ color: '#D4A76A', fontFamily: "'Quicksand', sans-serif" }}>
          <span><span className="inline-block w-3 h-3 rounded-full bg-red-500 mr-1"></span>Krisis</span>
          <span><span className="inline-block w-3 h-3 rounded-full bg-amber-500 mr-1"></span>Bencana</span>
          <span><span className="inline-block w-3 h-3 rounded-full bg-green-500 mr-1"></span>Positif</span>
          <span><span className="inline-block w-3 h-3 rounded-full bg-blue-500 mr-1"></span>Normal</span>
        </div>
      </div>
    </div>
  );
}