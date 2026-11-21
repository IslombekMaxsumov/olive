// Writes the 6 HTML pages from one template, so the head, header and footer
// are the same everywhere. Run:  node tools/pages.mjs
// (The header, menu and footer are filled in by js/layout.js.)
import { writeFileSync } from "node:fs";

const head = (page, script) => `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Recipe book</title>
  <meta name="description" content="">
  <meta name="theme-color" content="#ffffff">
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
  <script defer src="js/store.js"></script>
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
      <h1 id="homeTitle" data-i18n="home.title"></h1>
      <p class="page-intro" data-i18n="home.intro"></p>
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
        <p class="field-label" data-i18n="home.quick"></p>
        <div id="quickIngs" class="chip-row"></div>
      </div>
      <div id="pantryChips" class="pantry-chips" aria-live="polite"></div>
    </section>
    <section id="matches" class="section" aria-labelledby="matchTitle">
      <h2 id="matchTitle"></h2>
      <div id="matchList" class="card-grid"></div>
    </section>
    <section id="ideas" class="section" aria-labelledby="ideasTitle">
      <h2 id="ideasTitle" data-i18n="home.quickIdeas"></h2>
      <div id="quickList" class="card-grid"></div>
      <h2 class="section-sub" data-i18n="home.classics"></h2>
      <div id="classicList" class="card-grid"></div>
      <p><a class="btn btn-ghost" href="recipes.html" data-i18n="home.allRecipes"></a></p>
    </section>
  </main>`],

  recipes: ["recipes", "recipes", `
  <main id="main" tabindex="-1" class="container page">
    <h1 data-i18n="page.recipes"></h1>
    <form id="filters" class="filters" novalidate role="search">
      <div class="field filter-search">
        <label for="q" data-i18n="filter.search"></label>
        <input id="q" name="q" class="input" type="search" autocomplete="off" data-i18n-placeholder="filter.searchPlaceholder">
      </div>
      <fieldset class="filter-cats">
        <legend data-i18n="filter.category"></legend>
        <div id="catChips" class="chip-row"></div>
      </fieldset>
      <div class="filter-selects">
        <div class="field"><label for="cuisine" data-i18n="filter.cuisine"></label><select id="cuisine" name="cuisine" class="input"></select></div>
        <div class="field"><label for="maxTime" data-i18n="filter.time"></label><select id="maxTime" name="maxTime" class="input"></select></div>
        <div class="field"><label for="level" data-i18n="filter.level"></label><select id="level" name="level" class="input"></select></div>
        <div class="field"><label for="sort" data-i18n="filter.sort"></label><select id="sort" name="sort" class="input"></select></div>
        <label class="check"><input type="checkbox" id="veg" name="veg"> <span data-i18n="filter.veg"></span></label>
      </div>
    </form>
    <div class="list-head">
      <p id="count" class="result-count" aria-live="polite"></p>
      <button type="button" id="reset" class="btn btn-ghost btn-small" data-i18n="filter.reset"></button>
    </div>
    <div id="list" class="card-grid"></div>
    <div id="empty" class="empty" hidden>
      <h2 data-i18n="filter.emptyTitle"></h2>
      <p data-i18n="filter.emptyText"></p>
      <button type="button" id="reset2" class="btn" data-i18n="filter.reset"></button>
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
    <h1 data-i18n="page.plan"></h1>
    <p class="page-intro" data-i18n="plan.intro"></p>
    <div class="plan-actions">
      <button type="button" id="toShopping" class="btn"></button>
      <button type="button" id="surprise" class="btn btn-ghost" data-i18n="plan.surprise"></button>
      <button type="button" id="clearPlan" class="btn btn-ghost" data-i18n="plan.clear"></button>
    </div>
    <p id="planSummary" class="result-count" aria-live="polite"></p>
    <div id="week" class="week"></div>
  </main>`],

  favorites: ["favorites", "favorites", `
  <main id="main" tabindex="-1" class="container page">
    <h1 data-i18n="page.favorites"></h1>
    <p id="favCount" class="result-count" aria-live="polite"></p>
    <div id="favList" class="card-grid"></div>
    <div id="favEmpty" class="empty" hidden>
      <h2 data-i18n="favs.emptyTitle"></h2>
      <p data-i18n="favs.emptyText"></p>
      <a class="btn" href="recipes.html" data-i18n="home.allRecipes"></a>
    </div>
  </main>`],

  shopping: ["shopping", "shopping", `
  <main id="main" tabindex="-1" class="container page shopping-page">
    <h1 data-i18n="page.shopping"></h1>
    <form id="extraForm" class="extra-form" novalidate>
      <label for="extraInput" class="field-label" data-i18n="shop.addLabel"></label>
      <div class="pantry-row">
        <input id="extraInput" class="input" type="text" maxlength="80" autocomplete="off" data-i18n-placeholder="shop.addPlaceholder" aria-describedby="extraError">
        <button type="submit" class="btn" data-i18n="shop.add"></button>
      </div>
      <p id="extraError" class="field-error" aria-live="polite"></p>
    </form>
    <div class="shop-head">
      <p id="shopProgress" class="result-count" aria-live="polite"></p>
      <div class="shop-actions">
        <button type="button" id="copyList" class="btn btn-ghost btn-small"></button>
        <button type="button" id="printList" class="btn btn-ghost btn-small"></button>
        <button type="button" id="clearDone" class="btn btn-ghost btn-small" data-i18n="shop.clearDone"></button>
        <button type="button" id="clearAll" class="btn btn-danger-ghost btn-small" data-i18n="shop.clearAll"></button>
      </div>
    </div>
    <div id="shopList"></div>
    <p class="hint" data-i18n="shop.staples"></p>
    <div id="shopEmpty" class="empty" hidden>
      <h2 data-i18n="shop.emptyTitle"></h2>
      <p data-i18n="shop.emptyText"></p>
      <a class="btn" href="recipes.html" data-i18n="home.allRecipes"></a>
    </div>
  </main>`],
};

for (const [file, [page, script, main]] of Object.entries(PAGES)) {
  writeFileSync(new URL(`../${file}.html`, import.meta.url), head(page, script) + main + foot);
}
console.log("wrote", Object.keys(PAGES).length, "pages");
