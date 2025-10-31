# Release Process

We use Semantic Versioning and Conventional Commits. Releases are automated via CI on tags.

## Versioning
- MAJOR: incompatible API changes
- MINOR: backwards-compatible functionality
- PATCH: backwards-compatible bug fixes

## Pre-release Checklist
- [ ] All CI checks green (lint, typecheck, tests, build)
- [ ] CHANGELOG.md updated under [Unreleased]
- [ ] Version bumped across packages if needed

## Tagging & Publishing
```bash
# from default branch
npm run build
npm test
# bump version with conventional commits (example using changesets or npm version)
npm version <major|minor|patch> -m "release: %s"
git push origin --follow-tags
```

CI will:
- Build artifacts
- Publish Docker images (if configured)
- Deploy staging/production per tag rules
- Create a GitHub Release with notes

## Hotfixes
- Branch from last tag
- Apply fix, bump patch, tag, and push

## Rollback
- Use CI workflow "Rollback" or deploy previous tag
- Update status page and notify stakeholders


