/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import fs from 'fs';
import { GoogleGenAI } from '@google/genai';
import type { NewsFeedItem, DigestConfig, DigestHistory, CategoryType } from './src/types.ts';

dotenv.config();

// Standard ESM path resolution for native ES Modules
const _filename = fileURLToPath(import.meta.url);
const _dirname = path.dirname(_filename);

const app = express();
app.use(express.json());

// Global trace log middleware for diagnostics
app.use((req, res, next) => {
  console.log(`[HTTP TRACE] ${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

const PORT = parseInt(process.env.PORT || '3000', 10);

// Lazy initialize Gemini API Client
let aiClient: GoogleGenAI | null = null;
function getAiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not defined.');
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  }
  return aiClient;
}

// Resilient wrapper around generateContent with automated backoff retries and model fallback
async function generateContentWithFallback(ai: any, params: { contents: any; config?: any }) {
  const models = ['gemini-3.5-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];
  const maxRetriesPerModel = 3;
  const initialDelayMs = 1500;
  let lastError: any = null;

  for (const model of models) {
    for (let attempt = 1; attempt <= maxRetriesPerModel; attempt++) {
      try {
        console.log(`[Gemini Resilience] Trying model "${model}" - Attempt ${attempt}/${maxRetriesPerModel}...`);
        const response = await ai.models.generateContent({
          ...params,
          model,
        });
        console.log(`[Gemini Resilience] Success with model: "${model}"`);
        return response;
      } catch (err: any) {
        lastError = err;
        const msg = err?.message || String(err);
        const status = err?.status;
        console.error(`[Gemini Resilience] Model "${model}" attempt ${attempt} failed: ${msg} (Status: ${status})`);

        // Check if the error is temporary (503 UNAVAILABLE, 429 too many requests/quota, rate limit, high demand etc.)
        const isTemporary = status === 503 || status === 429 || status === 500 ||
                            msg.includes('503') || msg.includes('429') ||
                            msg.includes('high demand') || msg.includes('temporary') || 
                            msg.includes('UNAVAILABLE') || msg.includes('ResourceExhausted') ||
                            msg.includes('quota') || msg.includes('limiting');

        if (isTemporary && attempt < maxRetriesPerModel) {
          const delay = initialDelayMs * Math.pow(2, attempt - 1);
          console.warn(`[Gemini Resilience] Backing off for ${delay}ms before retry...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
        } else {
          // If not temporary or we exhausted retries on this model, break and try the next model fallback
          break;
        }
      }
    }
    console.warn(`[Gemini Resilience] Model "${model}" failed completely or hit non-temporary error. Falling back to the next candidate model...`);
  }

  throw lastError || new Error('All candidate Gemini models failed to generate content');
}

// Memory State
let config: DigestConfig = {
  keywords: ['agentic delivery', 'AI workforce', 'SaaS modernization', 'human-agent hybrid pods'],
  frequency: 'twice-weekly',
  recipientEmail: 'nhanquy@gmail.com',
  sources: ['McKinsey Digital', 'Gartner', 'TechCrunch', 'MIT Tech Review', 'VentureBeat', 'Wired Enterprise', 'InfoQ', 'Medium (Tech)', 'The Register', 'IEEE Spectrum']
};

