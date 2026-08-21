import { readFile } from 'node:fs/promises';

export const GUIDE_TYPES = Object.freeze([
  'event',
  'era',
  'sub-guide',
  'bridge',
  'fast-track',
  'commerce',
]);

export const DISPOSITIONS = Object.freeze([
  'new-order',
  'reuse-existing',
  'grouped-variant',
  'path-source',
  'deferred',
  'excluded',
]);

export const DELIVERY_STATUSES = Object.freeze([
  'pending',
  'ready',
  'shipped',
  'blocked',
  'not-applicable',
]);

export const BASELINE_COUNT = 86;

function assertField(name, value, predicate, message) {
  if (!predicate(value)) {
    throw new Error(`${name}: ${message}`);
  }
}

export function validateBatchNoDuplicates(batchRecords = [], existingRecords = [], peerRecords = []) {
  const seenIds = new Set();
  const seenUrls = new Set();
  const seenIssueSequences = new Set();
  const seenCatalogIds = new Set();

  const keysFor = (record) => {
    if (!record || typeof record !== 'object') {
      return null;
    }
    const recordId = record.id != null ? String(record.id) : null;
    const sourceUrl = record.url != null ? String(record.url) : null;
    const selectedIssueIds = Array.isArray(record.selectedIssueIds)
      ? record.selectedIssueIds.map((entry) => String(entry))
      : (Array.isArray(record.issueIds)
        ? record.issueIds.map((entry) => String(entry))
        : (record.selectedIssueId != null ? [String(record.selectedIssueId)] : []));
    const catalogIds = Array.isArray(record.catalogIds)
      ? record.catalogIds.map((entry) => String(entry))
      : (record.catalogId != null ? [String(record.catalogId)] : []);
    return {
      recordId,
      sourceUrl,
      sequenceKey: selectedIssueIds.length > 0 ? selectedIssueIds.join('|') : null,
      catalogIds,
    };
  };

  for (const record of existingRecords) {
    const keys = keysFor(record);
    if (!keys) continue;
    if (keys.recordId) seenIds.add(keys.recordId);
    if (keys.sourceUrl) seenUrls.add(keys.sourceUrl);
    if (keys.sequenceKey) seenIssueSequences.add(keys.sequenceKey);
    for (const catalogId of keys.catalogIds) seenCatalogIds.add(catalogId);
  }

  for (const record of [...batchRecords, ...peerRecords]) {
    const keys = keysFor(record);
    if (!keys) continue;
    if (keys.recordId && seenIds.has(keys.recordId)) {
      throw new Error(`Duplicate batch id: ${keys.recordId}`);
    }
    if (keys.recordId) seenIds.add(keys.recordId);
    if (keys.sourceUrl && seenUrls.has(keys.sourceUrl)) {
      throw new Error(`Duplicate source URL: ${keys.sourceUrl}`);
    }
    if (keys.sourceUrl) seenUrls.add(keys.sourceUrl);
    if (keys.sequenceKey && seenIssueSequences.has(keys.sequenceKey)) {
      throw new Error(`Duplicate selected issue sequence: ${keys.sequenceKey}`);
    }
    if (keys.sequenceKey) seenIssueSequences.add(keys.sequenceKey);
    for (const catalogId of keys.catalogIds) {
      if (seenCatalogIds.has(catalogId)) {
        throw new Error(`Duplicate catalog id: ${catalogId}`);
      }
      seenCatalogIds.add(catalogId);
    }
  }

  return true;
}

