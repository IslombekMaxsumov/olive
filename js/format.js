/* Kitchen-friendly amounts. No page code here, so it can be tested in Node
   (tests/logic.test.mjs).

   Format.amount(value, unit, item, t, lang) turns a base amount (g, ml, tsp,
   pcs...) into readable text:
   - 1250 g → "1,25 kg"; 1500 ml → "1,5 l"; 6 tsp → "2 tbsp"
   - pieces, spoons and bunches are rounded to steps a cook can measure and
     shown as fractions: 0.5 → "½", 1.25 → "1¼"
   - things that can't be split (eggs, tortillas) are rounded to whole ones
   - grams are rounded sensibly (255 g → "255 g", 1033 g → "1,03 kg"),
     never carelessly: small amounts like 7 g of yeast keep their precision. */
(function (root) {
  "use strict";
  const STEP = { pcs: 0.5, head: 0.5, clove: 1, bunch: 0.25, tbsp: 0.25, tsp: 0.25, pinch: 1, sprig: 1 };
  const FRACTIONS = [[0.25, "¼"], [0.333, "⅓"], [0.5, "½"], [0.667, "⅔"], [0.75, "¾"]];

  function num(n, decimals, lang) {
    const fixed = Number(n || 0).toFixed(decimals);
    let [int, frac] = fixed.split(".");
    frac = frac ? frac.replace(/0+$/, "") : "";
    const group = lang === "en" ? "," : " ";
    const point = lang === "en" ? "." : ",";
    return int.replace(/\B(?=(\d{3})+(?!\d))/g, group) + (frac ? point + frac : "");
  }
  function fraction(n) {
    const whole = Math.floor(n + 0.06);
    const rest = n - whole;
    if (rest < 0.12) return String(whole);
    const near = FRACTIONS.reduce((a, b) => (Math.abs(b[0] - rest) < Math.abs(a[0] - rest) ? b : a));
    return (whole ? whole : "") + near[1];
  }
  // Rounds and changes to a bigger unit where it reads better.
  // Returns { n, unit, text } (text without the unit word).
  function nice(value, unit, item, lang) {
    let n = value;
    let u = unit;
    if (u === "g" && n >= 1000) { n /= 1000; u = "kg"; }
    if (u === "ml" && n >= 1000) { n /= 1000; u = "l"; }
    if (u === "tsp" && n >= 3) { n /= 3; u = "tbsp"; } // 3 teaspoons = 1 tablespoon
    let text;
    if (item && item.whole) {
      n = Math.max(1, Math.round(n)); // half an egg isn't a thing
      text = String(n);
    } else if (STEP[u]) {
      n = Math.max(STEP[u], Math.round(n / STEP[u]) * STEP[u]); // never "0"
      text = fraction(n);
    } else if (u === "kg" || u === "l") {
      text = num(n, n < 10 ? 2 : 1, lang);
    } else if (n >= 100) {
      n = Math.round(n / 5) * 5;
      text = num(n, 0, lang);
    } else if (n >= 10) {
      n = Math.round(n);
      text = num(n, 0, lang);
    } else {
      text = num(n, 1, lang);
    }
    return { n, unit: u, text };
  }
  // t: the translate function (unit words have plural forms)
  function amount(value, unit, item, t, lang) {
    const r = nice(value, unit, item, lang);
    return t("unit." + r.unit, { n: r.text, count: Math.ceil(r.n) });
  }
  root.Format = { num, fraction, nice, amount, STEP };
})(typeof window !== "undefined" ? window : globalThis);