let newsItems: NewsFeedItem[] = [
  {
    id: 'news-1',
    title: 'Transitioning to Agentic Software Delivery: A Strategic Blueprint for CIOs',
    source: 'McKinsey Digital',
    url: 'https://www.mckinsey.com/capabilities/mckinsey-digital/our-insights/agentic-delivery-blueprint',
    publishedAt: '2026-06-15',
    summary: 'CIOs are transitioning their traditional software delivery to autonomous agent teams. Early data shows 45% increase in product feature velocity and 70% decrease in manual deployment check times.',
    category: 'agentic-delivery',
    content: 'Agentic delivery is more than code generation. It covers automated requirements reasoning, multi-agent validation, and self-healing deployments. Transforming the workforce requires transitioning human engineers to role-based agent orchestra managers.',
    impactScore: 9
  },
  {
    id: 'news-2',
    title: 'Workforce Restructuring: Building Hybrid Human-AI Pods for Agile SaaS Maintenance',
    source: 'Gartner',
    url: 'https://www.gartner.com/en/information-technology/insights/adopting-agentic-workforces',
    publishedAt: '2026-06-16',
    summary: 'A prescriptive team design topology model for tech companies. Demonstrates how to design team pods consisting of 2 humans paired with 3 specialized agents executing structured developer roles.',
    category: 'workforce-adoption',
    content: 'Integrating autonomous agents into professional IT teams is not a friction-free event. Organizations succeed when they assign developers to oversee agent pipelines rather than competing with them. Structured human-in-the-loop validation scales trust.',
    impactScore: 8
  },
  {
    id: 'news-3',
    title: 'Modernizing Digital Products with Autonomous Maintenance pools',
    source: 'VentureBeat',
    url: 'https://venturebeat.com/ai/modernizing-traditional-saas-with-agents',
    publishedAt: '2026-06-14',
    summary: 'Traditional enterprise sectors are using code-fluent agent pools to upgrade deprecated API versions, refactor monolith structures, and self-patch security flaws across legacy standard codebases.',
    category: 'saas-digital-products',
    content: 'Software upkeep consumes roughly 60% of modern IT development budgets. Introducing automated maintenance processes allows organizations to completely offload bug backlogs, giving core innovators space to develop net-new features.',
    impactScore: 7
  },
  {
    id: 'news-4',
    title: 'The Blueprint for LLM Agency Integration: An HR Perspective on Workforce Transition',
    source: 'MIT Tech Review',
    url: 'https://www.technologyreview.com/2026/06/agent-training-workforce',
    publishedAt: '2026-06-17',
    summary: 'An empirical study of IT staff reskilling programs. Organizations implementing systematic sandbox learning spaces achieve 3.2x faster adoption rates and report 90% positive employee adaptation.',
    category: 'workforce-adoption',
    content: 'The major pivot for traditional developers who move to agentic workforces is transition anxiety. Organizations must establish reward programs for effective prompt-engineering and agent-coaching, retooling the workforce into prompt orchestrators.',
    impactScore: 8
  },
  {
    id: 'news-5',
    title: 'Agentic CI/CD: The Death of Manual QA Queues and Interactive Hotfixes',
    source: 'TechCrunch',
    url: 'https://techcrunch.com/2026/06/agentic-cicd-zero-tickets',
    publishedAt: '2026-06-13',
    summary: 'Top tech organizations demonstrate zero-ticket CD systems where agents continuously test, validate package files, deploy to canary environments, and resolve regressions dynamically in 5 minutes.',
    category: 'agentic-delivery',
    content: 'Under older pipeline designs, bugs lead to manual tickets and slow context-switching. Modern agent environments monitor deployment health logs, write code path repairs, and push directly back to main branches with zero downtime.',
    impactScore: 9
  },
  {
    id: 'news-6',
    title: 'Strategic Guardrails: The New Metrics for Modern Digital Product Managers',
    source: 'Wired Enterprise',
    url: 'https://wired.com/enterprise/managing-digital-products-using-agents',
    publishedAt: '2026-06-12',
    summary: 'The shift in product management practices. Standard productivity metrics are replaced by prompt guardrail coverage, cost efficiency controls, and multi-model semantic validation.',
    category: 'saas-digital-products',
    content: 'Digital product managers in the agentic era do not write human stories. They specify constraints, declare objective parameters, audit telemetry logs, and analyze semantic alignment scores across decentralized agent swarms.',
    impactScore: 8
  }
];

let histories: DigestHistory[] = [
  {
    id: 'hist-1',
    sentAt: '2026-06-14T09:00:00Z',
    itemIds: ['news-3', 'news-5'],
    subject: 'AI Technology Digest: Modernizing legacy SaaS & Tech trends',
    aiSummaryText: 'An executive update outlining deep technical trends. Main highlights include using agentic maintenance pools to restructure traditional enterprise software, and adopting CI/CD systems that completely eliminate manual testing queues. Highly recommended operational transitions.',
    recipient: 'nhanquy@gmail.com',
    status: 'delivered'
  },
  {
    id: 'hist-2',
    sentAt: '2026-06-17T14:30:00Z',
    itemIds: ['news-1', 'news-2', 'news-4'],
    subject: 'Weekly Agentic Delivery & Workforce Planning Digest',
    aiSummaryText: 'Strategic roadmap for transition to agentic workflows. Emphasizes building cross-functional hybrid pods, establishing safe organizational guardrails, and managing workforce transformation anxieties via structured training platforms.',
    recipient: 'nhanquy@gmail.com',
    status: 'delivered'
  }
];

