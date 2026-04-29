# SHSU Math Salary Memo

This project builds a local, print-friendly salary research site for Sam Houston State University's Mathematics and Statistics salary and compensation data.

## What it includes

- SHSU math department salary history from the public salary files posted at `https://profiles.shsu.edu/sms049/Images/Salary.html`
- Additional compensation where SHSU has posted separate remuneration files
- Inflation-adjusted views using BLS CPI-U
- Texas and national peer benchmarks using the official College Scorecard/IPEDS monthly faculty-salary measure
- A department overview for salary, purchasing-power, compensation, and benchmark trends
- An individual-record page for name-by-name analysis; `person.html` opens with Timothy Trujillo's record by default
- A static printable salary memo in `pay-report.html`
- A static printable anomalies memo in `anomalies-report.html`

## How to rebuild the data

Run:

```powershell
& "C:\Users\dutim\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe" .\scripts\build_data.py
```

That writes:

- `data/analysis.json`
- `data/analysis.js`
- `data/shsu_math_records.csv`
- `data/peer_benchmarks.csv`

## How to open the dashboard

Open [index.html](./index.html) for the department overview.

Open [person.html](./person.html) for the person-specific record page. By default, it opens Timothy Trujillo's record; use the search box to open another employee record.

Open [pay-report.html](./pay-report.html) for the static salary memo and [anomalies-report.html](./anomalies-report.html) for the static anomalies memo.

The page loads the built dataset from `data/analysis.js`, so it does not require a local web server.

Use the browser's print command to save any page as a PDF. The print stylesheet hides interactive controls, resizes charts, and fits wide tables to the printed page.
