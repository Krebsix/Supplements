# MySuplea Website: Landingpage DE/EN plus Rechtsseiten

Stand: 2026-08-30. Freigegeben von Nadine (Chat, 09:55 WITA): Astro in
`web/`, Beta-Anmeldung über Loops, Preisabschnitt ohne Zahlen.

Quellen: `launch/landingpage.md` (Copy, Struktur, Pflichtelemente),
`launch/story.md`, `launch/aso.md`, `theme.js` (Tokens),
`Brain/ventures/supplements.md`.

---

## 1. Ziel

Eine statische Landingpage für MySuplea in Deutsch und Englisch mit genau
einer Aktion: Beta-Anmeldung per E-Mail. Die bestehenden Rechtsseiten
(Datenschutz, Impressum, Nutzungsbedingungen) ziehen unter dieselbe Domain.
Eine dritte Sprache muss später mit einer Datei plus einem Config-Eintrag
möglich sein.

Nicht Ziel: Blog, CMS, Analytics, Store-Badges (kommen nach dem Listing),
Preiszahlen (erst nach Apple-Preisstufen), Dark Mode (theme.js hat keine
dunklen Tokens; die Seite deklariert `color-scheme: light`).

## 2. Stack

- **Astro** (aktuelle Major, statisches Output, kein Adapter), Projekt in
  `web/`. Eigene `package.json` dort; das Repo-Root bleibt Expo.
- **TypeScript strict** für Config, Wörterbücher und Skripte. Kein `any`.
- **Kein Client-JavaScript** außer zwei Stellen: Formular-Submit (fetch an
  Loops, Inline-Rückmeldung) und nichts sonst. Sprachwahl ist ein Link.
- **Keine externen Ressourcen.** Systemschrift-Stack, keine Google Fonts,
  kein CDN, keine Cookies. Damit bleibt die Seite bannerfrei und der Satz
  „kein Tracking" gilt auch für die Website.
- **@astrojs/sitemap** für `sitemap-index.xml` mit hreflang-Einträgen.
- Hosting: bestehendes Vercel-Projekt `mysuplea-legal` (Root Directory
  `web/`, Astro wird erkannt). Domain-Kauf und DNS sind Nadines Schritt.

## 3. Routing und Sprachen

```
/                 Landingpage DE (Default-Locale ohne Präfix)
/en/              Landingpage EN
/datenschutz/     Rechtsseite, zweisprachig auf einer Seite (Anker #de/#en)
/impressum/       dito
/nutzung/         dito
/imprint.html     301 → /impressum/   (alte Vercel-URLs)
/terms.html       301 → /nutzung/
```

Astro-i18n-Config: `defaultLocale: 'de'`, `locales: ['de', 'en']`,
`prefixDefaultLocale: false`. Jede Seite trägt `<html lang>`, `canonical`,
`hreflang` für de, en und `x-default` (= de).

Wörterbücher: `web/src/i18n/de.ts` und `web/src/i18n/en.ts`, beide
`satisfies Dictionary` gegen `web/src/i18n/types.ts`. Ein fehlender Schlüssel
ist ein Typfehler, kein leerer String zur Laufzeit. Neue Sprache = neue Datei
plus Eintrag in `web/src/i18n/index.ts` und `astro.config`.

Die Rechtsseiten bleiben generiert (`npm run build:legal` im Repo-Root),
Zielordner wird `web/public/<pfad>/index.html`. Der Drift-Test
`tests/legal-site.test.mjs` prüft weiter gegen die committeten Dateien.

## 4. Seitenaufbau (Reihenfolge ist Argumentation)

Alle Texte kommen aus `launch/landingpage.md`, mit echten Umlauten und ohne
Gedankenstriche. EN wird mit derselben Compliance-Disziplin übersetzt.

