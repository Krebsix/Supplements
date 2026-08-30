# Landingpage MySuplea: Inhalte, Copy, Pflichtelemente

Stand: 2026-08-30. GEBAUT: Astro-Projekt in `web/` (DE unter `/`, EN unter
`/en/`, Rechtsseiten unter `/datenschutz/`, `/impressum/`, `/nutzung/`).
Spec: docs/superpowers/specs/2026-08-30-website-design.md. Der Text unten
ist die Copy-Quelle; die gebaute Fassung liegt in `web/src/i18n/de.ts` und
`en.ts` (dort mit echten Umlauten, Test erzwingt die Compliance-Regeln).

## Runbook bis live (Nadines Schritte)

1. Loops: Account, Formular anlegen, Double-Opt-In aktivieren, Form-ID
   kopieren. Vercel-Projekt `mysuplea-legal`: Env `PUBLIC_LOOPS_FORM_ID`
   setzen (Encrypted, nicht Sensitive). Ohne die ID zeigt die Seite das
   Formular deaktiviert mit Kontakt-Mail.
2. Vercel: Root Directory des Projekts auf `web/` pruefen (Astro wird
   erkannt), Build `npm run build`, Output `dist`.
3. Domain mysuplea.com kaufen und dem Vercel-Projekt zuweisen. Alte
   URLs (`/imprint.html`, `/terms.html`, `/index.html`) leiten per
   `web/vercel.json` auf die neuen Pfade um.
4. Datenschutzerklaerung: Website-Abschnitt in `data/legalContent.js`
   nachziehen (Vercel-Logs, Beta-Anmeldung ueber Loops mit DPA), dann
   `npm run build:legal` und `web/public/` mitcommitten.
5. Kontakt-Mail `hello@mysuplea.com` (web/src/config.ts) einrichten oder
   auf die indoohome-Adresse aendern.
6. Impressum-Platzhalter (Vertretung, EU-Vertreter) fuellen.

Lokal: `cd web && npm install && npm run dev`. OG-Bilder neu: `npm run og`.

Copy-paste-fertig. Haelt die Compliance-Regeln der App
ein (keine Heilversprechen, keine Empfehlungen, keine Gedankenstriche) und
den Stand nach der Konto-Grundlage: "ohne Konto nutzbar", nicht mehr
"kein Konto".

Quellen: launch/story.md (Positionierung), launch/aso.md (Store-Texte),
data/legalContent.js (Rechtstexte), Brain/ventures/supplements.md.

---

## 1. Zweck und eine Aktion

Phase jetzt: Vor-Launch. Die App ist nicht im Store, die Beta laeuft ueber
TestFlight, sobald der Apple-Account steht.

**Primaere Aktion:** Beta-Anmeldung per E-Mail. Sonst nichts. Keine
zweite Aktion, kein Shop, kein Newsletter neben der Beta.

Nach dem Store-Launch wird der Knopf gegen zwei Store-Badges getauscht,
der Rest der Seite bleibt.

Zielgruppen, in dieser Reihenfolge:
1. Menschen in DACH, die drei bis zehn Praeparate nehmen und ein
   ungutes Gefuehl bei Apps haben, die ihnen dabei etwas verkaufen.
2. Datenschutz-affine Leserinnen (heise, netzpolitik).
3. Fachpublikum (Apotheke, Praxis, Ernaehrungsberatung), das den Bericht
   als Werkzeug sieht.

Traffic kommt aus Presse-Pitches und Product Hunt, nicht aus Ads. Die
Seite muss ohne Vorwissen tragen.

---

## 2. Domain und Hosting (Entscheidung faellig)

- `mysuplea.com` und `mysuplea.de` waren am 2026-08-11 laut Whois frei.
- Rechtsseiten liegen heute unter `mysuplea-legal.vercel.app`, die
  Subdomain `mysuplea.indoohome.com` wartet auf einen DNS-Eintrag.

Empfehlung: `mysuplea.com` kaufen (united-domains, wo die anderen Domains
liegen), Landingpage und Rechtsseiten unter EINER Domain:

```
mysuplea.com/              Landingpage
mysuplea.com/datenschutz   aus web/index.html
mysuplea.com/impressum     aus web/imprint.html
mysuplea.com/nutzung       aus web/terms.html (in Arbeit)
```

Grund: Die App-Stores verlangen eine Datenschutz-URL, und die sollte auf
der Marken-Domain liegen, nicht auf vercel.app oder indoohome.com. Ein
Umzug nach dem Store-Listing bedeutet Store-Updates in beiden Stores.

