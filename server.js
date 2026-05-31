/**
 * Express Server untuk Tukar Tani
 * - Serve static files dari dist/
 * - Proxy /api/llm ke Gemini API
 */

import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(express.json());

// Health check endpoint untuk Cloud Run
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Gemini API Proxy
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash';

app.post('/api/llm', async (req, res) => {
  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: 'GEMINI_API_KEY not configured' });
  }

  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'prompt is required' });
  }

  try {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

    const result = await model.generateContent(prompt);
    const response = result.response;

    // Return dalam format yang diharapkan oleh frontend
    res.json({
      candidates: [
        {
          content: {
            parts: [{ text: response.text() }],
          },
        },
      ],
    });
  } catch (error) {
    console.error('Gemini API error:', error.message);
    res.status(500).json({ error: 'Failed to generate content', details: error.message });
  }
});

// Serve static files dari dist/
app.use(express.static(join(__dirname, 'dist')));

// SPA fallback - semua route lain ke index.html
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Gemini Model: ${GEMINI_MODEL}`);
  if (!GEMINI_API_KEY) {
    console.warn('WARNING: GEMINI_API_KEY not set - /api/llm will fail');
  }
});
