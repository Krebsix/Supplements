# Redesign Phase 2: Website-Look und Kern-Screens — Implementierungsplan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Den sichtbaren Teil des Redesigns nachholen: Website-Typografie
und -Linien in den Tokens, Heute-Screen als Checkliste, Praeparate-Liste
als kompakte Zeilen.

**Architecture:** Task A aendert nur `theme.js` + Font-Laden in
`app/_layout.jsx` (wirkt app-weit ueber Tokens). Tasks B und C bauen je
einen Screen um, ohne neue Fachlogik-Module — bestehende Module
(`NextUp.js`, `TimingEngine.js`, Store-Aktionen) werden weiterverwendet.

**Tech Stack:** Expo/React Native, `@expo-google-fonts/space-grotesk`,
`@expo-google-fonts/ibm-plex-mono`, expo-font (useFonts), zustand,
Node-Tests (`npm test`).

**Spec:** `docs/superpowers/specs/2026-09-04-redesign-phase2-website-look.md`
(Nachtrag zu `2026-09-04-redesign-ia-und-marke.md`)

## Global Constraints

- Keine Hex-Werte in Screens/Komponenten, nur theme.js-Tokens.
- Kontrast mindestens 4,5:1 fuer Fliesstext, 3:1 fuer grosse Schrift —
  jeden neuen Farbwert nachrechnen und in `tests/color-contrast.test.mjs`
  ergaenzen, nicht schaetzen.
- Tippflaechen mindestens 44x44 pt.
- Bei Schnitt-Fonts NIE zusaetzlich `fontWeight` setzen (Android-Faux-
  Bold, dokumentierte Projektregel).
- Keine Gedankenstriche in Nutzertexten, deutsche Umlaute direkt.
- Status nie nur ueber Farbe: dokumentiert = Haken-Icon UND
  Durchstreichung, nicht nur Farbwechsel.
- Fachlogik in Module, nie in Screens; `logIntake`/`undoIntakeToday`/
  `findNextUp`/`countOpen` weiterverwenden, nichts duplizieren.
- Nach jedem Task: `npm test` (voll) + Sichtpruefung im Browser
  (Dev-Server des Worktrees, Port 8101 oder frisch starten).

---

### Task A: Website-Tokens — Fonts, Navy-Text, harte Linien

**Files:**
- Modify: `theme.js`, `app/_layout.jsx`, `package.json` (+lock),
  `tests/color-contrast.test.mjs`

**Interfaces:**
- Produces: `type.display/heading/subheading` mit `fontFamily`
  (Space-Grotesk-Schnitte, ohne fontWeight), `type.eyebrow` als
  Mono-Uppercase (IBM Plex Mono), `colors.ink = '#0b2239'`,
  `colors.inkMuted = '#44586e'`, `surfaces.card`/`listGroup` mit
  Hairline-Border. Tasks B/C konsumieren nur Tokens, keine neuen Namen
  noetig — bis auf ein neues optionales `type.eyebrowAccent` (Mono-Label
  in Akzentfarbe fuer den JETZT-Slot), das Task B nutzt.

- [ ] **Step 1: Fonts installieren**

```bash
npx expo install expo-font @expo-google-fonts/space-grotesk @expo-google-fonts/ibm-plex-mono
```

(`expo-font` ist vermutlich schon da — `npx expo install` gleicht die
Version ab, schadet nicht.)

- [ ] **Step 2: Kontrast-Test erweitern (vor der Farbaenderung)**

In `tests/color-contrast.test.mjs` ergaenzen:

```javascript
check(
  'ink (Navy) auf surface mindestens 4.5:1',
  contrastRatio(colors.ink, colors.surface) >= 4.5,
  `war ${contrastRatio(colors.ink, colors.surface).toFixed(2)}:1`
);
check(
  'ink auf canvas mindestens 4.5:1',
  contrastRatio(colors.ink, colors.canvas) >= 4.5
);
check(
  'inkMuted auf surface mindestens 4.5:1',
  contrastRatio(colors.inkMuted, colors.surface) >= 4.5,
  `war ${contrastRatio(colors.inkMuted, colors.surface).toFixed(2)}:1`
);
check(
  'inkMuted auf canvas mindestens 4.5:1',
  contrastRatio(colors.inkMuted, colors.canvas) >= 4.5
);
```

