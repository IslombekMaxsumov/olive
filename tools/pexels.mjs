// Downloads the chosen Pexels photo for every recipe in three widths and
// rewrites assets/photos/manifest.json, then rebuilds js/photos.js.
// Run:  node tools/pexels.mjs
// The photos were picked by eye (2026-11-22) to look like one set: about a
// 45° angle, soft daylight, light or neutral surfaces. Pexels License: free
// to use, no attribution required (we credit the photographers anyway).
// pos = CSS object-position, for portrait photos cropped into 4:3 frames.
import { writeFileSync, readdirSync, unlinkSync } from "node:fs";
import { execFileSync } from "node:child_process";

const PICKS = {
  paella: [36878063, "Zakhar Vozhdaienko", "delicious-homemade-seafood-paella-in-pan"],
  ramen: [31393431, "Matheus Bertelli", "delicious-japanese-ramen-with-egg-and-scallions"],
  springrolls: [6646031, "RDNE Stock project", "spring-rolls-on-the-plate"],
  pho: [4153908, "Nam Phong Bùi", "pho-soup-noodles-in-white-ceramic-bowl"],
  chana: [9287035, "Muhammad Khawar Nazir", "close-up-of-chana-masala"],
  lentilsoup: [12077978, "Alex Bayev", "turkish-creamy-soup", "50% 78%"],
  tabbouleh: [15108402, "Shameel mukkath", "a-bowl-of-salad-with-tomatoes-parsley-and-lemon"],
  tagine: [2291603, "Zak Chapman", "purple-ceramic-jar"],
  focaccia: [18453905, "Lucie Liz", "fresh-focaccia-italian-bread", "50% 45%"],
  crumble: [9266852, "Valeria Boltneva", "closeup-of-an-apple-crumble-on-a-plate", "50% 35%"],
  ceviche: [17613668, "Annavitoria Martinssousa", "soup-in-bowl"],
  bananabread: [4114141, "alleksana", "banana-bread-on-the-table"],
  pancakes: [7144297, "Monstera Production", "a-plate-of-pancakes", "50% 38%"],
  borscht: [32020817, "Helen Brudna", "delicious-borscht-soup-with-sour-cream-and-rye-bread", "50% 40%"],
  blini: [4966606, "cottonbro studio", "brown-bread-on-brown-wooden-plate", "50% 40%"],
  syrniki: [36612300, "Valeria Boltneva", "delicious-breakfast-syrniki-with-fresh-berries", "50% 62%"],
  omelette: [26161037, "Serdar Göksu", "omelette-with-vegetable-salad"],
  greek: [9853236, "Дарья Евстигнеева", "salad-on-red-plate"],
  pasta: [36430170, "Willians Huerta", "delicious-spaghetti-with-tomato-sauce-on-plate"],
  chicken: [5956831, "Katrin Bolovtsova", "roasted-chicken-and-potatoes-on-white-ceramic-plate", "50% 62%"],
  sharlotka: [31581244, "Zoltan Istella", "delicious-homemade-apple-cake-slice", "50% 62%"],
  katsu: [20127885, "Jazheel Inocencio", "soup-with-meat-and-rice"],
  bibimbap: [7491952, "minchephoto photography", "bibimbap-on-black-ceramic-bowl", "50% 58%"],
  padthai: [34723305, "UNDO KIM", "authentic-pad-thai-dish-with-shrimp-and-bean-sprouts"],
  tinga: [14930613, "Shameel mukkath", "tacos-on-plate-with-dipping-sauce", "50% 72%"],
  butterchicken: [9738981, "Alberta Studios", "meat-stout-with-lemon"],
  falafel: [6275189, "Nataliya Vaitkevich", "falafel-and-tahini-sauce"],
  shakshuka: [35672949, "Valeria Boltneva", "delicious-shakshuka-in-a-cast-iron-skillet", "50% 62%"],
  ratatouille: [16699418, "Marcelo Verfe", "a-vegetable-stew-in-a-dish"],
};
const WIDTHS = [500, 960, 1600];
const dir = new URL("../assets/photos/", import.meta.url);

// remove the old photo files (Wikimedia Commons) first
for (const f of readdirSync(dir)) if (/^[a-z]+-\d+\.jpg$/.test(f)) unlinkSync(new URL(f, dir));

const manifest = {};
for (const [id, [pid, by, slug, pos]] of Object.entries(PICKS)) {
  const files = {};
  for (const w of WIDTHS) {
    const url = `https://images.pexels.com/photos/${pid}/pexels-photo-${pid}.jpeg?auto=compress&cs=tinysrgb&w=${w}`;
    const res = await fetch(url);
    const type = res.headers.get("content-type") || "";
    if (!res.ok || !type.startsWith("image/")) throw new Error(`${id} ${w}: ${res.status} ${type}`);
    const name = `${id}-${w}.jpg`;
    writeFileSync(new URL(name, dir), Buffer.from(await res.arrayBuffer()));
    files[w] = name;
  }
  manifest[id] = {
    files, pos: pos || null,
    sourcePage: `https://www.pexels.com/photo/${slug}-${pid}/`, site: "Pexels",
    photographer: by, license: "Pexels License", licenseUrl: "https://www.pexels.com/license/",
    attributionRequired: false,
  };
  console.log("ok", id);
}
writeFileSync(new URL("manifest.json", dir), JSON.stringify(manifest, null, 1) + "\n");
execFileSync(process.execPath, [new URL("photos.mjs", import.meta.url).pathname.replace(/^\/(\w:)/, "$1")], { stdio: "inherit" });
