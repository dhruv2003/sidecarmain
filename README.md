# Sidecar — Landing Page

Marketing site for **Sidecar**, a local desktop companion for fast, private AI
proof-of-concept validation. Choose a project directory, connect your Codex
account, run a real test, and decide if an idea deserves production investment
— before paying for any infrastructure.

## Stack

- Static HTML, CSS and JavaScript. No build step and no runtime dependencies.
- `css/site.css` holds the "Split Pane" design system. Its colour tokens match the
  desktop app (`dhruv2003/sidecar`, `src/public/styles.css`), so the site and the
  app look like one product. Light and dark themes follow the system setting, and
  the header switch remembers a manual choice.
- Geist and Geist Mono are self-hosted in `assets/fonts` (SIL Open Font License).
- `js/site.js` runs on every page: theme, mobile menu, scrollspy, mobile download
  bar and the service worker. `js/home.js` drives the home page demos.
  `js/download.js` resolves the latest release.
- Brand assets in `assets/brand` are copied from the app repo's brand kit.

## Motion

- The hero app window boots and runs its own connection test.
- "Under the hood" animates one request through the gateway's checks. A burst
  shows a 429 that stops locally.
- The request log streams example rows while it is on screen.
- Sections reveal with scroll-driven CSS animations. Browsers without support show
  the content without the animation.
- Everything respects `prefers-reduced-motion`.

## Run locally

No build required. Open `index.html` directly, or serve the folder:

```bash
npx serve .
# or
python3 -m http.server 8080
```

Then visit `http://localhost:8080`.

## Download page

`download.html` is linked from every "Download Sidecar" / "Try your first
POC" button. It offers the macOS `.dmg` (Apple Silicon) and Windows `.exe`
(x64) builds of [dhruv2003/sidecar](https://github.com/dhruv2003/sidecar) and
stays current automatically via three layers:

1. **Live GitHub API** (primary) — `releases/latest` is queried client-side,
   so visitors see the newest release the moment it is published.
2. **`latest-release.json`** (fallback) — a same-origin snapshot in this repo
   used when a visitor hits the API rate limit (shared IPs). It also carries a
   `title` + `notes` summary that powers the "What's new" panel on the download
   page. Installer and automatic-update support sections are omitted from the
   notes because the page already provides dedicated download buttons. Refresh
   it after publishing a release with
   `./scripts/update-release.sh`, or enable the optional Actions template below.
3. **Releases page** (last resort) — if neither source loads, the buttons
   link to `github.com/dhruv2003/sidecar/releases/latest`.

### Keeping the snapshot fresh

- **Manual:** run `./scripts/update-release.sh` after publishing a release.
  It regenerates `latest-release.json`, commits, and pushes.
- **Automatic (optional):** move `automation/update-release.yml` to
  `.github/workflows/update-release.yml` (do it in the GitHub web UI: Add
  file → paste the file contents). It refreshes the snapshot hourly and on
  demand via the Actions tab.

All GitHub links on the site point to the main `dhruv2003/sidecar`
repository.

## Brand assets

The official Sidecar brand kit (symbols, wordmarks, lockups, app icons, and
color tokens) lives in [`assets/brand/`](assets/brand/README.md). The header
and footer swap symbol and wordmark variants automatically for light/dark
themes. `assets/brand/og-image.png` is the social share card.

## Deploy

The site is static and can be hosted anywhere (GitHub Pages, Vercel, Netlify).
`vercel.json` adds cache headers for CSS/asset files, offline-first caching via
`sw.js` (precache + stale-while-revalidate), and hardening response headers.
Note: GitHub Pages serves `sw.js` but ignores `vercel.json`; Vercel honours
both.
For GitHub Pages: Settings → Pages → deploy from the `main` branch root.

---

[sidecar.co.in](https://sidecar.co.in) • Created by Dhruv —
[thisisdhruv.in](https://thisisdhruv.in)
