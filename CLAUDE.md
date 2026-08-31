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
npx eas build --profile development --platform ios   # Development Build (Kauf-SDK), braucht eas login
```

`npm test` buendelt `tests/substance-logic.test.mjs` mit esbuild und laeuft in
Node — noetig, weil die Module ohne Dateiendungen importieren (Metro-Konvention).
Kein Linter konfiguriert.

---

## Architektur

Routing ueber **expo-router** (dateibasiert), State ueber **zustand**,
Styling ueber StyleSheet + Design-Tokens (theme.js).

```
app/
├── _layout.jsx            Root-Stack: Onboarding-Gate (Stack.Protected),
│                          AddSupplement-Modal, Rechts-Screens, Verdrahtung
│                          der Erinnerungen
├── index.jsx              Redirect auf /Dashboard
├── onboarding.jsx         Erster Start: Lebensphase + Datenschutz-Kenntnisnahme
├── privacy.jsx            Datenschutzerklaerung (ausserhalb des Gates lesbar)
├── imprint.jsx            Impressum (Betreiberdaten: data/legalContent.js)
├── AddSupplement.jsx      Anlegen/Bearbeiten (Modal, inkl. Kur-Zyklus)
├── auth/callback.jsx      Ziel der Konto-Mails (Deep Link)
├── paywall.jsx            Kauf-Screen (Abo + Credits), rendert ueber PurchaseLogic
└── (tabs)/                Fuenf echte Router-Tabs, je eigener Stack:
    ├── (today)/           Dashboard.jsx, history.jsx
    ├── (discover)/        search.jsx
    ├── (scan)/            scanner.jsx, results.jsx
    ├── (analysis)/        analysis.jsx, outcome.jsx
    └── (more)/            menu.jsx (Hub), profile.jsx, lab.jsx, export.jsx,
                           notifications.jsx, settings.jsx, account.jsx,
                           account-recovery.jsx, account-reset.jsx,
                           subscription.jsx

components/                StatusBadge, SupplementResultCard, LifeStagePicker,
                           LanguagePicker, SubstanceInsightCard, ComplaintCard,
                           CertificationPanel, LegalSections, navigationTheme
components/onboarding/     OnboardingShell (Fortschritt, animierte Schritte),
                           ChoiceCard, Step*

