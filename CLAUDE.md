# CLAUDE.md

Guidance fuer Claude Code (claude.ai/code) in diesem Repo.

---

## Projektziel

**Supplements** — Expo/React-Native-App zur Einnahme-Planung von
Nahrungsergaenzungsmitteln. Ordnet Praeparate in Tages-Slots ein, warnt vor
Wechselwirkungen, verwaltet Kur-Zyklen und erinnert per Push.

Eigenstaendiges Projekt. Kein Bezug zu FHK oder SchulHub.

Sprache: Deutsch (Oberflaeche und Code-Kommentare).

---

## Befehle

```bash
npm start          # Expo Dev-Server
npm run android    # Android
npm run ios        # iOS
npm test           # Logik-Tests (Matching, Referenzwerte, Datenintegritaet)
```

`npm test` buendelt `tests/substance-logic.test.mjs` mit esbuild und laeuft in
Node — noetig, weil die Module ohne Dateiendungen importieren (Metro-Konvention).
Kein Linter konfiguriert.

---

## Architektur

Routing ueber **expo-router** (dateibasiert), State ueber **zustand**,
Styling ueber **nativewind/tailwind**.

```
app/                       Routen (expo-router)
├── index.jsx              Einstieg
├── Dashboard.jsx          Tagesuebersicht
├── AddSupplement.jsx      Anlegen/Bearbeiten
├── scanner.jsx            Kamera-Erfassung (expo-camera)
├── results.jsx            Scan-Ergebnis pruefen
├── search.jsx, history.jsx, settings.jsx
└── _layout.jsx

components/                AppHeader, FeatureCard, PrimaryButton,
                           ScreenContainer, StatusBadge, SupplementResultCard

useStore.js                Hauptzustand (zustand + AsyncStorage)
useNotificationStore.js    Benachrichtigungs-Zustand
```

### Fachlogik — liegt bewusst ausserhalb der UI

| Datei | Aufgabe |
|---|---|
| `TimingEngine.js` | Tages-Slots, ordnet Supplements ein |
| `ConflictLogic.js` | Regelwerk fuer Konflikte und Synergien |
| `AbsorptionBlocker.js` | 2h-Globalsperre nach Flohsamenschalen (ID 43) |
| `CureManager.js` | Kur-Zyklen: `cycle` (z. B. 21/7) und `stepped` (Dosis-Stufen) |
| `SupplementResearchLogic.js` | Aeltere Mini-Wissensdatenbank (Default-Slot, Hinweis) |
| `SubstanceMatcher.js` | Ordnet Etikettentexte Substanzen und chemischen Formen zu |
| `ReferenceCheck.js` | Vergleicht Mengen mit Referenzwerten je Lebensphase |
| `NotificationScheduler.js` | Planung der Push-Erinnerungen |

### Wirkstoff-Datenbank (`data/`)

| Datei | Inhalt |
|---|---|
| `data/substances.js` | Kanonische Wirkstoffe: Synonyme, chemische Formen mit Bioverfuegbarkeit, Anwendungsgebiete, Warnhinweise |
| `data/referenceValues.js` | Referenzwerte und Obergrenzen (UL) je Lebensphase — 8 Gruppen von Kind bis 65+ |

Bewusst als versioniertes JS-Modul im Repo, nicht in einer Datenbank:
Katalogwissen aendert sich selten, die App bleibt offline-faehig, und jede
Aenderung an einem Referenzwert ist ueber Git nachvollziehbar.

**Trennung beachten:** `inventory.json` = was die Nutzerin besitzt.
`data/substances.js` = was ein Wirkstoff ist. Nicht vermischen.

**Regel aus dem Code selbst** (`ConflictLogic.js`): *„Logik NIEMALS in
UI-Komponenten!"* Neue Regeln gehoeren in diese Module, nicht in Screens.

---

## Branch-Lage

**Der Arbeitsbranch ist `phase-2s-scan-data-integrity-traceability`, nicht `main`.**
Die Entwicklung laeuft in einer langen Kette von `phase-*`-Branches; `main` liegt
weit zurueck. Alle 23 Branches sind auf GitHub.

Vor dem Anlegen eines neuen Branches pruefen, welcher der aktuelle Kopf ist —
nicht blind von `main` abzweigen.

---

## Datenhaltung

Alles lokal auf dem Geraet: **zustand + AsyncStorage**, kein Server, keine Datenbank.
Es gibt keine Synchronisation und kein Backup. Ein Geraetewechsel oder das
Loeschen der App bedeutet Datenverlust.

`inventory.json` und `data/mockScanResult.js` sind statische Beispieldaten.

---

## Harte Regeln

- Fachlogik in die Module oben, nie in Screens.
- **Keine erfundenen Werte.** Nicht erkannte Dosierung oder Einheit bleiben leer und
  werden als fehlend gespeichert — frueher wurden sie still auf `'1'` bzw. `'Kapsel'`
  gesetzt, was wie ein erkannter Wert aussah. Das war ein Bug, siehe Commit
  `6bd60b6`.
- Scan-Ergebnisse tragen `analysisMode` (`'mock'`, `'demo-fallback'`, `'vision'`
  fuer die Claude-Vision-Auswertung, `'barcode-off'` fuer Open-Food-Facts-Treffer)
  und eine `captureSummary`, damit nachvollziehbar ist, woher ein Eintrag stammt.
- Echte Scan-Analyse: `ScanAnalyzer.js` (App) → Supabase Edge Function
  `supabase/functions/analyze-supplement` (Claude Vision, Structured Output).
  Der `ANTHROPIC_API_KEY` liegt NUR als Supabase-Secret, nie in der App.
  Endpoint-Konfiguration in `scanConfig.js` (leere URL = Mock-Fallback).
- Barcode-Pfad: `BarcodeLookup.js` fragt Open Food Facts ab (kein Key noetig).
- Keine gesundheitlichen Empfehlungen im Ausgabetext — die App ordnet Zeitpunkte und
  Konflikte, sie beraet nicht. Konkret: **Referenzwerte anzeigen statt Dosierungen
  empfehlen** ("enthaelt 400 mg, Obergrenze liegt bei 250 mg"), Anwendungsgebiete
  **deskriptiv** formulieren ("wird eingesetzt bei"), nie praeskriptiv. Das haelt die
  App ausserhalb der Medizinprodukte-Regulierung (MDR) und der Health-Claims-Verordnung.
- **Keine Herstellernamen und keine Qualitaets-Rankings von Marken.** Qualitaet wird
  ueber pruefbare Zertifizierungen abgebildet, nicht ueber Markenbewertungen —
  rechtlich unangreifbar und offen fuer spaetere Werbepartnerschaften.
- Deutsche Code-Kommentare beibehalten.
