# Launch-Plan

Stand: 2026-08-09. App-Name offen, Platzhalter: [APP-NAME].

## Phase 0: Blocker (ohne die kein Launch)

| # | Punkt | Wer | Status |
|---|---|---|---|
| 1 | App-Name entscheiden (inkl. Store- und Markenkollisions-Check) | Nadine + Claude | Recherche läuft |
| 2 | Impressum vervollständigen: Kontakt-E-Mail, Vertretungsberechtigte | Nadine | offen |
| 3 | EU-Vertreter nach Art. 27 DSGVO beauftragen und eintragen | Nadine | offen |
| 4 | AVV mit Supabase und Anthropic dokumentieren | Nadine | offen |
| 5 | Preismodell entschieden (2026-08-09): Freemium, Pro-Abo 29,99/Jahr bzw. 4,99/Monat, Scan-Credit-Pakete. In der App verdrahtet: Scan-Gate, 5-Präparate-Grenze, Pro-Gates (Wirkungskontrolle, Kostenanalyse, Laborwerte, Kur-Zyklen), Kontingent-Anzeige in den Einstellungen; alles hinter PAYWALL_ENFORCED=false. Noch zu bauen: IAP-Integration + Paywall-Kaufscreen (braucht Developer-Account, Punkt 9). Scan-Modell auf Haiku 4.5 nach Qualitätstest | Claude + Nadine | teils |
| 6 | App-Icon (1024x1024) und Splash | Claude baut Entwurf, Nadine entscheidet | offen |
| 7 | Datenschutz-URL: statische Webseite mit der Erklärung. Gebaut (web/, generiert aus data/legalContent.js via `npm run build:legal`, Drift-Test). Offen: Hosting/Domain nach Namensentscheidung, Platzhalter aus Punkt 2 und 3 | Claude | gebaut, Veröffentlichung offen |
| 8 | Gerätetest: Onboarding, Scan-Einwilligung, Erinnerungen, Backup | Nadine | offen |
| 9 | Apple Developer Account auf indoo home LLC + Store-Listing anlegen | Nadine | offen |

## Phase 1: Stille Beta (2 bis 3 Wochen vor Launch)

- TestFlight-Beta mit 20 bis 50 Leuten: eigene Kontakte, je zwei bis drei
  aus jeder Zielgruppe (Vieleinnehmer, Schwangere/junge Eltern,
  Datenschutz-affine, eine Apothekerin oder PTA wenn erreichbar).
- Beta-Ziel ist nicht Lob, sondern: Wo bricht das Onboarding ab, versteht
  jemand den Bericht, funktionieren Erinnerungen auf echten Geräten.
- Nebeneffekt: fünf bis zehn ehrliche Zitate für Launch-Material sammeln
  (mit Einverständnis, Vorname + Rolle reicht).
- Apotheken-Winkel vorbereiten: zwei bis drei Apotheken vor Ort oder aus
  dem Bekanntenkreis den Bericht zeigen. Eine einzige Aussage wie "so
  einen Überblick wünsche ich mir von Kundinnen" trägt die ganze
  Fachpressearbeit.

## Phase 2: Launch-Tag (ein Dienstag oder Mittwoch)

Reihenfolge am Tag: Product Hunt (ab 9:01 Uhr MEZ gelistet), dann Reddit,
dann die Pitch-Mails raus (die brauchen ohnehin Vorlauf, siehe unten).

### Product Hunt (englisch)

- **Name:** [APP-NAME]
- **Tagline:** `The supplement tracker that sells you nothing`
- **First Comment (Maker Comment), Entwurf:**

```
Hi Product Hunt! I built [APP-NAME] because every supplement app I tried
was secretly a shop: affiliate links, brand rankings, "you might be
deficient" quizzes.

[APP-NAME] takes the opposite position:
· It shows published upper limits instead of recommendations ("contains
  400 mg, the upper limit is 250 mg")
· It adds up daily totals across ALL your products, because three
  harmless-looking pills can jointly cross a limit
· Medication notes are verbatim quotes from documented sources (EFSA,
  BfR, NIH). An automated test breaks the build if a quote no longer
  matches its source
· Symptom search starts with context (fatigue is unspecific, sleep and
  medication are the most common areas), not with a product
· Everything stays encrypted on your device. No account, no cloud, no
  tracking. There is a full JSON export and a one-tap delete
· It can produce a report you hand to your doctor or pharmacist

It is deliberately boring where the industry is loud. Happy to answer
anything, especially critical questions about the compliance angle.
```

