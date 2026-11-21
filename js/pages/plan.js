/* Week plan: lunch and dinner for each day. Pick a recipe per meal, let
   "Surprise me" fill the empty ones, and put the whole week on the
   shopping list (each meal for the servings last chosen for that recipe). */
(function () {
  "use strict";
  const { t } = Core;
  const { el, recipeName } = Site;
  const { RECIPES, CATEGORIES } = DATA;
  const $ = (id) => document.getElementById(id);
  // Lunch and dinner come from these categories (no desserts or breakfasts).
  const MEAL_CATS = ["main", "soup", "salad", "baking"];

  function select(day, meal, chosen) {
    const id = `meal-${day}-${meal}`;
    return el("div", { class: "field meal" },
      el("label", { for: id, text: t("meal." + meal) }),
      el("select", { id, class: "input", onchange: (e) => Store.setMeal(day, meal, e.target.value) },
        el("option", { value: "", text: t("plan.none") }),
        CATEGORIES.map((c) => el("optgroup", { label: t("cat." + c) },
          RECIPES.filter((r) => r.cat === c).map((r) => el("option", { value: r.id, text: recipeName(r), selected: chosen === r.id }))))),
      chosen && el("a", { class: "meal-link", href: "recipe.html?id=" + chosen, text: t("plan.openRecipe", { name: recipeName(DATA.recipe(chosen)) }) }));
  }

  function render() {
    const p = Store.plan();
    let meals = 0;
    $("week").replaceChildren(...Store.DAYS.map((d) => {
      const day = p[d] || {};
      const kcal = Store.MEALS.reduce((sum, m) => sum + (DATA.recipe(day[m]) ? DATA.recipe(day[m]).kcal : 0), 0);
      meals += Store.MEALS.filter((m) => DATA.recipe(day[m])).length;
      return el("section", { class: "day", "aria-labelledby": "day-" + d },
        el("h2", { id: "day-" + d, text: t("day." + d) }),
        Store.MEALS.map((m) => select(d, m, DATA.recipe(day[m]) ? day[m] : "")),
        el("p", { class: "day-kcal", text: kcal ? t("plan.kcal", { n: kcal }) : t("plan.empty") }));
    }));
    $("planSummary").textContent = t("plan.summary", { count: meals });
    $("toShopping").textContent = t("plan.toShopping");
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
