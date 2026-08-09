# Kräuter-Backlog (HMPC-verifiziert, noch nicht in data/substances.js)

Stand: 2026-08-09. Herkunft: Nachfrage-Abgleich der Pflanzenliste aus einem
kommerziellen Kräuterbuch (nur als Signal genutzt, KEINE Inhaltsquelle)
gegen den EMA/HMPC-Katalog. Jeder Slug wurde live geprüft (HTTP 200 auf
https://www.ema.europa.eu/en/medicines/herbal/<slug>).

Regeln beim Einbau: gleiches Format wie die bestehenden Kräuter-Eintraege
(category 'Kräuter', deskriptive useCases, cautionNote, EMA-Quelle mit
Link, EN-Overlay in data/en/substances.js, Zaehler in
tests/substance-logic.test.mjs hochziehen).

| Pflanze | HMPC-Slug | Hinweis |
|---|---|---|
| Königskerze | verbasci-flos | Husten/Schleimhaut |
| Herzgespann | leonuri-cardiacae-herba | nervöse Herzbeschwerden, wie Weißdorn abgrenzen |
| Ringelblume | calendulae-flos | v. a. äußerlich (Haut) |
| Arnika | arnicae-flos | NUR äußerlich, innerlich giftig — cautionNote zwingend |
| Mädesüß | filipendulae-ulmariae-herba | Salicylate, Querverweis Weidenrinde |
| Rosskastanie | hippocastani-semen | Venen (CVI) |
| Birkenblätter | betulae-folium | Durchspülung Harnwege |
| Ackerschachtelhalm | equiseti-herba | Durchspülung Harnwege, Silicium-Bezug |
| Wermut | absinthii-herba | Thujon-Grenzen wie Salbei |
| Klettenwurzel | arctii-radix | Haut/Durchspülung |
| Liebstöckel | levistici-radix | Durchspülung Harnwege |
| Brennnesselblatt | urticae-folium (auch urticae-herba) | Abgrenzung zu nettle-root (schon in DB) |

Bewusst NICHT aufnehmen (aus der Buchliste geprüft):
- Giftpflanzen: Stechapfel, Bilsenkraut, Grüner Germer, Carolina-Jasmin,
  Kanadische Blutwurz, Maiapfel
- PA-Alkaloid-Pflanzen (innerlich): Huflattich, Beinwell
- In der EU als NEM unzulaessig bzw. ohne Monographie: Ephedra/Mormonentee,
  Kudzu, Osha, Kreosotbusch, Sassafras (Safrol), Katzenkralle (keine
  verifizierte Monographie gefunden)
- Hagebutte, Angelikawurzel: keine EMA-Monographie auffindbar (404),
  erst aufnehmen, wenn eine andere zitierfaehige Quelle vorliegt
