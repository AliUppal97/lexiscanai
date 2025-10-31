# Troubleshooting

This page centralizes common issues. For local environment specifics, also see `docs/development/local-setup.md`.

## Ports in Use
```bash
# mac/linux
tl;dr: lsof -i :3000; kill -9 <PID>
# windows
netstat -ano | findstr :3000
Task Manager → End Task by PID
```

## Database Connection
- Ensure `DATABASE_URL` is correct
- Postgres container healthy: `docker ps`, `docker logs`
- Reset: `npx prisma migrate reset --force`

## Redis Unavailable
- Check container health
- Test: `redis-cli ping` (container exec)

## Node Modules Broken
```bash
rm -rf node_modules package-lock.json
npm install
npm cache clean --force
```

## Docker Issues
```bash
docker compose down -v
docker compose up --build
```

## Performance
- Enable query logging; add indexes for slow queries
- Use Redis caching for hot paths

## Frontend
- Clear Next.js cache: delete `.next/` and restart

## API
- Check CORS origin and JWT secrets

## Contact
- dev-support@lexiscan.ai with logs and reproduction steps


