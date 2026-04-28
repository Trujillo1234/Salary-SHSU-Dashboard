function connectPersonSearch(currentPerson) {
  const input = buildPeopleDatalist("person-search", "people-list");
  input.value = currentPerson.name;
  const openSelected = () => {
    const person = findPersonByName(input.value) || currentPerson;
    goToPerson(person);
  };
  document.getElementById("open-person").addEventListener("click", openSelected);
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      openSelected();
    }
  });
}

function getContextRow(group, year) {
  return contextSummaries[group].find((row) => row.fiscal_year === year);
}

function indexSeries(rows, field) {
  const first = rows.find((row) => row[field] != null)?.[field];
  return rows.map((row) => {
    const value = row[field];
    if (first == null || !first || value == null) {
      return null;
    }
    return +((value / first) * 100).toFixed(1);
  });
}

function purchasingPowerSummarySentence(name, realChange, latestComparableVsPeak, firstYearLabel, latestYearLabel, peakYearLabel) {
  if (realChange == null) {
    return `The public salary files show ${name}'s nominal base salary record, but a complete purchasing-power change is not computed for the available years.`;
  }

  const changeText = signedPct(realChange);
  let peakText = "";
  if (latestComparableVsPeak != null) {
    if (latestComparableVsPeak > 0.005) {
      peakText = ` The latest comparable real salary is ${(latestComparableVsPeak * 100).toFixed(1)}% above the observed real-salary peak in ${peakYearLabel}.`;
    } else if (latestComparableVsPeak < -0.005) {
      peakText = ` The latest comparable real salary is ${(Math.abs(latestComparableVsPeak) * 100).toFixed(1)}% below the observed real-salary peak in ${peakYearLabel}.`;
    } else {
      peakText = ` The latest comparable real salary matches the observed real-salary peak in ${peakYearLabel}.`;
    }
  }

  if (realChange > 0.005) {
    return `The public salary files show that ${name}'s real base salary increased by ${(realChange * 100).toFixed(1)}% from ${firstYearLabel} to ${latestYearLabel} after converting annual base pay to FY2025 dollars.${peakText}`;
  }

  if (realChange < -0.005) {
    return `The public salary files show that ${name}'s real base salary decreased by ${(Math.abs(realChange) * 100).toFixed(1)}% from ${firstYearLabel} to ${latestYearLabel} after converting annual base pay to FY2025 dollars.${peakText}`;
  }

  return `The public salary files show that ${name}'s real base salary was essentially flat from ${firstYearLabel} to ${latestYearLabel}, changing ${changeText} after converting annual base pay to FY2025 dollars.${peakText}`;
}

function renderPersonHeader(person) {
  const latest = person.years[person.years.length - 1];
  const name = displayPersonName(person);
  document.getElementById("person-name").textContent = name;
  document.getElementById("person-subtitle").textContent = `${latest.position_title}. Observed from ${yearLabel(person.first_year)} to ${yearLabel(person.last_year)} in the SHSU math-department salary files.`;

  const firstComparable = person.years.find((row) => row.base_salary_real_fy2025 != null);
  const lastComparable = [...person.years].reverse().find((row) => row.base_salary_real_fy2025 != null);
  const realChange = firstComparable && lastComparable ? (lastComparable.base_salary_real_fy2025 / firstComparable.base_salary_real_fy2025) - 1 : null;
  const comparableWindow =
    firstComparable && lastComparable ? `from ${yearLabel(firstComparable.fiscal_year)} to ${yearLabel(lastComparable.fiscal_year)}` : "across the comparable years";
  document.getElementById("profile-copy").textContent =
    `${name}'s salary record is shown in department, college, university, state, and national context. The latest observed nominal base salary is ${money(latest.base_salary)} in ${yearLabel(latest.fiscal_year)}. The real-salary figures convert annual base pay into FY2025 dollars, so the purchasing-power change ${comparableWindow} is ${signedPct(realChange)}.`;
}

