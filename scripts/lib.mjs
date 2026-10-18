// Shared drawing kit for the README's SVGs: fonts, themes, animation CSS and the card/chip/section pieces.
// Fonts are subset and embedded per file — <img> SVGs on GitHub cannot load external fonts.
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as fontkit from "fontkit";
import subsetFont from "subset-font";

const here = dirname(fileURLToPath(import.meta.url));
export const ROOT = join(here, "..");

const FONTS = [
  { family: "S", weight: 400, file: "SchibstedGrotesk-Regular.ttf" },
  { family: "S", weight: 600, file: "SchibstedGrotesk-SemiBold.ttf" },
  { family: "P", weight: 400, file: "IBMPlexMono-Regular.ttf" },
];
for (const f of FONTS) {
  f.data = await readFile(join(here, "fonts", f.file));
  f.kit = fontkit.create(f.data);
}

export const THEMES = {
  light: { paper: "#EFEBE3", ink: "#151513", muted: "#6E6A61", acc: "#B83D17" },
  dark: { paper: "#151513", ink: "#EFEBE3", muted: "#9A958B", acc: "#E2592B" },
};

export const PAD = 60;
export const MONO = 0.6; // Plex Mono advance, in em
export const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
export const n = (v) => +v.toFixed(2);

// Advance width of `text` (in the 600-weight sans unless `font` says otherwise), including SVG
// letter-spacing after every glyph.
export function measure(text, size, spacing = 0, font = 1) {
  const { kit } = FONTS[font];
  return (kit.layout(text).advanceWidth * size) / kit.unitsPerEm + spacing * [...text].length;
}

// Greedy line breaking of `parts` joined by `sep`.
export function wrap(parts, size, maxWidth, sep = " ", font = 0) {
  const lines = [];
  for (const part of parts) {
    const last = lines.at(-1);
    if (last != null && measure(last + sep + part, size, 0, font) <= maxWidth) lines[lines.length - 1] = last + sep + part;
    else lines.push(part);
  }
  return lines;
}

export const BASE_CSS = `
.s{font-family:S,-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif}
.m{font-family:P,ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}
.up{animation:up .9s cubic-bezier(.2,.8,.2,1) both}
@keyframes up{from{opacity:0;transform:translateY(14px)}}
.draw{stroke-dasharray:1;animation:draw 1.2s cubic-bezier(.65,0,.35,1) both}
@keyframes draw{from{stroke-dashoffset:1}to{stroke-dashoffset:0}}
.pop{transform-box:fill-box;transform-origin:center;animation:pop .5s cubic-bezier(.3,1.6,.5,1) both}
@keyframes pop{from{opacity:0;transform:scale(0)}}
.pulse{transform-box:fill-box;transform-origin:center;animation:pulse 2s ease-out infinite}
@keyframes pulse{from{opacity:.9;transform:scale(1)}to{opacity:0;transform:scale(3.4)}}
.stamp{transform-box:fill-box;transform-origin:center;animation:stamp .35s cubic-bezier(.5,0,.75,0) both}
@keyframes stamp{from{opacity:0;transform:scale(1.8)}}
.loop{opacity:0}
@media (prefers-reduced-motion:reduce){*{animation:none!important}}`;

export const delay = (s) => `style="animation-delay:${n(s)}s"`;

// A closed path rather than <rect>, so pathLength-based draw-in works in every engine.
export const box = (x, y, w, h, attrs = "") => `<path d="M${x} ${y}h${w}v${h}h${-w}Z" pathLength="1" ${attrs}/>`;

const grid = (t) =>
  `<pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M24 0H0V24" fill="none" stroke="${t.ink}" stroke-opacity=".05"/></pattern>`;