| # | Abschnitt | Inhalt |
|---|---|---|
| 0 | Kopfzeile | Wortmarke „MySuplea" (Icon + Text, da das Icon textfrei ist), Sprachwechsel als Link zur Gegenseite |
| 1 | Hero | H1 „Die Supplement-App, die dir nichts verkaufen will.", Subline, E-Mail-Feld mit Knopf „Für die Beta eintragen", Zeile „iPhone zuerst, Android folgt. Kein Konto nötig, keine Werbung, nie." Rechts ein iPhone-Mockup in HTML/CSS |
| 2 | Drei Tricks der Branche | Verkaufsdruck, Heilversprechen in Grau, Datensammeln; Schlusssatz „MySuplea macht keinen davon." |
| 3 | Vier Karten | Obergrenzen statt Empfehlungen, Tagessummen, Zitate statt Modellwissen, Beschwerden keine Kaufberatung. Je Haltung plus Beleg |
| 4 | Deine Daten | „Ohne Konto nutzbar. Verschlüsselt auf deinem Gerät." Sync bleibt mit „später" formuliert, bis Teilprojekt 2 live ist |
| 5 | Bericht | „Ein Bericht zum Mitnehmen." |
| 6 | Was die App nicht tut | Vier Zeilen als Liste, prominent |
| 7 | Preis | „Kostenlos. Pro finanziert die KI-Auswertung." Free-Umfang konkret, Pro-Umfang ohne Zahlen, Begründung (rund 25 Cent je Foto-Auswertung, belegt) |
| 8 | FAQ | Fünf Fragen, als `<details>`, zusätzlich als FAQPage-JSON-LD |
| 9 | Beta-Formular | Überschrift, Text, Feld, Knopf, Pflichthinweis (Double-Opt-In, Abmelden, Link Datenschutz) |
| 10 | Footer | „MySuplea ist ein Produkt von indoo home LLC.", Links Datenschutz · Impressum · Nutzungsbedingungen · Kontakt, ODbL-Zeile |

Das Hero-Formular und das Formular in Abschnitt 9 sind dieselbe Komponente.

## 5. iPhone-Mockup

Es gibt noch keine Screenshots. Das Gerät wird in HTML/CSS gebaut, Inhalt
aus dem Wörterbuch (also zweisprachig), Stil exakt nach `theme.js`: Canvas
`#f2f2f7`, weiße Karten ohne Rahmen, Radius 14, Systemschrift, 17pt.

Gezeigt wird das Dashboard mit der Tagessummen-Karte als Beleg für die
Kernaussage: eine Zeile „Magnesium 400 mg, Obergrenze 250 mg" im
Caution-Ton (`#96661a` auf `#fdf3e3`), darunter zwei unauffällige Zeilen im
Affirm-Ton, darunter ein Tagesplan-Slot „Morgen 07:00 bis 09:00" mit zwei
Präparaten. Keine erfundenen Marken, nur Wirkstoffnamen. Die Zahlen sind
fiktive Beispielwerte und stehen nicht als Fakt im Fließtext.

Reduced Motion wird respektiert; das Mockup bewegt sich nicht.

## 6. Design-Regeln

- Tokens in `web/src/styles/tokens.css` als CSS-Variablen, Werte wörtlich
  aus `theme.js`. Komponenten nutzen nur Variablen, keine Hex-Werte.
- Typografie: Systemschrift (`-apple-system, BlinkMacSystemFont, "Segoe UI",
  Roboto, Inter, sans-serif`), Fließtext 17px/1.5, H1 responsive zwischen
  34 und 56px mit `letter-spacing: -0.02em`, Eyebrow 13px uppercase.
- Flächen: grauer Grund, weiße Blöcke ohne Rahmen, Radius 14 (Karten) und
  20 (große Flächen). Keine Verläufe, keine Schatten außer einem sehr
  flachen auf dem Gerät.
- Icons: Feather-Stroke-SVG inline, 20px, Akzentfarbe. Keine Emojis.
- Statusfarben gedeckt wie in `toneFor()`. Rot nur für Überschreitung.
- Keine Gedankenstriche in Nutzertexten. Keine vollrunden Pillen, Knöpfe
  Radius 10.
- Layout: Container 1080px, Hero zweispaltig ab 900px, darunter gestapelt
  mit Mockup unter dem Formular. Abstände 96px zwischen Abschnitten auf
  Desktop, 64px mobil.
- Barrierefreiheit: Skip-Link, eine H1, Landmarken, sichtbarer Fokusring in
  Akzentfarbe, Kontraste mindestens 4.5:1 (inkMuted `#6c6c70` auf Canvas
  erfüllt das), Formularfeld mit Label, Fehlermeldung per `aria-live`.

## 7. Beta-Anmeldung

**Geändert 2026-08-30, 10:25 (Nadine):** Supabase statt Loops, „nicht
komplizierter als nötig“. Tabelle `public.beta_signups` (Migration
`20260830100000_beta_signups.sql`), Edge Function `beta-signup` (JSON-POST,
Honeypot, IP-Rate-Limit über `check_scan_rate_limit` mit Präfix `beta:`,
Duplikate still ignoriert, CORS nur eigene Origins). Kein Mailversand und
kein Double-Opt-In, weil Apple die TestFlight-Einladung selbst verschickt.
URL fest in `web/src/config.ts`, Override `PUBLIC_BETA_SIGNUP_URL`.
Der Loops-Absatz unten bleibt als Historie.

### Ursprünglich: Loops

