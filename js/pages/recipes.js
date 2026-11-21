/* All recipes: search by name or ingredient, filter by category, cuisine,
   time, difficulty and vegetarian, and sort. The filters are kept in the
   address (recipes.html?cat=soup&veg=1), so Back and shared links work. */
(function () {
  "use strict";
  const { t } = Core;
  const { el, ingName, recipeName } = Site;
  const { RECIPES, CATEGORIES } = DATA;
  const $ = (id) => document.getElementById(id);
  const form = $("filters");

  const DEFAULTS = { q: "", cat: "all", cuisine: "all", maxTime: "any", level: "any", sort: "name", veg: false };
  const OPTIONS = {
    cuisine: ["all", "uz", "world"],
    maxTime: ["any", "30", "60", "120"],
    level: ["any", "1", "2", "3"],
    sort: ["name", "time", "kcal", "level"],
  };

  function readUrl() {
    const p = new URLSearchParams(location.search);
    const s = { ...DEFAULTS };
    s.q = (p.get("q") || "").slice(0, 60);
    if (["all", ...CATEGORIES].includes(p.get("cat"))) s.cat = p.get("cat");
    Object.keys(OPTIONS).forEach((k) => OPTIONS[k].includes(p.get(k)) && (s[k] = p.get(k)));
    s.veg = p.get("veg") === "1";
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

  // The text to search in: the name in every language plus the ingredients.
  const haystack = (r) => [...Object.values(r.name), ...r.items.flatMap((it) => Object.values(DATA.INGREDIENTS[it.ing].name))].join(" ").toLowerCase();

  function results() {
    const q = state.q.trim().toLowerCase();
    const list = RECIPES.filter((r) =>
      (!q || haystack(r).includes(q)) &&
      (state.cat === "all" || r.cat === state.cat) &&
      (state.cuisine === "all" || r.cuisine === state.cuisine) &&
      (state.maxTime === "any" || r.time <= Number(state.maxTime)) &&
      (state.level === "any" || r.level === Number(state.level)) &&
      (!state.veg || r.veg));
    const by = {
      name: (a, b) => recipeName(a).localeCompare(recipeName(b), Core.getLang()),
      time: (a, b) => a.time - b.time,
      kcal: (a, b) => a.kcal - b.kcal,
      level: (a, b) => a.level - b.level || a.time - b.time,
    }[state.sort];
    return list.sort(by);
  }

  function fillControls() {
    $("q").value = state.q;
    $("catChips").replaceChildren(...["all", ...CATEGORIES].map((c) =>
      el("label", { class: "chip chip-radio" },
        el("input", { type: "radio", name: "cat", value: c, checked: state.cat === c }),
        el("span", { text: c === "all" ? t("filter.all") : t("cat." + c) }))));
    const label = { cuisine: (v) => (v === "all" ? t("filter.any") : t("cuisine." + v)), maxTime: (v) => (v === "any" ? t("filter.any") : t("filter.upTo", { time: Site.minutes(Number(v)) })), level: (v) => (v === "any" ? t("filter.any") : t("level." + v)), sort: (v) => t("sort." + v) };
    Object.keys(OPTIONS).forEach((k) => {
      $(k).replaceChildren(...OPTIONS[k].map((v) => el("option", { value: v, text: label[k](v), selected: state[k] === v })));
    });
    $("veg").checked = state.veg;
  }

  function renderList() {
    const list = results();
    $("count").textContent = t("filter.count", { count: list.length });
    $("list").replaceChildren(...list.map((r) => Site.card(r)));
    $("list").hidden = list.length === 0;
    $("empty").hidden = list.length > 0;
    $("reset").hidden = JSON.stringify(state) === JSON.stringify(DEFAULTS);
    // Each recipe card also shows which searched ingredient matched (helps "search by ingredient").
    const q = state.q.trim().toLowerCase();
    if (q) list.forEach((r, i) => {
      const hit = r.items.find((it) => Object.values(DATA.INGREDIENTS[it.ing].name).some((n) => n.toLowerCase().includes(q)));
      if (hit && !Object.values(r.name).some((n) => n.toLowerCase().includes(q))) {
        $("list").children[i].querySelector(".card-about").after(el("p", { class: "card-hit", text: t("filter.contains", { name: ingName(hit.ing) }) }));
      }
    });
  }

  form.addEventListener("input", (e) => {
    if (e.target.id === "q") {
      state.q = e.target.value;
      writeUrl();
      renderList();
    }
  });
  form.addEventListener("change", () => {
    state.cat = form.querySelector('[name="cat"]:checked').value;
    Object.keys(OPTIONS).forEach((k) => (state[k] = $(k).value));
    state.veg = $("veg").checked;
    writeUrl();
    renderList();
  });
  form.addEventListener("submit", (e) => e.preventDefault());
  const reset = () => {
    state = { ...DEFAULTS };
    writeUrl();
    fillControls();
    renderList();
    $("q").focus();
  };
  $("reset").addEventListener("click", reset);
  $("reset2").addEventListener("click", reset);

  function render() {
    fillControls();
    renderList();
  }
  Site.start(render, { title: () => t("page.recipes"), onChange: renderList });
})();
