const dataset = window.ShsuMathSalaryData;

const DASH_COLORS = {
  deep: "#1f4f59",
  deepSoft: "#5f7f82",
  accent: "#9b443d",
  accentSoft: "#d17c62",
  gold: "#a48135",
  olive: "#6f7d53",
  slate: "#52666b",
  sand: "#d8c693",
};

const money = (value) =>
  value == null ? "n/a" : value.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const number = (value, digits = 1) => (value == null ? "n/a" : value.toLocaleString("en-US", { maximumFractionDigits: digits }));
const pct = (value, digits = 0) => (value == null ? "n/a" : `${(value * 100).toFixed(digits)}%`);
const yearLabel = (year) => `FY${String(year).slice(2)}`;
const toPercentPoints = (value) => (value == null ? null : +(value * 100).toFixed(1));
const signedPct = (value, digits = 1) => (value == null ? "n/a" : `${value > 0 ? "+" : ""}${(value * 100).toFixed(digits)}%`);

const people = dataset.people.slice().sort((a, b) => a.name.localeCompare(b.name));
const peopleBySlug = Object.fromEntries(people.map((person) => [person.slug, person]));
const yearSummaries = dataset.year_summaries.slice().sort((a, b) => a.fiscal_year - b.fiscal_year);
const contextSummaries = dataset.context_summaries;
const latestYear = Math.max(...yearSummaries.map((row) => row.fiscal_year));
const DEFAULT_PERSON_SLUG = "trujillo-timothy-o";
const chartScreenHeights = new WeakMap();
const chartScreenMargins = new WeakMap();

function isPrintMode() {
  return document.body.classList.contains("print-mode") || window.matchMedia("print").matches;
}

function layoutBase(title, yTitle, height = 540) {
  const print = isPrintMode();
  return {
    title: { text: "" },
    autosize: true,
    height: print ? 360 : height,
    margin: print ? { l: 58, r: 24, t: 28, b: 48 } : { l: 76, r: 38, t: 34, b: 62 },
    paper_bgcolor: "rgba(0,0,0,0)",
    plot_bgcolor: "rgba(0,0,0,0)",
    font: { family: "IBM Plex Sans, sans-serif", color: "#162327", size: print ? 10 : 13 },
    legend: {
      orientation: "h",
      y: 1.08,
      x: 0,
      xanchor: "left",
      yanchor: "bottom",
      bgcolor: "rgba(255,255,255,0.86)",
      font: { size: print ? 9 : 12 },
    },
    xaxis: {
      gridcolor: "rgba(22,35,39,0.08)",
      linecolor: "rgba(22,35,39,0.18)",
      tickfont: { color: "#5a6a70" },
      title: { text: "Fiscal year" },
    },
    yaxis: {
      gridcolor: "rgba(22,35,39,0.08)",
      zerolinecolor: "rgba(22,35,39,0.12)",
      linecolor: "rgba(22,35,39,0.18)",
      tickfont: { color: "#5a6a70" },
      title: { text: yTitle },
    },
  };
}

function plot(id, traces, layout) {
  const plotElement = document.getElementById(id);
  if (!window.Plotly) {
    document.body.classList.add("chart-static-mode", "dashboard-chart-warning");
    return;
  }
  Plotly.newPlot(plotElement, traces, layout, { responsive: true, displayModeBar: false }).then(() => {
    if (isPrintMode()) {
      setPrintMode(true);
    } else {
      Plotly.Plots.resize(plotElement);
    }
  });
}

function setPrintMode(active) {
  document.body.classList.toggle("print-mode", active);

  document.querySelectorAll(".calc-note").forEach((note) => {
    if (active) {
      note.dataset.wasOpen = note.open ? "true" : "false";
      note.open = true;
    } else if (note.dataset.wasOpen) {
      note.open = note.dataset.wasOpen === "true";
      delete note.dataset.wasOpen;
    }
  });

  if (!window.Plotly) {
    return;
  }

  document.querySelectorAll(".figure-plot").forEach((plotElement) => {
    if (!plotElement.data || !plotElement.layout) {
      return;
    }
    if (!chartScreenHeights.has(plotElement)) {
      chartScreenHeights.set(plotElement, plotElement.layout.height || 520);
    }
    if (!chartScreenMargins.has(plotElement)) {
      chartScreenMargins.set(plotElement, { ...(plotElement.layout.margin || {}) });
    }

    const printHeight = plotElement.id.includes("zscore") ? 250 : 340;
    const nextHeight = active ? printHeight : chartScreenHeights.get(plotElement);
    const printWidth = Math.max(320, Math.floor(plotElement.clientWidth || plotElement.getBoundingClientRect().width || 320));
    const printMargin = plotElement.id.includes("zscore") ? { l: 88, r: 28, t: 24, b: 44 } : { l: 58, r: 24, t: 24, b: 44 };
    Plotly.relayout(plotElement, {
      autosize: !active,
      height: nextHeight,
      width: active ? printWidth : null,
      margin: active ? printMargin : chartScreenMargins.get(plotElement),
      "legend.font.size": active ? 9 : 12,
    });
    Plotly.Plots.resize(plotElement);
  });
}

function buildPeopleDatalist(inputId, listId) {
  const datalist = document.getElementById(listId);
  datalist.innerHTML = people.map((person) => `<option value="${person.name}"></option>`).join("");
  const input = document.getElementById(inputId);
  return input;
}

function findPersonByName(name) {
  const target = (name || "").trim().toLowerCase();
  return (
    people.find((person) => person.name.toLowerCase() === target) ||
    people.find((person) => person.name.toLowerCase().startsWith(target)) ||
    people.find((person) => person.name.toLowerCase().includes(target))
  );
}

function defaultPerson() {
  return peopleBySlug[DEFAULT_PERSON_SLUG] || people[0];
}

function displayPersonName(person) {
  if (!person?.name || !person.name.includes(",")) {
    return person?.name || "";
  }
  const [last, rest] = person.name.split(",").map((part) => part.trim());
  return `${rest} ${last}`;
}

function findPersonFromQuery() {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get("person");
  if (slug && peopleBySlug[slug]) {
    return peopleBySlug[slug];
  }
  return defaultPerson();
}

function personPageFile() {
  return window.location.pathname.toLowerCase().endsWith("-standalone.html") ? "person-standalone.html" : "person.html";
}

function goToPerson(person) {
  window.location.href = `${personPageFile()}?person=${encodeURIComponent(person.slug)}`;
}

function seriesByYear(rows, field) {
  return rows.map((row) => row[field] ?? null);
}

function annotateFooter() {
  const notes = dataset.metadata.notes.join(" ");
  const footer = document.getElementById("footer-notes");
  if (footer) {
    footer.textContent = notes;
  }
}

function markDashboardReady() {
  document.body.classList.add("dashboard-ready");
  if (document.body.classList.contains("chart-static-mode")) {
    document.body.classList.add("dashboard-chart-warning");
  }
}

window.addEventListener("beforeprint", () => setPrintMode(true));
window.addEventListener("afterprint", () => setPrintMode(false));

const printMedia = window.matchMedia?.("print");
if (printMedia) {
  const syncPrintMode = (event) => setPrintMode(event.matches);
  if (printMedia.addEventListener) {
    printMedia.addEventListener("change", syncPrintMode);
  } else if (printMedia.addListener) {
    printMedia.addListener(syncPrintMode);
  }
}
