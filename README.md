# THE BORING BOT

An AI-leveraged growth lab landing experience — a phantom.land-style **spherical gallery** where each card is a free value playbook (finance, crypto, AI automation, 24-hour launches, pull marketing, Facebook ads, and more). Value first, sell later.

Built with **Three.js** (`CSS3DRenderer`) for the inside-the-sphere gallery and **GSAP** for transitions. No build step — pure static HTML/CSS/JS.

## Files
| File | Purpose |
|------|---------|
| `index.html` | Markup, meta tags, mounts the gallery |
| `style.css` | All styling |
| `main.js` | Three.js sphere, drag/scroll easing, detail pages, filter, list view |
| `og-image.png` | Social share / link-preview image (1200×630) |

## Run locally
ES modules require HTTP (not `file://`):
```bash
cd "the boring bot"
python3 -m http.server 8741
# open http://localhost:8741
```

## Deploy
Hosted on **GitHub Pages**; embedded into GoHighLevel via an `<iframe>`.

## Controls
- **Left-click + drag** (or scroll) to orbit the gallery
- **Click a card** to open its playbook
- **Grid / list** toggle, category **filter**, and **Playbooks / About / Contact** nav
