export function parseIssueNumber(title) {
  const match = /#\s*([0-9]+(?:\.[0-9A-Za-z]+)?[A-Za-z]*)\s*$/.exec(String(title ?? '').trim());
  return match ? match[1] : null;
}

export function reconcileIssueTitleNumber(title, metadataNumber, displayNumber) {
  const value = String(title ?? '').trim();
  if (
    metadataNumber == null
    || displayNumber == null
    || String(metadataNumber) === String(displayNumber)
  ) {
    return value;
  }

  const escaped = String(metadataNumber).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const suffix = new RegExp(`#\\s*${escaped}\\s*$`, 'i');
  if (!suffix.test(value)) {
    throw new Error(`Issue title does not end in metadata number #${metadataNumber}: ${value}`);
  }
  return value.replace(suffix, `#${displayNumber}`);
}
