/* Shopping list: ingredients added from recipes (the same ingredient from
   several recipes is added up, in compatible units) plus your own items,
   grouped by shop aisle. Tick what you bought, copy the list as text,
   print it, or clear it (with Undo). */
(function () {
  "use strict";
  const { t } = Core;
  const { el, icon, ingName, recipeName } = Site;
  const $ = (id) => document.getElementById(id);
  const whole = (x) => ({ whole: DATA.ALWAYS_WHOLE.includes(x.ing) && x.unit === "pcs" });
  const amountOf = (x) => Site.amount(x.amount, x.unit, whole(x));

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

  function row(key, done, name, amount, sub) {
    const id = "item-" + key.replace(/[^a-z0-9]/gi, "");
    return el("li", { class: "shop-item" + (done ? " is-done" : "") },
      Site.tick(el("input", { type: "checkbox", id, checked: done, onchange: (e) => Store.setDone(key, e.target.checked) })),
      el("label", { for: id },
        el("span", { class: "shop-main" }, el("span", { class: "shop-name", text: name }), amount && el("span", { class: "shop-amount", text: amount })),
        sub && el("span", { class: "shop-from", text: sub })),
      el("button", { type: "button", class: "icon-btn", "aria-label": t("shop.remove", { name }), onclick: () => {
        const undo = Store.removeItem(key);
        Core.toast(t("shop.removed", { name }), { label: t("action.undo"), onClick: undo });
        $("extraInput").focus();
      } }, icon("x", 18)));
  }

  // Plain text version for "Copy list": grouped by aisle, only what is left to buy.
  function asText(list) {
    const lines = [t("page.shopping") + " — OLIVE"];
    DATA.AISLES.forEach((a) => {
      const items = list.items.filter((x) => DATA.INGREDIENTS[x.ing] && DATA.INGREDIENTS[x.ing].aisle === a && !x.done);
      if (!items.length) return;
      lines.push("", t("aisle." + a) + ":");
      items.forEach((x) => lines.push("- " + ingName(x.ing) + ", " + amountOf(x)));
    });
    const extra = list.extra.filter((x) => !x.done);
    if (extra.length) lines.push("", t("aisle.extra") + ":", ...extra.map((x) => "- " + x.text));
    return lines.join("\n");
  }

  function aisle(id, title, rows, total, left) {
    return el("section", { class: "aisle", "aria-labelledby": "aisle-" + id },
      el("div", { class: "aisle-head" },
        el("h2", { id: "aisle-" + id, text: title }),
        el("span", { class: "aisle-count", text: t("shop.aisleLeft", { left, total }) })),
      el("ul", { class: "shop-items" }, rows));
  }

  function render() {
    const list = Store.shopping();
    const total = list.items.length + list.extra.length;
    const done = list.items.filter((x) => x.done).length + list.extra.filter((x) => x.done).length;
    $("shopBig").textContent = total ? `${done}/${total}` : "0";
    $("shopProgress").textContent = total ? t("shop.progress", { done, total }) : t("shop.nothing");
    $("shopBar").style.width = total ? (done / total) * 100 + "%" : "0";
    $("shopEmpty").hidden = total > 0;
    $("clearDone").disabled = done === 0;
    $("clearAll").disabled = total === 0;
    $("copyList").disabled = total === done;
    $("printList").disabled = total === 0;
    $("copyList").replaceChildren(icon("copy", 16), el("span", { text: t("shop.copy") }));
    $("printList").replaceChildren(icon("printer", 16), el("span", { text: t("recipe.print") }));

    const groups = DATA.AISLES.map((a) => ({ a, items: list.items.filter((x) => DATA.INGREDIENTS[x.ing] && DATA.INGREDIENTS[x.ing].aisle === a)
      .sort((x, y) => ingName(x.ing).localeCompare(ingName(y.ing), Core.getLang())) })) // same ingredient in two units sits together
      .filter((g) => g.items.length);
    $("shopList").replaceChildren(
      ...groups.map((g) => aisle(g.a, t("aisle." + g.a),
        g.items.map((x) => row(x.key, x.done, ingName(x.ing), amountOf(x),
          t("shop.for", { list: x.from.map((id) => DATA.recipe(id)).filter(Boolean).map(recipeName).join(", ") }))),
        g.items.length, g.items.filter((x) => !x.done).length)),
      ...(list.extra.length ? [aisle("extra", t("aisle.extra"), list.extra.map((x) => row(x.key, x.done, x.text)), list.extra.length, list.extra.filter((x) => !x.done).length)] : []));
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
