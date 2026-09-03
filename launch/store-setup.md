# Store-Setup fuer Kaeufe (MySuplea Pro)

Stand: 2026-08-29. Checkliste fuer Nadine, ausserhalb des Codes. Baut auf
docs/superpowers/specs/2026-08-29-kauf-und-konto-einstellungen-design.md
(Abschnitt "Store-Konfiguration") auf und ergaenzt die konkreten Klick-Schritte.
Kein Bau in diesem Task, kein `eas login`.

## 1. Konten

- Apple Developer Program auf indoo home LLC anlegen. Braucht eine D-U-N-S-Nummer
  fuer die LLC (bei D&B beantragen, falls noch keine vorhanden ist. Dauert oft
  mehrere Tage).
- Nach der Freischaltung in App Store Connect das Paid Apps Agreement
  (Vertrag fuer kostenpflichtige Apps und In-App-Kaeufe) annehmen.
- Bank- und Steuerangaben fuer Auszahlungen hinterlegen (W-9 fuer eine
  US-LLC), sonst bleiben Kaeufe im Sandbox-Modus gefangen und zahlen nicht aus.
- Play Console: Entwicklerkonto auf dieselbe LLC, Zahlungsprofil fuer Auszahlungen
  einrichten.

## 2. App Store Connect

- App anlegen: Bundle-ID `com.indoohome.mysuplea` (steht schon in `app.json`).
- Abo-Gruppe "MySuplea Pro" anlegen.
- Darin vier Abo-Produkte:
  - `pro_yearly`, mit 7-Tage-Trial (Introductory Offer, kostenlose Testphase).
  - `pro_monthly`, ohne Trial.
  - `pro_family_yearly` (Familien-Abo, Decision 2026-09-03): **"Family
    Sharing" aktivieren** (Feld "Family Sharable" im Produkt), sonst bleibt
    es ein normales Einzel-Abo unter Familien-Namen. Kein eigener Trial
    vorgesehen.
  - `pro_family_monthly`, ebenfalls mit Family Sharing aktiviert.
- Zwei Consumables (Verbrauchsartikel, keine Abos):
  - `credits_10`
  - `credits_50`
- Preise als Apple-Preisstufe eintragen, nicht als fester Betrag: `pro_yearly`
  auf die Stufe fuer 29,99 Euro/Jahr, `pro_monthly` auf die Stufe fuer
  4,99 Euro/Monat, `pro_family_yearly` auf die Stufe fuer 47,99 Euro/Jahr,
  `pro_family_monthly` auf die Stufe fuer 7,99 Euro/Monat. Apple rechnet
  daraus die Preise in allen anderen Waehrungen.
- Sandbox-Tester anlegen: App Store Connect → Users and Access → Sandbox →
  Testers. Eigene Test-E-Mail-Adresse reicht (muss nicht real empfangsfaehig
  sein, Apple verlangt aber ein neues, noch nie in der App Store benutztes
  Apple-Konto).
- Familien-Abo testen: Family Sharing braucht eine ECHTE Apple-ID-Familiengruppe
  (auch im Sandbox), nicht nur einen einzelnen Sandbox-Tester. Zwei
  Sandbox-Apple-IDs in derselben Sandbox-Familiengruppe anlegen, den Kauf
  mit der einen taetigen, den Empfang mit der anderen pruefen.

## 3. Play Console

- Dieselben Produkt-IDs wie bei Apple verwenden, damit RevenueCat sie ueber
  eine ID mappen kann:
  - Abos: `pro_yearly` (mit 7-Tage-Testphase), `pro_monthly`.
  - In-App-Produkte (verwaltet, kein Abo): `credits_10`, `credits_50`.
- Preise analog: Jahresabo 29,99 Euro, Monatsabo 4,99 Euro.
- **Kein Familien-Abo auf Android in v1** (Decision 2026-09-03): Google
  Play hat keine dem Apple Family Sharing gleichwertige automatische
  Freigabe fuer Abos. `pro_family_yearly`/`pro_family_monthly` NICHT in
  der Play Console anlegen, solange das nicht eigens umgesetzt wird --
  `PurchaseLogic.loadOfferings` liefert dann einfach `null` fuer beide,
  die Paywall zeigt den Familien-Abschnitt auf Android gar nicht erst.
- Lizenztester eintragen: Play Console → Setup → License testing, die
  eigene Google-Konto-Adresse eintragen. Lizenztester koennen ohne echte
  Abbuchung kaufen.

## 4. RevenueCat

- Neues Projekt anlegen, zwei Apps darin verbinden: die iOS-App (App-Store-
  Connect-API-Key, in App Store Connect unter Users and Access →
  Integrations → App Store Connect API erzeugen) und die Android-App
  (Play-Service-Account-JSON, in der Google Cloud Console fuer das
  Play-Console-Projekt erzeugen).
- Entitlement `pro` anlegen und ALLE Abo-Produkte daran haengen: `pro_yearly`,
  `pro_monthly`, `pro_family_yearly`, `pro_family_monthly` (auf iOS; auf
  Android nur die beiden Einzel-Produkte, siehe Abschnitt Play Console).
  Ein Familien-Abo schaltet damit exakt dasselbe `pro`-Entitlement frei
  wie das Einzel-Abo -- `Entitlements.js` unterscheidet die Plaene nur
  fuer die Anzeige (`plan`), nicht fuer den Funktionsumfang.