Hosting: Vercel, wie die Rechtsseiten. Statisches HTML reicht. Kein CMS.

---

## 3. Seitenstruktur mit Copy (DE)

Reihenfolge ist Argumentation: erst der Gegner, dann die Haltung, dann
der Beleg, dann die Daten, dann die Aktion.

### Hero

**Headline:**
Die Supplement-App, die dir nichts verkaufen will.

**Subline:**
MySuplea ordnet ein, was du nimmst, rechnet Tagessummen gegen
veroeffentlichte Obergrenzen und zitiert jede Quelle woertlich. Deine
Daten bleiben auf deinem Geraet.

**Knopf:** Fuer die Beta eintragen
**Unter dem Knopf:** iPhone zuerst, Android folgt. Kein Konto noetig,
keine Werbung, nie.

Alternativen Headline:
- A: "Obergrenzen statt Empfehlungen." (Fachpublikum, sachlicher)
- B: "Drei Praeparate, eine Summe." (konkretes Detail, weckt Neugier)
- C: "Deine Supplements. Deine Daten. Kein Verkaufsdruck." (Datenschutz-Fokus)

Empfehlung: die Haupt-Headline. Der Kontrast zur Branche ist die
Nachricht, und er ist in einem Satz verstaendlich.

### Abschnitt "Was die anderen Apps machen"

**Ueberschrift:** Der Supplement-Markt lebt von drei Tricks.

Verkaufsdruck: Die "Empfehlung" im Tracker ist eine Provision. Wer dir
Magnesium vorschlaegt, verdient am Klick.

Heilversprechen in Grau: "Koennte helfen bei", Sternchen, ein Quiz, das
dir einen Mangel diagnostiziert. Fachlich unhaltbar, rechtlich heikel.

Datensammeln: Beschwerden, Laborwerte, Medikamente landen auf Servern,
deren Geschaeftsmodell niemand kennt.

MySuplea macht keinen davon. Das ist kein Versprechen, das ist im Produkt
nachpruefbar gebaut.

### Abschnitt "Was MySuplea stattdessen macht"

Vier Karten, je Haltung plus Beleg. Nicht mehr.

**Obergrenzen statt Empfehlungen**
"Enthaelt 400 mg, die Obergrenze liegt bei 250 mg." Die App zeigt den
Referenzwert. Sie sagt nie "nimm X".

**Tagessummen ueber alles, was du nimmst**
Drei unauffaellige Praeparate koennen zusammen die Obergrenze reissen.
MySuplea addiert Wirkstoffe ueber deinen ganzen Bestand, nicht pro Dose.

**Zitate statt Modellwissen**
Hinweise zu Medikamenten sind woertliche Zitate aus EFSA, BfR, HMPC und
NIH. Ein automatischer Test bricht den Build, wenn ein Zitat nicht mehr
woertlich in der Quelle steht.

**Beschwerden werden nicht zur Kaufberatung**
Wer "muede" eingibt, bekommt zuerst die Einordnung, dann Schlaf, Stress
und Medikamente als haeufigste Ursachenbereiche. Naehrstoffe stehen ganz
unten, eingeklappt.

### Abschnitt "Deine Daten"

**Ueberschrift:** Ohne Konto nutzbar. Verschluesselt auf deinem Geraet.

Alles, was du eingibst, bleibt auf dem Handy, AES-256-verschluesselt.
Backup als Datei, komplettes Loeschen mit einem Tippen.

Ein Konto ist freiwillig. Wer eines anlegt, bekommt spaeter Sync auf
mehrere Geraete; der Schluessel dafuer entsteht auf dem Geraet, und aus
den gespeicherten Daten allein kann niemand etwas lesen, auch wir nicht.

Nur die freiwillige Foto-Analyse schickt Etikettenfotos zur Auswertung,
nach ausdruecklicher Zustimmung, und speichert sie nicht.

Hinweis fuer die Umsetzung: Der Konto-Absatz muss sachlich bleiben, weil
Sync noch nicht gebaut ist. "Spaeter" bleibt drin, bis Teilprojekt 2 live
ist.

### Abschnitt "Fuer die Sprechstunde"

**Ueberschrift:** Ein Bericht zum Mitnehmen.

Praeparate, Dosen, Tagessummen, Laborwerte im Verlauf: als Uebersicht
fuer Praxis oder Apotheke, Abschnitte waehlbar. Die Bewertung gehoert
dorthin, nicht in eine App.

### Abschnitt "Was die App nicht tut"

Kurze Liste, bewusst prominent. Bei einer Gesundheits-App ist das der
Vertrauensbeweis.

