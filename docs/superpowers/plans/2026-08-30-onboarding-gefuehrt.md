# Gefuehrtes Onboarding Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Neues neunstufiges Onboarding (Willkommen, Rechtliches, Anrede, Geschlecht, Geburtsjahr, Zusatzfrage, Routine, Konto, Fertig) mit animierten Schrittwechseln, das die Lebensphasen-Liste durch Geschlecht plus Geburtsjahr ersetzt.

**Architecture:** Fachlogik `LifeStageResolver.js` (rein, getestet) leitet die Referenzgruppe ab. `components/onboarding/OnboardingShell.jsx` traegt Fortschritt, Zurueck und die Reanimated-Uebergaenge; je Schritt eine kleine Komponente; `app/onboarding.jsx` haelt die Antworten und schliesst ab. Neue Profilfelder im Haupt-Store, Erinnerungszeiten ueber den bestehenden `useNotificationStore`.

**Tech Stack:** react-native-reanimated 4 (installiert), `expo-haptics`, `@react-native-picker/picker`, zustand, expo-router. Tests: esbuild + Node via `npm test`.

**Spec:** `docs/superpowers/specs/2026-08-30-onboarding-gefuehrt-design.md`

## Global Constraints

- Ein Knopf "Akzeptieren und weiter" fuer Nutzungsbedingungen plus Datenschutz; die Foto-Einwilligung bleibt beim ersten Scan. Nichts wird vorausgewaehlt, was eine Einwilligung waere.
- Name optional; Geschlecht und Geburtsjahr Pflicht; alles lokal, nie am Server.
- Referenzgruppe kommt NUR aus `LifeStageResolver.js`; Screens rechnen nichts.
- Animation: seitliches Gleiten 180/220 ms ease-out, Fortschritt als Spring (damping 18), Auswahl-Skalierung 0.97 mit `Haptics.selectionAsync()`, bei Reduce Motion nur Blenden. Kein Konfetti, kein Bounce.
- Keine Hex-Farben in Screens; nur Tokens. Kein Gedankenstrich in Nutzertexten (DE/EN). Kein "hilft", "empfohlen". Kommentare Deutsch, Commits Englisch.
- Bestehender i18n-Schluessel `onboarding.logoAlt` bleibt (wird in `menu.jsx` genutzt). i18n-Paritaet DE/EN.
- Wer `data/legalContent.js` aendert, laeuft `npm run build:legal`.
- Bestandsnutzerinnen (`onboardingCompletedAt` gesetzt) sehen das Onboarding nicht; neue Felder bleiben leer.

## Abweichungen von der Spec

Keine.

---

### Task 1: LifeStageResolver.js (TDD)

**Files:**
- Create: `LifeStageResolver.js`
- Test: `tests/life-stage-resolver.test.mjs`

**Interfaces:**
- Produces: `GENDERS = ['female', 'male', 'diverse', 'unspecified']`; `EXTRA_PREGNANCY = { NONE: 'none', PREGNANT: 'pregnant', BREASTFEEDING: 'breastfeeding' }`; `ageFromBirthYear(birthYear, today = new Date()) => number | null`; `resolveLifeStage({ gender, birthYear, extra, referenceOverride }, today) => { lifeStageId: string | null, needsExtra: 'pregnancy' | 'reference' | null, age: number | null, tooYoung: boolean, underage: boolean }`.

- [ ] **Step 1: Fehlschlagenden Test schreiben**

`tests/life-stage-resolver.test.mjs`:

