import { APP_VERSION } from './version.js';

export const LATEST_RELEASE_API_URL = 'https://api.github.com/repos/raymond-nassar/marvel-reading-tracker/releases/latest';
export const UPDATE_DOWNLOAD_URL = 'https://github.com/raymond-nassar/marvel-reading-tracker/releases/latest/download/marvel-reading-tracker-windows.zip';
export const UPDATE_RELEASE_NOTES_URL = 'https://github.com/raymond-nassar/marvel-reading-tracker/releases/latest';
export const UPDATE_CHECK_INTERVAL_MS = 24 * 60 * 60 * 1000;

export function normaliseReleaseVersion(value) {
  const version = String(value ?? '').trim().replace(/^v/i, '');
  return /^\d+(?:\.\d+)+$/.test(version) ? version : null;
}

export function compareVersions(left, right) {
  const a = normaliseReleaseVersion(left);
  const b = normaliseReleaseVersion(right);
  if (!a || !b) return null;
  const leftParts = a.split('.').map(Number);
  const rightParts = b.split('.').map(Number);
  const length = Math.max(leftParts.length, rightParts.length);
  for (let i = 0; i < length; i += 1) {
    const x = leftParts[i] ?? 0;
    const y = rightParts[i] ?? 0;
    if (x > y) return 1;
    if (x < y) return -1;
  }
  return 0;
}

export function isUpdateCheckDue(lastCheckedAt, now) {
  const last = Number(lastCheckedAt);
  const current = Number(now);
  if (!Number.isFinite(last) || last <= 0) return true;
  if (!Number.isFinite(current)) return false;
  if (last > current) return true;
  return current - last >= UPDATE_CHECK_INTERVAL_MS;
}

function emptyResult(status, checkedAt = 0, latestVersion = '') {
  return {
    status,
    available: false,
    localVersion: APP_VERSION,
    latestVersion,
    checkedAt,
    downloadUrl: null,
    releaseNotesUrl: UPDATE_RELEASE_NOTES_URL,
  };
}

function currentTime(now) {
  const value = Number(typeof now === 'function' ? now() : now);
  return Number.isFinite(value) ? value : Date.now();
}

export async function checkForUpdate({
  fetchImpl = globalThis.fetch,
  now = () => Date.now(),
  lastCheckedAt = 0,
  force = false,
} = {}) {
  const checkedAt = currentTime(now);
  if (!force && !isUpdateCheckDue(lastCheckedAt, checkedAt)) return emptyResult('not-due');
  if (typeof fetchImpl !== 'function') return emptyResult('failed', checkedAt);

  let response;
  try {
    response = await fetchImpl(LATEST_RELEASE_API_URL);
  } catch {
    return emptyResult('failed', checkedAt);
  }

  if (!response?.ok) return emptyResult('failed', checkedAt);

  let body;
  try {
    body = await response.json();
  } catch {
    return emptyResult('failed', checkedAt);
  }

  const latestVersion = normaliseReleaseVersion(body?.tag_name);
  if (!latestVersion) return emptyResult('failed', checkedAt);

  const order = compareVersions(latestVersion, APP_VERSION);
  if (order === null) return emptyResult('failed', checkedAt);
  if (order <= 0) return emptyResult('current', checkedAt, latestVersion);

  return {
    status: 'available',
    available: true,
    localVersion: APP_VERSION,
    latestVersion,
    checkedAt,
    downloadUrl: UPDATE_DOWNLOAD_URL,
    releaseNotesUrl: UPDATE_RELEASE_NOTES_URL,
  };
}
