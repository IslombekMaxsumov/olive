# OLIVE — an independent international cookbook

Site #6 of my 10-websites course project: 29 recipes from ten regions of the world, in Uzbek, Russian and English. (The 13 Uzbek dishes were replaced on 2026-11-22, because no consistent, professional photos of them could be found.) Plain HTML, CSS and JavaScript (no framework, no build step, no backend); everything you save stays in your browser.

## Pages
| Page | What it does |
| --- | --- |
| `index.html` | "What can I cook today?": add the ingredients you have (any language, plus aliases like "eggplant" or "scallions"). Recipes are ranked by how many required ingredients you have, with a dot per ingredient, what's missing, and a button to add it to the shopping list. With nothing added: cover, today's recipe, around the world (10 regions), Uzbek classics, quick meals, collections |
| `recipes.html` | All 29 recipes: search by dish or ingredient, category, region, time, difficulty, vegetarian, collection, sort. Filters are kept in the address; on phones they open as a panel, with removable chips for active filters |
| `recipe.html?id=plov` | Cookbook spread: photo with credit, region and country, prep and cooking time, difficulty, kcal. Servings calculator, ingredient checklist, add to shopping list (all, or only what you don't have), steps with progress and cooking timers, cook's notes, week plan, personal note, keep the screen on, print |
| `plan.html` | Lunch and dinner for 7 days with thumbnails and kcal, "Surprise me", the whole week to the shopping list, clear with Undo. On phones one day at a time with a day picker |
| `favorites.html` | Saved recipes with your notes and a Remove button (with Undo) |
| `shopping.html` | Grouped by shop aisle; the same ingredient from several recipes is added up (2 onions + 1 onion = 3 onions; 1 tbsp + 1 tsp cumin = 4 tsp); your own items; copy as text, print, remove bought, clear with Undo |

## Design (second direction, 2026-11-22)
A quiet, typeset cookbook rather than a big editorial site.
- Palette from the brief: warm paper #F5F1E8, deep charcoal olive #292B23, muted sage #777B60, terracotta #B66E4E, stone #D8CDBB. Sage and terracotta are too light for small text, so small text uses deeper versions (noted in `css/base.css`); buttons are charcoal with paper text. A dark theme uses the same colours on charcoal.
- Fonts: EB Garamond (headings and recipe titles, weights 400–500) and Commissioner (interface). Both have Cyrillic. Page headings 32–44px, sections 24–28px, body 15px, labels 11px.
- Proportions: content is centred at 1120px, recipe text sits in a 760px column, the header is 60px.
- Thin stone separators instead of boxes and shadows; nearly square corners; no gradients or decorative shapes. Terracotta only for step numbers and small highlights.
- Photos: one proportion per place (4:3 cards, 3:2 recipe photos) and the same gentle warm grading on every photo (`.photo img` in `css/site.css`). `../olive-photo-brief.md` describes one consistent 45° "photo session"; replacement images go in `assets/photos/new/<id>.jpg` and `node tools/import-photos.mjs` adds them (`--generated` labels AI images as such).
- Logo: the O is a sliced stuffed olive (sage and terracotta), "LIVE" is EB Garamond Medium, converted to outlines (`assets/brand`, inline in `js/logo.js`).

## Recipes
- 29 dishes from East Asia, Southeast Asia, South Asia, the Middle East, North Africa, the Mediterranean, Western Europe, Eastern Europe, Latin America and North America (`js/data.js`).
- Every recipe has prep and cooking time, difficulty, kcal per serving (estimate), optional ingredients marked, and cook's notes with substitutions and what is traditional versus adapted.
- The recipes are written from common, well-established home versions of each dish. They have **not** been cooked and tested for this project.
- Scaling: amounts are rounded to what a cook can measure (½ onion, whole garlic cloves, ¼ spoons); eggs, tortillas and pita stay whole; with a big change in servings a note says to add salt and spices gradually.

## Photos
All 29 photos are from Pexels (Pexels License: free to use, no attribution required), picked by eye to look like one set: about a 45° angle, soft daylight, light surfaces. `node tools/pexels.mjs` downloads them in 3 widths (500, 960, 1600 px) and writes `assets/photos/manifest.json` (photographer, source page, crop position). Each recipe page still credits the photographer under the photo.
- **Closest matches, not perfect:** tagine (a purple tagine by a pool), ramen (dark background), Greek salad and ceviche (shot from almost straight above), omelette (served with salad), pancakes (no butter or syrup). Own photos from one shoot would still be best (`../olive-photo-brief.md`).

`tools/photos.mjs` builds `js/photos.js` (sizes, alt text in 3 languages, credits) from the manifest.

## Code
- `js/data.js` recipes and ingredients (names in 3 languages, shop aisle, aliases); `js/format.js` amounts and fractions; `js/store.js` favourites, notes, servings, shopping list, plan; `js/layout.js` header, footer, logo, photos, cards; `js/pages/*.js` one file per page.
- `tools/pages.mjs` writes the 6 HTML pages from one template.
- Tests: `node --test tests/logic.test.mjs` (scaling, fractions, whole eggs, unit merging, shopping consolidation, undo, data completeness).

The Uzbek and Russian text still needs a native speaker's check.

Run locally: `node ../_shared/serve.mjs . 5178`.