function renderPersonCaseSummary(person) {
  const name = displayPersonName(person);
  const latest = person.years[person.years.length - 1];
  const firstComparable = person.years.find((row) => row.base_salary_real_fy2025 != null);
  const lastComparable = [...person.years].reverse().find((row) => row.base_salary_real_fy2025 != null);
  const realChange = firstComparable && lastComparable ? (lastComparable.base_salary_real_fy2025 / firstComparable.base_salary_real_fy2025) - 1 : null;
  const realPeak = person.years.reduce((peak, row) => {
    if (row.base_salary_real_fy2025 == null) {
      return peak;
    }
    return !peak || row.base_salary_real_fy2025 > peak.base_salary_real_fy2025 ? row : peak;
  }, null);
  const latestComparableVsPeak =
    realPeak && lastComparable ? (lastComparable.base_salary_real_fy2025 / realPeak.base_salary_real_fy2025) - 1 : null;
  const latestComparableYearLabel = lastComparable ? yearLabel(lastComparable.fiscal_year) : "the latest comparable year";
  const firstComparableYearLabel = firstComparable ? yearLabel(firstComparable.fiscal_year) : "the first comparable year";
  const realPeakYearLabel = realPeak ? yearLabel(realPeak.fiscal_year) : "the peak comparable year";
  const hasRecentFlatNominal =
    person.years.length >= 3 && person.years.slice(-3).every((row) => row.base_salary === latest.base_salary);
  const compComparableRows = person.years.filter((row) => row.compensation_data_available);
  const postedExtraComp = compComparableRows.reduce((sum, row) => sum + (row.extra_comp || 0), 0);

  document.getElementById("person-citable-copy").textContent =
    `${purchasingPowerSummarySentence(name, realChange, latestComparableVsPeak, firstComparableYearLabel, latestComparableYearLabel, realPeakYearLabel)} The latest comparable real-dollar endpoint is ${latestComparableYearLabel}, because FY2026 is included in the salary roster but does not yet have the same complete inflation and separate remuneration context used for FY2025 and earlier.`;

  const items = [
    `Nominal base salary moved from ${money(firstComparable?.base_salary)} in ${firstComparableYearLabel} to ${money(latest.base_salary)} in ${yearLabel(latest.fiscal_year)}.`,
    `In real FY2025 dollars, base salary changed ${signedPct(realChange)} from ${firstComparableYearLabel} to ${latestComparableYearLabel}.`,
    `${latestComparableYearLabel} real base salary was ${signedPct(latestComparableVsPeak)} relative to the observed real-salary peak in ${realPeakYearLabel}.`,
    `In ${yearLabel(latest.fiscal_year)}, the record sits at ${pct(latest.department_base_salary_percentile)} inside the math-department salary file, ${pct(latest.college_base_salary_percentile)} inside COSET, and ${pct(latest.university_base_salary_percentile)} inside SHSU's full salary file.`,
    hasRecentFlatNominal
      ? `Nominal base salary is unchanged across ${person.years.slice(-3).map((row) => yearLabel(row.fiscal_year)).join(", ")} in the posted salary files.`
      : `The posted nominal base salary is ${money(latest.base_salary)} in ${yearLabel(latest.fiscal_year)}.`,
    postedExtraComp > 0
      ? `The separate remuneration files show ${money(postedExtraComp)} in posted extra compensation across the comparable years in this record.`
      : `The separate remuneration files show no posted extra compensation for this record in the comparable years available.`,
  ];

  document.getElementById("person-case-list").innerHTML = items.map((item) => `<li>${item}</li>`).join("");
}

