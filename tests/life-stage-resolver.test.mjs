// Tests fuer LifeStageResolver.js: aus Geschlecht, Geburtsjahr und
// Zusatzangabe die Referenzgruppe ableiten. Jede Zeile der Spec-Tabelle
// plus die Grenzen.
import { EXTRA_PREGNANCY, GENDERS, ageFromBirthYear, resolveLifeStage } from '../LifeStageResolver';
import { LIFE_STAGE_IDS } from '../data/referenceValues';

let failures = 0;
function check(name, condition, extra = '') {
  if (condition) console.log(`  ok   ${name}`);
  else { failures += 1; console.error(`  FAIL ${name} ${extra}`); }
}
const TODAY = new Date('2026-08-30T12:00:00Z');
const r = (input) => resolveLifeStage(input, TODAY);
const yearFor = (age) => 2026 - age;

console.log('— Alter —');
check('Alter aus Geburtsjahr', ageFromBirthYear(1990, TODAY) === 36);
check('ungueltiges Jahr: null', ageFromBirthYear('abc', TODAY) === null && ageFromBirthYear(2030, TODAY) === null);

console.log('— Tabelle —');
check('Kind 4 bis 10', r({ gender: 'male', birthYear: yearFor(7) }).lifeStageId === 'child-4-10');
check('Jugend 11 bis 17', r({ gender: 'female', birthYear: yearFor(14) }).lifeStageId === 'teen-11-17');
check('Frau 18 bis 50 braucht Zusatzfrage', (() => { const x = r({ gender: 'female', birthYear: yearFor(30) }); return x.lifeStageId === null && x.needsExtra === 'pregnancy'; })());
check('Frau 30, nichts davon: adult-woman', r({ gender: 'female', birthYear: yearFor(30), extra: EXTRA_PREGNANCY.NONE }).lifeStageId === 'adult-woman');
check('Frau 30, schwanger: pregnancy', r({ gender: 'female', birthYear: yearFor(30), extra: EXTRA_PREGNANCY.PREGNANT }).lifeStageId === 'pregnancy');
check('Frau 30, stillend: breastfeeding', r({ gender: 'female', birthYear: yearFor(30), extra: EXTRA_PREGNANCY.BREASTFEEDING }).lifeStageId === 'breastfeeding');
check('Frau 16, schwanger moeglich (Zusatzfrage), sonst teen', (() => { const a = r({ gender: 'female', birthYear: yearFor(16) }); const b = r({ gender: 'female', birthYear: yearFor(16), extra: EXTRA_PREGNANCY.NONE }); return a.needsExtra === 'pregnancy' && b.lifeStageId === 'teen-11-17'; })());
check('Frau 14: keine Zusatzfrage, teen', (() => { const x = r({ gender: 'female', birthYear: yearFor(14) }); return x.needsExtra === null && x.lifeStageId === 'teen-11-17'; })());
check('Frau 51 bis 64: menopause, keine Zusatzfrage', (() => { const x = r({ gender: 'female', birthYear: yearFor(55) }); return x.lifeStageId === 'menopause' && x.needsExtra === null; })());
check('Frau 50: noch Zusatzfrage', r({ gender: 'female', birthYear: yearFor(50) }).needsExtra === 'pregnancy');
check('Mann 18 bis 64: adult-man', r({ gender: 'male', birthYear: yearFor(40) }).lifeStageId === 'adult-man');
check('Mann 17: teen', r({ gender: 'male', birthYear: yearFor(17) }).lifeStageId === 'teen-11-17');
check('ab 65: senior, auch Frau', r({ gender: 'female', birthYear: yearFor(65) }).lifeStageId === 'senior' && r({ gender: 'male', birthYear: yearFor(80) }).lifeStageId === 'senior');
check('Divers ab 18: Referenzfrage', (() => { const x = r({ gender: 'diverse', birthYear: yearFor(30) }); return x.lifeStageId === null && x.needsExtra === 'reference'; })());
check('Keine Angabe ab 18: Referenzfrage', r({ gender: 'unspecified', birthYear: yearFor(30) }).needsExtra === 'reference');
check('Divers mit Override: Override gilt', r({ gender: 'diverse', birthYear: yearFor(30), referenceOverride: 'adult-woman' }).lifeStageId === 'adult-woman');
check('Divers mit unbekanntem Override: faellt auf Referenzfrage zurueck', (() => { const x = r({ gender: 'diverse', birthYear: yearFor(30), referenceOverride: 'nope' }); return x.lifeStageId === null && x.needsExtra === 'reference'; })());
check('Divers unter 18: Altersgruppe ohne Frage', r({ gender: 'diverse', birthYear: yearFor(12) }).lifeStageId === 'teen-11-17');
check('Divers ab 65: senior ohne Frage', r({ gender: 'diverse', birthYear: yearFor(70) }).lifeStageId === 'senior');

