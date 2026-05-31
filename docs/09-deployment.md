# 09 — Deployment (Google Cloud Run + Proxy Gemini)

> **Tujuan file:** infra & rilis. Tidak menyentuh logika game.
>
> **Bergantung pada:** `06-ai-integrasi.md` (proxy melayani panggilan LLM),
> `07-frontend-react.md` (folder `dist` yang di-serve).
> **Dipakai oleh:** —
> **JANGAN:** menyimpan state game di server (game stateless — save di
> localStorage, `07 §save`); commit API key ke repo.

---

## Arsitektur: satu container

Server Node/Express tipis yang (1) serve hasil `vite build` (`dist`), dan
(2) punya route `POST /api/llm` yang memanggil Gemini pakai key dari
`process.env`. Satu service, origin sama → **tanpa masalah CORS**.

```
[ React (dist) ] ──/api/llm──► [ Express di Cloud Run ] ──► [ Gemini API ]
                                (GEMINI_API_KEY di ENV)
```

> Full Google stack (Gemini + Cloud Run) selaras lomba & enak diceritakan ke juri.

---

## Hal teknis yang sering bikin deploy gagal

- **PORT:** Cloud Run memberi port via env `PORT` (umumnya 8080). WAJIB
  `app.listen(process.env.PORT || 8080)`, bukan port hardcoded.
- **API key:** set `GEMINI_API_KEY` sebagai env var (atau Secret Manager).
  **Jangan pernah commit key ke repo.** (Pola proxy di `06`/`07`.)
- **Model name:** simpan nama model di `GEMINI_MODEL` env, verifikasi terkini di
  `ai.google.dev/gemini-api/docs/models` sebelum final.
- **Stateless:** instance bisa mati saat idle. Aman karena save di localStorage
  browser (`07 §save`). Leaderboard/save lintas-perangkat nanti → Firestore,
  bukan menyimpan di server.
- **Cold start:** instance "tidur" saat sepi → request pertama lambat. Untuk
  demo, set **`min-instances=1`** agar juri tak kena jeda dingin.

---

## Dockerfile

```dockerfile
FROM node:20-slim
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build          # vite build -> /app/dist
ENV NODE_ENV=production
CMD ["node", "server.js"]  # Express serve dist + /api/llm; listen process.env.PORT
```

## Deploy

```bash
gcloud run deploy tukar-tani \
  --source . \
  --region asia-southeast2 \
  --allow-unauthenticated \
  --min-instances 1 \
  --set-env-vars GEMINI_API_KEY=YOUR_KEY,GEMINI_MODEL=NAMA_MODEL_TERVERIFIKASI
# lebih aman: pakai --set-secrets untuk key
```
> `asia-southeast2` = Jakarta, latensi terendah untuk pemain Indonesia.