// Drafting-sheet frame: paper, faint grid, inset border with zone numbers and letters.
export function frame(t, W, H, rows) {
  const inset = 20, cols = 6;
  const zones = [];
  for (let i = 0; i < cols; i++) {
    const x = inset + ((W - 2 * inset) * (i + 0.5)) / cols;
    zones.push(`<text x="${n(x)}" y="14" text-anchor="middle">${i + 1}</text>`, `<text x="${n(x)}" y="${H - 6}" text-anchor="middle">${i + 1}</text>`);
    if (i) {
      const bx = n(inset + ((W - 2 * inset) * i) / cols);
      zones.push(`<path d="M${bx} ${inset}v6M${bx} ${H - inset}v-6"/>`);
    }
  }
  for (let i = 0; i < rows; i++) {
    const y = n(inset + ((H - 2 * inset) * (i + 0.5)) / rows + 3.5);
    const letter = String.fromCharCode(65 + i);
    zones.push(`<text x="10" y="${y}" text-anchor="middle">${letter}</text>`, `<text x="${W - 10}" y="${y}" text-anchor="middle">${letter}</text>`);
  }
  return `
${grid(t)}
<rect width="${W}" height="${H}" fill="${t.paper}"/>
<rect x="${inset}" y="${inset}" width="${W - 2 * inset}" height="${H - 2 * inset}" fill="url(#grid)" stroke="${t.muted}" stroke-opacity=".55"/>
<g class="m" font-size="9" fill="${t.muted}" stroke="${t.muted}" stroke-opacity=".55" opacity=".8">${zones.join("")}</g>`;
}

// Lighter frame for cards and strips: paper, grid, a single inset border that draws in.
export function plate(t, W, H, inset = 12) {
  return `
${grid(t)}
<rect width="${W}" height="${H}" fill="${t.paper}"/>
<rect x="${inset}" y="${inset}" width="${W - 2 * inset}" height="${H - 2 * inset}" fill="url(#grid)"/>
${box(inset, inset, W - 2 * inset, H - 2 * inset, `class="draw" fill="none" stroke="${t.muted}" stroke-opacity=".7" ${delay(0)}`)}`;
}

export async function svg({ W, H, label, css = "", body }) {
  // Subset every font to the characters this file actually draws.
  const text = body.replace(/<[^>]*>/g, "").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&amp;/g, "&");
  const chars = [...new Set(text)].join("");
  const faces = await Promise.all(
    FONTS.map(async (f) => {
      const woff2 = await subsetFont(f.data, chars, { targetFormat: "woff2" });
      return `@font-face{font-family:${f.family};font-weight:${f.weight};src:url(data:font/woff2;base64,${woff2.toString("base64")}) format("woff2")}`;
    }),
  );
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(label)}">
<title>${esc(label)}</title>
<style>${faces.join("")}${BASE_CSS}${css}</style>
${body}
</svg>
`;
}

// Card: index and meta on top, a title (wrapped), optional description, and a footer with tags and
// where the card links to. Half cards are 600 wide and full cards 1200, so both draw at one scale.
export function card(t, o) {
  const { W = 600, no, meta = "", title, titleSize = 44, desc, tags = [], link, archived } = o;
  const P = 36, R = W - P, lh = 26, titleLh = n(titleSize * 1.12);
  const titleLs = -titleSize * 0.03;
  const titleLines = wrap(title.split(" "), titleSize, R - P - (archived ? 170 : 0), " ", 1);
  const titleY = 74 + titleSize;
  const descY = titleY + (titleLines.length - 1) * titleLh + 42;
  const descLines = desc ? wrap(desc.split(" "), 18, W - 2 * P) : [];
  const H = o.H ?? (descLines.length ? descY + (descLines.length - 1) * lh : titleY + (titleLines.length - 1) * titleLh) + 96;
  const footY = H - 38;
  const lastInk = descLines.length ? descY + (descLines.length - 1) * lh : titleY + (titleLines.length - 1) * titleLh;
  if (lastInk > footY - 44) throw new Error(`card "${title}" is too tall for H=${H}`);

  const stamp = archived
    ? `<g transform="translate(${R - 78} ${titleY - 14}) rotate(-7)"><g class="stamp" ${delay(1.0)}><rect x="-70" y="-17" width="140" height="34" fill="none" stroke="${t.acc}" stroke-width="2"/><rect x="-65" y="-12" width="130" height="24" fill="none" stroke="${t.acc}" stroke-opacity=".5"/><text y="5" text-anchor="middle" class="m" font-size="13" letter-spacing="3" fill="${t.acc}">ARCHIVED</text></g></g>`
    : "";

  // Tags: ◆ is drawn (the fonts have no glyph for it); anything else is mono text with an accent lead.
  let tx = P;
  const tagEls = tags.map(({ diamond, lead, text }) => {
    let el = "";
    if (diamond) {
      el = `<rect x="${tx}" y="${footY - 9}" width="8" height="8" transform="rotate(45 ${tx + 4} ${footY - 5})" fill="${t.acc}"/><text x="${tx + 16}" y="${footY}">${esc(text)}</text>`;
      tx += 16;
    } else el = `<text x="${tx}" y="${footY}">${lead ? `<tspan fill="${t.acc}">${esc(lead)}</tspan> ` : ""}${esc(text)}</text>`;
    tx += 12.5 * MONO * ((lead ? lead.length + 1 : 0) + text.length) + 24;
    return el;
  });

  const body = `${plate(t, W, H)}
