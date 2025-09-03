# EVAI — MVP (Web)

Simple web MVP showing:
- Conversational UI
- Lightweight memory (file-based demo)
- Emotion-aware tone (prompting)
- One-node server (serves frontend + chat API)

## Quickstart

1) **Download** this folder (or the ZIP) and open a terminal inside it.

2) Copy `.env.example` to `.env` and set your OpenAI key:
```
OPENAI_API_KEY=sk-...yourkey...
PORT=3000
```

3) Install and run:
```
npm install
npm start
```

4) Visit: http://localhost:3000

## Notes
- Memory is stored in `memory.json` (for demo). In production, swap to MongoDB or Firebase.
- The server keeps only the last ~8 messages to control token cost.
- The assistant auto-learns a user's name if they say "my name is X" or "me llamo X".


---

## Deploy to Render (recommended)
1) Create a new **Web Service** from this repo/folder.
2) Set **Runtime** to Node, **Build Command**: `npm install`, **Start Command**: `npm start`.
3) Add env var **OPENAI_API_KEY** with your key.
4) (Optional) Set **PORT** to `10000` (Render injects it automatically).
5) Health check path: `/api/health`.
6) Deploy.

Or use `render.yaml` for one‑click blueprint deploys.

## Deploy to Vercel
1) Create new project → Import this folder.
2) Add env var **OPENAI_API_KEY**.
3) Keep defaults; Vercel will use `vercel.json` to run `server.js` as a serverless function.
4) Deploy and open your URL.
