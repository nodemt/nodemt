// Renders the GitHub profile README header (light + dark) with the portfolio's fonts.
// usage: node scripts/render-header.mjs ../personal-portfolio assets
import { createRequire } from "node:module";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const [portfolio, outDir] = process.argv.slice(2).map((p) => resolve(p));
const require = createRequire(join(portfolio, "package.json"));
const { ImageResponse } = await import(pathToFileURL(require.resolve("next/dist/compiled/@vercel/og/index.node.js")).href);
const React = require("react");
const h = React.createElement;

const fontDir = join(portfolio, "app/lib/fonts");
const fonts = [
  { name: "Schibsted", data: await readFile(join(fontDir, "SchibstedGrotesk-Regular.ttf")), weight: 400 },
  { name: "Schibsted", data: await readFile(join(fontDir, "SchibstedGrotesk-SemiBold.ttf")), weight: 600 },
  { name: "Plex", data: await readFile(join(fontDir, "IBMPlexMono-Regular.ttf")), weight: 400 },
];

const THEMES = {
  light: { paper: "#EFEBE3", ink: "#151513", muted: "#6E6A61", acc: "#B83D17" },
  dark: { paper: "#151513", ink: "#EFEBE3", muted: "#9A958B", acc: "#E2592B" },
};

const SPAN = [
  ["Device", "Swift · Kotlin · BLE"],
  ["Mobile", "React Native · Expo"],
  ["Web", "React · Next.js"],
  ["Services", "Node.js · NestJS · Go"],
  ["Messaging", "RabbitMQ · BullMQ"],
  ["Data & cloud", "PostgreSQL · AWS · GCP"],
];

const S = 2; // render at 2x for retina
const W = 830, H = 400;

function card(t) {
  const mono = { fontFamily: "Plex", fontSize: 11 * S, color: t.muted };
  return h("div", {
    style: { width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: t.paper, color: t.ink, fontFamily: "Schibsted", padding: `${30 * S}px ${36 * S}px ${30 * S}px` },
  },
    h("div", { style: { display: "flex", justifyContent: "space-between", ...mono } },
      h("span", null, "Mehmet Talha Irmak"),
      h("span", null, "Full Stack Engineer · Turkey")),
    h("div", { style: { display: "flex", flexDirection: "column", fontSize: 78 * S, fontWeight: 600, lineHeight: 1, letterSpacing: -78 * S * 0.055 } },
      h("span", null, "I build systems"),
      h("div", { style: { display: "flex" } }, "that hold up", h("span", { style: { color: t.acc } }, "."))),
    h("div", { style: { display: "flex", flexDirection: "column", gap: 8 * S } },
      h("div", { style: { display: "flex", justifyContent: "space-between", ...mono, fontSize: 10 * S } },
        h("span", null, "Working span"), h("span", null, "device → cloud")),
      h("div", { style: { display: "flex", position: "relative", borderTop: `${S}px solid ${t.ink}` } },
        ...SPAN.map(([label, tools]) =>
          h("div", { key: label, style: { flex: 1, display: "flex", flexDirection: "column", gap: 3 * S, paddingTop: 8 * S, position: "relative" } },
            h("div", { style: { position: "absolute", left: 0, top: -4 * S, width: S, height: 8 * S, background: t.ink } }),
            h("span", { style: { fontSize: 13 * S, fontWeight: 600, paddingLeft: 6 * S } }, label),
            h("span", { style: { ...mono, fontSize: 9 * S, paddingLeft: 6 * S } }, tools))),
        h("div", { style: { position: "absolute", right: 0, top: -4 * S, width: S, height: 8 * S, background: t.ink } }))),
  );
}

await mkdir(outDir, { recursive: true });
for (const [name, t] of Object.entries(THEMES)) {
  const res = new ImageResponse(card(t), { width: W * S, height: H * S, fonts });
  await writeFile(join(outDir, `header-${name}.png`), Buffer.from(await res.arrayBuffer()));
  console.log("wrote", `header-${name}.png`);
}
