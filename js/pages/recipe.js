/* One recipe (recipe.html?id=plov):
   - servings calculator: every amount is scaled (and remembered)
   - ingredient checklist, and "add to shopping list" (all, or only the ones
     you haven't ticked as "I have it")
   - steps you can tick off, with cooking timers on the timed steps
   - favourite, print, put it in the week plan, a personal note
   - "keep the screen on" while cooking, where the browser supports it */
(function () {
  "use strict";
  const { t } = Core;
  const { el, icon, ingName, recipeName } = Site;
  const $ = (id) => document.getElementById(id);
  const r = DATA.recipe(new URLSearchParams(location.search).get("id"));

  // what the visitor ticked on this visit
  const have = new Set();
  const doneSteps = new Set();
  let people = r ? Store.servings(r) : 0;

  /* ---------- not found ---------- */
  function renderMissing() {
    $("view").replaceChildren(el("div", { class: "empty" },
      el("h1", { text: t("recipe.notFound") }),
      el("p", { text: t("recipe.notFoundText") }),
      el("a", { class: "btn", href: "recipes.html", text: t("home.allRecipes") })));
  }

  /* ---------- servings ---------- */
  function setPeople(n) {
    people = Math.max(1, Math.min(24, n));
    Store.setServings(r.id, people);
    renderIngredients();
    $("peopleNum").textContent = String(people);
    $("peopleLess").disabled = people <= 1;
    $("peopleMore").disabled = people >= 24;
    $("peopleLive").textContent = t("recipe.servingsNow", { count: people });
  }
  function servingsBox() {
    return el("div", { class: "servings" },
      el("p", { class: "field-label", id: "peopleLabel", text: t("recipe.servings") }),
      el("div", { class: "stepper", role: "group", "aria-labelledby": "peopleLabel" },
        el("button", { type: "button", id: "peopleLess", class: "icon-btn", "aria-label": t("recipe.less"), disabled: people <= 1, onclick: () => setPeople(people - 1) }, icon("minus", 18)),
        el("output", { id: "peopleNum", class: "stepper-num", text: String(people) }),
        el("button", { type: "button", id: "peopleMore", class: "icon-btn", "aria-label": t("recipe.more"), disabled: people >= 24, onclick: () => setPeople(people + 1) }, icon("plus", 18))),
      el("p", { class: "hint", text: t("recipe.original", { count: r.serves }) }),
      el("p", { id: "peopleLive", class: "visually-hidden", "aria-live": "polite" }));
  }

  /* ---------- ingredients ---------- */
  function renderIngredients() {
    const list = Store.scaled(r, people);
    $("ingList").replaceChildren(...list.map((it) => {
      const id = "have-" + it.ing;
      const staple = DATA.INGREDIENTS[it.ing].staple;
      return el("li", { class: "ing" + (have.has(it.ing) ? " is-have" : "") },
        el("input", { type: "checkbox", id, checked: have.has(it.ing), onchange: (e) => {
          e.target.checked ? have.add(it.ing) : have.delete(it.ing);
          e.target.closest("li").classList.toggle("is-have", e.target.checked);
          renderShopButtons();
        } }),
        el("label", { for: id },
          el("span", { class: "ing-amount", text: Site.amount(it.amount, it.unit) }),
          el("span", { class: "ing-name", text: ingName(it.ing) }),
          staple && el("span", { class: "ing-staple", text: t("recipe.staple") })));
    }));
    renderShopButtons();
  }
  function renderShopButtons() {
    const toBuy = r.items.map((it) => it.ing).filter((id) => !DATA.INGREDIENTS[id].staple && !have.has(id));
    $("shopBtns").replaceChildren(
      el("button", { type: "button", class: "btn", disabled: toBuy.length === 0, onclick: () => {
        const n = Store.addToShopping(r, people, have.size ? toBuy : null);
        Core.toast(t("shop.addedCount", { count: n }), { label: t("shop.open"), onClick: () => (location.href = "shopping.html") });
      } }, icon("cart", 18), el("span", { text: have.size ? t("recipe.addMissing", { count: toBuy.length }) : t("recipe.addAll") })),
      el("p", { class: "hint", text: t("recipe.tickHint") }));
  }

  /* ---------- steps and timers ---------- */
  function renderProgress() {
    $("stepProgress").textContent = t("recipe.stepsDone", { done: doneSteps.size, total: r.steps.length });
  }
  function stepsList() {
    return el("ol", { class: "steps" }, r.steps.map((s, i) => {
      const id = "step-" + i;
      return el("li", { class: "step" + (doneSteps.has(i) ? " is-done" : "") },
        el("div", { class: "step-check" },
          el("input", { type: "checkbox", id, checked: doneSteps.has(i), onchange: (e) => {
            e.target.checked ? doneSteps.add(i) : doneSteps.delete(i);
            e.target.closest("li").classList.toggle("is-done", e.target.checked);
            renderProgress();
          } }),
          el("label", { for: id, class: "step-num", text: t("recipe.step", { n: i + 1 }) })),
        el("p", { class: "step-text", text: s.text[Core.getLang()] }),
        s.min ? el("button", { type: "button", class: "btn btn-ghost btn-small timer-btn", onclick: () => Timers.start(i, s.min) },
          icon("timer", 16), el("span", { text: t("timer.start", { time: Site.minutes(s.min) }) })) : null);
    }));
  }

  // Cooking timers. They count from an end time, so they stay right even if
  // the tab sleeps. When one ends: a short beep, a vibration and a message.
  const Timers = (() => {
    const list = []; // { step, end, left (ms, when paused), paused, done }
    let tick = 0;
    let audio = null;
    function beep() {
      try {
        audio = audio || new (window.AudioContext || window.webkitAudioContext)();
        [0, 0.35, 0.7].forEach((at) => {
          const o = audio.createOscillator();
          const g = audio.createGain();
          o.frequency.value = 880;
          g.gain.setValueAtTime(0.0001, audio.currentTime + at);
          g.gain.exponentialRampToValueAtTime(0.25, audio.currentTime + at + 0.02);
          g.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + at + 0.25);
          o.connect(g).connect(audio.destination);
          o.start(audio.currentTime + at);
          o.stop(audio.currentTime + at + 0.3);
        });
      } catch (e) { /* no sound: the message is still shown */ }
      if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
    }
    const left = (tm) => (tm.paused ? tm.left : Math.max(0, tm.end - Date.now()));
    const clock = (ms) => {
      const s = Math.ceil(ms / 1000);
      return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0");
    };
    function draw() {
      const bar = $("timerBar");
      bar.hidden = list.length === 0;
      bar.replaceChildren(...list.map((tm) => el("div", { class: "timer" + (tm.done ? " is-done" : "") },
        el("span", { class: "timer-name", text: t("recipe.step", { n: tm.step + 1 }) }),
        el("span", { class: "timer-time", text: tm.done ? t("timer.done") : clock(left(tm)) }),
        !tm.done && el("button", { type: "button", class: "btn btn-ghost btn-small", text: t(tm.paused ? "timer.resume" : "timer.pause"), onclick: () => pause(tm) }),
        el("button", { type: "button", class: "icon-btn", "aria-label": t(tm.done ? "timer.dismiss" : "timer.cancel", { n: tm.step + 1 }), onclick: () => remove(tm) }, icon("x", 16)))),
      el("p", { id: "timerLive", class: "visually-hidden", "aria-live": "assertive" }));
    }
    function loop() {
      list.forEach((tm) => {
        if (!tm.done && !tm.paused && left(tm) <= 0) {
          tm.done = true;
          beep();
          Core.toast(t("timer.finished", { n: tm.step + 1 }));
          draw();
          $("timerLive").textContent = t("timer.finished", { n: tm.step + 1 });
        }
      });
      document.querySelectorAll(".timer-time").forEach((node, i) => {
        if (list[i] && !list[i].done) node.textContent = clock(left(list[i]));
      });
      if (!list.some((tm) => !tm.done && !tm.paused)) {
        clearInterval(tick);
        tick = 0;
      }
    }
    function run() {
      if (!tick) tick = setInterval(loop, 500);
    }
    function start(step, min) {
      const old = list.find((tm) => tm.step === step);
      if (old) remove(old, true);
      list.push({ step, end: Date.now() + min * 60000, paused: false, done: false });
      // unlock sound on this tap, so the beep can play later
      try { audio = audio || new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { /* ignore */ }
      draw();
      run();
      Core.toast(t("timer.started", { n: step + 1, time: Site.minutes(min) }));
    }
    function pause(tm) {
      if (tm.paused) {
        tm.end = Date.now() + tm.left;
        tm.paused = false;
        run();
      } else {
        tm.left = left(tm);
        tm.paused = true;
      }
      draw();
    }
    function remove(tm, quiet) {
      list.splice(list.indexOf(tm), 1);
      if (!quiet) draw();
    }
    return { start, draw };
  })();

  /* ---------- keep the screen on (Wake Lock API) ---------- */
  let lock = null;
  async function setAwake(on, box) {
    try {
      if (on) {
        lock = await navigator.wakeLock.request("screen");
        lock.addEventListener("release", () => {
          lock = null;
          if (box) box.checked = false;
        });
      } else if (lock) await lock.release();
    } catch (e) {
      if (box) box.checked = false;
      Core.toast(t("recipe.awakeFail"));
    }
  }
  // the browser drops the lock when the tab is hidden: take it again on return
  document.addEventListener("visibilitychange", () => {
    const box = $("awake");
    if (document.visibilityState === "visible" && box && box.checked && !lock) setAwake(true, box);
  });

  /* ---------- plan and note ---------- */
  function planBox() {
    const dayId = "planDay";
    const mealId = "planMeal";
    return el("form", { class: "plan-box", onsubmit: (e) => {
      e.preventDefault();
      const day = $(dayId).value;
      const meal = $(mealId).value;
      Store.setMeal(day, meal, r.id);
      Core.toast(t("plan.added", { name: recipeName(r), day: t("day." + day), meal: t("meal." + meal) }), { label: t("plan.open"), onClick: () => (location.href = "plan.html") });
    } },
      el("h2", { text: t("recipe.planTitle") }),
      el("div", { class: "plan-row" },
        el("div", { class: "field" }, el("label", { for: dayId, text: t("plan.day") }),
          el("select", { id: dayId, class: "input" }, Store.DAYS.map((d) => el("option", { value: d, text: t("day." + d) })))),
        el("div", { class: "field" }, el("label", { for: mealId, text: t("plan.meal") }),
          el("select", { id: mealId, class: "input" }, Store.MEALS.map((m) => el("option", { value: m, text: t("meal." + m) })))),
        el("button", { type: "submit", class: "btn btn-ghost", text: t("plan.add") })));
  }
  function noteBox() {
    let timer = 0;
    return el("div", { class: "field note-box" },
      el("label", { for: "note", text: t("recipe.note") }),
      el("textarea", { id: "note", class: "input", rows: 3, maxlength: 1000, "aria-describedby": "noteSaved", placeholder: t("recipe.notePlaceholder"), oninput: (e) => {
        clearTimeout(timer);
        timer = setTimeout(() => {
          Store.setNote(r.id, e.target.value);
          $("noteSaved").textContent = t("recipe.noteSaved");
        }, 400);
      } }, Store.note(r.id)),
      el("p", { id: "noteSaved", class: "hint", "aria-live": "polite" }));
  }

  /* ---------- page ---------- */
  function render() {
    if (!r) return renderMissing();
    const lang = Core.getLang();
    const related = DATA.RECIPES.filter((x) => x.cat === r.cat && x.id !== r.id).slice(0, 3);
    $("view").replaceChildren(
      el("header", { class: "recipe-head" },
        el("p", { class: "card-cat", text: t("cat." + r.cat) + " · " + t("cuisine." + r.cuisine) }),
        el("h1", { text: recipeName(r) }),
        el("p", { class: "recipe-about", text: r.about[lang] }),
        Site.meta(r),
        el("div", { class: "recipe-actions" },
          el("span", { id: "favSlot" }, Site.favButton(r)),
          el("button", { type: "button", class: "btn btn-ghost", onclick: () => window.print() }, icon("printer", 18), el("span", { text: t("recipe.print") })),
          "wakeLock" in navigator && el("label", { class: "check" },
            el("input", { type: "checkbox", id: "awake", onchange: (e) => setAwake(e.target.checked, e.target) }),
            el("span", { text: t("recipe.awake") })))),
      el("div", { class: "recipe-body" },
        el("section", { class: "ingredients", "aria-labelledby": "ingTitle" },
          el("h2", { id: "ingTitle", text: t("recipe.ingredients") }),
          servingsBox(),
          el("ul", { id: "ingList", class: "ing-list" }),
          el("div", { id: "shopBtns", class: "shop-btns" })),
        el("section", { class: "method", "aria-labelledby": "stepsTitle" },
          el("h2", { id: "stepsTitle", text: t("recipe.steps") }),
          el("p", { id: "stepProgress", class: "result-count", "aria-live": "polite" }),
          stepsList())),
      el("div", { class: "recipe-extra" }, planBox(), noteBox()),
      related.length && el("section", { class: "section", "aria-labelledby": "relTitle" },
        el("h2", { id: "relTitle", text: t("recipe.related") }),
        el("div", { class: "card-grid" }, related.map((x) => Site.card(x)))));
    renderIngredients();
    renderProgress();
    Timers.draw();
  }

  Site.start(render, {
    title: () => (r ? recipeName(r) : t("recipe.notFound")),
    // saved data changed (e.g. favourite): only redraw the favourite button
    onChange: () => r && $("favSlot") && $("favSlot").replaceChildren(Site.favButton(r)),
  });
})();
