export function issueIdsFromValue(value) {
  if (typeof value === 'string' || typeof value === 'number') {
    return [String(value)];
  }
  if (Array.isArray(value)) {
    return value.flatMap((entry) => issueIdsFromValue(entry));
  }
  if (value && typeof value === 'object') {
    if (typeof value.issueId === 'number' || typeof value.issueId === 'string') {
      return [String(value.issueId)];
    }
    if (typeof value.id === 'number' || typeof value.id === 'string') {
      return [String(value.id)];
    }
    if (Array.isArray(value.items)) {
      return issueIdsFromValue(value.items);
    }
    if (Array.isArray(value.issues)) {
      return issueIdsFromValue(value.issues);
    }
    if (Array.isArray(value.rows)) {
      return issueIdsFromValue(value.rows);
    }
  }
  return [];
}

export function compareIssueSets(candidateIds, existingIds) {
  const candidateList = Array.isArray(candidateIds) ? candidateIds.map(String) : [];
  const existingList = Array.isArray(existingIds) ? existingIds.map(String) : [];
  const candidateSet = new Set(candidateList);
  const existingSet = new Set(existingList);
  const sharedIds = candidateList.filter((id) => existingSet.has(id));

  if (sharedIds.length === 0) {
    return { relationship: 'none', sharedCount: 0, sharedIds: [] };
  }

  const candidateExact = candidateList.length === existingList.length && candidateList.every((id) => existingSet.has(id)) && existingList.every((id) => candidateSet.has(id));
  if (candidateExact) {
    return { relationship: 'exact', sharedCount: sharedIds.length, sharedIds };
  }

  const candidateSubset = candidateList.every((id) => existingSet.has(id)) && existingList.length > candidateList.length;
  if (candidateSubset) {
    return { relationship: 'candidate-subset', sharedCount: sharedIds.length, sharedIds };
  }

  const existingSubset = existingList.every((id) => candidateSet.has(id)) && candidateList.length > existingList.length;
  if (existingSubset) {
    return { relationship: 'existing-subset', sharedCount: sharedIds.length, sharedIds };
  }

  return { relationship: 'partial', sharedCount: sharedIds.length, sharedIds };
}

export function buildComparisonReport({ candidateIds, orders, peerOrders = [] }) {
  const allOrders = [...orders, ...peerOrders];
  const comparisons = allOrders.map((order) => {
    const existingIds = issueIdsFromValue(order.issueIds ?? order.items ?? order.issues ?? []);
    const outcome = compareIssueSets(candidateIds, existingIds);
    return {
      orderId: order.orderId ?? order.id ?? 'unknown',
      sharedCount: outcome.sharedCount,
      sharedIds: outcome.sharedIds,
      relationship: outcome.relationship,
    };
  }).sort((left, right) => left.orderId.localeCompare(right.orderId));

  return {
    candidateCount: candidateIds.length,
    comparisonCount: comparisons.length,
    comparisons,
  };
}
