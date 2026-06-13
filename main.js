/* THE BORING BOT — spherical gallery (phantom.land-style)
   Three.js CSS3DRenderer + GSAP. Camera sits at the sphere's center;
   cards line the inner surface and face inward. Drag/scroll rotates
   the view with lenis-style damped easing + inertia. */

import * as THREE from 'three';
import { CSS3DRenderer, CSS3DObject } from 'three/addons/renderers/CSS3DRenderer.js';

/* ================= DATA ================= */

const TOPICS = [
  {
    series: 'MONEY SERIES', title: 'FINANCE HACKS', tags: ['FINANCE', 'WEALTH'], year: '2026',
    art: { type: 'bars', bg: ['#0b1f16', '#103626'], accent: '#39d98a', word: 'CASH FLOW', sub: 'ROUTING / FEES / YIELD' },
    desc: 'The unsexy banking moves that quietly compound: account routing, fee audits, high-yield parking and automation rules that make every peso and dollar report for duty.',
    bullets: [
      'The 4-account routing system — every income hits the right bucket automatically',
      'Kill-list: the 12 fees and subscriptions silently taxing you',
      'High-yield parking — where idle cash earns while it waits',
      'Set-and-forget savings sweeps that fire on payday, not on willpower',
    ],
  },
  {
    series: 'MONEY SERIES', title: 'CREDIT LIMIT HACKS', tags: ['FINANCE', 'CREDIT'], year: '2026',
    art: { type: 'card', bg: ['#101022', '#1d1d45'], accent: '#7b8cff', word: '', sub: 'LIMIT UP / UTILIZATION DOWN' },
    desc: 'How banks actually decide your limit — and the clean, ethical sequence to raise it: utilization mechanics, statement timing, relationship signals and when to ask.',
    bullets: [
      'The utilization sweet spot that makes algorithms love you',
      'Statement-date timing — pay BEFORE the report, not the due date',
      'The 6-month ask cadence (and the exact request script)',
      'Why a higher limit is a wealth tool, not an invitation to spend',
    ],
  },
  {
    series: 'MONEY SERIES', title: 'CRYPTO TRADING SYSTEM', tags: ['CRYPTO', 'STRATEGY'], year: '2026',
    art: { type: 'candles', bg: ['#160d04', '#2b1503'], accent: '#ffb347', word: '', sub: 'RULES > FEELINGS' },
    desc: 'A rules-based crypto framework: position sizing, invalidation levels, DCA bands and automation — so the system trades and your emotions stay unemployed.',
    bullets: [
      'Position sizing math that survives a 70% drawdown',
      'DCA bands vs. lump sum — when each one actually wins',
      'Invalidation first: define the exit before the entry',
      'Automating entries/exits so you never trade at 3am again',
    ],
  },
  {
    series: 'AI SERIES', title: 'BUSINESS AI SOLUTIONS', tags: ['AI', 'BUSINESS'], year: '2026',
    art: { type: 'orb', bg: ['#1a0b00', '#000000'], accent: '#ff5a1f', word: 'AI', sub: 'DEPLOY / DELEGATE / SCALE' },
    desc: 'Where AI actually pays inside a real business: support, ops, content, sales follow-up. The map of high-ROI deployments — not demos, deployments.',
    bullets: [
      'The 5 AI deployments with provable ROI in under 30 days',
      'Build vs. buy: when a custom agent beats an off-the-shelf tool',
      'The handoff rule — what AI does alone vs. with a human',
      'Scoring your business for AI-readiness in one afternoon',
    ],
  },
  {
    series: 'OPS SERIES', title: 'AUTOMATE & DIGITIZE', tags: ['AUTOMATION', 'OPS'], year: '2026',
    art: { type: 'rings', bg: ['#001a1a', '#003333'], accent: '#2dd4bf', word: 'OPS', sub: 'PAPER → PIPELINE' },
    desc: 'Turn manual chaos into pipelines: digitize the paperwork, automate the handoffs, and give every repetitive task a robot. Your business, minus the busywork.',
    bullets: [
      'The automation audit — find the 20 hours/week hiding in your ops',
      'Zapier/Make/n8n: picking the right glue for the job',
      'Digitize first, automate second — the order that never backfires',
      'SOPs that machines (and new hires) can both execute',
    ],
  },
  {
    series: 'AI SERIES', title: 'SELL DIGITAL PRODUCTS WITH AI', tags: ['AI', 'PRODUCTS'], year: '2026',
    art: { type: 'cube', bg: ['#15001f', '#2a0b3d'], accent: '#c084fc', word: '', sub: 'MAKE ONCE / SELL FOREVER' },
    desc: 'From idea to income asset: use AI to research, build, package and sell digital products — templates, courses, tools — with margins physical goods can only dream of.',
    bullets: [
      'Product-idea mining: let AI find what your audience already wants',
      'The 80/20 build: AI drafts, you direct, customers buy',
      'Pricing digital goods — value-stack vs. race-to-the-bottom',
      'The evergreen funnel that sells your product while you sleep',
    ],
  },
  {
    series: 'LAUNCH SERIES', title: 'LAUNCH IN 24 HOURS', tags: ['OFFER', 'SPEED'], year: '2026',
    art: { type: 'word', bg: ['#1f0005', '#3d0b14'], accent: '#ff4d6d', word: '24H', sub: 'OFFER → SHIPPED' },
    desc: 'The 24-hour launch protocol: craft the offer, write the page, set the price, open the cart. Speed is the strategy — perfection is procrastination in a suit.',
    bullets: [
      'Hour 0–4: the one-sentence offer that sells itself',
      'Hour 4–12: landing page, payment link, delivery — minimum lovable',
      'Hour 12–20: borrow attention — DMs, lists, communities',
      'Hour 20–24: open cart, collect data, iterate in public',
    ],
  },
  {
    series: 'SALES SERIES', title: 'SALES ON AUTOPILOT', tags: ['SALES', 'AUTOMATION'], year: '2026',
    art: { type: 'flow', bg: ['#001226', '#002a4d'], accent: '#38bdf8', word: '', sub: 'PIPELINE THAT RUNS ITSELF' },
    desc: 'A selling machine that works nights and weekends: automated capture, nurture sequences, AI follow-up and booking — humans only enter to close.',
    bullets: [
      'The capture → nurture → close pipeline, fully mapped',
      'Follow-up automation: 80% of sales die from silence, not "no"',
      'AI SDRs — qualifying leads before a human ever says hello',
      'The dashboard: 5 numbers that tell you the machine is healthy',
    ],
  },
  {
    series: 'MARKETING SERIES', title: 'THEY CHASE YOU', tags: ['MARKETING', 'BRAND'], year: '2026',
    art: { type: 'word', bg: ['#1a1400', '#332800'], accent: '#facc15', word: 'PULL', sub: 'MAGNET > MEGAPHONE' },
    desc: 'Flip the chase: publish value so good your customers come hunting for you. Authority content, lead magnets and positioning that turn cold outreach into inbound demand.',
    bullets: [
      'The value-first ladder: give the why, sell the how',
      'Authority assets — one great playbook beats 100 cold DMs',
      'Positioning: be the only answer, not the best option',
      'The inbound flywheel: content → trust → waitlist → sales',
    ],
  },
  {
    series: 'SALES SERIES', title: 'SALES PROCESS LOGIC', tags: ['SALES', 'PROCESS'], year: '2026',
    art: { type: 'funnel', bg: ['#0d0d0d', '#1f1f1f'], accent: '#e5e5e0', word: '', sub: 'EVERY MARKETER MUST KNOW' },
    desc: 'The logic underneath every sale: problem → trust → offer → objection → close. If your marketing ignores the sales process, you are decorating, not selling.',
    bullets: [
      'The 5 stages every buyer walks through — no exceptions',
      'Matching content to stage: why great ads die on cold traffic',
      'Objections are data: the pre-handle framework',
      'Marketing ↔ sales handoff — where most revenue leaks',
    ],
  },
  {
    series: 'ADS SERIES', title: 'FACEBOOK ADS AUTOPILOT', tags: ['ADS', 'AUTOMATION'], year: '2026',
    art: { type: 'chart', bg: ['#00121f', '#012d4d'], accent: '#4d9fff', word: '', sub: 'OPTIMIZE / AUTOMATE / SCALE' },
    desc: 'Meta ads without the daily panic: creative testing systems, automated rules, budget scaling logic and the metrics that actually predict profit.',
    bullets: [
      'The 3-2-2 creative testing method — kill losers fast',
      'Automated rules: pause, scale and rebalance while you sleep',
      'CBO vs. ABO — when to let the algorithm drive',
      'The only 4 metrics that matter (hint: CTR is not one)',
    ],
  },
  {
    series: 'WEALTH SERIES', title: 'MONEY THAT WORKS FOR YOU', tags: ['WEALTH', 'PASSIVE'], year: '2026',
    art: { type: 'coins', bg: ['#0d1a00', '#1d3300'], accent: '#a3e635', word: '', sub: 'ASSETS > HOURS' },
    desc: 'The obsession that started everything: converting active income into assets — index systems, cash-flowing products, automation — until your money out-earns your hours.',
    bullets: [
      'The conversion rule: every windfall becomes an asset, not a lifestyle',
      'Income stacking: active → leveraged → passive, in that order',
      'Why boring beats exciting in 9 out of 10 portfolios',
      'Your personal "money machine" dashboard — net worth on autopilot',
    ],
  },
  {
    series: 'AI SERIES', title: 'THE AI LEVERAGE STACK', tags: ['AI', 'OUTPUT'], year: '2026',
    art: { type: 'word', bg: ['#001a0d', '#00331a'], accent: '#34d399', word: '10×', sub: 'OUTPUT WITHOUT HEADCOUNT' },
    desc: 'My exact stack for fast-tracking output with AI: research, writing, design, code, follow-up. One operator, the output of a team — leverage is the whole game.',
    bullets: [
      'The daily AI workflow: 4 hours of work in 40 minutes',
      'Prompt systems, not prompts — reusable thinking machines',
      'Where AI is still bad (and how to cover the gap)',
      'Compounding: every workflow you automate works forever',
    ],
  },
  {
    series: 'SCALE SERIES', title: 'BRICK & MORTAR TO DIGITAL', tags: ['SCALE', 'DIGITAL'], year: '2026',
    art: { type: 'grid', bg: ['#1a0d00', '#331a00'], accent: '#fb923c', word: 'B→D', sub: 'LOCAL SHOP / GLOBAL REACH' },
    desc: 'Your physical business is a digital business that hasn’t been told yet. Bookings, loyalty, delivery, content, ads — scale a local shop past its own four walls.',
    bullets: [
      'The digital layer: bookings, payments and CRM in week one',
      'Local SEO + maps — own your neighborhood’s search results',
      'Turning foot traffic into a list you can sell to forever',
      'Productize the expertise: sell what you know, not just what you stock',
    ],
  },
  {
    series: 'AI SERIES', title: 'ZERO-EMPLOYEE BUSINESS', tags: ['AI', 'AGENTS'], year: '2026',
    art: { type: 'rings', bg: ['#11001a', '#220033'], accent: '#d946ef', word: 'SOLO', sub: 'AGENTS DO THE WORK' },
    desc: 'One human, many agents: run support, marketing, bookkeeping and fulfillment with AI agents and automations. Headcount zero, output absurd.',
    bullets: [
      'The org chart of one — agents as your departments',
      'Agent guardrails: what to delegate, what to gate',
      'Cost math: agent stack vs. first hire',
      'Scaling checklist: when (if ever) to add a human',
    ],
  },
  {
    series: 'MARKETING SERIES', title: 'CONTENT THAT SELLS ASLEEP', tags: ['CONTENT', 'AI'], year: '2026',
    art: { type: 'loop', bg: ['#001216', '#00282e'], accent: '#22d3ee', word: '', sub: 'PUBLISH ONCE / SELL FOREVER' },
    desc: 'An AI-assisted content engine: one idea becomes a week of posts, every post feeds the funnel, and the funnel sells while you sleep. Volume with a brain.',
    bullets: [
      'The 1→10 repurposing tree: one pillar, ten assets',
      'Hooks library: the first line does 80% of the work',
      'CTA architecture — every post points somewhere on purpose',
      'The weekly 90-minute content sprint (AI does the other 6 hours)',
    ],
  },
];

