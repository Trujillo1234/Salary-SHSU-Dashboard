function buildOverviewSearch() {
  const input = buildPeopleDatalist("person-search", "people-list");
  document.getElementById("coverage-summary").textContent = `Salary files cover ${yearLabel(yearSummaries[0].fiscal_year)}-${yearLabel(latestYear)}. Separate remuneration files currently run through FY25.`;
  document.getElementById("open-person").addEventListener("click", () => {
    const person = findPersonByName(input.value) || defaultPerson();
    goToPerson(person);
  });
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      const person = findPersonByName(input.value) || defaultPerson();
      goToPerson(person);
    }
  });
}

function renderMetricStrip() {
  const fy2025 = yearSummaries.find((row) => row.fiscal_year === 2025);
  const latest = yearSummaries.find((row) => row.fiscal_year === latestYear);
  const realStart = yearSummaries.find((row) => row.fiscal_year === 2011)?.median_base_salary_real_fy2025;
  const realEnd = fy2025?.median_base_salary_real_fy2025;
  const realChange = realStart && realEnd ? (realEnd / realStart) - 1 : null;
  const texasMedian = dataset.peers.texas.median_by_year["2024"];
  const nationalMedian = dataset.peers.national.median_by_year["2024"];

  const cards = [
    ["Latest roster", `${latest.headcount}`, `${yearLabel(latestYear)} employees in the posted math-department file.`],
    ["Latest median base", money(latest.median_base_salary), `Nominal median base salary in ${yearLabel(latestYear)}.`],
    ["FY25 median total", money(fy2025?.median_total_comp_real_fy2025), `Median total compensation after converting to FY2025 dollars.`],
    ["Real median change", realChange == null ? "n/a" : `${(realChange * 100).toFixed(1)}%`, `Purchasing-power change from FY11 to FY25.`],
    ["Texas peer median", money(texasMedian), `2024 monthly faculty benchmark for selected Texas peers.`],
    ["National peer median", money(nationalMedian), `2024 monthly faculty benchmark for selected national peers.`],
  ];

  document.getElementById("metric-strip").innerHTML = cards
    .map(
      ([label, value, note]) => `
        <article class="metric-card">
          <p class="field-label">${label}</p>
          <div class="metric-value">${value}</div>
          <p class="metric-note">${note}</p>
        </article>
      `
    )
    .join("");
}

function renderAbstract() {
  const fy2025 = yearSummaries.find((row) => row.fiscal_year === 2025);
  const latest = yearSummaries.find((row) => row.fiscal_year === latestYear);
  document.getElementById("abstract-copy").textContent =
    `The public SHSU salary files are treated here as a purchasing-power record, not only as a list of nominal salaries. The memo uses CPI-U to convert salary history into FY2025 dollars, then compares the math department with COSET, the full SHSU salary file, and public faculty-salary benchmarks for selected Texas and national peers. The latest salary file is ${yearLabel(latestYear)}; the latest separate extra-compensation file is FY25. In FY25, the department median total compensation was ${money(fy2025?.median_total_comp_real_fy2025)} in FY2025 dollars, and in ${yearLabel(latestYear)} the nominal median base salary was ${money(latest.median_base_salary)}.`;
}

function renderFindings() {
  const labels = [
    "Purchasing power",
    "Current roster",
    "Extra compensation",
    "Texas comparison",
    "National comparison",
    "Large-record check",
  ];
  document.getElementById("finding-list").innerHTML = dataset.findings
    .map((item, index) => `<li><strong>${labels[index] || "Finding"}.</strong> ${item}</li>`)
    .join("");
}

function renderRealBand() {
  const years = yearSummaries.map((row) => row.fiscal_year);
  plot(
    "figure-real-band",
    [
      {
        x: years,
        y: seriesByYear(yearSummaries, "p90_base_salary_real_fy2025"),
        mode: "lines",
        line: { width: 0 },
        hoverinfo: "skip",
        showlegend: false,
      },
      {
        x: years,
        y: seriesByYear(yearSummaries, "p10_base_salary_real_fy2025"),
        mode: "lines",
        fill: "tonexty",
        fillcolor: "rgba(164,129,53,0.18)",
        line: { width: 0 },
        name: "10th-90th range",
      },
      {
        x: years,
        y: seriesByYear(yearSummaries, "q3_base_salary_real_fy2025"),
        mode: "lines",
        line: { width: 0 },
        hoverinfo: "skip",
        showlegend: false,
      },
      {
        x: years,
        y: seriesByYear(yearSummaries, "q1_base_salary_real_fy2025"),
        mode: "lines",
        fill: "tonexty",
        fillcolor: "rgba(31,79,89,0.18)",
        line: { width: 0 },
        name: "Middle 50%",
      },
      {
        x: years,
        y: seriesByYear(yearSummaries, "median_base_salary_real_fy2025"),
        type: "scatter",
        mode: "lines+markers",
        line: { color: DASH_COLORS.deep, width: 3 },
        marker: { color: DASH_COLORS.accent, size: 8 },
        name: "Median",
      },
    ],
    layoutBase("Median and spread in FY2025 dollars", "Annual base salary, FY2025 dollars", 620)
  );
}

