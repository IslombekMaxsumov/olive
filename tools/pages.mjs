// Writes the 6 HTML pages from one template, so the head, header and footer
// are the same everywhere. Run:  node tools/pages.mjs
// (The header, menu and footer are filled in by js/layout.js.)
import { writeFileSync } from "node:fs";

const head = (page, script) => `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>OLIVE</title>
  <meta name="description" content="">
  <meta name="theme-color" content="#f5f5ef">
  <link rel="icon" href="assets/brand/olive-favicon.svg" type="image/svg+xml">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Golos+Text:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&family=Manrope:wght@700;800&display=swap">
  <!-- Apply the saved theme before the page is drawn, so it never flashes. -->
  <script>
    window.APP_NS = "recipes";
    try {
      var savedTheme = localStorage.getItem("recipes:theme");
      document.documentElement.setAttribute("data-theme", savedTheme || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"));
    } catch (e) {}
  </script>
  <link rel="stylesheet" href="css/base.css">
  <link rel="stylesheet" href="css/site.css">
  <script defer src="js/core.js"></script>
  <script defer src="js/lang.js"></script>
  <script defer src="js/data.js"></script>
  <script defer src="js/photos.js"></script>
  <script defer src="js/format.js"></script>
  <script defer src="js/store.js"></script>
  <script defer src="js/logo.js"></script>
  <script defer src="js/layout.js"></script>
  <script defer src="js/pages/${script}.js"></script>
</head>
<body data-page="${page}">
  <a class="skip-link" href="#main" data-i18n="skip">Skip to content</a>
  <header id="site-header" class="site-header"></header>
`;
const foot = `
  <footer id="site-footer" class="site-footer"></footer>
  <div id="toasts" class="toast-host" aria-live="polite"></div>
</body>
</html>
`;

