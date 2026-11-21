// Tests for the recipe logic (no browser needed):  node --test tests/
// Loads data.js, format.js and store.js into a fake window with an
// in-memory localStorage, like the browser does.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

function load() {
  const memory = {};
  const window = { APP_NS: "recipes", addEventListener() {} };
  const ctx = {
    window, console, globalThis: undefined,
    Core: {
      store: {
        getJSON: (k, f) => (k in memory ? JSON.parse(memory[k]) : f),
        setJSON: (k, v) => (memory[k] = JSON.stringify(v)),
      },
    },
  };
  ctx.globalThis = ctx;
  vm.createContext(ctx);
  for (const f of ["js/data.js", "js/format.js", "js/store.js"]) {
    vm.runInContext(readFileSync(new URL("../" + f, import.meta.url), "utf8"), ctx);
    Object.assign(ctx, window); // DATA, Format, Store become globals, as in a browser
  }
  return { DATA: window.DATA, Format: window.Format, Store: window.Store };
}
// a tiny t(): unit words in English, enough to check the numbers
const t = (key, v) => `${v.n} ${key.replace("unit.", "")}`;

test("every recipe is complete in three languages", () => {
  const { DATA } = load();
  assert.equal(DATA.RECIPES.length, 29);
  for (const r of DATA.RECIPES) {
    for (const l of ["en", "ru", "uz"]) {
      assert.ok(r.name[l], `${r.id} name ${l}`);
      assert.ok(r.about[l], `${r.id} about ${l}`);
      assert.ok(r.country[l], `${r.id} country ${l}`);
      r.steps.forEach((s, i) => assert.ok(s.text[l], `${r.id} step ${i} ${l}`));
      r.tips.forEach((tip, i) => assert.ok(tip[l], `${r.id} tip ${i} ${l}`));
    }
    assert.ok(DATA.REGIONS.includes(r.region), `${r.id} region`);
    assert.equal(r.time, r.prep + r.cook, `${r.id} time = prep + cook`);
    r.items.forEach((it) => assert.ok(DATA.INGREDIENTS[it.ing], `${r.id}: unknown ingredient ${it.ing}`));
  }
});

test("all ten regions have at least one recipe", () => {
  const { DATA } = load();
  for (const reg of DATA.REGIONS) assert.ok(DATA.RECIPES.some((r) => r.region === reg), reg);
});

test("amounts: fractions, bigger units and sensible rounding", () => {
  const { Format } = load();
  const a = (v, u, item) => Format.amount(v, u, item, t, "en");
  assert.equal(a(0.5, "pcs"), "½ pcs");
  assert.equal(a(1.25, "tbsp"), "1¼ tbsp");
  assert.equal(a(0.66, "pcs"), "½ pcs");      // pieces go in halves
  assert.equal(a(1250, "g"), "1.25 kg");
  assert.equal(a(1500, "ml"), "1.5 l");
  assert.equal(a(6, "tsp"), "2 tbsp");        // 3 tsp = 1 tbsp
  assert.equal(a(7, "g"), "7 g");             // small amounts keep their precision
  assert.equal(a(10.5, "g"), "11 g");
  assert.equal(a(333, "g"), "335 g");
  assert.equal(a(0.1, "clove"), "1 clove");   // never "0"
});

test("eggs stay whole when scaling", () => {
  const { Format } = load();
  assert.equal(Format.amount(1.33, "pcs", { whole: true }, t, "en"), "1 pcs");
  assert.equal(Format.amount(2.5, "pcs", { whole: true }, t, "en"), "3 pcs");
  assert.equal(Format.amount(0.2, "pcs", { whole: true }, t, "en"), "1 pcs");
});

test("servings calculator scales every ingredient linearly", () => {
  const { DATA, Store } = load();
  const plov = DATA.recipe("plov"); // written for 6
  const for3 = Store.scaled(plov, 3);
  const rice = for3.find((x) => x.ing === "rice");
  assert.equal(rice.amount, 300);
  const cumin = for3.find((x) => x.ing === "cumin"); // 1 tbsp → 1.5 tsp (base unit)
  assert.equal(cumin.unit, "tsp");
  assert.equal(cumin.amount, 1.5);
  const water = Store.scaled(plov, 12).find((x) => x.ing === "water");
  assert.equal(water.amount, 1800);
});

test("shopping list adds up the same ingredient across recipes", () => {
  const { DATA, Store } = load();
  Store.addToShopping(DATA.recipe("plov"), 6);        // 2 onions
  Store.addToShopping(DATA.recipe("lagman"), 4);      // 1 onion
  const onion = Store.shopping().items.filter((x) => x.ing === "onion");
  assert.equal(onion.length, 1);
  assert.equal(onion[0].amount, 3);
  assert.deepEqual([...onion[0].from], ["plov", "lagman"]);
  // tbsp and tsp of the same spice become one line
  Store.addToShopping(DATA.recipe("moshkichiri"), 5); // 1 tsp cumin (plov had 1 tbsp)
  const cumin = Store.shopping().items.filter((x) => x.ing === "cumin");
  assert.equal(cumin.length, 1);
  assert.equal(cumin[0].amount, 4); // 3 tsp + 1 tsp
});

test("staples are not added, and different ingredients are not merged", () => {
  const { DATA, Store } = load();
  Store.addToShopping(DATA.recipe("padthai"), 2);
  const ings = Store.shopping().items.map((x) => x.ing);
  assert.ok(!ings.includes("oil"), "oil is a staple");
  assert.ok(ings.includes("springonion"));
  assert.ok(!ings.includes("onion"), "spring onions stay separate from onions");
});

test("only the missing ingredients can be added", () => {
  const { DATA, Store } = load();
  const n = Store.addToShopping(DATA.recipe("greek"), 3, ["feta", "olives"]);
  assert.equal(n, 2);
  assert.deepEqual(Store.shopping().items.map((x) => x.ing).sort(), ["feta", "olives"]);
});

test("undo restores a cleared list and a cleared plan", () => {
  const { DATA, Store } = load();
  Store.addToShopping(DATA.recipe("borscht"), 6);
  const before = Store.shopping().items.length;
  const undo = Store.clearShopping(false);
  assert.equal(Store.shopping().items.length, 0);
  undo();
  assert.equal(Store.shopping().items.length, before);
  Store.setMeal("mon", "lunch", "plov");
  const undoPlan = Store.clearPlan();
  assert.deepEqual(Store.plan(), {});
  undoPlan();
  assert.equal(Store.plan().mon.lunch, "plov");
});

test("favourites and notes persist", () => {
  const { Store } = load();
  assert.equal(Store.toggleFavourite("katsu"), true);
  assert.deepEqual(Store.favourites(), ["katsu"]);
  Store.setNote("katsu", "less sugar");
  assert.equal(Store.note("katsu"), "less sugar");
  assert.equal(Store.toggleFavourite("katsu"), false);
});

test("aliases find ingredients in other words", () => {
  const { DATA } = load();
  const has = (id, word) => DATA.INGREDIENTS[id].aliases.includes(word);
  assert.ok(has("aubergine", "eggplant"));
  assert.ok(has("springonion", "scallions"));
  assert.ok(has("cilantro", "coriander leaves"));
});