function renderContextTrend() {
  const groups = [
    ["department", "Math", DASH_COLORS.accent],
    ["college", "COSET", DASH_COLORS.deep],
    ["university", "SHSU", DASH_COLORS.deepSoft],
  ];
  const traces = groups.map(([key, label, color]) => ({
    x: contextSummaries[key].map((row) => row.fiscal_year),
    y: contextSummaries[key].map((row) => row.median_base_salary_real_fy2025),
    type: "scatter",
    mode: "lines+markers",
    name: label,
    line: { color, width: 3 },
    marker: { color, size: 7 },
  }));
  plot("figure-context-trend", traces, layoutBase("Real annual base salary medians by internal comparison group", "Median annual base salary, FY2025 dollars", 620));
}

function renderCompTrend() {
  const years = yearSummaries.map((row) => row.fiscal_year);
  plot(
    "figure-comp-trend",
    [
      {
        x: years,
        y: seriesByYear(yearSummaries, "median_total_comp_real_fy2025"),
        type: "scatter",
        mode: "lines+markers",
        name: "Median total comp",
        line: { color: DASH_COLORS.deep, width: 3 },
        marker: { color: DASH_COLORS.accent, size: 8 },
      },
      {
        x: years,
        y: yearSummaries.map((row) => +(row.compensation_recipient_share * 100).toFixed(1)),
        type: "scatter",
        mode: "lines+markers",
        name: "Extra-comp share",
        yaxis: "y2",
        line: { color: DASH_COLORS.gold, width: 3, dash: "dot" },
        marker: { color: DASH_COLORS.gold, size: 7 },
      },
    ],
    {
      ...layoutBase("Compensation level and reach", "Median total compensation, FY2025 dollars", 620),
      yaxis2: {
        title: { text: "Share of roster (%)" },
        overlaying: "y",
        side: "right",
        tickfont: { color: "#5a6a70" },
        showgrid: false,
      },
    }
  );
}

function renderDistribution() {
  const traces = yearSummaries.map((summary) => ({
    y: dataset.records
      .filter((row) => row.fiscal_year === summary.fiscal_year)
      .map((row) => row.base_salary_real_fy2025)
      .filter((value) => value != null),
    name: yearLabel(summary.fiscal_year),
    type: "box",
    boxpoints: "suspectedoutliers",
    marker: { color: DASH_COLORS.accentSoft, size: 5, opacity: 0.55 },
    line: { color: DASH_COLORS.deep },
    fillcolor: "rgba(71,104,116,0.18)",
  }));
  plot("figure-distribution", traces, {
    ...layoutBase("Department distribution by fiscal year", "Annual base salary, FY2025 dollars", 620),
    xaxis: { tickfont: { color: "#5a6a70" }, title: { text: "Fiscal year" } },
  });
}

function renderRankMix() {
  const ranks = [...new Set(dataset.records.map((row) => row.rank_group))];
  const traces = ranks.map((rank, index) => ({
    x: yearSummaries.map((row) => row.fiscal_year),
    y: yearSummaries.map((row) => {
      const total = row.headcount || 1;
      const stat = row.rank_stats.find((item) => item.rank_group === rank);
      return stat ? +(stat.count / total * 100).toFixed(1) : 0;
    }),
    type: "scatter",
    mode: "lines",
    stackgroup: "one",
    name: rank,
    line: { width: 0.6 },
  }));
  plot("figure-rank-mix", traces, layoutBase("Roster composition by rank group", "Share of department roster (%)", 520));
}

function renderPeerTrend() {
  const years = Object.keys(dataset.peers.shsu.salary_by_year).map(Number);
  plot(
    "figure-peer-trend",
    [
      {
        x: years,
        y: years.map((year) => dataset.peers.shsu.salary_by_year[String(year)]),
        type: "scatter",
        mode: "lines+markers",
        name: "SHSU",
        line: { color: DASH_COLORS.deep, width: 3 },
        marker: { color: DASH_COLORS.deep, size: 7 },
      },
      {
        x: years,
        y: years.map((year) => dataset.peers.texas.median_by_year[String(year)]),
        type: "scatter",
        mode: "lines",
        name: "Texas peers",
        line: { color: DASH_COLORS.accent, width: 3, dash: "dot" },
      },
      {
        x: years,
        y: years.map((year) => dataset.peers.national.median_by_year[String(year)]),
        type: "scatter",
        mode: "lines",
        name: "National peers",
        line: { color: DASH_COLORS.deepSoft, width: 3, dash: "dash" },
      },
    ],
    layoutBase("Official average monthly faculty salary", "Monthly faculty salary (IPEDS / Scorecard)", 620)
  );
}

function bootOverview() {
  buildOverviewSearch();
  renderAbstract();
  renderMetricStrip();
  renderFindings();
  renderRealBand();
  renderContextTrend();
  renderCompTrend();
  renderDistribution();
  renderRankMix();
  renderPeerTrend();
  annotateFooter();
  markDashboardReady();
}

bootOverview();