// Helper to format RFC822 compliant content
function makeRawEmail(to: string, subject: string, bodyHtml: string) {
  const base64Subject = Buffer.from(subject).toString('base64');
  const emailLines = [
    `To: ${to}`,
    `Subject: =?utf-8?B?${base64Subject}?=`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=utf-8',
    'Content-Transfer-Encoding: 7bit',
    '',
    bodyHtml
  ];
  return Buffer.from(emailLines.join('\r\n'))
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

// Endpoints

// GET App Configurations
app.get('/api/status', (req, res) => {
  const distPath = _dirname.includes('dist') ? _dirname : path.join(process.cwd(), 'dist');
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development',
    dirname: _dirname,
    filename: _filename,
    distPath,
    indexHtmlExists: fs.existsSync(path.join(distPath, 'index.html')),
    geminiApiKeyPresent: !!process.env.GEMINI_API_KEY
  });
});

// GET App Configurations
app.get('/api/config', (req, res) => {
  res.json(config);
});

// POST App Configurations
app.post('/api/config', (req, res) => {
  const { keywords, frequency, recipientEmail, sources } = req.body;
  if (Array.isArray(keywords)) config.keywords = keywords;
  if (frequency) config.frequency = frequency;
  if (recipientEmail) config.recipientEmail = recipientEmail;
  if (Array.isArray(sources)) config.sources = sources;
  res.json({ success: true, config });
});

// GET list of news articles
app.get('/api/news', (req, res) => {
  res.json(newsItems);
});

// POST Simulate Keyword Aggregation (adds new articles matching user's keywords using Gemini)
app.post('/api/news/sync', async (req, res) => {
  try {
    const ai = getAiClient();
    const queryKeywords = config.keywords.join(', ');
    const prompt = `Generate 2 realistic, highly detailed tech news/reports as current JSON items. 
    They must be focused on how professional IT and traditional companies can integrate the following keywords: ${queryKeywords}.
    Focus on agentic delivery, team topologies, step-by-step workforce adoption, or SaaS product management.
    The response must be a strict JSON array of 2 objects matching this TypeScript schema:
    interface NewsFeedItem {
      id: string; // generate random unique id e.g. "news-gen-123"
      title: string; // Compelling realistic technical headline
      source: string; // Pick an enterprise source e.g., "McKinsey Digital", "Gartner", "TechCrunch", "MIT Tech Review", "InfoQ", "Medium (Tech)", "The Register", "IEEE Spectrum"
      url: string; // Realistic fake url matching source
      publishedAt: string; // Format YYYY-MM-DD, e.g., today is 2026-06-18
      summary: string; // 2-3 sentence strategic executive outcome
      category: 'agentic-delivery' | 'saas-digital-products' | 'workforce-adoption' | 'general-ai';
      content: string; // Full in-depth paragraph outlining step-by-step practical integration instructions or team models
      impactScore: number; // 7 to 10
    }
    Output ONLY valid, raw, parseable JSON. No markdown codeblock wrapper, no surrounding comments.`;

    const response = await generateContentWithFallback(ai, {
      contents: prompt,
    });

    let generatedText = response.text || '';
    // Clean potential markdown output
    generatedText = generatedText.replace(/```json/gi, '').replace(/```/g, '').trim();

    const items = JSON.parse(generatedText);
    if (Array.isArray(items)) {
      items.forEach(it => {
        // assign unique id if missing
        if (!it.id) it.id = `news-gen-${Math.random().toString(36).substr(2, 9)}`;
        if (!it.publishedAt) it.publishedAt = '2026-06-18';
        newsItems.unshift(it);
      });
      return res.json({ success: true, addedCount: items.length, items });
    } else {
      throw new Error('Response is not a valid JSON array');
    }
  } catch (err: any) {
    console.error('Failed to sync/generate news via Gemini:', err);
    // Dynamic simulation fallback if API key is missing or error occurs
    const randomSuffix = Math.random().toString(36).substr(2, 5);
    const mockItems: NewsFeedItem[] = [
      {
        id: `news-sim-${randomSuffix}-1`,
        title: `Strategic Workforce Adoption of Agentic Teams for Keywords: [${config.keywords[0] || 'Agents'}]`,
        source: 'MIT Tech Review',
        url: 'https://technologyreview.com/articles/workforce-adoption-guide',
        publishedAt: '2026-06-18',
        summary: 'To unlock full potential of agentic software pipelines, corporate leaders must map technical dependencies and align engineering goals systematically.',
        category: 'workforce-adoption',
        content: 'Step 1: Conduct process capability mapping. Step 2: Establish dedicated developer-agent testing sandboxes. Step 3: Upraise employee responsibility targets as coaches rather than manual executors. This unlocks up to 3x productivity boost without employee alienation.',
        impactScore: 8
      },
      {
        id: `news-sim-${randomSuffix}-2`,
        title: `Unlocking Agentic Delivery Channels in traditional Enterprise SaaS Platforms`,
        source: 'Gartner',
        url: 'https://gartner.com/digital-products/enterprise-modernization',
        publishedAt: '2026-06-18',
        summary: 'Organizations are moving away from manual maintenance templates towards active AI coordinator units to handle deployment monitoring loops.',
        category: 'agentic-delivery',
        content: 'Applying prompt-controlled agents in server environments can autonomously solve over 50% of transient runtime pipeline errors. DevOps teams achieve unprecedented scalability by shifting from triage alerts to automated correction reviews.',
        impactScore: 9
      }
    ];
    newsItems.unshift(...mockItems);
    res.json({ success: true, addedCount: mockItems.length, items: mockItems, note: 'Simulated fallback items created' });
  }
});

