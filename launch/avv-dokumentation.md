# AVV-Dokumentation (Auftragsverarbeitungsvertraege)

Stand: 2026-08-11. Blocker 4 aus launch-plan.md.

Betrifft nur die beiden Dienste, die im Scan-Pfad echte Verarbeiter im
Sinne von Art. 28 DSGVO sind: Supabase (Edge Function, Rate-Limit-Tabelle,
Produkt-Cache) und Anthropic (Claude Vision fuer die Etikettenauswertung).
Open Food Facts ist ein reiner, unauthentifizierter Lesezugriff ohne
Personenbezug und daher hier nicht relevant.

## Supabase

- AVV: https://supabase.com/legal/dpa
- Self-Service, keine Unterschrift noetig: Annahme der Supabase-AGB gilt
  laut Dokument als Annahme des AVV ("acceptance of the Agreement shall
  have the same effect as signing the SCCs").
- Standardvertragsklauseln fuer Drittlandtransfer sind eingebunden.
- Sub-Prozessoren: oeffentliche Liste unter
  https://supabase.com/legal/customer-resources/subprocessor-list,
  30 Tage Vorabankuendigung bei neuen Sub-Prozessoren, 5 Tage
  Einspruchsfrist.
- Zu tun: nichts Vertragliches. Empfehlung: die Sub-Prozessoren-Liste
  einmal gegenlesen (Hosting-Region pruefen, Projekt laeuft auf
  eu-west-1) und die Benachrichtigungs-Mails abonnieren.

## Anthropic

- AVV: https://www.anthropic.com/legal/data-processing-addendum
- Gilt fuer die API (Claude Vision fuer die Etikettenauswertung), nicht
  nur claude.ai: in die Commercial Terms of Service eingebunden
  ("incorporated into and forms part of the Anthropic Commercial Terms
  of Service"), keine gesonderte Unterschrift fuer reine API-Nutzung
  ohne Enterprise-Vertrag ersichtlich.
- Standardvertragsklauseln (Module Two und Module Three) sind per
  Verweis eingebunden.
- Sub-Prozessoren: https://www.anthropic.com/subprocessors, Einspruchsrecht
  bei neuen Sub-Prozessoren.
- Loeschfrist nach Vertragsende: 30 Tage.
- Zu tun: nichts Vertragliches fuer den aktuellen API-Umfang. Falls das
  Volumen spaeter einen Enterprise-Vertrag rechtfertigt, dort einen
  eigenen unterschriebenen AVV nachfordern.

## Was das fuer die Datenschutzerklaerung bedeutet

`data/legalContent.js` kann bei den Abschnitten zu Supabase/Anthropic auf
die beiden AVV-Links verweisen, falls das noch nicht geschehen ist. Die
Aussage "Auftragsverarbeitungsvertraege bestehen" ist mit den obigen
Fundstellen belegt, keine Annahme.
