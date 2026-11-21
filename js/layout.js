/* Parts shared by every page: header (menu, language, theme), footer,
   formatting of amounts and times, the recipe card and page start-up.
   A page calls  Site.start(render)  and `render` runs again when the
   language or the saved data change. Text from data goes in with textContent. */
(function () {
  "use strict";
  const { t } = Core;
  const page = document.body.dataset.page;

  function el(tag, props, ...children) {
    const node = document.createElement(tag);
    Object.entries(props || {}).forEach(([key, value]) => {
      if (value === null || value === undefined || value === false) return;
      if (key === "class") node.className = value;
      else if (key === "text") node.textContent = value;
      else if (key.startsWith("on")) node.addEventListener(key.slice(2), value);
      else node.setAttribute(key, value === true ? "" : value);
    });
    children.flat(Infinity).forEach((c) => c !== null && c !== undefined && c !== false && node.append(c));
    return node;
  }
  function svgEl(tag, attrs, ...children) {
    const node = document.createElementNS("http://www.w3.org/2000/svg", tag);
    Object.entries(attrs || {}).forEach(([k, v]) => v !== null && v !== undefined && node.setAttribute(k, v));
    children.flat().forEach((c) => c && node.append(c));
    return node;
  }

  /* ---------- icons (Lucide, ISC licence; fixed strings) ---------- */
  const ICONS = {
    home: '<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
    book: '<path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20"/>',
    calendar: '<path d="M8 2v4M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/>',
    heart: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
    list: '<path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect width="8" height="4" x="8" y="2" rx="1"/><path d="m9 14 2 2 4-4"/>',
    clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
    flame: '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
    gauge: '<path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/>',
    search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
    plus: '<path d="M5 12h14M12 5v14"/>',
    minus: '<path d="M5 12h14"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    timer: '<path d="M10 2h4M12 14l3-3"/><circle cx="12" cy="14" r="8"/>',
    printer: '<path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6"/><rect x="6" y="14" width="12" height="8" rx="1"/>',
    cart: '<circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>',
    trash: '<path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>',
    copy: '<rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
    leaf: '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>',
    moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
  };
  function icon(name, size = 20) {
    const s = svgEl("svg", { viewBox: "0 0 24 24", width: size, height: size, fill: "none", stroke: "currentColor", "stroke-width": 2, "stroke-linecap": "round", "stroke-linejoin": "round", "aria-hidden": "true", class: "icon icon-" + name });
    s.innerHTML = ICONS[name] || "";
    return s;
  }

  /* ---------- formatting ---------- */
  const lang = () => Core.getLang();
  function num(n, decimals = 0) {
    const [int, frac] = Number(n || 0).toFixed(decimals).split(".");
    const sep = lang() === "en" ? "." : ",";
    return int.replace(/\B(?=(\d{3})+(?!\d))/g, lang() === "en" ? "," : " ") + (frac && Number(frac) ? sep + frac.replace(/0+$/, "") : "");
  }
  // 0.5 → ½, 1.25 → 1¼ (for pieces, spoons, bunches)
  const FRACTIONS = [[0.25, "¼"], [0.333, "⅓"], [0.5, "½"], [0.667, "⅔"], [0.75, "¾"]];
  function fraction(n) {
    const whole = Math.floor(n + 0.06);
    const rest = n - whole;
    if (rest < 0.12) return String(whole);
    const near = FRACTIONS.reduce((a, b) => (Math.abs(b[0] - rest) < Math.abs(a[0] - rest) ? b : a));
    return (whole ? whole : "") + near[1];
  }
  // Countable units are rounded to steps a cook can measure: half an onion,
  // whole garlic cloves, quarter spoons.
  const STEP = { pcs: 0.5, head: 0.5, clove: 1, bunch: 0.25, tbsp: 0.25, tsp: 0.25, pinch: 1 };
  // amount in base units (g, ml, pcs...) → "1,2 kg", "250 g", "1½ tbsp"
  function amount(value, unit) {
    let n = value;
    let u = unit;
    if (u === "g" && n >= 1000) { n /= 1000; u = "kg"; }
    if (u === "ml" && n >= 1000) { n /= 1000; u = "l"; }
    if (u === "tsp" && n >= 3) { n /= 3; u = "tbsp"; } // 3 teaspoons = 1 tablespoon
    let text;
    if (STEP[u]) {
      n = Math.max(STEP[u], Math.round(n / STEP[u]) * STEP[u]); // never "0"
      text = fraction(n);
    } else if (u === "kg" || u === "l") text = num(n, 1);
    else text = num(n >= 100 ? Math.round(n / 5) * 5 : n >= 10 ? Math.round(n) : n, n >= 10 ? 0 : 1);
    return t("unit." + u, { n: text, count: Math.ceil(n) });
  }
  const ingName = (id) => DATA.INGREDIENTS[id].name[lang()];
  const recipeName = (r) => r.name[lang()];
  // 95 → "1 h 35 min", 40 → "40 min"
  function minutes(m) {
    const h = Math.floor(m / 60);
    const rest = m % 60;
    if (!h) return t("time.m", { m });
    return rest ? t("time.hm", { h, m: rest }) : t("time.h", { h });
  }

  /* ---------- recipe card (list pages) ---------- */
  function favButton(r, small) {
    const on = Store.isFavourite(r.id);
    return el("button", {
      type: "button", class: "fav-btn" + (small ? " fav-btn-small" : ""), "aria-pressed": String(on), "data-fav": r.id,
      "aria-label": t(on ? "fav.remove" : "fav.add", { name: recipeName(r) }),
      onclick: () => {
        const now = Store.toggleFavourite(r.id); // the page redraws here
        Core.toast(t(now ? "fav.added" : "fav.removed", { name: recipeName(r) }));
        // keep keyboard focus on the (new) button for this recipe
        const again = document.querySelector(`.fav-btn[data-fav="${r.id}"]${small ? ".fav-btn-small" : ":not(.fav-btn-small)"}`);
        if (again) again.focus();
      },
    }, icon("heart", small ? 18 : 20), small ? null : el("span", { text: t(on ? "fav.saved" : "fav.save") }));
  }
  function meta(r) {
    return el("ul", { class: "recipe-meta" },
      el("li", null, icon("clock", 16), el("span", { text: minutes(r.time) })),
      el("li", null, icon("gauge", 16), el("span", { text: t("level." + r.level) })),
      el("li", null, icon("flame", 16), el("span", { text: t("recipe.kcal", { n: r.kcal }) })),
      r.veg && el("li", { class: "is-veg" }, icon("leaf", 16), el("span", { text: t("recipe.veg") })));
  }
  // extra: optional element shown at the bottom (e.g. "you have 5 of 7")
  function card(r, extra) {
    return el("article", { class: "recipe-card", "data-cat": r.cat },
      el("p", { class: "card-cat", text: t("cat." + r.cat) + " · " + t("cuisine." + r.cuisine) }),
      el("h3", { class: "card-title" }, el("a", { href: "recipe.html?id=" + r.id, text: recipeName(r) })),
      el("p", { class: "card-about", text: r.about[lang()] }),
      meta(r),
      extra || null,
      favButton(r, true));
  }

  /* ---------- header and footer ---------- */
  const NAV = [["home", "index.html", "home"], ["recipes", "recipes.html", "book"], ["plan", "plan.html", "calendar"], ["favorites", "favorites.html", "heart"], ["shopping", "shopping.html", "list"]];
  function renderHeader() {
    const host = document.getElementById("site-header");
    if (!host) return;
    const nav = el("nav", { class: "site-nav", "data-i18n-aria": "nav.label" },
      el("ul", null, NAV.map(([key, href, ic]) =>
        el("li", null, el("a", { href, "aria-current": page === key || (page === "recipe" && key === "recipes") ? "page" : null },
          icon(ic, 18), el("span", { "data-i18n": "page." + key }), key === "shopping" ? el("span", { class: "nav-count", id: "shopCount" }) : null)))));
    const langs = el("div", { class: "seg", role: "group", "data-i18n-aria": "lang.label" },
      ["uz", "ru", "en"].map((code) => el("button", { type: "button", "data-lang": code, lang: code, text: code.toUpperCase() })));
    const theme = el("button", { type: "button", id: "themeToggle", class: "icon-btn" }, icon("sun", 18), icon("moon", 18));
    host.append(el("div", { class: "container header-bar" },
      el("a", { class: "brand", href: "index.html", "data-i18n": "brand" }),
      nav,
      el("div", { class: "header-tools" }, langs, theme)));
    document.body.classList.add("has-tabbar");
  }
  // The number of things still to buy, next to "Shopping list".
  function renderCount() {
    const c = document.getElementById("shopCount");
    if (!c) return;
    const list = Store.shopping();
    const left = list.items.filter((x) => !x.done).length + list.extra.filter((x) => !x.done).length;
    c.textContent = left ? String(left) : "";
    c.setAttribute("aria-label", left ? t("shop.left", { count: left }) : "");
  }
  function renderFooter() {
    const host = document.getElementById("site-footer");
    if (!host) return;
    host.append(el("div", { class: "container footer-inner" },
      el("p", { class: "footer-brand", "data-i18n": "brand" }),
      el("p", { "data-i18n": "footer.note" }),
      el("p", { class: "footer-copy", "data-i18n": "footer.copy" })));
  }

  /* ---------- start ---------- */
  let titleFn = null;
  function setTitle() {
    const part = titleFn ? titleFn() : "";
    document.title = part ? part + " — " + t("brand") : t("meta.title");
  }
  function start(render, options = {}) {
    titleFn = options.title || null;
    renderHeader();
    renderFooter();
    Core.onLang(() => {
      renderCount();
      render();
      setTitle();
    });
    Store.onChange(() => {
      renderCount();
      if (options.onChange) options.onChange();
      else render();
    });
    Core.init();
  }

  window.Site = { el, svgEl, icon, num, amount, fraction, ingName, recipeName, minutes, card, meta, favButton, setTitle, start };
})();
