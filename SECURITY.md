# SURAKSHA (Rakshak) — Security Architecture & Guidelines

## Key Principles
1. **Row Level Security (RLS)**: Enforced on all PostgreSQL tables. Access permissions are granted based on verified claims.
2. **Zero API Key Leakage**: Service role keys, Gemini API keys, and Weather API keys are never included in frontend source code or client bundles.
3. **Audit Logging**: Operational events (SOS signals, team dispatches, status updates) are recorded in `audit_logs` for transparency and accountability.
4. **Input Validation**: All client inputs are validated before database insertion.
