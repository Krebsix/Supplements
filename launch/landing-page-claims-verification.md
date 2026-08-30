# Claims-Verifikation: Landingpage gegen App-Code

Stand: 2026-08-30. Quelle: `design_handoff_mysuplea_landing/CLAIMS_CHECKLIST.md`.
Jeder Claim der neuen Landingpage ("Evidenz-Dossier"-Redesign) gegen den
tatsächlichen App-Code geprüft. ✅ belegt, ⚠️ abweichend (Text angepasst),
❌ nicht vorhanden (nicht verwendet).

## Kernfunktionen

| # | Claim | Fundstelle | Status |
|---|---|---|---|
| 1 | Tagessummen über alle Präparate, nicht pro Dose | `StackAnalyzer.js` (Kopfkommentar: "Rechnet ueber den GESAMTEN Bestand") | ✅ |
| 2 | Vergleich gegen veröffentlichte Obergrenzen | `data/referenceValues.js` (`upperLimit` je Lebensphase), `ReferenceCheck.js` | ✅ |
| 3 | Quellen D-A-CH, EFSA, BfR, HMPC, NIH | Alle fünf Begriffe kommen in `data/substances.js`/`data/interactions.js`/`data/lifeStageAdvisories.js` vor (D-A-CH 7×, EFSA 129×, BfR 64×, HMPC 115×, NIH 28×) | ✅ |
| 4 | Zitate wörtlich, Test bricht den Build | `tests/medication-en.test.mjs`: `check('alle EN-Zitate stehen woertlich im EN-Quelltext', ...)`, prüft Substring-Integrität; `tests/health-conditions.test.mjs` analog für DE | ✅ |
| 5 | Keine Empfehlungen, nie "nimm X" | Harte Projektregel in `CLAUDE.md` ("Referenzwerte anzeigen statt Dosierungen empfehlen") | ✅ |
| 6 | Beschwerde zeigt zuerst Einordnung, Nährstoffe zuletzt eingeklappt | `ComplaintSearch.js buildComplaintView()`: Rückgabe-Reihenfolge `intro → contextAreas → redFlags → nutrients`; Hard Rule in `CLAUDE.md` | ✅ |
| 7 | Zitat "Enthält 400 mg, Obergrenze 250 mg" (Magnesium) | `data/referenceValues.js`: `magnesium.values['adult-woman'/'adult-man'/...].upperLimit = 250` | ✅ exakt |
| 8 | Mockup: Slots, "Erledigt"/"Offen" | `i18n/de/dashboard.js`: `stateLogged: 'Dokumentiert'`, `statePending: 'Offen'` | ⚠️ Label korrigiert: Mockup zeigt jetzt "Dokumentiert" statt "Erledigt" |
| 9 | Barcode-Scan ohne Limit (Free) | `Entitlements.js`: kein Zähler für Barcode, nur `FREE_VISION_SCANS` | ✅ |
| 10 | Drei KI-Foto-Scans (Free) | `Entitlements.js`: `FREE_VISION_SCANS = 3` | ✅ |
| 11 | Bis zu fünf Präparate (Free) | `Entitlements.js`: `FREE_MAX_SUPPLEMENTS = 5` | ✅ |
| 12 | Bericht: Präparate, Tagessummen, Laborwerte, Abschnitte wählbar | `ExportBuilder.js`: `EXPORT_SECTIONS` (SUPPLEMENTS, TOTALS, PROFILE, LAB, OUTCOMES), `sections`-Parameter | ✅ |
| 13 | Pro: unbegrenzte Scans (Fair Use), unbegrenzter Bestand, Wirkungskontrolle, Kostenanalyse, Laborwerte-Verlauf, Kur-Zyklen | `Entitlements.js` (`PRO_MONTHLY_FAIR_USE`, kein Bestandslimit für Pro); `OutcomeTracker.js`, `CostAnalyzer.js`, `LabValues.js`, `CureManager.js` existieren als eigene Module | ✅ |

## Daten & Sicherheit

