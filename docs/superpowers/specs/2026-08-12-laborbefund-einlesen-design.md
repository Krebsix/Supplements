# Laborbefund einlesen

Stand: 2026-08-12. Entwurf freigegeben von Nadine.

## Ziel

Laborwerte aus einem Befund uebernehmen, ohne sie einzeln abzutippen. Ein
Befund enthaelt schnell zwanzig bis vierzig Werte; die manuelle Erfassung
ueber `app/(tabs)/(more)/lab.jsx` ist dafuer zu muehsam, und was zu muehsam
ist, wird nicht gemacht.

## Vier Entscheidungen, die den Rahmen setzen

### 1. Der Befund verlaesst das Geraet nicht

Ein Laborbefund traegt Namen, Geburtsdatum, oft Diagnosen und die Anschrift
der Praxis — Gesundheitsdaten nach Art. 9 DSGVO. Die Positionierung der App
haengt daran, dass genau solche Daten lokal bleiben: Die
Datenschutzerklaerung sagt es, der Launch-Plan nennt heise und netzpolitik
als Presseziele mit diesem Aufhaenger, der Product-Hunt-Text sagt "no
account, no cloud, no tracking".

Ein Upload zur KI-Auswertung wuerde diesen Satz unwahr machen. Die
Auswertung laeuft deshalb vollstaendig auf dem Geraet. Kein Netzwerkzugriff,
in keiner Ausbaustufe.

Das kostet Erkennungsqualitaet: Eine Vision-Auswertung versteht
Tabellenstrukturen besser als lokale Texterkennung. Der Preis ist bewusst
bezahlt.

### 2. Nur Laborwerte, keine Arztbriefe

Aus dem Befund werden ausgelesen: Marker, Wert, Einheit, Referenzbereich,
Messdatum. Also genau die Felder, die `LabValues.js` heute schon kennt.