const FILTER_CATS = ['ALL', 'FINANCE', 'AI', 'AUTOMATION', 'MARKETING', 'SALES', 'CRYPTO', 'WEALTH'];

/* ================= CARD ART ================= */

function artHTML(a, big = false) {
  const [c1, c2] = a.bg;
  let inner = '';
  switch (a.type) {
    case 'orb':
      inner = `<span class="glow" style="width:78%;height:78%;background:radial-gradient(circle at 38% 32%, ${a.accent}, #481600 68%, #000 100%);box-shadow:0 0 110px ${a.accent}66"></span>
               <span class="word" style="position:absolute;bottom:8%;left:8%;font-size:${big ? 'clamp(60px,9vw,130px)' : '44px'};color:#fff">${a.word}</span>`;
      break;
    case 'bars': {
      const hs = [28, 46, 38, 62, 55, 82, 96];
      inner = `<div class="bars">${hs.map((h) => `<b style="height:${h}%;background:linear-gradient(to top, ${a.accent}cc, ${a.accent}33)"></b>`).join('')}</div>
               <span class="word" style="position:absolute;top:10%;left:8%;text-align:left;font-size:${big ? 'clamp(50px,7vw,110px)' : '34px'};color:#fff">${a.word}</span>`;
      break;
    }
    case 'card':
      inner = `<span class="cc" style="background:linear-gradient(120deg, ${a.accent}, ${c2} 80%)"></span>`;
      break;
    case 'candles': {
      const cd = [[12, 30, 26], [24, 44, 20, 1], [36, 36, 30], [48, 52, 24, 1], [60, 42, 36], [72, 60, 28, 1], [84, 50, 42]];
      inner = cd.map(([x, b, h, red]) => `<span class="candle" style="left:${x}%;bottom:${b - h / 2}%;height:${h}%;background:${red ? '#f43f5e' : a.accent}"></span>`).join('');
      break;
    }
    case 'rings':
      inner = [86, 62, 38, 16].map((s, i) => `<span class="ring" style="width:${s}%;height:${s}%;border-color:${a.accent}${['33', '55', '88', 'ff'][i]}"></span>`).join('') +
              `<span class="word" style="font-size:${big ? 'clamp(60px,9vw,140px)' : '40px'};color:#fff;position:relative">${a.word}</span>`;
      break;
    case 'cube':
      inner = `<span class="orb" style="width:46%;height:52%;border-radius:10px;background:linear-gradient(135deg, ${a.accent}, ${c2});transform:rotate(12deg);box-shadow:0 24px 70px ${a.accent}55, inset 0 0 0 1.5px #ffffff44"></span>
               <span class="orb" style="width:46%;height:52%;border-radius:10px;border:1.5px solid ${a.accent}88;transform:rotate(-6deg) translate(-14%,8%)"></span>`;
      break;
    case 'word':
      inner = `<span class="glow" style="width:120%;height:120%;background:radial-gradient(circle, ${a.accent}40, transparent 60%)"></span>
               <span class="word" style="font-size:${big ? 'clamp(110px,18vw,260px)' : '92px'};color:${a.accent};text-shadow:0 0 60px ${a.accent}99">${a.word}</span>`;
      break;
    case 'flow':
      inner = [18, 38, 58, 78].map((y, i) => `<span style="position:absolute;top:${y}%;left:6%;right:6%;height:2px;background:linear-gradient(to right, transparent, ${a.accent}, transparent);opacity:${0.35 + i * 0.2}"></span>`).join('') +
              [22, 46, 66].map((x, i) => `<span class="orb" style="left:${x}%;top:${30 + i * 18}%;width:11px;height:11px;background:${a.accent};box-shadow:0 0 18px ${a.accent}"></span>`).join('');
      break;
    case 'funnel':
      inner = [[78, 14], [58, 32], [38, 50], [20, 68]].map(([w, t]) => `<span style="position:absolute;top:${t}%;left:${(100 - w) / 2}%;width:${w}%;height:11%;background:${a.accent}; opacity:${0.25 + (t / 100) * 0.75};border-radius:3px"></span>`).join('');
      break;
    case 'chart':
      inner = `<svg viewBox="0 0 200 120" style="position:absolute;inset:0;width:100%;height:100%" preserveAspectRatio="none">
                 <polyline points="0,100 30,84 60,90 90,60 120,68 150,34 200,12" fill="none" stroke="${a.accent}" stroke-width="3"/>
                 <polyline points="0,100 30,84 60,90 90,60 120,68 150,34 200,12 200,120 0,120" fill="${a.accent}22" stroke="none"/>
               </svg>`;
      break;
    case 'coins':
      inner = [0, 1, 2, 3, 4].map((i) => `<span class="orb" style="left:34%;bottom:${12 + i * 11}%;width:32%;height:13%;border-radius:50%;background:linear-gradient(to bottom, ${a.accent}, ${c2});box-shadow:inset 0 -4px 0 #00000055"></span>`).join('') +
              `<span class="orb" style="left:38%;bottom:64%;width:24%;height:10%;border-radius:50%;border:1.5px dashed ${a.accent};animation:none"></span>`;
      break;
    case 'grid':
      inner = `<div class="gridlines"></div>
               <span class="word" style="font-size:${big ? 'clamp(80px,13vw,200px)' : '64px'};color:${a.accent}">${a.word}</span>`;
      break;
    case 'loop':
      inner = `<span class="ring" style="width:60%;height:60%;border-width:10px;border-color:${a.accent}44"></span>
               <span class="ring" style="width:60%;height:60%;border-width:10px;border-color:transparent;border-top-color:${a.accent};transform:rotate(40deg)"></span>
               <span class="orb" style="width:12px;height:12px;background:#fff;box-shadow:0 0 20px #fff;top:19%;left:62%"></span>`;
      break;
  }
  return `<div class="art" style="background:linear-gradient(160deg, ${c1}, ${c2})">${inner}<span class="scan"></span><span class="sub" style="color:${a.accent}">${a.sub}</span></div>`;
}

