# Bedienkonzept: Ein Blick, ein Tipp, Tiefe eine Ebene darunter

Stand: 2026-08-31. Auftrag Nadine (09:11): "perfektes Konzept fuer
Uebersichtlichkeit und Menuefuehrung ... mit dem auch aeltere Menschen
perfekt klarkommen, das aber trotzdem extrem viele Infos liefert."
Recherche-Grundlage: MyTherapy, Medisafe, Cronometer/Yazio, Apple Health,
Apple HIG, NN/G (Notizen der Recherche im Sitzungs-Scratchpad, Kernmuster
unten eingearbeitet).

## Leitbild

Der Widerspruch "einfach fuer Aeltere" gegen "extrem viele Infos" loest
sich mit einer Regel: **Die erste Flaeche beantwortet genau eine Frage;
jede Tiefe ist genau einen Tipp entfernt, nie zwei.** (NN/G: Progressive
Disclosure mit maximal zwei Ebenen; Apple Health: kuratierte Highlights
statt Datenwueste.) Kein "Seniorenmodus" als Schalter: ein gutes Default
fuer alle, wie es die Apple-Richtlinien vorsehen.

Die eine Frage je Tab:
- **Heute**: Was nehme ich als Naechstes, und habe ich dokumentiert?
- **Bestand**: Was habe ich, reicht es, passt die Tagessumme?
- **Hinzufuegen**: Neues Praeparat, auf drei Wegen.
- **Wissen**: Was ist dieser Wirkstoff / diese Beschwerde / dieses Produkt?
- **Mehr**: Mein Profil, mein Konto, meine Einstellungen.

## Ist-Probleme (Bestandsaufnahme 2026-08-31)

1. "Mehr" ist eine Kramschublade mit 13 Zielen: Bestand und Laborwerte
   stehen neben Impressum.
2. "Analyse" heisst zweimal etwas anderes (Scan-Ergebnis-Screen und
   Analyse-Tab).
3. Der Scanner belegt den zentralen Tab, ist aber nach der Einrichtung
   ein seltener Vorgang; der taeglich relevante Bestand liegt hinter
   "Mehr".
4. Der Tagesplan beginnt mit einem Metrik-Raster (vier Kacheln, Fortschritt,
   Insight), bevor die eigentliche Frage ("was jetzt?") beantwortet ist.
5. Keine systematische Pruefung von Tippflaechen-Groessen und Dynamic Type.

## Sieben Entscheidungen

### 1. Neue Tab-Belegung: Heute · Bestand · Hinzufuegen · Wissen · Mehr

Fuenf Tabs bleiben (Router-Geruest bleibt), die Belegung aendert sich:

| Tab | Inhalt | woher |
|---|---|---|
| Heute | Tagesplan, Verlauf, Ersteinrichtung | wie heute, plus Verlauf aus "Mehr" |
| Bestand | Bestandsliste, Nachfuellen, Tagessummen-Check (StackAnalyzer), Wirkungskontrolle | inventory aus dem Heute-Stack, Analyse-Tab-Inhalte hierher |
| Hinzufuegen | zentrale, optisch abgesetzte Taste; oeffnet den bekannten Dreier Scannen / Suchen / Manuell als Sheet | Scanner-Tab wird ein Weg von dreien |
| Wissen | Suche wie heute: Wirkstoffe, Beschwerdebilder, Produkte je Wirkstoff, Markenregister | "Entdecken", umbenannt |
| Mehr | Gesundheitsprofil, Laborwerte, Bericht, Konto & Cloud-Backup, Erinnerungen, Einstellungen, Abo, Rechtliches | ausgeduennt |

Der Scan bleibt jederzeit in zwei Tipps erreichbar (Hinzufuegen → Scannen),
verliert aber den Dauerplatz, den er nach der Einrichtungswoche nicht
verdient. MyTherapy-Muster: die zentrale Taste ist die EINE Aktion.

### 2. "Mehr" wird ein gegliedertes Verzeichnis

Vier Gruppen mit Zeilen im bestehenden Listen-Stil, jede Zeile mit einem
erklaerenden Untertitel (ein Satz, was dahinter liegt):

1. **Meine Daten**: Gesundheitsprofil, Laborwerte, Bericht fuer die Praxis
2. **Konto**: Konto & Cloud-Backup, Abo
3. **App**: Erinnerungen, Einstellungen (inkl. Backup/Loeschen), Sprache
4. **Rechtliches** (eingeklappt, ein Tipp oeffnet die drei Zeilen):
   Datenschutz, Impressum, Nutzungsbedingungen

