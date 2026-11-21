# OLIVE — an independent international cookbook

Site #6 of my 10-websites course project: 29 recipes from Uzbekistan and nine more regions of the world, in Uzbek, Russian and English. Plain HTML, CSS and JavaScript (no framework, no build step, no backend); everything you save stays in your browser.

## Pages
| Page | What it does |
| --- | --- |
| `index.html` | "What can I cook today?": add the ingredients you have (any language, plus aliases like "eggplant" or "scallions"). Recipes are ranked by how many required ingredients you have, with a dot per ingredient, what's missing, and a button to add it to the shopping list. With nothing added: cover, today's recipe, around the world (10 regions), Uzbek classics, quick meals, collections |
| `recipes.html` | All 29 recipes: search by dish or ingredient, category, region, time, difficulty, vegetarian, collection, sort. Filters are kept in the address; on phones they open as a panel, with removable chips for active filters |
| `recipe.html?id=plov` | Cookbook spread: photo with credit, region and country, prep and cooking time, difficulty, kcal. Servings calculator, ingredient checklist, add to shopping list (all, or only what you don't have), steps with progress and cooking timers, cook's notes, week plan, personal note, keep the screen on, print |
| `plan.html` | Lunch and dinner for 7 days with thumbnails and kcal, "Surprise me", the whole week to the shopping list, clear with Undo. On phones one day at a time with a day picker |
| `favorites.html` | Saved recipes with your notes and a Remove button (with Undo) |
| `shopping.html` | Grouped by shop aisle; the same ingredient from several recipes is added up (2 onions + 1 onion = 3 onions; 1 tbsp + 1 tsp cumin = 4 tsp); your own items; copy as text, print, remove bought, clear with Undo |

## Design
- Palette from the OLIVE brief (olive, tomato, butter on soft greens). A few values were changed to pass WCAG AA; the original value is noted next to each one in `css/base.css`.
- Fonts: Manrope (headlines), Golos Text (text), IBM Plex Mono (amounts, numbers and small annotations). All have Cyrillic.
- Logo: the O is a sliced stuffed olive (green oval, red pimento as the counter), then "LIVE" in Manrope ExtraBold converted to outlines. `assets/brand`: logo (light, dark, one colour), symbol (light, dark), favicon. Keep free space of at least the width of the olive around the logo. In the site the logo is drawn inline (`js/logo.js`) so it follows the theme.
- Signature details: the butter "marker" behind a key word, leaf-shaped photo crops, tomato-red step numbers, small mono annotations ("↘ East Asia · 60 min").

## Recipes
- 13 Uzbek dishes and 16 from Eastern Europe, Western Europe, the Mediterranean, East Asia, Southeast Asia, South Asia, the Middle East, North Africa and Latin America (`js/data.js`).
- Every recipe has prep and cooking time, difficulty, kcal per serving (estimate), optional ingredients marked, and cook's notes with substitutions and what is traditional versus adapted.
- The recipes are written from common, well-established home versions of each dish. They have **not** been cooked and tested for this project.
- Scaling: amounts are rounded to what a cook can measure (½ onion, whole garlic cloves, ¼ spoons); eggs, tortillas and pita stay whole; with a big change in servings a note says to add salt and spices gradually.

## Photos
All photos are from Wikimedia Commons, under the licences listed in `assets/photos/manifest.json` (source page, photographer, licence, attribution). Each recipe page shows the credit and a licence link under the photo, which the CC BY and CC BY-SA licences require. Each photo was checked by eye to show the right dish, and is stored in 3 widths (500, 960, 1920 px) for responsive loading.
- **No suitable photo found:** qatlama (only Turkish katmer and Balkan pastries), shirguruch (only other countries' rice puddings). These recipes show a typographic plate instead. Own photos would be best.
- **Weaker photos:** chuchvara (the only real one is 600 px wide), lagman (a soupier style), tinga (the filling, without tortillas), katsu curry (the cutlet may be pork).
- The omelette recipe was changed to a classic folded omelette so it matches the only accurate photo.

`tools/photos.mjs` builds `js/photos.js` (sizes, alt text in 3 languages, credits) from the manifest.

## Code
- `js/data.js` recipes and ingredients (names in 3 languages, shop aisle, aliases); `js/format.js` amounts and fractions; `js/store.js` favourites, notes, servings, shopping list, plan; `js/layout.js` header, footer, logo, photos, cards; `js/pages/*.js` one file per page.
- `tools/pages.mjs` writes the 6 HTML pages from one template.
- Tests: `node --test tests/logic.test.mjs` (scaling, fractions, whole eggs, unit merging, shopping consolidation, undo, data completeness).

The Uzbek and Russian text still needs a native speaker's check.

Run locally: `node ../_shared/serve.mjs . 5178`.
