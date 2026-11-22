/* Home: "What can I cook today?" You add the ingredients you have, and the
   recipes are ranked by how many of their ingredients you already have
   (salt, pepper, oil and water don't count: every kitchen has them).
   With no ingredients added, the page shows the magazine sections:
   featured recipe, around the world, comfort classics, quick meals, collections. */
(function () {
  "use strict";
  const { t } = Core;
  const { el, ingName, recipeName, photo, icon } = Site;
  const { INGREDIENTS, RECIPES } = DATA;
  const $ = (id) => document.getElementById(id);
  const QUICK = ["onion", "potato", "tomato", "egg", "rice", "chicken", "beef", "flour", "carrot", "garlic", "pepper", "milk"];
  const lang = () => Core.getLang();

  // only ingredients that at least one recipe uses (and not salt, oil, water...)
  const used = new Set(RECIPES.flatMap((r) => r.items.map((it) => it.ing)));
  const choosable = () => Object.values(INGREDIENTS).filter((i) => !i.staple && used.has(i.id));
  const needs = (r) => [...new Set(r.items.filter((it) => !INGREDIENTS[it.ing].staple && !it.optional).map((it) => it.ing))];
  const words = (i) => [...Object.values(i.name), ...i.aliases].map((w) => w.toLowerCase());

  // Finds an ingredient from typed text, in any of the three languages or an alias.
  function findIngredient(text) {
    const q = text.trim().toLowerCase();
    if (!q) return null;
    const list = choosable();
    const exact = list.find((i) => words(i).includes(q));
    if (exact) return exact.id;
    const starts = list.filter((i) => words(i).some((w) => w.startsWith(q)));
    return starts.length === 1 ? starts[0].id : null;
  }

  let lastAdded = null; // the chip that should animate in
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
    lastAdded = id;
    Store.setPantry([...Store.pantry(), id]);
    input.focus();
  });
  $("pantryInput").addEventListener("input", () => {
    $("pantryError").textContent = "";
    $("pantryInput").removeAttribute("aria-invalid");
  });

  function toggle(id) {
    const have = Store.pantry();
    if (!have.includes(id)) lastAdded = id;
    Store.setPantry(have.includes(id) ? have.filter((x) => x !== id) : [...have, id]);
  }
  // remove a chip with a short animation first (reduced motion: straight away)
  function removeChip(id, chip) {
    const go = () => Store.setPantry(Store.pantry().filter((x) => x !== id));
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return go();
    chip.classList.add("chip-out");
    setTimeout(go, 190);
    const next = chip.closest("li").nextElementSibling || chip.closest("li").previousElementSibling;
    setTimeout(() => {
      const target = next && document.querySelector(`[data-chip="${next.dataset.id}"]`);
      (target || $("pantryInput")).focus();
    }, 200);
  }

  /* ---------- search part ---------- */
  function renderPantry() {
    const have = Store.pantry();
    $("ingList").replaceChildren(...choosable().map((i) => el("option", { value: ingName(i.id) })));
    $("quickIngs").replaceChildren(...QUICK.map((id) =>
      el("button", { type: "button", class: "chip", "aria-pressed": String(have.includes(id)), onclick: () => toggle(id) }, ingName(id))));
    $("pantryChips").replaceChildren(...(have.length
      ? [el("div", { class: "pantry-chips-head" },
          el("p", { class: "field-label", text: t("home.youHave", { count: have.length }) }),
          el("button", { type: "button", class: "btn btn-ghost btn-small", text: t("home.clear"), onclick: () => Store.setPantry([]) })),
        el("ul", { class: "chip-row" }, have.map((id) => el("li", { "data-id": id },
          el("button", { type: "button", class: "chip chip-have" + (id === lastAdded ? " chip-in" : ""), "data-chip": id, "aria-label": t("home.remove", { name: ingName(id) }), onclick: (e) => removeChip(id, e.currentTarget) },
            el("span", { text: ingName(id) }), icon("x", 14)))))]
      : []));
    lastAdded = null;

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
    $("matchList").replaceChildren(...ranked.slice(0, 12).map(match));
  }
  // one result row: photo, name, "you have 5 of 7" with a dot per ingredient, what's missing
  function match(m) {
    const all = m.missing.length === 0;
    return el("article", { class: "match" },
      el("a", { class: "photo-link", href: "recipe.html?id=" + m.r.id, tabindex: "-1", "aria-hidden": "true" }, photo(m.r, { sizes: "140px" })),
      el("div", null,
        el("p", { class: "label", text: Site.country(m.r) + " · " + Site.minutes(m.r.time) }),
        el("h3", null, el("a", { href: "recipe.html?id=" + m.r.id, text: recipeName(m.r) })),
        el("div", { class: "match-dots", "aria-hidden": "true" }, m.need.map((id) => el("span", { class: m.got.includes(id) ? "is-have" : "", title: ingName(id) }))),
        el("p", { class: "match-score" + (all ? " is-complete" : ""), text: all ? t("home.haveAll") : t("home.haveSome", { have: m.got.length, total: m.need.length }) }),
        !all && el("p", { class: "match-missing", text: t("home.missing", { list: m.missing.map(ingName).join(", ") }) })),
      !all && el("button", {
        type: "button", class: "btn btn-ghost btn-small", onclick: () => {
          const n = Store.addToShopping(m.r, Store.servings(m.r), m.missing);
          Core.toast(t("shop.addedCount", { count: n }), { label: t("shop.open"), onClick: () => (location.href = "shopping.html") });
        },
      }, icon("cart", 16), el("span", { text: t("home.addMissing") })));
  }

  /* ---------- magazine part ---------- */
  function renderMagazine() {
    // hero: the headline with two words in italic, and one photograph
    const h = t("home.title", { mark: "\u0000" }).split("\u0000");
    $("homeTitle").replaceChildren(h[0], el("em", { text: t("home.titleMark") }), h[1] || "");
    $("heroAnnot").textContent = t("home.annot", { count: RECIPES.length, regions: DATA.REGIONS.length });
    const cover = DATA.recipe("paella");
    $("heroArt").replaceChildren(
      el("a", { class: "photo-link", href: "recipe.html?id=" + cover.id, tabindex: "-1", "aria-hidden": "true" }, photo(cover, { eager: true, sizes: "(min-width: 900px) 440px, 100vw" })),
      el("a", { class: "hero-caption", href: "recipe.html?id=" + cover.id },
        el("span", { text: t("home.onCover") }), el("strong", { text: recipeName(cover) })));

    // featured recipe: changes every day, from the dishes that aren't on the cover
    const pool = RECIPES.filter((r) => r.id !== cover.id && window.PHOTOS && PHOTOS[r.id]);
    const f = pool[Math.floor(Date.now() / 86400000) % pool.length];
    $("feature").replaceChildren(
      el("a", { class: "photo-link", href: "recipe.html?id=" + f.id, tabindex: "-1", "aria-hidden": "true" }, photo(f, { sizes: "(min-width: 900px) 58vw, 100vw" })),
      el("div", null,
        el("p", { class: "label", text: t("home.featured") + " · " + Site.regionName(f.region) }),
        el("h2", { id: "featTitle", text: recipeName(f) }),
        el("p", { class: "lead", text: f.about[lang()] }),
        Site.meta(f),
        el("a", { class: "btn btn-ghost", href: "recipe.html?id=" + f.id, text: t("home.cookThis") })));

    // around the world: a typeset index of the regions and their dishes
    $("regions").replaceChildren(...DATA.REGIONS.map((id) => {
      const list = RECIPES.filter((r) => r.region === id);
      return el("a", { class: "region", href: "recipes.html?cuisine=" + id },
        el("strong", { text: Site.regionName(id) }),
        el("span", { class: "count", text: t("filter.count", { count: list.length }) }),
        el("span", { class: "dishes", text: list.slice(0, 3).map(recipeName).join(", ") + (list.length > 3 ? "…" : "") }));
    }));

    $("classicList").replaceChildren(...["ramen", "tagine", "borscht", "butterchicken"].map((id) =>
      Site.card(DATA.recipe(id), { sizes: "(min-width: 1120px) 270px, (min-width: 600px) 45vw, 100vw" })));

    $("quickList").replaceChildren(...RECIPES.filter((r) => r.time <= 35).sort((a, b) => a.time - b.time).map((r, i) =>
      el("a", { class: "quick-row", href: "recipe.html?id=" + r.id },
        el("span", { class: "q-num", text: String(i + 1).padStart(2, "0") }),
        el("span", { class: "q-title", text: recipeName(r) }),
        el("span", { class: "q-meta", text: Site.minutes(r.time) }),
        photo(r, { sizes: "48px" }))));

    $("collections").replaceChildren(...DATA.COLLECTIONS.map((c) =>
      el("a", { class: "collection", href: "recipes.html?collection=" + c.id },
        el("p", { class: "label", text: t("filter.count", { count: c.recipes.length }) }),
        el("h3", { text: t("col." + c.id) }),
        el("p", { text: t("col." + c.id + ".text") }))));
  }

  function render() {
    renderPantry();
    renderMagazine();
  }
  Site.start(render, { title: () => t("page.home"), onChange: renderPantry });
})();
