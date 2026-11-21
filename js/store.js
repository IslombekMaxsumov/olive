/* Everything the visitor saves, kept in localStorage (Core.store):
   favourites, personal notes per recipe, the servings they last chose, the
   shopping list, the week's meal plan and the ingredients they have at home.
   Pages call Store.onChange(fn) to redraw when something changes (also when
   another tab changes it). */
(function () {
  "use strict";
  const { store } = Core;
  const { INGREDIENTS, recipe } = DATA;
  const listeners = [];
  const changed = () => listeners.forEach((fn) => fn());
  const load = (key, fallback) => store.getJSON(key, fallback);
  const save = (key, value) => {
    store.setJSON(key, value);
    changed();
  };

  /* ---------- favourites ---------- */
  const favourites = () => load("favs", []).filter((id) => recipe(id));
  const isFavourite = (id) => favourites().includes(id);
  function toggleFavourite(id) {
    const list = favourites();
    const on = !list.includes(id);
    save("favs", on ? [id, ...list] : list.filter((x) => x !== id));
    return on;
  }

  /* ---------- notes and servings ---------- */
  const note = (id) => load("notes", {})[id] || "";
  function setNote(id, text) {
    const notes = load("notes", {});
    if (text.trim()) notes[id] = text.slice(0, 1000);
    else delete notes[id];
    store.setJSON("notes", notes); // no redraw: the note box is being typed in
  }
  const servings = (r) => load("servings", {})[r.id] || r.serves;
  function setServings(id, n) {
    const all = load("servings", {});
    all[id] = n;
    store.setJSON("servings", all);
  }

  /* ---------- amounts ----------
     Grams and kilograms (ml and litres, tea- and tablespoons) are counted in one base unit so
     the same ingredient from two recipes adds up. */
  const BASE = { kg: ["g", 1000], l: ["ml", 1000], tbsp: ["tsp", 3] };
  function toBase(amount, unit) {
    const b = BASE[unit];
    return b ? { amount: amount * b[1], unit: b[0] } : { amount, unit };
  }
  // The amounts of a recipe for `n` people, in base units.
  function scaled(r, n) {
    return r.items.map((it) => ({ ...it, ...toBase(it.amount * (n / r.serves), it.unit) }));
  }

  /* ---------- shopping list ----------
     items: { key, ing, amount, unit, from: [recipe ids], done }
     extra: { key, text, done } for things typed in by hand */
  const shopping = () => load("shop", { items: [], extra: [] });
  function addToShopping(r, n, onlyIngs) {
    const list = shopping();
    let added = 0;
    scaled(r, n).forEach((it) => {
      if (INGREDIENTS[it.ing].staple) return; // salt, water, oil: everyone has them
      if (onlyIngs && !onlyIngs.includes(it.ing)) return;
      const key = it.ing + "|" + it.unit;
      const same = list.items.find((x) => x.key === key);
      if (same) {
        same.amount += it.amount;
        if (!same.from.includes(r.id)) same.from.push(r.id);
        same.done = false;
      } else {
        list.items.push({ key, ing: it.ing, amount: it.amount, unit: it.unit, from: [r.id], done: false });
      }
      added++;
    });
    save("shop", list);
    return added;
  }
  function addExtra(text) {
    const list = shopping();
    list.extra.push({ key: "x" + Date.now().toString(36), text: text.trim().slice(0, 80), done: false });
    save("shop", list);
  }
  function setDone(key, done) {
    const list = shopping();
    const item = list.items.find((x) => x.key === key) || list.extra.find((x) => x.key === key);
    if (item) item.done = done;
    save("shop", list);
  }
  function removeItem(key) {
    const list = shopping();
    const before = JSON.parse(JSON.stringify(list));
    list.items = list.items.filter((x) => x.key !== key);
    list.extra = list.extra.filter((x) => x.key !== key);
    save("shop", list);
    return () => save("shop", before); // undo
  }
  function clearShopping(onlyDone) {
    const list = shopping();
    const before = JSON.parse(JSON.stringify(list));
    if (onlyDone) {
      list.items = list.items.filter((x) => !x.done);
      list.extra = list.extra.filter((x) => !x.done);
    } else {
      list.items = [];
      list.extra = [];
    }
    save("shop", list);
    return () => save("shop", before);
  }

  /* ---------- meal plan: one week, lunch and dinner ---------- */
  const DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
  const MEALS = ["lunch", "dinner"];
  const plan = () => load("plan", {});
  function setMeal(day, meal, id) {
    const p = plan();
    p[day] = p[day] || {};
    if (id) p[day][meal] = id;
    else delete p[day][meal];
    save("plan", p);
  }
  function clearPlan() {
    const before = plan();
    save("plan", {});
    return () => save("plan", before);
  }
  // Puts everything planned this week on the shopping list (each meal for its servings).
  function planToShopping() {
    const p = plan();
    let meals = 0;
    DAYS.forEach((d) => MEALS.forEach((m) => {
      const r = p[d] && recipe(p[d][m]);
      if (r) {
        addToShopping(r, servings(r));
        meals++;
      }
    }));
    return meals;
  }

  /* ---------- "what's in my kitchen" (ingredient search) ---------- */
  const pantry = () => load("pantry", []).filter((id) => INGREDIENTS[id]);
  const setPantry = (ids) => save("pantry", [...new Set(ids)]);

  window.addEventListener("storage", (e) => e.key && e.key.startsWith(window.APP_NS + ":") && !/:(lang|theme)$/.test(e.key) && changed());

  window.Store = {
    favourites, isFavourite, toggleFavourite,
    note, setNote, servings, setServings, scaled,
    shopping, addToShopping, addExtra, setDone, removeItem, clearShopping,
    DAYS, MEALS, plan, setMeal, clearPlan, planToShopping,
    pantry, setPantry,
    onChange: (fn) => listeners.push(fn),
  };
})();
