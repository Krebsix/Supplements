# Datenschutz-Folgenabschaetzung (Art. 35 DSGVO), Entwurf

Stand: 2026-09-01. Entwurf der Betreiberin, keine Rechtsberatung. Abnahme
durch Anwalt vor Launch (mit ODbL-Frage buendeln).

## 1. Pruefung der Pflicht (Art. 35 Abs. 3, WP248-Kriterien)

| Kriterium | Trifft zu | Begruendung |
|---|---|---|
| Sensible Daten (Art. 9) | ja | Laborwerte, Medikamentengruppen, Erkrankungen, Praeparate |
| Neue Technologie | teilweise | Ende-zu-Ende-Verschluesselung mit Schluessel beim Betroffenen ist etabliert (Passwort-Manager), fuer Gesundheits-Apps ungewoehnlich |
| Grosser Umfang | nein | Beta mit wenigen hundert Nutzerinnen; wird bei Wachstum neu bewertet |
| Bewertung/Scoring, Ueberwachung, Profiling | nein | keine Auswertung serverseitig moeglich (Ciphertext) |
| Betroffene in schwacher Position | nein | |

Zwei Kriterien erfuellt: DSFA wird vorsorglich durchgefuehrt.

## 2. Beschreibung der Verarbeitung

- Zweck: Wiederherstellung der App-Daten nach Geraetewechsel oder Verlust,
  auf Wunsch der Nutzerin (Konto freiwillig, Sicherung abschaltbar).
- Daten: JSON-Stand der App (Praeparate, Einnahmen, Bestand, Scans, Profil,
  Laborwerte, Beobachtungen, Einstellungen), auf dem Geraet AES-256-GCM
  verschluesselt; Metadaten: Geraetename (frei gewaehlt), Zeitstempel,
  Nutzer-ID (UUID), E-Mail (Auth).
- Empfaenger: Supabase (Auftragsverarbeiter, Region Irland). Kein weiterer.
- Speicherdauer: bis zum Loeschen des Standes oder des Kontos durch die
  Nutzerin; keine Backups des Ciphertexts ausserhalb der Supabase-
  Standardsicherungen (Aufbewahrung laut Anbieter, ebenfalls Ciphertext).
- Schluessel: zufaelliger Datenschluessel, entsteht auf dem Geraet, liegt
  im Geraete-Schluesselbund; auf dem Server nur zwei Umschlaege
  (Passwort-Ableitung scrypt N=32768, Recovery-Key). Anmelde-Passwort ist
  eine Ableitung, Klartext-Passwort verlaesst das Geraet nie.

## 3. Notwendigkeit und Verhaeltnismaessigkeit

- Datensparsamkeit: keine Klartext-Zaehler oder Felder ausserhalb des
  Ciphertexts; Geraetename freiwillig.
- Einwilligung: Anlegen des Kontos und Einschalten der Sicherung;
  Widerruf durch Ausschalten, Loeschen des Standes, Loeschen des Kontos
  (alles in der App, ohne Support).
- Betroffenenrechte: Auskunft und Uebertragbarkeit ueber den JSON-Export;
  Loeschung in der App; Berichtigung durch Aendern in der App und
  erneutes Sichern.

## 4. Risiken und Massnahmen

| Risiko | Eintritt | Schwere | Massnahmen | Restrisiko |
|---|---|---|---|---|
| Server-Kompromittierung (Datenbank-Abzug) | gering | hoch | Ciphertext ohne Schluessel; scrypt gegen Woerterbuchangriffe auf den Passwort-Umschlag; Mindestlaenge 10 | gering: Angreifer muss Passwort erraten, scrypt verlangsamt |
| Geraeteverlust | mittel | hoch | Datenschluessel im Keychain/Keystore (Geraetesperre); lokaler Speicher AES-256; Abmelden aus der Ferne nicht moeglich (Restrisiko) | gering bis mittel; Empfehlung: Geraetesperre, Passwort aendern nach Verlust (neuer Umschlag) |
| Schluesselverlust (Passwort und Recovery-Key vergessen) | mittel | mittel | Recovery-Key einmalig angezeigt, Kopierfunktion, Hinweis; lokale Daten bleiben | mittel, bewusst akzeptiert (E2E) |
| Falscher Stand ueberschreibt Daten (zwei Geraete) | gering | mittel | Dialog bei fremdem Server-Stand, kein stilles Ueberschreiben | gering |
| Metadaten-Leck (Geraetename, Zeitstempel, Groesse) | gering | gering | keine Zaehler; Geraetename frei waehlbar | gering |
| Anbieterzugriff (Supabase-Personal) | gering | hoch | Ciphertext; AVV; Region EU | gering |
| Schwaeche der Kryptografie | sehr gering | hoch | Standardverfahren (scrypt, AES-256-GCM, @noble), Parameter dokumentiert, Tests | sehr gering |

## 5. Ergebnis

Restrisiko nach Massnahmen gering bis mittel; das mittlere Restrisiko
(Schluesselverlust) ist eine bewusste Folge der Ende-zu-Ende-Architektur und
wird der Nutzerin beim Anlegen erklaert. Keine Konsultation der
Aufsichtsbehoerde (Art. 36) erforderlich. Wiedervorlage: bei Live-Sync,
bei Community-Zuordnung (Teilprojekt 3), bei mehr als 10.000 Konten.