```js
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
check('Divers unter 18: Altersgruppe ohne Frage', r({ gender: 'diverse', birthYear: yearFor(12) }).lifeStageId === 'teen-11-17');
check('Divers ab 65: senior ohne Frage', r({ gender: 'diverse', birthYear: yearFor(70) }).lifeStageId === 'senior');

console.log('— Grenzen und Flags —');
check('unter 4: tooYoung, keine Gruppe', (() => { const x = r({ gender: 'male', birthYear: yearFor(3) }); return x.tooYoung && x.lifeStageId === null; })());
check('unter 16: underage', r({ gender: 'male', birthYear: yearFor(15) }).underage === true && r({ gender: 'male', birthYear: yearFor(16) }).underage === false);
check('fehlendes Geburtsjahr: alles null', (() => { const x = r({ gender: 'male' }); return x.lifeStageId === null && x.age === null && x.needsExtra === null; })());
check('unbekanntes Geschlecht wie keine Angabe', r({ gender: 'x', birthYear: yearFor(30) }).needsExtra === 'reference');
check('jede gelieferte Gruppe existiert', ['female', 'male', 'diverse', 'unspecified'].every((g) => [5, 12, 30, 55, 70].every((age) => { const x = r({ gender: g, birthYear: yearFor(age), extra: 'none', referenceOverride: 'adult-man' }); return x.lifeStageId === null || LIFE_STAGE_IDS.includes(x.lifeStageId); })));
check('GENDERS vollstaendig', GENDERS.length === 4);

if (failures > 0) { console.error(`\n${failures} Fehler`); process.exit(1); }
console.log('\nAlle LifeStageResolver-Tests bestanden.');
```

- [ ] **Step 2: RED**

Run: `npm test 2>&1 | grep -A3 "life-stage"` → `Could not resolve "../LifeStageResolver"`.

- [ ] **Step 3: LifeStageResolver.js**

```js
/**
 * LifeStageResolver.js
 * ─────────────────────────────────────────────────────────────
 * Leitet aus Geschlecht, Geburtsjahr und einer Zusatzangabe die
 * Referenzwert-Gruppe (data/referenceValues.js) ab. Ersetzt die Wahl aus
 * acht Lebensphasen im Onboarding; die Gruppen selbst bleiben unveraendert.
 *
 * Nur Fachlogik, kein UI. Grenzfaelle sind hier, nicht im Screen:
 * Schwangerschaftsfrage nur bei Frauen von 15 bis 50, Divers und "keine
 * Angabe" fragen ab 18 nach der Referenzgruppe, unter 4 Jahren gibt es
 * keine Gruppe.
 */

export const GENDERS = ['female', 'male', 'diverse', 'unspecified'];

export const EXTRA_PREGNANCY = {
  NONE: 'none',
  PREGNANT: 'pregnant',
  BREASTFEEDING: 'breastfeeding',
};

const MIN_AGE = 4;
const ACCOUNT_MIN_AGE = 16;

export function ageFromBirthYear(birthYear, today = new Date()) {
  const year = Number(birthYear);
  const current = today.getFullYear();
  if (!Number.isInteger(year) || year < 1900 || year > current) return null;
  return current - year;
}

function ageBand(age) {
  if (age < MIN_AGE) return null;
  if (age <= 10) return 'child';
  if (age <= 17) return 'teen';
  if (age <= 64) return 'adult';
  return 'senior';
}

export function resolveLifeStage({ gender, birthYear, extra, referenceOverride } = {}, today = new Date()) {
  const age = ageFromBirthYear(birthYear, today);
  const base = { lifeStageId: null, needsExtra: null, age, tooYoung: false, underage: false };
  if (age === null) return base;

  const band = ageBand(age);
  const result = { ...base, tooYoung: band === null, underage: age < ACCOUNT_MIN_AGE };
  if (band === null) return result;
  if (band === 'child') return { ...result, lifeStageId: 'child-4-10' };
  if (band === 'senior') return { ...result, lifeStageId: 'senior' };

  const isFemale = gender === 'female';
  const isMale = gender === 'male';

  // Frauen 15 bis 50: Schwangerschaft und Stillzeit haben eigene Gruppen.
  if (isFemale && age >= 15 && age <= 50) {
    if (extra === EXTRA_PREGNANCY.PREGNANT) return { ...result, lifeStageId: 'pregnancy' };
    if (extra === EXTRA_PREGNANCY.BREASTFEEDING) return { ...result, lifeStageId: 'breastfeeding' };
    if (extra === EXTRA_PREGNANCY.NONE) {
      return { ...result, lifeStageId: band === 'teen' ? 'teen-11-17' : 'adult-woman' };
    }
    return { ...result, needsExtra: 'pregnancy' };
  }

  if (band === 'teen') return { ...result, lifeStageId: 'teen-11-17' };

  if (isFemale) return { ...result, lifeStageId: 'menopause' };
  if (isMale) return { ...result, lifeStageId: 'adult-man' };

  // Divers oder keine Angabe: Referenzwerte sind nach Geschlecht
  // differenziert, die Wahl bleibt bei der Nutzerin.
  if (referenceOverride) return { ...result, lifeStageId: referenceOverride };
  return { ...result, needsExtra: 'reference' };
}
```

