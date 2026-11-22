/* All recipes: search by dish or ingredient (any of the 3 languages, plus
   aliases), filter by category, region, time, difficulty and vegetarian, a
   home-page collection, and sort. The filters are kept in the address
   (recipes.html?cat=soup&cuisine=east-asia), so Back and shared links work.
   Old links with cuisine=uz / cuisine=world still work. */
(function () {
  "use strict";
  const { t } = Core;
  const { el, icon, ingName, recipeName } = Site;
  const { RECIPES, CATEGORIES, REGIONS, COLLECTIONS } = DATA;
  const $ = (id) => document.getElementById(id);
  const form = $("filters");

  const DEFAULTS = { q: "", cat: "all", cuisine: "all", maxTime: "any", level: "any", sort: "name", veg: false, collection: "" };
  const OPTIONS = {
    cuisine: ["all", ...REGIONS, "world"],
    maxTime: ["any", "30", "60", "120"],
    level: ["any", "1", "2", "3"],
    sort: ["name", "time", "kcal", "level"],
  };

  function readUrl() {
    const p = new URLSearchParams(location.search);
    const s = { ...DEFAULTS };
    s.q = (p.get("q") || "").slice(0, 60);
    if (["all", ...CATEGORIES].includes(p.get("cat"))) s.cat = p.get("cat");
    const cuisine = p.get("cuisine") === "uz" ? "central-asia" : p.get("cuisine"); // old links
    if (OPTIONS.cuisine.includes(cuisine)) s.cuisine = cuisine;
    ["maxTime", "level", "sort"].forEach((k) => OPTIONS[k].includes(p.get(k)) && (s[k] = p.get(k)));
    s.veg = p.get("veg") === "1";
    if (COLLECTIONS.some((c) => c.id === p.get("collection"))) s.collection = p.get("collection");
    return s;
  }
  let state = readUrl();
  function writeUrl() {
    const p = new URLSearchParams();
    Object.entries(state).forEach(([k, v]) => {
      if (v !== DEFAULTS[k]) p.set(k, v === true ? "1" : v);
    });
    history.replaceState(null, "", p.toString() ? "?" + p : location.pathname);
  }

  // The text to search in: the name in every language, ingredients and their aliases, the country.
  const haystack = (r) => [...Object.values(r.name), ...Object.values(r.country),
    ...r.items.flatMap((it) => [...Object.values(DATA.INGREDIENTS[it.ing].name), ...DATA.INGREDIENTS[it.ing].aliases])].join(" ").toLowerCase();

  function results() {
    const q = state.q.trim().toLowerCase();
    const col = COLLECTIONS.find((c) => c.id === state.collection);
    const list = RECIPES.filter((r) =>
      (!q || haystack(r).includes(q)) &&
      (state.cat === "all" || r.cat === state.cat) &&
      (state.cuisine === "all" || (state.cuisine === "world" ? r.region !== "central-asia" : r.region === state.cuisine)) &&
      (state.maxTime === "any" || r.time <= Number(state.maxTime)) &&
      (state.level === "any" || r.level === Number(state.level)) &&
      (!state.veg || r.veg) &&
      (!col || col.recipes.includes(r.id)));
    const by = {
      name: (a, b) => recipeName(a).localeCompare(recipeName(b), Core.getLang()),
      time: (a, b) => a.time - b.time,
      kcal: (a, b) => a.kcal - b.kcal,
      level: (a, b) => a.level - b.level || a.time - b.time,
    }[state.sort];
    return list.sort(by);
  }

  const optionLabel = {
    cuisine: (v) => (v === "all" ? t("filter.allRegions") : v === "world" ? t("filter.world") : Site.regionName(v)),
    maxTime: (v) => (v === "any" ? t("filter.any") : t("filter.upTo", { time: Site.minutes(Number(v)) })),
    level: (v) => (v === "any" ? t("filter.any") : t("level." + v)),
    sort: (v) => t("sort." + v),
  };
  function fillControls() {
    $("q").value = state.q;
    $("catChips").replaceChildren(...["all", ...CATEGORIES].map((c) =>
      el("label", { class: "chip chip-radio" },
        el("input", { type: "radio", name: "cat", value: c, checked: state.cat === c }),
        el("span", { text: c === "all" ? t("filter.all") : t("cat." + c) }))));
    Object.keys(OPTIONS).forEach((k) => {
      $(k).replaceChildren(...OPTIONS[k].map((v) => el("option", { value: v, text: optionLabel[k](v), selected: state[k] === v })));
    });
    $("veg").checked = state.veg;
    $("listAnnot").textContent = t("filter.annot", { count: RECIPES.length, regions: REGIONS.length });
  }

  // The filters in use, as removable chips (handy on phones, where the panel is closed).
  function renderActive() {
    const active = [];
    if (state.collection) active.push(["collection", t("col." + state.collection)]);
    if (state.cat !== "all") active.push(["cat", t("cat." + state.cat)]);
    if (state.cuisine !== "all") active.push(["cuisine", optionLabel.cuisine(state.cuisine)]);
    if (state.maxTime !== "any") active.push(["maxTime", optionLabel.maxTime(state.maxTime)]);
    if (state.level !== "any") active.push(["level", t("level." + state.level)]);
    if (state.veg) active.push(["veg", t("recipe.veg")]);
    $("activeFilters").replaceChildren(...active.map(([k, label]) =>
      el("button", { type: "button", class: "chip", "aria-label": t("filter.remove", { name: label }), onclick: () => {
        state[k] = DEFAULTS[k];
        writeUrl();
        fillControls();
        renderList();
        $("q").focus();
      } }, el("span", { text: label }), icon("x", 14))),
      ...(active.length > 1 ? [el("button", { type: "button", class: "btn btn-ghost btn-small", text: t("filter.reset"), onclick: reset })] : []));
    $("filtersToggle").replaceChildren(icon("sliders", 18), el("span", { text: active.length ? t("filter.toggleN", { count: active.length }) : t("filter.toggle") }));
  }


  let fade = 0;
  function renderList() {
    const list = results();
    const grid = $("list");
    const draw = () => {
      $("count").textContent = t("filter.count", { count: list.length });
      grid.replaceChildren(...list.map((r) => Site.card(r, { sizes: "(min-width: 1120px) 270px, (min-width: 600px) 45vw, 100vw" })));
      grid.hidden = list.length === 0;
      $("empty").hidden = list.length > 0;
      // show which searched ingredient matched (helps "search by ingredient")
      const q = state.q.trim().toLowerCase();
      if (q) list.forEach((r, i) => {
        const hit = r.items.find((it) => [...Object.values(DATA.INGREDIENTS[it.ing].name), ...DATA.INGREDIENTS[it.ing].aliases].some((n) => n.toLowerCase().includes(q)));
        if (hit && !Object.values(r.name).some((n) => n.toLowerCase().includes(q))) {
          grid.children[i].querySelector(".card-title").after(el("p", { class: "card-hit", text: t("filter.contains", { name: ingName(hit.ing) }) }));
        }
      });
      grid.classList.remove("is-updating");
      renderActive();
    };
    // a quick fade while the results change (none with reduced motion)
    if (matchMedia("(prefers-reduced-motion: reduce)").matches || !grid.children.length) return draw();
    grid.classList.add("is-updating");
    clearTimeout(fade);
    fade = setTimeout(draw, 110);
  }

  // The search box and sort sit outside the filter panel in the page, so they get their own listeners.
  $("q").before(icon("search", 18));
  $("q").addEventListener("input", (e) => {
    state.q = e.target.value;
    writeUrl();
    renderList();
  });
  form.addEventListener("change", () => {
    state.cat = form.querySelector('[name="cat"]:checked').value;
    Object.keys(OPTIONS).forEach((k) => (state[k] = $(k).value));
    state.veg = $("veg").checked;
    writeUrl();
    renderList();
  });
  $("sort").addEventListener("change", () => {
    state.sort = $("sort").value;
    writeUrl();
    renderList();
  });
  form.addEventListener("submit", (e) => e.preventDefault());
  function reset() {
    state = { ...DEFAULTS };
    writeUrl();
    fillControls();
    renderList();
    $("q").focus();
  }
  $("reset2").addEventListener("click", reset);
  // phones and tablets: the filter panel opens under the search
  $("filtersToggle").addEventListener("click", () => {
    const open = !form.classList.contains("is-open");
    form.classList.toggle("is-open", open);
    $("filtersToggle").setAttribute("aria-expanded", String(open));
    if (open) form.querySelector("input, select").focus();
  });

  function render() {
    fillControls();
    renderList();
  }
  Site.start(render, { title: () => t("page.recipes"), onChange: renderList });
})();
