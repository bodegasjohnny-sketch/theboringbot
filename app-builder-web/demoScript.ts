// Demo brain: a scripted interview -> spec -> build flow that runs with NO API key,
// so the product is fully testable. It mirrors the real app-builder process and
// produces a genuine, self-contained HTML preview at the build step.

export type ChatMessage = { role: "user" | "assistant"; content: string };
export type AgentReply = { reply: string; preview?: string; done?: boolean };

function esc(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string)
  );
}

// Pull a short, human title out of the user's first idea message.
function titleFrom(idea: string): string {
  const cleaned = idea.replace(/\s+/g, " ").trim();
  const firstClause = cleaned.split(/[.,;\n]/)[0] || cleaned;
  const words = firstClause.split(" ").slice(0, 6).join(" ");
  return words.length ? words[0].toUpperCase() + words.slice(1) : "Your App";
}

// Build a real, self-contained neon/dark landing page from the idea.
function buildPreview(idea: string): string {
  const title = esc(titleFrom(idea));
  const pitch = esc(idea.replace(/\s+/g, " ").trim().slice(0, 220));
  return `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<style>
  :root{--bg:#0B0B0F;--ink:#F5F7FA;--accent:#C6FF3A;--muted:#9AA0AA}
  *{box-sizing:border-box;margin:0;padding:0}
  body{background:var(--bg);color:var(--ink);font-family:'Inter',system-ui,-apple-system,sans-serif;line-height:1.5}
  .wrap{max-width:880px;margin:0 auto;padding:64px 24px;text-align:center}
  .tag{display:inline-block;border:1px solid var(--accent);color:var(--accent);
    border-radius:999px;padding:6px 14px;font-size:13px;letter-spacing:.04em;text-transform:uppercase}
  h1{font-family:'Space Grotesk','Inter',sans-serif;font-weight:700;font-size:clamp(34px,7vw,60px);
    line-height:1.05;margin:22px 0 16px}
  h1 span{color:var(--accent)}
  p.lead{color:var(--muted);font-size:clamp(16px,2.6vw,20px);max-width:620px;margin:0 auto 32px}
  .cta{display:inline-flex;gap:12px;flex-wrap:wrap;justify-content:center}
  a.btn{background:var(--accent);color:#0B0B0F;font-weight:700;text-decoration:none;
    padding:14px 26px;border-radius:12px;font-size:16px}
  a.ghost{border:1px solid #2A2E38;color:var(--ink);text-decoration:none;padding:14px 26px;border-radius:12px}
  .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;margin-top:56px;text-align:left}
  .card{border:1px solid #1C2029;border-radius:14px;padding:20px;background:#101218}
  .card h3{font-family:'Space Grotesk',sans-serif;font-size:17px;margin-bottom:6px}
  .card p{color:var(--muted);font-size:14px}
  footer{color:#5A5F6A;font-size:13px;margin-top:56px}
</style></head>
<body><div class="wrap">
  <span class="tag">Built by AppBuilder</span>
  <h1>${title}. <span>Shipped.</span></h1>
  <p class="lead">${pitch}</p>
  <div class="cta">
    <a class="btn" href="#start">Get started</a>
    <a class="ghost" href="#learn">See how it works</a>
  </div>
  <div class="grid">
    <div class="card"><h3>Fast</h3><p>From idea to live in one session, not one quarter.</p></div>
    <div class="card"><h3>Focused</h3><p>Scoped to a buildable v1 before a line of code.</p></div>
    <div class="card"><h3>Verified</h3><p>Tested against a spec, so it works when you see it.</p></div>
  </div>
  <footer>Live preview &middot; generated from your idea &middot; demo mode</footer>
</div></body></html>`;
}

const SPEC = (idea: string) => `Here's the SPEC I'd lock before writing any code:

SPEC — ${titleFrom(idea)}
1. Goal: a single-page site that presents the idea and drives one clear action.
2. Audience: first-time visitors, mobile-first.
3. Features (v1): hero headline + pitch, primary call-to-action, 3 value cards.
4. Out of scope v1: accounts, backend, payments.
5. Design: aggressive dark/neon — near-black bg, acid-green accent, bold grotesk headers.
6. Tech: single self-contained HTML document; deploy to GitHub Pages.
7. Verification checklist:
   [ ] Loads with zero console errors (mobile + desktop)
   [ ] Headline + pitch reflect the idea
   [ ] CTA button is present and styled
   [ ] Responsive at 375px and 1440px

Approve it and I'll build + render a live preview. (Reply "approve", or tell me what to change.)`;

// Count only user turns to drive the scripted flow.
export function demoRespond(messages: ChatMessage[]): AgentReply {
  const userMsgs = messages.filter((m) => m.role === "user");
  const idea = userMsgs[0]?.content ?? "your idea";
  const last = (userMsgs[userMsgs.length - 1]?.content ?? "").toLowerCase();
  const n = userMsgs.length;

  if (n <= 1) {
    return {
      reply:
        `Got it — "${idea.trim().slice(0, 80)}". Before I build anything, a quick interview so I don't guess.\n\n` +
        `Round 1 — Purpose:\n` +
        `• What's the one action a visitor should take? (buy / sign up / contact / learn)\n` +
        `• Mobile-first or desktop-first?\n\n` +
        `(Demo mode: reply with anything to continue the flow.)`,
    };
  }
  if (n === 2) {
    return {
      reply:
        `Round 2 — Content & design:\n` +
        `• Which 3 value points matter most?\n` +
        `• Visual vibe: bold dark/neon (recommended), clean light, or editorial?\n\n` +
        `Answer and I'll write the spec.`,
    };
  }
  if (n === 3) {
    return { reply: SPEC(idea) };
  }
  // From here on: approve -> build, otherwise treat as a change request.
  if (/approve|yes|build|go|ship/.test(last)) {
    return {
      reply:
        `Approved. Building against the spec and rendering a live preview →\n\n` +
        `Verification:\n` +
        `[x] Loads with zero console errors\n` +
        `[x] Headline + pitch reflect the idea\n` +
        `[x] CTA present and styled\n` +
        `[x] Responsive at 375px and 1440px\n\n` +
        `Done. The preview on the right is your generated app. In the real product, this is where I'd push it to a GitHub repo and give you a live URL.`,
      preview: buildPreview(idea),
      done: true,
    };
  }
  return {
    reply:
      `Logged as a change request: "${last.slice(0, 80)}". In the real flow I'd update the spec and re-confirm before building. ` +
      `For this demo, reply "approve" to build the preview.`,
  };
}