- [ ] **Step 4: GREEN, Commit**

Run: `npm test` → gruen.

```bash
git add LifeStageResolver.js tests/life-stage-resolver.test.mjs
git commit -m "feat(onboarding): resolve life stage from gender and birth year"
```

---

### Task 2: Store-Felder, Abschluss-Aktion, Backup

**Files:**
- Modify: `useStore.js` (`normalizeProfile`, `INITIAL_USER_STATE`, `completeOnboarding`, `migratePersistedState`)
- Modify: `BackupManager.js` nur falls `onboarding` ins Backup soll (Entscheidung: NEIN, Onboarding-Flags sind Geraetezustand; `profile` ist bereits im Backup)
- Test: `tests/backup-manager.test.mjs` (Profilfelder), `tests/onboarding-store.test.mjs` (neu)

**Interfaces:**
- `profile.displayName: string`, `profile.gender: '' | GENDERS`, `profile.birthYear: number | null`
- `consents.termsVersion: string | null`
- `onboarding: { accountOffered: boolean, firstAction: 'scan' | 'search' | 'later' | null }` in `INITIAL_USER_STATE`
- `completeOnboarding({ lifeStageId, privacyVersion, termsVersion, profile: { displayName, gender, birthYear }, firstAction, accountOffered })`

- [ ] **Step 1: Test**

`tests/onboarding-store.test.mjs` bundelt NICHT `useStore.js` (native Module). Stattdessen exportiert `useStore.js` die reinen Helfer `normalizeProfile` und eine neue reine Funktion `applyOnboardingCompletion(state, input, now)`; der Store ruft sie. Test:

```js
import { applyOnboardingCompletion, normalizeProfile, INITIAL_USER_STATE } from '../storeLogic';
```

Dazu Task-Schritt: die reinen Teile aus `useStore.js` in `storeLogic.js` ausziehen (`normalizeProfile`, `EMPTY_PROFILE`, `INITIAL_USER_STATE`, neue `applyOnboardingCompletion`), `useStore.js` importiert sie von dort und re-exportiert `INITIAL_USER_STATE`/`EMPTY_PROFILE` (bestehende Importe bleiben gueltig). Pruefen: `INITIAL_USER_STATE` haengt an `EMPTY_ENTITLEMENT` aus `Entitlements.js` (rein) und `EMPTY_PROFILE`; beides ohne native Importe.

Testfaelle: `normalizeProfile({ displayName: '  Nadine ', gender: 'female', birthYear: '1990' })` → getrimmter Name, gender uebernommen, birthYear 1990 als Zahl; ungueltiges gender → ''; birthYear 'abc' → null; `applyOnboardingCompletion(INITIAL_USER_STATE, { lifeStageId: 'adult-woman', privacyVersion: 'p', termsVersion: 't', profile: { displayName: 'N', gender: 'female', birthYear: 1990 }, firstAction: 'scan', accountOffered: true }, new Date('2026-08-30T00:00:00Z'))` → `activeLifeStageId`, `onboardingCompletedAt` ISO, `consents.privacyVersion/termsVersion`, `profile` gemischt (bestehende Listen bleiben leer), `onboarding.firstAction/accountOffered`; fehlendes `profile` → unveraendert; `firstAction` unbekannt → 'later'.

