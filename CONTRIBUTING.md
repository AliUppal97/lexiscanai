# Contributing to LexiScanAI

Thank you for your interest in contributing! We welcome improvements to security, performance, stability, UX, documentation, and developer experience.

## Code of Conduct
Participation in this project is governed by our CODE_OF_CONDUCT.md. By contributing, you agree to uphold these standards.

## Ground Rules
- Use Conventional Commits (e.g., `feat:`, `fix:`, `docs:`, `perf:`, `refactor:`)
- Keep secrets out of the repo (.env files, keys, tokens)
- Ensure code is secure, accessible, and performant
- Write small, focused changes; prefer early returns and clear naming
- Add tests for user-facing logic and critical paths

## Development Setup
```bash
# Install dependencies at repo root
npm install --legacy-peer-deps

# Start infrastructure (Docker Desktop must be running)
docker-compose up -d postgres redis

# Setup database
cd apps/api
npx prisma generate
npx prisma migrate deploy
cd ../..

# Start all services
npm run dev
```

## Monorepo Structure
- `apps/api`: NestJS API (Prisma + PostgreSQL, RLS/pgvector policies)
- `apps/web`: Next.js (marketing/app)
- `apps/dashboard`: React + Vite (admin)
- `services/*`: FastAPI services (AI worker, PDF generator)
- `packages/*`: Shared libraries (UI, types, clients)

## Making Changes
1. Create a feature branch from `develop`:
   ```bash
   git checkout develop && git pull
   git checkout -b feat/<short-description>
   ```
2. Implement changes with tests and docs updates.
3. Run quality gates:
   ```bash
   npm run typecheck
   npm run lint
   npm run test
   npm run build
   ```
4. Commit using Conventional Commits and push:
   ```bash
   git add .
   git commit -m "feat(api): add tenant invitations endpoint"
   git push -u origin feat/<short-description>
   ```
5. Open a Pull Request to `develop`.

## PR Checklist
- [ ] Clear description and scope
- [ ] Security review for auth/RLS/PII paths
- [ ] Unit/integration tests updated/added
- [ ] Docs updated (README/COMMANDS/SETUP) if behavior changes
- [ ] No secrets or sensitive data added

## Database Changes
1. Update `apps/api/prisma/schema.prisma`
2. Create migration:
   ```bash
   cd apps/api
   npx prisma migrate dev --name <migration_name>
   ```
3. For tenant isolation and pgvector, ensure corresponding SQL migrations are added under `prisma/migrations/`.

## Security Guidance
- Follow `docs/SECURITY.md`
- Preserve/strengthen RLS and permission checks
- Use parameterized queries via Prisma; avoid raw SQL unless necessary and safe
- Report vulnerabilities privately: security@lexiscan.ai

## Testing
- TypeScript: keep strict mode, avoid `any`
- Python: add type hints where feasible, follow pytest patterns
- Add tests for auth flows, permission guards, and data access

## Reviews & Approvals
- Sensitive areas (auth, billing, RLS) require two approvals
- CI must pass (lint, typecheck, tests, build)

## Licensing
By contributing, you agree your contributions are licensed under the MIT License (see LICENSE).
