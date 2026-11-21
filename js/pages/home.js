/* Home: "What can I cook today?" You add the ingredients you have, and the
   recipes are ranked by how many of their ingredients you already have.
   Salt, pepper, oil and water are ignored (every kitchen has them). */
(function () {
  "use strict";
  const { t } = Core;
  const { el, ingName } = Site;
  const { INGREDIENTS, RECIPES } = DATA;
  const $ = (id) => document.getElementById(id);
  const QUICK = ["onion", "potato", "tomato", "egg", "rice", "beef", "flour", "milk", "carrot", "chicken"];

  const choosable = () => Object.values(INGREDIENTS).filter((i) => !i.staple);
  const needs = (r) => [...new Set(r.items.map((it) => it.ing).filter((id) => !INGREDIENTS[id].staple))];

  // Finds an ingredient from typed text, in any of the three languages.
  function findIngredient(text) {
    const q = text.trim().toLowerCase();
    if (!q) return null;
    const list = choosable();
    const exact = list.find((i) => Object.values(i.name).some((n) => n.toLowerCase() === q));
    if (exact) return exact.id;
    const starts = list.filter((i) => Object.values(i.name).some((n) => n.toLowerCase().startsWith(q)));
    return starts.length === 1 ? starts[0].id : null;
  }

  $("pantryForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const input = $("pantryInput");
    const id = findIngredient(input.value);
    if (!id) {
      $("pantryError").textContent = input.value.trim() ? t("home.notFound", { text: input.value.trim() }) : t("home.empty");
      input.setAttribute("aria-invalid", "true");
      return input.focus();
    }
    $("pantryError").textContent = "";
    input.removeAttribute("aria-invalid");
    input.value = "";
    Store.setPantry([...Store.pantry(), id]);
    input.focus();
  });
  $("pantryInput").addEventListener("input", () => {
    $("pantryError").textContent = "";
    $("pantryInput").removeAttribute("aria-invalid");
  });

  function toggle(id) {
    const have = Store.pantry();
    Store.setPantry(have.includes(id) ? have.filter((x) => x !== id) : [...have, id]);
  }

  function render() {
    const have = Store.pantry();
    $("ingList").replaceChildren(...choosable().map((i) => el("option", { value: ingName(i.id) })));

    // quick buttons for common ingredients
    $("quickIngs").replaceChildren(...QUICK.map((id) =>
      el("button", { type: "button", class: "chip", "aria-pressed": String(have.includes(id)), onclick: () => toggle(id) }, ingName(id))));

    // what you have (each one can be removed)
    $("pantryChips").replaceChildren(...(have.length
      ? [el("p", { class: "field-label", text: t("home.youHave", { count: have.length }) }),
        el("ul", { class: "chip-row" }, have.map((id) => el("li", null,
          el("button", { type: "button", class: "chip chip-remove", "aria-label": t("home.remove", { name: ingName(id) }), onclick: () => toggle(id) },
            el("span", { text: ingName(id) }), Site.icon("x", 14))))),
        el("button", { type: "button", class: "btn btn-ghost btn-small", text: t("home.clear"), onclick: () => Store.setPantry([]) })]
      : []));

    // recipes ranked by how much of them you can make
    const ranked = RECIPES.map((r) => {
      const need = needs(r);
      const got = need.filter((id) => have.includes(id));
      return { r, need, got, missing: need.filter((id) => !have.includes(id)) };
    }).filter((m) => m.got.length > 0)
      .sort((a, b) => b.got.length / b.need.length - a.got.length / a.need.length || a.missing.length - b.missing.length);

    $("matches").hidden = have.length === 0;
    $("ideas").hidden = have.length > 0;
    $("matchTitle").textContent = ranked.length ? t("home.matchTitle", { count: ranked.length }) : t("home.noMatch");
    $("matchList").replaceChildren(...ranked.slice(0, 12).map((m) => Site.card(m.r, matchInfo(m))));

    $("quickList").replaceChildren(...RECIPES.filter((r) => r.time <= 30).map((r) => Site.card(r)));
    $("classicList").replaceChildren(...["plov", "lagman", "manti", "samsa"].map((id) => Site.card(DATA.recipe(id))));
  }

  // "You have 5 of 7 · Missing: beef, carrot" + a button to add what's missing
  function matchInfo(m) {
    const all = m.missing.length === 0;
    return el("div", { class: "match-info" + (all ? " is-complete" : "") },
      el("p", { class: "match-score", text: all ? t("home.haveAll") : t("home.haveSome", { have: m.got.length, total: m.need.length }) }),
      !all && el("p", { class: "match-missing", text: t("home.missing", { list: m.missing.map(ingName).join(", ") }) }),
      !all && el("button", {
        type: "button", class: "btn btn-ghost btn-small", text: t("home.addMissing"),
        onclick: () => {
          const n = Store.addToShopping(m.r, Store.servings(m.r), m.missing);
          Core.toast(t("shop.addedCount", { count: n }));
        },
      }));
  }

  Site.start(render, { title: () => t("page.home") });
})();
