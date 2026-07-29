/**
 * data/labMarkers.js
 * ─────────────────────────────────────────────────────────────
 * Gaengige Laborwerte als EINGABEHILFE.
 *
 * WAS HIER BEWUSST FEHLT: Referenzbereiche.
 *
 * Die gelten nicht allgemein, sondern haengen vom Labor, der Messmethode,
 * dem Alter und teils vom Geschlecht ab — zwei Labore geben fuer denselben
 * Marker unterschiedliche Spannen an. Eine in der App hinterlegte Spanne
 * waere deshalb im Einzelfall falsch und wuerde einen Wert als auffaellig
 * oder unauffaellig erscheinen lassen, obwohl das Labor es anders sieht.
 *
 * Die App uebernimmt den Referenzbereich stattdessen aus dem Befund, wenn
 * die Nutzerin ihn eintraegt — dann steht er als Zitat aus der Quelle da,
 * nicht als Behauptung der App. Wird er nicht eingetragen, zeigt die App
 * den Wert ohne Einordnung an.
 *
 * KEINE INTERPRETATION:
 * Die App sagt nie "zu niedrig", "Mangel" oder "im Normbereich". Sie
 * dokumentiert Werte und stellt sie im Zeitverlauf dar. Alles andere waere
 * Diagnostik und gehoert in aerztliche Haende — abgesehen davon, dass es
 * die App zum Medizinprodukt machen wuerde.
 *
 * `commonUnit` ist ein Vorschlag fuer das Eingabefeld, kein Zwang: Labore
 * rechnen teils in anderen Einheiten (ng/ml vs. nmol/l bei Vitamin D), und
 * eine erzwungene Einheit wuerde zu falsch eingetragenen Zahlen fuehren.
 * `relatedSubstanceId` verknuepft den Marker mit der Wirkstoff-Datenbank,
 * damit im Export sichtbar wird, was dazu eingenommen wird.
 */

export const LAB_MARKERS = [
  { id: 'ferritin', labelKey: 'lab.marker.ferritin', commonUnit: 'µg/l', relatedSubstanceId: 'iron' },
  { id: 'hemoglobin', labelKey: 'lab.marker.hemoglobin', commonUnit: 'g/dl', relatedSubstanceId: 'iron' },
  { id: 'vitamin-d-25oh', labelKey: 'lab.marker.vitaminD', commonUnit: 'ng/ml', relatedSubstanceId: 'vitamin-d3' },
  { id: 'vitamin-b12', labelKey: 'lab.marker.vitaminB12', commonUnit: 'pg/ml', relatedSubstanceId: 'vitamin-b12' },
  { id: 'holo-tc', labelKey: 'lab.marker.holoTC', commonUnit: 'pmol/l', relatedSubstanceId: 'vitamin-b12' },
  { id: 'folate', labelKey: 'lab.marker.folate', commonUnit: 'ng/ml', relatedSubstanceId: 'folate' },
  { id: 'magnesium', labelKey: 'lab.marker.magnesium', commonUnit: 'mmol/l', relatedSubstanceId: 'magnesium' },
  { id: 'zinc', labelKey: 'lab.marker.zinc', commonUnit: 'µg/dl', relatedSubstanceId: 'zinc' },
  { id: 'selenium', labelKey: 'lab.marker.selenium', commonUnit: 'µg/l', relatedSubstanceId: 'selenium' },
  { id: 'calcium', labelKey: 'lab.marker.calcium', commonUnit: 'mmol/l', relatedSubstanceId: 'calcium' },
  { id: 'tsh', labelKey: 'lab.marker.tsh', commonUnit: 'mU/l', relatedSubstanceId: 'iodine' },
  { id: 'crp', labelKey: 'lab.marker.crp', commonUnit: 'mg/l', relatedSubstanceId: null },
  { id: 'hba1c', labelKey: 'lab.marker.hba1c', commonUnit: '%', relatedSubstanceId: null },
  { id: 'ldl', labelKey: 'lab.marker.ldl', commonUnit: 'mg/dl', relatedSubstanceId: null },
  { id: 'hdl', labelKey: 'lab.marker.hdl', commonUnit: 'mg/dl', relatedSubstanceId: null },
  { id: 'triglycerides', labelKey: 'lab.marker.triglycerides', commonUnit: 'mg/dl', relatedSubstanceId: null },
  { id: 'creatinine', labelKey: 'lab.marker.creatinine', commonUnit: 'mg/dl', relatedSubstanceId: null },
  { id: 'alt-gpt', labelKey: 'lab.marker.altGpt', commonUnit: 'U/l', relatedSubstanceId: null },
  { id: 'other', labelKey: 'lab.marker.other', commonUnit: '', relatedSubstanceId: null },
];

export function getLabMarker(id) {
  return LAB_MARKERS.find((marker) => marker.id === id) ?? null;
}

/**
 * Substanzen, zu denen es einen passenden Marker gibt — fuer den Export:
 * "Zu diesem Wert wird derzeit X eingenommen."
 */
export function getMarkersForSubstance(substanceId) {
  return LAB_MARKERS.filter((marker) => marker.relatedSubstanceId === substanceId);
}
