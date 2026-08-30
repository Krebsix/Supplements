# Claims-Checkliste: Landing Page vs. App

Jeden Claim im App-Repo verifizieren. Status: ✅ belegt (mit Datei/Modul) · ⚠️ abweichend · ❌ nicht vorhanden.
Bei ⚠️/❌: Landing-Page-Text abschwächen oder entfernen, nie einfach behaupten.

## Kernfunktionen
| # | Claim (Landing Page) | Was im Code zu prüfen ist | Status |
|---|---|---|---|
| 1 | Rechnet Tagessummen über alle Präparate (nicht pro Dose) | Aggregations-Logik: Summierung von Wirkstoffen über den gesamten Bestand | |
| 2 | Vergleich der Tagessummen gegen veröffentlichte Obergrenzen | Referenzwert-Datensätze + Vergleichslogik; lebensphasenabhängig? | |
| 3 | Referenzquellen: D-A-CH, EFSA, BfR, HMPC, NIH | Quellen-Metadaten in der Wirkstoff-Datenbank; sind ALLE fünf wirklich vertreten? | |
| 4 | Jeder Hinweis nennt seine Quelle wörtlich (wörtliche Zitate) | Zitat-Felder + Anzeige; existiert der automatische Zitat-Integritäts-Test, der den Build bricht? | |
| 5 | Keine Empfehlungen („sagt nie: nimm X“), keine Dosierungsempfehlung | Formulierungsverbote/Copy-Guards in Code und Content | |
| 6 | Beschwerde-Eingabe zeigt zuerst Einordnung, Nährstoffe zuletzt eingeklappt | Beschwerdebild-Flow / Sortierung im Entdecken-Bereich | |
| 7 | Beispielzitat „Enthält 400 mg, die Obergrenze liegt bei 250 mg“ (Magnesium) | Stimmt die Magnesium-Obergrenze 250 mg (Zusatzstoff-Empfehlung BfR) mit der App-Datenbank überein? | |
| 8 | Phone-Mock: Slots (nüchtern bis Schlafenszeit), Erinnerungen, Erledigt/Offen | Heute-Screen: existieren diese Features + Benennungen? | |
| 9 | Barcode-Scan ohne Limit (Free) | Scan-Modul + Limits/Feature-Flags im Free-Tier | |
| 10 | Drei KI-Foto-Scans im Free-Tier | Quota-Konfiguration | |
| 11 | Bis zu fünf Präparate im Free-Tier | Bestand-Limit im Free-Tier | |
| 12 | Bericht für die Sprechstunde: Präparate/Dosen, Tagessummen, Laborwerte-Verlauf, Wirkstoffhinweise mit Quelle, Abschnitte wählbar | Report-Generator: enthaltene Abschnitte + Wählbarkeit | |
| 13 | Pro: unbegrenzte KI-Scans (Fair Use), unbegrenzter Bestand, Wirkungskontrolle mit Störfaktoren, Kostenanalyse, Laborwerte-Verlauf, Kur-Zyklen | Feature-Gates des Pro-Tiers, jede Position einzeln | |

## Daten & Sicherheit
| # | Claim | Prüfen | Status |
|---|---|---|---|
| 14 | Daten bleiben auf dem Gerät, AES-256-verschlüsselt im Ruhezustand | Storage-Layer: Verschlüsselung wirklich AES-256? | |
| 15 | Schlüssel im iOS-Keychain / Android-Keystore | Key-Management-Implementierung | |
| 16 | App komplett ohne Konto nutzbar | Auth-Gates: kein Zwangs-Login | |
| 17 | Konto freiwillig; Schlüssel entsteht auf dem Gerät; Server sieht nur verschlüsselte Daten (auch wir können nicht lesen) | E2E-Architektur der Sync-Funktion; Formulierung „später Sync“ korrekt, falls noch nicht gebaut | |
| 18 | Backup als Datei, Import auf neues Gerät | Export/Import-Funktion | |
| 19 | Vollständiges Löschen mit einem Tippen | Delete-Flow | |
| 20 | Foto-Analyse nur nach ausdrücklicher Zustimmung; Fotos werden nicht gespeichert | Consent-Gate + Server-Verhalten (keine Persistenz) | |
| 21 | Beta-E-Mail: nur für Einladung, Speicherung in EU | Formular-Backend: Region, Zweckbindung, Austragen-Weg | |

## Geschäftsmodell & Sonstiges
| # | Claim | Prüfen | Status |
|---|---|---|---|
| 22 | Foto-Auswertung kostet ~25 Cent pro Scan | Aktuelle KI-API-Kosten gegenrechnen; ggf. Zahl entfernen | |
| 23 | Kein Affiliate, keine Markenkooperation | Keine Affiliate-Links/SDKs im Code | |
| 24 | Scan-Pakete einzeln kaufbar (geplant) | Ist In-App-Purchase dafür geplant/angelegt? | |
| 25 | Quellen-Ticker: Kölner Liste, USP, GMP, Informed Sport | Werden diese Siegel in der App wirklich erklärt? | |
| 26 | Nicht für Personen unter 16, ersetzt keine ärztliche Beratung | Alters-/Disclaimer-Texte in App + Stores konsistent | |
| 27 | Open Food Facts / ODbL-Hinweis | Wird OFF-Datenbasis genutzt? Lizenzhinweis korrekt platziert? | |
| 28 | TestFlight-Einladung per Mail, „eine Mail, keine Serie“ | Beta-Prozess entspricht dem | |

## Sprachprüfung (gesamte Landing Page)
- [ ] Kein „Medikament/Medikation“ im Text
- [ ] Kein „keine Werbung / kein Shop / nie“-Versprechen
- [ ] Keine Gedankenstriche (—) im Fließtext
- [ ] Keine Heil-/Wirkversprechen, keine Diagnose-Sprache
