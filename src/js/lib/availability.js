// Marvel Unlimited availability.
//
// `unlimitedDate` is NOT proof of entitlement:
//   * absence of a date is not evidence of unavailability;
//   * the field is sometimes just the on-sale date (issue 6482 reports 1963-03-01, but
//     Marvel Unlimited launched in 2007);
//   * comparing a UTC midnight instant against `Date.now()` badges an issue a day early
//     for anyone west of UTC.
//
// So we never claim an issue *is* available. We report one of five explicit
// states. The design started with four, carrying a single `user-override`; that
// was later split into `override-available` and `override-unavailable` so an
// explicit "no, I checked, it is not there" is distinguishable from an explicit
// yes. Keep all five distinct: collapsing them re-introduces the false
// certainty this module exists to avoid.

export const STATE = {
  UNKNOWN: 'unknown',
  SCHEDULED: 'scheduled',
  EXPECTED: 'expected',
  OVERRIDE_AVAILABLE: 'override-available',
  OVERRIDE_UNAVAILABLE: 'override-unavailable',
};

export const LABELS = {
  [STATE.UNKNOWN]: 'Availability unknown',
  [STATE.SCHEDULED]: 'Scheduled',
  [STATE.EXPECTED]: 'Expected in Unlimited',
  [STATE.OVERRIDE_AVAILABLE]: 'You marked available',
  [STATE.OVERRIDE_UNAVAILABLE]: 'You marked unavailable',
};

export const SHORT = {
  [STATE.UNKNOWN]: '?',
  [STATE.SCHEDULED]: 'soon',
  [STATE.EXPECTED]: 'MU',
  [STATE.OVERRIDE_AVAILABLE]: 'MU\u2713',
  [STATE.OVERRIDE_UNAVAILABLE]: 'no',
};

// Local calendar day as YYYY-MM-DD, so comparisons happen in the user's own timezone.
export function localDayString(d = new Date()) {
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

// Extracts the calendar date portion of an API timestamp without shifting timezones.
export function calendarDate(value) {
  if (!value) return null;
  const s = String(value);
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s);
  if (m) return `${m[1]}-${m[2]}-${m[3]}`;
  const t = Date.parse(s);
  return Number.isFinite(t) ? localDayString(new Date(t)) : null;
}

export function availability(issue, { override, today = localDayString() } = {}) {
  if (override === 'available') return { state: STATE.OVERRIDE_AVAILABLE, date: calendarDate(issue?.mu) };
  if (override === 'unavailable') return { state: STATE.OVERRIDE_UNAVAILABLE, date: calendarDate(issue?.mu) };

  const date = calendarDate(issue?.mu);
  if (!date) return { state: STATE.UNKNOWN, date: null };
  if (date > today) return { state: STATE.SCHEDULED, date };
  return { state: STATE.EXPECTED, date };
}

export function describe(issue, opts) {
  const a = availability(issue, opts);
  if (a.state === STATE.SCHEDULED) return `${LABELS[a.state]} ${a.date}`;
  return LABELS[a.state];
}
