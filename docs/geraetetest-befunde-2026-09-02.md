# Gerätetest-Befunde 2026-09-02 (Andreas)

Rohbefunde aus dem laufenden Test, mit Triage und Status.

## 1. „App nicht intuitiv genug; an Apple Health orientieren; Begriff Routine ändern; weniger Text je Präparat"

- **Weniger Text je Präparat**: UMGESETZT. Listenzeilen zeigen
  eingeklappt nur noch den Namen; Dosierung, Zweck, Zeitpunkt, Bestand
  und Erklärungen liegen hinter dem Aufklapper. Die Als-Nächstes-Karte
  behält die volle Tiefe (dort fällt die Entscheidung).
- **Begriff „Routine"**: UMGESETZT im Dashboard (DE/EN): „Einnahmen"/
  „Tagesplan"/„Aktive Präparate" statt Routine. Restvorkommen in
  anderen Katalogen (inventory, history, analysis) folgen im nächsten
  Wording-Durchgang.
- **Apple-Health-Orientierung**: KONZEPTENTSCHEIDUNG für Nadine.
  Vorschlag für eine Spec-Iteration: kuratierte Karten-Stapel wie
  Health-„Highlights" (heute · Auffälligkeiten · Trends), stärkere
  Karten-Hierarchie, Detailtiefe konsequent eine Ebene tiefer. Betrifft
  Dashboard-Informationsarchitektur, nicht die Tab-Struktur (die steht
  seit P3).

## 2. „Scan → Erfassen: erkannte Daten vorausgefüllt/vorgegraut"

Vorbefüllung existiert auf allen drei Pfaden (Foto, Barcode, Katalog)
über pendingScanResult → AddSupplement (?fromScan=1). Befund vermutlich
auf einem Pfad, der sie verliert, oder Erwartung „vorgegraut" (sichtbar
vorausgefüllt) vs. tatsächlichem Verhalten. STATUS: in Prüfung; braucht
den genauen Weg (welches Produkt, Foto oder Barcode, welcher Knopf).
Rückfrage an Andreas: Produkt + Pfad nennen, dann reproduzieren wir.

## 3. „Zu viele Infos auf dem Dashboard; Kacheln klickbar machen"

- **Kacheln klickbar**: UMGESETZT. Aktive Präparate → Bestand, Heute
  geplant → springt zu den Slots, Dokumentiert → Verlauf, Noch offen →
  springt zum nächsten offenen Slot. Chevron als Affordanz.
- **Zu viele Infos**: durch Punkt 1 (weniger Text) deutlich entschärft;
  weitere Reduktion gehört in die Apple-Health-Spec-Iteration.
