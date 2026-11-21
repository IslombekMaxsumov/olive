/* Week plan: lunch and dinner for each day. Pick a recipe per meal, let
   "Surprise me" fill the empty ones, and put the whole week on the
   shopping list (each meal for the servings last chosen for that recipe).
   On phones a day picker shows one day at a time (today first). */
(function () {
  "use strict";
  const { t } = Core;
  const { el, recipeName, photo, icon } = Site;
  const { RECIPES, CATEGORIES } = DATA;
  const $ = (id) => document.getElementById(id);
  // Lunch and dinner come from these categories (no desserts or breakfasts).
  const MEAL_CATS = ["main", "soup", "salad", "baking"];
  const todayKey = Store.DAYS[(new Date().getDay() + 6) % 7]; // Monday = 0
  let shown = todayKey;

  function meal(day, m, chosen) {
    const id = `meal-${day}-${m}`;
    const r = chosen && DATA.recipe(chosen);
    return el("div", { class: "meal" },
      r ? el("a", { class: "photo-link", href: "recipe.html?id=" + r.id, tabindex: "-1", "aria-hidden": "true" }, photo(r, { sizes: "72px" }))
        : el("div", { class: "meal-empty", "aria-hidden": "true" }, icon("plus", 20)),
      el("div", { class: "field" },
        el("label", { for: id, text: t("meal." + m) }),
        el("select", { id, class: "input", onchange: (e) => Store.setMeal(day, m, e.target.value) },
          el("option", { value: "", text: t("plan.none") }),
          CATEGORIES.map((c) => el("optgroup", { label: t("cat." + c) },
            RECIPES.filter((x) => x.cat === c).map((x) => el("option", { value: x.id, text: recipeName(x), selected: chosen === x.id })))))),
      r && el("a", { class: "meal-link", href: "recipe.html?id=" + r.id, text: t("plan.openRecipe", { name: recipeName(r) }) }));
  }

  function render() {
    const p = Store.plan();
    let meals = 0;
    $("dayPicker").replaceChildren(...Store.DAYS.map((d) => {
      const n = Store.MEALS.filter((m) => p[d] && DATA.recipe(p[d][m])).length;
      return el("button", { type: "button", class: "chip", "aria-pressed": String(d === shown), "aria-label": t("day." + d) + ", " + t("plan.summary", { count: n }), onclick: () => {
        shown = d;
        render();
        $("dayPicker").querySelector('[aria-pressed="true"]').focus();
      } }, el("span", { text: t("dayShort." + d) }), el("small", { text: n ? "●".repeat(n) : "○" }));
    }));
    $("week").replaceChildren(...Store.DAYS.map((d) => {
      const day = p[d] || {};
      const kcal = Store.MEALS.reduce((sum, m) => sum + (DATA.recipe(day[m]) ? DATA.recipe(day[m]).kcal : 0), 0);
      meals += Store.MEALS.filter((m) => DATA.recipe(day[m])).length;
      return el("section", { class: "day" + (d === todayKey ? " is-today" : "") + (d === shown ? " is-shown" : ""), "aria-labelledby": "day-" + d },
        el("div", { class: "day-head" },
          el("h2", { id: "day-" + d, text: t("day." + d) }),
          d === todayKey && el("span", { class: "annot", text: t("plan.today") })),
        Store.MEALS.map((m) => meal(d, m, DATA.recipe(day[m]) ? day[m] : "")),
        el("p", { class: "day-kcal", text: kcal ? t("plan.kcal", { n: kcal }) : t("plan.empty") }));
    }));
    $("planSummary").textContent = t("plan.summary", { count: meals });
    // keep the chosen day visible in the scrolling day picker (phones)
    const picker = $("dayPicker");
    const on = picker.querySelector('[aria-pressed="true"]');
    if (on && picker.scrollWidth > picker.clientWidth) picker.scrollLeft = on.offsetLeft - picker.clientWidth / 2 + on.offsetWidth / 2;
    $("toShopping").replaceChildren(icon("cart", 18), el("span", { text: t("plan.toShopping") }));
    $("toShopping").disabled = meals === 0;
    $("clearPlan").disabled = meals === 0;
  }

  $("toShopping").addEventListener("click", () => {
    const n = Store.planToShopping();
    Core.toast(t("plan.addedToShop", { count: n }), { label: t("shop.open"), onClick: () => (location.href = "shopping.html") });
  });
  $("clearPlan").addEventListener("click", () => {
    const undo = Store.clearPlan();
    Core.toast(t("plan.cleared"), { label: t("action.undo"), onClick: undo });
  });
  // Fills the empty meals with random lunch/dinner recipes, trying not to repeat.
  $("surprise").addEventListener("click", () => {
    const p = Store.plan();
    const pool = RECIPES.filter((r) => MEAL_CATS.includes(r.cat));
    const used = new Set(Store.DAYS.flatMap((d) => Store.MEALS.map((m) => p[d] && p[d][m])));
    let filled = 0;
    Store.DAYS.forEach((d) => Store.MEALS.forEach((m) => {
      if (p[d] && DATA.recipe(p[d][m])) return;
      const fresh = pool.filter((r) => !used.has(r.id));
      const pick = (fresh.length ? fresh : pool)[Math.floor(Math.random() * (fresh.length || pool.length))];
      used.add(pick.id);
      Store.setMeal(d, m, pick.id);
      filled++;
    }));
    Core.toast(filled ? t("plan.surprised", { count: filled }) : t("plan.full"));
  });

  Site.start(render, { title: () => t("page.plan") });
})();