function renderPersonMetrics(person) {
  const latest = person.years[person.years.length - 1];
  const firstComparable = person.years.find((row) => row.base_salary_real_fy2025 != null);
  const lastComparable = [...person.years].reverse().find((row) => row.base_salary_real_fy2025 != null);
  const realChange = firstComparable && lastComparable ? (lastComparable.base_salary_real_fy2025 / firstComparable.base_salary_real_fy2025) - 1 : null;
  const peakReal = Math.max(...person.years.map((row) => row.base_salary_real_fy2025 || 0));
  const latestComparableReal = lastComparable?.base_salary_real_fy2025;
  const belowPeak = peakReal && latestComparableReal ? (latestComparableReal / peakReal) - 1 : null;
  const latestComparableLabel = lastComparable ? yearLabel(lastComparable.fiscal_year) : "latest comparable year";

  const cards = [
    ["Latest nominal base", money(latest.base_salary), `${yearLabel(latest.fiscal_year)} annual base salary before inflation adjustment.`],
    ["Latest comparable real base", money(latestComparableReal), `${latestComparableLabel} annual base salary in FY2025 dollars; FY2026 real salary is not computed yet.`],
    ["Purchasing power", realChange == null ? "Not computed" : `${(realChange * 100).toFixed(1)}%`, `Real base-salary change from ${yearLabel(firstComparable?.fiscal_year)} to ${latestComparableLabel}.`],
    ["Distance from peak", belowPeak == null ? "Not computed" : `${(belowPeak * 100).toFixed(1)}%`, `Latest comparable real salary compared with the highest observed real-salary year.`],
    ["Math percentile", pct(latest.department_base_salary_percentile), "Standing inside the math-department salary file."],
    ["COSET percentile", pct(latest.college_base_salary_percentile), "Standing inside the COSET comparison group."],
  ];
  document.getElementById("person-metrics").innerHTML = cards
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

function renderPersonPurchasingPowerChart(person) {
  const years = person.years.map((row) => row.fiscal_year);
  plot(
    "person-purchasing-power-chart",
    [
      {
        x: years,
        y: indexSeries(person.years, "base_salary_real_fy2025"),
        type: "scatter",
        mode: "lines+markers",
        name: "This record",
        line: { color: DASH_COLORS.accent, width: 4 },
        marker: { color: DASH_COLORS.accent, size: 8 },
      },
      {
        x: years,
        y: indexSeries(years.map((year) => getContextRow("department", year) || {}), "median_base_salary_real_fy2025"),
        type: "scatter",
        mode: "lines",
        name: "Math median",
        line: { color: DASH_COLORS.deep, width: 3, dash: "dot" },
      },
      {
        x: years,
        y: indexSeries(years.map((year) => getContextRow("college", year) || {}), "median_base_salary_real_fy2025"),
        type: "scatter",
        mode: "lines",
        name: "COSET median",
        line: { color: DASH_COLORS.deepSoft, width: 3 },
      },
      {
        x: years,
        y: indexSeries(years.map((year) => getContextRow("university", year) || {}), "median_base_salary_real_fy2025"),
        type: "scatter",
        mode: "lines",
        name: "SHSU median",
        line: { color: DASH_COLORS.gold, width: 3, dash: "dash" },
      },
    ],
    {
      ...layoutBase("Purchasing-power index, first observed year = 100", "Real salary index", 620),
      yaxis: {
        title: { text: "Index; first observed year = 100" },
        gridcolor: "rgba(22,35,39,0.08)",
        zerolinecolor: "rgba(22,35,39,0.12)",
        linecolor: "rgba(22,35,39,0.18)",
        tickfont: { color: "#5a6a70" },
      },
      shapes: [
        {
          type: "line",
          x0: Math.min(...years),
          x1: Math.max(...years),
          y0: 100,
          y1: 100,
          line: { color: "rgba(22,35,39,0.28)", width: 1.5, dash: "dot" },
        },
      ],
    }
  );
}

function renderPersonContextChart(person) {
  const years = person.years.map((row) => row.fiscal_year);
  plot(
    "person-context-chart",
    [
      {
        x: years,
        y: person.years.map((row) => row.base_salary_real_fy2025),
        type: "scatter",
        mode: "lines+markers",
        name: "This record",
        line: { color: DASH_COLORS.accent, width: 4 },
        marker: { color: DASH_COLORS.accent, size: 8 },
      },
      {
        x: years,
        y: years.map((year) => getContextRow("department", year)?.median_base_salary_real_fy2025 ?? null),
        type: "scatter",
        mode: "lines",
        name: "Math median",
        line: { color: DASH_COLORS.deep, width: 3, dash: "dot" },
      },
      {
        x: years,
        y: years.map((year) => getContextRow("college", year)?.median_base_salary_real_fy2025 ?? null),
        type: "scatter",
        mode: "lines",
        name: "COSET median",
        line: { color: DASH_COLORS.deepSoft, width: 3 },
      },
      {
        x: years,
        y: years.map((year) => getContextRow("university", year)?.median_base_salary_real_fy2025 ?? null),
        type: "scatter",
        mode: "lines",
        name: "SHSU median",
        line: { color: DASH_COLORS.gold, width: 3, dash: "dash" },
      },
    ],
    layoutBase("Selected person versus internal medians", "Annual base salary, FY2025 dollars", 620)
  );
}

function renderPersonMonthlyChart(person) {
  const years = person.years.map((row) => row.fiscal_year);
  plot(
    "person-monthly-chart",
    [
      {
        x: years,
        y: person.years.map((row) => row.monthly_base_estimate),
        type: "scatter",
        mode: "lines+markers",
        name: "This record",
        line: { color: DASH_COLORS.accent, width: 4 },
        marker: { color: DASH_COLORS.accent, size: 8 },
      },
      {
        x: years,
        y: years.map((year) => getContextRow("department", year)?.median_monthly_base ?? null),
        type: "scatter",
        mode: "lines",
        name: "Math median",
        line: { color: DASH_COLORS.deep, width: 3, dash: "dot" },
      },
      {
        x: years,
        y: years.map((year) => getContextRow("college", year)?.median_monthly_base ?? null),
        type: "scatter",
        mode: "lines",
        name: "COSET median",
        line: { color: DASH_COLORS.deepSoft, width: 3 },
      },
      {
        x: years,
        y: years.map((year) => getContextRow("university", year)?.median_monthly_base ?? null),
        type: "scatter",
        mode: "lines",
        name: "SHSU median",
        line: { color: DASH_COLORS.gold, width: 3, dash: "dash" },
      },
      {
        x: years,
        y: years.map((year) => dataset.peers.shsu.salary_by_year[String(year)] ?? null),
        type: "scatter",
        mode: "lines",
        name: "SHSU benchmark",
        line: { color: DASH_COLORS.slate, width: 3 },
      },
      {
        x: years,
        y: years.map((year) => dataset.peers.texas.median_by_year[String(year)] ?? null),
        type: "scatter",
        mode: "lines",
        name: "Texas peers",
        line: { color: DASH_COLORS.olive, width: 3, dash: "dot" },
      },
      {
        x: years,
        y: years.map((year) => dataset.peers.national.median_by_year[String(year)] ?? null),
        type: "scatter",
        mode: "lines",
        name: "National peers",
        line: { color: DASH_COLORS.deep, width: 2, dash: "longdash" },
      },
    ],
    layoutBase("Internal and external monthly benchmarks", "Monthly salary benchmark", 620)
  );
}

function renderPercentileChart(person) {
  const years = person.years.map((row) => row.fiscal_year);
  plot(
    "person-percentile-chart",
    [
      {
        x: years,
        y: person.years.map((row) => toPercentPoints(row.department_base_salary_percentile)),
        type: "scatter",
        mode: "lines+markers",
        name: "Math",
        line: { color: DASH_COLORS.accent, width: 3 },
        marker: { color: DASH_COLORS.accent, size: 7 },
      },
      {
        x: years,
        y: person.years.map((row) => toPercentPoints(row.college_base_salary_percentile)),
        type: "scatter",
        mode: "lines+markers",
        name: "COSET",
        line: { color: DASH_COLORS.deepSoft, width: 3 },
        marker: { color: DASH_COLORS.deepSoft, size: 7 },
      },
      {
        x: years,
        y: person.years.map((row) => toPercentPoints(row.university_base_salary_percentile)),
        type: "scatter",
        mode: "lines+markers",
        name: "SHSU",
        line: { color: DASH_COLORS.gold, width: 3 },
        marker: { color: DASH_COLORS.gold, size: 7 },
      },
    ],
    {
      ...layoutBase("Base-salary percentile by comparison group", "Percentile", 520),
      yaxis: {
        title: { text: "Percentile" },
        range: [0, 100],
        gridcolor: "rgba(22,35,39,0.08)",
        tickfont: { color: "#5a6a70" },
      },
    }
  );
}

function renderPersonDistributionChart(person) {
  const years = person.years.map((row) => row.fiscal_year);
  const departmentTraces = years.map((year) => ({
    y: dataset.records
      .filter((row) => row.fiscal_year === year)
      .map((row) => row.base_salary_real_fy2025)
      .filter((value) => value != null),
    x: dataset.records
      .filter((row) => row.fiscal_year === year)
      .map((row) => row.base_salary_real_fy2025)
      .filter((value) => value != null)
      .map(() => yearLabel(year)),
    type: "box",
    name: yearLabel(year),
    boxpoints: false,
    marker: { color: DASH_COLORS.accentSoft, opacity: 0.4 },
    line: { color: DASH_COLORS.deep },
    fillcolor: "rgba(71,104,116,0.18)",
    showlegend: false,
  }));
  const overlay = {
    x: years.map((year) => yearLabel(year)),
    y: person.years.map((row) => row.base_salary_real_fy2025),
    type: "scatter",
    mode: "markers+lines",
    name: "This record",
    marker: { color: DASH_COLORS.accent, size: 10, symbol: "diamond" },
    line: { color: DASH_COLORS.accent, width: 2 },
  };
  plot("person-distribution-chart", [...departmentTraces, overlay], layoutBase("Selected person inside the department distribution", "Annual base salary, FY2025 dollars", 620));
}

function renderPersonCompChart(person) {
  const years = person.years.map((row) => row.fiscal_year);
  const realExtra = person.years.map((row) => {
    if (row.total_comp_real_fy2025 == null || row.base_salary_real_fy2025 == null) {
      return null;
    }
    return +(row.total_comp_real_fy2025 - row.base_salary_real_fy2025).toFixed(2);
  });
  plot(
    "person-comp-chart",
    [
      {
        x: years,
        y: person.years.map((row) => row.base_salary_real_fy2025),
        type: "bar",
        name: "Base salary",
        marker: { color: DASH_COLORS.deep },
      },
      {
        x: years,
        y: realExtra,
        type: "bar",
        name: "Extra compensation",
        marker: { color: DASH_COLORS.accent },
      },
    ],
    {
      ...layoutBase("Base salary and additional compensation in FY2025 dollars", "Real compensation, FY2025 dollars", 520),
      barmode: "stack",
    }
  );
}

function renderZScoreChart(person) {
  const years = person.years.map((row) => yearLabel(row.fiscal_year));
  const groups = [
    ["Department", person.years.map((row) => row.department_base_salary_modified_z)],
    ["COSET", person.years.map((row) => row.college_base_salary_modified_z)],
    ["SHSU", person.years.map((row) => row.university_base_salary_modified_z)],
  ];
  plot(
    "person-zscore-chart",
    [
      {
        x: years,
        y: groups.map((entry) => entry[0]),
        z: groups.map((entry) => entry[1]),
        type: "heatmap",
        colorscale: [
          [0, "#214c53"],
          [0.5, "#f8f4ee"],
          [1, "#9b443d"],
        ],
        zmid: 0,
        colorbar: { title: "Modified z" },
      },
    ],
    {
      ...layoutBase("Modified z-scores for annual base salary", "Comparison group", 420),
      margin: { l: 90, r: 40, t: 64, b: 60 },
    }
  );
}

function renderPersonTable(person) {
  const firstReal = person.years.find((row) => row.base_salary_real_fy2025 != null)?.base_salary_real_fy2025;
  document.getElementById("person-table-body").innerHTML = person.years
    .slice()
    .reverse()
    .map(
      (row) => `
        <tr>
          <td>${yearLabel(row.fiscal_year)}</td>
          <td>${row.position_title}</td>
          <td>${money(row.base_salary)}</td>
          <td>${money(row.total_comp)}</td>
          <td>${row.base_salary_real_fy2025 != null ? money(row.base_salary_real_fy2025) : "Not computed"}</td>
          <td>${pct(row.department_base_salary_percentile)}</td>
          <td>${pct(row.college_base_salary_percentile)}</td>
          <td>${pct(row.university_base_salary_percentile)}</td>
          <td>${number(row.department_base_salary_modified_z, 2)}</td>
          <td>${number(row.college_base_salary_modified_z, 2)}</td>
          <td>${number(row.university_base_salary_modified_z, 2)}</td>
          <td>${firstReal && row.base_salary_real_fy2025 != null ? `${(((row.base_salary_real_fy2025 / firstReal) - 1) * 100).toFixed(1)}%` : "Not computed"}</td>
          <td>${money(row.monthly_base_estimate)}</td>
        </tr>
      `
    )
    .join("");
}

function bootPersonPage() {
  const person = findPersonFromQuery();
  connectPersonSearch(person);
  renderPersonHeader(person);
  renderPersonMetrics(person);
  renderPersonCaseSummary(person);
  renderPersonPurchasingPowerChart(person);
  renderPersonContextChart(person);
  renderPersonMonthlyChart(person);
  renderPercentileChart(person);
  renderPersonDistributionChart(person);
  renderPersonCompChart(person);
  renderZScoreChart(person);
  renderPersonTable(person);
  annotateFooter();
  markDashboardReady();
}

bootPersonPage();
