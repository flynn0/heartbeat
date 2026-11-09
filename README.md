# 💓 heartbeat (v0.1.1)

> GitHub Actions Cron Jitter & Runner Queue Delay Observatory with REST API

On the **17th of every month at 3:14 AM UTC**, GitHub Actions triggers a cron workflow that measures and records how long the execution was delayed past the scheduled minute.

Additionally, manual triggers (`workflow_dispatch`) can be triggered anytime — and their execution times and delays are recorded and tracked **separately** from the monthly cron jitter benchmarks.

---

## ⚡ Features

- **Automated Monthly Cron**: Runs on the 17th of each month at `03:14:00 UTC` (`14 3 17 * *`).
- **Jitter & Latency Calculation**: Calculates exact delay `actual_time - scheduled_time` in milliseconds, seconds, and formatted units (`+Xm Ys`).
- **Separated Datasets**:
  - `data/cron_history.json`: Scheduled monthly cron executions and delay benchmarks.
  - `data/manual_history.json`: Ad-hoc manual workflow dispatches with startup queue latency.
- **🌐 REST API**:
  - `GET /api/latest-delay.json`: Latest cron execution delay measurement.
  - `GET /api/latest-manual.json`: Latest manual trigger and delay time.
  - `GET /api/history.json`: Complete execution history and latency measurements.
  - `GET /api/summary.json`: Unified status overview and schedule metrics.
- **📄 Machine-Readable Description**:
  - Full **OpenAPI 3.1.0** specification in [`openapi.json`](file:///home/mk/AI-Agents/antigravity/heartbeat/openapi.json) and [`openapi.yaml`](file:///home/mk/AI-Agents/antigravity/heartbeat/openapi.yaml).
- **Vite Visualizer Dashboard**:
  - 🌓 **Light & Dark mode** with automatic persistence.
  - 📊 **Interactive SVG Delay Chart**: Switch between bar chart and trend line; toggle units between minutes and seconds.
  - ⏳ **Live Countdown**: Real-time ticker counting down to the next 17th @ 03:14 UTC heartbeat.
  - 📈 **Key Metrics**: Latest delay, average delay, min/max variance, and run counts.
  - 🔍 **Searchable History Table**: Detailed run logs with JSON export capability.
  - 💻 **Interactive API Explorer**: Test endpoints and copy cURL snippets directly from the browser.
  - 🏷️ **v0.1.1 Release Badge**: Prominently indicated across the UI.

---

## 🌐 Public REST API

All API endpoints are statically generated, CORS-ready, and available over HTTP/HTTPS:

| Endpoint | Method | Description |
| :--- | :---: | :--- |
| `/api/latest-delay.json` | `GET` | Retrieve the latest cron execution and delay time |
| `/api/latest-manual.json` | `GET` | Retrieve the latest manual trigger and delay time |
| `/api/history.json` | `GET` | Retrieve whole execution history & aggregate metrics |
| `/api/summary.json` | `GET` | Retrieve consolidated overview and schedule details |
| `/openapi.json` | `GET` | Machine-readable OpenAPI 3.1 specification (JSON) |
| `/openapi.yaml` | `GET` | Machine-readable OpenAPI 3.1 specification (YAML) |

### Example cURL Queries

```bash
# Retrieve latest cron delay time
curl -s "https://flynn0.github.io/heartbeat/api/latest-delay.json" | jq .

# Retrieve latest manual trigger and delay
curl -s "https://flynn0.github.io/heartbeat/api/latest-manual.json" | jq .

# Retrieve full execution history and measurements
curl -s "https://flynn0.github.io/heartbeat/api/history.json" | jq .

# Inspect OpenAPI 3.1 machine-readable specification
curl -s "https://flynn0.github.io/heartbeat/openapi.json" | jq .info
```

---

## 📅 Schedule Configuration

The GitHub Actions workflow triggers on:

```yaml
on:
  schedule:
    # 17th of every month at 3:14 AM UTC
    - cron: '14 3 17 * *'
  workflow_dispatch:
    inputs:
      note:
        description: 'Optional note for manual trigger'
        required: false
        default: 'Manual health check'
```

### Why 3:14 AM on the 17th?
- **Minute :14**: Most scheduled GitHub Actions jobs trigger at the top of the hour (`:00`) or half hour (`:30`), creating massive queue spikes. Scheduling at minute `14` (and hour `3`, echoing $\pi \approx 3.14$) minimizes shared runner queue congestion while providing consistent monthly health data.

---

## 🛠️ Local Development

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Vite Dev Server
```bash
npm run dev
```

### 3. Record an Execution Locally
```bash
# Record cron execution
npm run record -- --trigger=cron

# Record manual execution with custom note
npm run record -- --trigger=manual --note="Local test run"
```

### 4. Build Production Static Site
```bash
npm run build
```

---

## 📂 Repository Structure

```
.
├── .github/
│   └── workflows/
│       └── heartbeat.yml          # GitHub Actions workflow (cron + dispatch)
├── data/
│   ├── api/                       # Generated REST API endpoints
│   ├── cron_history.json          # Scheduled cron execution logs & delay data
│   └── manual_history.json        # Separately tracked manual dispatch logs
├── public/
│   ├── api/                       # Publicly accessible REST API endpoints
│   ├── data/                      # Publicly accessible static JSON datasets
│   ├── openapi.json               # Machine-readable OpenAPI 3.1 specification (JSON)
│   └── openapi.yaml               # Machine-readable OpenAPI 3.1 specification (YAML)
├── openapi.json                   # Machine-readable OpenAPI 3.1 at repo root
├── openapi.yaml                   # Machine-readable OpenAPI 3.1 at repo root
├── scripts/
│   └── record.js                  # Execution time & delay recording + API generator
├── src/
│   ├── components/                # React UI components (Chart, Stats, ApiExplorer, etc.)
│   ├── data/                      # Bundled history & API fallbacks
│   ├── utils/                     # Time calculations & formatting helpers
│   ├── App.jsx                    # Main application
│   └── main.jsx                   # React entrypoint
├── index.html                     # HTML root with dark mode script
├── package.json                   # Version 0.1.1 & build scripts
└── vite.config.js                 # Vite configuration
```

---

## 📄 License

Apache-2.0 License.
