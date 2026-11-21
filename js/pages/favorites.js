/* Favourites: the recipes you saved with the heart button, newest first,
   with your personal note when you wrote one. */
(function () {
  "use strict";
  const { t } = Core;
  const { el } = Site;
  const $ = (id) => document.getElementById(id);

  function render() {
    const list = Store.favourites().map(DATA.recipe);
    $("favCount").textContent = list.length ? t("favs.count", { count: list.length }) : "";
    $("favList").hidden = list.length === 0;
    $("favEmpty").hidden = list.length > 0;
    $("favList").replaceChildren(...list.map((r) => {
      const note = Store.note(r.id);
      return Site.card(r, note ? el("p", { class: "card-note" }, el("strong", { text: t("recipe.note") + ": " }), note.slice(0, 120) + (note.length > 120 ? "…" : "")) : null);
    }));
  }

  Site.start(render, { title: () => t("page.favorites") });
})();