const PAGES = {
  index: ["home", "home", `
  <main id="main" tabindex="-1" class="container page home-page">
    <section class="hero" aria-labelledby="homeTitle">
      <div class="hero-text">
        <p class="annot hero-annot" id="heroAnnot"></p>
        <h1 id="homeTitle"></h1>
        <p class="hero-intro" data-i18n="home.intro"></p>
        <div class="pantry">
          <form id="pantryForm" class="pantry-form" novalidate>
            <label for="pantryInput" class="field-label" data-i18n="home.addLabel"></label>
            <div class="pantry-row">
              <input id="pantryInput" class="input" type="text" list="ingList" autocomplete="off" data-i18n-placeholder="home.addPlaceholder" aria-describedby="pantryHint pantryError">
              <button type="submit" class="btn" data-i18n="home.add"></button>
            </div>
            <datalist id="ingList"></datalist>
            <p id="pantryHint" class="hint" data-i18n="home.hint"></p>
            <p id="pantryError" class="field-error" aria-live="polite"></p>
          </form>
          <div class="quick-ings">
            <p class="annot" id="quickLabel" data-i18n="home.quick"></p>
            <div id="quickIngs" class="chip-row" role="group" aria-labelledby="quickLabel"></div>
          </div>
          <div id="pantryChips" class="pantry-chips" aria-live="polite"></div>
        </div>
      </div>
      <div id="heroArt" class="hero-art"></div>
    </section>

    <section id="matches" class="section" aria-labelledby="matchTitle" hidden>
      <div class="section-head"><h2 id="matchTitle"></h2></div>
      <div id="matchList" class="matches"></div>
    </section>

    <div id="ideas">
      <section class="section" aria-labelledby="featTitle"><div id="feature" class="feature"></div></section>
      <section class="section" aria-labelledby="worldTitle">
        <div class="section-head"><div><p class="annot" data-i18n="home.worldAnnot"></p><h2 id="worldTitle" data-i18n="home.world"></h2></div><a class="more-link" href="recipes.html" data-i18n="home.allRecipes"></a></div>
        <div id="regions" class="regions"></div>
      </section>
      <section class="section" aria-labelledby="classicsTitle">
        <div class="section-head"><div><p class="annot" data-i18n="home.classicsAnnot"></p><h2 id="classicsTitle" data-i18n="home.classics"></h2></div><a class="more-link" href="recipes.html?cuisine=central-asia" data-i18n="home.allUzbek"></a></div>
        <div id="classicList" class="classics"></div>
      </section>
      <section class="section" aria-labelledby="quickTitle">
        <div class="section-head"><div><p class="annot" data-i18n="home.quickAnnot"></p><h2 id="quickTitle" data-i18n="home.quickIdeas"></h2></div><a class="more-link" href="recipes.html?maxTime=30" data-i18n="home.allQuick"></a></div>
        <div id="quickList" class="quick-index"></div>
      </section>
      <section class="section" aria-labelledby="colTitle">
        <div class="section-head"><div><p class="annot" data-i18n="home.colAnnot"></p><h2 id="colTitle" data-i18n="home.collections"></h2></div></div>
        <div id="collections" class="collections"></div>
      </section>
    </div>
  </main>`],

  recipes: ["recipes", "recipes", `
  <main id="main" tabindex="-1" class="container page">
    <p class="annot" id="listAnnot"></p>
    <h1 class="page-title" data-i18n="page.recipes"></h1>
    <div class="list-layout">
      <form id="filters" class="filters" novalidate aria-labelledby="filterTitle">
        <h2 id="filterTitle" class="visually-hidden" data-i18n="filter.title"></h2>
        <fieldset class="filter-group">
          <legend data-i18n="filter.category"></legend>
          <div id="catChips" class="chip-row"></div>
        </fieldset>
        <div class="field"><label class="filter-label" for="cuisine" data-i18n="filter.cuisine"></label><select id="cuisine" name="cuisine" class="input"></select></div>
        <div class="field"><label class="filter-label" for="maxTime" data-i18n="filter.time"></label><select id="maxTime" name="maxTime" class="input"></select></div>
        <div class="field"><label class="filter-label" for="level" data-i18n="filter.level"></label><select id="level" name="level" class="input"></select></div>
        <label class="switch"><span data-i18n="filter.veg"></span><input type="checkbox" id="veg" name="veg"></label>
      </form>
      <div class="list-main">
        <div class="list-top">
          <div class="search" role="search">
            <label for="q" class="visually-hidden" data-i18n="filter.search"></label>
            <input id="q" name="q" class="input" type="search" autocomplete="off" form="filters" data-i18n-placeholder="filter.searchPlaceholder">
          </div>
          <button type="button" id="filtersToggle" class="btn btn-ghost filters-toggle" aria-expanded="false" aria-controls="filters"></button>
          <div class="field"><label class="visually-hidden" for="sort" data-i18n="filter.sort"></label><select id="sort" name="sort" class="input" form="filters"></select></div>
        </div>
        <div id="activeFilters" class="active-filters"></div>
        <p id="count" class="result-count" aria-live="polite"></p>
        <div id="list" class="card-grid is-varied" style="margin-top: 20px"></div>
        <div id="empty" class="empty" hidden>
          <h2 data-i18n="filter.emptyTitle"></h2>
          <p data-i18n="filter.emptyText"></p>
          <button type="button" id="reset2" class="btn" data-i18n="filter.reset"></button>
        </div>
      </div>
    </div>
  </main>`],

  recipe: ["recipe", "recipe", `
  <main id="main" tabindex="-1" class="container page recipe-page">
    <a class="back-link" href="recipes.html" data-i18n="recipe.back"></a>
    <div id="view"></div>
  </main>
  <div id="timerBar" class="timer-bar" hidden role="region" data-i18n-aria="timer.region"></div>`],

  plan: ["plan", "plan", `
  <main id="main" tabindex="-1" class="container page">
    <p class="annot" data-i18n="plan.annot"></p>
    <h1 class="page-title" data-i18n="page.plan"></h1>
    <p class="page-intro" data-i18n="plan.intro"></p>
    <div class="plan-actions">
      <button type="button" id="toShopping" class="btn"></button>
      <button type="button" id="surprise" class="btn btn-ghost" data-i18n="plan.surprise"></button>
      <button type="button" id="clearPlan" class="btn btn-ghost" data-i18n="plan.clear"></button>
    </div>
    <p id="planSummary" class="result-count" aria-live="polite"></p>
    <div id="dayPicker" class="day-picker" role="group" data-i18n-aria="plan.pickDay"></div>
    <div id="week" class="week"></div>
  </main>`],

  favorites: ["favorites", "favorites", `
  <main id="main" tabindex="-1" class="container page">
    <p class="annot" data-i18n="favs.annot"></p>
    <h1 class="page-title" data-i18n="page.favorites"></h1>
    <p id="favCount" class="result-count" aria-live="polite" style="margin-top: 12px"></p>
    <div id="favList" class="card-grid" style="margin-top: 28px"></div>
    <div id="favEmpty" class="empty" hidden>
      <h2 data-i18n="favs.emptyTitle"></h2>
      <p data-i18n="favs.emptyText"></p>
      <a class="btn" href="recipes.html" data-i18n="home.allRecipes"></a>
    </div>
  </main>`],

  shopping: ["shopping", "shopping", `
  <main id="main" tabindex="-1" class="container page shopping-page">
    <p class="annot" data-i18n="shop.annot"></p>
    <h1 class="page-title" data-i18n="page.shopping"></h1>
    <div class="shop-layout">
      <aside class="shop-side" aria-labelledby="shopSideTitle">
        <h2 id="shopSideTitle" class="visually-hidden" data-i18n="shop.sideTitle"></h2>
        <div class="shop-progress"><strong id="shopBig"></strong><p id="shopProgress" class="result-count" aria-live="polite"></p><div class="bar"><span id="shopBar"></span></div></div>
        <form id="extraForm" class="extra-form" novalidate>
          <label for="extraInput" class="field-label" data-i18n="shop.addLabel"></label>
          <div class="pantry-row">
            <input id="extraInput" class="input" type="text" maxlength="80" autocomplete="off" data-i18n-placeholder="shop.addPlaceholder" aria-describedby="extraError">
            <button type="submit" class="btn" data-i18n="shop.add"></button>
          </div>
          <p id="extraError" class="field-error" aria-live="polite"></p>
        </form>
        <div class="shop-actions">
          <button type="button" id="copyList" class="btn btn-ghost btn-small"></button>
          <button type="button" id="printList" class="btn btn-ghost btn-small"></button>
          <button type="button" id="clearDone" class="btn btn-ghost btn-small" data-i18n="shop.clearDone"></button>
          <button type="button" id="clearAll" class="btn btn-danger-ghost btn-small" data-i18n="shop.clearAll"></button>
        </div>
        <p class="hint" data-i18n="shop.staples"></p>
      </aside>
      <div>
        <div id="shopList"></div>
        <div id="shopEmpty" class="empty" hidden>
          <h2 data-i18n="shop.emptyTitle"></h2>
          <p data-i18n="shop.emptyText"></p>
          <a class="btn" href="recipes.html" data-i18n="home.allRecipes"></a>
        </div>
      </div>
    </div>
  </main>`],
};

for (const [file, [page, script, main]] of Object.entries(PAGES)) {
  writeFileSync(new URL(`../${file}.html`, import.meta.url), head(page, script) + main + foot);
}
console.log("wrote", Object.keys(PAGES).length, "pages");
