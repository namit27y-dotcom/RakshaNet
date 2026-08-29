# SURAKSHA (Rakshak) — Backend Architecture & Integration Guide

SURAKSHA uses a cloud-native, serverless Supabase backend powering real-time disaster management, incident response, and AI situation briefing.

## Architecture

```
React Frontend (Vite + TS)
  │
  ├──► Supabase Client (@supabase/supabase-js)
  │       │
  │       ├──► Supabase Auth (RBAC: ADMIN, RESPONDER, CITIZEN)
  │       ├──► Supabase PostgreSQL (16 Relational Tables + Indexes + RLS)
  │       └──► Supabase Realtime (WebSocket channels for instant map/feed sync)
  │
  └──► Supabase Edge Functions
          │
          ├──► /functions/weather (OpenWeatherMap API Proxy)
          ├──► /functions/ai-analyze (Gemini 1.5 Flash Incident Assessment)
          └──► /functions/generate-brief (Gemini 1.5 Flash Operational Briefing)
```

## Environment Setup
Create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL=https://ghvsrynwjvchnuqkkzzo.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1...
VITE_GOOGLE_MAPS_API_KEY=AIzaSyBbS8AIl...
```

## Deployment & Verification
- **Build**: `npm run build`
- **Dev**: `npm run dev`