function cardHTML(t, i) {
  return `<div class="card-inner">
    <div class="card-top"><span class="card-brand">${t.series}</span><span class="card-title">${t.title}</span></div>
    <div class="card-media">${artHTML(t.art)}</div>
    <div class="card-bot">
      <span class="card-tags"><i class="solid">${t.tags[0]}</i><i>${t.tags[1]}</i></span>
      <span class="year">${t.year}</span>
    </div>
  </div>`;
}

/* ================= THREE / SPHERE ================= */

const stage = document.getElementById('stage');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(64, innerWidth / innerHeight, 1, 5000);
camera.position.set(0, 0, 0.1);

const renderer = new CSS3DRenderer();
renderer.setSize(innerWidth, innerHeight);
stage.appendChild(renderer.domElement);

const RADIUS = 1050;
const ROWS = 4;
const COLS = 12;
const LATS = [33, 11, -11, -33];          // degrees per row
const STEP = 360 / COLS;

const cardObjects = [];                    // { el, topic, idx }

let slot = 0;
for (let r = 0; r < ROWS; r++) {
  for (let c = 0; c < COLS; c++) {
    const idx = (r * COLS + c) % TOPICS.length;
    const t = TOPICS[idx];

    const el = document.createElement('div');
    el.className = 'card';
    el.innerHTML = cardHTML(t, idx);
    el.dataset.idx = idx;

    const obj = new CSS3DObject(el);
    const phi = THREE.MathUtils.degToRad(LATS[r]);
    const theta = THREE.MathUtils.degToRad(c * STEP + (r % 2) * (STEP / 2));
    obj.position.set(
      RADIUS * Math.cos(phi) * Math.sin(theta),
      RADIUS * Math.sin(phi),
      -RADIUS * Math.cos(phi) * Math.cos(theta),
    );
    obj.lookAt(0, 0, 0);
    scene.add(obj);
    cardObjects.push({ el, topic: t, idx });
    slot++;
  }
}