### Reddit (Entwürfe, an Subreddit-Regeln anpassen, keine Link-Spam-Posts)

**r/Supplements (englisch), Titel:**
`I built a supplement tracker that shows upper limits instead of recommendations, keeps everything on-device, and cites every claim. Looking for critical feedback.`
Text: gekürzte Fassung des Maker Comments, mit ehrlicher Bitte um Kritik
an der Datenlage. Kein Link im Text, Link erst auf Nachfrage oder laut
Subreddit-Regeln.

**r/de oder r/Finanzen-nahe Datenschutz-Communities (deutsch), Titel:**
`Ich habe eine Supplement-App gebaut, die keine Daten sammelt und nichts verkauft. Alle Gesundheitsdaten bleiben verschlüsselt auf dem Gerät.`
Fokus im Text: Warum lokal statt Cloud, wie die Verschlüsselung
funktioniert, warum kein Konto nötig ist.

### Pitch-Mail Fachpresse (deutsch, Sie-Form, je Empfänger zwei Zeilen personalisieren)

Empfängerliste, in dieser Reihenfolge:
1. Apotheke Adhoc, Pharmazeutische Zeitung, Deutsche Apotheker Zeitung
   (Winkel: der Bericht, den Kundinnen mit in die Offizin bringen)
2. heise online / c't, netzpolitik.org (Winkel: Gesundheitsdaten lokal,
   Verschlüsselung, kein Tracking)
3. t3n, OMR (Winkel: Solo-Gründerin baut gegen den Affiliate-Markt)

```
Betreff: Supplement-App, die der Apotheke einen Bericht mitbringt statt
Produkte zu verkaufen

Guten Tag [Name],

kurz und konkret: [APP-NAME] ist eine neue App für Menschen, die mehrere
Nahrungsergänzungsmittel nehmen. Sie empfiehlt nichts und verkauft nichts.
Stattdessen addiert sie Wirkstoffmengen über alle Präparate, vergleicht
sie mit veröffentlichten Obergrenzen (EFSA, BfR), zeigt belegte
Medikamenten-Bezüge als wörtliche Zitate und erstellt einen Bericht, den
Nutzerinnen in Praxis oder Apotheke vorlegen können.

Alle Daten bleiben verschlüsselt auf dem Gerät: kein Konto, keine Cloud,
kein Tracking.

[PERSONALISIERUNG: Bezug auf einen konkreten Artikel des Mediums.]

Gern schicke ich Ihnen einen TestFlight-Zugang und Screenshots. Für
Rückfragen stehe ich kurzfristig zur Verfügung.

Freundliche Grüße
Nadine [Nachname]
indoo home LLC
```

Vorlauf: Pitch-Mails eine Woche VOR dem Launch-Tag mit Sperrfrist
("Veröffentlichung ab [Datum]") verschicken, nicht am Tag selbst.

## Erfolgsmessung (ohne Vanity)

- Woche 1: 30 Prozent der Installationen schließen das Onboarding ab und
  legen mindestens ein Präparat an.
- Monat 1: mindestens 20 exportierte Berichte (das ist der Kanal, der
  trägt), erste organische Store-Suche auf den App-Namen.
- Presse: eine Veröffentlichung in Fachpresse ODER Datenschutz-Medium
  zählt mehr als fünf Tech-Blog-Erwähnungen.

## Was wir bewusst NICHT machen

- Keine bezahlten Installs zum Start (verfälscht jede Erkenntnis).
- Keine Influencer-Kooperationen mit Supplement-Bezug (zerstört die Story).
- Keine Streaks, Punkte oder Invite-Belohnungen (Anti-Dark-Pattern-Regel).
