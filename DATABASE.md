# Rakshak — Database Schema & RLS Policy Reference


The database is built on Supabase PostgreSQL with 12 core operational tables:

## Relational Tables

1. `profiles`: User roles (`ADMIN`, `RESPONDER`, `CITIZEN`) & contact details.
2. `risk_profiles`: District vulnerability profiles, threat history, and risk scores.
3. `incidents`: Emergency incidents, priority scores (0-100), severity, and response team assignments.
4. `sos_requests`: Real-time emergency signals submitted by citizens.
5. `safe_checkins`: Citizen safe check-ins and location status.
6. `response_teams`: Rescue force units, status (`AVAILABLE`, `DEPLOYED`, `BUSY`, `OFFLINE`), coordinates.
7. `shelters`: Relief shelters, capacity, current occupancy, and medical/food availability.
8. `damage_reports`: Structural infrastructure damage assessments.
9. `resources`: Relief supply & demand listings (`HAVE` / `NEED`).
10. `alerts`: Official warnings and disaster notices.
11. `weather_observations`: Historical/live weather observations.
12. `audit_logs`: Accountability tracking log for operational actions.

## Row Level Security (RLS) Policies
- All tables have Row Level Security enabled.
- Anonymous/authenticated users can view public alerts, shelters, risk profiles, and submit emergency SOS signals.
- Operational updates (incident dispatch, team status) are constrained to authorized roles.