Laufen lassen: muss mit den ALTEN Werten schon gruen sein (bestaetigt
den Test), dann nach Step 3 erneut mit den neuen.

Hinweis Vorab-Rechnung (Controller, WCAG-Formel in Node): `#0b2239` auf
Weiss 16.13:1, `#44586e` auf Weiss muss der Implementer nachrechnen —
liegt er unter 4.5 auf canvas, eine Stufe abdunkeln (z. B. `#3f5266`)
und den tatsaechlich verwendeten Wert im Report dokumentieren.

- [ ] **Step 3: theme.js aendern**

```javascript
// colors:
ink: '#0b2239',        // Navy, wie Website-Text (mysuplea.com --ink)
inkMuted: '#44586e',   // Website --ink-muted (Kontrast siehe Test)
// rule bekommt einen navy-getoenten Ton statt iOS-Grau:
rule: '#dde3ea',
ruleStrong: '#c3ccd6',
```

```javascript
// Neuer fonts-Block (nach weight):
export const fonts = {
  displayBold: 'SpaceGrotesk_700Bold',
  displaySemi: 'SpaceGrotesk_600SemiBold',
  mono: 'IBMPlexMono_500Medium',
};
```

```javascript
// type-Aenderungen (fontWeight ENTFERNEN wo fontFamily gesetzt wird):
display: { fontSize: 34, lineHeight: 41, fontFamily: fonts.displayBold, letterSpacing: -0.5, color: colors.ink },
heading: { fontSize: 20, lineHeight: 25, fontFamily: fonts.displaySemi, letterSpacing: -0.2, color: colors.ink },
subheading: { fontSize: 17, lineHeight: 22, fontFamily: fonts.displaySemi, color: colors.ink },
eyebrow: {
  fontSize: 12,
  lineHeight: 18,
  fontFamily: fonts.mono,
  letterSpacing: 0.8,
  textTransform: 'uppercase',
  color: colors.inkMuted,
},
eyebrowAccent: {
  fontSize: 12,
  lineHeight: 18,
  fontFamily: fonts.mono,
  letterSpacing: 0.8,
  textTransform: 'uppercase',
  color: colors.accent,
},
```

```javascript
// surfaces: harte Linien wie die Website
card: {
  backgroundColor: colors.surface,
  borderRadius: radius.lg,
  borderWidth: border.hairline,
  borderColor: colors.rule,
  padding: space.lg,
  marginBottom: space.md,
},
listGroup: {
  backgroundColor: colors.surface,
  borderRadius: radius.lg,
  borderWidth: border.hairline,
  borderColor: colors.rule,
  overflow: 'hidden',
  marginBottom: space.lg,
},
```

