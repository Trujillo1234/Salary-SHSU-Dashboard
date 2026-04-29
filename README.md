# SHSU Math Salary Dashboard

This repository contains the public GitHub Pages build for the SHSU Mathematics and Statistics salary dashboard.

Open the dashboard here:

https://trujillo1234.github.io/Salary-SHSU-Dashboard/

## What Is Included

- `index.html`: department overview for salary, purchasing power, compensation, distribution, rank mix, and benchmark trends.
- `person.html`: individual salary-record page. It opens with Timothy Trujillo's record by default and includes a search box for other department records.
- `data/analysis.js`: generated dashboard dataset used by the site.
- `styles.css` and JavaScript files for layout, search, charts, and print behavior.

## What The Dashboard Covers

- Public SHSU salary records for Mathematics and Statistics.
- Posted additional compensation where SHSU released separate remuneration files.
- Inflation-adjusted salary values in FY2025 dollars using CPI-U.
- Department, COSET, and full-SHSU internal comparisons.
- Texas and national public-university benchmark context using institution-level College Scorecard/IPEDS monthly faculty salary data.
- Percentiles, modified z-scores, and box-plot outlier markers for descriptive context.

## Important Notes

- The dashboard is descriptive and uses public records.
- FY2026 salary records are included, but the latest separate additional-compensation file currently available in the source data is FY2025.
- Outlier markers use the standard 1.5-IQR box-plot rule within each fiscal year. They do not by themselves indicate an error or an all-time maximum.
- External peer benchmarks are institution-wide faculty salary measures, not math-department-specific measures.

## How The Site Is Hosted

This is a static site. GitHub Pages serves the HTML, CSS, JavaScript, and generated data files directly from this repository. No server-side code is required to view the dashboard.

## Printing

Use the browser print command to save the dashboard pages as PDFs. The print stylesheet hides interactive controls and resizes figures/tables for cleaner PDF output.

## Public Data Sources

- SHSU public salary and remuneration files: https://profiles.shsu.edu/sms049/Images/Salary.html
- BLS Consumer Price Index: https://www.bls.gov/cpi/
- College Scorecard data: https://collegescorecard.ed.gov/data/
