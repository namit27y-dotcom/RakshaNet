# SURAKSHA (RakshaNet) — Edge Functions & API Reference

SURAKSHA exposes server-side endpoints via Supabase Edge Functions to ensure sensitive API keys (OpenWeather, Gemini AI) are never exposed to client browsers.

## 1. Weather Edge Function (`/functions/v1/weather`)
- **Method**: `POST`
- **Request Body**: `{ "latitude": number, "longitude": number, "locationName": string }`
- **Response**: `{ "temperature": number, "humidity": number, "rainfall": number, "wind_speed": number, "weather_condition": string }`

## 2. AI Incident Analysis (`/functions/v1/ai-analyze`)
- **Method**: `POST`
- **Request Body**: `{ "incident": object, "weather": object, "riskProfile": object, "peopleAffected": number }`
- **Response**: `{ "severity": string, "priority_score": number, "recommended_action": string, "recommended_team_type": string, "explanation": string }`

## 3. AI Situation Briefing (`/functions/v1/generate-brief`)
- **Method**: `POST`
- **Request Body**: `{ "activeIncidentsCount": number, "sosCount": number, "criticalCount": number, "shelterOccupancyPercent": number, "teamCount": number, "district": string }`
- **Response**: `{ "brief": string }`
