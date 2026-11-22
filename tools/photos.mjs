// Builds js/photos.js from assets/photos/manifest.json (written by
// tools/pexels.mjs or tools/import-photos.mjs) plus the alt text below.
// Run:  node tools/photos.mjs
import { readFileSync, writeFileSync } from "node:fs";
const manifest = JSON.parse(readFileSync(new URL("../assets/photos/manifest.json", import.meta.url), "utf8"));

// What each photo actually shows (checked by eye), in three languages.
const ALT = {
  paella: ["Seafood paella with prawns in a wide pan, a wooden spoon on a blue checked towel", "Паэлья с креветками в широкой сковороде, деревянная ложка на сине-белом полотенце", "Keng tovadagi krevetkali paelya, ko'k katakli sochiqda yog'och qoshiq"],
  ramen: ["A bowl of ramen with a halved egg, narutomaki, pork and spring onion, chopsticks on top", "Миска рамена с половинкой яйца, нарутомаки, свининой и зелёным луком, сверху палочки", "Yarim tuxum, narutomaki, go'sht va ko'k piyozli bir kosa ramen, ustida cho'plar"],
  springrolls: ["Summer rolls with prawns and herbs on a black plate with lettuce and Thai basil", "Летние роллы с креветками и зеленью на чёрной тарелке с салатом и тайским базиликом", "Qora likopchada salat bargi va tay rayhoni bilan krevetka va ko'katli bahorgi rulet"],
  pho: ["A white bowl of phở with beef and herbs, chopsticks across it, on a wooden table", "Белая миска фо с говядиной и зеленью, поперёк палочки, на деревянном столе", "Yog'och stolda mol go'shti va ko'katli oq kosadagi fo, ustida cho'plar"],
  chana: ["Chana masala in a wooden bowl with a sprig of basil, on an embroidered cloth", "Чана масала в деревянной миске с веточкой базилика на вышитой скатерти", "Kashtali dasturxondagi yog'och kosada rayhon shoxchali chana masala"],
  lentilsoup: ["Two grey bowls of red lentil soup with a drizzle of red oil, on a light table", "Две серые миски супа из красной чечевицы с красным маслом на светлом столе", "Och rangli stolda qizil yog' quyilgan ikki kosa qizil yasmiq sho'rvasi"],
  tabbouleh: ["Tabbouleh with parsley, bulgur and diced tomato in a patterned dish with lemon", "Табуле с петрушкой, булгуром и помидорами в расписном блюде с лимоном", "Naqshli idishda petrushka, bulg'ur va pomidorli tabule, limon bilan"],
  tagine: ["Chicken tagine with olives and preserved lemon in a purple tagine, its lid lifted", "Куриный тажин с оливками и лимоном в фиолетовом тажине с поднятой крышкой", "Qopqog'i ochilgan binafsha tajinda zaytun va limonli tovuq tajini"],
  focaccia: ["Focaccia in a baking tin, topped with tomato, olives, parsley and rosemary", "Фокачча в форме для выпечки с помидорами, оливками, петрушкой и розмарином", "Pishirish qolipidagi pomidor, zaytun, petrushka va bibariyali fokachcha"],
  crumble: ["A portion of apple crumble with a scoop of cream on a speckled plate", "Порция яблочного крамбла с шариком крема на тарелке в крапинку", "Sepkilli likopchada bir qoshiq qaymoq bilan olmali krambl"],
  ceviche: ["Ceviche: white fish in lime juice with onion and herbs in a white bowl", "Севиче: белая рыба в соке лайма с луком и зеленью в белой миске", "Sevice: oq kosada laym sharbatidagi piyoz va ko'katli oq baliq"],
  bananabread: ["Sliced banana bread on a wooden board with banana slices, a whole banana behind", "Нарезанный банановый хлеб на доске с кружками банана, позади целый банан", "Taxtada banan bo'laklari bilan to'g'ralgan banan noni, orqada butun banan"],
  pancakes: ["Two stacks of pancakes with berries, almonds and chocolate sauce on white plates", "Две стопки панкейков с ягодами, миндалём и шоколадным соусом на белых тарелках", "Oq likopchalarda rezavor, bodom va shokolad sousli ikki taxlam panquek"],
  borscht: ["Red borscht with sour cream and dill in a white bowl, rye bread beside it", "Красный борщ со сметаной и укропом в белой тарелке, рядом ржаной хлеб", "Oq kosada smetana va shivitli qizil borsh, yonida javdar noni"],
  blini: ["A stack of thin, lacy blini on a wooden plate over a lace tablecloth", "Стопка тонких кружевных блинов на деревянной тарелке и кружевной скатерти", "To'r dasturxon ustidagi yog'och likopchada yupqa blinchiklar"],
  syrniki: ["Two golden syrniki on a white plate with blueberries, jam and sour cream", "Два золотистых сырника на белой тарелке с черникой, вареньем и сметаной", "Oq likopchada ko'k meva, murabbo va smetana bilan ikkita tillarang sirniki"],
  omelette: ["A folded omelette with herbs on a white plate with a green salad", "Сложенный омлет с зеленью на белой тарелке с зелёным салатом", "Oq likopchada yashil salat bilan buklangan ko'katli omlet"],
  greek: ["Greek salad seen from above: tomato, pepper, red onion and feta with oregano on a red plate", "Греческий салат сверху: помидоры, перец, красный лук и брынза с орегано на красной тарелке", "Yuqoridan grek salati: qizil likopchada pomidor, qalampir, qizil piyoz va oreganoli brinza"],
  pasta: ["Spaghetti in tomato sauce with basil in a white plate", "Спагетти в томатном соусе с базиликом в белой тарелке", "Oq likopchada rayhonli tomat sousidagi spagetti"],
  chicken: ["A whole roast chicken with small potatoes and spinach on a white platter", "Целая запечённая курица с молодым картофелем и шпинатом на белом блюде", "Oq laganda mayda kartoshka va ismaloq bilan butun pishirilgan tovuq"],
  sharlotka: ["A slice of apple cake dusted with sugar, apples behind it", "Кусок яблочного пирога в сахарной пудре, позади яблоки", "Shakar upasi sepilgan bir bo'lak olmali pirog, orqada olmalar"],
  katsu: ["Chicken katsu curry: a breaded cutlet on white rice with curry sauce in a green bowl", "Кацу карри: котлета в панировке на белом рисе с соусом карри в зелёной миске", "Katsu kari: yashil kosada kari sousi va oq guruch ustida panirovkali kotlet"],
  bibimbap: ["Bibimbap in a hot stone bowl with beef, spinach and an egg yolk, small dishes behind", "Пибимпап в горячей каменной миске с говядиной, шпинатом и желтком, позади закуски", "Issiq tosh kosada mol go'shti, ismaloq va tuxum sarig'i bilan pibimpap, orqada gazaklar"],
  padthai: ["Pad thai with prawns, bean sprouts, peanuts and lime on a white plate, chopsticks beside", "Пад-тай с креветками, ростками, арахисом и лаймом на белой тарелке, рядом палочки", "Oq likopchada krevetka, nihol, yeryong'oq va laymli pad-tay, yonida cho'plar"],
  tinga: ["Four small corn tortilla tacos with chicken, onion and cilantro on a white plate", "Четыре маленьких тако из кукурузных лепёшек с курицей, луком и кинзой на белой тарелке", "Oq likopchada tovuq, piyoz va kashnichli to'rtta kichik makkajo'xori tako"],
  butterchicken: ["Butter chicken in an orange creamy sauce in a white bowl with lemon and herbs", "Курица в оранжевом сливочном соусе в белой миске с лимоном и зеленью", "Oq kosada limon va ko'kat bilan to'q sariq qaymoqli sousdagi tovuq"],
  falafel: ["Crisp falafel in a clay bowl, one broken open to show the green inside, tahini beside it", "Хрустящий фалафель в глиняной миске, один разломлен, рядом тахини", "Sopol kosada qarsildoq falafel, biri sindirilgan, yonida taxini"],
  shakshuka: ["Shakshuka seen from above: eggs in tomato sauce with parsley in a pan, on a sage-green table", "Шакшука сверху: яйца в томатном соусе с петрушкой в сковороде на серо-зелёном столе", "Yuqoridan shakshuka: kulrang-yashil stolda tovadagi petrushkali tomat sousidagi tuxumlar"],
  ratatouille: ["Ratatouille of aubergine, peppers and tomato in a black dish on a wooden board", "Рататуй из баклажанов, перца и помидоров в чёрной форме на деревянной доске", "Yog'och taxtada qora idishda baqlajon, qalampir va pomidordan ratatuy"],
};
const clean = (s) => String(s || "").replace(/\s*\(talk\)|\s*\(\s*\)/g, "").replace(/\s+/g, " ").trim();
const out = {};
for (const [id, m] of Object.entries(manifest)) {
  if (!ALT[id]) throw new Error("no alt text for " + id);
  const widths = Object.keys(m.files).map(Number).sort((a, b) => a - b);
  out[id] = {
    sizes: widths.map((w) => [w, "assets/photos/" + m.files[w]]),
    alt: { en: ALT[id][0], ru: ALT[id][1], uz: ALT[id][2] },
    by: clean(m.photographer).slice(0, 90),
    license: m.license, licenseUrl: m.licenseUrl, source: m.sourcePage, site: m.site || "Wikimedia Commons",
    pos: m.pos || null,
    generated: Boolean(m.generated),
  };
}
writeFileSync(new URL("../js/photos.js", import.meta.url), `/* Photos of the dishes, made by tools/photos.mjs from
   assets/photos/manifest.json. Every photo was checked by eye to show the
   right dish. sizes: [width, file] for srcset; by / license / source / site
   are shown under the photo; pos is the crop (CSS object-position). */
window.PHOTOS = ${JSON.stringify(out, null, 1)};
`);
console.log(Object.keys(out).length, "photos");
