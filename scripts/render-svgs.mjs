// Renders every static SVG on the profile README (light and dark) and writes README.md around them.
// The Writing block between the WRITING markers is kept as is; render-writing.mjs owns it.
// usage: npm i --prefix scripts && node scripts/render-svgs.mjs
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { THEMES, PAD, esc, n, measure, wrap, delay, box, frame, svg, card, section, chip, writeAll, picture, ROOT } from "./lib.mjs";

const SITE = "https://mehmettalhairmak.me";

// ---------- hero ----------

const SPAN = [
  ["Device", "Swift · Kotlin · BLE"],
  ["Mobile", "React Native · Expo"],
  ["Web", "React · Next.js"],
  ["Services", "Node.js · NestJS · Go"],
  ["Messaging", "RabbitMQ · BullMQ"],
  ["Data & cloud", "PostgreSQL · AWS · GCP"],
];

const HERO_ALT =
  "Mehmet Talha Irmak, Full Stack Engineer, Turkey. I build systems that hold up. Self-taught and TypeScript-focused; 4+ years shipping production apps end to end, now at Neon Apps, Istanbul. Working span from device to cloud: Swift, Kotlin and BLE; React Native and Expo; React and Next.js; Node.js, NestJS and Go; RabbitMQ and BullMQ; PostgreSQL, AWS and GCP.";

function hero(t) {
  const W = 1200, H = 580, R = W - PAD;
  const size = 112, ls = -size * 0.055;
  const line2 = "that hold up";
  const dotX = PAD + measure(line2, size, ls);

  // Title block, top right.
  const tb = { x: 868, y: 150, w: R - 868, row: 48 };
  if (PAD + measure("I build systems", size, ls) > tb.x - 24) throw new Error("headline runs into the title block");
  const cell = (x, y, k, v, d) =>
    `<g class="up" ${delay(d)}><text x="${x + 14}" y="${y + 18}" class="m" font-size="10" letter-spacing="1.5" fill="${t.muted}">${k}</text><text x="${x + 14}" y="${y + 38}" class="s" font-size="16" fill="${t.ink}">${esc(v)}</text></g>`;
  const half = tb.x + tb.w / 2;
  const titleBlock = `
${box(tb.x, tb.y, tb.w, tb.row * 3, `class="draw" fill="none" stroke="${t.ink}" ${delay(0.6)}`)}
<path d="M${tb.x} ${tb.y + tb.row}H${R}M${tb.x} ${tb.y + tb.row * 2}H${R}M${half} ${tb.y + tb.row * 2}v${tb.row}" pathLength="1" class="draw" fill="none" stroke="${t.ink}" stroke-opacity=".6" ${delay(0.9)}/>
${cell(tb.x, tb.y, "NOW", "Neon Apps · Istanbul", 1.1)}
<g class="pop" ${delay(1.6)}><circle cx="${R - 20}" cy="${tb.y + 24}" r="4" fill="${t.acc}"/><circle cx="${R - 20}" cy="${tb.y + 24}" r="4" fill="${t.acc}" class="pulse" ${delay(1.6)}/></g>
${cell(tb.x, tb.y + tb.row, "IN PRODUCTION", "4+ years, end to end", 1.2)}
${cell(tb.x, tb.y + tb.row * 2, "REV", "2026.10", 1.3)}
${cell(half, tb.y + tb.row * 2, "SCALE", "1 : 1", 1.35)}`;

  // Working-span ruler; a packet runs device → cloud and each station flashes as it passes.
  const ry = 476, step = (R - PAD) / SPAN.length;
  const drawStart = 1.0, drawDur = 1.2, loopStart = 2.6, period = 4, travel = 3;
  const ticks = SPAN.map((_, i) => PAD + i * step).concat(R);
  const tickEls = ticks
    .map((x, i) => {
      const d = drawStart + (drawDur * i) / SPAN.length;
      return `<g class="pop" ${delay(d)}><path d="M${n(x)} ${ry - 7}v14" stroke="${t.ink}" stroke-width="1.5" class="flash" style="animation-delay:${n(loopStart + (travel * i) / SPAN.length)}s"/></g>`;
    })
    .join("");
  const labels = SPAN.map(([label, tools], i) => {
    const x = n(PAD + i * step + 10);
    return `<g class="up" ${delay(drawStart + 0.15 + (drawDur * i) / SPAN.length)}><text x="${x}" y="${ry + 36}" class="s" font-size="19" font-weight="600" fill="${t.ink}">${esc(label)}</text><text x="${x}" y="${ry + 60}" class="m" font-size="12.5" fill="${t.muted}">${esc(tools)}</text></g>`;
  }).join("");

  const css = `
.flash{animation:flash ${period}s linear infinite}
@keyframes flash{0%{stroke:${t.acc}}12%,100%{stroke:${t.ink}}}
.pk{animation:pk ${period}s linear infinite}
@keyframes pk{0%{transform:translateX(0);opacity:0}3%{opacity:1}${(travel / period) * 100}%{transform:translateX(${R - PAD}px);opacity:1}${(travel / period) * 100 + 6}%,100%{transform:translateX(${R - PAD}px);opacity:0}}
.trail{stroke-dasharray:1;animation:trail ${period}s linear infinite}
@keyframes trail{0%{stroke-dashoffset:1;opacity:1}${(travel / period) * 100}%{stroke-dashoffset:0;opacity:1}${(travel / period) * 100 + 12}%,100%{stroke-dashoffset:0;opacity:0}}
@media (prefers-reduced-motion:reduce){.pk,.trail{display:none}}`;

  const body = `${frame(t, W, H, 3)}
<g class="up" ${delay(0.1)}><text x="${PAD}" y="78" class="m" font-size="16" fill="${t.muted}">Mehmet Talha Irmak</text><text x="${R}" y="78" text-anchor="end" class="m" font-size="16" fill="${t.muted}">Full Stack Engineer · Turkey</text></g>
<g class="s" font-size="${size}" font-weight="600" letter-spacing="${n(ls)}" fill="${t.ink}">
<text x="${PAD}" y="236" class="up" ${delay(0.25)}>I build systems</text>
<text x="${PAD}" y="350" class="up" ${delay(0.4)}>${line2}</text>
<text x="${n(dotX)}" y="350" fill="${t.acc}" class="pop" ${delay(1.0)}>.</text>
</g>
${titleBlock}
<g class="up m" font-size="14" fill="${t.muted}" ${delay(drawStart)}><text x="${PAD}" y="${ry - 22}">Working span</text><text x="${R}" y="${ry - 22}" text-anchor="end">device → cloud</text></g>
<path d="M${PAD} ${ry}H${R}" pathLength="1" stroke="${t.ink}" stroke-width="1.5" class="draw" style="animation-delay:${drawStart}s;animation-duration:${drawDur}s"/>
<path d="M${PAD} ${ry}H${R}" pathLength="1" stroke="${t.acc}" stroke-width="2.5" class="trail loop" ${delay(loopStart)}/>
${tickEls}
<g transform="translate(${PAD} ${ry})"><g class="pk loop" ${delay(loopStart)}><rect x="-6" y="-6" width="12" height="12" transform="rotate(45)" fill="${t.acc}"/></g></g>
${labels}`;

  return svg({ W, H, css, body, label: HERO_ALT });
}

