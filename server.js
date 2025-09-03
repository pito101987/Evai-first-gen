// server.js
const express = require("express");
const path = require("path");
const fs = require("fs");
const dotenv = require("dotenv");
const { OpenAI } = require("openai");

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// --- Simple file-based memory (for demo purposes) ---
const MEMORY_PATH = path.join(__dirname, "memory.json");
function readMemory() {
  try {
    const raw = fs.readFileSync(MEMORY_PATH, "utf8");
    return JSON.parse(raw);
  } catch (e) {
    return {};
  }
}
function writeMemory(db) {
  fs.writeFileSync(MEMORY_PATH, JSON.stringify(db, null, 2));
}

// Initialize memory file if not exists
if (!fs.existsSync(MEMORY_PATH)) writeMemory({});

// OpenAI client
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Helper: create system prompt with lightweight "emotional intelligence"
function systemPrompt(name = "Friend") {
  return `You are EVAI, an emotionally intelligent AI assistant.
- Always be warm, concise, and supportive.
- Detect the user's sentiment from their message (positive/neutral/negative) and subtly adapt your tone.
- Keep responses under 120 words unless asked for detail.
- You remember simple profile facts provided by the server (name, preferences).
- If the user shares goals, reflect them back with 1 concrete step.`;
}

// POST /api/chat  -> { userId, message }
app.post("/api/chat", async (req, res) => {
  try {
    const { userId = "demo", message = "" } = req.body || {};
    const mem = readMemory();
    const user = mem[userId] || { profile: {}, history: [] };

    // Append to history
    user.history = user.history || [];
    user.history.push({ role: "user", content: message });

    // Build messages with a compact "profile" context
    const profileSummary = Object.entries(user.profile || {})
      .map(([k, v]) => `${k}: ${v}`)
      .join(" | ");
    const messages = [
      { role: "system", content: systemPrompt() + (profileSummary ? `\n\nKnown profile: ${profileSummary}` : "") },
      // Keep only the last 8 messages to be cheap
      ...user.history.slice(-8)
    ];

    // Single completion call to generate empathetic reply
    const resp = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      temperature: 0.7,
      max_tokens: 220
    });

    const reply = resp.choices?.[0]?.message?.content?.trim() || "I'm here.";
    user.history.push({ role: "assistant", content: reply });

    // Naive "memory": if the user writes "my name is X" or "me llamo X", store it.
    const low = message.toLowerCase();
    const nameRegex = /(my name is|me llamo)\s+([a-záéíóúüñ\s'-]{2,25})/i;
    const m = message.match(nameRegex);
    if (m && m[2]) {
      user.profile = user.profile || {};
      user.profile.name = m[2].trim();
    }

    mem[userId] = user;
    writeMemory(mem);
    res.json({ ok: true, reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message || "Server error" });
  }
});

// Health
app.get("/api/health", (req, res) => res.json({ ok: true }));

// Fallback to index.html for simple SPA-like behavior
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`EVAI MVP server running on http://localhost:${PORT}`);
});
