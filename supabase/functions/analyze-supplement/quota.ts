/**
 * quota.ts
 * ─────────────────────────────────────────────────────────────
 * Reine Entscheidungslogik des serverseitigen Scan-Kontingents.
 * Bewusst ohne Deno-, Netz- und Datenbankbezug, damit sie in Node
 * getestet werden kann (tests/scan-quota.test.mjs) — dasselbe Muster wie
 * formulaVersioning.ts.
 *
 * WARUM SERVERSEITIG (Audit-Befund L2, 2026-09-14):
 * Der Kostenschutz lag vollstaendig in der App: `evaluateVisionScan` in
 * Entitlements.js zaehlte mit, blockierte aber nie, weil
 * PAYWALL_ENFORCED auf false steht. Der Zaehler selbst liegt im lokalen,
 * verschluesselten Store — also auf dem Geraet der Nutzerin und damit
 * ausserhalb unserer Kontrolle. Wer den Anon-Key aus dem Repo liest,
 * konnte die Function direkt aufrufen; das einzige Bollwerk war ein
 * IP-Limit von 20 Anfragen je 60 Minuten, also bis zu 480 Analysen am
 * Tag je Geraet.
 *
 * Diese Datei dreht das um: Das Kontingent gilt pro KONTO und wird in
 * der Datenbank gefuehrt. Das IP-Limit bleibt bestehen, aber nur noch
 * als zusaetzlicher Missbrauchsschutz gegen Aufrufe ohne Konto.
 *
 * WOHER DIE ZAHLEN KOMMEN — keine erfundenen Tarifgrenzen:
 * Beide Werte stehen in der aktiven Produktentscheidung
 * (Brain/decisions/2026-08-09-supplements-freemium-abo-und-credits.md)
 * und bereits identisch in Entitlements.js:
 *   3 KI-Foto-Scans im Free-Tier, gesamt, kein Reset
 *   rund 100 Scans je Monat als Fair-Use-Grenze im Pro-Abo
 *
 * WARUM DER SERVER FUER ALLE DIE PRO-GRENZE ZIEHT:
 * Der Server kann den Kauf-Tier derzeit nicht verifizieren. Er kommt aus
 * RevenueCat in die App und von dort in den lokalen Store; ein
 * manipulierter Client koennte "pro" behaupten. Solange es keinen
 * RevenueCat-Webhook gibt, der den Tier serverseitig hinterlegt, waere
 * jede tier-abhaengige Serverentscheidung wieder eine Client-Aussage.
 *
 * Deshalb die konservative Trennung:
 *   - Der SERVER begrenzt jedes Konto auf MONTHLY_HARD_CAP Analysen je
 *     Kalendermonat. Das ist die Kostenbremse und gilt fuer alle.
 *   - Die 3-Scan-Grenze des Free-Tiers bleibt die Produktschranke in der
 *     App (Entitlements.js). Sie ist manipulierbar, kostet aber nur
 *     innerhalb der Serverobergrenze.
 * Damit kann niemand unbegrenzt Analysen ausloesen, auch nicht mit
 * gefaelschtem Tier, und es wird keine Grenze erfunden, die nicht
 * entschieden ist.
 */

/**
 * Serverseitige Obergrenze je Konto und Kalendermonat.
 * Entspricht der Fair-Use-Grenze des Pro-Abos aus der
 * Freemium-Entscheidung vom 2026-08-09. ZENTRAL AENDERBAR: Dieser Wert
 * ist die einzige Stelle, an der die Serverobergrenze steht. Wer ihn
 * anhebt, aendert die Kostenobergrenze pro Konto.
 */
export const MONTHLY_HARD_CAP = 100;

/**
 * Zusaetzliche Analysen, die ein Konto ueber die Monatsgrenze hinaus
 * fahren darf, wenn Scan-Credits nachgekauft wurden. Bleibt 0, bis der
 * Kaufstatus serverseitig verifiziert werden kann (siehe Kopfkommentar):
 * Credits stehen heute nur im lokalen Store, ein Server, der ihnen
 * glaubt, haette keine Obergrenze mehr.
 */
export const SERVER_CREDIT_ALLOWANCE = 0;

export const QUOTA_RESULT = {
  /** Innerhalb des Kontingents, Analyse darf laufen. */
  ALLOWED: 'allowed',
  /** Monatsgrenze erreicht. */
  EXHAUSTED: 'exhausted',
  /** Kein Konto: kostenpflichtige Analysen brauchen eine Anmeldung. */
  UNAUTHENTICATED: 'unauthenticated',
};