Freitext aus Arztbriefen — Diagnosen, Beurteilungen — bleibt aussen vor.
Ihn zu erfassen hiesse, aerztliche Aussagen zu deuten. Das ist die eine
Sache, die die App nie tut (siehe `data/labMarkers.js`: "Die App sagt nie
'zu niedrig', 'Mangel' oder 'im Normbereich'"), und es beruehrt die Frage,
ab wann eine App ein Medizinprodukt ist.

### 3. PDF und Foto, aber PDF zuerst

Beide Wege werden gebraucht: Manche Praxen schicken PDF, andere geben
Papier mit.

Gebaut wird zuerst der PDF-Weg. Ein Labor-PDF traegt fast immer eine
Textebene, die sich fehlerfrei auslesen laesst. Der schwierige Teil ist
nicht das Lesen, sondern das Zuordnen — aus "Ferritin 45 ng/ml 30-300" muss
hervorgehen, was Marker, Wert, Einheit und Bereich ist. Diese Logik
entsteht an sauberem Text erheblich zuverlaessiger als an OCR-Rauschen, und
der Foto-Weg erbt sie anschliessend.

### 4. Das Dokument wird nicht abgelegt

Nach der Uebernahme werden Datei und ausgelesener Text verworfen. Nur die
bestaetigten Werte bleiben, wie bei manueller Eingabe. Wer den Originalbefund
aufbewahren will, tut das dort, wo er ohnehin liegt.

## Architektur

Fachlogik ausserhalb der Screens, wie im Projekt ueblich.

| Datei | Aufgabe |
|---|---|
| `LabReportText.js` | Liefert den Rohtext einer Quelle. Zunaechst PDF, spaeter zusaetzlich Foto. Kennt keine Laborwerte. |
| `LabReportParser.js` | Bekommt Rohtext, liefert Wert-Kandidaten. Der eigentliche Kern. Kennt keine Dateien. |
| `app/(tabs)/(more)/lab-import.jsx` | Zeigt Kandidaten zur Bestaetigung, schreibt ueber die vorhandene `addLabValue`-Funktion. Keine Fachlogik. |

Die Trennung ist der Punkt: Der Parser laesst sich mit Textmustern testen,
ohne dass eine Datei oder eine Kamera im Spiel ist. Genauso arbeitet
`SubstanceMatcher.js` heute mit Etikettentexten.

Am Datenmodell aendert sich nichts. `labValues` im Store und `createLabValue`
bleiben unveraendert; der Import ist nur ein weiterer Weg, dieselben
Eintraege zu erzeugen.

## Datenfluss

1. Nutzerin waehlt im Laborwerte-Bereich "Befund einlesen"
2. Dateiauswahl ueber `expo-document-picker` (bereits im Projekt)
3. `LabReportText` extrahiert den Text, lokal
4. `LabReportParser` erzeugt Kandidaten
5. Bestaetigungs-Screen: Liste, jede Zeile einzeln abwaehlbar und korrigierbar
6. Uebernahme: je bestaetigtem Kandidaten ein `addLabValue`
7. Text und Datei werden verworfen

## Der Parser

Eingabe: Rohtext. Ausgabe: Liste von Kandidaten der Form

```
{ markerId | null, rawName, value, unit, referenceRange | null, confidence }
```

Regeln:

- **Marker zuordnen** ueber `data/labMarkers.js` samt Synonymen. Kein
  Treffer heisst `markerId: null` — der Kandidat wird trotzdem angeboten,
  zur manuellen Zuordnung.
- **Referenzbereich** wird erkannt, wenn er in der Zeile steht ("30-300",
  "< 5", "> 1,2"). Er gilt als Angabe des Labors, nicht der App. Fehlt er,
  bleibt er leer — die App ergaenzt keinen eigenen.
- **Messdatum** einmal aus dem Kopf des Befunds, fuer alle Werte. Wird
  keines gefunden, fragt der Bestaetigungs-Screen danach.
- **Nichts wird geraten.** Was nicht sicher erkannt ist, bleibt leer und
  wird als offen ausgewiesen. Dieselbe Regel wie beim Produktscan, wo eine
  nicht erkannte Dosierung leer bleibt statt still auf "1 Kapsel" gesetzt zu
  werden (Commit `6bd60b6`). Ein falsch zugeordneter Laborwert waere
  schlimmer als ein fehlender.

## Fehlerfaelle

| Fall | Verhalten |
|---|---|
| PDF ohne Textebene (reiner Scan) | Ehrliche Meldung; Verweis auf den Foto-Weg, sobald er existiert. Kein stiller Fehlschlag. |
| Kein Wert erkannt | Meldung, dass nichts gefunden wurde. Kein leerer Erfolg. |
| Marker unbekannt | Kandidat erscheint mit leerem Marker zur Zuordnung von Hand. |
| Datum fehlt | Bestaetigungs-Screen verlangt es, bevor uebernommen wird. |

## Tests

`LabReportParser` wird gegen Textmuster echter Befunde getestet — mehrere
Labore, weil die Layouts sich unterscheiden. Das passt zur vorhandenen
Testkultur (`npm test`, `tests/*.test.mjs`) und ist ohne Datei, Kamera oder
Geraet moeglich.

Mindestens abzudecken: Marker mit Synonym, Wert mit Komma-Dezimaltrennung,
Referenzbereich in den drei Schreibweisen, Zeile ohne erkennbaren Marker,
Text ohne jeden Wert.

## Reihenfolge

1. **Machbarkeitstest PDF-Text.** Klaert, ob sich PDF-Text in React Native
   ohne natives Modul auslesen laesst. Entscheidet, ob das Feature in Expo
   Go testbar ist oder auf den Development Build wartet. Zuerst, weil es
   verschwendete Arbeit waere, den Parser zu bauen, bevor feststeht, woher
   sein Text kommt.
2. Parser samt Tests
3. Bestaetigungs-Screen und Verdrahtung
4. Satz in `data/legalContent.js`
5. Foto-Weg auf demselben Parser

## Offenes Risiko

Ob `pdfjs` in React Native zuverlaessig laeuft, ist ungeprueft. Es ist reines
JavaScript und braucht fuer die reine Textextraktion kein Canvas, aber
Polyfills. Scheitert es, faellt der PDF-Weg auf ein natives Modul zurueck
und braucht damit denselben Development Build wie die Fotoerkennung. Genau
das klaert Schritt 1.

Der Foto-Weg braucht in jedem Fall ein natives Modul (ML Kit oder Apples
Vision Framework) und laeuft nicht in Expo Go.

## Was nicht gebaut wird

- Keine Ablage der Dokumente
- Keine Diagnosen, keine Beurteilungen, kein Freitext
- Keine eigenen Referenzbereiche
- Keine Bewertung der Werte, auch nicht farblich
- Kein Netzwerkzugriff
