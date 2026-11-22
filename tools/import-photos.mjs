// Adds new recipe photos from assets/photos/new/<recipe id>.jpg to the site.
// Run:  node tools/import-photos.mjs  [--generated]
// --generated: the images were made with an AI image generator; the credit
// under each photo then says so ("Image generated with AI for OLIVE").
// Afterwards it rebuilds js/photos.js (tools/photos.mjs).
import { readFileSync, writeFileSync, readdirSync, copyFileSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";

const root = new URL("../", import.meta.url);
const dir = new URL("assets/photos/new/", root);
const generated = process.argv.includes("--generated");
const manifestUrl = new URL("assets/photos/manifest.json", root);
const manifest = JSON.parse(readFileSync(manifestUrl, "utf8"));
const ids = new Set(JSON.parse(readFileSync(new URL("assets/photos/ids.json", root), "utf8")));

// width and height from the JPEG header (no image library needed)
function jpegSize(buf) {
  let i = 2;
  while (i < buf.length) {
    if (buf[i] !== 0xff) { i++; continue; }
    const marker = buf[i + 1];
    const len = buf.readUInt16BE(i + 2);
    if (marker >= 0xc0 && marker <= 0xc3) return { h: buf.readUInt16BE(i + 5), w: buf.readUInt16BE(i + 7) };
    i += 2 + len;
  }
  return null;
}

if (!existsSync(dir)) { console.log("Put the photos in assets/photos/new/ first."); process.exit(1); }
for (const file of readdirSync(dir)) {
  const id = file.replace(/\.jpe?g$/i, "");
  if (!ids.has(id)) { console.log("skipped (not a recipe id):", file); continue; }
  const buf = readFileSync(new URL(file, dir));
  const size = jpegSize(buf);
  if (!size) { console.log("skipped (not a JPEG):", file); continue; }
  if (size.w < 1200) console.log(`warning: ${file} is only ${size.w}px wide`);
  const name = `${id}-${size.w}.jpg`;
  copyFileSync(new URL(file, dir), new URL("assets/photos/" + name, root));
  manifest[id] = {
    files: { [size.w]: name }, originalSize: `${size.w}x${size.h}`,
    photographer: generated ? "Image generated with AI for OLIVE" : "Provided by the site author",
    license: generated ? "AI-generated" : "Own photo", licenseUrl: "", sourcePage: "",
    attributionRequired: false, generated,
  };
  console.log("added", id, `${size.w}x${size.h}`);
}
writeFileSync(manifestUrl, JSON.stringify(manifest, null, 1));
execFileSync(process.execPath, [new URL("tools/photos.mjs", root).pathname.replace(/^\/([A-Z]:)/, "$1")], { stdio: "inherit" });