Den Kommentar "Karten haben keinen Rahmen mehr" anpassen (er beschreibt
jetzt das Gegenteil) und den Schriften-Kommentar ("bewusst ohne eigene
Font-Dateien") auf den neuen Stand bringen: Headlines/Labels eigene
Schnitte, Fliesstext weiterhin System.

- [ ] **Step 4: Fonts in app/_layout.jsx laden**

`useFonts` aus `expo-font`, Schnitte aus den beiden Google-Fonts-Paketen
(`SpaceGrotesk_600SemiBold`, `SpaceGrotesk_700Bold`,
`IBMPlexMono_500Medium`). Bestehende Layout-Struktur lesen und den
Lade-Zustand so behandeln, wie das Layout andere Lade-Zustaende schon
behandelt (nicht blockierend haengen lassen; bei nicht geladenen Fonts
faellt RN auf System zurueck, ein einfaches `if (!loaded) return null`
nur, wenn das Layout so etwas schon fuer andere Ressourcen tut).

- [ ] **Step 5: npm test (voll) + Sichtpruefung**

Alle Suiten gruen (Kontrast-Test mit neuen Werten). Browser: Headlines
in Space Grotesk, Sektionslabels in Mono, Karten mit feiner Linie,
Text in Navy. Falls Space Grotesk im Web-Preview nicht laedt (expo-font
Web-Verhalten), pruefen ob ein Reload hilft; notfalls in Expo Go
verifizieren und das im Report sagen.

- [ ] **Step 6: Commit**

```bash
git add theme.js app/_layout.jsx package.json package-lock.json tests/color-contrast.test.mjs
git commit -m "feat(theme): Website-Look — Space Grotesk, Mono-Labels, Navy-Text, harte Linien"
```

---

### Task B: Heute-Screen als Checkliste

**Files:**
- Modify: `app/(tabs)/(today)/Dashboard.jsx`, i18n (`dashboard.*`-Keys
  in `i18n/de/dashboard.js` + `i18n/en/dashboard.js`)

**Interfaces:**
- Consumes: `getTodaySchedule()` (Slots mit `supplements[]`, je Eintrag
  `logged`-Flag), `getTodayProgress()` (`{done,total,pending}`),
  `findNextUp(dailySchedule)`/`countOpen` aus `NextUp.js`,
  `logIntake(id, {slotId})`, `undoIntakeToday(...)` — exakte Signatur
  von undo im Store nachlesen, `type.eyebrow`/`eyebrowAccent` aus Task A.
- Produces: keine neuen Exporte.

- [ ] **Step 1: Ist-Struktur lesen und Abriss-Liste bestaetigen**

Dashboard.jsx komplett lesen. Entfernen: Buehnen-Block (Navy-Flaeche,
DayArc, StatusBar-light-Handling via useFocusEffect), NextUp-Karte,
`summaryOpen`/`slotsOpen`-State samt Aufklapper-UI, MetricCard-Raster
(die Komponente `MetricCard` selbst nur loeschen, wenn danach ungenutzt).
Behalten: kuratierte Karten, FirstSteps/Ersteinrichtung, Verlauf-Link,
Bestand-Link, Restore-/Erinnerungs-Hinweise, Disclaimer,
Blocker-Logik (AbsorptionBlocker) und Slot-Konflikt-Hinweise — beide an
die neuen Zeitgruppen haengen, wo sie vorher an den Slot-Karten hingen.

- [ ] **Step 2: Checklisten-Rendering bauen**

Kopf:

```jsx
<Text style={styles.title}>{t('dashboard.title')}</Text>
<Text style={styles.meta}>
  {headerMeta} · <Text style={styles.metaCount}>{t('dashboard.takenCount', { done: progress.done, total: progress.total })}</Text>
</Text>
```

Je Slot in `visibleSchedule` eine Gruppe:

```jsx
<Text style={[styles.slotLabel, isNow && styles.slotLabelNow]}>
  {slotHeading(item.slot)}{isNow ? t('dashboard.nowSuffix') : ''}
</Text>
{item.supplements.map((s) => (
  <Pressable key={s.id} onPress={() => s.logged ? handleUndo(s, item.slot.id) : null} ...>
    <CheckCircle done={s.logged} />
    <View style={styles.rowText}>
      <Text style={[styles.rowTitle, s.logged && styles.rowTitleDone]}>{name}</Text>
      {dosage ? <Text style={styles.rowSub}>{dosage}</Text> : null}
    </View>
    {isNow && !s.logged ? <NehmenButton onPress={() => logIntake(s.id, { slotId: item.slot.id })} /> : null}
  </Pressable>
))}
```

Details: `slotLabel` = `type.eyebrow`, `slotLabelNow` = `eyebrowAccent`;
Zeile minHeight 44, `rowTitleDone` = `textDecorationLine:
'line-through'` + `color: colors.inkFaint` (Status zusaetzlich ueber das
gefuellte Haken-Icon, nie nur Farbe); Check-Kreis: Feather `circle` /
`check-circle`. Dokumentierte Zeile antippen = ruecknehmen, mit
Bestaetigung nur falls der Alt-Code eine hatte (nachschauen). Neue Keys:
`dashboard.takenCount` ("{done} von {total} genommen" — EINFACHE
geschweifte Klammern, i18n-Runtime nutzt Single-Brace),
`dashboard.nowSuffix` (" — JETZT" ohne Gedankenstrich: " · JETZT").
Achtung Projektregel: kein Gedankenstrich in Nutzertexten, also
" · JETZT".

- [ ] **Step 3: Aufraeumen**

Ungenutzte Styles, Imports (DayArc, Reanimated-Reste), Hilfsfunktionen
(getProgressPercent etc. nur wenn ungenutzt) entfernen. `npm test` voll.

- [ ] **Step 4: Sichtpruefung im Browser**

Onboarding frisch durchlaufen, 2-3 Praeparate mit verschiedenen Slots
anlegen, dokumentieren/ruecknehmen klicken, JETZT-Hervorhebung pruefen.

- [ ] **Step 5: Commit**

```bash
git add "app/(tabs)/(today)/Dashboard.jsx" i18n/de i18n/en
git commit -m "feat(dashboard): Heute-Screen als Checkliste mit Zeitgruppen"
```

---

### Task C: Praeparate-Liste als kompakte Zeilen

**Files:**
- Modify: `app/(tabs)/(inventory)/inventory.jsx`, ggf. i18n

**Interfaces:**
- Consumes: bestehende `active`/`archived`-Arrays, `handleArchive`,
  `handleRestore`, `updateUserSupplement` (pausieren), Filter-Chips aus
  Phase 1 (unveraendert lassen), `type.eyebrow` etc. aus Task A.

- [ ] **Step 1: Zeilen-Layout bauen**

Je Eintrag statt grosser Karte:

```jsx
<Pressable style={styles.row} onPress={() => router.push(`/AddSupplement?editId=...`)}>
  <View style={styles.iconTile}><Feather name="disc" size={18} color={colors.accent} /></View>
  <View style={styles.rowText}>
    <Text style={styles.rowTitle}>{name}</Text>
    <Text style={styles.rowSub}>{subline}</Text>
  </View>
  <Feather name="chevron-right" size={18} color={colors.inkFaint} />
</Pressable>
```

`iconTile`: 38x38, `backgroundColor: colors.accentSoft`, `borderRadius:
radius.sm`. Icon: passendes Feather-Icon (kein Emoji) — es gibt kein
Pill-Icon in Feather, Kandidaten pruefen (`disc`, `package`, `box`);
eines waehlen und im Report begruenden. Subzeile aus Dosis · Slots ·
Status (pausiert) · Nachfuell-Hinweis (faellig = eigene Zeile in
`cautionSoft`-Ton oder Badge — 44pt und "nie nur Farbe" beachten).
Zeilen in eine `listGroup` mit `listDivider` dazwischen (Website-Look:
ein Block, harte Linien) ODER Einzelzeilen mit Border — an Task A's
Tokens orientieren, eine Variante waehlen und konsistent umsetzen.

- [ ] **Step 2: Aktionen erreichbar halten**

Pausieren/Archivieren (aktiv) bzw. Wiederherstellen (Archiv) duerfen
nicht verschwinden: entweder kleine Aktionszeile unter der Zeile (wie
bisher, nur kompakter) oder als Buttons im bearbeiten-Screen. Da
`AddSupplement.jsx` (Bearbeiten) NICHT Teil dieses Tasks ist, ist die
sichere Wahl: kompakte Aktionsleiste unter der Zeile behalten (44pt).
Wiederherstellen im Archiv-Filter bleibt eine sichtbare Aktion.

- [ ] **Step 3: npm test + Sichtpruefung** (Aktiv/Archiv-Wechsel,
  Pausieren, Archivieren+Wiederherstellen, Nachfuell-Hinweis)

- [ ] **Step 4: Commit**

```bash
git add "app/(tabs)/(inventory)/inventory.jsx" i18n/de i18n/en
git commit -m "feat(inventory): kompakte Zeilen mit Icon-Kachel statt grosser Karten"
```

## Self-Review-Notiz

Task A zuerst (Tokens), B und C danach unabhaengig voneinander. Die
Screens Wissen/Mehr/Verlauf/Scan erben den Look ueber die Tokens und
werden nur per Sichtpruefung im Final-Review kontrolliert, nicht
umgebaut.
