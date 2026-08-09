import {
  checkConflicts,
  checkAllConflictsForSlot,
} from '../ConflictLogic.js';

let failed = 0;
function check(name, cond, extra = '') {
  if (cond) { console.log(`  ok   ${name}`); }
  else { console.log(`  FAIL ${name} ${extra}`); failed++; }
}

// Inventory-IDs zur Referenz (siehe inventory.json):
// 2/8 Nattokinase, 10 Ester-C, 13 Zink, 14 Magnesiumcitrat, 16 Selen,
// 17 Eisen, 19 Calcium, 32 L-Arginin, 33 L-Lysin, 36 L-Tyrosin,
// 37 L-Tryptophan, 43 Flohsamenschalen, 66 5-HTP, 69 Methylenblau,
// 71 Magnesiumbisglycinat, 75 Magnesiumoxid

console.log('\n— Serotonin-Syndrom (CRITICAL, hardcodierte Paare) —');
{
  const a = checkConflicts(69, [37]);
  const crit = a.find((c) => c.type === 'conflict');
  check('Methylenblau + Tryptophan → CRITICAL', crit?.severity === 'CRITICAL', crit?.severity);
  check('Nachricht nennt Serotonin-Syndrom', /Serotonin-Syndrom/.test(crit?.message ?? ''));
}
{
  const b = checkConflicts(37, [69]);
  const crit = b.find((c) => c.type === 'conflict');
  check('Umgekehrte Richtung (Tryptophan + Methylenblau) auch CRITICAL', crit?.severity === 'CRITICAL', crit?.severity);
}
{
  const c = checkConflicts(69, [66]);
  const crit = c.find((c) => c.type === 'conflict');
  check('Methylenblau + 5-HTP → CRITICAL', crit?.severity === 'CRITICAL', crit?.severity);
}
{
  const d = checkConflicts(66, [69]);
  const crit = d.find((c) => c.type === 'conflict');
  check('Umgekehrte Richtung (5-HTP + Methylenblau) auch CRITICAL', crit?.severity === 'CRITICAL', crit?.severity);
}

console.log('\n— Direkte Konflikte: Magnesium-Formen vs. Eisen/Calcium (HIGH) —');
{
  const e = checkConflicts(14, [17]);
  const conflict = e.find((c) => c.type === 'conflict');
  check('Magnesiumcitrat + Eisen → HIGH', conflict?.severity === 'HIGH', conflict?.severity);
  check('Nachricht nennt Eisen-Aufnahme-Blockade', /Eisen-Aufnahme/.test(conflict?.message ?? ''));
}
{
  const f = checkConflicts(19, [71]);
  const conflict = f.find((c) => c.type === 'conflict');
  check('Calcium + Magnesiumbisglycinat → HIGH (symmetrisch)', conflict?.severity === 'HIGH', conflict?.severity);
}
{
  const g = checkConflicts(75, [19]);
  const conflict = g.find((c) => c.type === 'conflict');
  check('Magnesiumoxid + Calcium → HIGH', conflict?.severity === 'HIGH', conflict?.severity);
}

console.log('\n— Direkte Konflikte: Eisen + Calcium (MEDIUM, spezifische Nachricht) —');
{
  const h = checkConflicts(17, [19]);
  const conflict = h.find((c) => c.type === 'conflict');
  check('Eisen + Calcium → MEDIUM (kein Magnesium beteiligt)', conflict?.severity === 'MEDIUM', conflict?.severity);
  check('Nachricht nennt "Calcium hemmt Eisen"', /Calcium hemmt Eisen/.test(conflict?.message ?? ''));
}

console.log('\n— Aminosäure-Transporter-Konkurrenz (MEDIUM) —');
{
  const i = checkConflicts(32, [33]);
  const conflict = i.find((c) => c.type === 'conflict');
  check('L-Arginin + L-Lysin → MEDIUM', conflict?.severity === 'MEDIUM', conflict?.severity);
  check('Nachricht nennt Aminosäure-Transporter', /Aminosäure-Transporter/.test(conflict?.message ?? ''));
}
{
  const j = checkConflicts(36, [37]);
  const conflict = j.find((c) => c.type === 'conflict');
  check('L-Tyrosin + L-Tryptophan → MEDIUM', conflict?.severity === 'MEDIUM', conflict?.severity);
  check('Nachricht nennt BBB-Transport', /BBB-Transport/.test(conflict?.message ?? ''));
}

