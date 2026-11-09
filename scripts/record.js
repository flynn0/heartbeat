import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Read version dynamically from package.json
const pkg = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8'));
const VERSION = pkg.version;

// File paths
const DATA_DIR = path.join(rootDir, 'data');
const DATA_API_DIR = path.join(rootDir, 'data', 'api');
const PUBLIC_DATA_DIR = path.join(rootDir, 'public', 'data');
const PUBLIC_API_DIR = path.join(rootDir, 'public', 'api');
const SRC_DATA_DIR = path.join(rootDir, 'src', 'data');
const SRC_API_DIR = path.join(rootDir, 'src', 'data', 'api');

const CRON_FILE = path.join(DATA_DIR, 'cron_history.json');
const MANUAL_FILE = path.join(DATA_DIR, 'manual_history.json');

// Ensure directories exist
for (const dir of [
  DATA_DIR,
  DATA_API_DIR,
  PUBLIC_DATA_DIR,
  PUBLIC_API_DIR,
  SRC_DATA_DIR,
  SRC_API_DIR,
]) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Helper to read JSON or fallback
function readJson(file, fallback = []) {
  if (fs.existsSync(file)) {
    try {
      return JSON.parse(fs.readFileSync(file, 'utf8'));
    } catch (err) {
      console.warn(`Failed to parse ${file}, using fallback`, err);
    }
  }
  return fallback;
}

// Helper to format ms to human-readable delay
export function formatDelay(ms) {
  const isNegative = ms < 0;
  const absSeconds = Math.abs(Math.round(ms / 1000));
  const sign = isNegative ? '-' : '+';

  const hours = Math.floor(absSeconds / 3600);
  const minutes = Math.floor((absSeconds % 3600) / 60);
  const seconds = absSeconds % 60;

  if (hours > 0) {
    return `${sign}${hours}h ${minutes}m ${seconds}s`;
  }
  if (minutes > 0) {
    return `${sign}${minutes}m ${seconds}s`;
  }
  return `${sign}${seconds}s`;
}

// Find expected scheduled time for cron (17th of the month at 03:14:00 UTC)
export function getClosestScheduledTime(now = new Date()) {
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth();

  const currentMonthTarget = new Date(Date.UTC(year, month, 17, 3, 14, 0, 0));
  const prevMonthTarget = new Date(Date.UTC(year, month - 1, 17, 3, 14, 0, 0));

  const diffCurrent = now.getTime() - currentMonthTarget.getTime();
  if (diffCurrent >= -300000) {
    return currentMonthTarget;
  }
  return prevMonthTarget;
}

// Parse CLI args
const args = process.argv.slice(2);
let triggerType = 'cron';
let note = '';

for (const arg of args) {
  if (arg.startsWith('--trigger=')) {
    triggerType = arg.split('=')[1].toLowerCase();
  } else if (arg.startsWith('--note=')) {
    note = arg.split('=')[1];
  }
}

// GitHub Actions environment detection
const ghEvent = process.env.GITHUB_EVENT_NAME;
if (ghEvent) {
  if (ghEvent === 'workflow_dispatch') {
    triggerType = 'manual';
  } else if (ghEvent === 'schedule') {
    triggerType = 'cron';
  }
}

const now = new Date();
const nowIso = now.toISOString();
const runId = process.env.GITHUB_RUN_ID || `local-${Date.now()}`;
const runNumber = Number.parseInt(process.env.GITHUB_RUN_NUMBER || '1', 10);
const commitSha = process.env.GITHUB_SHA || 'local-dev';
const actor = process.env.GITHUB_ACTOR || 'system';

console.log(`[Heartbeat] Recording execution. Trigger: ${triggerType}, Time: ${nowIso}`);