- Sie empfiehlt keine Produkte und keine Dosierungen.
- Sie bewertet keine Marken und verlinkt keine Shops.
- Sie stellt keine Diagnosen und ersetzt keine aerztliche Beratung.
- Sie zeigt keine Werbung und verkauft keine Daten.

### Abschnitt "Preis"

**Ueberschrift:** Kostenlos. Pro finanziert die KI-Auswertung.

Kostenlos fuer immer: Barcode-Scan ohne Limit, drei KI-Foto-Scans, bis zu
fuenf Praeparate, Bericht und Backup.

Pro: 29,99 Euro im Jahr oder 4,99 im Monat. Unbegrenzte KI-Scans (Fair
Use), unbegrenzter Bestand, Wirkungskontrolle, Kostenanalyse,
Laborwerte-Verlauf, Kur-Zyklen. Wer nicht abonnieren will, kauft
Scan-Pakete einzeln.

Warum ueberhaupt Geld: Jede Foto-Auswertung kostet uns rund 25 Cent bei
der KI. Das Abo bezahlt das und die Pflege der Wirkstoff-Datenbank. Kein
Affiliate, keine Werbung, keine Markenkooperation.

Hinweis: Preise erst anzeigen, wenn der Store-Preis festgelegt ist
(Apple rundet auf Preisstufen). Bis dahin Abschnitt ohne Zahlen: "Kostenlos
mit optionalem Pro-Abo."

### FAQ (fuenf Fragen, mehr nicht)

**Wovon lebt die App, wenn sie nichts verkauft?**
Vom Pro-Abo. Das finanziert die KI-Auswertung der Scans und die Pflege der
Datenbank. Beides sind echte laufende Kosten.

**Warum sagt die App nicht, was ich nehmen soll?**
Weil sie weder Befund noch Medikationshistorie beurteilen kann und darf.
Sie ordnet ein und dokumentiert. Die Bewertung gehoert in die Praxis oder
Apotheke, dafuer gibt es den Bericht.

**Brauche ich ein Konto?**
Nein. Die App laeuft komplett ohne. Ein Konto ist die Grundlage fuer
Sync auf mehrere Geraete, den wir gerade bauen.

**Woher kommen die Referenzwerte?**
Aus veroeffentlichten Quellen: D-A-CH-Referenzwerte, EFSA, BfR, HMPC,
NIH. Jeder Hinweis nennt seine Quelle woertlich.

**Fuer wen ist die App nicht gedacht?**
Fuer niemanden unter 16 und fuer niemanden, der eine Diagnose sucht.
MySuplea ersetzt keine aerztliche Beratung.

### Beta-Anmeldung (Formular)

**Ueberschrift:** Die Beta startet auf iPhone.
**Text:** Trag dich ein, wir schicken dir den TestFlight-Link, wenn es
losgeht. Eine Mail, keine Serie.
**Feld:** E-Mail-Adresse
**Knopf:** Fuer die Beta eintragen
**Pflichthinweis unter dem Feld:** Du bekommst eine Bestaetigungsmail.
Erst nach dem Klick darin bist du eingetragen. Abmelden jederzeit mit
einem Klick. Details in der Datenschutzerklaerung.

### Footer

MySuplea ist ein Produkt von indoo home LLC.
Links: Datenschutz · Impressum · Nutzungsbedingungen · Kontakt
Zeile: Produktdaten teilweise aus Open Food Facts, Lizenz ODbL.

---

## 4. Fakten-Block (fuer Redaktion und Presse-Kit)

| Fakt | Wert |
|---|---|
| Name | MySuplea |
| Plattformen | iPhone (Beta zuerst), Android |
| Betreiberin | indoo home LLC, Sheridan, WY, USA |
| Preis | Kostenlos; Pro 29,99 Euro/Jahr oder 4,99/Monat; Scan-Credits einzeln |
| Datenhaltung | lokal, AES-256; Konto freiwillig; Server nur fuer Konto-Umschlaege und freiwillige Foto-Analyse |
| Serverstandort | Supabase, West EU (Irland); Foto-Analyse ueber Anthropic (USA, SCC) |
| Quellen | D-A-CH, EFSA, BfR, HMPC, NIH; Produktdaten: Open Food Facts (ODbL) |
| Sprachen | Deutsch, Englisch |
| Kein | Werbung, Affiliate, Markenranking, Datenverkauf, Tracking |

Presse-Boilerplate DE und EN: siehe launch/story.md, Abschnitt Boilerplate.
Anpassung dort noetig: "kein Konto" wird zu "ohne Konto nutzbar".

