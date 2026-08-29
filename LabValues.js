/**
 * LabValues.js
 * ─────────────────────────────────────────────────────────────
 * Erfassung und Verlauf von Laborwerten.
 *
 * ABGRENZUNG — das ist der ganze Punkt:
 * Die App speichert, ordnet chronologisch und stellt gegenueber, was zum
 * Zeitpunkt der Messung eingenommen wurde. Sie bewertet NICHT. Kein "zu
 * niedrig", kein "Mangel", kein "im Normbereich" — auch nicht farblich
 * angedeutet.
 *
 * Der Referenzbereich stammt, wenn vorhanden, aus dem Befund und wird als
 * Angabe des Labors ausgewiesen. Die App legt keinen eigenen an: Bereiche
 * unterscheiden sich je Labor und Methode, ein hinterlegter Wert waere im
 * Einzelfall falsch.
 *
 * Was die App leisten darf und hier auch tut: den zeitlichen Zusammenhang
 * sichtbar machen. "Dieser Wert wurde gemessen, waehrend folgende Praeparate
 * dokumentiert waren" ist eine Tatsache ueber die eigenen Daten, keine
 * Aussage ueber Ursache und Wirkung.
 */

/**
 * Zahl aus einer Eingabe lesen. Gibt null zurueck, wenn nichts Brauchbares
 * dasteht.
 *
 * Die Leerstring-Pruefung ist nicht ueberfluessig: Number('') ergibt 0,
 * nicht NaN. Ohne sie stuende bei einem nicht ausgefuellten
 * Referenzbereich "0 bis 0" im Befund — eine Zahl, die niemand eingetragen
 * hat.
 */
function parseNumber(raw) {
  const text = String(raw ?? '').trim().replace(',', '.');
  if (!text) return null;
  const num = Number(text);
  return Number.isFinite(num) ? num : null;
}

export function createLabValue(input = {}) {
  const value = parseNumber(input.value);
  if (value === null) return null;

  const dateKey = normalizeDateKey(input.measuredAt);
  if (!dateKey) return null;

  const parseBound = parseNumber;

  return {
    id: input.id ?? `lab-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    markerId: input.markerId ?? 'other',
    // Freitext, wenn der Marker nicht in der Liste steht
    customName: typeof input.customName === 'string' ? input.customName.trim() : '',
    value,
    unit: typeof input.unit === 'string' ? input.unit.trim() : '',
    dateKey,
    labName: typeof input.labName === 'string' ? input.labName.trim() : '',
    // Aus dem Befund uebernommen, nicht von der App gesetzt
    referenceMin: parseBound(input.referenceMin),
    referenceMax: parseBound(input.referenceMax),
    note: typeof input.note === 'string' ? input.note.trim() : '',
    createdAt: new Date().toISOString(),
  };
}

/**
 * updateLabValue(labValues, id, input)
 * Ersetzt einen Eintrag mit neu validierten Feldern. ID und createdAt
 * bleiben, damit Verlauf und Bericht stabil referenzieren. Ungueltige
 * Eingabe oder unbekannte ID: die Liste kommt unveraendert zurueck (gleiche
 * Referenz), der Aufrufer erkennt daran den Fehlschlag.
 */
export function updateLabValue(labValues = [], id, input = {}) {
  const index = labValues.findIndex((entry) => entry?.id === id);
  if (index < 0) return labValues;
  const fresh = createLabValue({ ...input, id });
  if (!fresh) return labValues;
  const next = labValues.slice();
  next[index] = { ...fresh, createdAt: labValues[index].createdAt };
  return next;
}

function normalizeDateKey(value) {
  if (!value) return new Date().toISOString().slice(0, 10);
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 10);
}

/**
 * getMarkerHistory(labValues, markerId)
 * Verlauf eines Markers, aelteste Messung zuerst.
 */
export function getMarkerHistory(labValues = [], markerId) {
  return labValues
    .filter((entry) => entry?.markerId === markerId)
    .slice()
    .sort((a, b) => String(a.dateKey).localeCompare(String(b.dateKey)));
}

/**
 * getGroupedValues(labValues)
 * Nach Marker gruppiert, innerhalb jeweils chronologisch.
 * Gruppen mit der zuletzt gemessenen Messung zuerst — was frisch ist,
 * interessiert meist mehr.
 */
export function getGroupedValues(labValues = []) {
  const byMarker = new Map();

  for (const entry of labValues) {
    if (!entry?.markerId) continue;
    if (!byMarker.has(entry.markerId)) byMarker.set(entry.markerId, []);
    byMarker.get(entry.markerId).push(entry);
  }

  return [...byMarker.entries()]
    .map(([markerId, entries]) => {
      const sorted = entries
        .slice()
        .sort((a, b) => String(a.dateKey).localeCompare(String(b.dateKey)));
      return {
        markerId,
        entries: sorted,
        latest: sorted[sorted.length - 1],
        customName: sorted[sorted.length - 1]?.customName ?? '',
      };
    })
    .sort((a, b) => String(b.latest?.dateKey).localeCompare(String(a.latest?.dateKey)));
}

/**
 * getIntakeContext(labValue, supplements, intakeLogs)
 * Welche Praeparate waren zum Messzeitpunkt dokumentiert?
 *
 * Bewusst eng gefasst: nur was in den 14 Tagen vor der Messung
 * tatsaechlich eingetragen wurde. Das ist eine Tatsache ueber die eigenen
 * Daten — keine Aussage darueber, ob das den Wert beeinflusst hat.
 */
export function getIntakeContext(labValue, supplements = [], intakeLogs = [], windowDays = 14) {
  if (!labValue?.dateKey) return [];

  const end = new Date(labValue.dateKey);
  const start = new Date(end.getTime() - windowDays * 86400000);
  const startKey = start.toISOString().slice(0, 10);

  const activeIds = new Set(
    intakeLogs
      .filter(
        (log) =>
          !log?.undoneAt &&
          log?.dateKey &&
          log.dateKey >= startKey &&
          log.dateKey <= labValue.dateKey
      )
      .map((log) => log.userSupplementId)
  );

  return supplements
    .filter((supplement) => activeIds.has(supplement?.id))
    .map((supplement) => ({
      id: supplement.id,
      name: supplement.name,
      dosage: supplement.dosage ?? null,
    }));
}
