# SURAKSHA (RakshaNet) — Production Backend & Architecture Documentation

SURAKSHA (Project Codename) is an AI-assisted Disaster Management and Emergency Response Platform designed for Smart India Hackathon.

## Architecture

```
Frontend (React 18 + Vite 6 + TypeScript + Google Maps API)
  │
  ├──► Supabase Client (@supabase/supabase-js)
  │       │
  │       ├──► Supabase Auth (Role-Based Access Control: CITIZEN, RESPONDER, COORDINATOR, ADMIN)
  │       ├──► Supabase PostgreSQL (16 Tables + Indexes + Triggers + Row Level Security)
  │       └──► Supabase Realtime (WebSocket channels for instant SOS & Live Feed sync)
  │
  └──► Supabase Edge Functions / Backend Proxy Services
          │
          ├──► /functions/weather (Google Weather API Integration & 15-min DB Caching)
          ├──► /functions/ai-analyze (Gemini 1.5 Flash Incident & Priority Score Calculation)
          └──► /functions/generate-brief (Gemini 1.5 Flash Command Center Briefing)
```

## Database Schema (16 Tables)

1. `profiles`: User accounts, contact details, agency name, roles (`citizen`, `responder`, `coordinator`, `admin`).
2. `emergency_reports`: Core emergency incidents with location, severity, status, and affected counts.
3. `sos_signals` / `sos_requests`: Citizen real-time emergency signals with GPS coordinates.
4. `safe_checkins`: Citizen "I'm Safe" status check-ins and location tags.
5. `rescue_dispatches`: Dispatch assignments linking responders to emergencies with ETA and status tracking.
6. `response_teams`: Rescue force units, status (`AVAILABLE`, `DEPLOYED`, `BUSY`, `OFFLINE`), location coordinates.
7. `shelters`: Relief shelters with dynamic available capacity calculation (`capacity - occupied`) and facilities.
8. `damage_reports`: Structural infrastructure damage audits.
9. `resources`: Relief supply & demand listings (`HAVE` / `NEED`).
10. `weather_data` / `weather_observations`: Weather observations cached with 15-minute TTL.
11. `disaster_alerts`: Official disaster warnings and notices (IMD / SDMA / System Risk Engine).
12. `earthquake_events`: Normalized USGS seismic data deduplicated by `external_id`.
13. `risk_assessments` / `risk_profiles`: District risk profiles and rule-based risk score calculations (0-100).
14. `notifications`: User alert notifications.
15. `activity_logs` / `audit_logs`: Accountability tracking log for all operational actions.

## Security & Row Level Security (RLS)
- RLS enabled on all 16 tables.
- **Citizens**: Create & read their own SOS signals, safe status, public alerts, and shelters.
- **Responders**: View assigned emergencies, update dispatch status and team location.
- **Coordinators / Admins**: Full operational access to dispatch teams, manage shelters, create alerts, and generate AI situation briefs.

## Environment Variables (`.env`)
```env
VITE_SUPABASE_URL=https://ghvsrynwjvchnuqkkzzo.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1...
VITE_GOOGLE_MAPS_API_KEY=AIzaSyBbS8AIl...
VITE_DEMO_MODE=true
```

## Demo Mode (`VITE_DEMO_MODE=true`)
When Demo Mode is active, simulated emergency SOS signals and incoming ground streams can be toggled using the "Enable Demo Signal" button in the navigation header.

## Deployment & Build Commands
- `npm run dev`: Start local development server (`http://localhost:5173`)
- `npm run build`: Type-check and create production Vite bundle (`dist/`)
