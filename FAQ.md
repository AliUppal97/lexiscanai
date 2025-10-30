# FAQ

## Product
- Q: What file types are supported?
  A: PDF, DOC/DOCX, TXT; more via roadmap.
- Q: Is my data secure?
  A: Yes. TLS in transit, encrypted at rest. See `docs/SECURITY.md`.

## API
- Q: How do I authenticate?
  A: JWT bearer tokens. See `docs/api/authentication.md`.
- Q: Rate limits?
  A: See `docs/api/rate-limiting.md`.

## Development
- Q: Quick start?
  A: See `QUICK_START.md` or `docs/development/local-setup.md`.
- Q: Tests failing locally?
  A: Ensure DB/Redis running and run `npm run db:migrate`.

## Operations
- Q: How do I deploy?
  A: See `docs/deployment/aws-deployment.md` or `kubernetes-deployment.md`.
- Q: Where are runbooks/playbooks?
  A: See `ops/runbooks` and `ops/playbooks`.