export function validateInventory(records) {
  if (!Array.isArray(records)) {
    throw new Error('The inventory must be an array');
  }
  if (records.length !== BASELINE_COUNT) {
    throw new Error(`The baseline inventory must contain ${BASELINE_COUNT} records, found ${records.length}`);
  }

  const counts = {
    event: 0,
    era: 0,
    'sub-guide': 0,
    bridge: 0,
    'fast-track': 0,
    commerce: 0,
  };

  const seenIds = new Set();
  const seenUrls = new Set();
  const positions = [];

  for (const [index, record] of records.entries()) {
    const position = index + 1;
    assertField(`Record ${position}`, record && typeof record === 'object', Boolean, 'must be an object');
    assertField(`Record ${position} position`, record.position, (value) => Number.isInteger(value) && value === position, 'must be the next integer position');
    positions.push(record.position);

    assertField(`Record ${position} id`, record.id, (value) => typeof value === 'string' && value.trim().length > 0, 'must be a non-empty string');
    if (seenIds.has(record.id)) {
      throw new Error(`Duplicate inventory id: ${record.id}`);
    }
    seenIds.add(record.id);

    assertField(`Record ${position} title`, record.title, (value) => typeof value === 'string' && value.trim().length > 0, 'must be a non-empty string');
    assertField(`Record ${position} url`, record.url, (value) => typeof value === 'string' && /^https?:\/\//.test(value.trim()), 'must be an absolute URL');
    if (seenUrls.has(record.url)) {
      throw new Error(`Duplicate inventory url: ${record.url}`);
    }
    seenUrls.add(record.url);

    assertField(`Record ${position} guideType`, record.guideType, (value) => GUIDE_TYPES.includes(value), 'must be a known guide type');
    assertField(`Record ${position} window`, record.window, (value) => /^Q[1-7]$/.test(value), 'must use Q1 through Q7');
    assertField(`Record ${position} disposition`, record.disposition, (value) => DISPOSITIONS.includes(value), 'must be a known disposition');
    assertField(`Record ${position} reason`, record.reason, (value) => typeof value === 'string' && value.trim().length > 0, 'must be a non-empty string');
    assertField(`Record ${position} sourceRetrievedAt`, record.sourceRetrievedAt, (value) => /^\d{4}-\d{2}-\d{2}$/.test(String(value)), 'must be a YYYY-MM-DD date string');
    assertField(`Record ${position} overlapIds`, record.overlapIds, Array.isArray, 'must be an array');
    assertField(`Record ${position} catalogIds`, record.catalogIds, Array.isArray, 'must be an array');
    assertField(`Record ${position} deliveryStatus`, record.deliveryStatus, (value) => DELIVERY_STATUSES.includes(value), 'must be a known delivery status');

    counts[record.guideType] += 1;

    validateInventoryRecord(record);
    if (record.guideType === 'commerce' && record.disposition !== 'excluded') {
      throw new Error(`commerce record ${record.id} must be excluded`);
    }
    if (record.id === 'armageddon-2026' && record.disposition !== 'deferred') {
      throw new Error('armageddon-2026 must remain deferred');
    }
    if (new Set(record.overlapIds).size !== record.overlapIds.length) {
      throw new Error(`Record ${record.id} contains duplicate overlap ids`);
    }
    if (new Set(record.catalogIds).size !== record.catalogIds.length) {
      throw new Error(`Record ${record.id} contains duplicate catalog ids`);
    }
  }

  const expectedCounts = {
    event: 42,
    era: 14,
    'sub-guide': 14,
    bridge: 10,
    'fast-track': 3,
    commerce: 3,
  };

  const mismatchedCounts = Object.entries(expectedCounts).filter(([key, count]) => counts[key] !== count);
  if (mismatchedCounts.length > 0) {
    throw new Error(`Inventory totals do not match the contract: ${JSON.stringify(mismatchedCounts)}`);
  }

  if (positions.length !== BASELINE_COUNT || positions.some((value, idx) => value !== idx + 1)) {
    throw new Error(`Positions must be exactly 1 through ${BASELINE_COUNT}`);
  }

  return counts;
}

export async function readInventory(sourcePath) {
  const text = await readFile(sourcePath, 'utf8');
  const records = JSON.parse(text);
  validateInventory(records);
  return records;
}

function validateInventoryRecord(record, { baseline = false } = {}) {
  const position = record?.position ?? 'unknown';
  assertField(`Record ${position}`, record && typeof record === 'object', Boolean, 'must be an object');
  assertField(`Record ${position} id`, record.id, (value) => typeof value === 'string' && value.trim().length > 0, 'must be a non-empty string');
  assertField(`Record ${position} title`, record.title, (value) => typeof value === 'string' && value.trim().length > 0, 'must be a non-empty string');
  assertField(`Record ${position} url`, record.url, (value) => typeof value === 'string' && /^https?:\/\//.test(value.trim()), 'must be an absolute URL');
  assertField(`Record ${position} guideType`, record.guideType, (value) => GUIDE_TYPES.includes(value), 'must be a known guide type');
  assertField(`Record ${position} window`, record.window, (value) => /^Q[1-7]$/.test(value), 'must use Q1 through Q7');
  assertField(`Record ${position} disposition`, record.disposition, (value) => DISPOSITIONS.includes(value), 'must be a known disposition');
  assertField(`Record ${position} reason`, record.reason, (value) => typeof value === 'string' && value.trim().length > 0, 'must be a non-empty string');
  assertField(`Record ${position} sourceRetrievedAt`, record.sourceRetrievedAt, (value) => /^\d{4}-\d{2}-\d{2}$/.test(String(value)), 'must be a YYYY-MM-DD date string');
  assertField(`Record ${position} overlapIds`, record.overlapIds, (value) => Array.isArray(value) && value.every((entry) => typeof entry === 'string'), 'must be an array of strings');
  assertField(`Record ${position} catalogIds`, record.catalogIds, (value) => Array.isArray(value) && value.every((entry) => typeof entry === 'string'), 'must be an array of strings');
  assertField(`Record ${position} deliveryStatus`, record.deliveryStatus, (value) => DELIVERY_STATUSES.includes(value), 'must be a known delivery status');

  if (baseline) {
    if (record.disposition === 'new-order' && record.deliveryStatus !== 'pending') {
      throw new Error(`new-order record ${record.id} must use deliveryStatus 'pending'`);
    }
    if (record.disposition !== 'new-order' && record.deliveryStatus !== 'not-applicable') {
      throw new Error(`non-new-order record ${record.id} must use deliveryStatus 'not-applicable'`);
    }
    if (record.overlapIds.length !== 0 || record.catalogIds.length !== 0) {
      throw new Error(`Baseline record ${record.id} must keep overlapIds and catalogIds empty`);
    }
    return;
  }

  if (record.disposition === 'new-order' && !['pending', 'ready', 'shipped', 'blocked'].includes(record.deliveryStatus)) {
    throw new Error(`new-order record ${record.id} has an invalid deliveryStatus: ${record.deliveryStatus}`);
  }
  if (record.disposition !== 'new-order' && !['not-applicable', 'blocked', 'ready', 'shipped'].includes(record.deliveryStatus)) {
    throw new Error(`Record ${record.id} has a deliveryStatus that does not fit its disposition: ${record.deliveryStatus}`);
  }
  if (record.deliveryStatus === 'blocked' && !record.reason?.trim()) {
    throw new Error(`Blocked record ${record.id} must include a blocker reason`);
  }
}

export function validateInventoryState(records) {
  if (!Array.isArray(records)) {
    throw new Error('The inventory must be an array');
  }
  const counts = {};
  for (const record of records) {
    validateInventoryRecord(record, { baseline: false });
    const key = record.guideType;
    counts[key] = (counts[key] ?? 0) + 1;
  }
  return counts;
}

export const validateLiveInventory = validateInventoryState;
export const validateInventorySchema = validateInventoryState;