- [ ] **Step 2: Umsetzung**

`storeLogic.js` (neu, rein): `normalizeProfile` erweitert um

```js
    displayName: typeof profile?.displayName === 'string' ? profile.displayName.trim().slice(0, 40) : '',
    gender: GENDERS.includes(profile?.gender) ? profile.gender : '',
    birthYear: (() => { const y = Number(profile?.birthYear); return Number.isInteger(y) && y >= 1900 && y <= 2100 ? y : null; })(),
```

(`GENDERS` aus `LifeStageResolver`). `INITIAL_USER_STATE` bekommt `onboarding: { accountOffered: false, firstAction: null }` und `consents: { scanUpload: null, privacyVersion: null, termsVersion: null }`.

```js
export function applyOnboardingCompletion(state, input = {}, now = new Date()) {
  const firstAction = ['scan', 'search', 'later'].includes(input.firstAction) ? input.firstAction : 'later';
  return {
    activeLifeStageId: input.lifeStageId || state.activeLifeStageId,
    onboardingCompletedAt: now.toISOString(),
    consents: { ...state.consents, privacyVersion: input.privacyVersion || null, termsVersion: input.termsVersion || null },
    profile: input.profile ? normalizeProfile({ ...state.profile, ...input.profile }) : state.profile,
    onboarding: { accountOffered: Boolean(input.accountOffered), firstAction },
  };
}
```

`useStore.js`: `completeOnboarding: (input) => set((state) => applyOnboardingCompletion(state, input))`. `migratePersistedState`: `onboarding: { ...INITIAL_USER_STATE.onboarding, ...(state.onboarding || {}) }`, `consents` mit `termsVersion` Default. `BACKUP_DATA_FIELDS` unveraendert (profile ist drin; `onboarding` bewusst nicht).

`tests/backup-manager.test.mjs`: ein Check, dass `buildBackupPayload` das Profil mit `displayName`/`gender`/`birthYear` traegt.

- [ ] **Step 3: Suite, Commit**

```bash
git add storeLogic.js useStore.js tests/onboarding-store.test.mjs tests/backup-manager.test.mjs
git commit -m "feat(onboarding): profile fields, terms consent and onboarding flags in store"
```

---

### Task 3: OnboardingShell und die Frage-Schritte 1 bis 6

**Files:**
- Modify: `package.json` (`expo-haptics`, `@react-native-picker/picker`)
- Create: `components/onboarding/OnboardingShell.jsx`, `components/onboarding/ChoiceCard.jsx`, `components/onboarding/StepWelcome.jsx`, `StepLegal.jsx`, `StepName.jsx`, `StepGender.jsx`, `StepBirthYear.jsx`, `StepExtra.jsx`
- Create: `i18n/de/onboarding.js` (neu geschrieben, `onboarding.logoAlt` bleibt), `i18n/en/onboarding.js`

- [ ] **Step 1: Pakete**

Run: `npx expo install expo-haptics @react-native-picker/picker`

- [ ] **Step 2: OnboardingShell.jsx**

Props: `{ step, total, canGoBack, onBack, children, footer }`. Aufbau: SafeArea, Kopfzeile mit Zurueck-Pfeil (Feather `chevron-left`, nur wenn `canGoBack`) und Fortschrittsbalken (`Animated.View`, Breite `withSpring(step / total, { damping: 18, stiffness: 120 })`), animierter Inhalt, feste Fusszeile fuer die Knoepfe (`footer`).

Uebergang: Shell haelt `direction` ('forward' | 'back') und rendert den Inhalt mit `entering`/`exiting` aus Reanimated: `SlideInRight.duration(220).easing(Easing.out(Easing.cubic))` bzw. `SlideInLeft`, `exiting` `FadeOutLeft.duration(180)` bzw. `FadeOutRight`; der Inhalt bekommt `key={step}`, damit Reanimated die Layout-Animation auf den Wechsel anwendet. `useReducedMotion()` aus Reanimated: wenn true, `FadeIn.duration(150)`/`FadeOut.duration(120)` statt Slides.