/**
 * billingPeriod(date)
 * Abrechnungszeitraum als 'YYYY-MM' in UTC. Bewusst UTC und nicht die
 * Geraetezeitzone: Sonst koennte ein Konto durch Umstellen der Zeitzone
 * zweimal in denselben Monatswechsel laufen.
 */
export function billingPeriod(date = new Date()) {
  const iso = date.toISOString();
  return iso.slice(0, 7);
}

/**
 * evaluateQuota({ userId, period, usedInPeriod, creditAllowance })
 * Entscheidet, ob eine weitere Analyse laufen darf. Rein, ohne
 * Nebenwirkung — die eigentliche Zaehlung passiert atomar in der
 * Datenbank (reserve_scan_quota).
 *
 * usedInPeriod: bereits im Zeitraum verbrauchte Analysen des Kontos.
 */
export function evaluateQuota({
  userId = null,
  usedInPeriod = 0,
  creditAllowance = SERVER_CREDIT_ALLOWANCE,
  cap = MONTHLY_HARD_CAP,
} = {}) {
  if (!userId || typeof userId !== 'string') {
    return {
      result: QUOTA_RESULT.UNAUTHENTICATED,
      allowed: false,
      remaining: 0,
      cap,
    };
  }

  const used = Number.isFinite(usedInPeriod) && usedInPeriod > 0 ? Math.floor(usedInPeriod) : 0;
  const extra = Number.isFinite(creditAllowance) && creditAllowance > 0 ? Math.floor(creditAllowance) : 0;
  const limit = cap + extra;
  const remaining = Math.max(0, limit - used);

  return {
    result: remaining > 0 ? QUOTA_RESULT.ALLOWED : QUOTA_RESULT.EXHAUSTED,
    allowed: remaining > 0,
    remaining,
    cap: limit,
  };
}

/**
 * Modelle, die der Server einsetzen darf. Die Wahl liegt
 * AUSSCHLIESSLICH serverseitig: gesetzt wird sie ueber das Secret
 * ANALYZE_MODEL, geprueft gegen diese Liste. Ein Modellwunsch aus dem
 * Request-Body wird nicht mehr gelesen — vorher konnte ein
 * selbstgebauter Aufruf das Modell frei waehlen.
 *
 * Der Default bleibt Opus. Begruendung, nachpruefbar:
 * Brain/decisions/2026-08-10-supplements-haiku-umstellung-verworfen.md
 * und launch/scan-quality-report-2026-08-10.md. Der In-house-Vergleich
 * mit 10 echten Etikettenfotos ergab fuer Haiku unter 50 Prozent
 * korrekte Substanz-und-Dosis-Zeilen; auf dem anspruchsvollsten Etikett
 * wurde ein Substanzname zu einer ANDEREN Verbindung verstuemmelt, bei
 * gleichzeitig HOEHEREN Konfidenzwerten. Falsche Substanznamen mit hoher
 * Konfidenz sind fuer eine Gesundheits-App die gefaehrlichste
 * Fehlerklasse. Sonnet ist laut derselben Entscheidung ausdruecklich
 * "nicht getestet".
 *
 * Wer umstellen will, faehrt vorher den in der Entscheidung
 * festgelegten Test (scripts/scan-quality-test.mjs, dieselben 10 Fotos
 * plus die gesammelten Problem-Etiketten, Schwelle 50 Prozent) und setzt
 * danach ANALYZE_MODEL. Kein Code-Deploy noetig.
 */
export const ALLOWED_MODELS = Object.freeze([
  'claude-opus-5',
  'claude-sonnet-5',
  'claude-haiku-4-5',
]);

export const DEFAULT_MODEL = 'claude-opus-5';

/**
 * resolveModel(secretValue)
 * Nimmt ausschliesslich den Server-Secret-Wert. Unbekannte oder leere
 * Werte fallen auf den Default zurueck, statt einen Tippfehler als
 * Modellnamen an die API zu schicken.
 */
export function resolveModel(secretValue) {
  const wanted = String(secretValue ?? '').trim();
  if (!wanted) return { model: DEFAULT_MODEL, fromSecret: false };
  if (ALLOWED_MODELS.includes(wanted)) return { model: wanted, fromSecret: true };
  return { model: DEFAULT_MODEL, fromSecret: false, rejected: wanted };
}
