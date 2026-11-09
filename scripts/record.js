import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// File paths
const DATA_DIR = path.join(rootDir, 'data');
const PUBLIC_DATA_DIR = path.join(rootDir, 'public', 'data');
const SRC_DATA_DIR = path.join(rootDir, 'src', 'data');

const CRON_FILE = path.join(DATA_DIR, 'cron_history.json');
const MANUAL_FILE = path.join(DATA_DIR, 'manual_history.json');

// Ensure directories exist
for (const dir of [DATA_DIR, PUBLIC_DATA_DIR, SRC_DATA_DIR]) {
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

  // Target for current month
  const currentMonthTarget = new Date(Date.UTC(year, month, 17, 3, 14, 0, 0));
  // Target for previous month
  const prevMonthTarget = new Date(Date.UTC(year, month - 1, 17, 3, 14, 0, 0));

  // If we are past (or within 5 minutes before) the 17th 03:14 of current month
  const diffCurrent = now.getTime() - currentMonthTarget.getTime();
  if (diffCurrent >= -300000) {
    return currentMonthTarget;
  }

  // Otherwise, the last scheduled slot was previous month's 17th
  return prevMonthTarget;
}

// Parse CLI args
const args = process.argv.slice(2);
let triggerType = 'cron'; // default or detected from GITHUB_EVENT_NAME
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

  // Replace or append
  const existingIdx = cronHistory.findIndex((item) => item.scheduledTime === scheduledIso);
  if (existingIdx >= 0) {
    cronHistory[existingIdx] = newEntry;
  } else {
    cronHistory.push(newEntry);
  }

  // Sort by scheduledTime ascending
  cronHistory.sort((a, b) => new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime());

  // Save to file
  fs.writeFileSync(CRON_FILE, JSON.stringify(cronHistory, null, 2), 'utf8');
  console.log(`[Heartbeat] Saved cron execution. Delay: ${delayFormatted} (${delaySeconds}s)`);
} else {
  // Manual trigger
  const manualHistory = readJson(MANUAL_FILE, []);
  const newEntry = {
    id: `manual-${Date.now()}`,
    type: 'manual',
    runId,
    runNumber,
    actualTime: nowIso,
    actor,
    commitSha,
    note: note || (process.env.WORKFLOW_NOTE || 'Manual trigger dispatch'),
    status: 'success',
  };

  manualHistory.push(newEntry);
  // Sort descending by actualTime (newest first)
  manualHistory.sort((a, b) => new Date(b.actualTime).getTime() - new Date(a.actualTime).getTime());

  fs.writeFileSync(MANUAL_FILE, JSON.stringify(manualHistory, null, 2), 'utf8');
  console.log(`[Heartbeat] Saved manual execution at ${nowIso}`);
}

// Synchronize all data copies so Vite app and build can access it
const cronData = readJson(CRON_FILE, []);
const manualData = readJson(MANUAL_FILE, []);

const bundle = {
  lastUpdated: nowIso,
  cron: cronData,
  manual: manualData,
};

fs.writeFileSync(path.join(PUBLIC_DATA_DIR, 'cron_history.json'), JSON.stringify(cronData, null, 2), 'utf8');
fs.writeFileSync(path.join(PUBLIC_DATA_DIR, 'manual_history.json'), JSON.stringify(manualData, null, 2), 'utf8');
fs.writeFileSync(path.join(PUBLIC_DATA_DIR, 'executions.json'), JSON.stringify(bundle, null, 2), 'utf8');

fs.writeFileSync(path.join(SRC_DATA_DIR, 'cron_history.json'), JSON.stringify(cronData, null, 2), 'utf8');
fs.writeFileSync(path.join(SRC_DATA_DIR, 'manual_history.json'), JSON.stringify(manualData, null, 2), 'utf8');
fs.writeFileSync(path.join(SRC_DATA_DIR, 'executions.json'), JSON.stringify(bundle, null, 2), 'utf8');

console.log('[Heartbeat] Successfully updated all data files.');