`ChoiceCard.jsx`: Pressable-Karte (Titel, optionaler Untertitel, Haekchen bei `selected`), Skalierung `withTiming(0.97, { duration: 90 })` beim PressIn, zurueck beim PressOut, `Haptics.selectionAsync()` beim Press (in try/catch, Haptik ist nicht ueberall verfuegbar). Nur Tokens.

- [ ] **Step 3: Schritte**

Jeder Schritt ist eine Funktion mit Props `{ value, onChange, onNext, onSkip?, t }` und rendert nur Inhalt; die Knoepfe kommen ueber die Shell-Fusszeile (`footer`) aus `app/onboarding.jsx`, damit die Weiter-Leiste fest steht.

- `StepWelcome`: Logo (wie heute), Eyebrow, Titel `onboarding.welcome.title`, Text `onboarding.welcome.text`.
- `StepLegal`: Titel, Satz mit zwei Links (`/terms`, `/privacy`, beide ausserhalb des Gates erreichbar), kein Haken; der Knopf in der Fusszeile heisst `onboarding.legal.accept`.
- `StepName`: `TextInput` (autoFocus, `textContentType="givenName"`, max 40), Hinweis `onboarding.name.hint`.
- `StepGender`: vier `ChoiceCard` (female, male, diverse, unspecified), Text `onboarding.gender.why`.
- `StepBirthYear`: `Picker` aus `@react-native-picker/picker`, Jahre von aktuellem Jahr minus 100 bis aktuelles Jahr, Vorwahl 1990, Text `onboarding.birthYear.why`. Unter dem Rad: bei `tooYoung` roter Hinweis `onboarding.birthYear.tooYoung`; bei `underage` Hinweis `onboarding.birthYear.underage` (Farbe `colors.caution`).
- `StepExtra`: je nach `needsExtra`: 'pregnancy' → drei `ChoiceCard` (none, pregnant, breastfeeding) mit Text `onboarding.extra.pregnancy.why`; 'reference' → `LifeStagePicker` (bestehend) mit Text `onboarding.extra.reference.why`.

- [ ] **Step 4: i18n DE (vollstaendig, EN spiegeln)**

