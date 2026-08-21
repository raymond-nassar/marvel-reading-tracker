const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export function seriesKey(row) {
  return row?.seriesId != null ? row.seriesId : `unknown:${row?.seriesName ?? 'Unsorted'}`;
}

export function readSummary(rows) {
  const list = Array.isArray(rows) ? rows : [];
  const series = new Set();
  let orphans = 0;
  for (const row of list) {
    series.add(seriesKey(row));
    if (Array.isArray(row?.lists) && row.lists.length === 0) orphans += 1;
  }
  return { issues: list.length, series: series.size, orphans };
}

export function manualSummary(rows) {
  const list = Array.isArray(rows) ? rows : [];
  let read = 0;
  let orphans = 0;
  for (const row of list) {
    if (row?.read === true) read += 1;
    if (Array.isArray(row?.lists) && row.lists.length === 0) orphans += 1;
  }
  return { issues: list.length, read, orphans };
}

export function dayOrdinal(ms) {
  const d = new Date(ms);
  return Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86400000;
}

function readGroupInfo(now, readAt) {
  if (!Number.isFinite(readAt)) return { key: 'nodate', label: 'No date' };
  const nowDay = dayOrdinal(now);
  const readDay = dayOrdinal(readAt);
  const diff = nowDay - readDay;
  if (diff <= 0) return { key: 'today', label: 'Today' };
  if (diff === 1) return { key: 'yesterday', label: 'Yesterday' };
  if (diff <= 6) return { key: 'past-week', label: 'In the past week' };
  const nowDate = new Date(now);
  const readDate = new Date(readAt);
  if (nowDate.getFullYear() === readDate.getFullYear() && nowDate.getMonth() === readDate.getMonth()) {
    return { key: 'earlier-this-month', label: 'Earlier this month' };
  }
  const year = readDate.getFullYear();
  const month = String(readDate.getMonth() + 1).padStart(2, '0');
  return { key: `${year}-${month}`, label: `${MONTHS[readDate.getMonth()]} ${year}` };
}

export function readGroups(rows, now) {
  const list = Array.isArray(rows) ? rows : [];
  const groups = new Map();
  for (const row of list) {
    const info = readGroupInfo(now, row?.readAt);
    const group = groups.get(info.key);
    if (group) group.rows.push(row);
    else groups.set(info.key, { ...info, rows: [row] });
  }
  return [...groups.values()];
}

export function titleGroups(rows) {
  const list = Array.isArray(rows) ? rows : [];
  const groups = new Map();
  for (const row of list) {
    const title = String(row?.title ?? '');
    const first = title.charAt(0).toUpperCase();
    const key = /^[A-Z]$/.test(first) ? first : '#';
    const group = groups.get(key);
    if (group) group.rows.push(row);
    else groups.set(key, { key, label: key, rows: [row] });
  }
  return [...groups.values()];
}
