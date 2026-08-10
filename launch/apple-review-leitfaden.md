# Apple-Review-Leitfaden: Formulierungen und Einreichung

Stand: 2026-08-10. Quelle: App Store Review Guidelines
(developer.apple.com/app-store/review/guidelines, abgerufen 2026-08-10).
Verbindlich fuer JEDEN neuen Nutzertext. Wer einen Text schreibt, der eine
der Regeln hier beruehrt, prueft ihn gegen diese Datei.

## Warum das kritisch ist

Gesundheits-Apps laufen bei Apple unter verschaerfter Pruefung (Guideline
1.4.1: "Medical apps ... may be reviewed with greater scrutiny"). Eine
Ablehnung kostet Wochen. Unsere bestehenden harten Regeln (CLAUDE.md)
decken das meiste bereits ab, weil sie aus derselben Logik kommen
(MDR-Abgrenzung, Health-Claims-Verordnung). Diese Datei uebersetzt sie in
die Apple-Perspektive und haelt die Luecken fest.

## Guideline-Mapping

### 1.4.1 Medizinische Apps (Genauigkeit, Diagnose, Behandlung)
- Die App diagnostiziert nicht, behandelt nicht, interpretiert keine
  Laborwerte. Das ist bereits harte Regel und muss so bleiben: kein
  "zu niedrig", kein "Mangel", keine Ampel.
- Accuracy-Claims: Wir behaupten KEINE Messgenauigkeit. Der Scan zeigt
  seine Konfidenz und den Herkunftsmodus (analysisMode), Unerkanntes
  bleibt leer. Nie mit "praezise", "exakt", "medizinisch geprueft" werben,
  weder in der App noch im Store-Text.
- Apple erwartet den Hinweis, zusaetzlich aerztlichen Rat einzuholen
  ("remind users to check with a doctor ... before making medical
  decisions"). Unser Muster erfuellt das inhaltlich (Fragen fuer die
  Praxis, Bericht fuer Praxis/Apotheke, Packungsbeilagen-Verweise) —
  OFFEN: ein expliziter, gut auffindbarer Satz im Onboarding und in den
  Store-Notes, siehe Checkliste.

### 1.4.2 Dosierrechner
Apple laesst Arzneimittel-Dosierrechner nur von Herstellern, Kliniken,
Apotheken oder behoerdlich zugelassenen Anbietern zu. Deshalb darf die
App NIE als Dosierrechner erscheinen:
- Referenzwerte ANZEIGEN ("enthaelt 400 mg, die Obergrenze liegt bei
  250 mg"), niemals Dosen EMPFEHLEN ("nimm 200 mg").
- Der DoseNormalizer rechnet Etikettenangaben um, er berechnet keine
  Einnahmedosen. Formulierungen muessen das spiegeln: "auf dem Etikett
  steht", "entspricht rund", nie "du solltest nehmen".
- Fuer Produkte der Klassen arznei/homoeopathikum gilt ausschliesslich
  der Packungsbeilagen-Verweis (seedCatalog.class.* in i18n).

### 5.1.3 Health Data (Werbung, iCloud, Einwilligung)
- Gesundheitsdaten duerfen nicht fuer Werbung/Marketing/Data-Mining
  verwendet werden: erfuellt, alles bleibt lokal, kein Tracking, kein
  Werbenetzwerk. Das bleibt auch bei spaeteren Werbepartnerschaften die
  Grenze: Siegel-Infos ja, personalisierte Werbung aus Bestandsdaten nie.
- "may not store personal health information in iCloud": Wir nutzen kein
  CloudKit und keinen iCloud-Sync. Das JSON-Backup laeuft ueber das
  System-Share-Sheet in Nutzerhand. Bei App-Store-Fragebogen entsprechend
  angeben.
- Einwilligung vor Datenerhebung (5.1.1(ii)): erfuellt ueber Onboarding-
  Kenntnisnahme und Scan-Einwilligung (consents im Store).
- Keine Pflicht-Registrierung (5.1.1(v)): erfuellt, die App hat keine
  Accounts.

### 3.1.2 Abos
- Vor dem Kauf klar sagen, was das Abo enthaelt (Scans, Umfang, Preis,
  Laufzeit). Der Paywall-Screen muss Preis, Zeitraum und Leistungsumfang
  nennen und auf Datenschutz + Nutzungsbedingungen verlinken.
- Kein Zwang zu Zusatzhandlungen (Social-Posts, Kontakte) fuer bezahlte
  Leistung.
- Kauf NUR ueber Apple In-App-Purchase (3.1.1), kein Verweis auf externe
  Zahlwege aus der App heraus.

## Formulierungsregeln (Kurzfassung fuer jeden neuen Text)

1. Deskriptiv, nie praeskriptiv: "wird eingesetzt bei", nie "hilft bei".
2. Befunde beschreiben, nie bewerten: "dazu ist ein Hinweis hinterlegt",
   nie "das ist gefaehrlich fuer dich".
3. Keine Dosier-Imperative: Zahlen vom Etikett und Referenzwerte zeigen,
   keine Einnahmemengen vorschlagen.
4. Arznei und Homoeopathie: immer Packungsbeilage + Arztpraxis/Apotheke
   als zustaendige Stelle nennen, keine Indikationen uebernehmen.
5. Keine Genauigkeits- oder Heilversprechen, auch nicht im Store-Listing,
   in Screenshots-Captions oder Release-Notes. Die EN-Verbotswoerter
   (cure/heals/treats/boosts/recommended/you should) gelten dort genauso.
6. Wirkungskontrolle: "deine Bewertung ist gestiegen", nie "es wirkt".

## Einreichungs-Checkliste (offen, vor Submission abarbeiten)

- [ ] Expliziter Arzt-Hinweis-Satz im Onboarding ergaenzen (1.4.1),
      Muster: "Die App ersetzt keine aerztliche Beratung. Besprich
      Entscheidungen zu Praeparaten mit Arztpraxis oder Apotheke."
      Gleicher Satz in die App-Store-Beschreibung und Review-Notes.
- [ ] App Privacy Labels (Nutzungsdaten-Fragebogen): Health & Fitness
      als "gesammelt, nicht verknuepft, kein Tracking" nur falls Apple
      lokale Daten als Erhebung wertet — vor dem Ausfuellen die aktuelle
      Definition pruefen (lokal ohne Uebertragung zaehlt nicht als
      "collected"; die Scan-Fotos an Supabase/Anthropic dagegen schon:
      als "Photos, nicht verknuepft, kein Tracking" deklarieren).
- [ ] Review-Notes vorbereiten: Was die App bewusst NICHT tut (keine
      Diagnose, keine Dosierempfehlung, keine Laborwert-Interpretation),
      Datenfluss des Scans (einmalige Uebertragung, keine Speicherung),
      Demo-Ablauf ohne Account.
- [ ] Paywall-Screen gegen 3.1.2(c) pruefen: Preis, Laufzeit, Leistung,
      Links auf Privacy Policy und Terms (EULA).
- [ ] Store-Metadaten (Titel, Untertitel, Keywords, Screenshots) gegen
      die Formulierungsregeln oben lesen, DE und EN.
- [ ] Support-URL und Datenschutz-URL (statische Seite aus
      data/legalContent.js) live schalten.