console.log('— Grenzen und Flags —');
check('unter 4: tooYoung, keine Gruppe', (() => { const x = r({ gender: 'male', birthYear: yearFor(3) }); return x.tooYoung && x.lifeStageId === null; })());
check('unter 16: underage', r({ gender: 'male', birthYear: yearFor(15) }).underage === true && r({ gender: 'male', birthYear: yearFor(16) }).underage === false);
check('fehlendes Geburtsjahr: alles null', (() => { const x = r({ gender: 'male' }); return x.lifeStageId === null && x.age === null && x.needsExtra === null; })());
check('unbekanntes Geschlecht wie keine Angabe', r({ gender: 'x', birthYear: yearFor(30) }).needsExtra === 'reference');
check('jede gelieferte Gruppe existiert', ['female', 'male', 'diverse', 'unspecified'].every((g) => [5, 12, 30, 55, 70].every((age) => { const x = r({ gender: g, birthYear: yearFor(age), extra: 'none', referenceOverride: 'adult-man' }); return x.lifeStageId === null || LIFE_STAGE_IDS.includes(x.lifeStageId); })));
check('GENDERS vollstaendig', GENDERS.length === 4);

console.log('— Exakte Grenzen —');
check('4: child-4-10', r({ gender: 'male', birthYear: yearFor(4) }).lifeStageId === 'child-4-10');
check('10: child-4-10', r({ gender: 'male', birthYear: yearFor(10) }).lifeStageId === 'child-4-10');
check('11: teen-11-17', r({ gender: 'male', birthYear: yearFor(11) }).lifeStageId === 'teen-11-17');
check('17 Mann: teen-11-17', r({ gender: 'male', birthYear: yearFor(17) }).lifeStageId === 'teen-11-17');
check('18 Mann: adult-man', r({ gender: 'male', birthYear: yearFor(18) }).lifeStageId === 'adult-man');
check('15 Frau, extra none: teen-11-17', r({ gender: 'female', birthYear: yearFor(15), extra: EXTRA_PREGNANCY.NONE }).lifeStageId === 'teen-11-17');
check('15 Frau, ohne extra: needsExtra pregnancy', r({ gender: 'female', birthYear: yearFor(15) }).needsExtra === 'pregnancy');
check('51 Frau: menopause', r({ gender: 'female', birthYear: yearFor(51) }).lifeStageId === 'menopause');
check('64 Frau: menopause', r({ gender: 'female', birthYear: yearFor(64) }).lifeStageId === 'menopause');
check('64 Mann: adult-man', r({ gender: 'male', birthYear: yearFor(64) }).lifeStageId === 'adult-man');
check('65 Mann: senior', r({ gender: 'male', birthYear: yearFor(65) }).lifeStageId === 'senior');

if (failures > 0) { console.error(`\n${failures} Fehler`); process.exit(1); }
console.log('\nAlle LifeStageResolver-Tests bestanden.');