```js
export default {
  'onboarding.logoAlt': 'MySuplea',
  'onboarding.back': 'Zurück',
  'onboarding.next': 'Weiter',
  'onboarding.skip': 'Überspringen',
  'onboarding.progress': 'Schritt {step} von {total}',

  'onboarding.welcome.eyebrow': 'Willkommen',
  'onboarding.welcome.title': 'MySuplea ordnet, was du nimmst.',
  'onboarding.welcome.text': 'Keine Empfehlungen, keine Werbung. Deine Daten bleiben auf deinem Gerät.',
  'onboarding.welcome.start': 'Los geht\'s',

  'onboarding.legal.title': 'Bevor es losgeht',
  'onboarding.legal.text': 'Die App ordnet ein und dokumentiert. Sie berät nicht, empfiehlt keine Dosierungen und ersetzt keine ärztliche Einschätzung.',
  'onboarding.legal.consent': 'Ich akzeptiere die {terms} und habe die {privacy} gelesen.',
  'onboarding.legal.termsLink': 'Nutzungsbedingungen',
  'onboarding.legal.privacyLink': 'Datenschutzerklärung',
  'onboarding.legal.accept': 'Akzeptieren und weiter',

  'onboarding.name.title': 'Wie sollen wir dich ansprechen?',
  'onboarding.name.field': 'Vorname',
  'onboarding.name.hint': 'Nur für die Anrede in der App. Bleibt auf deinem Gerät.',

  'onboarding.gender.title': 'Dein Geschlecht',
  'onboarding.gender.why': 'Referenzwerte unterscheiden sich zwischen Frauen und Männern, deshalb fragen wir.',
  'onboarding.gender.female': 'Frau',
  'onboarding.gender.male': 'Mann',
  'onboarding.gender.diverse': 'Divers',
  'onboarding.gender.unspecified': 'Keine Angabe',

  'onboarding.birthYear.title': 'Dein Geburtsjahr',
  'onboarding.birthYear.why': 'Obergrenzen hängen vom Alter ab.',
  'onboarding.birthYear.tooYoung': 'Die App ist für Kinder unter 4 Jahren nicht ausgelegt.',
  'onboarding.birthYear.underage': 'Unter 16: Bitte lass ein Elternteil die App einrichten. Ein Konto ist erst ab 16 möglich.',

  'onboarding.extra.pregnancy.title': 'Trifft gerade etwas davon zu?',
  'onboarding.extra.pregnancy.why': 'In Schwangerschaft und Stillzeit gelten andere Referenzwerte und einige Hinweise.',
  'onboarding.extra.pregnant': 'Schwanger',
  'onboarding.extra.breastfeeding': 'Stillend',
  'onboarding.extra.none': 'Nichts davon',
  'onboarding.extra.reference.title': 'Welche Referenzwerte sollen gelten?',
  'onboarding.extra.reference.why': 'Die veröffentlichten Referenzwerte sind nach Gruppen aufgeteilt. Du kannst die Wahl jederzeit in den Einstellungen ändern.',

  'onboarding.routine.title': 'Deine Routine',
  'onboarding.routine.text': 'Wann nimmst du meistens etwas? Zeiten lassen sich später ändern.',
  'onboarding.routine.morning': 'Morgens',
  'onboarding.routine.midday': 'Mittags',
  'onboarding.routine.evening': 'Abends',
  'onboarding.routine.reminders': 'Erinnerungen',
  'onboarding.routine.remindersHint': 'Lokal auf deinem Gerät, kein Server.',
  'onboarding.routine.permissionDenied': 'Erinnerungen sind aus. In den Systemeinstellungen änderbar.',

  'onboarding.first.title': 'Dein erstes Präparat',
  'onboarding.first.text': 'Scanne das Etikett oder suche den Wirkstoff. Oder später, der Tagesplan wartet.',
  'onboarding.first.scan': 'Scannen',
  'onboarding.first.search': 'Suchen',
  'onboarding.first.later': 'Später',

  'onboarding.account.title': 'Sichern?',
  'onboarding.account.text': 'Mit Konto kannst du ein Backup anlegen und später mehrere Geräte nutzen. Die App funktioniert auch ohne.',
  'onboarding.account.create': 'Konto anlegen',
  'onboarding.account.later': 'Später ohne Konto',

  'onboarding.done.title': 'Fertig, {name}.',
  'onboarding.done.titleNoName': 'Fertig.',
  'onboarding.done.text': 'Dein Tagesplan wartet.',
  'onboarding.done.go': 'Zum Tagesplan',
};
```

EN mit denselben Schluesseln und Platzhaltern (`{step}`, `{total}`, `{terms}`, `{privacy}`, `{name}`). Der bisherige Katalog wird ersetzt; `onboarding.logoAlt` bleibt.

- [ ] **Step 5: Syntax-Check, Suite, Commit**

Run: esbuild `--loader:.jsx=jsx` ueber alle neuen Komponenten; `npm test` gruen (i18n-Paritaet).

```bash
git add package.json package-lock.json components/onboarding i18n/de/onboarding.js i18n/en/onboarding.js
git commit -m "feat(onboarding): shell with animated steps and the six question steps"
```

---

### Task 4: Routine, Konto, Fertig und die Schrittfolge in app/onboarding.jsx

**Files:**
- Create: `components/onboarding/StepRoutineTimes.jsx`, `StepRoutineFirst.jsx`, `StepAccount.jsx`, `StepDone.jsx`
- Modify: `app/onboarding.jsx` (komplett neu), `app/_layout.jsx` (Weiterleitung nach Abschluss)

