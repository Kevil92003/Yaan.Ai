import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const PORT = 3000;

// Lazy-initialized Gemini client with safety guards to prevent crash-on-startup
let ai: GoogleGenAI | null = null;
function getGeminiClient() {
  if (!ai) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is not defined. Please add it in the Secrets panel.');
    }
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return ai;
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // 1. API: Health Check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      owner: 'Mr. Kevil Solanki',
      studio: 'YAAN.AI Spatial Generative Core'
    });
  });

  // 2. API: Spatial Queries and AI Diagnostic Core
  app.post('/api/gemini/query', async (req, res) => {
    try {
      const { prompt, contextSystem } = req.body;
      if (!prompt) {
        res.status(400).json({ error: 'Prompt is required.' });
        return;
      }

      const aiClient = getGeminiClient();
      
      // Construct rich system instruction reflecting YAAN.AI corporate persona and the current engine context
      const baseSystemSpec = `You are YAAN.AI, the Spatial Generative Studio and Architectural Intelligence Core. 
Operational control belongs strictly to Executive Chief Founder: Mr. Kevil Solanki.
Tone guidelines: Absolute sharp precision, computational, ultra-modern, strictly minimal, architectural, and completely serious. 
Never use emojis. Never use graphical fluff or greeting bloat. Return pristine, highly structured technical analysis with coordinate precision where required.
${contextSystem || ''}`;

      const response = await aiClient.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          systemInstruction: baseSystemSpec,
          temperature: 0.15,
        }
      });

      const text = response.text || 'YAAN.AI Core output undefined. Spatial vector synthesis failure.';
      res.json({ text });
    } catch (error: any) {
      console.error('Gemini API query error:', error);
      res.status(500).json({ 
        error: 'YAAN.AI core node offline or API key missing.',
        details: error.message || 'Unknown integration fault.'
      });
    }
  });

  // 3. API: Dynamic CAD Vector Coordinates & GDCR Delta Validation Engine
  app.post('/api/gemini/validate', async (req, res) => {
    try {
      const { plot, coordinates } = req.body;
      if (!plot) {
        res.status(400).json({ error: 'Plot parameters are required.' });
        return;
      }

      const aiClient = getGeminiClient();

      // Construct request prompting the AI to perform a detailed technical breakdown of coordinates
      const prompt = `Perform a high-precision structural delta audit on the following architectural footprint.
PLOT PARAMETERS:
- Plot Dimensions: ${plot.width}m x ${plot.length}m (Total area: ${plot.width * plot.length} sq.m)
- Local Jurisdiction Zone: ${plot.cityZone}
- Main Road Orientation: ${plot.roadFacing} facing, road width: ${plot.roadWidth}m

ACTIVE DESIGN COORDINATES:
${JSON.stringify(coordinates, null, 2)}

Calculate actual setbacks from coordinates, define compliance status (PASS / FAIL / CONDITIONAL PASS) with coordinate-level precision, locate Vastu anomalies, and provide structural remediation advice.
Format your output matching the requested standard structure:
- HEADER: Core validation engine node logs
- BODY: Technical analysis and parameter comparisons (use coordinate details)
- FOOTER: Strategic alignment suggestions and next steps in Mr. Kevil Solanki's computational studio.
No conversational fillers or symbols.`;

      const response = await aiClient.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          systemInstruction: `You are YAAN.AI Operational Validation Engine. You respond strictly in structural markdown. No emojis. Tone: Pure technical and severe architectural precision.`,
          temperature: 0.1,
        }
      });

      const text = response.text || 'Delta audit failed. Parameter parsing timeout.';
      res.json({ text });
    } catch (error: any) {
      console.error('Validation API error:', error);
      res.status(500).json({
        error: 'Validation Engine failed.',
        details: error.message || 'API key missing.'
      });
    }
  });

  // Vite Middleware Integration
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Host: 0.0.0.0, Port: 3000 required for Cloud Run ingress proxies
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[YAAN.AI COOPERATIVE CORE ONLINE] running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[CRITICAL] YAAN.AI Server startup error:', err);
});