/* ================= DRAG / EASING (lenis-style) ================= */

let lon = 0, lat = 0;                 // current view angles
let tLon = 0, tLat = 0;               // targets (eased toward)
let vLon = 0, vLat = 0;               // inertia velocity
let dragging = false;
let downX = 0, downY = 0, lastX = 0, lastY = 0, moved = 0;
const SENS = 0.14;
const EASE = 0.065;
const LAT_MAX = 42;

document.addEventListener('pointerdown', (e) => {
  if (!(e.target instanceof Element)) return;
  if (e.target.closest('#topbar, #mainNav, #viewToggle, #filterWrap, #detail, #listView, #aboutView')) return;
  dragging = true;
  moved = 0;
  downX = lastX = e.clientX;
  downY = lastY = e.clientY;
  vLon = vLat = 0;
  document.body.classList.remove('dragging');
});

document.addEventListener('pointermove', (e) => {
  if (!dragging) return;
  const dx = e.clientX - lastX;
  const dy = e.clientY - lastY;
  lastX = e.clientX;
  lastY = e.clientY;
  moved += Math.abs(dx) + Math.abs(dy);
  if (moved > 6) document.body.classList.add('dragging');
  tLon -= dx * SENS;
  tLat += dy * SENS;
  tLat = THREE.MathUtils.clamp(tLat, -LAT_MAX, LAT_MAX);
  vLon = -dx * SENS;                  // remember last delta for inertia
  vLat = dy * SENS;
});

