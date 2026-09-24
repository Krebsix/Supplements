# L2 Kostenschutz für KI-Scans: Abschluss

**Status: deployt am 2026-09-25 und gegen die Produktion verifiziert.
Live-Abnahme mit angemeldetem Konto (Punkte 2 bis 7 unten) offen.**

## Nachtrag 2026-09-25: Deployment und Abgleich

Deployt außerhalb dieser Sitzung (Migration per Supabase-Projekt, Function
aus `integration/2026-09-25`). Danach hier geprüft, nur lesend:

| Prüfung | Ergebnis |
|---|---|
| Migration in `supabase_migrations.schema_migrations` | angewendet als Version **`20260924234856`** (nicht `20260914180000`) |
| Funktionskörper `reserve_/release_scan_quota`, `cleanup_scan_quotas` live gegen Repo | token-gleich, nur anders umgebrochen; `SECURITY DEFINER`, `search_path=public` |
| EXECUTE-Recht | nur `service_role`; `anon` und `authenticated` nein |
| `scan_quotas` | RLS an, 0 Policies (beabsichtigt), alle drei Constraints vorhanden |
| Edge Function | Version 18, ACTIVE, `verify_jwt` an; heruntergeladener Code byte-gleich mit `integration/2026-09-25` (index.ts, quota.ts, formulaVersioning.ts, deno.json) |
| Live: Barcode ohne Konto | `404` "Kein Cache-Eintrag" (Weg bleibt kontofrei) |
| Live: Foto mit Anon-Key, `model` im Body | `401` `auth_required`, vor jedem Claude-Aufruf |
| Live: ohne Authorization-Header | `401` vom Gateway |

**Abgleich:** Weil die Migration live unter einer anderen Versionsnummer
steht, hätte `supabase db push` die Datei `20260914180000` erneut für
fehlend gehalten. Die Datei heißt deshalb jetzt
`20260924234856_scan_quota_per_user.sql`, Inhalt unverändert. Keine
Änderung an der Produktion.

Offen außerhalb von L2: Supabase-Advisor meldet "Leaked Password
Protection" deaktiviert (Auth-Härtung vor Release).

## Stand vom 2026-09-14 (historisch)

Stand: 2026-09-14. Rein dokumentarischer Abschluss, keine weiteren
Code-Änderungen. Kein Merge, kein Deployment.

## Wo der Stand liegt

| | |
|---|---|
| Branch | `fix/scanner-beta-readiness` |
| Commit L2 | `3c77e02` — fix(scan): Kostenschutz serverseitig, Modellwahl nur noch auf dem Server |
| Commit L1/L5 davor | `5b8b55d` — fix(scanner): Doppelangaben nicht doppelt zaehlen, Herkunft erhalten |
| Basis | `2dcf6ea` auf `phase-2t-account-grundlage` |
| Remote | `origin/fix/scanner-beta-readiness` = `3c77e02`, gleichstehend |
| Abhängigkeit | `docs/branch-abhaengigkeiten.md` — der Backup-Branch `fix/cloud-backup-schutz` (`0ee71f3`) ist ebenfalls ungemergt; keine Datei überschneidet sich |

## Was noch nicht angewendet ist

Der Schutz ist vollständig geschrieben, greift aber **noch nicht**. Bis
zum Deployment gilt der alte Zustand: kein Kontingent je Konto, keine
Anmeldepflicht, `model` aus dem Request-Body weiterhin wirksam.

### Migration, nicht angewendet

Geprüft mit `supabase migration list --linked` am 2026-09-14. Alle
Migrationen bis `20260903100000` sind angewendet, genau eine nicht:

| Migration | Lokal | Angewendet |
|---|---|---|
| `20260914180000_scan_quota_per_user.sql` (heute `20260924234856_…`) | ja | damals nein, seit 2026-09-25 ja |

Inhalt: Tabelle `public.scan_quotas` (user_id, period, used) mit RLS ohne
Policies, plus die Funktionen `reserve_scan_quota` (atomar unter
Row-Lock), `release_scan_quota` und `cleanup_scan_quotas`, alle
`SECURITY DEFINER` mit `REVOKE` gegen `public`/`anon`/`authenticated` und
`GRANT` nur an `service_role`.

Anwenden mit:

```bash
supabase db push --linked
```

### Edge Function, nicht deployt

Die live laufende Version ist **Version 17 vom 2026-09-03**
(`supabase functions list`). Die Änderungen dieses Branches stammen vom
2026-09-14 und sind darin nicht enthalten.

| Datei | Art | Deployt |
|---|---|---|
| `supabase/functions/analyze-supplement/index.ts` | geändert | **nein** |
| `supabase/functions/analyze-supplement/quota.ts` | neu | **nein** |

Änderungen in `index.ts`:

- Anmeldepflicht vor der Bildprüfung: Nutzerkennung aus
  `auth.getUser(bearer)`, `401` mit `reason: "auth_required"` ohne Konto.
- Kontingentreservierung vor dem Claude-Aufruf, `429` mit
  `reason: "quota_exhausted"` bei erreichter Monatsgrenze.
- Freigabe der Reservierung an neun Ausstiegsstellen ohne verwertbares
  Ergebnis (Bildformat, leeres Bild, zu groß, Refusal, `max_tokens`,
  kein Textblock, Upstream-429, generischer Fehler, Bildanzahl).
- `MODEL_OVERRIDE_WHITELIST` und das Lesen von `body.model` entfernt;
  Modell kommt aus `resolveModel(ANALYZE_MODEL)`.