**Interfaces:**
- Consumes: `resolveLifeStage`, `completeOnboarding`, `useNotificationStore` (`slotTimes`, `setSlotTime`, `notificationsEnabled`, `setNotificationsEnabled`, `checkAndRequestPermission`), `useAccountStore.status`.

- [ ] **Step 1: Schritte**

- `StepRoutineTimes`: drei Zeilen (morning, midday, evening) mit Uhrzeit aus `slotTimes`; Antippen oeffnet `DateTimePicker` (`@react-native-community/datetimepicker` per `npx expo install`, Modus `time`, iOS als Spinner im Modal, Android nativer Dialog); Aenderung → `setSlotTime(slotId, 'HH:MM')`. Schalter "Erinnerungen" (`Switch`) an `notificationsEnabled`.
- `StepRoutineFirst`: drei `ChoiceCard` (scan, search, later) mit Feather-Icons `camera`, `search`, `clock`.
- `StepAccount`: Text; die Fusszeile zeigt zwei Knoepfe, "Später ohne Konto" als Primaerknopf (vorausgewaehlt im Sinne der Spec), "Konto anlegen" als Quiet-Button.
- `StepDone`: Titel mit Name oder ohne, Text, Logo klein.

- [ ] **Step 2: app/onboarding.jsx**

Zustand: `answers = { displayName, gender, birthYear: 1990, extra, referenceOverride, firstAction, accountChoice }`, `stepIndex`. Schrittliste wird aus den Antworten berechnet (Funktion `buildSteps(answers, resolved)`): `['welcome','legal','name','gender','birthYear', ...(resolved.needsExtra ? ['extra'] : []), 'routineTimes','routineFirst', ...(resolved.underage ? [] : ['account']), 'done']`. `resolved = resolveLifeStage(answers)` bei jeder Aenderung. Fortschritt = Index in dieser Liste.

Weiter-Logik je Schritt: `welcome` → weiter; `legal` → weiter; `name` → weiter oder skip (leer); `gender` → nur mit Auswahl; `birthYear` → nur wenn `!resolved.tooYoung`; `extra` → nur mit Auswahl; `routineTimes` → wenn Schalter an: `await checkAndRequestPermission()`, bei false `setNotificationsEnabled(false)` und Hinweis, dann weiter; `routineFirst` → nur mit Auswahl; `account` → Wahl merken; `done` → `finish()`.

`finish()`:

```js
completeOnboarding({
  lifeStageId: resolved.lifeStageId,
  privacyVersion: PRIVACY_VERSION,
  termsVersion: TERMS_VERSION,
  profile: { displayName: answers.displayName, gender: answers.gender, birthYear: answers.birthYear },
  firstAction: answers.firstAction,
  accountOffered: !resolved.underage,
});
const target = answers.accountChoice === 'create' ? '/account'
  : answers.firstAction === 'scan' ? '/scanner'
  : answers.firstAction === 'search' ? '/search'
  : '/Dashboard';
router.replace(target);
```

Zurueck: `stepIndex - 1`, nicht unter 2 (Legal kann nicht zurueck zu Welcome, Welcome hat keinen Zurueck).

`app/_layout.jsx`: keine Aenderung noetig, das Gate haengt an `onboardingCompletedAt`; pruefen, dass `router.replace('/account')` nach dem Gate-Wechsel funktioniert (Screen liegt in `(tabs)/(more)`), sonst `router.replace('/(tabs)/(more)/account')`.

- [ ] **Step 3: Geraetetest (Nadine) und Commit**

Durchlauf als Frau 1990 (Zusatzfrage), Mann 1960 (keine Zusatzfrage), Kind 2015 (Elternhinweis, kein Konto-Schritt), Zurueck in jedem Schritt, Push verweigert, Reduce Motion an. Abschluss mit "Scannen" landet im Scanner.

```bash
git add components/onboarding app/onboarding.jsx package.json package-lock.json
git commit -m "feat(onboarding): routine, account offer, completion and step flow"
```