document.addEventListener('pointerup', () => {
  dragging = false;
  setTimeout(() => document.body.classList.remove('dragging'), 30);
});

document.addEventListener('wheel', (e) => {
  if (document.getElementById('detail').classList.contains('open')) return;
  if (document.getElementById('listView').classList.contains('open')) return;
  tLon += e.deltaX * 0.045;
  tLat = THREE.MathUtils.clamp(tLat + e.deltaY * 0.045, -LAT_MAX, LAT_MAX);
}, { passive: true });

let idle = true;                       // gentle drift until first interaction
['pointerdown', 'wheel', 'keydown'].forEach((ev) =>
  document.addEventListener(ev, () => { idle = false; }, { once: true }));

// debug handle for devtools verification
window.__BB = () => ({ lon: +lon.toFixed(2), lat: +lat.toFixed(2), tLon: +tLon.toFixed(2), tLat: +tLat.toFixed(2), dragging });

function animate() {
  requestAnimationFrame(animate);

  if (idle) tLon += 0.018;

  if (!dragging) {                     // inertia glide after release
    tLon += vLon;
    tLat = THREE.MathUtils.clamp(tLat + vLat, -LAT_MAX, LAT_MAX);
    vLon *= 0.94;
    vLat *= 0.94;
  }

  lon += (tLon - lon) * EASE;          // damped easing — the "lenis" feel
  lat += (tLat - lat) * EASE;

  const phi = THREE.MathUtils.degToRad(lat);
  const theta = THREE.MathUtils.degToRad(lon);
  camera.lookAt(
    Math.cos(phi) * Math.sin(theta),
    Math.sin(phi),
    -Math.cos(phi) * Math.cos(theta),
  );
  renderer.render(scene, camera);
}
animate();

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