// POST Generate Newsletter Summary with Gemini
app.post('/api/generate-summary', async (req, res) => {
  const { selectedItemIds } = req.body;
  if (!Array.isArray(selectedItemIds) || selectedItemIds.length === 0) {
    return res.status(400).json({ error: 'Please select at least one article to summarize.' });
  }

  const itemsToSummarize = newsItems.filter(it => selectedItemIds.includes(it.id));
  if (itemsToSummarize.length === 0) {
    return res.status(404).json({ error: 'No matching articles found.' });
  }

  try {
    const ai = getAiClient();
    const articlesText = itemsToSummarize.map((it, i) => `[Article #${i+1}]
SOURCE: ${it.source}
TITLE: ${it.title}
SUMMARY: ${it.summary}
DETAIL: ${it.content}
CATEGORY: ${it.category}`).join('\n\n');

    const prompt = `You are a world-class IT Advisory Architect. 
    Analyze the following recent news and insights on "Agentic Delivery", "Workforce Adoption Models", and "SaaS Product Management":
    
    ${articlesText}
    
    Create a highly structured executive briefing with practical, step-by-step organizational blueprints.
    Include the following in your brief:
    1. EXECUTIVES EXECUTIVE SUMMARY: A powerful introductory synthesis of what these changes mean.
    2. STRATEGIC IMPLICATIONS: Actionable points for SaaS and traditional companies.
    3. COMPREHENSIVE ROADMAP (STEP-BY-STEP ADOPTION PLAN): 4 clear, sequenced milestones to safely train teams, scale agent collaboration pods, and minimize employee resistance.
    4. TOP trusted articles overview.
    
    Keep the tone objective, clean, and highly authoritative. Add no fluff. Use direct html-eligible styling or clean plain-text Markdown structure. Only return the final markdown content.`;

    const response = await generateContentWithFallback(ai, {
      contents: prompt,
    });

    const report = response.text || '';
    return res.json({ report });
  } catch (err: any) {
    console.error('Failed to generate summary report:', err);
    // Intelligent local fallback if API key not available
    const brief = `### 📋 Executive Advisory Briefing: Agentic Delivery Workforce Transition

**1. Executive Summary**
The current paradigm shift is transitioning development pipelines from manual creation to **Agentic Delivery**. Professional IT companies and SaaS architects must stop treating agents as basic autocomplete tools, instead scaling them to active, semi-autonomous coordinator units.

**2. Key Industry Implications**
*   **Operational Velocity**: Shifting maintenance tasks to AI-agent pools yields up to a 60% reduction in bug backlog times.
*   **Employee Alignment**: Reclassifying staff as "Agent Coaches" or "Prompt Architects" solves retention anxieties and scales upskilling.

**3. Step-by-Step Transition Roadmap**
1.  **Stage 1: Process Mapping**: Isolate repetitive upkeep tasks, api upgrades, and routine QA queues.
2.  **Stage 2: Pilot Pods**: Establish cross-functional pods where 2 developers manage 3 agent worker roles.
3.  **Stage 3: Trust Checking**: Implement strict human-in-the-loop review portals at critical branch deployments.
4.  **Stage 4: Continuous Coaching**: Reward and pay developers on Prompt Optimization and Agent Telemetry metrics.`;

    return res.json({ report: brief, note: 'Simulated executive brief fallback' });
  }
});