// ---------- fig. 1: request path ----------

const FIG_ALT =
  "Figure 1, the shape of most things I ship: a client calls the API and gets an answer in under 50 ms; the API writes to storage and enqueues slow work on RabbitMQ or BullMQ; background workers consume the queue and persist results to PostgreSQL, Redis, DynamoDB or S3.";

function requestPath(t) {
  const W = 1200, H = 440, R = W - PAD;
  const T = 6, D = 2.2; // loop period, and when the loop starts after the entry animation
  const pct = (s) => n((s / T) * 100);

  const nw = 200, nh = 110, ny = 128, gap = (R - PAD - 4 * nw) / 3;
  const nx = [0, 1, 2, 3].map((i) => n(PAD + i * (nw + gap)));
  const NODES = [
    ["01 CLIENT", "Mobile & web", "React Native · Next.js"],
    ["02 API", "Services", "NestJS · Go · Node.js"],
    ["03 QUEUE", "Broker", "RabbitMQ · BullMQ"],
    ["04 WORKERS", "Jobs", "Go · Node.js · Lambda"],
  ];
  const data = { x: nx[1], y: 318, w: R - nx[1], h: 72 };

  const ySend = ny + 34, yMid = ny + 54, yBack = ny + 74, yBot = ny + nh;
  const xApi = nx[1] + 100, xJobs = nx[3] + 100;

  // Every timed event in the loop, in seconds from its start.
  const P = {
    req: [[nx[0] + nw, ySend], [nx[1], ySend], 0, 0.5],
    write: [[xApi, yBot], [xApi, data.y], 0.6, 1.0],
    enq: [[nx[1] + nw, yMid], [nx[2], yMid], 0.7, 1.2],
    res: [[nx[1], yBack], [nx[0] + nw, yBack], 1.1, 1.6],
    consume: [[nx[2] + nw, yMid], [nx[3], yMid], 3.0, 3.5],
    persist: [[xJobs, yBot], [xJobs, data.y], 4.7, 5.2],
  };
  const HITS = [
    ["api", nx[1], ny, nw, nh, 0.5], ["data1", data.x, data.y, data.w, data.h, 1.0],
    ["queue", nx[2], ny, nw, nh, 1.2], ["client", nx[0], ny, nw, nh, 1.6],
    ["jobs", nx[3], ny, nw, nh, 3.5], ["data2", data.x, data.y, data.w, data.h, 5.2],
  ];

  const kf = [];
  for (const [id, [[x1, y1], [x2, y2], t0, t1]] of Object.entries(P)) {
    const a = pct(t0), b = pct(t1), at = (x, y) => `transform:translate(${x}px,${y}px)`;
    kf.push(`@keyframes p-${id}{0%,${a}%{${at(x1, y1)};opacity:0}${n(a + 0.01)}%{opacity:1}${b}%{${at(x2, y2)};opacity:1}${n(b + 1.5)}%,100%{${at(x2, y2)};opacity:0}}`);
    kf.push(`.p-${id}{animation:p-${id} ${T}s linear ${D}s infinite}`);
  }
  for (const [id, , , , , at] of HITS) kf.push(`.h-${id}{animation:hit ${T}s linear ${n(D + at)}s infinite}`);
  // Opacity windows: the queued message, the 50 ms label, the job's progress bar.
  const win = (id, t0, t1) =>
    `@keyframes w-${id}{0%,${pct(t0)}%{opacity:0}${n(pct(t0) + 0.5)}%,${pct(t1)}%{opacity:1}${n(pct(t1) + 2)}%,100%{opacity:0}}.w-${id}{animation:w-${id} ${T}s linear ${D}s infinite}`;
  kf.push(win("queued", 1.2, 3.0), win("fast", 1.6, 2.6));
  kf.push(`@keyframes w-bar{0%,${pct(3.5)}%{stroke-dashoffset:1;opacity:1}${pct(4.7)}%{stroke-dashoffset:0;opacity:1}${pct(5.0)}%,100%{stroke-dashoffset:0;opacity:0}}.w-bar{stroke-dasharray:1;animation:w-bar ${T}s linear ${D}s infinite}`);

  const css = `
@keyframes hit{0%{opacity:1}10%,100%{opacity:0}}
${kf.join("\n")}`;

  const node = ([kind, title, sub], x, i) => `
${box(x, ny, nw, nh, `class="draw" fill="none" stroke="${t.ink}" stroke-width="1.5" ${delay(0.2 + i * 0.12)}`)}
<g class="up" ${delay(0.5 + i * 0.12)}><text x="${x + 16}" y="${ny + 26}" class="m" font-size="10.5" letter-spacing="1.5" fill="${t.muted}">${kind}</text><text x="${x + 16}" y="${ny + 60}" class="s" font-size="22" font-weight="600" fill="${t.ink}">${esc(title)}</text><text x="${x + 16}" y="${ny + 84}" class="m" font-size="12" fill="${t.muted}">${esc(sub)}</text></g>`;

  // Edges: sync solid, async dashed. Each draws in, then its arrowhead pops.
  const edge = (x1, y1, x2, y2, async, d) => {
    const ang = Math.atan2(y2 - y1, x2 - x1), a = 7;
    const head = `M${n(x2 - a * Math.cos(ang - 0.5))} ${n(y2 - a * Math.sin(ang - 0.5))}L${x2} ${y2}L${n(x2 - a * Math.cos(ang + 0.5))} ${n(y2 - a * Math.sin(ang + 0.5))}`;
    const line = async
      ? `<path d="M${x1} ${y1}L${x2} ${y2}" stroke="${t.ink}" stroke-width="1.5" stroke-dasharray="5 5" class="up" ${delay(d)}/>`
      : `<path d="M${x1} ${y1}L${x2} ${y2}" pathLength="1" stroke="${t.ink}" stroke-width="1.5" class="draw" style="animation-delay:${d}s;animation-duration:.5s"/>`;
    return `${line}<path d="${head}" fill="none" stroke="${t.ink}" stroke-width="1.5" class="pop" ${delay(d + 0.4)}/>`;
  };
  const tag = (x, y, s, d, anchor = "middle") => `<text x="${n(x)}" y="${y}" text-anchor="${anchor}" class="m up" font-size="11" fill="${t.muted}" ${delay(d)}>${s}</text>`;
  const mid = (a, b) => (a + b) / 2;

  const edges = `
${edge(nx[0] + nw, ySend, nx[1], ySend, false, 1.1)}
${edge(nx[1], yBack, nx[0] + nw, yBack, false, 1.2)}
<text x="${n(mid(nx[0] + nw, nx[1]))}" y="${yMid + 4}" text-anchor="middle" class="m up" font-size="12" fill="${t.ink}" ${delay(1.5)}>&lt; 50 ms</text>
<g class="loop w-fast"><text x="${n(mid(nx[0] + nw, nx[1]))}" y="${yMid + 4}" text-anchor="middle" class="m" font-size="12" fill="${t.acc}">&lt; 50 ms</text></g>
${edge(nx[1] + nw, yMid, nx[2], yMid, true, 1.3)}${tag(mid(nx[1] + nw, nx[2]), yMid - 10, "enqueue", 1.5)}
${edge(nx[2] + nw, yMid, nx[3], yMid, true, 1.4)}${tag(mid(nx[2] + nw, nx[3]), yMid - 10, "consume", 1.6)}
${edge(xApi, yBot, xApi, data.y, false, 1.5)}${tag(xApi + 10, 284, "write", 1.7, "start")}
${edge(xJobs, yBot, xJobs, data.y, true, 1.6)}${tag(xJobs + 10, 284, "persist", 1.8, "start")}`;

  // Queue depth cells (one lights while a message waits) and the job progress bar.
  const cells = [0, 1, 2, 3, 4].map((i) => `<rect x="${nx[2] + nw - 16 - (i + 1) * 12 + 4}" y="${ny + 18}" width="8" height="8" fill="none" stroke="${t.muted}"/>`).join("");
  const extras = `
<g class="up" ${delay(0.9)}>${cells}</g>
<rect x="${nx[2] + nw - 16 - 12 + 4}" y="${ny + 18}" width="8" height="8" fill="${t.acc}" class="loop w-queued"/>
<path d="M${nx[3] + 16} ${ny + 98}H${nx[3] + nw - 16}" stroke="${t.muted}" stroke-opacity=".35" stroke-width="3" class="up" ${delay(0.9)}/>
<path d="M${nx[3] + 16} ${ny + 98}H${nx[3] + nw - 16}" pathLength="1" stroke="${t.acc}" stroke-width="3" class="loop w-bar"/>`;

  const packets = Object.keys(P).map((id) => `<rect x="-5" y="-5" width="10" height="10" fill="${t.acc}" class="loop p-${id}"/>`).join("");
  const hits = HITS.map(([id, x, y, w, h]) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="${t.acc}" stroke-width="2.5" class="loop h-${id}"/>`).join("");

  const legendX = R - 7.2 * 5; // "async" in 12px Plex Mono is 5 × 7.2 wide
  const body = `${frame(t, W, H, 2)}
<g class="up m" font-size="14" fill="${t.muted}" ${delay(0.1)}>
<text x="${PAD}" y="78" letter-spacing="1.5">FIG. 1 — THE SHAPE OF MOST THINGS I SHIP</text>
<path d="M${legendX - 150} 73h28" stroke="${t.ink}" stroke-width="1.5"/><text x="${legendX - 114}" y="78" font-size="12">sync</text>
<path d="M${legendX - 46} 73h28" stroke="${t.ink}" stroke-width="1.5" stroke-dasharray="5 5"/><text x="${R}" y="78" font-size="12" text-anchor="end">async</text>
</g>
${NODES.map((nd, i) => node(nd, nx[i], i)).join("")}
${box(data.x, data.y, data.w, data.h, `class="draw" fill="none" stroke="${t.ink}" stroke-width="1.5" ${delay(0.7)}`)}
<g class="up" ${delay(1.0)}><text x="${data.x + 16}" y="${data.y + 26}" class="m" font-size="10.5" letter-spacing="1.5" fill="${t.muted}">05 DATA</text><text x="${data.x + 16}" y="${data.y + 54}" class="s" font-size="22" font-weight="600" fill="${t.ink}">Storage</text><text x="${data.x + 130}" y="${data.y + 53}" class="m" font-size="12" fill="${t.muted}">PostgreSQL · Redis · DynamoDB · S3</text></g>
${edges}
${extras}
<g class="up m" font-size="12" fill="${t.muted}" ${delay(1.9)}>
<text x="${PAD}" y="${data.y + 28}"><tspan fill="${t.acc}">§2</tspan> Slow work off the request path.</text>
<text x="${PAD}" y="${data.y + 54}"><tspan fill="${t.acc}">§3</tspan> Events over entanglement.</text>
</g>
${hits}
${packets}`;

  return svg({ W, H, css, body, label: FIG_ALT });
}

// ---------- cards ----------

const PROJECTS = [
  { slug: "dotquit", name: "DotQuit", period: "Oct 2026", desc: "Native macOS utility that quits apps when their last window closes." },
  { slug: "snapshade", name: "SnapShade", period: "Mar 2026", archived: true, basedOn: "03", desc: "AI hairstyle transformation app on the BananaUltra architecture, narrowed to a single concept." },
  { slug: "bananaultra", name: "BananaUltra", period: "Dec 2025", archived: true, explorer: true, desc: "Generative AI image platform, launched and monetised independently." },
  { slug: "yuksi", name: "Yuksi", period: "Dec 2025 – Feb 2026", explorer: true, desc: "Uber-style on-demand logistics SaaS — mobile app, CRM and an event-driven backend." },
  { slug: "8thsense", name: "8thSense", period: "Jun 2022 – Jul 2025", desc: "Enterprise IoT platform — cloud infrastructure and a real-time telemetry charting engine." },
  { slug: "buscalia", name: "Buscalia", period: "Oct – Nov 2023", desc: "Real-time fleet monitoring dashboard for a Spanish logistics-tech startup." },
  { slug: "depremyardim", name: "depremyardim", period: "Feb 2023", desc: "Crisis platform for rescue requests after the 6 February 2023 earthquakes." },
];

const SYSTEMS = [
  { no: "S1", repo: "social-engine-nest", name: "Social Engine", stack: "NestJS", explorer: true, desc: "NestJS social backend that keeps HTTP responses under 50ms." },
  { no: "S2", repo: "realtime-messaging-api-node", name: "Realtime Messaging API", stack: "Node.js · Socket.IO", desc: "REST + Socket.IO messaging with presence, retries and scheduled messages." },
  { no: "S3", repo: "rss-aggregator-go", name: "RSS Aggregator", stack: "Go", desc: "Concurrent Go scraper with a WebSocket push hub." },
  { no: "S4", repo: "nestjs-media-guard", name: "Secure Media Guard", stack: "NestJS", desc: "NestJS microservice for authorised, multi-variant image delivery." },
];

const PRINCIPLES = [
  ["Money and state change atomically, or not at all.", "BananaUltra › Edge Functions", "/work/bananaultra/edge"],
  ["Keep slow work off the request path.", "Social Engine › BullMQ", "/work/social-engine/queue"],
  ["Events over entanglement.", "Yuksi › Event pipeline", "/work/yuksi/mq"],
  ["A frame budget is a real budget.", "8thSense", "/work/8thsense"],
  ["Make the toolchain boring.", "8thSense", "/work/8thsense"],
  ["Reduce friction, then reduce cost.", "BananaUltra › Cloudflare R2", "/work/bananaultra/r2"],
];

const pad2 = (i) => String(i).padStart(2, "0");

function projectCard(t, p, i) {
  const tags = [];
  if (p.explorer) tags.push({ diamond: true, text: "ARCHITECTURE EXPLORER" });
  if (p.basedOn) tags.push({ lead: "↳", text: `SHARES ${p.basedOn}'S ARCHITECTURE` });
  const status = [p.period, p.archived && "archived", p.explorer && "explorable architecture on the site", p.basedOn && `shares project ${p.basedOn}'s architecture`].filter(Boolean).join("; ");
  return card(t, {
    W: i === 0 ? 1200 : 600, H: i === 0 ? undefined : 300,
    no: `${pad2(i + 1)} / ${pad2(PROJECTS.length)}`, meta: p.period, title: p.name, desc: p.desc, tags,
    link: `/work/${p.slug}`, archived: p.archived, label: `${pad2(i + 1)}. ${p.name}: ${p.desc} ${status}.`,
  });
}

const systemCard = (t, s) =>
  card(t, {
    H: 280, no: s.no, meta: s.stack, title: s.name, titleSize: s.name.length > 16 ? 36 : 44, desc: s.desc,
    tags: s.explorer ? [{ diamond: true, text: "EXPLORER ON THE SITE" }] : [],
    link: `nodemt/${s.repo}`, label: `${s.no}. ${s.name}, ${s.stack}: ${s.desc} Source on GitHub at nodemt/${s.repo}.`,
  });

const principleCard = (t, [text, where], i) =>
  card(t, { H: 220, no: `§${i + 1}`, meta: "TESTED IN", title: text, titleSize: 28, link: where, label: `§${i + 1}. ${text} Tested in ${where}.` });

// ---------- bill of materials ----------

const BOM = [
  ["Languages", ["TypeScript", "JavaScript", "Go", "Python", "Swift", "Kotlin", "SQL"]],
  ["Mobile & web", ["React Native", "Expo", "EAS", "React", "Next.js", "Zustand", "Redux Toolkit", "React Query", "D3.js"]],
  ["Services", ["Node.js", "Express", "NestJS", "Go (Gin)", "FastAPI"]],
  ["Messaging", ["RabbitMQ", "BullMQ", "WebSocket", "Socket.IO", "SQS", "SNS"]],
  ["Data", ["PostgreSQL", "MySQL", "MongoDB", "Redis", "DynamoDB", "ElasticSearch"]],
  ["AWS", [
    ["IaC & ops", ["CDK", "CloudFormation", "CloudWatch"]],
    ["Compute", ["Lambda", "EC2", "Amplify"]],
    ["APIs & auth", ["API Gateway", "AppSync", "Cognito"]],
    ["Storage", ["S3", "RDS", "DynamoDB"]],
    ["Messaging", ["SNS", "SES"]],
  ]],
  ["Cloud", ["Google Cloud Run", "Terraform", "Docker", "Cloudflare R2"]],
  ["Platforms", ["Supabase", "Firebase", "Appwrite", "RevenueCat", "Sentry", "Mixpanel"]],
];
const qtyOf = (parts) => (Array.isArray(parts[0]) ? parts.reduce((s, [, ps]) => s + ps.length, 0) : parts.length);
const BOM_TOTAL = BOM.reduce((s, [, parts]) => s + qtyOf(parts), 0);
const BOM_ALT = "Bill of materials. " + BOM.map(([asm, parts]) => `${asm}: ${Array.isArray(parts[0]) ? parts.map(([g, ps]) => `${g} ${ps.join(", ")}`).join("; ") : parts.join(", ")}.`).join(" ");

function billOfMaterials(t) {
  const W = 1200, R = W - PAD;
  const col = { item: PAD, asm: 132, parts: 380, qty: R }, partsW = 1040 - col.parts, groupW = 120;
  const size = 16, lh = 26, headY = 84;

  // Lay out every row first: AWS lists one sub-assembly per line, the rest wrap their parts.
  let y = headY + 16;
  const rows = BOM.map(([asm, parts], i) => {
    const grouped = Array.isArray(parts[0]);
    const lines = grouped
      ? parts.flatMap(([g, ps]) => wrap(ps, size, partsW - groupW, " · ").map((l, j) => [j ? "" : g, l]))
      : wrap(parts, size, partsW, " · ").map((l) => ["", l]);
    const row = { i, asm, lines, grouped, qty: qtyOf(parts), top: y, base: y + 30 };
    y += lines.length * lh + 20;
    return row;
  });
  const footY = y + 34, H = footY + 56;

  const rowEls = rows.map((r) => {
    const d = 0.4 + r.i * 0.09;
    const parts = r.lines.map(([g, l], j) => {
      const yy = r.base + j * lh;
      const label = g ? `<text x="${col.parts}" y="${yy}" class="m" font-size="11" letter-spacing="1" fill="${t.muted}">${esc(g.toUpperCase())}</text>` : "";
      return `${label}<text x="${col.parts + (r.grouped ? groupW : 0)}" y="${yy}">${esc(l)}</text>`;
    });
    const rule = r.i < rows.length - 1 ? `<path d="M${PAD} ${r.top + r.lines.length * lh + 20}H${R}" pathLength="1" stroke="${t.muted}" stroke-opacity=".35" class="draw" ${delay(d + 0.1)}/>` : "";
    return `<g class="up" ${delay(d)}>
<text x="${col.item}" y="${r.base}" class="m" font-size="13" fill="${t.muted}">${pad2(r.i + 1)}</text>
<text x="${col.asm}" y="${r.base}" class="s" font-size="18" font-weight="600" fill="${t.ink}">${esc(r.asm)}</text>
<g class="s" font-size="${size}" fill="${t.ink}">${parts.join("")}</g>
<text x="${col.qty}" y="${r.base}" text-anchor="end" class="m" font-size="14" fill="${t.ink}">${r.qty}</text>
</g>${rule}`;
  }).join("\n");

  const head = [["ITEM", col.item, "start"], ["ASSEMBLY", col.asm, "start"], ["PARTS", col.parts, "start"], ["QTY", col.qty, "end"]]
    .map(([s, x, a]) => `<text x="${x}" y="${headY}" text-anchor="${a}">${s}</text>`).join("");
  const endD = 0.5 + rows.length * 0.09;

  const body = `${frame(t, W, H, 4)}
<g class="up m" font-size="11" letter-spacing="1.5" fill="${t.muted}" ${delay(0.15)}>${head}</g>
<path d="M${PAD} ${headY + 14}H${R}" pathLength="1" stroke="${t.ink}" stroke-width="1.5" class="draw" ${delay(0.2)}/>
${rowEls}
<path d="M${PAD} ${y}H${R}M${PAD} ${y + 4}H${R}" stroke="${t.ink}" class="up" ${delay(endD)}/>
<g class="up" ${delay(endD + 0.1)}><text x="${col.asm}" y="${footY}" class="m" font-size="11" letter-spacing="1.5" fill="${t.muted}">TOTAL, ${rows.length} ASSEMBLIES</text><text x="${col.qty}" y="${footY}" text-anchor="end" class="m" font-size="14" fill="${t.acc}">${BOM_TOTAL}</text></g>`;

  return svg({ W, H, body, label: BOM_ALT });
}

// ---------- footer: a drawing's title block ----------

const FOOTER_ALT = "Full portfolio, architecture explorers and engineering notes at mehmettalhairmak.me. Press Cmd K on the site to jump anywhere.";

function footer(t) {
  const W = 1200, H = 200, R = W - PAD, top = 40, h = 88;
  const cells = [[PAD, 600], [660, 160], [820, 160], [980, R - 980]];
  const small = (x, y, s) => `<text x="${x + 16}" y="${y}" class="m" font-size="10" letter-spacing="1.5" fill="${t.muted}">${s}</text>`;
  const body = `
<rect width="${W}" height="${H}" fill="${t.paper}"/>
${box(PAD, top, R - PAD, h, `class="draw" fill="none" stroke="${t.ink}" stroke-width="1.5" ${delay(0.1)}`)}
<path d="${cells.slice(1).map(([x]) => `M${x} ${top}v${h}`).join("")}" pathLength="1" stroke="${t.ink}" class="draw" ${delay(0.4)}/>
<g class="up" ${delay(0.6)}>
${small(PAD, top + 26, "FULL PORTFOLIO · ARCHITECTURE EXPLORERS · NOTES")}
<text x="${PAD + 16}" y="${top + 66}" class="s" font-size="32" font-weight="600" letter-spacing="-1" fill="${t.ink}">mehmettalhairmak.me <tspan fill="${t.acc}">↗</tspan></text>
${small(660, top + 26, "DRAWN BY")}<text x="676" y="${top + 62}" class="s" font-size="18" fill="${t.ink}">M. T. Irmak</text>
${small(820, top + 26, "SHEET")}<text x="836" y="${top + 62}" class="s" font-size="18" fill="${t.ink}">05 of 05</text>
${small(980, top + 26, "REV")}<text x="996" y="${top + 62}" class="s" font-size="18" fill="${t.ink}">2026.10</text>
</g>
<text x="${PAD}" y="${top + h + 34}" class="m up" font-size="13" fill="${t.muted}" ${delay(0.8)}>Press Cmd K on the site to jump anywhere.</text>`;
  return svg({ W, H, body, label: FOOTER_ALT });
}

// ---------- README ----------

const SECTIONS = {
  work: { no: "01", title: "Selected work", note: `${PROJECTS.length} projects · newest first` },
  systems: { no: "02", title: "Internal systems", note: "open source · github.com/nodemt" },
  approach: { no: "03", title: "Engineering approach", note: "each one tested in production" },
  writing: { no: "04", title: "Writing", note: "latest on Medium" },
  bom: { no: "05", title: "Bill of materials", note: `${BOM.length} assemblies · ${BOM_TOTAL} parts` },
};
const CHIPS = {
  site: { text: "mehmettalhairmak.me", solid: true, href: SITE },
  linkedin: { text: "LinkedIn", href: "https://linkedin.com/in/mehmettalhairmak" },
  medium: { text: "Medium", href: "https://medium.com/@mehmetirmaakk" },
  email: { text: "mtalhairmak@gmail.com", href: "mailto:mtalhairmak@gmail.com" },
  articles: { text: "All articles on Medium", href: "https://medium.com/@mehmetirmaakk" },
};

const a = (href, inner) => `<a href="${href}">${inner}</a>`;
const head = (key) => `<p>${picture(`assets/section/${key}`, `${SECTIONS[key].no} ${SECTIONS[key].title}`)}</p>`;
const chipLink = (key) => a(CHIPS[key].href, picture(`assets/chip/${key}`, CHIPS[key].text, 'height="40"'));

async function readme() {
  // Keep whatever the Writing workflow last put between the markers.
  const current = await readFile(join(ROOT, "README.md"), "utf8").catch(() => "");
  const writing = current.match(/<!-- WRITING:START -->[\s\S]*?<!-- WRITING:END -->/)?.[0] ?? "<!-- WRITING:START -->\n<!-- WRITING:END -->";

  return `<!-- Generated by scripts/render-svgs.mjs — edit the data there, not this file. The Writing block is refreshed hourly by scripts/render-writing.mjs. -->

<p>${a(SITE, picture("assets/hero", HERO_ALT))}</p>

<p>
${["site", "linkedin", "medium", "email"].map(chipLink).join("\n")}
</p>

${head("work")}

<p>
${PROJECTS.map((p, i) => {
  const status = [p.period, p.archived && "archived", p.explorer && "explorable architecture on the site", p.basedOn && `shares project ${p.basedOn}'s architecture`].filter(Boolean).join("; ");
  return a(`${SITE}/work/${p.slug}`, picture(`assets/work/${p.slug}`, `${pad2(i + 1)}. ${p.name}: ${p.desc} ${status}.`, `width="${i === 0 ? "98.5%" : "49%"}"`));
}).join("\n")}
</p>