<g class="up m" font-size="14" ${delay(0.15)}><text x="${P}" y="58" fill="${t.acc}">${esc(no)}</text><text x="${R}" y="58" text-anchor="end" fill="${t.muted}">${esc(meta)}</text></g>
<g class="s up" font-size="${titleSize}" font-weight="600" letter-spacing="${n(titleLs)}" fill="${t.ink}" ${delay(0.3)}>${titleLines.map((l, j) => `<text x="${P}" y="${n(titleY + j * titleLh)}">${esc(l)}</text>`).join("")}</g>
<g class="s up" font-size="18" fill="${t.ink}" ${delay(0.45)}>${descLines.map((l, j) => `<text x="${P}" y="${descY + j * lh}">${esc(l)}</text>`).join("")}</g>
<path d="M${P} ${footY - 26}H${R}" pathLength="1" stroke="${t.muted}" stroke-opacity=".5" class="draw" ${delay(0.5)}/>
<g class="up m" font-size="12" letter-spacing=".5" fill="${t.muted}" ${delay(0.65)}>${tagEls.join("")}<text x="${R}" y="${footY}" text-anchor="end">${esc(link)} <tspan fill="${t.acc}">↗</tspan></text></g>
${stamp}`;
  return svg({ W, H, body, label: o.label });
}

// Section header strip: number, title, a note on the right, and a ruler that draws across.
export function section(t, { no, title, note = "" }) {
  const W = 1200, H = 112, R = W - PAD;
  const body = `
<rect width="${W}" height="${H}" fill="${t.paper}"/>
<g class="up" ${delay(0.1)}><text x="${PAD}" y="62" class="m" font-size="16" fill="${t.acc}">${esc(no)}</text><text x="${PAD + 52}" y="64" class="s" font-size="34" font-weight="600" letter-spacing="-1" fill="${t.ink}">${esc(title)}</text><text x="${R}" y="62" text-anchor="end" class="m" font-size="13" fill="${t.muted}">${esc(note)}</text></g>
<path d="M${PAD} 86H${R}" pathLength="1" stroke="${t.ink}" stroke-width="1.5" class="draw" ${delay(0.2)}/>
<g class="pop" ${delay(0.3)}><path d="M${PAD} 80v12" stroke="${t.ink}" stroke-width="1.5"/></g><g class="pop" ${delay(1.3)}><path d="M${R} 80v12" stroke="${t.ink}" stroke-width="1.5"/></g>`;
  return svg({ W, H, body, label: `${no} ${title}${note ? `: ${note}` : ""}` });
}

// Link chip, sized to its text. `solid` inverts it for the primary link.
export function chip(t, { text, solid }) {
  const size = 15, P = 18, H = 48;
  const W = Math.ceil(P * 2 + size * MONO * (text.length + 2));
  const [bg, fg] = solid ? [t.ink, t.paper] : [t.paper, t.ink];
  const body = `
<rect width="${W}" height="${H}" fill="${t.paper}"/>
<rect x=".75" y=".75" width="${W - 1.5}" height="${H - 1.5}" fill="${bg}" stroke="${t.ink}" stroke-width="1.5"/>
<text x="${P}" y="${H / 2 + 5}" class="m" font-size="${size}" fill="${fg}">${esc(text)} <tspan fill="${solid ? fg : t.acc}">↗</tspan></text>`;
  return svg({ W, H, body, label: text });
}

export async function writeAll(files) {
  for (const [file, out] of files) {
    await mkdir(dirname(join(ROOT, file)), { recursive: true });
    await writeFile(join(ROOT, file), out);
    console.log("wrote", file, `${(out.length / 1024).toFixed(0)} KB`);
  }
}

// <picture> that follows the viewer's colour scheme; `attrs` go on the <img>.
export const picture = (base, alt, attrs = 'width="100%"') =>
  `<picture><source media="(prefers-color-scheme: dark)" srcset="${base}-dark.svg"><img alt="${esc(alt)}" src="${base}-light.svg" ${attrs}></picture>`;