/* ================= OFFER (sales page tiers) ================= */

// TODO: swap for your real checkout / booking links (Stripe, GoHighLevel, Calendly).
// Use one URL or map per tier via the data-tier attribute on each CTA.
const CHECKOUT_URL = '#';

// Three tiers derived from each playbook: DIY → done-with-you → done-for-you.
// Prices are placeholders — edit freely.
function buildOffer(t) {
  return [
    {
      name: 'THE PLAYBOOK', kind: 'DO IT YOURSELF', price: '$49', note: 'one-time',
      tagline: 'The full system, documented. Run it at your own pace.',
      features: [
        `The complete ${t.title} playbook (PDF + templates)`,
        'Step-by-step SOPs and swipe files',
        'Lifetime updates as the system evolves',
      ],
      cta: 'GET THE PLAYBOOK',
    },
    {
      name: 'DONE WITH YOU', kind: 'BUILD IT TOGETHER', price: '$499', note: '4-week sprint', featured: true,
      tagline: 'We build it with you, live — so it ships instead of stalling.',
      features: [
        'Everything in The Playbook',
        '4 × 1:1 implementation calls',
        'Your system mapped to your business',
        'Async support for the full sprint',
      ],
      cta: 'START THE SPRINT',
    },
    {
      name: 'DONE FOR YOU', kind: 'WE DEPLOY IT', price: 'From $2,500', note: 'custom scope',
      tagline: 'Hands off. We design, build and wire the whole thing.',
      features: [
        'We build & deploy the entire system',
        'AI + automation wired into your stack',
        'Full handover + 60-day optimization',
        'Priority line to the lab',
      ],
      cta: 'BOOK A BUILD CALL',
    },
  ];
}

function offerHTML(t) {
  return buildOffer(t).map((o) => `
    <div class="tier${o.featured ? ' featured' : ''}">
      ${o.featured ? '<span class="tier-badge">MOST POPULAR</span>' : ''}
      <span class="tier-kind mono">${o.kind}</span>
      <h3 class="tier-name">${o.name}</h3>
      <p class="tier-price">${o.price}<span class="tier-note"> / ${o.note}</span></p>
      <p class="tier-tagline">${o.tagline}</p>
      <ul class="tier-features">${o.features.map((f) => `<li>${f}</li>`).join('')}</ul>
      <a class="tier-cta" href="${CHECKOUT_URL}" data-tier="${o.name}">${o.cta}</a>
    </div>`).join('');
}

/* ================= DETAIL PAGE ================= */

const detail = document.getElementById('detail');
const detailHero = document.getElementById('detailHero');
const detailContent = document.getElementById('detailContent');
const detailScrim = document.getElementById('detailScrim');
let currentIdx = -1;

function fillDetail(t, idx) {
  document.getElementById('dSeries').textContent = `[ ${t.series} ]`;
  document.getElementById('dIndex').textContent = `VALUE DROP ${String(idx + 1).padStart(2, '0')} / ${TOPICS.length}`;
  document.getElementById('dTitle').textContent = t.title;
  document.getElementById('dTags').innerHTML = t.tags.map((x) => `<i>${x}</i>`).join('') + `<i>${t.year}</i>`;
  document.getElementById('dDesc').textContent = t.desc;
  document.getElementById('dBullets').innerHTML = t.bullets.map((b) => `<li>${b}</li>`).join('');
  document.getElementById('dOffers').innerHTML = offerHTML(t);
  detailContent.style.setProperty('--page-accent', t.art.accent);  // theme tiers per card
  detailHero.innerHTML = artHTML(t.art, true);
  const form = document.getElementById('dForm');
  form.classList.remove('done');
  form.reset();
  document.getElementById('dFormDone').classList.remove('show');
}

