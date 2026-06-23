// app.js — render tabs + flip-cards from content.js
(function () {
  document.getElementById("site-title").textContent = DATASET.title;
  document.getElementById("site-subtitle").textContent = DATASET.subtitle;

  const tabsEl = document.getElementById("tabs");
  const contentEl = document.getElementById("content");
  let active = 0;

  function plotPath(tabId, file, ext) {
    return `assets/plots/${tabId}/${file}.${ext}`;
  }

  function renderTabButtons() {
    tabsEl.innerHTML = "";
    TABS.forEach((tab, i) => {
      const b = document.createElement("button");
      b.className = "tab-btn" + (i === active ? " active" : "");
      b.innerHTML = `<span class="tab-num">${i + 1}</span>${tab.name}`;
      b.addEventListener("click", () => { active = i; render(); window.scrollTo({top:0,behavior:"smooth"}); });
      tabsEl.appendChild(b);
    });
  }

  function card(tab, plot) {
    const el = document.createElement("div");
    el.className = "card";
    el.innerHTML = `
      <div class="card-inner">
        <div class="face front">
          <div class="imgwrap"><img loading="lazy" src="${plotPath(tab.id, plot.file, "png")}" alt="${plot.title}"></div>
          <div class="cap"><h3>${plot.title}</h3><span class="flip-hint">click to flip ⤺</span></div>
        </div>
        <div class="face back">
          <h3>${plot.title}</h3>
          <div class="block"><span class="label">Purpose</span><p>${plot.purpose}</p></div>
          <div class="block"><span class="label read">How to read it</span><p>${plot.interpret}</p></div>
          <div class="block"><span class="label tip">Tip</span><p>${plot.tip}</p></div>
          ${plot.cite ? `<p class="plot-cite">Source: ${plot.cite}</p>` : ""}
          <a class="pdf" href="${plotPath(tab.id, plot.file, "pdf")}" target="_blank" rel="noopener" onclick="event.stopPropagation()">⬇ Download PDF</a>
        </div>
      </div>`;
    el.addEventListener("click", () => el.classList.toggle("flipped"));
    return el;
  }

  function render() {
    renderTabButtons();
    const tab = TABS[active];
    contentEl.innerHTML = "";
    const intro = document.createElement("div");
    intro.className = "tab-intro";
    intro.innerHTML = `<h2>${active + 1}. ${tab.name}</h2><p>${tab.intro}</p>` +
      (tab.cite ? `<p class="tab-cite">Source: ${tab.cite}</p>` : "");
    contentEl.appendChild(intro);
    const grid = document.createElement("div");
    grid.className = "grid";
    tab.plots.forEach(p => grid.appendChild(card(tab, p)));
    contentEl.appendChild(grid);
  }

  render();
})();
