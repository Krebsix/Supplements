# Handoff: MySuplea Landing Page (v2)

## Overview
Neue Landing Page für mysuplea.com (aktuell mysuplea-legal.vercel.app). Stil: „Evidenz-Dossier“ — Weiß + Logo-Navy + Azur, harte 1.5px-Linien, Offset-Schatten, Mono-Labels, schwebende Kapsel-Formen. Enthält zusätzlich eine **Claims-Checkliste**: jede Aussage der Landing Page muss gegen den App-Code geprüft werden, bevor sie live geht.

## About the Design File
`MySuplea Landing v2.dc.html` ist eine **Design-Referenz in HTML** (Prototyp mit Inline-Styles), kein Produktionscode. Aufgabe: das Design im bestehenden Landing-Page-Projekt (Vercel) nachbauen. Die Inline-Styles sind die verbindliche Quelle für alle Werte. Die Datenlisten (Karten-Inhalte, FAQ) stehen im `class Component`-Block am Dateiende.

## Fidelity
**High-fidelity.** Farben, Typografie, Abstände, Linien und Animationen pixelgenau übernehmen.

## Design Tokens
### Farben (nur Logo-Farbwelt)
- Hintergrund: `#FFFFFF` (hell) und `#0B2239` (Navy-Sektionen/Footer)
- Navy-Flächen sekundär: `#0B2E4F` (Buttons, Pro-Karte)
- Akzent Azur: `#1E6FD9` · auf dunkel: `#6FA8EF` (Labels), `#9FB2C6`/`#C6D3E1` (Text auf Navy)
- Text: `#0B2239` primär, `#44586E` sekundär, `#8A99A9`/`#93A3B5` gedämpft
- Hover-Tint hell: `#F4F8FD` · Highlight: `rgba(30,111,217,0.12)`
- Statusfarben nur im Phone-Mock: `#C24A1F` (über Obergrenze), `#1E8E5A` (ok/erledigt)
- Linien: `1.5px solid #0B2239` (hell) bzw. `rgba(255,255,255,0.25)` gedashed (dunkel)

### Typografie (Google Fonts)
- **Space Grotesk** (500/600/700) — Headlines, Wortmarke, große Zahlen
- **IBM Plex Sans** (400–700) — Body
- **IBM Plex Mono** (400–600) — Labels/Eyebrows (11–13px, uppercase, letter-spacing 0.08–0.16em), Buttons, Footer, Werte
- H1: `clamp(46px, 6vw, 86px)`, line-height 0.99, letter-spacing -0.035em
- H2: `clamp(32px, 4.6vw, 60px)`, line-height 1.02, letter-spacing -0.03em
- Highlight im H1/Text: Azur-Farbe + `box-shadow: inset 0 -0.22em 0 rgba(30,111,217,0.16)`

### Signatur-Elemente
- Sektions-Header: Mono-Label links („Befund 01“, „Prinzip 02“, „Protokoll 03“, „Modell 04“, „Anhang 05“) + gestrichelte Linie + Kontext-Label rechts
- Offset-Schatten statt Soft-Shadows: `box-shadow: 5px 5px 0 #0B2E4F` (Formular), `6px 6px 0 #1E6FD9` (Bericht-Karte)
- Grids als Hairline-Tabellen: Karten in einem Container mit `border: 1.5px solid #0B2239; background: #0B2239; gap: 1.5px`
- Rotierender Stempel (SVG, 126px, 26s Rotation): Kreis Azur, Umlauftext „QUELLEN ZITIERT · DATEN LOKAL ·“, Zentrum „AES-256“
- Schwebende Kapsel-Deko im Hero: zweifarbige Pille (Navy/Azur, 130×52), Outline-Kapsel (150×60), transparente Pille (84×34), 2 Punkte; `drift`-Animation 9–13s
- Quellen-Ticker (Navy-Band, Endlos-Marquee 30s): D-A-CH, EFSA, BfR, HMPC, NIH, Open Food Facts, Kölner Liste, USP, GMP, Informed Sport
- Store-Badges im Hero: „Bald im App Store“ (Navy) / „Bald bei Google Play“ (Outline), CSS-Pills — beim Launch durch offizielle Badges ersetzen

### Motion
- Load: `fadeUp` gestaffelt (0.7–1s, +0.12s) · Scroll-Reveal: IntersectionObserver threshold 0.12, translateY(30px)→0, 0.7s cubic-bezier(.2,.7,.2,1), einmalig
- `prefers-reduced-motion: reduce` deaktiviert alles