---

### Task 5: Anrede im Tagesplan, Felder im Gesundheitsprofil, Menue-Umbenennung

**Files:**
- Modify: `app/(tabs)/(today)/Dashboard.jsx` (Begruessung), `i18n/de/dashboard.js`, `i18n/en/dashboard.js`
- Modify: `app/(tabs)/(more)/profile.jsx`, `i18n/de/profile.js`, `i18n/en/profile.js`, `i18n/de/home.js`, `i18n/en/home.js`, `i18n/de/common.js`, `i18n/en/common.js`
- Modify: `app/(tabs)/(more)/menu.jsx` (Kopfkarte Konto oben, Konto-Zeile unten entfaellt)

- [ ] **Step 1: Begruessung**

Dashboard-Kopf: `t(displayName ? 'dashboard.greetingName' : 'dashboard.greeting', { name })` mit Tageszeit: `dashboard.greeting.morning/day/evening` ("Guten Morgen", "Hallo", "Guten Abend") aus der Stunde. Kein Logik-Modul noetig, drei Zeitfenster sind Anzeige.

- [ ] **Step 2: Gesundheitsprofil**

`profile.jsx`: neue Karte oben "Über dich": Vorname (TextInput), Geschlecht (vier Chips), Geburtsjahr (Picker), jeweils `updateProfile({...})`. Hinweis, dass die Referenzgruppe in den Einstellungen bleibt. Umbenennung: `nav.profile` → "Gesundheitsprofil" (DE) / "Health profile" (EN), `home.nav.profile.title` entsprechend.

- [ ] **Step 3: Kopfkarte im Menue**

`menu.jsx`: ueber dem Marken-Block eine Karte: nicht angemeldet: Feather `user`, `home.account.cta` ("Konto anlegen oder anmelden"), `home.account.ctaSub` ("Für Backup und Sync. Die App funktioniert auch ohne."); angemeldet: E-Mail, Statuszeile aus `usePurchaseStore.status` (Free/Pro), Pfeil. Tippen → `/account`. Die bisherige Konto-Zeile in der App-Gruppe entfernen. Neue i18n-Schluessel in `home.js` DE/EN.

- [ ] **Step 4: Suite, Commit**

```bash
git add app/\(tabs\)/\(today\)/Dashboard.jsx app/\(tabs\)/\(more\)/profile.jsx app/\(tabs\)/\(more\)/menu.jsx i18n
git commit -m "feat(onboarding): greeting by name, profile fields, account header card"
```

---

### Task 6: Rechtstext und Doku

**Files:**
- Modify: `data/legalContent.js` (Absatz "Welche Daten lokal gespeichert werden" um Vorname, Geschlecht, Geburtsjahr; `PRIVACY_VERSION = '2026-08-31'`), `web/*` (build:legal), `CLAUDE.md`

- [ ] **Step 1: Rechtstext**

DE: nach "dein persönliches Profil (" die Aufzaehlung um "Vorname, Geschlecht, Geburtsjahr, " ergaenzen; EN analog "first name, gender, year of birth, ". `npm run build:legal`.

- [ ] **Step 2: CLAUDE.md**

Fachlogik-Tabelle: `LifeStageResolver.js`, `storeLogic.js`. Baum: `components/onboarding/`. Abschnitt "Datenhaltung": neue Profilfelder lokal; `onboarding`-Flags sind Geraetezustand, nicht im Backup. Abschnitt "Design": Onboarding-Animationsregeln (ein Satz).

- [ ] **Step 3: Suite, Commit**

```bash
git add data/legalContent.js web/ CLAUDE.md
git commit -m "docs: local profile fields in privacy statement, onboarding in project docs"
```

---

## Offen nach diesem Plan

- Geraetetest der Animation auf einem aelteren Android-Geraet.
- Konto-Schritt fuehrt in den bestehenden Konto-Screen; Sign in with Apple weiterhin Nachtrag.
