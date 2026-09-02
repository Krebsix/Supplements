# Spec-Iteration: Tagesplan als kuratierter Karten-Stapel

Stand: 2026-09-02. Entscheidung Nadine (12:08, folgt Claude-Empfehlung
Option A), festgehalten in Brain/decisions/2026-09-02-supplements-
dashboard-health-iteration.md. Auslöser: Andreas-Gerätetest („nicht
intuitiv, zu viele Infos", docs/geraetetest-befunde-2026-09-02.md).
Ergänzt die Bedienkonzept-Spec 2026-08-31; deren Regeln gelten weiter.

## Leitbild

Apple-Health-Muster, an unsere Sprache angepasst: Der Einstieg
kuratiert, statt alles zu zeigen. **Eine Karte erscheint nur, wenn sie
etwas zu sagen hat.** Der Arbeitsfluss (Als-Nächstes zuerst) bleibt
unangetastet; die Kuratierung ersetzt die Dauer-Sektionen darunter.

Ausdrücklich NICHT übernommen: Health-Farbregenbogen (Petrol bleibt die
einzige Markenfarbe), Ringe/Streaks/Gamification (Anti-Dark-Pattern-
Prinzip), Datenwüsten hinter Sammel-Links.

## Aufbau des Einstiegs (Reihenfolge)

1. Petrol-Bühne mit Tagesbogen (bleibt).
2. Situative Hinweise (bleibt: Restore, Duplikate, Sperre, Erinnerungen).
3. Als-Nächstes-Karte (bleibt, volle Tiefe).
4. Fortschritts-Segmentbalken (bleibt).
5. **NEU: kuratierte Karten, nur bei Aussage, maximal drei gleichzeitig**
   (Priorität in dieser Reihenfolge, Rest entfällt still):
   a) **Auffälligkeit**: mindestens eine Tagessumme über EFSA-UL
      (StackAnalyzer, status above_limit) → eine Karte, nennt die
      Wirkstoffe, Tipp öffnet den Tagessummen-Check. Deskriptiv
      („liegt über der Obergrenze"), kein Alarm.
   b) **Lebensphase**: mindestens ein aktives Präparat trägt ein
      Advisory für die aktive Lebensphase (getAdvisories je Substanz
      im Bestand) → eine Karte, nennt Substanz + schwerste Stufe,
      Tipp öffnet den Steckbrief (Suche).
   c) **Bestand knapp**: refillState meldet due für mindestens ein
      Präparat → eine Karte, nennt Präparat(e) und Resttage, Tipp
      öffnet den Bestand.
6. **Slot-Liste eine Ebene tiefer**: statt der ausgeklappten Slots eine
   Zeile „Alle Einnahmen heute (N)" mit Aufklapper (Standard: zu, ein
   Tipp öffnet; der Als-Nächstes-Slot fehlt darin weiterhin nicht —
   er steht oben). Bestand-Zeile und Prüfhinweise bleiben darunter.

Maßstab: Einstieg ohne Aufklapper maximal ~1,5 Bildschirmhöhen.

## Regeln

- Karteninhalte kommen ausschließlich aus bestehender Fachlogik
  (StackAnalyzer, lifeStageAdvisories, StockForecast). Keine neuen
  Aussagen, keine Bewertungen der Person („dazu ist ein Hinweis
  hinterlegt", nie „gefährlich für dich").
- Jede Karte: Titel, ein Satz, Chevron; ganze Fläche tappbar (44 pt),
  Ziel ist immer der Ort mit der vollen Tiefe.
- Farben über toneFor; Status nie nur über Farbe.
- Erfolgsmaß wie Spec 08-31: nächstes Präparat / Bestand / Hinzufügen
  in unter 10 Sekunden; zusätzlich: eine Auffälligkeit fällt ohne
  Suchen auf.

## Revidieren

Nächster Gerätetest (Nadine + Andreas) bestätigt den 10-Sekunden-
Maßstab nicht, oder die Karten wirken bevormundend statt kuratierend.