## Struktur (Sektionen in Reihenfolge)
1. **Header** (fixed, 64px, blur, Border unten 1.5px Navy): Logo+Wortmarke, Mono-Zeile „Quellen zitiert · Daten lokal“, Nav (Daten/Preis/Fragen/Beta→)
2. **Hero**: Badge (Pulse-Dot) „Beta für iPhone, Android folgt“ · H1 „Supplements im Griff. *Belegt statt behauptet.*“ · Beschreibung · E-Mail-Formular (Border-Box mit Offset-Schatten, Button „Eintragen“) · Datenschutz-Hinweis · Store-Badges · rechts iPhone-Mock (Tagessummen mit Obergrenzen-Balken, Morgen-Slots) + rotierender Stempel · Kapsel-Deko im Hintergrund
3. **Quellen-Ticker** (Navy-Band)
4. **Befund 01 / Der Markt**: „Der Supplement-Markt lebt von drei Tricks.“ 3 Kontrast-Karten, je zweigeteilt: oben „ANDERE APPS“ (Trick: Verkaufsdruck / Heilversprechen in Grau / Datensammeln), unten blau getönt „DESHALB MYSUPLEA“ (unsere Antwort). Schluss: „Darum gibt es MySuplea: einordnen statt verkaufen. Jeder dieser Punkte ist nachprüfbar im Produkt gebaut.“
5. **Prinzip 02 / Die Haltung**: 4 Tabellenzeilen (Tag REF 01…TRI 04 / Titel / Text), darunter großes Zitat „Enthält 400 mg, die Obergrenze liegt bei 250 mg…“
6. **Protokoll 03 / Deine Daten** (Navy): H2 „Deine Routine, deine Werte, dein Gerät.“ · 3 Absätze · Fakten-Tabelle (Verschlüsselung/Schlüssel/Backup/Löschen) · rechts weiße Bericht-Karte + gestrichelte „Klare Grenzen“-Karte
7. **Modell 04 / Preis**: 3 Spalten — Kostenlos (Stufe A) / Pro Navy (Stufe B · Optional) / „Warum überhaupt Geld“ (Transparenz)
8. **Anhang 05 / Fragen**: Akkordeon, 1.5px-Zeilen, +/− Mono-Marker, eine offen zugleich
9. **Beta-CTA** (Navy, zentriert): Icon, „Die Beta startet auf iPhone.“, Formular mit Azur-Offset-Schatten
10. **Footer** (Navy, Mono): „MySuplea ist ein Produkt von indoo home LLC.“, Links (Datenschutz/Impressum/Nutzungsbedingungen/Kontakt), ODbL-Hinweis

## Interaktionen
- E-Mail-Formulare (Hero + Beta, gleicher State): Validierung `\S+@\S+\.\S+`, Button-Label wird „Eingetragen ✓“ — in Produktion an das bestehende Beta-Formular/Backend anschließen
- FAQ-Akkordeon · Anchor-Nav (#data, #pricing, #faq, #beta) · smooth scroll
- Responsive: Grids unter ~900px einspaltig, Kapsel-Deko auf Mobile reduzieren/ausblenden, Mono-Zeile im Header ab ~1000px ausblenden

## Sprachregeln (verbindlich, vom Gründer vorgegeben)
- **Kein Wort „Medikamente/Medikation“** — nur Supplements/Wirkstoffe/Präparate
- **Kein Versprechen „keine Werbung / kein Shop / nie“** — nirgends wieder einführen
- **Keine Gedankenstriche (—)** im Fließtext; normale Kommas/Punkte
- Keine Dosierungsempfehlungen, keine Diagnose-Sprache, keine Wirkversprechen

## WICHTIG: Claims-Verifikation gegen die App
Jede Behauptung der Landing Page MUSS vor Livegang gegen den tatsächlichen App-Code (React Native / Expo Repo) geprüft werden. Checkliste in `CLAIMS_CHECKLIST.md`. Vorgehen: Claim im Code suchen, Fundstelle notieren, Status setzen (✅ belegt / ⚠️ abweichend / ❌ nicht vorhanden). Bei ⚠️/❌ NICHT den Code anpassen, sondern die Landing-Page-Formulierung abschwächen oder entfernen und die Abweichung im PR beschreiben.

## Files
- `MySuplea Landing v2.dc.html` — Design-Referenz
- `CLAIMS_CHECKLIST.md` — zu prüfende Aussagen mit Prüfhinweisen