- Offering `default` mit sechs Paketen: Jahresabo, Monatsabo,
  Familien-Jahresabo, Familien-Monatsabo, `credits_10`, `credits_50`.
- Offering `default` als Current markieren (RevenueCat → Offerings →
  Make current). `PurchaseLogic.loadOfferings` liest `offerings.current`;
  ohne ein als Current markiertes Offering zeigt die Paywall
  "Preise gerade nicht abrufbar", selbst wenn die Pakete existieren.
- Public-Keys (nicht die Secret-Keys) aus RevenueCat → Project Settings →
  API Keys entnehmen und in `purchaseConfig.js` eintragen:
  `REVENUECAT_API_KEY_IOS` und `REVENUECAT_API_KEY_ANDROID`. Public-Keys
  sind wie der Supabase-Anon-Key unbedenklich im Repo, solange die App
  keine Secret-Keys enthaelt.

## 5. Development Build

Expo Go kann das Kauf-SDK (`react-native-purchases`) nicht laden, dafuer
braucht es einen Development Build mit `expo-dev-client`.

```bash
npx eas login
npx eas build --profile development --platform ios
npx eas build --profile development --platform android
```

- iOS-Installation: Build laeuft ueber TestFlight oder als Ad-hoc-Build,
  Installation auf dem Testgeraet ueber den Link aus dem Build-Ergebnis.
- Android-Installation: Der Build liefert eine APK zum direkten Download
  und Installieren auf dem Testgeraet.

## 6. Testablauf im Sandbox

Auf einem echten Geraet, angemeldet mit dem Sandbox-Tester (iOS) bzw.
Lizenztester (Android):

- Jahresabo mit Trial kaufen, Statusanzeige in den Einstellungen
  (`(more)/subscription.jsx`) pruefen: Tier wechselt auf `pro`, Trial-Ende
  wird angezeigt.
- Abo im Store-Konto kuendigen (iOS: Einstellungen → Apple-ID → Abonnements
  im Sandbox-Konto; Android: Play Store → Abos im Testkonto) und pruefen,
  dass die App ohne Neustart auf "gekuendigt, laeuft bis" wechselt.
- "Kaeufe wiederherstellen" auf einem zweiten Geraet mit demselben
  Sandbox-Konto ausloesen, Pro-Status muss ankommen.
- Credits-Kauf (`credits_10` oder `credits_50`) durchfuehren, Kontingent-
  Anzeige muss um die gekaufte Menge steigen.
- Zahlungsproblem (Grace-Status) pruefen. Was im echten App-Store-Sandbox
  NICHT geht: Ein Billing-Issue laesst sich dort nicht zuverlaessig erzwingen.
  "Ask to Buy" ist die Familienfreigabe-Freigabe (ein Elternteil bestaetigt
  den Kauf eines Kindskontos), kein Fehlerfall, und Apple stellt im Sandbox
  keine Testkarten fuer fehlgeschlagene Zahlungen bereit. Was stattdessen
  geht: Auf Simulator oder angeschlossenem Geraet mit einer Xcode-
  StoreKit-Konfigurationsdatei (`.storekit`) testen, dort unter StoreKit
  Testing die Optionen "Enable Billing Grace Period" bzw. "Fail
  Transactions" setzen. Ohne diese Xcode-Testumgebung bleibt es bei zwei
  Pruefungen ohne echten Grace-Kauf: dem Status-Mapping-Test
  (`tests/purchase-logic.test.mjs`, Fall GRACE) und einem manuellen Blick
  auf den Subscription-Screen, ob der Grace-Text angezeigt wird, sobald
  `mapCustomerInfo` den Status `grace` liefert.
- Statuswechsel-Listener pruefen: Aenderung im Store-Konto (Kuendigung,
  Erneuerung) muss in der laufenden App ankommen, ohne dass die Nutzerin
  die App neu startet.

## 7. Freischalten

- `PAYWALL_ENFORCED = true` in `Entitlements.js` erst setzen, wenn der
  komplette Sandbox-Test aus Abschnitt 6 gruen ist. Vorher zaehlt die App
  nur, blockiert aber nicht (siehe Kommentar in `Entitlements.js`).
- Store-Listing-Texte (Titel, Untertitel, Kurzbeschreibung, Keyword-Feld,
  Lang-Beschreibung, DE und EN) aus `launch/aso.md` uebernehmen.

## 8. Privacy Labels / Data Safety

- Privacy Nutrition Labels (App Store Connect) und Data Safety (Play
  Console) ausfuellen, jeweils inklusive der Kategorien "Purchases" (Kauf-
  historie ueber RevenueCat) und "Identifiers" (RevenueCat-App-User-ID,
  Store-Transaktions-ID).
- Seit dem Cloud-Backup (Teilprojekt "Cloud-Backup mit Abgleich",
  2026-09-01) kommt die Kategorie Gesundheitsdaten dazu, weil der
  verschluesselte Stand in `public.user_backups` Laborwerte und
  Medikamentengruppen im Klartext des Standes enthaelt (auf dem Server
  nur als Ciphertext).
  - Apple Privacy Nutrition Labels: Kategorie "Health & Fitness" →
    "Health", "Linked to Your Identity" (ueber die Konto-Kennung),
    "Data Not Used to Track You".
  - Google Data Safety: Kategorie "Health info", "Data is encrypted in
    transit", "User can request that data be deleted".