- Endpoint aus `PUBLIC_LOOPS_FORM_ID` (Umgebungsvariable, Vercel) in
  `web/src/config.ts`. Ist die ID leer, rendert das Formular deaktiviert mit
  dem Hinweis „Anmeldung folgt" statt eines toten Knopfs.
- Submit per `fetch` an `https://app.loops.so/api/newsletter-form/<id>`,
  Body `application/x-www-form-urlencoded` mit `email`, `userGroup=beta`,
  `source=website-<lang>`. Antwort `{ success: true }` → Erfolgsmeldung
  inline („Fast geschafft. Bitte bestätige die Mail."), sonst Fehlermeldung
  mit Wiederholen. Double-Opt-In wird in Loops aktiviert (Nadines Schritt,
  im Runbook vermerkt).
- Honeypot-Feld gegen Bots, E-Mail-Validierung nativ (`type=email`,
  `required`).
- Ohne JavaScript: Formular postet nicht (Loops antwortet JSON, kein
  Redirect). `<noscript>` zeigt die Kontakt-Mail als Alternative.

## 8. SEO und Meta

- Title/Description je Sprache aus `launch/landingpage.md` Abschnitt 7.
- Open Graph + Twitter Card, OG-Bild 1200×630 unter
  `web/public/og/<lang>.png`, erzeugt durch `web/scripts/og.mjs` (Icon auf
  Canvas-Farbe plus Headline). Wird committet, nicht beim Deploy gebaut.
- JSON-LD: `SoftwareApplication` (Name, Betreiberin, Plattformen,
  `offers` price 0), `FAQPage`, `Organization`.
- `robots.txt` erlaubt alles, verweist auf die Sitemap.
- Favicon aus `assets/favicon.png` (plus SVG-Variante aus
  `assets/source/icon.svg`), Apple-Touch-Icon 180px aus `assets/icon.png`.

## 9. Rechtsseiten-Umzug

- `scripts/legalSiteTemplate.mjs`: Dateinamen-Mapping wird
  `datenschutz/index.html`, `impressum/index.html`, `nutzung/index.html`;
  interne Links entsprechend (`/impressum/` statt `imprint.html`), zurück
  zur Startseite verlinkt. Überschriften wechseln von Georgia auf die
  Systemschrift, damit die Seiten zur Landingpage passen; Tokens bleiben.
- `scripts/build-legal-site.mjs`: `outDir` wird `web/public`.
- `tests/legal-site.test.mjs`: Pfade nachziehen. Zusätzlich prüft der Test,
  dass jeder Wert aus `web/src/styles/tokens.css` wörtlich in `theme.js`
  steht (ersetzt die `WEB_TOKENS`-Prüfung, die Palette hat jetzt eine
  Quelle für beide Seiten).
- `web/vercel.json`: 301 für `imprint.html` und `terms.html`.
- Die alten Dateien `web/index.html`, `imprint.html`, `terms.html` werden
  gelöscht.

## 10. Tests

Im Repo-Root (`npm test`):
- `tests/legal-site.test.mjs` wie oben.

In `web/` (`npm test` dort, plus `npm run check` für Astro/TypeScript):
- `web/tests/i18n.test.mjs`: beide Wörterbücher haben identische
  Schlüsselmengen; kein Gedankenstrich in irgendeinem Wert; Verbotswörter
  DE (hilft, wirkt, heilt, behebt, empfohlen) und EN (cure, heals, treats,
  boosts, recommended, you should) kommen in keinem Wert vor; kein „kein
  Konto" ohne „nutzbar" (die Formulierung ist seit 2026-08-29 „ohne Konto
  nutzbar").
- `web/tests/build.test.mjs`: nach `astro build` existieren `dist/index.html`,
  `dist/en/index.html`, `dist/datenschutz/index.html`; jede Seite hat genau
  eine H1, `hreflang`-Links für de/en/x-default, keine externen
  `<script src>` oder `<link href="http`.

Visueller Check vor dem Commit: Screenshots Desktop (1440) und Mobil (390)
beider Sprachen, Fokusreihenfolge per Tastatur einmal durch.

## 11. Nicht in dieser Arbeit

- Domain kaufen, DNS, Vercel-Domain-Zuordnung (Nadine).
- Loops-Account, Form-ID, Double-Opt-In aktivieren (Nadine; ID kommt als
  Vercel-Env).
- Impressum-Platzhalter (Vertretungsberechtigte, EU-Vertreter) füllen.
- Website-Abschnitt in der Datenschutzerklärung (Vercel-Logs,
  Beta-Anmeldung über Loops). Wird als offener Punkt in
  `launch/landingpage.md` vermerkt, gehört in `data/legalContent.js`.
- Push und Deploy: nur nach Nadines OK.
