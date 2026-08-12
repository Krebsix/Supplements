# Launch-Plan

Stand: 2026-08-09. App-Name entschieden: MySuplea (2026-08-09).

**AENDERUNG 2026-08-09 abends: Launch verschoben.** Nadines Entscheidung
(Abweichung vom Council-Verdikt, Brain: decisions/2026-08-09-supplements-
launch-verschoben-datenbank-zuerst.md): Erst die vollstaendige
DACH-Produktdatenbank, dann Launch. Die Gates unten bleiben als
Qualitaetsschritte bestehen, ihre Termine sind ausgesetzt. OFFEN: das
messbare "100-Prozent"-Fertig-Kriterium (definiert Nadine).

## Phase 0: Blocker (ohne die kein Launch)

| # | Punkt | Wer | Status |
|---|---|---|---|
| 1 | App-Name: MySuplea (entschieden 2026-08-09). Kollisions-Check am 2026-08-11 wiederholt: kein Treffer bei Apple App Store, Google Play und allgemeiner Websuche; mysuplea.com und mysuplea.de laut Whois frei. Bleibt offen: das ist Indiz, keine formale Markenrecherche DPMA/EUIPO | Nadine + Claude | entschieden, Domain-Kauf offen |
| 2 | Impressum vervollständigen: Kontakt-E-Mail (info@indoohome.com, 2026-08-11 eingetragen). Offen: Vertretungsberechtigte Person | Nadine | E-Mail erledigt, Name offen |
| 3 | EU-Vertreter nach Art. 27 DSGVO beauftragen und eintragen | Nadine | offen |
| 4 | AVV mit Supabase und Anthropic dokumentieren | Claude | erledigt, siehe launch/avv-dokumentation.md |
| 5 | Preismodell entschieden (2026-08-09): Freemium, Pro-Abo 29,99/Jahr bzw. 4,99/Monat, Scan-Credit-Pakete. In der App verdrahtet: Scan-Gate, 5-Präparate-Grenze, Pro-Gates (Wirkungskontrolle, Kostenanalyse, Laborwerte, Kur-Zyklen), Kontingent-Anzeige in den Einstellungen; alles hinter PAYWALL_ENFORCED=false. Noch zu bauen: IAP-Integration + Paywall-Kaufscreen (braucht Developer-Account, Punkt 9). Scan-Modell: OPUS — Haiku-Test 2026-08-10 durchgefallen (Kill-Kriterium ausgeloest, Beleg launch/scan-quality-report-2026-08-10.md); Fair-Use-Limit/Credits-Preis vor Paywall-Launch mit Opus-Kosten (~25 ct/Scan) nachrechnen | Claude + Nadine | teils |
| 6 | App-Icon (1024x1024) und Splash | Claude | ERLEDIGT (2026-08-12): Nadines Motiv (Kapsel, Blaetter, Balken, Scan-Ecken) icon-tauglich zugeschnitten. Quelle `assets/source/motiv-original.png` plus drei SVG-Rezepte, Bau ueber `npm run build:icons`. Entfernt: der Schriftzug samt Tagline (bei 120 px nur noch ein grauer Strich, bei 40 px Matsch; Apple raet ohnehin von Text im Icon ab) und der eigene gerundete Rahmen (ergab unter der iOS-Maske zwei Rundungen ineinander). Der fehlende Hintergrundstreifen wird durch einen Verlauf ersetzt, dessen Farben aus dem Original ausgemessen sind (#06264f/#001129), Kanten laufen weich aus. Geprueft bei 1024/120/40 px sowie unter iOS-Squircle, Android-Kreis und Android-Squircle; im Android-Kreis liegt die Kapsel vollstaendig in der Safe Zone, nur die dekorativen Scan-Ecken werden angeschnitten. icon/splash/favicon ohne Alpha-Kanal (Apple-Vorgabe). `backgroundColor` in app.json auf #011a39, passend zum radial auslaufenden Splash-Verlauf. OFFEN: Die Wortmarke "MySuplea" braucht einen Platz, an dem sie lesbar ist — Landingpage, Store-Listing-Grafik, ggf. Splash |
| 7 | Datenschutz-URL: statische Webseite mit der Erklärung. Gebaut (web/, generiert aus data/legalContent.js via `npm run build:legal`, Drift-Test), E-Mail-Platzhalter gefüllt. Auf Vercel deployed (Projekt mysuplea-legal, live unter mysuplea-legal.vercel.app), Subdomain mysuplea.indoohome.com am Projekt registriert. Offen: EIN DNS-Eintrag bei united-domains (`A mysuplea 76.76.21.21`), danach Vertretungsberechtigte + EU-Vertreter aus Punkt 2/3 im Text nachtragen | Claude / Nadine | deployed, DNS-Eintrag offen |
| 8 | Gerätetest: Onboarding, Scan-Einwilligung, Erinnerungen, Backup | Nadine | offen |
| 9 | Apple Developer Account auf indoo home LLC + Store-Listing anlegen | Nadine | offen, nach Nadines Ansage: kommt "wenn alles fertig ist" |

## Reihenfolge und Gates (Council-Verdikt 2026-08-09, Konfidenz 80 %)

Kein UX-Nachschärf-Sprint: Die Differenzierung ist gebaut, nicht behauptet,
und die Konkurrenz (Scores, Mangel-Quizze, Biomarker-Deutung) kann sie nicht
kopieren, ohne ihr Geschäftsmodell aufzugeben. Stattdessen drei Gates in
fester Reihenfolge:

1. **Haiku-Test: ABGESCHLOSSEN 2026-08-10, Kill-Kriterium ausgeloest.**
   Haiku unter 50 % korrekte Substanz+Dosis (~4/9 vs. ~8/9 bei Opus),
   verstuemmelte Substanznamen bei hoeherer Konfidenz. Umstellung tot,
   ANALYZE_MODEL bleibt Opus. Beleg: launch/scan-quality-report-2026-08-10.md,
   Brain: decisions/2026-08-10-supplements-haiku-umstellung-verworfen.md.
   Folgeaufgabe: Fair-Use-Limit und Credits-Preis mit Opus-Kosten
   nachrechnen (vor Paywall-Aktivierung).
2. **Beta ohne Paywall**: Apple-Account → TestFlight, PAYWALL_ENFORCED
   bleibt false, dort zahlt niemand. Schwellen vorab: mindestens 50 %
   korrekte Scans, mindestens 30 % der Testerinnen schöpfen die 3
   Frei-Scans aus. Pivot bis 15.09.: unter 10 aktive Testerinnen oder 0
   organische Foto-Scans → Zielgruppenzugang neu (Apotheken-Winkel
   vorziehen), nicht UX umbauen.
3. **Öffentlicher Launch nur mit funktionierender Zahlung**: Product Hunt
   und Presse-Pitches werden ERST terminiert, wenn ein Sandbox-Testkauf
   durchgelaufen ist und PAYWALL_ENFORCED=true steht. Der Spike ist
   einmalig; bei 2,1 % Freemium-Basisrate liefert er grob 5 bis 25
   zahlende Kunden — und exakt 0, wenn niemand kaufen kann.

Eskalation bis 01.09.: Apple-Account nicht aktiv → Zeitplan ehrlich neu
setzen, Delegierbares abgeben. Erwartung kalibrieren: Der dauerhafte Kanal
(Bericht-Fußzeile, ASO) wiegt mittelfristig schwerer als der Launch-Tag.

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

- **Name:** MySuplea
- **Tagline:** `The supplement tracker that sells you nothing`
- **First Comment (Maker Comment), Entwurf:**

```
Hi Product Hunt! I built MySuplea because every supplement app I tried
was secretly a shop: affiliate links, brand rankings, "you might be
deficient" quizzes.

MySuplea takes the opposite position:
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

kurz und konkret: MySuplea ist eine neue App für Menschen, die mehrere
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