console.log('\n— Synergie (INFO) —');
{
  const k = checkConflicts(10, [17]);
  const synergy = k.find((c) => c.type === 'synergy');
  const conflict = k.find((c) => c.type === 'conflict');
  check('Vitamin C + Eisen → Synergie erkannt', synergy?.severity === 'INFO', synergy?.severity);
  check('Kein zusätzlicher Konflikt zwischen Vitamin C und Eisen', !conflict);
  check('Synergie-Nachricht positiv formuliert', /Synergie/.test(synergy?.message ?? ''));
}

console.log('\n— Tag-Konflikte —');
{
  const l = checkConflicts(69, []);
  const ssri = l.find((c) => c.type === 'tag_conflict' && c.tag === 'SSRI');
  check('Methylenblau + SSRI-Tag → CRITICAL', ssri?.severity === 'CRITICAL', ssri?.severity);
}
{
  const m = checkConflicts(17, []);
  const kaffee = m.find((c) => c.type === 'tag_conflict' && c.tag === 'Kaffee');
  const tee = m.find((c) => c.type === 'tag_conflict' && c.tag === 'Tee');
  check('Eisen + Kaffee-Tag → HIGH', kaffee?.severity === 'HIGH', kaffee?.severity);
  check('Eisen + Tee-Tag → HIGH', tee?.severity === 'HIGH', tee?.severity);
}
{
  // ALL-Tag wird bewusst uebersprungen -- das regelt AbsorptionBlocker.js separat.
  const n = checkConflicts(43, []);
  const allTagConflict = n.find((c) => c.type === 'tag_conflict' && c.tag === 'ALL');
  check('Flohsamenschalen: ALL-Tag erzeugt KEINEN tag_conflict', allTagConflict === undefined);
}

console.log('\n— Randfälle —');
{
  check('Unbekannte Target-ID → leeres Ergebnis', checkConflicts(999999, [17]).length === 0);
}
{
  // Eisen(17) hat eigene Tag-Konflikte (Kaffee/Tee), die unabhaengig von
  // activeIds immer erscheinen -- der Selbstausschluss gilt nur fuer
  // paarweise Konflikte/Synergien, nicht fuer die Tag-Pruefung.
  const selfCheck = checkConflicts(17, [17]);
  const pairwiseWithSelf = selfCheck.filter((c) => c.type === 'conflict' || c.type === 'synergy');
  check('Sich selbst als activeId → kein paarweiser Konflikt/Synergie mit sich selbst',
    pairwiseWithSelf.length === 0, JSON.stringify(pairwiseWithSelf));
}
{
  // Magnesiumcitrat(14) hat keine Tags -> bei sich selbst wirklich leeres Ergebnis
  check('Supplement ohne Tags + sich selbst als activeId → wirklich leeres Ergebnis',
    checkConflicts(14, [14]).length === 0);
}
{
  const withJunk = checkConflicts(17, [19, 999999]);
  check('Unbekannte activeId wird ignoriert statt zu crashen', withJunk.some((c) => c.targetId === 19));
}
{
  const byObject = checkConflicts({ libraryId: 17 }, [{ id: 19 }]);
  check('canonicalId löst libraryId/id aus Objekten auf', byObject.some((c) => c.type === 'conflict'));
}

console.log('\n— checkAllConflictsForSlot: Deduplizierung über mehrere Paare —');
{
  const slot = checkAllConflictsForSlot([17, 19, 14]);
  const conflicts = slot.filter((c) => c.type === 'conflict');
  check('Eisen+Calcium+Magnesiumcitrat → genau 3 Konflikt-Paare', conflicts.length === 3, conflicts.length);
  const severities = conflicts.map((c) => c.severity).sort();
  check('Enthält sowohl HIGH (Mg-Paare) als auch MEDIUM (Eisen+Calcium)',
    severities.includes('HIGH') && severities.includes('MEDIUM'), JSON.stringify(severities));
}
{
  // Duplikate über verschiedene Objektformen duerfen nicht doppelt gezaehlt werden
  const slot = checkAllConflictsForSlot([], [{ libraryId: 17 }, { id: 19 }]);
  check('Aufruf über supplements-Parameter funktioniert genau wie über ids', slot.some((c) => c.type === 'conflict'));
}
{
  const slot = checkAllConflictsForSlot([1, 72, 73]);
  check('Supplements ohne jede Wechselwirkung → leeres Ergebnis', slot.length === 0, slot.length);
}


console.log(`\n${failed === 0 ? 'ALLE TESTS BESTANDEN' : failed + ' FEHLER'}\n`);
process.exit(failed === 0 ? 0 : 1);