${head("systems")}

<p>
${SYSTEMS.map((s) => a(`https://github.com/nodemt/${s.repo}`, picture(`assets/systems/${s.repo}`, `${s.no}. ${s.name}, ${s.stack}: ${s.desc}`, 'width="49%"'))).join("\n")}
</p>

${head("approach")}

<p>${picture("assets/fig-request-path", FIG_ALT)}</p>

<p>
${PRINCIPLES.map(([text, where, path], i) => a(`${SITE}${path}`, picture(`assets/principles/${i + 1}`, `§${i + 1}. ${text} Tested in ${where}.`, 'width="49%"'))).join("\n")}
</p>

${head("writing")}

${writing}

<p>${chipLink("articles")}</p>

${head("bom")}

<p>${picture("assets/bom", BOM_ALT)}</p>

<p>${a(SITE, picture("assets/footer", FOOTER_ALT))}</p>
`;
}

// ---------- render ----------

const files = [];
for (const [name, t] of Object.entries(THEMES)) {
  const out = async (base, render) => files.push([`assets/${base}-${name}.svg`, await render]);
  await out("hero", hero(t));
  await out("fig-request-path", requestPath(t));
  await out("bom", billOfMaterials(t));
  await out("footer", footer(t));
  for (const [i, p] of PROJECTS.entries()) await out(`work/${p.slug}`, projectCard(t, p, i));
  for (const s of SYSTEMS) await out(`systems/${s.repo}`, systemCard(t, s));
  for (const [i, pr] of PRINCIPLES.entries()) await out(`principles/${i + 1}`, principleCard(t, pr, i));
  for (const [key, s] of Object.entries(SECTIONS)) await out(`section/${key}`, section(t, s));
  for (const [key, c] of Object.entries(CHIPS)) await out(`chip/${key}`, chip(t, c));
}
await writeAll(files);
await writeFile(join(ROOT, "README.md"), await readme());
console.log("wrote README.md");
