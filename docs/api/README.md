# API Overview

LexiScan AI exposes a REST API for authentication, document management, AI analysis, billing, notifications, and webhooks.

- Base URLs:
  - Production: https://api.lexiscan.ai/v1
  - Staging: https://staging-api.lexiscan.ai/v1
  - Local: http://localhost:3001/api

## Authentication
Use JWT bearer tokens. See `docs/api/authentication.md`.

## Rate Limiting
Plans and limits are documented in `docs/api/rate-limiting.md`.

## Webhooks
See `docs/api/webhooks.md` for subscription and signature verification.

## OpenAPI
- YAML spec: `docs/api/openapi.yaml`
- UI (local dev): http://localhost:3001/api/docs

## SDKs/Clients
Generated clients live under `packages/clients`.