function openDetail(idx, fromRect) {
  if (detail.classList.contains('open')) return;
  const t = TOPICS[idx];
  currentIdx = idx;
  fillDetail(t, idx);

  // flying card: clone of the art that expands from the clicked card to fullscreen
  const fly = document.createElement('div');
  fly.id = 'flyCard';
  fly.innerHTML = artHTML(t.art);
  document.body.appendChild(fly);

  const r = fromRect || { left: innerWidth / 2 - 200, top: innerHeight / 2 - 160, width: 400, height: 320 };
  gsap.set(fly, { left: r.left, top: r.top, width: r.width, height: r.height, opacity: 1 });

  detail.classList.add('open');
  gsap.set([detailScrim, detailContent], { opacity: 0 });
  gsap.set(detailHero, { opacity: 0 });

  const tl = gsap.timeline({
    onComplete() { fly.remove(); },
  });
  tl.to(fly, { left: 0, top: 0, width: innerWidth, height: innerHeight, borderRadius: 0, duration: 0.85, ease: 'expo.inOut' })
    .to(detailHero, { opacity: 1, duration: 0.01 })
    .to(fly, { opacity: 0, duration: 0.25 }, '<')
    .to(detailScrim, { opacity: 1, duration: 0.5, ease: 'power2.out' }, '-=0.15')
    .fromTo(detailContent, { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, '-=0.25')
    .fromTo('#detailContent > *', { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.055, ease: 'power3.out' }, '-=0.45');

  blip(660);
}

function closeDetail() {
  const tl = gsap.timeline({
    onComplete() {
      detail.classList.remove('open');
      detailHero.innerHTML = '';
    },
  });
  tl.to(detailContent, { opacity: 0, y: 30, duration: 0.35, ease: 'power2.in' })
    .to([detailScrim, detailHero], { opacity: 0, duration: 0.45, ease: 'power2.inOut' }, '-=0.1')
    .set(detailHero, { opacity: 1 });
  blip(440);
}

document.getElementById('detailBack').addEventListener('click', closeDetail);
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && detail.classList.contains('open')) closeDetail();
});

document.getElementById('dNext').addEventListener('click', () => {
  const next = (currentIdx + 1) % TOPICS.length;
  currentIdx = next;
  const t = TOPICS[next];
  gsap.to(detailContent, {
    opacity: 0, y: 24, duration: 0.28, ease: 'power2.in',
    onComplete() {
      fillDetail(t, next);
      gsap.fromTo(detailContent, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.45, ease: 'power3.out' });
    },
  });
  blip(720);
});

document.getElementById('dForm').addEventListener('submit', (e) => {
  e.preventDefault();
  e.currentTarget.classList.add('done');
  document.getElementById('dFormDone').classList.add('show');
  blip(880);
});

/* offer tier CTAs (placeholder checkout links) */
document.getElementById('dOffers').addEventListener('click', (e) => {
  const cta = e.target.closest('.tier-cta');
  if (!cta) return;
  blip(820);
  // Until CHECKOUT_URL points at a real link, swallow the '#' jump.
  if (cta.getAttribute('href') === '#') e.preventDefault();
});

/* card clicks (drag-aware) */
cardObjects.forEach(({ el, idx }) => {
  const inner = el.querySelector('.card-inner');
  inner.addEventListener('click', () => {
    if (moved > 6) return;                       // it was a drag, not a tap
    openDetail(Number(el.dataset.idx), inner.getBoundingClientRect());
  });
  inner.addEventListener('pointerenter', () => blip(520, 0.012));
});

/* ================= LIST VIEW / NAV / FILTER ================= */

const listView = document.getElementById('listView');
const aboutView = document.getElementById('aboutView');
const lvRows = document.getElementById('lvRows');

TOPICS.forEach((t, i) => {
  const row = document.createElement('div');
  row.className = 'lv-row';
  row.innerHTML = `<span class="lv-num">${String(i + 1).padStart(2, '0')}</span>
    <span class="lv-title">${t.title}</span>
    <span class="lv-tags">${t.tags.join(' / ')} — ${t.series}</span>
    <span class="lv-year">${t.year}</span>`;
  row.addEventListener('click', () => openDetail(i, row.getBoundingClientRect()));
  lvRows.appendChild(row);
});

