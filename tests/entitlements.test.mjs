// Tests fuer Entitlements.js: Tiers, Scan-Kontingente, Credits.
// Prueft vor allem die Verbrauchsreihenfolge (frei → Fair Use → Credits)
// und dass die Zaehlung auch bei abgeschalteter Paywall ehrlich bleibt.

import {
  EMPTY_ENTITLEMENT,
  FREE_MAX_SUPPLEMENTS,
  FREE_VISION_SCANS,
  PAYWALL_ENFORCED,
  PRO_MONTHLY_FAIR_USE,
  TIERS,
  addCredits,
  applyVisionScan,
  canAddSupplement,
  evaluateVisionScan,
  isPro,
  monthKey,
  setTier,
} from '../Entitlements';

let failures = 0;

function check(name, condition, extra = '') {
  if (condition) {
    console.log(`  ok   ${name}`);
  } else {
    failures += 1;
    console.error(`  FAIL ${name} ${extra}`);
  }
}

const AUG = new Date('2026-08-09T12:00:00Z');
const SEP = new Date('2026-09-01T12:00:00Z');

console.log('— Grundzustand —');
check('Startzustand ist Free ohne Verbrauch', EMPTY_ENTITLEMENT.tier === TIERS.FREE && EMPTY_ENTITLEMENT.freeScansUsed === 0);
check('monthKey formatiert YYYY-MM', monthKey(AUG) === '2026-08');
check('isPro erkennt Free', isPro(EMPTY_ENTITLEMENT) === false);
check('Paywall ist fuer den Start abgeschaltet (bis IAP live ist)', PAYWALL_ENFORCED === false);

console.log('— Freikontingent —');
let ent = { ...EMPTY_ENTITLEMENT };
const first = evaluateVisionScan(ent, AUG);
check('erster Scan kommt aus dem Freikontingent', first.source === 'free' && first.remainingFree === FREE_VISION_SCANS);
for (let i = 0; i < FREE_VISION_SCANS; i += 1) ent = applyVisionScan(ent, AUG);
check('Freikontingent nach 3 Scans leer', evaluateVisionScan(ent, AUG).remainingFree === 0);
check('ohne Abo und Credits: Quelle none', evaluateVisionScan(ent, AUG).source === 'none');
check('bei abgeschalteter Paywall trotzdem erlaubt', evaluateVisionScan(ent, AUG).allowed === true);

console.log('— Credits —');
ent = addCredits(ent, 5);
check('Credits gutgeschrieben', evaluateVisionScan(ent, AUG).credits === 5);
check('Quelle wechselt auf credit', evaluateVisionScan(ent, AUG).source === 'credit');
ent = applyVisionScan(ent, AUG);
check('Credit verbraucht', ent.extraCredits === 4);
check('negative Gutschrift wird ignoriert', addCredits(ent, -3).extraCredits === 4);
check('unsinnige Gutschrift wird ignoriert', addCredits(ent, 'abc').extraCredits === 4);

console.log('— Pro und Fair Use —');
let pro = setTier({ ...EMPTY_ENTITLEMENT, freeScansUsed: FREE_VISION_SCANS }, TIERS.PRO);
check('setTier setzt Pro', isPro(pro) === true);
check('Pro schoepft aus Fair Use', evaluateVisionScan(pro, AUG).source === 'pro');
pro = applyVisionScan(pro, AUG);
check('Fair-Use-Zaehler laeuft im Monat', pro.fairUseMonth === '2026-08' && pro.fairUseUsed === 1);
check('Monatswechsel setzt Fair Use zurueck', evaluateVisionScan(pro, SEP).remainingFairUse === PRO_MONTHLY_FAIR_USE);
const exhausted = { ...pro, fairUseUsed: PRO_MONTHLY_FAIR_USE };
check('ueber Fair Use: ohne Credits Quelle none', evaluateVisionScan(exhausted, AUG).source === 'none');
check('ueber Fair Use: Credits springen ein', evaluateVisionScan(addCredits(exhausted, 1), AUG).source === 'credit');

console.log('— Verbrauchsreihenfolge —');
let mixed = addCredits(setTier({ ...EMPTY_ENTITLEMENT }, TIERS.PRO), 2);
check('Freikontingent kommt vor Fair Use und Credits', evaluateVisionScan(mixed, AUG).source === 'free');
for (let i = 0; i < FREE_VISION_SCANS; i += 1) mixed = applyVisionScan(mixed, AUG);
check('dann Fair Use vor Credits', evaluateVisionScan(mixed, AUG).source === 'pro');

console.log('— Praeparate-Grenze —');
check('Free: unter der Grenze erlaubt', canAddSupplement(EMPTY_ENTITLEMENT, FREE_MAX_SUPPLEMENTS - 1).withinLimit === true);
check('Free: an der Grenze nicht mehr', canAddSupplement(EMPTY_ENTITLEMENT, FREE_MAX_SUPPLEMENTS).withinLimit === false);
check('Pro: keine Grenze', canAddSupplement(setTier(EMPTY_ENTITLEMENT, TIERS.PRO), 50).withinLimit === true);
check('bei abgeschalteter Paywall immer erlaubt', canAddSupplement(EMPTY_ENTITLEMENT, 99).allowed === true);

console.log('— Robustheit —');
check('kaputter Zustand wird normalisiert', evaluateVisionScan({ tier: 'x', freeScansUsed: -2, extraCredits: 'y' }, AUG).source === 'free');
check('applyVisionScan mutiert nicht', (() => {
  const before = { ...EMPTY_ENTITLEMENT };
  applyVisionScan(before, AUG);
  return before.freeScansUsed === 0;
})());

if (failures > 0) {
  console.error(`\n${failures} TEST(S) FEHLGESCHLAGEN`);
  process.exit(1);
}
console.log('\nALLE TESTS BESTANDEN');
