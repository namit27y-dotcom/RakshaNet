# SURAKSHA (RakshaNet) — AI Integration Architecture

## Overview
SURAKSHA integrates Gemini 1.5 Flash as an intelligent decision-support system for disaster management commanders and emergency teams.

## Key Capabilities
1. **Real-Time Priority Assessment**: Automatically calculates a priority score (0-100) and severity level for incoming SOS signals based on category, affected citizens, weather severity, and hazard vulnerability.
2. **Rescue Team Recommendation**: Recommends appropriate rescue force units (e.g. NDRF Motorboat, SDRF Mountain Unit).
3. **Operational Situation Briefs**: Compiles active incidents, shelter occupancy, and weather advisories into concise operational briefs for district officers.

## Safety & Governance
- **Human-in-the-Loop**: Gemini serves strictly as a decision-support system. Final dispatch authority rests with human administrators.
- **Zero Key Exposure**: Gemini API keys are stored in Supabase Secrets and invoked exclusively via serverless Edge Functions.