useStore.js                Hauptzustand (zustand, verschluesselt via secureStorage.js)
useNotificationStore.js    Erinnerungs-Zustand + refreshNotificationSchedule()
secureStorage.js           AES-256-Adapter, Schluessel im OS-Schluesselbund
BackupManager.js           Voll-Export/-Import als JSON (Art. 15/20 DSGVO)
```

Dashboard.jsx folgt dem Arbeitsfluss Als-Naechstes → Zusammenfassung → Rest:
Die Als-Naechstes-Karte (`NextUp.js`) steht zuerst, Kennzahlen stehen hinter
einer Zeile mit Aufklapper, Slot-Karten und Bestand folgen danach.

### Fachlogik — liegt bewusst ausserhalb der UI

| Datei | Aufgabe |
|---|---|
| `TimingEngine.js` | Tages-Slots, ordnet Supplements ein |
| `SlotSuggestion.js` | Vorschlag des Einnahmezeitpunkts fuer ein neues Praeparat, nur aus belegten Regeln (INTAKE_GUIDANCE, fatSoluble), plus Ableitung der Slots aus der Haeufigkeit 1x/2x/3x. Ohne Regel Standard morgens mit `reason: null` |
| `ConflictLogic.js` | Regelwerk fuer Konflikte und Synergien (haengt am Beispiel-Inventar) |
| `InteractionCheck.js` | Wechselwirkungen und Einnahme-Hinweise auf Ebene der kanonischen Substanzen (`data/interactions.js`): Paar-Regeln mit Severity und Quelle, Einnahme-Hinweise (nuechtern, viel trinken, Tageszeit). UI-Verdrahtung noch offen |
| `AbsorptionBlocker.js` | 2h-Globalsperre nach Flohsamenschalen (ID 43) |
| `CureManager.js` | Kur-Zyklen: `cycle` (z. B. 21/7) und `stepped` (Dosis-Stufen) |
| `SupplementResearchLogic.js` | Aeltere Mini-Wissensdatenbank (Default-Slot, Hinweis) |
| `SubstanceMatcher.js` | Ordnet Etikettentexte Substanzen und chemischen Formen zu |
| `DoseNormalizer.js` | Entscheidet, ob eine Menge die Verbindung oder das Element meint, und rechnet nur im ersten Fall herunter |
| `ReferenceCheck.js` | Vergleicht Mengen mit Referenzwerten je Lebensphase, sammelt Lebensphasen-Hinweise |
| `StackAnalyzer.js` | Summiert Wirkstoffe ueber ALLE Produkte des Bestands und prueft die Tagessumme gegen Obergrenzen |
| `ComplaintSearch.js` | Beschwerdesuche: findet Beschwerdebilder aus Alltagssprache und verknuepft sie mit dem Bestand |
| `ProfileCheck.js` | Verknuepft das persoenliche Profil (Medikamentengruppen) mit dem Bestand und zitiert die belegten Hinweise |
| `OutcomeTracker.js` | Wirkungskontrolle: Ausgangswert, Verlauf, Einnahmetreue — und die Stoerfaktoren, die gegen eine Zuordnung sprechen |
| `LabValues.js` | Laborwerte erfassen und im Verlauf zeigen. Bewertet NICHT — Referenzbereiche kommen aus dem Befund |
| `ExportBuilder.js` | Bericht fuer Praxis/Apotheke als Markdown. Abschnitte waehlbar (Datensparsamkeit) |
| `CostAnalyzer.js` | Kosten je Produkt aus TATSAECHLICHEM Verbrauch, plus die Verbindung zur Wirkungskontrolle (was lief nie ueberprueft mit) |
| `NotificationScheduler.js` | Planung der Push-Erinnerungen |
| `AccountCrypto.js` | Schluesselableitung (scrypt), Umschlaege (AES-GCM), Recovery-Key. Reine Kryptografie, randomBytes injiziert |
| `AccountLogic.js` | Konto-Ablaeufe gegen Supabase Auth mit uebergebenem Client: Signup, Login, Reset, Loeschung. Passwort geht nur an Supabase Auth (Hash); abgeleiteter Schluessel, Datenschluessel und Recovery-Key nie Richtung Netz |
| `AccountStore.js` | zustand-Factory fuer den Kontostand, getrennt vom Haupt-Store; `useAccountStore.js` bindet die echten Abhaengigkeiten |
| `CloudBackup.js` | Verschluesselter Stand je Konto: Rundtrip zwischen Haupt-Store-Zustand und Ciphertext (AES-256-GCM ueber `AccountCrypto.js`), Login-Entscheidung (`decideOnLogin`: none/upload/restore/ask) und Zeitformat fuer die Oberflaeche. Rein, ohne Store und Netz |
| `CloudBackupStore.js` / `useCloudBackupStore.js` | zustand-Factory fuer das Cloud-Backup, getrennt vom Haupt-Store: buendelt Aenderungen zu einem verzoegerten, gebuendelten Upload (`createCoalescedRunner`), fuehrt den Login-Check aus und haelt den Dialog fuer widerspruechliche Staende (`pendingDecision`); `useCloudBackupStore.js` bindet die echten Abhaengigkeiten |
| `PurchaseLogic.js` | Kaufschicht ohne UI, das SDK wird injiziert (nie direkt importiert). Kauf-Rundtrip, Wiederherstellen, logIn/logOut bei Session-Wechsel, Uebersetzung des RevenueCat-Kundenstatus in einen der sieben App-Status |
| `PurchaseStore.js` / `usePurchaseStore.js` | zustand-Factory fuer den Kaufstatus, getrennt vom Haupt-Store; spiegelt den Tier-Wechsel per `applyPurchaseStatus` in `Entitlements.js`. `usePurchaseStore.js` bindet die echten Abhaengigkeiten |
| `purchaseSdk.js` | Laedt `react-native-purchases` optional. In Expo Go fehlt das native Modul, dann liefert es `null` statt abzustuerzen |
| `LifeStageResolver.js` | Leitet aus Geschlecht, Geburtsjahr und Zusatzangabe die Referenzgruppe ab; Grenzfaelle getestet |
| `storeLogic.js` | Reine Store-Helfer (normalizeProfile, INITIAL_USER_STATE, applyOnboardingCompletion), in Node testbar; useStore.js re-exportiert |

### Wirkstoff-Datenbank (`data/`)

| Datei | Inhalt |
|---|---|
| `data/substances.js` | Kanonische Wirkstoffe: Synonyme, chemische Formen mit Bioverfuegbarkeit, Anwendungsgebiete, Warnhinweise |
| `data/referenceValues.js` | Referenzwerte und Obergrenzen (UL) je Lebensphase — 8 Gruppen von Kind bis 65+ |
| `data/lifeStageAdvisories.js` | Was in einer bestimmten Lebensphase gilt (z. B. Retinol in der Schwangerschaft). Severity: `contraindicated`, `medical`, `attention`, `increased` |
| `data/certifications.js` | Pruefsiegel mit Geltungsbereich. Das Feld `scope` sagt, was ein Siegel NICHT abdeckt — bewusst so |
| `data/elementalFractions.js` | Massenanteil des Elements in einer Verbindung (500 mg Magnesiumcitrat = rund 81 mg Magnesium). Stoechiometrie mit Summenformel als Beleg |
| `data/outcomeMetrics.js` | Zielgroessen der Wirkungskontrolle (5er-Skala). `direction` sagt, wo "besser" liegt — bei Beschwerden unten |
| `data/complaints.js` | 12 Beschwerdebilder: Einordnung, Ursachenbereiche, Warnsignale, Naehrstoffbezuege, Fragen fuer die Praxis |
| `data/labMarkers.js` | Gaengige Laborwerte als Eingabehilfe. Bewusst OHNE Referenzbereiche — die haengen von Labor und Methode ab |
| `data/medicationClasses.js` | Medikamentengruppen und ihre BELEGTEN Bezuege zu Wirkstoffen. Keine eigene Interaktionsdatenbank — jede Zeile zitiert woertlich aus substances.js/lifeStageAdvisories.js |
| `data/healthConditions.js` | Erkrankungen (Bluthochdruck, Nieren-/Leber-/Gallen-/Herzerkrankung, Salicylat-Unvertraeglichkeit u. a.) nach demselben Muster: jede Zeile zitiert WOERTLICH aus dem cautionNote der Substanz, Zitate programmatisch extrahiert, Substring-Test erzwingt Integritaet. EN-Overlay noch offen (DE-Fallback) |
| `data/interactions.js` | Substanz-Paar-Regeln (Aufnahme-Hemmung/-Foerderung) und Einnahme-Hinweise, jede Zeile mit Quelle (NIH ODS, EFSA). Deskriptiv formuliert, Tests erzwingen Quelle je Regel. EN-Overlay: `data/en/interactions.js` |
| `data/legalContent.js` | Datenschutzerklaerung und Impressum als strukturierter Inhalt mit `PRIVACY_VERSION`. Die Aussagen sind gegen den tatsaechlichen Datenfluss geschrieben: Wer einen Datenfluss aendert, aendert diesen Text mit |
| `data/offProducts.json` | Open-Food-Facts-Eintraege, getrennt vom redaktionell gepflegten Herstellerkatalog (`data/seedProducts.json`) gefuehrt: OFF-Daten stehen unter der Open Database License (ODbL), Attribution ist Pflicht. Traegt `license`, `attribution` und `generatedAt` im Dateikopf. Erzeugt und aktualisiert ueber `npm run split:off` (`scripts/split-off-products.mjs`); `SeedCatalog.js` fuehrt beide Dateien zu einem Katalog zusammen und kennzeichnet jeden OFF-Eintrag mit `license: 'ODbL'` |
| `data/en/*` | Englische Text-Overlays je Datendatei, keyed nach stabilen IDs. Deutsch bleibt kanonisch |
| `data/localize.js` | Sprach-Bruecke: blendet EN-Overlays ein, wenn die aktive Sprache Englisch ist. Einzige Stelle, die beide Sprachwelten kennt |

Bewusst als versioniertes JS-Modul im Repo, nicht in einer Datenbank:
Katalogwissen aendert sich selten, die App bleibt offline-faehig, und jede
Aenderung an einem Referenzwert ist ueber Git nachvollziehbar.

**Trennung beachten:** `inventory.json` = was die Nutzerin besitzt.
`data/substances.js` = was ein Wirkstoff ist. Nicht vermischen.

**Regel aus dem Code selbst** (`ConflictLogic.js`): *„Logik NIEMALS in
UI-Komponenten!"* Neue Regeln gehoeren in diese Module, nicht in Screens.

---

## Branch-Lage

**Der Arbeitsbranch ist `phase-2t-account-grundlage`, nicht `main`.**
Die Entwicklung laeuft in einer langen Kette von `phase-*`-Branches; `main` liegt
weit zurueck. Alle 23 Branches sind auf GitHub.
phase-2t haengt an phase-2s (Kopf e04dc49) und enthaelt die Account-Grundlage,
die Kaufschicht und das gefuehrte Onboarding (Spec und Plan unter
docs/superpowers/, Stand 2026-08-30).

Vor dem Anlegen eines neuen Branches pruefen, welcher der aktuelle Kopf ist —
nicht blind von `main` abzweigen.

---

## Sprachen

Oberflaeche auf Deutsch und Englisch, umschaltbar im Hauptmenue und in den
Einstellungen. Kataloge unter `i18n/de/` und `i18n/en/`, nach Bereich
aufgeteilt, Schluessel flach (`dashboard.title`).

- Komponenten nutzen `useTranslation()` aus `i18n/`.
- Fachlogik-Module nutzen `tr()` aus `i18n/runtime` — dort gibt es keine Hooks.
  `runtime.js` importiert bewusst NICHT den Store: `useStore` importiert
  seinerseits `TimingEngine`, das waere ein Ringschluss. Der Store spiegelt
  seinen Wert per `setActiveLanguage()` dorthin.
- Deutsch ist die Pflegesprache. Fehlt ein englischer Schluessel, faellt die App
  auf Deutsch zurueck statt auf eine leere Zeile.
- **Fachtexte laufen ueber EN-Overlays** (`data/en/*` + `data/localize.js`):
  Deutsch bleibt die kanonische Quelle, Englisch wird pro Feld eingeblendet,
  fehlende Overlays fallen auf Deutsch zurueck. Die Verdrahtung sitzt an den
  Profil-Bauern (`buildSubstanceProfile`, `buildComplaintView`), nicht in
  Screens. Compliance wird von Tests erzwungen: Vollstaendigkeit,
  Verbotswoerter (cure/heals/treats/boosts/recommended/you should) und
  Gedankenstrich-Verbot fuer JEDEN englischen Fachtext
  (`tests/substances-en.test.mjs`, `tests/data-en.test.mjs`). Wer einen
  deutschen Fachtext aendert, zieht das Overlay nach, sonst zeigt die
  EN-App veralteten Text. Literaturzitate (`sources`) und Fachbegriffe
  (Formnamen, Siegelnamen) werden NICHT uebersetzt.

---

## Design

Tokens in `theme.js`. **Keine Hex-Werte in Screens oder Komponenten** — das
ist eine Projektregel und wird eingehalten (Stand: null Treffer).

Die Palette ist bewusst nicht die Tailwind-Vorgabe: Vorher lief alles auf
slate-900/slate-500/teal-700, also genau den Werten, die praktisch jedes
schnell gebaute Projekt verwendet. Die Richtung heisst jetzt "Papier und
Tinte" — warmes Off-White statt blaustichigem Grau, tiefes Petrol
(`colors.accent`) statt Teal, gedeckte Erdtoene fuer Warnungen statt
Signalampel.

- Eigene Schriften (seit 2026-08-09): **Newsreader** (Serife) fuer
  `type.display/heading/subheading/numeral/quote`, **Instrument Sans**
  fuer Fliesstext und Bedienelemente. Geladen in `app/_layout.jsx`
  (useFonts), Namen in `theme.js` (`fonts`). Bei Schnitt-Fonts nie
  zusaetzlich `fontWeight` setzen (Android-Faux-Bold).
- Keine vollrunden Pillen mehr (`borderRadius: 999`), nur moderate Radien.
- Tab- und UI-Icons kommen aus `@expo/vector-icons` (Feather, gebuendelt,
  kein Font-Download). Keine Emojis als Icons: Das war das eine Element,
  das dem redaktionellen Erscheinungsbild widersprach.
- Der native Navigations-Header laeuft ueber `components/navigationTheme.js`
  auf denselben Tokens (Serifen-Titel, canvas-Hintergrund).
- Statusfarben ueber `toneFor(level)`. Eine Grenzwertueberschreitung ist ein
  Hinweis, kein Alarm — deshalb gedeckt.
- Gefuehrtes Onboarding (`components/onboarding/`): 24 pt seitliches Gleiten
  mit Blenden zwischen Schritten, Feder-Fortschritt in der Kopfleiste,
  0.97-Skalierung mit Haptik auf Auswahl, bei Reduce Motion nur Blenden;
  kein Konfetti, kein Bounce.
- **Keine Gedankenstriche in Nutzertexten.** Doppelpunkt, Komma oder Punkt
  statt "—". Der Gedankenstrich ist ein verlaessliches Erkennungsmerkmal
  maschinell erzeugter Texte; in Kommentaren im Code ist er unproblematisch.

### Bedienregeln (Spec 2026-08-31-bedienkonzept-design.md, verbindlich)

- Tippflaechen mindestens 44x44 pt (minHeight/hitSlop), mit Abstand zueinander.
- Jede Funktion per einzelnem Tipp erreichbar; Gesten nur als Abkuerzung.
- Dynamic Type: Texte skalieren mit der Systemschrift; Layouts brechen um
  statt abzuschneiden. `allowFontScaling={false}` ist verboten;
  `maxFontSizeMultiplier` nur, wo Umbruch unmoeglich ist, nie unter 1.5.
- Status nie nur ueber Farbe: immer zusaetzlich Text oder Icon.
- Maximal zwei Aufklapp-Ebenen fuer dieselbe Information.
- Sichtbare Rueckmeldung am Ort der Aktion, nie nur Haptik.
- Die erste Flaeche eines Screens beantwortet genau eine Frage; Tiefe ist
  einen Tipp entfernt, nie zwei.
- Kontrast mindestens 4,5:1 fuer Fliesstext, 3:1 fuer grosse Schrift
  (WCAG AA). Rechnerisches Token-Audit vom 2026-08-31 siehe
  .superpowers-Bericht; neue Farb-Tokens werden gegen diese Grenze
  gerechnet, bevor sie in theme.js landen.

---

## Datenhaltung

Alles lokal auf dem Geraet: **zustand + AsyncStorage**, kein Server, keine
Datenbank, keine Synchronisation. Der Haupt-Store ist im Ruhezustand
AES-256-verschluesselt (`secureStorage.js`): Er enthaelt Gesundheitsdaten
nach Art. 9 DSGVO (Laborwerte, Medikamentengruppen, Erkrankungen); der
Schluessel liegt im iOS-Keychain bzw. Android-Keystore, Klartext-Bestand
wird beim ersten Start nach dem Update still migriert.

Fuer Geraetewechsel und Datenauszug gibt es ein **JSON-Backup**
(`BackupManager.js`, Settings): Export ueber das System-Share-Sheet, Import
ersetzt den Bestand nach Bestaetigung. Kein Cloud-Sync. Einwilligungen und
Onboarding-Stand liegen im Store (`consents`, `onboardingCompletedAt`);
`resetAllData()` ist der zentrale Loeschweg (Art. 17) und setzt beides mit
zurueck. Wer ein neues Nutzerdaten-Feld ergaenzt, ergaenzt es in
`INITIAL_USER_STATE` (useStore.js) UND `BACKUP_DATA_FIELDS`
(BackupManager.js).

`inventory.json` und `data/mockScanResult.js` sind statische Beispieldaten.

**Profil aus dem gefuehrten Onboarding:** `profile.displayName`,
`profile.gender` und `profile.birthYear` liegen lokal, verschluesselt wie
der uebrige Store, und im Backup; sie gehen nie an einen Server.
`onboarding`-Flags (`accountOffered`, `firstAction`) sind Geraetezustand
und bewusst NICHT im Backup: Sie steuern nur, was ein bestimmtes Geraet
dem Onboarding-Flow schon gezeigt hat.

**Konto (optional, seit 2026-08-29):** Supabase Auth ueber `supabaseClient.js`.
Die Session liegt ueber `secureStorage` verschluesselt im AsyncStorage. Beim
Signup entsteht auf dem Geraet ein Datenschluessel, der mit dem
Passwort-Schluessel und mit einem Recovery-Key umwickelt wird; nur die
Umschlaege gehen in `public.user_keys` (Trigger aus den Signup-Metadaten).
Der Datenschluessel liegt seit 2026-09-01 im Geraete-Schluesselbund
(expo-secure-store, WHEN_UNLOCKED_THIS_DEVICE_ONLY) und wird beim Start
geladen; Abmelden und Konto-Loeschung entfernen ihn. Konto-Loeschung
laeuft ueber die Edge Function `delete-account` (Store-Pflicht). Wer den
Konto-Datenfluss aendert,
aendert `data/legalContent.js` mit.

**Cloud-Backup (seit 2026-09-01):** Mit Konto liegt je Nutzerin ein
verschluesselter Stand in `public.user_backups` (Supabase, EU/Irland):
Praeparate, Einnahme-Verlauf, Lagerbestand, Scan-Ergebnisse, Profil,
Laborwerte, Beobachtungen, Einstellungen, auf dem Geraet mit dem
Datenschluessel verschluesselt (AES-256-GCM), bevor sie uebertragen
werden. Der Server sieht nur Ciphertext, einen frei gewaehlten
Geraetenamen und Zeitstempel. Das Anmelde-Passwort ist eine Ableitung
(siehe Konto-Absatz), der Datenschluessel bleibt im Geraete-
Schluesselbund und verlaesst das Geraet nie. Wer den Cloud-Backup-
Datenfluss aendert, aendert `data/legalContent.js` mit.

**Kaeufe (seit 2026-08-29):** RevenueCat ist Auftragsverarbeiter fuer den
Kaufstatus (Abo-Tier, Kaufhistorie), angebunden ueber `react-native-purchases`.
Keine Preise im Code, die stehen in App Store Connect, Play Console und im
RevenueCat-Offering (`purchaseConfig.js` traegt nur Public-Keys und Produkt-
IDs). Expo Go zeigt die Kaufschicht als "nicht verfuegbar" (`purchaseSdk.js`
liefert dort `null`), fuer echte Kaeufe braucht es einen Development Build
(siehe `launch/store-setup.md`). `PAYWALL_ENFORCED` in `Entitlements.js`
bleibt `false`, bis der Sandbox-Test aus `launch/store-setup.md` gruen ist.

---

## Harte Regeln

- Fachlogik in die Module oben, nie in Screens.
- **Keine erfundenen Werte.** Nicht erkannte Dosierung oder Einheit bleiben leer und
  werden als fehlend gespeichert — frueher wurden sie still auf `'1'` bzw. `'Kapsel'`
  gesetzt, was wie ein erkannter Wert aussah. Das war ein Bug, siehe Commit
  `6bd60b6`.
- **Verbindungsmenge ist nicht Elementmenge.** Referenzwerte sind immer elementar.
  „Magnesiumcitrat 500 mg" enthaelt rund 81 mg Magnesium — ungeprueft verglichen
  ergab das eine Grenzwert-Warnung, wo keine war. Umgerechnet wird aber NUR, wenn
  die Menge erkennbar an der Verbindung haengt: nach Richtlinie 2002/46/EG und LMIV
  muss die Naehrwerttabelle bereits die elementare Menge nennen, pauschales
  Herunterrechnen wuerde eine echte Ueberdosierung verschleiern. Die Entscheidung
  trifft `DoseNormalizer.js`; ohne gesicherten Elementanteil wird gar nicht
  gerechnet, sondern gekennzeichnet.
- **Obergrenzen gelten fuer die Tagessumme, nicht pro Dose.** Wirkstoffmengen
  muessen ueber alle aktiven Produkte addiert werden (`StackAnalyzer.js`) —
  drei unauffaellige Praeparate koennen zusammen die Obergrenze reissen.
- **Keine erfundene Medikamenten-Interaktionsdatenbank.** Wechselwirkungen
  gehoeren in eine kuratierte oder lizenzierte Fachquelle; ein Sprachmodell ist
  dafuer nicht zulaessig. `data/medicationClasses.js` enthaelt deshalb keine
  eigenstaendigen Aussagen, sondern verweist mit woertlichem Zitat auf Saetze,
  die in `data/substances.js` bzw. `data/lifeStageAdvisories.js` bereits mit
  Quelle belegt sind. Ein Test prueft, dass jedes Zitat dort noch woertlich
  steht — sonst behauptet die App etwas, das die Quelle nicht mehr hergibt.
  Dasselbe gilt fuer Englisch: `data/en/medicationClasses.js` traegt je
  Bezug das woertliche Zitat aus den EN-Overlays, und
  `tests/medication-en.test.mjs` prueft die Substring-Integritaet.
- **Eine Veraenderung ist kein Wirkungsnachweis.** Die Wirkungskontrolle darf
  nie "X hat geholfen" sagen — auch nicht abgeschwaecht ("scheint zu wirken"),
  das ist dieselbe Aussage mit Weichzeichner. Erlaubt ist "deine Bewertung ist
  gestiegen". `OutcomeTracker.js` liefert deshalb Zahlen und Stoerfaktoren
  GETRENNT zurueck, und die Oberflaeche zeigt beides nebeneinander. Ohne den
  Stoerfaktor-Block waere das Feature ein Bestaetigungsautomat.
- **"Nie ueberprueft" ist kein Urteil ueber das Produkt.** Die Kostenanalyse
  zeigt, welche Ausgaben ohne Wirkungskontrolle mitlaufen. Das ist eine
  Beobachtungsluecke, keine Aussage ueber Wirksamkeit — die Formulierung muss
  das offenhalten.
- **Aus einer Beschwerde folgt kein Mangel.** Die Beschwerdesuche fuehrt mit der
  Einordnung ("Muedigkeit ist unspezifisch"), dann den Ursachenbereichen — bei
  den meisten Beschwerden Schlaf, Stress und Medikamente, nicht Naehrstoffe —,
  dann den Warnsignalen. Naehrstoffe stehen bewusst ganz unten und eingeklappt.
  Wer bei "muede" mit Eisen anfaengt, hat die Beschwerde bereits gedeutet.
  Warnsignale bleiben beobachtend formuliert ("kommt gemeinsam vor mit"), nie
  deutend ("deutet hin auf").
- **Laborwerte werden nicht interpretiert.** Kein "zu niedrig", kein "Mangel",
  keine Ampelfarbe. Referenzbereiche bringt die App nicht mit: Sie unterscheiden
  sich je Labor und Messmethode, ein hinterlegter Wert waere im Einzelfall
  falsch. Steht im Befund einer, wird er als Angabe des Labors uebernommen.
- **Ein Treffer ist keine Bewertung der Person.** Die App kennt weder Praeparat
  noch Dosis noch Befund. Formulierung deshalb immer "dazu ist ein Hinweis
  hinterlegt", nie "das ist fuer dich gefaehrlich".
- **OFF-Daten nie in seedProducts.json mischen.** `data/seedProducts.json` ist
  der redaktionell gepflegte Herstellerkatalog, `data/offProducts.json` traegt
  die Open-Food-Facts-Eintraege unter der Open Database License (ODbL) mit
  eigener Attribution. Neue OFF-Daten (z. B. aus einem Massenimport) gehoeren
  ausschliesslich in `data/offProducts.json`; `npm run split:off`
  (`scripts/split-off-products.mjs`) haelt die Trennung nach jeder Aenderung
  an `seedProducts.json` wieder her.
- Scan-Ergebnisse tragen `analysisMode` (`'mock'`, `'demo-fallback'`, `'vision'`
  fuer die Claude-Vision-Auswertung, `'barcode-off'` fuer Open-Food-Facts-Treffer,
  `'community-cache'` fuer Treffer aus dem geteilten Produkt-Cache,
  `'seed-catalog'` fuer Treffer aus dem gebuendelten DACH-Katalog
  `data/seedProducts.json`/`SeedCatalog.js`)
  und eine `captureSummary`, damit nachvollziehbar ist, woher ein Eintrag stammt.
  Katalog-Treffer (Suche, Markenregister) springen direkt auf den Screen
  "Aufnehmen" (`/AddSupplement?fromScan=1`); `results.jsx` bleibt der
  Pruef-Screen fuer Foto- und Barcode-Scans.
- Echte Scan-Analyse: `ScanAnalyzer.js` (App) → Supabase Edge Function
  `supabase/functions/analyze-supplement` (Claude Vision, Structured Output).
  Der `ANTHROPIC_API_KEY` liegt NUR als Supabase-Secret, nie in der App.
  Endpoint-Konfiguration in `scanConfig.js` (leere URL = Mock-Fallback).
- Barcode-Pfad: `BarcodeLookup.js` fragt Open Food Facts ab (kein Key noetig).
  Bei einem Miss fragt der Scanner den geteilten Produkt-Cache
  (`lookupProductCache` in ScanAnalyzer.js → Tabelle `product_cache`,
  Zugriff nur ueber die Edge Function). Erfolgreiche Foto-Analysen mit
  bekanntem Barcode landen serverseitig in der PRUEF-SCHLEUSE
  (verified=false) und werden erst nach redaktioneller Freigabe an
  andere ausgeliefert; kuratierte Seed-Eintraege sind verified=true.
  Reine Produktdaten, keine Fotos, keine Nutzerdaten. Wer diesen Datenfluss aendert, aendert
  data/legalContent.js mit.
- Keine gesundheitlichen Empfehlungen im Ausgabetext — die App ordnet Zeitpunkte und
  Konflikte, sie beraet nicht. Konkret: **Referenzwerte anzeigen statt Dosierungen
  empfehlen** ("enthaelt 400 mg, Obergrenze liegt bei 250 mg"), Anwendungsgebiete
  **deskriptiv** formulieren ("wird eingesetzt bei"), nie praeskriptiv. Das haelt die
  App ausserhalb der Medizinprodukte-Regulierung (MDR) und der Health-Claims-Verordnung.
- **Keine Herstellernamen und keine Qualitaets-Rankings von Marken.** Qualitaet wird
  ueber pruefbare Zertifizierungen abgebildet, nicht ueber Markenbewertungen —
  rechtlich unangreifbar und offen fuer spaetere Werbepartnerschaften.
- Deutsche Code-Kommentare beibehalten.
