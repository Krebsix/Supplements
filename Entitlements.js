/**
 * Entitlements.js
 * ─────────────────────────────────────────────────────────────
 * Tiers, Scan-Kontingente und Credits (Decision 2026-08-09, Familien-Abo
 * ergaenzt 2026-09-03).
 *
 * MODELL:
 *   Free  unbegrenzter Barcode-Scan (kostet uns nichts), 3 KI-Foto-Scans
 *         gesamt, bis 5 Praeparate.
 *   Pro   unbegrenzte KI-Scans mit Fair-Use-Limit pro Monat, unbegrenzter
 *         Bestand, Pro-Features. Zwei Abrechnungsplaene (PLANS in
 *         purchaseConfig.js): individual oder family -- BEIDE schalten
 *         genau dieselben Features frei, `plan` ist reine Anzeige-/
 *         Belegangabe, kein zweites Feature-Gate. Familie ist eine
 *         Abrechnungsfrage (mehrere Geraete teilen ein Abo, v1 nur ueber
 *         Apple Family Sharing), keine geteilten Gesundheitsdaten: jedes
 *         Geraet zaehlt seine KI-Scans weiterhin einzeln (siehe unten),
 *         kein serverseitiger Familien-Topf.
 *   Credits  nachgekaufte Scans (Consumable). Fuer Free-Nutzerinnen ohne
 *         Abo UND als Overflow ueber dem Fair-Use-Limit.
 *
 * Verbrauchsreihenfolge: Freikontingent → Pro-Fair-Use → Credits.
 * Ein Scan wird erst NACH erfolgreicher Analyse verbraucht; ein
 * fehlgeschlagener Scan kostet nichts.
 *
 * PAYWALL_ENFORCED steuert die Durchsetzung: Solange die Kauf-
 * Integration (IAP) nicht live ist, wird nur GEZAEHLT, nie blockiert.
 * Sonst wuerden Nutzerinnen ausgesperrt, ohne kaufen zu koennen.
 * Beim Aktivieren: Flag auf true, IAP-Task muss abgeschlossen sein.
 *
 * Bewusst NICHT hier: Bericht-Export und Backup. Die bleiben in jedem
 * Tier frei (Vertriebskanal bzw. Datenrechte, Art. 17/20 DSGVO).
 */
import { PLANS, planFromProductId } from './purchaseConfig';

export const PAYWALL_ENFORCED = false;

export const TIERS = { FREE: 'free', PRO: 'pro' };
export { PLANS };

export const FREE_VISION_SCANS = 3;
export const PRO_MONTHLY_FAIR_USE = 100;
export const FREE_MAX_SUPPLEMENTS = 5;

export const EMPTY_ENTITLEMENT = {
  tier: TIERS.FREE,
  // Abrechnungsplan des Pro-Abos, nur informativ (siehe Kopfkommentar).
  // Bei tier FREE bedeutungslos, bleibt aber gesetzt statt null, damit
  // Aufrufer nicht zusaetzlich auf tier verzweigen muessen, um den
  // Default zu kennen.
  plan: PLANS.INDIVIDUAL,
  // Verbrauchte Frei-Scans (gesamt, kein Reset)
  freeScansUsed: 0,
  // Fair-Use-Zaehler des Abos, monatlich
  fairUseMonth: null, // 'YYYY-MM'
  fairUseUsed: 0,
  // Nachgekaufte Scans
  extraCredits: 0,
};

