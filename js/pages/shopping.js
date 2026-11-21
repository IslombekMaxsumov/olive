/* Shopping list: ingredients added from recipes (the same ingredient from
   several recipes is added up) plus your own items, grouped by shop aisle.
   Tick what you bought, copy the list as text, print it, or clear it (with
   Undo). */
(function () {
  "use strict";
  const { t } = Core;
  const { el, icon, ingName, recipeName } = Site;
  const $ = (id) => document.getElementById(id);

  $("extraForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const input = $("extraInput");
    if (!input.value.trim()) {
      $("extraError").textContent = t("shop.addEmpty");
      input.setAttribute("aria-invalid", "true");
      return input.focus();
    }
    Store.addExtra(input.value);
    input.value = "";
    $("extraError").textContent = "";
    input.removeAttribute("aria-invalid");
    input.focus();
  });

  function row(key, done, main, sub) {
    const id = "item-" + key.replace(/[^a-z0-9]/gi, "");
    return el("li", { class: "shop-item" + (done ? " is-done" : "") },
      el("input", { type: "checkbox", id, checked: done, onchange: (e) => Store.setDone(key, e.target.checked) }),
      el("label", { for: id }, main, sub && el("span", { class: "shop-from", text: sub })),
      el("button", { type: "button", class: "icon-btn", "aria-label": t("shop.remove", { name: main.textContent }), onclick: () => {
        const undo = Store.removeItem(key);
        Core.toast(t("shop.removed", { name: main.textContent }), { label: t("action.undo"), onClick: undo });
        $("extraInput").focus();
      } }, icon("x", 16)));
  }

  // Plain text version for "Copy list".
  function asText(list) {
    const lines = [t("page.shopping") + ":"];
    DATA.AISLES.forEach((a) => list.items.filter((x) => x.ing && DATA.INGREDIENTS[x.ing].aisle === a && !x.done)
      .forEach((x) => lines.push("- " + ingName(x.ing) + ", " + Site.amount(x.amount, x.unit))));
    list.extra.filter((x) => !x.done).forEach((x) => lines.push("- " + x.text));
    return lines.join("\n");
  }

  function render() {
    const list = Store.shopping();
    const total = list.items.length + list.extra.length;
    const done = list.items.filter((x) => x.done).length + list.extra.filter((x) => x.done).length;
    $("shopProgress").textContent = total ? t("shop.progress", { done, total }) : "";
    $("shopEmpty").hidden = total > 0;
    document.querySelector(".shop-head").hidden = total === 0;
    $("clearDone").disabled = done === 0;
    $("copyList").replaceChildren(icon("copy", 16), el("span", { text: t("shop.copy") }));
    $("printList").replaceChildren(icon("printer", 16), el("span", { text: t("recipe.print") }));

    const groups = DATA.AISLES.map((a) => ({ a, items: list.items.filter((x) => DATA.INGREDIENTS[x.ing] && DATA.INGREDIENTS[x.ing].aisle === a)
      .sort((x, y) => ingName(x.ing).localeCompare(ingName(y.ing), Core.getLang())) })) // same ingredient in two units sits together
      .filter((g) => g.items.length);
    $("shopList").replaceChildren(
      ...groups.map((g) => el("section", { class: "aisle", "aria-labelledby": "aisle-" + g.a },
        el("h2", { id: "aisle-" + g.a, text: t("aisle." + g.a) }),
        el("ul", { class: "shop-items" }, g.items.map((x) => row(x.key, x.done,
          el("span", { class: "shop-main" }, el("span", { class: "shop-name", text: ingName(x.ing) }), el("span", { class: "shop-amount", text: Site.amount(x.amount, x.unit) })),
          t("shop.for", { list: x.from.map((id) => DATA.recipe(id)).filter(Boolean).map(recipeName).join(", ") })))))),
      list.extra.length ? el("section", { class: "aisle", "aria-labelledby": "aisle-extra" },
        el("h2", { id: "aisle-extra", text: t("aisle.extra") }),
        el("ul", { class: "shop-items" }, list.extra.map((x) => row(x.key, x.done, el("span", { class: "shop-main" }, el("span", { class: "shop-name", text: x.text })))))) : null);
  }

  $("copyList").addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(asText(Store.shopping()));
      Core.toast(t("shop.copied"));
    } catch (e) {
      Core.toast(t("shop.copyFail"));
    }
  });
  $("printList").addEventListener("click", () => window.print());
  $("clearDone").addEventListener("click", () => {
    const undo = Store.clearShopping(true);
    Core.toast(t("shop.clearedDone"), { label: t("action.undo"), onClick: undo });
  });
  $("clearAll").addEventListener("click", () => {
    const undo = Store.clearShopping(false);
    Core.toast(t("shop.cleared"), { label: t("action.undo"), onClick: undo });
  });

  Site.start(render, { title: () => t("page.shopping") });
})();
