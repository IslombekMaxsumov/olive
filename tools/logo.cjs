// OLIVE logo, third version (picked 2026-11-22): a round seal with one
// olive (sage, terracotta pimento) and a leaf, next to the full word OLIVE
// in EB Garamond Medium, letter-spaced like a book title. Outlines only.
const fs = require("fs");
const opentype = require("opentype.js");
const ROOT = __dirname + "/../"; // run from anywhere:  npm i opentype.js && node tools/logo.cjs
const font = opentype.loadSync(__dirname + "/fonts/garamond500.ttf" /* EB Garamond Medium, SIL Open Font License */);
const SIZE = 36, TRACK = 0.16;
const scale = SIZE / font.unitsPerEm;
const cap = font.tables.os2.sCapHeight * scale;
const BASE = 24 + cap / 2; // word centred on the seal

function word(text, x) {
  let cx = x, d = "";
  const g = font.stringToGlyphs(text);
  g.forEach((gl, i) => {
    d += gl.getPath(cx, BASE, SIZE).toPathData(2);
    cx += (gl.advanceWidth + (i < g.length - 1 ? font.getKerningValue(gl, g[i + 1]) : 0)) * scale + TRACK * SIZE;
  });
  return { d, width: cx - x - TRACK * SIZE };
}

// the seal, in a 48 × 48 box. ring = stroke width (thicker for the favicon)
const SEAL = (ring) => [
  ["circle", { cx: 24, cy: 24, r: 22 - ring / 2, "stroke-width": ring }, "ring"],
  ["path", { d: "M26.2 16.6 Q 26.9 12.9 29.2 10.9", "stroke-width": 1.5, "stroke-linecap": "round" }, "stalk"],
  ["path", { d: "M28.6 11.6 Q 32.4 6.6 37.2 8.6 Q 33.9 13.6 28.6 11.6 Z" }, "olive"],
  ["ellipse", { cx: 0, cy: 0, rx: 7.6, ry: 10, transform: "translate(23.6 27.4) rotate(-18)" }, "olive"],
  ["ellipse", { cx: 0, cy: 0, rx: 2.9, ry: 3.9, transform: "translate(23.6 27.4) rotate(-18)" }, "pimento"],
];
const GAP = 13;
const wm = word("OLIVE", 48 + GAP);
const W = Math.ceil(48 + GAP + wm.width + 2);

const C = {
  light: { ring: "#292B23", olive: "#777B60", pimento: "#B66E4E", word: "#292B23" },
  dark: { ring: "#EDE8DC", olive: "#A3A68A", pimento: "#D0896A", word: "#EDE8DC" },
  mono: { ring: "#292B23", olive: "#292B23", pimento: "#F5F1E8", word: "#292B23" },
};
const attrs = (a) => Object.entries(a).map(([k, v]) => `${k}="${v}"`).join(" ");
function paint(kind, c) {
  if (kind === "ring") return `fill="none" stroke="${c.ring}"`;
  if (kind === "stalk") return `fill="none" stroke="${c.olive}"`;
  return `fill="${c[kind]}"`;
}
const seal = (c, ring = 1.4) => SEAL(ring).map(([tag, a, kind]) => `<${tag} ${attrs(a)} ${paint(kind, c)}/>`).join("\n  ");
const svg = (w, h, body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="OLIVE">\n  ${body}\n</svg>\n`;

const files = {
  "olive-logo.svg": svg(W, 48, `${seal(C.light)}\n  <path d="${wm.d}" fill="${C.light.word}"/>`),
  "olive-logo-dark.svg": svg(W, 48, `${seal(C.dark)}\n  <path d="${wm.d}" fill="${C.dark.word}"/>`),
  "olive-logo-mono.svg": svg(W, 48, `${seal(C.mono)}\n  <path d="${wm.d}" fill="${C.mono.word}"/>`),
  "olive-symbol.svg": svg(48, 48, seal(C.light, 1.8)),
  "olive-symbol-dark.svg": svg(48, 48, seal(C.dark, 1.8)),
  // favicon: paper square, thicker ring so it survives 16 px
  "olive-favicon.svg": svg(32, 32, `<rect width="32" height="32" rx="7" fill="#F5F1E8"/>\n  <g transform="translate(1 1) scale(0.625)">${seal(C.light, 3.4)}</g>`),
};
for (const [n, s] of Object.entries(files)) fs.writeFileSync(ROOT + "assets/brand/" + n, s);

// inline version for the site: CSS classes instead of colours, so it follows the theme
const parts = SEAL(1.4).map(([tag, a, kind]) => [tag, a, "logo-" + kind]);
fs.writeFileSync(ROOT + "js/logo.js", `/* The OLIVE logo, drawn inline so it takes the theme colours: a round seal
   with one olive and a leaf, then the word OLIVE in EB Garamond Medium
   converted to outlines. Made by a script with opentype.js; the files in
   assets/brand are the same logo for other uses. parts: [tag, attributes, class]. */
window.LOGO = {
  width: ${W},
  parts: ${JSON.stringify(parts)},
  word: ${JSON.stringify(wm.d)},
};
`);
console.log("width", W, "cap", cap.toFixed(1));
