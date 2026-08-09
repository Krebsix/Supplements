# ASO-Paket (App Store Optimization)

Stand: 2026-08-09. App-Name entschieden: MySuplea (2026-08-09).
Zeichenlimits: iOS-Titel 30, iOS-Untertitel 30, iOS-Keyword-Feld 100,
Android-Titel 30, Android-Kurzbeschreibung 80.

WICHTIG (Compliance): Kein Wort aus der Familie "hilft, wirkt, heilt,
Mangel beheben, empfohlen" in Listing-Texten. Apple prüft Gesundheits-Apps
strenger, und die Texte sind zugleich abmahnrelevant (Health-Claims-VO).
Alles hier ist danach geschrieben.

---

## Titel und Untertitel

**iOS-Titel:** `MySuplea: Supplement Tracker`
(Der beschreibende Zusatz macht die Store-Suche. Bei kurzem Namen passt
beides in 30 Zeichen; sonst Zusatz in den Untertitel schieben.)

**iOS-Untertitel DE:** `Einnahmeplan und Obergrenzen` (28 Zeichen)
**iOS-Untertitel EN:** `Intake plan and upper limits` (28 Zeichen)

**Android-Kurzbeschreibung DE (max 80):**
`Supplemente planen, Tagessummen gegen Obergrenzen prüfen. Ohne Konto, ohne Cloud.`

**Android-Kurzbeschreibung EN (max 80):**
`Plan supplements, check daily totals against upper limits. No account, no cloud.`

## iOS-Keyword-Feld (100 Zeichen, ohne Leerzeichen nach Komma)

**DE:**
`supplement,tracker,nahrungsergänzung,vitamine,magnesium,einnahme,wechselwirkung,laborwerte,dosis`

**EN:**
`supplement,tracker,vitamins,magnesium,intake,interaction,stack,lab,values,reminder,dosage`

(Nicht ins Feld: der eigene App-Name und "App", beides ist automatisch
indexiert. Keine Markennamen von Präparaten, das gibt Ablehnungen.)

## Lang-Beschreibung DE (App Store und Play Store)

```
MySuplea ordnet deine Nahrungsergänzungsmittel, ohne dir etwas zu
verkaufen.

WAS DIE APP MACHT
· Einnahmeplan: Präparate in Tages-Slots, mit lokalen Erinnerungen
· Tagessummen: Wirkstoffmengen werden über alle Präparate addiert und mit
  veröffentlichten Referenzwerten und Obergrenzen verglichen
· Wechselwirkungen: bekannte Konflikte zwischen Wirkstoffen, mit Quelle
· Etiketten-Scan: Barcode oder Foto, Dosierung und Wirkstoffe erfassen
· Lebensphasen: Referenzwerte für Kind, Schwangerschaft, Stillzeit, 65+
· Kur-Zyklen: Einnahme- und Pausenphasen, die der Tagesplan berücksichtigt
· Wirkungskontrolle: dein Verlauf, ehrlich dargestellt, samt Störfaktoren
· Laborwerte: dokumentieren und im Verlauf ansehen, ohne Bewertung
· Bericht: eine Übersicht für Praxis oder Apotheke, Abschnitte wählbar

WAS DIE APP NICHT MACHT
· Sie empfiehlt keine Produkte und keine Dosierungen
· Sie bewertet keine Marken und verlinkt keine Shops
· Sie stellt keine Diagnosen und ersetzt keine ärztliche Beratung

DEINE DATEN
Kein Konto, keine Cloud, kein Tracking. Alle Eingaben bleiben verschlüsselt
auf deinem Gerät. Backup und vollständiges Löschen jederzeit in den
Einstellungen. Nur die freiwillige Foto-Analyse überträgt Etikettenfotos,
nach ausdrücklicher Zustimmung.

QUELLEN
Fachliche Hinweise zitieren ihre Quellen wörtlich, darunter EFSA, BfR,
HMPC und NIH. Was nicht belegt ist, steht nicht in der App.
```

## Lang-Beschreibung EN

```
MySuplea organises your supplements without selling you anything.

WHAT THE APP DOES
· Intake plan: products in daily slots, with local reminders
· Daily totals: amounts are added up across all products and compared
  against published reference values and upper limits
· Interactions: known conflicts between substances, with sources
· Label scan: barcode or photo, capture dosage and ingredients
· Life stages: reference values for childhood, pregnancy, nursing, 65+
· Intake cycles: on and off phases, reflected in the daily plan
· Outcome tracking: your ratings over time, shown honestly, including
  confounding factors
· Lab values: document and view over time, without judgement
· Report: an overview for your doctor or pharmacist, sections selectable

WHAT THE APP DOES NOT DO
· It does not suggest products or dosages
· It does not rate brands and links no shops
· It does not diagnose and does not replace medical advice

YOUR DATA
No account, no cloud, no tracking. Everything you enter stays encrypted on
your device. Backup and complete deletion any time in the settings. Only
the optional photo analysis transmits label photos, after explicit consent.

SOURCES
Statements cite their sources verbatim, including EFSA, BfR, HMPC and NIH.
What is not documented is not in the app.
```

## Screenshot-Dramaturgie (6 Bilder, Reihenfolge ist Argumentation)

| # | Screen | Headline auf dem Screenshot |
|---|---|---|
| 1 | Dashboard mit Tagesplan | "Dein Tag, geordnet." |
| 2 | Tagessummen mit Obergrenzen-Hinweis | "Drei Präparate, eine Summe." |
| 3 | Scan-Ergebnis mit Referenzwert-Einordnung | "Obergrenzen statt Empfehlungen." |
| 4 | Beschwerdesuche mit Einordnung zuerst | "Erst einordnen, nie verkaufen." |
| 5 | Praxis-Bericht (Export-Screen) | "Zum Mitnehmen in die Sprechstunde." |
| 6 | Settings mit Datenschutz-Karte | "Kein Konto. Keine Cloud. Deine Daten." |

Stil: echte Screens im Geräterahmen auf Papier-Hintergrund (canvas-Farbton
aus theme.js), Headline in der Serifenschrift. Kein Stockfoto-Mensch, kein
Neon-Gradient. Der Look der App ist das Unterscheidungsmerkmal, also zeigen.

## Store-Metadaten

- Kategorie: Gesundheit & Fitness (primär), Medizin NICHT wählen (höhere
  Prüfhürden, falsche Erwartung)
- Altersfreigabe: 12+ (medizinische/Behandlungsinformationen in Apples
  Fragebogen wahrheitsgemäß angeben)
- Apple App Privacy: "Data Not Collected" ist NICHT wählbar wegen der
  Foto-Analyse; korrekt: Fotos als "Data Not Linked to You", Zweck
  App-Funktionalität. IP beim Rate-Limit unter "Diagnostics" prüfen.
- Datenschutz-URL: wird gebraucht (Store-Pflichtfeld). Die Erklärung aus
  der App muss zusätzlich auf einer Webseite stehen. OFFEN: Mini-Seite
  aufsetzen (eine statische Seite reicht).
