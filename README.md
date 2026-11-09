# 💓 heartbeat (v0.1.0)

> GitHub Actions Cron Jitter & Runner Queue Delay Observatory

On the **17th of every month at 3:14 AM UTC**, GitHub Actions triggers a cron workflow that measures and records how long the execution was delayed past the scheduled minute.

Additionally, manual triggers (`workflow_dispatch`) can be triggered anytime — and their execution times are recorded and tracked **separately** from the monthly cron jitter benchmarks.

---

## ⚡ Features

- **Automated Monthly Cron**: Runs on the 17th of each month at `03:14:00 UTC` (`14 3 17 * *`).
- **Jitter & Latency Calculation**: Calculates exact delay `actual_time - scheduled_time` in milliseconds, seconds, and formatted units (`+Xm Ys`).
- **Separated Datasets**:
  - `data/cron_history.json`: Scheduled monthly cron executions and delay benchmarks.
  - `data/manual_history.json`: Ad-hoc manual workflow dispatches.
- **Vite Visualizer Dashboard**:
  - 🌓 **Light & Dark mode** with automatic persistence.
  - 📊 **Interactive SVG Delay Chart**: Switch between bar chart and trend line; toggle units between minutes and seconds.
  - ⏳ **Live Countdown**: Real-time ticker counting down to the next 17th @ 03:14 UTC heartbeat.
  - 📈 **Key Metrics**: Latest delay, average delay, min/max variance, and run counts.
  - 🔍 **Searchable History Table**: Detailed run logs with JSON export capability.
  - 🏷️ **v0.1.0 Release Badge**: Prominently indicated in the UI.

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
│   ├── cron_history.json          # Scheduled cron execution logs & delay data
│   └── manual_history.json        # Separately tracked manual dispatch logs
├── public/
│   └── data/                      # Publicly accessible static JSON datasets
├── scripts/
│   └── record.js                  # Execution time & delay recording script
├── src/
│   ├── components/                # React UI components (Chart, Stats, Countdown, etc.)
│   ├── data/                      # Bundled history fallback
│   ├── utils/                     # Time calculations & formatting helpers
│   ├── App.jsx                    # Main application
│   └── main.jsx                   # React entrypoint
├── index.html                     # HTML root with dark mode script
├── package.json                   # Version 0.1.0 & build scripts
└── vite.config.js                 # Vite configuration
```

---

## 📄 License

Apache-2.0 License.
