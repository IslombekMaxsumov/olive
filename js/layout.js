/* Parts shared by every page: header (menu, language, theme), footer, the
   logo, photos, recipe cards, formatting of times and amounts, page start-up.
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
    Object.entries(attrs || {}).forEach(([k, v]) => v !== null && v !== undefined && v !== false && node.setAttribute(k, v));
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
    copy: '<rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
    leaf: '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>',
    sliders: '<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M2 14h4M10 8h4M18 16h4"/>',
    arrow: '<path d="M5 12h14M12 5l7 7-7 7"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>',
    moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
  };
  function icon(name, size = 20) {
    const s = svgEl("svg", { viewBox: "0 0 24 24", width: size, height: size, fill: "none", stroke: "currentColor", "stroke-width": 2, "stroke-linecap": "round", "stroke-linejoin": "round", "aria-hidden": "true", class: "icon icon-" + name });
    s.innerHTML = ICONS[name] || "";
    return s;
  }
  // the round checkbox used for ingredients, steps and shopping items
  function tick(input) {
    return el("span", { class: "tick" }, input, icon("check", 16));
  }

  /* ---------- formatting (amounts: js/format.js) ---------- */
  const lang = () => Core.getLang();
  const num = (n, d = 0) => Format.num(n, d, lang());
  const amount = (value, unit, item) => Format.amount(value, unit, item, t, lang());
  const ingName = (id) => DATA.INGREDIENTS[id].name[lang()];
  const recipeName = (r) => r.name[lang()];
  // 95 → "1 h 35 min", 40 → "40 min"
  function minutes(m) {
    const h = Math.floor(m / 60);
    const rest = m % 60;
    if (!h) return t("time.m", { m });
    return rest ? t("time.hm", { h, m: rest }) : t("time.h", { h });
  }
  const regionName = (id) => t("region." + id);
  const country = (r) => r.country[lang()] || regionName(r.region);

  /* ---------- logo (inline, takes the theme colours; js/logo.js) ---------- */
  function logoSvg() {
    // seal (ring, olive, leaf) + the word OLIVE; colours come from CSS classes
    return svgEl("svg", { viewBox: `0 0 ${LOGO.width} 48`, class: "logo-svg", "aria-hidden": "true", focusable: "false" },
      LOGO.parts.map(([tag, attrs, cls]) => svgEl(tag, { ...attrs, class: cls })),
      svgEl("path", { d: LOGO.word, class: "logo-word" }));
  }

  /* ---------- photos (js/photos.js) ----------
     photo(r, { sizes, cls, eager, credit }) → <figure> with srcset, or a
     typographic plate when there is no photo of the dish. */
  function photo(r, opts = {}) {
    const p = window.PHOTOS && PHOTOS[r.id];
    const cls = "photo" + (opts.cls ? " " + opts.cls : "");
    if (!p) {
      return el("figure", { class: cls },
        el("div", { class: "photo-fallback", role: "img", "aria-label": t("photo.none", { name: recipeName(r) }) },
          el("span", { "aria-hidden": "true", text: recipeName(r).charAt(0) }),
          opts.credit && el("small", { "aria-hidden": "true", text: t("photo.noneShort") })));
    }
    const largest = p.sizes[p.sizes.length - 1];
    const img = el("img", {
      src: (p.sizes.find((s) => s[0] >= 900) || largest)[1],
      srcset: p.sizes.map(([w, f]) => `${f} ${w}w`).join(", "),
      sizes: opts.sizes || "(min-width: 960px) 33vw, 100vw",
      alt: p.alt[lang()], loading: opts.eager ? "eager" : "lazy", decoding: "async",
      fetchpriority: opts.eager ? "high" : null,
      style: p.pos ? `object-position: ${p.pos}` : null, // portrait photos: keep the food in the frame
    });
    const fig = el("figure", { class: cls }, img);
    if (!opts.credit) return fig;
    // generated or own images: say so plainly; stock photos: photographer, source and licence
    if (p.generated || !p.source) return [fig, el("p", { class: "photo-credit", text: p.generated ? t("photo.generated") : p.by })];
    return [fig, el("p", { class: "photo-credit" },
      t("photo.credit", { by: p.by }) + " · ",
      el("a", { href: p.source, rel: "noopener", text: p.site }), " · ",
      p.licenseUrl ? el("a", { href: p.licenseUrl, rel: "noopener license", text: p.license }) : p.license)];
  }

  /* ---------- favourite button ---------- */
  function favButton(r, small) {
    const on = Store.isFavourite(r.id);
    return el("button", {
      type: "button", class: "fav-btn" + (small ? " fav-btn-small" : ""), "aria-pressed": String(on), "data-fav": r.id,
      "aria-label": t(on ? "fav.remove" : "fav.add", { name: recipeName(r) }),
      onclick: () => {
        const now = Store.toggleFavourite(r.id); // most pages redraw here
        Core.toast(t(now ? "fav.added" : "fav.removed", { name: recipeName(r) }));
        // pages that only redraw part of themselves (home, a recipe's related cards) keep the
        // old buttons, so bring every heart for this recipe up to date in place
        document.querySelectorAll(`.fav-btn[data-fav="${r.id}"]`).forEach((b) => {
          b.setAttribute("aria-pressed", String(now));
          b.setAttribute("aria-label", t(now ? "fav.remove" : "fav.add", { name: recipeName(r) }));
          const label = b.querySelector("span");
          if (label) label.textContent = t(now ? "fav.saved" : "fav.save");
        });
        // keep keyboard focus on the (new) button for this recipe, with a small "pop"
        const again = document.querySelector(`.fav-btn[data-fav="${r.id}"]${small ? ".fav-btn-small" : ":not(.fav-btn-small)"}`);
        if (again) {
          again.focus();
          if (now) again.classList.add("pop");
        }
      },
    }, icon("heart", small ? 20 : 18), small ? null : el("span", { text: t(on ? "fav.saved" : "fav.save") }));
  }

  /* ---------- recipe meta and card ---------- */
  function meta(r, { kcal = true } = {}) {
    return el("ul", { class: "recipe-meta" },
      el("li", null, icon("clock", 14), el("span", { text: minutes(r.time) })),
      el("li", null, icon("gauge", 14), el("span", { text: t("level." + r.level) })),
      kcal && el("li", null, icon("flame", 14), el("span", { text: t("recipe.kcal", { n: r.kcal }) })),
      r.veg && el("li", { class: "is-veg" }, icon("leaf", 14), el("span", { text: t("recipe.veg") })));
  }
  // opts: { extra (element under the text), cls, sizes, about, meta }
  function card(r, opts = {}) {
    return el("article", { class: "recipe-card" + (opts.cls ? " " + opts.cls : ""), "data-cat": r.cat },
      el("div", { class: "card-photo", style: "position:relative" }, photo(r, { sizes: opts.sizes || "(min-width: 960px) 25vw, (min-width: 720px) 45vw, 100vw" }), favButton(r, true)),
      el("p", { class: "label", text: country(r) }),
      el("h3", { class: "card-title" }, el("a", { href: "recipe.html?id=" + r.id, text: recipeName(r) })),
      opts.about !== false && el("p", { class: "card-about", text: r.about[lang()] }),
      opts.meta !== false && meta(r, { kcal: false }),
      opts.extra || null);
  }

  /* ---------- header and footer ---------- */
  const NAV = [["home", "index.html", "home"], ["recipes", "recipes.html", "book"], ["plan", "plan.html", "calendar"], ["favorites", "favorites.html", "heart"], ["shopping", "shopping.html", "list"]];
  function renderHeader() {
    const host = document.getElementById("site-header");
    if (!host) return;
    const nav = el("nav", { class: "site-nav", "data-i18n-aria": "nav.label" },
      el("ul", null, NAV.map(([key, href, ic]) =>
        el("li", null, el("a", { href, "aria-current": page === key || (page === "recipe" && key === "recipes") ? "page" : null },
          icon(ic, 20), el("span", { "data-i18n": "page." + key }), key === "shopping" ? el("span", { class: "nav-count", id: "shopCount" }) : null)))));
    const langs = el("div", { class: "seg", role: "group", "data-i18n-aria": "lang.label" },
      ["uz", "ru", "en"].map((code) => el("button", { type: "button", "data-lang": code, lang: code, text: code.toUpperCase() })));
    const theme = el("button", { type: "button", id: "themeToggle", class: "icon-btn" }, icon("sun", 20), icon("moon", 20));
    host.append(el("div", { class: "container header-bar" },
      el("a", { class: "brand", href: "index.html", "aria-label": "OLIVE" }, logoSvg(), el("span", { class: "brand-tag", "aria-hidden": "true", "data-i18n": "brand.tag" })),
      nav,
      el("div", { class: "header-tools" }, langs, theme)));
    document.body.classList.add("has-tabbar");
    // a hairline under the header once the page scrolls
    const onScroll = () => host.classList.toggle("is-scrolled", window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
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
    host.replaceChildren(el("div", { class: "container footer-inner" },
      el("div", { class: "footer-brand" }, logoSvg(), el("p", { text: t("footer.about") })),
      el("div", { class: "footer-col" }, el("h2", { text: t("footer.regions") }),
        el("ul", null, DATA.REGIONS.map((id) => el("li", null, el("a", { href: "recipes.html?cuisine=" + id, text: regionName(id) }))))),
      el("div", { class: "footer-col" }, el("h2", { text: t("footer.cook") }),
        el("ul", null, NAV.map(([key, href]) => el("li", null, el("a", { href, text: t("page." + key) }))))),
      el("div", { class: "footer-bottom" },
        el("p", { text: t("footer.note") }),
        el("p", { text: t("footer.photos") }),
        el("p", { text: t("footer.copy") }))));
  }

  /* ---------- start ---------- */
  let titleFn = null;
  function setTitle() {
    const part = titleFn ? titleFn() : "";
    document.title = part ? part + " — OLIVE" : t("meta.title");
  }
  function start(render, options = {}) {
    titleFn = options.title || null;
    renderHeader();
    Core.onLang(() => {
      renderFooter();
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

  window.Site = { el, svgEl, icon, tick, num, amount, ingName, recipeName, minutes, regionName, country, photo, card, meta, favButton, logoSvg, setTitle, start };
})();
