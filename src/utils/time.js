/**
 * Calculates the next occurrence of the 17th of the month at 03:14:00 UTC.
 */
export function getNextScheduledRun(now = new Date()) {
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth();

  const thisMonthTarget = new Date(Date.UTC(year, month, 17, 3, 14, 0, 0));

  if (now.getTime() < thisMonthTarget.getTime()) {
    return thisMonthTarget;
  }

  // Otherwise next month's 17th
  return new Date(Date.UTC(year, month + 1, 17, 3, 14, 0, 0));
}

/**
 * Calculates countdown remaining until target date
 */
export function getTimeRemaining(targetDate) {
  const total = targetDate.getTime() - Date.now();
  if (total <= 0) {
    return { total: 0, days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  const seconds = Math.floor((total / 1000) % 60);
  const minutes = Math.floor((total / 1000 / 60) % 60);
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
  const days = Math.floor(total / (1000 * 60 * 60 * 24));

  return { total, days, hours, minutes, seconds };
}

/**
 * Formats seconds into human-readable delay: +Xm Ys
 */
export function formatSecondsToDelay(totalSeconds) {
  const isNeg = totalSeconds < 0;
  const abs = Math.abs(totalSeconds);
  const sign = isNeg ? '-' : '+';
  const hours = Math.floor(abs / 3600);
  const minutes = Math.floor((abs % 3600) / 60);
  const seconds = abs % 60;

  if (hours > 0) return `${sign}${hours}h ${minutes}m ${seconds}s`;
  if (minutes > 0) return `${sign}${minutes}m ${seconds}s`;
  return `${sign}${seconds}s`;
}

/**
 * Format ISO string to UTC readable format
 */
export function formatUTC(isoString) {
  if (!isoString) return '—';
  const d = new Date(isoString);
  return d.toUTCString().replace('GMT', 'UTC');
}

/**
 * Format ISO to local readable date
 */
export function formatLocal(isoString) {
  if (!isoString) return '—';
  const d = new Date(isoString);
  return d.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}
