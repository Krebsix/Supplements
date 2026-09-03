/**
 * formulaVersioning.ts
 * ─────────────────────────────────────────────────────────────
 * Reine Vergleichslogik fuer Roadmap-Baustein "Formula Versioning"
 * (launch/roadmap-intelligence.md, Abschnitt 1): Product ID != Formula
 * ID, Rezepturen aendern sich unter gleichem Namen/Barcode.
 *
 * hasFormulaChanged(previous, next) entscheidet, ob ein neuer
 * Vision-Scan-Treffer fuer einen BEREITS gecachten Barcode eine neue
 * Version rechtfertigt, oder ob es nur Rauschen ist (Confidence,
 * Warnhinweis-Formulierung, Reihenfolge). Nur Wirkstoffmengen und
 * Dosierung zaehlen als Rezeptur -- Marketingtext o.ae. nicht.
 *
 * Bewusst konservativ: false (keine neue Version) im Zweifel, sonst
 * wuerde jede leicht andere Vision-Auslesung (andere Reihenfolge, ein
 * einmal nicht erkannter Zusatzstoff) eine neue Version erzeugen und
 * die Pruef-Schleuse mit Rauschen fluten statt mit echten
 * Rezepturaenderungen.
 */

interface Ingredient {
  name?: string;
  amount?: string | number;
  unit?: string;
}

interface Dosage {
  amount?: string | number;
  unit?: string;
}

interface ScanResult {
  ingredients?: Ingredient[];
  dosage?: Dosage;
}

function normalizeText(value: unknown): string {
  return typeof value === "string" || typeof value === "number"
    ? String(value).trim().toLowerCase()
    : "";
}

// Menge normalisiert: "250" und "250.0" und "250,0" sollen gleich zaehlen.
function normalizeAmount(value: unknown): string {
  const text = normalizeText(value).replace(",", ".");
  const num = Number.parseFloat(text);
  return Number.isFinite(num) ? String(num) : text;
}

function ingredientKey(ingredient: Ingredient): string {
  return [
    normalizeText(ingredient?.name),
    normalizeAmount(ingredient?.amount),
    normalizeText(ingredient?.unit),
  ].join("|");
}

// Menge + Einheit als Menge, unabhaengig von der Reihenfolge im Array
// (die Vision-API liest dieselbe Zutatenliste nicht immer in derselben
// Reihenfolge aus).
function ingredientSet(ingredients: Ingredient[] | undefined): Set<string> {
  const list = Array.isArray(ingredients) ? ingredients : [];
  return new Set(list.map(ingredientKey).filter((key) => key !== "||"));
}

function setsEqual(a: Set<string>, b: Set<string>): boolean {
  if (a.size !== b.size) return false;
  for (const value of a) {
    if (!b.has(value)) return false;
  }
  return true;
}

function dosageKey(dosage: Dosage | undefined): string {
  return `${normalizeAmount(dosage?.amount)}|${normalizeText(dosage?.unit)}`;
}

/**
 * hasFormulaChanged(previous, next) => boolean
 * true nur, wenn sich die erkannte Wirkstoffliste ODER die Dosierung
 * tatsaechlich unterscheidet (mengen- und mengeneinheit-basiert,
 * reihenfolge- und schreibweise-unabhaengig).
 */
export function hasFormulaChanged(
  previous: ScanResult | null | undefined,
  next: ScanResult | null | undefined
): boolean {
  if (!previous || !next) return false;

  const prevIngredients = ingredientSet(previous.ingredients);
  const nextIngredients = ingredientSet(next.ingredients);
  if (!setsEqual(prevIngredients, nextIngredients)) return true;

  return dosageKey(previous.dosage) !== dosageKey(next.dosage);
}