---

## 5. Pflichtelemente und Datenschutz der Website

Die Datenschutzerklaerung in `data/legalContent.js` beschreibt die APP.
Die Website braucht einen eigenen Abschnitt, bevor sie live geht:

1. **Hosting Vercel:** Server-Logs (IP, Zeit, User-Agent), Vercel Inc.,
   USA, Standardvertragsklauseln. Rechtsgrundlage berechtigtes Interesse
   (Art. 6 Abs. 1 lit. f).
2. **Beta-Anmeldung:** E-Mail-Adresse, Zeitpunkt, Double-Opt-In-Nachweis.
   Zweck: einmalige Einladung zur Beta. Rechtsgrundlage Einwilligung,
   jederzeit widerrufbar. Anbieter nennen (siehe Entscheidung unten), AVV
   mit dem Anbieter in launch/avv-dokumentation.md aufnehmen.
3. **Keine Cookies, kein Tracking.** Dann ist kein Consent-Banner noetig.
   Wenn Analytics gewuenscht: nur ein Tool ohne Cookies und ohne
   Personenbezug (Plausible, EU-Hosting). Auch dann in die Erklaerung.
4. **Impressum** auf jeder Seite verlinkt, mit vertretungsberechtigter
   Person (noch offen) und EU-Vertreter Art. 27 (noch offen). Ohne die
   beiden ist die Seite formal unvollstaendig; live gehen ist trotzdem
   moeglich, aber die Luecke ist abmahnfaehig.
5. **Nutzungsbedingungen** verlinkt (Entwurf in Arbeit).
6. **ODbL-Attribution** fuer Open Food Facts im Footer.

Compliance der Copy (gilt fuer jeden neuen Satz):
- Keine Woerter aus der Familie hilft, wirkt, heilt, behebt, empfohlen.
- Keine Aussage, dass die App eine Wirkung erkennt oder bewertet.
- Keine Gedankenstriche.
- Zahlen nur, wenn sie belegt sind (25 Cent je Scan: Opus-Preis, Stand
  2026-08-10, in Brain/ventures/supplements.md).

---

## 6. Assets, die noch fehlen

| Asset | Stand | Quelle |
|---|---|---|
| App-Icon 1024 | fertig | assets/icon.png |
| Wortmarke "MySuplea" lesbar | offen | Nadine (Icon ist textfrei) |
| 6 Screenshots im Geraeterahmen | offen, Dramaturgie steht | launch/aso.md, Abschnitt Screenshots |
| OG-Image 1200x630 | offen | Icon plus Headline auf canvas-Farbe |
| Favicon | fertig | assets/favicon.png |
| Store-Badges | erst nach Listing | Apple/Google |

Stil der Seite: der Look der App (Systemschrift, gruppierte Karten,
canvas-Hintergrund `#f2f2f7`, Akzent `#1c4f5c` aus theme.js). Kein
Stockfoto, kein Verlauf, keine Illustration von Kapseln im Regen.

---

## 7. Meta und SEO

**Title:** MySuplea: Supplement-Tracker ohne Verkaufsinteresse
**Description (DE, 155 Zeichen):** Einnahmeplan, Tagessummen gegen
Obergrenzen, woertlich zitierte Quellen. Ohne Konto nutzbar, Daten
verschluesselt auf deinem Geraet. Beta fuer iPhone.
**Title EN:** MySuplea: the supplement tracker that sells nothing
**Description EN:** Intake plan, daily totals against upper limits,
sources quoted verbatim. Works without an account, data encrypted on
your device. iPhone beta.

Keywords fuer den Text (nicht stopfen): Supplement-Tracker,
Nahrungsergaenzung App, Obergrenzen, Wechselwirkungen, Laborwerte,
Datenschutz.

---

## 8. Entscheidungen (getroffen 2026-08-30)

1. **Domain:** mysuplea.com, Kauf steht noch aus (Runbook oben).
2. **Beta-Anmeldung:** Loops (Nadine, 2026-08-30). Formular gebaut,
   Form-ID kommt als Vercel-Env.
3. **Analytics:** keine. Seite ist bannerfrei, laedt nichts nach.
4. **Englische Version:** sofort mit gebaut (Nadine, 2026-08-30),
   Woerterbuch-Architektur erlaubt weitere Sprachen mit einer Datei.
5. **Preise anzeigen:** nein, bis die Store-Preisstufen feststehen.
   Abschnitt nennt Free-Umfang und Pro-Umfang ohne Zahlen.
