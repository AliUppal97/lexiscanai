# Next.js 15 Migration Guide for LexiScanAI

## Overview
This guide covers the migration from Next.js 14 to Next.js 15, which includes React 19 support and several breaking changes.

## What Changed

### ✅ Completed Upgrades
- [x] Next.js: `14.0.0` → `^15.0.0`
- [x] React: `^18.2.0` → `^19.0.0`
- [x] React DOM: `^18.2.0` → `^19.0.0`
- [x] TypeScript types: Updated to React 19 types
- [x] ESLint config: Updated to Next.js 15
- [x] Removed deprecated `experimental.appDir` from next.config.ts
- [x] Updated images config to use `remotePatterns`

### 🔄 Key Changes in Next.js 15

1. **React 19 Support**
   - New React features and hooks
   - Improved concurrent features
   - Better performance optimizations

2. **Turbopack Integration**
   - Faster builds and development server
   - Rust-based bundler
   - Better caching

3. **Deprecated Features Removed**
   - `experimental.appDir` is now default
   - `@next/font` replaced with `next/font/google`

4. **Image Optimization**
   - `domains` config replaced with `remotePatterns`
   - Better security and flexibility

## Installation Steps

### Option 1: Use the Upgrade Script (Recommended)
```powershell
.\scripts\upgrade-nextjs15.ps1
```

### Option 2: Manual Installation
```bash
# Navigate to web app
cd apps/web

# Install with legacy peer deps to handle React 19 compatibility
npm install --legacy-peer-deps

# Go back to root
cd ../..

# Run checks
npm run typecheck
npm run lint
```

## Potential Issues & Solutions

### 1. Dependency Conflicts
**Problem**: Some packages might not support React 19 yet
**Solution**: Use `--legacy-peer-deps` flag during installation

### 2. TypeScript Errors
**Problem**: Type mismatches with React 19
**Solution**: Update `@types/react` and `@types/react-dom` to version 19

### 3. Third-party Package Issues
**Problem**: Libraries not compatible with React 19
**Solution**: 
- Check package documentation for React 19 support
- Consider alternatives or wait for updates
- Use `--legacy-peer-deps` as temporary workaround

### 4. Build Errors
**Problem**: Build failures after upgrade
**Solution**:
```bash
# Clear caches
Remove-Item -Recurse -Force .next
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json

# Reinstall
npm install --legacy-peer-deps
```

## Testing Checklist

### ✅ Basic Functionality
- [ ] Application starts without errors
- [ ] Pages load correctly
- [ ] Navigation works
- [ ] API calls function properly

### ✅ Component Testing
- [ ] All React components render
- [ ] Forms work correctly
- [ ] State management functions
- [ ] Event handlers work

### ✅ Performance Testing
- [ ] Build time is acceptable
- [ ] Development server starts quickly
- [ ] Hot reload works
- [ ] Bundle size is reasonable

### ✅ Browser Testing
- [ ] Chrome/Edge compatibility
- [ ] Firefox compatibility
- [ ] Safari compatibility (if needed)
- [ ] Mobile responsiveness

## React 19 Specific Changes

### New Features
- **Actions**: Server actions for form handling
- **use() Hook**: For promises and context
- **Document Metadata**: Better SEO support
- **Improved Suspense**: Better loading states

### Breaking Changes
- Some lifecycle methods deprecated
- Strict mode changes
- Error boundary improvements

## Rollback Plan

If issues arise, you can rollback:

```bash
# Revert package.json changes
git checkout HEAD~1 -- apps/web/package.json

# Reinstall old versions
cd apps/web
npm install

# Restore next.config.ts
git checkout HEAD~1 -- apps/web/next.config.ts
```

## Performance Benefits

### Expected Improvements
- **Build Speed**: 20-30% faster with Turbopack
- **Development Server**: Faster startup and hot reload
- **Bundle Size**: Optimized with React 19
- **Runtime Performance**: Better concurrent features

## Monitoring

After upgrade, monitor:
- Build times
- Bundle sizes
- Runtime performance
- Error rates
- User experience metrics

## Support

If you encounter issues:
1. Check Next.js 15 documentation
2. Review React 19 migration guide
3. Check package compatibility
4. Use `--legacy-peer-deps` as workaround
5. Consider gradual migration approach

## Next Steps

1. **Test thoroughly** in development
2. **Update CI/CD** if needed
3. **Monitor production** after deployment
4. **Update team** on new features
5. **Plan React 19 feature adoption**

---

**Note**: This migration maintains backward compatibility for most use cases. The main changes are in the build system and React version, with minimal code changes required.