export function monthKey(date = new Date()) {
  const value = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(value.getTime())) return monthKey(new Date());
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}`;
}

function normalize(entitlement = {}) {
  const toCount = (value) => {
    const n = Number(value);
    return Number.isFinite(n) && n >= 0 ? Math.floor(n) : 0;
  };
  return {
    tier: entitlement?.tier === TIERS.PRO ? TIERS.PRO : TIERS.FREE,
    plan: entitlement?.plan === PLANS.FAMILY ? PLANS.FAMILY : PLANS.INDIVIDUAL,
    freeScansUsed: toCount(entitlement?.freeScansUsed),
    fairUseMonth:
      typeof entitlement?.fairUseMonth === 'string' ? entitlement.fairUseMonth : null,
    fairUseUsed: toCount(entitlement?.fairUseUsed),
    extraCredits: toCount(entitlement?.extraCredits),
  };
}

export function isPro(entitlement) {
  return normalize(entitlement).tier === TIERS.PRO;
}

/** Fair-Use-Zaehler des laufenden Monats (rollt beim Monatswechsel um). */
function fairUseUsedThisMonth(ent, date) {
  return ent.fairUseMonth === monthKey(date) ? ent.fairUseUsed : 0;
}

/**
 * Darf jetzt ein KI-Foto-Scan laufen, und woraus wuerde er bezahlt?
 * Liefert immer auch die Restbestaende fuer die Anzeige.
 */
export function evaluateVisionScan(entitlement, date = new Date()) {
  const ent = normalize(entitlement);
  const remainingFree = Math.max(0, FREE_VISION_SCANS - ent.freeScansUsed);
  const remainingFairUse =
    ent.tier === TIERS.PRO
      ? Math.max(0, PRO_MONTHLY_FAIR_USE - fairUseUsedThisMonth(ent, date))
      : 0;

  let source = null;
  if (remainingFree > 0) source = 'free';
  else if (remainingFairUse > 0) source = 'pro';
  else if (ent.extraCredits > 0) source = 'credit';

  return {
    allowed: PAYWALL_ENFORCED ? source !== null : true,
    // Ohne Durchsetzung trotzdem die echte Quelle melden ('none' heisst:
    // wuerde bei aktiver Paywall blockieren) — so bleibt die Zaehlung ehrlich.
    source: source ?? 'none',
    remainingFree,
    remainingFairUse,
    credits: ent.extraCredits,
  };
}

/**
 * Verbraucht einen erfolgreichen KI-Scan aus der richtigen Quelle.
 * Gibt den NEUEN Entitlement-Zustand zurueck (immutabel).
 */
export function applyVisionScan(entitlement, date = new Date()) {
  const ent = normalize(entitlement);
  const { source } = evaluateVisionScan(ent, date);

  if (source === 'free' ) {
    return { ...ent, freeScansUsed: ent.freeScansUsed + 1 };
  }
  if (source === 'pro') {
    return {
      ...ent,
      fairUseMonth: monthKey(date),
      fairUseUsed: fairUseUsedThisMonth(ent, date) + 1,
    };
  }
  if (source === 'credit') {
    return { ...ent, extraCredits: Math.max(0, ent.extraCredits - 1) };
  }
  // 'none' bei abgeschalteter Paywall: Ueberlauf im Freikontingent
  // mitzaehlen, damit die Daten fuer die spaetere Aktivierung stimmen.
  return { ...ent, freeScansUsed: ent.freeScansUsed + 1 };
}

export function addCredits(entitlement, count) {
  const ent = normalize(entitlement);
  const add = Number(count);
  if (!Number.isFinite(add) || add <= 0) return ent;
  return { ...ent, extraCredits: ent.extraCredits + Math.floor(add) };
}

/**
 * setTier(entitlement, tier, plan)
 * `plan` nur relevant beim Wechsel auf PRO; faellt ohne Angabe auf
 * 'individual' zurueck. Ein Wechsel zurueck auf FREE setzt den Plan
 * ebenfalls auf 'individual' zurueck (kein bedeutungsloser Rest-Zustand).
 */
export function setTier(entitlement, tier, plan) {
  const ent = normalize(entitlement);
  const nextTier = tier === TIERS.PRO ? TIERS.PRO : TIERS.FREE;
  const nextPlan = nextTier === TIERS.PRO && plan === PLANS.FAMILY ? PLANS.FAMILY : PLANS.INDIVIDUAL;
  return { ...ent, tier: nextTier, plan: nextPlan };
}

/**
 * Gate fuer die vier Pro-Features (Wirkungskontrolle, Kostenanalyse,
 * Laborwerte-Verlauf, Kur-Zyklen; Decision 2026-08-09). Solange
 * PAYWALL_ENFORCED aus ist, bleibt alles offen — die Aufrufstellen sind
 * trotzdem verdrahtet, damit die Aktivierung ein Flag-Flip ist und kein
 * Umbau kurz vor dem IAP-Start.
 */
export function canUseProFeature(entitlement) {
  const pro = isPro(entitlement);
  return { allowed: PAYWALL_ENFORCED ? pro : true, isPro: pro };
}

/**
 * Spiegelt den Abo-Status aus dem Store (PurchaseLogic.mapCustomerInfo) in
 * das Tier. Nur tier; die lokalen Zaehler bleiben, RevenueCat zaehlt keine
 * Scans.
 */
export function applyPurchaseStatus(entitlement, mapped) {
  const plan = planFromProductId(mapped?.productId) ?? PLANS.INDIVIDUAL;
  return setTier(entitlement, mapped?.isPro ? TIERS.PRO : TIERS.FREE, plan);
}

/** Darf ein weiteres Praeparat angelegt werden? */
export function canAddSupplement(entitlement, activeCount) {
  const ent = normalize(entitlement);
  const count = Number(activeCount);
  const withinLimit =
    ent.tier === TIERS.PRO ||
    !Number.isFinite(count) ||
    count < FREE_MAX_SUPPLEMENTS;
  return {
    allowed: PAYWALL_ENFORCED ? withinLimit : true,
    withinLimit,
    limit: ent.tier === TIERS.PRO ? null : FREE_MAX_SUPPLEMENTS,
  };
}
