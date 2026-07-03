# Frontend deployment audit findings

**Date:** 2026-07-01  
**Production URL:** https://propie-weld.vercel.app  
**Method:** Config review, local `pnpm build`, production HTTP probes (raw wire measurement)  
**Scope:** Read-only — no changes applied

---

## Deployment

| Item | Finding |
|------|---------|
| Host | Vercel static (`framework: vite`) |
| Config | Root `vercel.json` → builds `web/`, serves `web/dist` |
| SPA routing | Catch-all rewrite to `/index.html` |
| API default | `https://propie-api.onrender.com` (via `VITE_API_URL` or fallback) |
| Self-hosted fonts | None — zero `.woff`/`.woff2` in repo or dist |
| Branch drift | Production bundle hash ≠ local `performance-1` build (Phase 1 web not deployed) |

---

## Compression (Vercel edge)

Vercel applies brotli/gzip to **compressible text**. Binary formats are served as-is.

| Asset class | Compressed by Vercel? | Evidence (production) |
|-------------|----------------------|------------------------|
| **JS** (`/assets/*.js`, `sw.js`) | **Yes** (`br`) | Main JS: 1.49 MB → 434 KB (−71%); maplibre chunk: 1.06 MB → 291 KB (−72%); `sw.js`: 18 KB → 6.6 KB (−64%) |
| **CSS** (`/assets/*.css`) | **Yes** (`br`) | Main CSS: 115 KB → 20 KB (−83%) |
| **HTML** (`index.html`) | **Yes** (`br`) | 1.7 KB → 783 B (−55%) |
| **SVG** (`/logo.svg`, 348 B) | **No** | Below compression threshold |
| **PNG / ICO** (`/logo.png`, PWA icons, brand PNGs) | **No** | PNG is binary-compressed; wire = raw bytes |
| **Small JS** (`registerSW.js`, 134 B) | **No** | Below threshold |
| **Fonts** | **Not on Vercel** | Loaded from Google Fonts CDN (see below) |

**Conclusion:** Frontend text assets are already served compressed by Vercel. No custom compression middleware is needed on Vercel.

---

## Browser cache headers (Vercel)

All probed paths return:

`Cache-Control: public, max-age=0, must-revalidate`

| Asset class | Long-lived browser cache? | Notes |
|-------------|---------------------------|-------|
| Hashed `/assets/*` (JS, CSS) | **No** | Should use `immutable` + 1y for fingerprinted files |
| Static `/public/*` (PNG, icons, manifest) | **No** | Stable paths revalidate every visit |
| `index.html` | **No** | `max-age=0` is correct for SPA shell updates |
| Edge CDN | Hits observed (`x-vercel-cache: HIT`) | CDN caches; browsers still revalidate |

---

## Asset class details

### JS

- Main bundle in `index.html`: `/assets/index-*.js` (~434 KB brotli).
- Lazy map chunk: `/assets/maplibre-gl-*.js` (~291 KB brotli), loaded on `/mapa`.
- Only `PropertyMap` uses `React.lazy()`; most routes are in the main bundle.
- Service worker: `/sw.js` precaches ~15 entries (~2.6 MB decoded).

### CSS

- Single main bundle linked in production `index.html`: `/assets/index-*.css` (~20 KB brotli).

### SVG

- Only static SVG deployed: `/logo.svg` (348 B).
- Splash logo on `performance-1` branch is inline SVG in JS (not yet on production).
- App UI uses `/logo.png` (488 KB PNG), not SVG.

### Fonts

Source: four `@import` rules in `web/src/styles/fonts.css` → Google Fonts CDN.

| Layer | Cache | Compression |
|-------|-------|---------------|
| CSS (`fonts.googleapis.com`) | `private, max-age=86400` (1 day) | Google edge |
| Files (`fonts.gstatic.com`, 14× woff2) | `public, max-age=31536000` (1 year) | woff2 format (no extra `Content-Encoding`) |

PWA service worker also caches Google Fonts with CacheFirst (1-year expiration).

### Static assets (`web/public/`)

| File | Size | Compressed | Cached (browser) |
|------|------|------------|------------------|
| `brand/logo-home-heade2r.png` | 922 KB | No | `max-age=0` |
| `logo.png` | 488 KB | No | `max-age=0` |
| `ISOLOGO.png` | 59 KB | No | `max-age=0` |
| PWA / favicon PNGs | 4–15 KB | No | `max-age=0` |
| `manifest.webmanifest` | 587 B | No | `max-age=0` |
| `logo.svg` | 348 B | No | `max-age=0` |

**Total probed static weight:** ~1.55 MB (dominated by two brand PNGs).

Missing static paths (e.g. `/does-not-exist.png`) return SPA `index.html` (200) due to catch-all rewrite.

---

## Security headers (Vercel)

| Header | Production |
|--------|------------|
| HSTS | Present (`max-age=63072000; includeSubDomains; preload`) |
| CSP | Not set |
| `X-Content-Type-Options` | Not set |
| `X-Frame-Options` | Not set |

---

## Build pipeline notes

| Item | Finding |
|------|---------|
| Install | `pnpm --dir web install --no-frozen-lockfile` |
| Build | `pnpm --dir web build` |
| Duplicate config | `web/vercel.json` exists but root config is used for repo deploys |
| Env vars | `VITE_*` baked at build time (see `web/.env.example`) |

---

## Related docs

| Document | Purpose |
|----------|---------|
| [performance-baseline.md](./performance-baseline.md) | API latency baseline format |
| [public-cache-headers.md](./public-cache-headers.md) | API cache header decisions (Render) |

---

## Verification scripts

```bash
node scripts/verify-vercel-compression.mjs
node scripts/audit-vercel-headers.mjs
node scripts/audit-vercel-cache.mjs
node scripts/audit-vercel-js.mjs
node scripts/audit-vercel-css.mjs
node scripts/audit-vercel-svg.mjs
node scripts/audit-vercel-fonts.mjs
node scripts/audit-vercel-static.mjs
```

---

## Summary

| Area | Status |
|------|--------|
| Vercel text compression (JS/CSS/HTML/SW) | Working — platform default |
| Vercel binary static compression | N/A — PNG/ICO served raw |
| Vercel browser cache policy | Weak — `max-age=0` on all assets |
| Font delivery | Third-party Google CDN — long cache on gstatic |
| Self-hosted fonts | Not implemented |
| Large PNG deploy weight | ~1.5 MB in `public/` |
| Phase 1 web (`performance-1`) | Not live on production |
| Phase 1 API (Render) | Not live on production |

---

## Improvements implemented (2026-07-01)

Non-architectural changes on `performance-1`:

| Change | Files |
|--------|-------|
| Vercel cache headers (`/assets/*` immutable 1y; icons/manifest 1d) | `vercel.json` |
| Security headers (`X-Content-Type-Options`, `Referrer-Policy`) | `vercel.json` |
| Frozen lockfile on Vercel install | `vercel.json` |
| Font preconnect | `web/index.html` |
| SVG wordmark in `PropieLogo` (removes 488 KB + 35 KB PNG deps) | `PropieLogo.tsx` |
| Removed unused PNGs (`logo.png`, brand headers, `LOGO B.png`) | `web/public/` |
| Removed duplicate `web/vercel.json` | deleted |

**Still deploy-only:** merge `performance-1`, run migration `040` on Supabase, redeploy Render API.
