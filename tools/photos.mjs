// Builds js/photos.js from assets/photos/manifest.json (written when the
// photos were downloaded from Wikimedia Commons) plus the alt text below.
// Run:  node tools/photos.mjs
import { readFileSync, writeFileSync } from "node:fs";
const manifest = JSON.parse(readFileSync(new URL("../assets/photos/manifest.json", import.meta.url), "utf8"));

// What each photo actually shows (checked by eye), in three languages.
const ALT = {
  plov: ["Plov on a blue and white Uzbek plate: rice with yellow carrots, lamb, raisins and chickpeas", "Плов на сине-белом узбекском блюде: рис с жёлтой морковью, бараниной, изюмом и нутом", "Ko'k-oq o'zbekcha lagandagi osh: sariq sabzi, qo'y go'shti, mayiz va no'xatli guruch"],
  lagman: ["A bowl of lagman: noodles under a red sauce with beef, potato, peppers and green beans", "Миска лагмана: лапша под красным соусом с говядиной, картофелем, перцем и стручковой фасолью", "Bir kosa lag'mon: mol go'shti, kartoshka, qalampir va loviyali qizil sous ostidagi ugra"],
  manti: ["Six steamed manti on a blue and white Uzbek plate", "Шесть паровых мантов на сине-белой узбекской тарелке", "Ko'k-oq o'zbekcha likopchadagi oltita bug'da pishgan manti"],
  samsa: ["Golden triangular samsa sprinkled with sesame seeds on a plate", "Золотистые треугольные самсы с кунжутом на тарелке", "Likopchadagi kunjut sepilgan tillarang uchburchak somsalar"],
  shurpa: ["A bowl of clear orange shurpa topped with strained yogurt and dill", "Тарелка прозрачной оранжевой шурпы с сузьмой и укропом", "Suzma va shivit solingan tiniq to'q sariq sho'rva"],
  mastava: ["A bowl of red mastava with herbs, with sour cream on the side", "Тарелка красной маставы с зеленью и сметаной рядом", "Ko'katli qizil mastava, yonida smetana"],
  dimlama: ["Dimlama seen from above: potatoes, carrots, peppers and a whole head of garlic with parsley", "Димлама сверху: картофель, морковь, перец и целая головка чеснока с петрушкой", "Yuqoridan dimlama: kartoshka, sabzi, qalampir va petrushkali butun sarimsoq"],
  chuchvara: ["Small chuchvara dumplings with tomato, carrot and herbs, one on a fork", "Маленькая чучвара с помидорами, морковью и зеленью, одна на вилке", "Pomidor, sabzi va ko'katli mayda chuchvara, biri sanchqida"],
  non: ["A stack of round Uzbek non breads with patterned centres and sesame", "Стопка круглых узбекских лепёшек с узором в центре и кунжутом", "O'rtasi naqshli, kunjutli dumaloq o'zbek nonlari"],
  moshkichiri: ["A plate of moshkichiri: mung beans and rice with pieces of beef and carrot", "Тарелка машкичири: маш и рис с кусочками говядины и моркови", "Bir likopcha moshkichiri: mosh va guruch, mol go'shti va sabzi bo'laklari bilan"],
  achichuk: ["Achichuk salad: tomato, cucumber and thin onion slices on a white plate", "Салат ачичук: помидоры, огурец и тонкий лук на белой тарелке", "Achchiq-chuchuk: oq likopchada pomidor, bodring va yupqa piyoz"],
  borscht: ["A bowl of deep red borscht with a spoon of sour cream and a sprig of dill", "Тарелка тёмно-красного борща с ложкой сметаны и веточкой укропа", "Bir qoshiq smetana va bir shox shivitli to'q qizil borsh"],
  blini: ["Rolled blini with berry sauce, next to a teapot and a cup of tea", "Свёрнутые блины с ягодным соусом рядом с чайником и чашкой чая", "Choynak va bir piyola choy yonida rezavor sousli o'ralgan blinchiklar"],
  syrniki: ["Fried syrniki with sour cream and sugar on a flowered plate", "Жареные сырники со сметаной и сахаром на тарелке с цветами", "Gulli likopchada smetana va shakarli qovurilgan sirniki"],
  omelette: ["A folded golden omelette on a blue plate with a cherry tomato and parsley", "Сложенный золотистый омлет на синей тарелке с помидором черри и петрушкой", "Ko'k likopchada cheri pomidor va petrushka bilan buklangan tillarang omlet"],
  greek: ["Greek salad: tomatoes, cucumber, onion, olives and a slab of feta", "Греческий салат: помидоры, огурцы, лук, оливки и кусок брынзы", "Grek salati: pomidor, bodring, piyoz, zaytun va bir bo'lak brinza"],
  pasta: ["Spaghetti with tomato sauce and a basil leaf", "Спагетти с томатным соусом и листиком базилика", "Rayhon bargi bilan tomat sousli spagetti"],
  chicken: ["Roast chicken legs with potato wedges on a plate", "Запечённые куриные окорочка с картофелем дольками на тарелке", "Likopchada kartoshka bo'laklari bilan pishirilgan tovuq sonlari"],
  sharlotka: ["A home-baked sharlotka apple cake in its tin", "Домашняя шарлотка в форме для выпечки", "Qolipdagi uyda pishirilgan olmali sharlotka"],
  katsu: ["Sliced breaded cutlet on rice with Japanese curry sauce", "Нарезанная котлета в панировке на рисе с японским соусом карри", "Yapon kari sousi bilan guruch ustidagi to'g'ralgan panirovkali kotlet"],
  bibimbap: ["Dolsot bibimbap in a hot stone bowl with vegetables, beef and an egg yolk", "Пибимпап в горячей каменной миске с овощами, говядиной и желтком", "Issiq tosh kosadagi sabzavot, mol go'shti va tuxum sarig'i bilan pibimpap"],
  padthai: ["Pad Thai with prawns, bean sprouts, peanuts and lime on a plate", "Пад-тай с креветками, ростками, арахисом и лаймом на тарелке", "Likopchada krevetka, nihollar, yeryong'oq va laym bilan pad-tay"],
  tinga: ["Chicken tinga: shredded chicken in chipotle sauce with onion on a blue patterned plate", "Тинга: рваная курица в соусе чипотле с луком на синей тарелке с узором", "Tinga: ko'k naqshli likopchada chipotle sousli piyozli titilgan tovuq"],
  butterchicken: ["Butter chicken in an orange creamy sauce in a bowl", "Курица в оранжевом сливочном соусе в миске", "Kosada to'q sariq qaymoqli sousdagi tovuq"],
  falafel: ["A plate of falafel with hummus and salad", "Тарелка фалафеля с хумусом и салатом", "Xumus va salat bilan bir likopcha falafel"],
  shakshuka: ["Shakshuka in a black pan: eggs in tomato and pepper sauce with herbs", "Шакшука в чёрной сковороде: яйца в соусе из помидоров и перца с зеленью", "Qora tovadagi shakshuka: ko'katli pomidor va qalampir sousidagi tuxumlar"],
  qatlama: ["Qatlama: a round, crisp, many-layered flatbread with a small bowl of honey", "Катлама: круглая хрустящая слоёная лепёшка с пиалой мёда", "Qatlama: bir piyola asal bilan dumaloq, qarsildoq, ko'p qatlamli non"],
  shirguruch: ["Shirguruch: creamy rice cooked in milk with a piece of butter on top", "Ширгуруч: нежный рис на молоке с кусочком сливочного масла", "Shirguruch: ustiga sariyog' qo'yilgan sutli mayin guruch"],
  ratatouille: ["Ratatouille: stewed aubergine, courgette, peppers and tomato on a plate", "Рататуй: тушёные баклажаны, кабачки, перец и помидоры на тарелке", "Ratatuy: likopchada dimlangan baqlajon, qovoqcha, qalampir va pomidor"],
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
    license: m.license, licenseUrl: m.licenseUrl, source: m.sourcePage,
    generated: Boolean(m.generated),
  };
}
writeFileSync(new URL("../js/photos.js", import.meta.url), `/* Photos of the dishes (Wikimedia Commons), made by tools/photos.mjs from
   assets/photos/manifest.json. Every photo was checked by eye to show the
   right dish. sizes: [width, file] for srcset; by / license / source are
   shown under the photo (most licences require this credit).
   No suitable photo was found for: qatlama, shirguruch (see README). */
window.PHOTOS = ${JSON.stringify(out, null, 1)};
`);
console.log(Object.keys(out).length, "photos");
