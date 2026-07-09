export function formatSupplementValue(value, fallback = '') {
  if (value === null || value === undefined || value === '') {
    return fallback;
  }

  if (typeof value === 'string') {
    return value.trim() || fallback;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  if (Array.isArray(value)) {
    const formattedValues = value
      .map((item) => formatSupplementValue(item, ''))
      .filter(Boolean);

    return formattedValues.length > 0 ? formattedValues.join(', ') : fallback;
  }

  if (typeof value === 'object') {
    if ('amount' in value || 'unit' in value) {
      const amount = formatSupplementValue(value.amount, '');
      const unit = formatSupplementValue(value.unit, '');

      return `${amount} ${unit}`.trim() || fallback;
    }

    const candidate = value.label ?? value.name ?? value.title ?? value.value;

    return candidate !== undefined
      ? formatSupplementValue(candidate, fallback)
      : fallback;
  }

  return fallback;
}

function getDosageSource(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return value;
  }

  if ('amount' in value || 'unit' in value) {
    return value;
  }

  if ('dosage' in value || 'dose' in value || 'serving' in value) {
    return value.dosage ?? value.dose ?? value.serving;
  }

  return undefined;
}

export function formatSupplementName(supplement, fallback = 'Unbenanntes Supplement') {
  return formatSupplementValue(
    supplement?.name ?? supplement?.supplementName ?? supplement?.productName,
    fallback
  );
}

export function formatSupplementDosage(value, fallback = 'Dosierung nicht hinterlegt') {
  return formatSupplementValue(getDosageSource(value), fallback);
}

export function formatSupplementPurpose(supplement, fallback = 'Zweck nicht hinterlegt') {
  return formatSupplementValue(
    supplement?.purpose ?? supplement?.goal ?? supplement?.reason,
    fallback
  );
}

export function getDosageAmount(value, fallback = '') {
  const dosage = getDosageSource(value);

  if (!dosage) return fallback;

  if (typeof dosage === 'object' && !Array.isArray(dosage)) {
    return formatSupplementValue(dosage.amount, fallback);
  }

  if (typeof dosage === 'string') {
    const parts = dosage.trim().split(/\s+/);
    return parts[0] || fallback;
  }

  return fallback;
}

export function getDosageUnit(value, fallback = '') {
  const dosage = getDosageSource(value);

  if (!dosage) return fallback;

  if (typeof dosage === 'object' && !Array.isArray(dosage)) {
    return formatSupplementValue(dosage.unit, fallback);
  }

  if (typeof dosage === 'string') {
    const parts = dosage.trim().split(/\s+/);
    return parts.length > 1 ? parts.slice(1).join(' ') : fallback;
  }

  return fallback;
}