### 3. Heute beginnt mit "Als Naechstes", nicht mit Metriken

Oberste Karte: "Als Naechstes: Morgens, 2 Praeparate" mit den Eintraegen
und EINEM grossen Dokumentieren-Knopf je Eintrag (Medisafe-Muster:
aktive Bestaetigung "genommen", kein Wegwischen; der Eintrag bleibt
sichtbar offen, bis bestaetigt oder uebersprungen). Danach der restliche
Tagesplan wie heute. Das Metrik-Raster (vier Kacheln) wird zu EINER
Zusammenfassungszeile ("2 von 5 dokumentiert"); die Details wandern
hinter einen Aufklapper. Die Erklaerungszeilen je Eintrag (SlotReason)
bleiben, sie sind die Informationstiefe an Ort und Stelle.

### 4. Referenzwerte als Balken, nicht nur als Text

Cronometer-Muster, an unsere Regeln angepasst: Im Tagessummen-Check und
im Scan-Ergebnis zeigt je Wirkstoff ein Balken die Tagessumme relativ
zum Referenzwert, mit Markierung der Obergrenze. Farben aus `toneFor`
(gedeckt, kein Alarmrot), und Status IMMER zusaetzlich als Text und
Icon, nie nur als Farbe (MyTherapy-Regel, Farbfehlsichtigkeit). Die
Formulierungen bleiben deskriptiv wie bisher.

### 5. Verbindliche Bedien-Regeln (neu in CLAUDE.md, gelten ab sofort)

Aus Apple HIG und der Forschung zu aelteren Nutzerinnen, jede Regel
pruefbar:

- Tippflaechen mindestens 44x44 pt, mit Abstand zueinander.
- Jede Funktion per einzelnem Tipp erreichbar; Gesten (Wischen, langes
  Druecken) nur als Abkuerzung, nie als einziger Weg.
- Dynamic Type: Texte skalieren mit der Systemschrift; Layouts brechen
  bei groesster Stufe um statt abzuschneiden (`maxFontSizeMultiplier`
  nur, wo Umbruch unmoeglich ist, und nie unter 1.5).
- Kontrast mindestens 4,5:1 fuer Fliesstext, 3:1 fuer grosse Schrift
  (Token-Audit gegen `theme.js`).
- Status nie nur ueber Farbe: immer Farbe + Text oder Icon.
- Maximal zwei Aufklapp-Ebenen fuer dieselbe Information.
- Rueckmeldung auf jede Aktion sichtbar am Ort der Aktion (kein reines
  Vibrieren).

### 6. Konsistente Namen

- Scan-Ergebnis-Screen heisst "Scan pruefen" statt "Analyse".
- Der bisherige Analyse-Inhalt heisst im Bestand "Tagessummen-Check"
  bzw. "Wirkung". Kein Screen-Titel kommt doppelt vor.
- Tab-Namen: Heute, Bestand, Hinzufuegen, Wissen, Mehr (DE);
  Today, Inventory, Add, Learn, More (EN).

### 7. Umsetzung in drei Phasen, jede einzeln ausliefer- und testbar

- **Phase 1 (klein, sofort)**: "Mehr" gliedern (Entscheidung 2), Namen
  fixen (6), Verlauf/Bestand-Verlinkung, Bedien-Regeln in CLAUDE.md,
  Dynamic-Type- und Tippflaechen-Audit der Kernscreens mit Fixes.
- **Phase 2 (Tab-Umbau)**: Entscheidung 1, inkl. Umzug Analyse → Bestand
  und Scanner → Hinzufuegen-Sheet.
- **Phase 3 (Heute + Balken)**: Entscheidungen 3 und 4.

Jede Phase bekommt einen eigenen Plan; Nadines Geraetetest nach jeder
Phase entscheidet, ob die naechste startet.

## Abgrenzung

Kein Seniorenmodus-Schalter, keine neue Farbpalette, kein Dark Mode in
diesem Konzept, keine Aenderung an Fachlogik oder Datenmodell. Die
Ersteinrichtung und der Aufnehmen-Screen (2026-08-30/31) bleiben wie
gebaut; das Konzept uebernimmt ihre Muster (eine Frage je Flaeche).

## Erfolgsmass

Nadines Geraetetest-Massstab je Phase: Eine neue Nutzerin findet ohne
Erklaerung (1) das naechste faellige Praeparat, (2) ihren Bestand,
(3) den Weg, ein Praeparat hinzuzufuegen, jeweils in unter zehn
Sekunden. Plus: alle Kernscreens bleiben bei groesster Dynamic-Type-
Stufe bedienbar.
