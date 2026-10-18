// Fetches the latest Medium posts, renders one row SVG per post (light and dark) and rewrites the
// README's Writing block. Runs hourly in CI (.github/workflows/blog-post-workflow.yml).
// usage: npm i --prefix scripts && node scripts/render-writing.mjs
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { THEMES, esc, n, measure, wrap, delay, plate, svg, writeAll, picture, ROOT } from "./lib.mjs";

const FEED = "https://medium.com/feed/@mehmetirmaakk";
const MAX = 5;

const res = await fetch(FEED, { headers: { "user-agent": "Mozilla/5.0 (profile README renderer)" } });
if (!res.ok) throw new Error(`feed: HTTP ${res.status}`);
const xml = await res.text();

const field = (item, tag) => item.match(new RegExp(`<${tag}>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?</${tag}>`))?.[1] ?? "";
const decode = (s) => s.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, "&");
const posts = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].slice(0, MAX).map(([, item]) => ({
  // Same treatment as the site's Writing list: no emoji, no tracking params.
  title: decode(field(item, "title")).replace(/\p{Extended_Pictographic}|️|‍/gu, "").replace(/\s+/g, " ").trim(),
  url: field(item, "link").split("?")[0],
  date: new Date(field(item, "pubDate")).toLocaleString("en-US", { month: "short", year: "numeric", timeZone: "UTC" }),
}));
if (!posts.length) throw new Error("feed has no posts");

// Title wrapped to two lines at most; the second gets an ellipsis if the rest doesn't fit.
function titleLines(title, size, maxWidth) {
  const lines = wrap(title.split(" "), size, maxWidth, " ", 1);
  if (lines.length <= 2) return lines;
  let rest = lines.slice(1).join(" ");
  while (measure(rest + "…", size) > maxWidth) rest = rest.slice(0, rest.lastIndexOf(" "));
  return [lines[0], rest + "…"];
}

function row(t, p, i) {
  const W = 1200, H = 112, X = 210, size = 24, lh = 30;
  const lines = titleLines(p.title, size, 1100 - X);
  const y0 = H / 2 + 8 - ((lines.length - 1) * lh) / 2;
  const body = `${plate(t, W, H)}
<g class="up m" ${delay(0.1 + i * 0.08)}><text x="48" y="${H / 2 - 4}" font-size="13" fill="${t.acc}">${String(i + 1).padStart(2, "0")}</text><text x="48" y="${H / 2 + 18}" font-size="14" fill="${t.muted}">${esc(p.date)}</text></g>
<path d="M180 32V${H - 32}" stroke="${t.muted}" stroke-opacity=".5" class="up" ${delay(0.2 + i * 0.08)}/>
<g class="up s" font-size="${size}" font-weight="600" letter-spacing="-.5" fill="${t.ink}" ${delay(0.25 + i * 0.08)}>${lines.map((l, j) => `<text x="${X}" y="${n(y0 + j * lh)}">${esc(l)}</text>`).join("")}</g>
<text x="1152" y="${H / 2 + 9}" text-anchor="end" class="m pop" font-size="26" fill="${t.acc}" ${delay(0.5 + i * 0.08)}>↗</text>`;
  return svg({ W, H, body, label: `${p.title} (${p.date})` });
}

const files = [];
for (const [name, t] of Object.entries(THEMES)) {
  for (const [i, p] of posts.entries()) files.push([`assets/writing/${i + 1}-${name}.svg`, await row(t, p, i)]);
}
await writeAll(files);

const readmePath = join(ROOT, "README.md");
const readme = await readFile(readmePath, "utf8");
const block = `<!-- WRITING:START -->
<p>
${posts.map((p, i) => `<a href="${p.url}">${picture(`assets/writing/${i + 1}`, `${p.title} (${p.date})`)}</a>`).join("\n")}
</p>
<!-- WRITING:END -->`;
if (!readme.includes("<!-- WRITING:START -->")) throw new Error("README has no WRITING markers; run render-svgs.mjs first");
await writeFile(readmePath, readme.replace(/<!-- WRITING:START -->[\s\S]*?<!-- WRITING:END -->/, () => block));
console.log("updated README.md writing block,", posts.length, "posts");
