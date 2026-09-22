# Sidecar — Landing Page

Marketing site for **Sidecar**, a local desktop companion for fast, private AI
proof-of-concept validation. Choose a project directory, connect your Codex
account, run a real test, and decide if an idea deserves production investment
— before paying for any infrastructure.

## Stack

- Single-file static page (`index.html`)
- [Tailwind CSS](https://tailwindcss.com) via CDN (utility styling)
- Inter + JetBrains Mono via Google Fonts
- Material Symbols icons
- Vanilla JS (no build step, no dependencies)

## Features of this site

- Light and dark themes (toggle in the header, respects system preference,
  persists via `localStorage`)
- Scroll-reveal animations with `prefers-reduced-motion` support
- Scrollspy navigation with a full mobile menu
- Copy-to-clipboard endpoint snippets
- Fully responsive: every section stacks and reflows on small screens

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
POC" button. It fetches the latest release of
[dhruv2003/sidecar](https://github.com/dhruv2003/sidecar) client-side from the
GitHub API (`releases/latest`) and offers the macOS `.dmg` (Apple Silicon) and
Windows `.exe` (x64) assets with live version, date, and file size — so the
site always serves the newest build with no manual updates. If the API is
unavailable (rate limit/offline), the buttons fall back to the latest-release
page. All GitHub links on the site point to the main `dhruv2003/sidecar`
repository.

## Brand assets

The official Sidecar brand kit (symbols, wordmarks, lockups, app icons, and
color tokens) lives in [`assets/brand/`](assets/brand/README.md). The header
and footer swap symbol and wordmark variants automatically for light/dark
themes. `assets/brand/og-image.png` is the social share card.

## Deploy

The site is static and can be hosted anywhere (GitHub Pages, Vercel, Netlify).
For GitHub Pages: Settings → Pages → deploy from the `main` branch root.

---

[thesidecar.in](https://thesidecar.in) • Created by Dhruv —
[thisisdhruv.in](https://thisisdhruv.in)