Neu in `quota.ts`: `MONTHLY_HARD_CAP` (100), `SERVER_CREDIT_ALLOWANCE`
(0), `billingPeriod`, `evaluateQuota`, `resolveModel`, `ALLOWED_MODELS`,
`DEFAULT_MODEL`.

Deployen mit:

```bash
supabase functions deploy analyze-supplement
```

Reihenfolge beachten: **erst die Migration, dann die Function.** Eine
deployte Function ohne die Tabelle läuft in den Fail-closed-Zweig und
lehnt jede Foto-Analyse mit `503` ab.

### Client-Änderungen, im Branch, nicht ausgeliefert

Sie stecken im App-Bundle und gehen erst mit dem nächsten Build auf ein
Gerät:

| Datei | Änderung |
|---|---|
| `ScanAnalyzer.js` | `accessToken` als Pflichtangabe für `analyzeCaptures`, Nutzer-Token im `Authorization`-Header, Übersetzung von `auth_required`/`quota_exhausted` in App-Texte |
| `app/(tabs)/(scan)/scanner.jsx` | holt das Sitzungstoken über `restoreSession(supabase)` und gibt es mit |
| `i18n/de/analyzer.js`, `i18n/en/analyzer.js` | `analyzer.accountRequired`, `analyzer.quotaExhausted` |
| `data/legalContent.js` | neuer Abschnitt "Kontingent der Foto-Analyse" DE und EN, IP-Formulierung präzisiert |
| `web/index.html` | aus `legalContent.js` neu generiert (`npm run build:legal`) |

## Was automatisch geprüft ist

| Prüfung | Ergebnis |
|---|---|
| `npm test`, pipe-frei, Exitcode separat erfasst | **0**, 7719 Zusicherungen, 47 Testdateien, 0 Fehlschläge |
| `npx expo export --platform ios` | Exitcode **0** |
| `npx expo export --platform android` | Exitcode **0** |
| `deno check supabase/functions/analyze-supplement/index.ts` | ohne Befund |

`tests/scan-quota.test.mjs` deckt die sieben geforderten Fälle ab:
innerhalb des Limits, Limit erreicht, zehn parallele Anfragen auf ein
Kontingent von drei (genau drei kommen durch, drei Upstream-Aufrufe),
anonymer Aufruf (401, kein Upstream), fünf Modellmanipulationen,
Upstream-Fehler und Refusal (Reservierung zurückgegeben), neuer
Abrechnungszeitraum samt UTC-Monatswechsel.

**Was diese Tests nicht beweisen:** Die atomare Zählung steckt in SQL
(`reserve_scan_quota` unter Row-Lock). Der Test bildet sie mit einer
Ersatzfunktion nach und prüft damit den Kontrollfluss, nicht die
Datenbank. Ob zwei echte, gleichzeitige HTTP-Anfragen an die deployte
Function sich am Row-Lock serialisieren, ist erst nach dem Deployment
messbar.

## Live-Abnahme, offen

Nach `db push` und `functions deploy` zu prüfen, in dieser Reihenfolge:

1. **Anonym**: Foto-Analyse ohne Anmeldung → `401`, App zeigt "Für die
   Foto-Analyse brauchst du ein Konto." Barcode-Scan und Katalogsuche
   funktionieren weiter.
2. **Angemeldet, innerhalb des Kontingents**: Analyse läuft, Zeile in
   `scan_quotas` entsteht mit `used = 1` für den laufenden Monat.
3. **Upstream-Fehler**: Analyse mit absichtlich unbrauchbarem Bild bis
   zu einem `502`/`422` → `used` steht danach wieder auf dem Wert von
   vorher.
4. **Parallel**: Mehrere gleichzeitige Aufrufe gegen ein künstlich
   kleines Limit (Testkonto, `MONTHLY_HARD_CAP` vorübergehend
   herabgesetzt) → `used` überschreitet das Limit nicht.
5. **Limit erreicht**: `429` mit der DE/EN-Meldung, Barcode weiter
   nutzbar.
6. **Modellmanipulation**: Aufruf mit `"model": "claude-fable-5"` im
   Body → Antwort nennt weiterhin das Servermodell.
7. **Monatswechsel**: Zeile für den Folgemonat entsteht neu, alte bleibt
   stehen.

Zusätzlich zu klären, bevor das live geht: Foto-Scans brauchen dann ein
Konto. Das berührt das Versprechen "ohne Konto nutzbar" für dieses eine
Feature, Barcode und Katalog bleiben kontofrei.

## Verbleibende Risiken, unverändert

- **Kauf-Tier serverseitig nicht verifizierbar.** Tier und Credits
  kommen aus RevenueCat in den lokalen Store. Deshalb gilt für jedes
  Konto dieselbe Monatsgrenze, Credits werden serverseitig nicht
  angerechnet (`SERVER_CREDIT_ALLOWANCE = 0`), und die 3-Scan-Grenze des
  Free-Tiers bleibt Produktschranke in der App. Für serverseitige
  Credits braucht es zuerst einen RevenueCat-Webhook.
- **Kein Beta-Tier.** `TIERS` kennt nur `FREE` und `PRO`; Beta-Konten
  laufen unter derselben Serverobergrenze.
- **Standardmodell bleibt Opus.** Begründung und der Weg zu einer
  späteren Umstellung stehen im Audit, Abschnitt L2.
- **`PAYWALL_ENFORCED` bleibt `false`.** Das ist jetzt nur noch die
  Produktschranke in der App; der Kostenschutz hängt nicht mehr daran.

## Nicht angefasst

L3 (Freigabeweg für den Community-Cache) und L4 (Produktsuche findet
keine Produktnamen) bleiben offen, wie vereinbart. Der Audit
`docs/feature-audit-scanner-v1.0.md` führt sie unverändert.
