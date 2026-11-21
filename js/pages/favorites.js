/* Favourites: the recipes you saved with the heart button, newest first,
   with your personal note when you wrote one, and a clear Remove button
   (with Undo). */
(function () {
  "use strict";
  const { t } = Core;
  const { el, icon, recipeName } = Site;
  const $ = (id) => document.getElementById(id);

  function remove(r) {
    Store.toggleFavourite(r.id);
    Core.toast(t("fav.removed", { name: recipeName(r) }), { label: t("action.undo"), onClick: () => Store.toggleFavourite(r.id) });
    const first = document.querySelector(".fav-remove");
    (first || document.querySelector("#favEmpty .btn")).focus();
  }

  function render() {
    const list = Store.favourites().map(DATA.recipe);
    $("favCount").textContent = list.length ? t("favs.count", { count: list.length }) : "";
    $("favList").hidden = list.length === 0;
    $("favEmpty").hidden = list.length > 0;
    $("favList").replaceChildren(...list.map((r) => {
      const note = Store.note(r.id);
      return Site.card(r, {
        extra: [
          note && el("p", { class: "card-note" }, el("strong", { text: t("recipe.note") + ": " }), note.slice(0, 140) + (note.length > 140 ? "…" : "")),
          el("div", { class: "card-actions" },
            el("button", { type: "button", class: "btn btn-ghost btn-small fav-remove", onclick: () => remove(r) }, icon("x", 16), el("span", { text: t("favs.remove") }))),
        ],
      });
    }));
  }

  Site.start(render, { title: () => t("page.favorites") });
})();
