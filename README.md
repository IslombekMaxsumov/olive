# Recipe book (working name)

Site #6 of my 10-websites course project: a recipe book in Uzbek, Russian and English, with plain HTML, CSS and JavaScript (no framework, no build step, no backend). The name and look will come from the design brief; the current styling is a placeholder.

## Pages
| Page | What it does |
| --- | --- |
| `index.html` | "What can I cook today?": add the ingredients you have (in any language), and recipes are ranked by how many you have, with what's missing and a button to add it to the shopping list |
| `recipes.html` | All 21 recipes: search by dish or ingredient, category, cuisine, time, difficulty, vegetarian, sort. The filters are kept in the address |
| `recipe.html?id=plov` | Servings calculator, ingredient checklist, add to shopping list (all or only what you don't have), steps to tick off with cooking timers, favourite, print, keep the screen on, week plan, personal note |
| `plan.html` | Lunch and dinner for 7 days, "Surprise me", the whole week to the shopping list, clear with Undo |
| `favorites.html` | Saved recipes with your notes |
| `shopping.html` | Grouped by shop aisle, the same ingredient from several recipes added up, your own items, tick off, copy as text, print, clear with Undo |

## How it works
- `js/data.js`: the recipes. Every ingredient is listed once with its name in 3 languages and its shop aisle; recipes point to ingredients with an amount and unit.
- `js/store.js`: favourites, notes, servings, shopping list and week plan in localStorage. Grams and kilograms, millilitres and litres, and tea- and tablespoons are added up in one unit.
- `js/layout.js`: the header, menu and footer, and formatting: amounts are rounded to what a cook can measure (½ onion, whole garlic cloves, ¼ spoons) and shown as fractions.
- Timers count from an end time, so they stay right when the phone sleeps. When one ends: a beep (Web Audio), a vibration and a message.
- `tools/pages.mjs` writes the 6 HTML pages from one template (`node tools/pages.mjs`).

Recipes are simplified home versions. The Uzbek and Russian text still needs a native speaker's check.

Run locally: `node ../_shared/serve.mjs . 5178`.