if (triggerType === 'cron') {
  const cronHistory = readJson(CRON_FILE, []);
  const scheduledDate = getClosestScheduledTime(now);
  const scheduledIso = scheduledDate.toISOString();
  const delayMs = now.getTime() - scheduledDate.getTime();
  const delaySeconds = Math.round(delayMs / 1000);
  const delayFormatted = formatDelay(delayMs);

  const newEntry = {
    id: `cron-${scheduledIso.slice(0, 10)}`,
    type: 'cron',
    runId,
    runNumber,
    scheduledTime: scheduledIso,
    actualTime: nowIso,
    delayMs,
    delaySeconds,
    delayFormatted,
    actor,
    commitSha,
    status: 'success',
  };

  const existingIdx = cronHistory.findIndex((item) => item.scheduledTime === scheduledIso);
  if (existingIdx >= 0) {
    cronHistory[existingIdx] = newEntry;
  } else {
    cronHistory.push(newEntry);
  }

  cronHistory.sort((a, b) => new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime());
  fs.writeFileSync(CRON_FILE, JSON.stringify(cronHistory, null, 2), 'utf8');
  console.log(`[Heartbeat] Saved cron execution. Delay: ${delayFormatted} (${delaySeconds}s)`);
} else if (triggerType === 'manual') {
  // Manual trigger
  const manualHistory = readJson(MANUAL_FILE, []);
  const dispatchIso = process.env.GITHUB_RUN_STARTED_AT || new Date(now.getTime() - 4200).toISOString();
  const dispatchTime = new Date(dispatchIso);
  const manualDelayMs = Math.max(0, now.getTime() - dispatchTime.getTime());
  const manualDelaySeconds = Math.round(manualDelayMs / 1000);
  const manualDelayFormatted = formatDelay(manualDelayMs);

  const newEntry = {
    id: `manual-${Date.now()}`,
    type: 'manual',
    runId,
    runNumber,
    dispatchTime: dispatchIso,
    actualTime: nowIso,
    delayMs: manualDelayMs,
    delaySeconds: manualDelaySeconds,
    delayFormatted: manualDelayFormatted,
    actor,
    commitSha,
    note: note || (process.env.WORKFLOW_NOTE || 'Manual trigger dispatch'),
    status: 'success',
  };

  manualHistory.unshift(newEntry);
  manualHistory.sort((a, b) => new Date(b.actualTime).getTime() - new Date(a.actualTime).getTime());
  fs.writeFileSync(MANUAL_FILE, JSON.stringify(manualHistory, null, 2), 'utf8');
  console.log(`[Heartbeat] Saved manual execution at ${nowIso} (delay: ${manualDelayFormatted})`);
} else if (triggerType === 'sync') {
  console.log('[Heartbeat] Sync mode: refreshing bundle and API endpoints without adding entries.');
}

// Synchronize all data copies
const cronData = readJson(CRON_FILE, []);
const manualData = readJson(MANUAL_FILE, []);

const delays = cronData.map((d) => d.delaySeconds);
const stats = {
  totalRuns: cronData.length + manualData.length,
  cronRuns: cronData.length,
  manualRuns: manualData.length,
  latestCronDelaySeconds: cronData.length ? cronData[cronData.length - 1].delaySeconds : 0,
  averageCronDelaySeconds: delays.length ? Math.round(delays.reduce((a, b) => a + b, 0) / delays.length) : 0,
  minCronDelaySeconds: delays.length ? Math.min(...delays) : 0,
  maxCronDelaySeconds: delays.length ? Math.max(...delays) : 0,
};

const latestDelayPayload = cronData.length ? cronData[cronData.length - 1] : null;
const latestManualPayload = manualData.length ? manualData[0] : null;

const historyPayload = {
  version: VERSION,
  lastUpdated: nowIso,
  statistics: stats,
  cronHistory: cronData,
  manualHistory: manualData,
};

const summaryPayload = {
  version: VERSION,
  lastUpdated: nowIso,
  schedule: {
    cron: '14 3 17 * *',
    description: 'Every month on the 17th at 03:14:00 UTC',
  },
  latestCronDelay: latestDelayPayload,
  latestManualTrigger: latestManualPayload,
  statistics: stats,
};

const bundle = {
  lastUpdated: nowIso,
  cron: cronData,
  manual: manualData,
  statistics: stats,
  api: {
    latestDelay: latestDelayPayload,
    latestManual: latestManualPayload,
  },
};

// Write history bundle
for (const dir of [PUBLIC_DATA_DIR, SRC_DATA_DIR]) {
  fs.writeFileSync(path.join(dir, 'cron_history.json'), JSON.stringify(cronData, null, 2), 'utf8');
  fs.writeFileSync(path.join(dir, 'manual_history.json'), JSON.stringify(manualData, null, 2), 'utf8');
  fs.writeFileSync(path.join(dir, 'executions.json'), JSON.stringify(bundle, null, 2), 'utf8');
}

// Write REST API endpoints
for (const dir of [DATA_API_DIR, PUBLIC_API_DIR, SRC_API_DIR]) {
  fs.writeFileSync(path.join(dir, 'latest-delay.json'), JSON.stringify(latestDelayPayload, null, 2), 'utf8');
  fs.writeFileSync(path.join(dir, 'latest-manual.json'), JSON.stringify(latestManualPayload, null, 2), 'utf8');
  fs.writeFileSync(path.join(dir, 'history.json'), JSON.stringify(historyPayload, null, 2), 'utf8');
  fs.writeFileSync(path.join(dir, 'summary.json'), JSON.stringify(summaryPayload, null, 2), 'utf8');
}

console.log('[Heartbeat] Successfully updated all data and API endpoints.');