// POST Send Gmail Digest (via Google REST Gmail API)
app.post('/api/send-email', async (req, res) => {
  const { accessToken, recipient, subject, newsletterHtml, itemIds } = req.body;
  
  const finalRecipient = recipient || config.recipientEmail;
  const finalSubject = subject || 'AI Agentic Delivery Insights Dashboard Digest';

  if (!accessToken) {
    return res.status(401).json({ error: 'OAuth Gmail Access Token is missing. Please sign in.' });
  }

  const isSimulatedToken = accessToken.includes('simulated') || accessToken === 'simulated_authorized_key';

  if (isSimulatedToken) {
    const simHist: DigestHistory = {
      id: `hist-sim-${Date.now()}`,
      sentAt: new Date().toISOString(),
      itemIds: itemIds || [],
      subject: finalSubject,
      aiSummaryText: `[Sandbox Mode] Successfully processed and simulated dispatch of executive advisory newsletter to ${finalRecipient}. Layout preview verified.`,
      recipient: finalRecipient,
      status: 'delivered'
    };
    histories.unshift(simHist);
    return res.json({ success: true, isSimulated: true, messageId: `sim-${Date.now()}`, history: simHist });
  }

  try {
    console.log(`[Gmail Direct Send] Attempting actual Gmail API dispatch to: ${finalRecipient} with token prefix: ${accessToken.substring(0, 10)}...`);
    const rfcEmail = makeRawEmail(finalRecipient, finalSubject, newsletterHtml);
    const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ raw: rfcEmail }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(`[Gmail Direct Send] Gmail API returned error ${response.status}: ${errText}`);
      
      // If it looks like a real token, do NOT do a silent simulation fallback
      if (response.status === 401 || response.status === 403) {
        throw new Error(`Gmail authorization failed (status ${response.status}). The provided Google Access Token is invalid or has expired. Please copy a new one from Google OAuth Playground.`);
      }
      
      throw new Error(`Gmail Send Request failed: ${errText}`);
    }

    const data = await response.json();
    console.log('[Gmail Direct Send] Successfully sent email! Message ID:', data.id);
    
    // Save to history
    const newHist: DigestHistory = {
      id: `hist-${Date.now()}`,
      sentAt: new Date().toISOString(),
      itemIds: itemIds || [],
      subject: finalSubject,
      aiSummaryText: 'Gmail notification successfully processed and dispatched directly to ' + finalRecipient,
      recipient: finalRecipient,
      status: 'delivered'
    };
    histories.unshift(newHist);

    res.json({ success: true, messageId: data.id, history: newHist });
  } catch (err: any) {
    console.error('Failed to dispatch email:', err);
    // Save failed attempt to history
    const failedHist: DigestHistory = {
      id: `hist-${Date.now()}`,
      sentAt: new Date().toISOString(),
      itemIds: itemIds || [],
      subject: finalSubject,
      aiSummaryText: `Failed to dispatch: ${err.message}`,
      recipient: finalRecipient,
      status: 'failed'
    };
    histories.unshift(failedHist);
    res.status(500).json({ error: err.message, history: failedHist });
  }
});

// GET History
app.get('/api/history', (req, res) => {
  res.json(histories);
});

// Vite Middleware for Asset Handling and routing matches

const startServer = async () => {
  const isProduction = process.env.NODE_ENV === 'production';
  const distPath = path.join(_dirname, 'dist');

  console.log(`[Resilient Boot] resolved distPath: ${distPath} (index.html exists: ${fs.existsSync(path.join(distPath, 'index.html'))}), isProduction: ${isProduction}`);

  if (!isProduction) {
    console.log('Starting server in development mode with local Vite dev middleware...');
    try {
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
    } catch (err) {
      console.error('Failed to load Vite dev server. Attempting production fallback:', err);
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }
  } else {
    console.log(`Starting server in production mode. Serving static assets directly from: ${distPath}`);
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      const targetIndex = path.join(distPath, 'index.html');
      if (fs.existsSync(targetIndex)) {
        res.sendFile(targetIndex);
      } else {
        console.error(`[Critical Error] index.html not found at: ${targetIndex}`);
        res.status(404).send(`<h3>Production Client Assets Not Found</h3><p>Server is online, but required index.html was not found under: <code>${targetIndex}</code>.</p>`);
      }
    });
  }

  if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`AI News digest server actively listening on http://localhost:${PORT}`);
    });
  }
};

startServer();

export default app;