const btnGrid = document.getElementById('btnGrid');
const btnList = document.getElementById('btnList');

function setView(list) {
  btnGrid.classList.toggle('active', !list);
  btnList.classList.toggle('active', list);
  listView.classList.toggle('open', list);
  if (list) gsap.fromTo('.lv-row', { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.4, stagger: 0.035, ease: 'power2.out' });
}
btnGrid.addEventListener('click', () => setView(false));
btnList.addEventListener('click', () => setView(true));

document.querySelectorAll('.nav-item').forEach((b) => {
  b.addEventListener('click', () => {
    document.querySelectorAll('.nav-item').forEach((x) => x.classList.remove('active'));
    b.classList.add('active');
    const nav = b.dataset.nav;
    aboutView.classList.toggle('open', nav === 'about');
    if (nav === 'work') setView(false);
    if (nav === 'about') {
      listView.classList.remove('open');
      gsap.fromTo('.about-inner > *', { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.07, ease: 'power3.out' });
    }
    if (nav === 'contact') {
      aboutView.classList.remove('open');
      document.getElementById('letsTalk').click();
    }
    blip(600);
  });
});

document.getElementById('letsTalk').addEventListener('click', (e) => {
  e.preventDefault();
  location.href = 'mailto:bodegasrona@gmail.com?subject=Let%27s%20talk%20—%20scaling%20with%20AI';
});

/* filter */
const filterPanel = document.getElementById('filterPanel');
FILTER_CATS.forEach((cat) => {
  const b = document.createElement('button');
  b.textContent = cat;
  if (cat === 'ALL') b.classList.add('on');
  b.addEventListener('click', () => {
    filterPanel.querySelectorAll('button').forEach((x) => x.classList.remove('on'));
    b.classList.add('on');
    cardObjects.forEach(({ el, topic }) => {
      const hit = cat === 'ALL' || topic.tags.includes(cat);
      el.classList.toggle('dimmed', !hit);
      gsap.to(el, { opacity: hit ? 1 : 0.06, duration: 0.5, ease: 'power2.out' });
    });
    blip(560);
  });
  filterPanel.appendChild(b);
});
document.getElementById('filterBtn').addEventListener('click', () => {
  filterPanel.classList.toggle('open');
  blip(500);
});

/* ================= CLOCKS / SOUND / INTRO ================= */

function tickClocks() {
  const fmt = (tz) => new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: tz }).format(new Date());
  document.getElementById('clockMNL').textContent = fmt('Asia/Manila');
  document.getElementById('clockNYC').textContent = fmt('America/New_York');
}
tickClocks();
setInterval(tickClocks, 1000);

let soundOn = true;
let actx = null;
function blip(freq = 600, vol = 0.03) {
  if (!soundOn) return;
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    const o = actx.createOscillator();
    const g = actx.createGain();
    o.type = 'sine';
    o.frequency.value = freq;
    g.gain.setValueAtTime(vol, actx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, actx.currentTime + 0.09);
    o.connect(g).connect(actx.destination);
    o.start();
    o.stop(actx.currentTime + 0.1);
  } catch (_) { /* audio blocked until first gesture — fine */ }
}
document.getElementById('soundToggle').addEventListener('click', () => {
  soundOn = !soundOn;
  document.getElementById('soundState').textContent = soundOn ? 'ON' : 'OFF';
  if (soundOn) blip(700);
});

/* intro */
const loader = document.getElementById('loader');
gsap.to('#loaderText', { opacity: 0.3, repeat: -1, yoyo: true, duration: 0.5 });
let introStarted = false;
function intro() {
  if (introStarted) return;
  introStarted = true;
  gsap.timeline()
    .to(loader, { opacity: 0, duration: 0.6, delay: 0.3, ease: 'power2.inOut', onComplete: () => loader.remove() })
    .fromTo('.card-inner', { opacity: 0, scale: 0.55 }, { opacity: 1, scale: 1, duration: 1.1, stagger: { each: 0.02, from: 'random' }, ease: 'expo.out' }, '-=0.25')
    .fromTo('#topbar, #mainNav, #viewToggle, #filterWrap', { opacity: 0, y: -14 }, { opacity: 1, y: 0, duration: 0.7, stagger: 0.08, ease: 'power3.out' }, '-=0.8');
}
// 'load' may already have fired by the time this module (and three.js) finishes loading
if (document.readyState === 'complete') intro();
else addEventListener('load', intro);
