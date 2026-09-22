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

## Deploy

The site is static and can be hosted anywhere (GitHub Pages, Vercel, Netlify).
For GitHub Pages: Settings → Pages → deploy from the `main` branch root.

---

[thesidecar.in](https://thesidecar.in) • Created by Dhruv —
[thisisdhruv.in](https://thisisdhruv.in)