| # | Claim | Fundstelle | Status |
|---|---|---|---|
| 14 | AES-256 im Ruhezustand | `secureStorage.js`: "AES-256-CTR-verschluesselt mit zufaelligem" | ✅ |
| 15 | Schlüssel im iOS-Keychain/Android-Keystore | `secureStorage.js`: "expo-secure-store: iOS Keychain, Android Keystore" | ✅ |
| 16 | Ohne Konto nutzbar | Onboarding-Gate ohne Login-Zwang (CLAUDE.md, Abschnitt Datenhaltung) | ✅ |
| 17 | Konto freiwillig, E2E, Server kann nicht lesen | `AccountCrypto.js`/`AccountLogic.js`; "später Sync" korrekt, da Teilprojekt 2 noch nicht gebaut (Brain/ventures/supplements.md) | ✅ |
| 18 | Backup als Datei | `BackupManager.js` | ✅ |
| 19 | Vollständiges Löschen, ein Tippen | `resetAllData()` in `useStore.js` | ✅ |
| 20 | Fotos nur mit Zustimmung, nicht gespeichert | `data/legalContent.js` Abschnitt "Foto-Scan": Fotos "werden weder bei Supabase noch in der App-Datenbank gespeichert"; Edge Function verarbeitet Bilder nur in-memory (base64 im Request, kein Storage-Aufruf gefunden) | ✅ |
| 21 | Beta-Mail nur für Einladung, EU gespeichert | Selbst gebaut 2026-08-30: `supabase/functions/beta-signup`, Supabase-Region West EU (Irland) | ✅ |

## Geschäftsmodell & Sonstiges

| # | Claim | Fundstelle | Status |
|---|---|---|---|
| 22 | ~25 Cent pro Foto-Scan | `Brain/ventures/supplements.md`: "Opus-Preisen (~25 ct/Scan)" | ✅ |
| 23 | Kein Affiliate, keine Markenkooperation | Harte Projektregel `CLAUDE.md` ("Keine Herstellernamen und keine Qualitaets-Rankings") | ✅ |
| 24 | Scan-Pakete einzeln kaufbar | `Entitlements.js`: `extraCredits`-Feld als Consumable-Konzept angelegt; IAP-Umsetzung steht noch aus (`PAYWALL_ENFORCED = false`) — Formulierung bleibt im Futur/Modell-Beschreibung, keine Live-Kauf-Behauptung | ✅ (Modellbeschreibung, kein Live-Claim) |
| 25 | Kölner Liste, USP, GMP, Informed Sport | `data/certifications.js`: `id: 'koelner-liste'`, `'usp-verified'`, `'gmp'`, `'informed-sport'` | ✅ alle vier |
| 26 | Nicht unter 16, ersetzt keine ärztliche Beratung | Bestehende Formulierung aus `launch/story.md`/`launch/landingpage.md` (unverändert übernommen) | ✅ |
| 27 | Open Food Facts / ODbL | `BarcodeLookup.js` fragt Open Food Facts ab (siehe `CLAUDE.md`, Abschnitt Barcode-Pfad) | ✅ |
| 28 | TestFlight-Einladung, eine Mail, keine Serie | Selbst gebaut 2026-08-30: `beta-signup` speichert nur, kein Mailversand; Einladung über TestFlight (Nadines manueller Schritt) | ✅ |

## Sprachprüfung

Automatisiert erzwungen in `web/tests/i18n.test.mjs`:
- Kein „Medikament/Medikation" (DE), kein „medication" (EN)
- Kein Versprechen „keine Werbung … kein Shop" (die alte Zeile ist aus dem
  Redesign entfernt, Vorlage nennt sie explizit als nie wieder einzuführen)
- Keine Gedankenstriche in DE und EN
- Keine Heil-/Wirkversprechen (hilft/wirkt/heilt/behebt/empfohlen bzw.
  cure/heals/treats/boosts/recommended/you should)

## Ergebnis

27 von 28 Claims direkt belegt, ein Claim (#8) mit einer Textkorrektur
(„Dokumentiert" statt „Erledigt") umgesetzt. Kein Claim musste entfernt
werden.
