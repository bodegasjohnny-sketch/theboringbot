# AppBuilder Web — the app-builder skill as a public web product

A Lovable-style web app: describe an app in a chat box, and it **interviews you,
writes a spec, then builds it and renders a live preview** — the bug-prevention-first
process from the `app-builder` skill, wrapped in a website.

This is **Phase 2 v1**: a working chat app with a **demo mode** that runs with no
API key (so it's testable anywhere), and a **live mode** wired for the Claude Agent
SDK that activates automatically when a key is present.

## Zero-setup preview (GitHub Pages)

`demo/` is a fully static version — the demo brain runs entirely in the browser,
no server or Node needed. With GitHub Pages enabled on this branch it's live at:

```
https://<user>.github.io/theboringbot/app-builder-web/demo/
```

Enable it once: repo **Settings → Pages → Deploy from a branch** → pick this
branch, folder `/ (root)`.

## Run it

No build step, no dependencies required for demo mode (Node 22+):

```bash
cd app-builder-web
node server.ts
# open http://localhost:5173
```

You'll see `DEMO mode` in the corner. Type an idea (e.g. "a landing page for my
coffee subscription"), answer the interview rounds, then reply `approve` — a real
landing page renders in the live-preview pane.

## Live mode (real Claude)

```bash
export ANTHROPIC_API_KEY=sk-ant-...      # your key
npm install @anthropic-ai/sdk            # only needed for live mode
node server.ts                            # now shows "LIVE mode"
```

In live mode, `agent.ts` runs a real tool-use loop against **Claude Sonnet 5**
(cost-efficient, near-Opus copy quality) using the interview process in
`systemPrompt.ts`. The model calls a `render_preview(html)` tool to update the
preview pane.

## Files

| File | Purpose |
|------|---------|
| `server.ts` | Zero-dependency HTTP server: serves the UI, `/api/chat`, `/api/health`. |
| `agent.ts` | Dispatcher — real Agent SDK path when a key is set, demo path otherwise. |
| `systemPrompt.ts` | The app-builder process as a system prompt (the "brain"). |
| `demoScript.ts` | Scripted interview → spec → build flow + preview generator (no key). |
| `public/` | Chat UI + live-preview iframe (`index.html`, `styles.css`, `app.js`). |

## Verified

Browser-tested in Chromium (full flow, zero console errors), responsive at 375px
and 1440px.

## Not in this v1 (roadmap)

Accounts, billing, per-user sandboxed execution, and pushing each build to a real
GitHub repo with a hosted live URL. Those come with the auth/backend phase — this
v1 proves the chat + agent + live-preview architecture end to end.
