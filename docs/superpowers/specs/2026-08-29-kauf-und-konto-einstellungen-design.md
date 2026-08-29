# Kaufschicht und Konto-Einstellungen

Stand: 2026-08-29. Entwurf freigegeben von Nadine (Gespraech).

Setzt auf der Konto-Grundlage auf (Spec 2026-08-29-account-grundlage-design.md)
und auf der Monetarisierungs-Entscheidung vom 2026-08-09 (Freemium, Pro-Abo
29,99 Euro/Jahr oder 4,99/Monat mit 7-Tage-Trial, Scan-Credits als Consumable).

## Ziel

Die App kann Pro-Abos und Scan-Pakete ueber App Store und Google Play
verkaufen, zeigt den Abo-Status ehrlich an, fuehrt zu Kuendigung und
Rueckerstattung an die richtige Stelle im Store und stellt Kaeufe auf neuen
Geraeten wieder her. Dazu bekommt das Konto die Einstellungen, die einer
professionellen App fehlen wuerden: E-Mail aendern, Passwort aendern,
Laborwert bearbeiten.

## Fuenf Entscheidungen

### 1. RevenueCat statt eigener Quittungspruefung

Ein SDK (`react-native-purchases`) fuer beide Stores, Quittungspruefung und
Abo-Status auf RevenueCat-Servern, Webhooks bei Verlaengerung, Kuendigung,
Rueckerstattung. Kostenlos bis 2.500 US-Dollar Monatsumsatz, danach ein
Prozent. Verworfen: `expo-iap` direkt (Quittungspruefung, Abo-Status und
Cross-Platform-Zuordnung selbst bauen, mit eigenem Server) und StoreKit 2
nur fuer iOS (Android nochmal, kein plattformuebergreifendes Pro).

Konsequenz: Native-Modul, daher Development Build (EAS) statt Expo Go fuer
alles, was kauft. Die App laeuft in Expo Go weiter; dort meldet die
Kaufschicht "nicht verfuegbar", alle Gates bleiben offen wie heute.

### 2. Pro haengt am Store-Konto, das MySuplea-Konto verknuepft

Ohne MySuplea-Konto: anonyme RevenueCat-ID je Geraet, "Kaeufe
wiederherstellen" holt den Kauf ueber Apple-ID oder Google-Konto zurueck.
Mit Konto: bei Login `Purchases.logIn(supabaseUserId)`, RevenueCat fuehrt
anonymen Kauf und Konto zusammen, Pro folgt dem Login ueber iOS und Android.
Bei Logout `logOut()`, das Geraet faellt auf die anonyme ID zurueck.
Verworfen: nur Store-Konto (wer beide Plattformen nutzt, zahlt doppelt) und
Pflicht-Konto fuer Pro (widerspricht "ohne Konto nutzbar").

### 3. Kuendigen und Stornieren passieren im Store, nie in der App

Apple und Google sind Verkaeufer gegenueber der Kundin. Die App bietet keinen
Kuendigungsknopf, der etwas vortaeuscht, sondern drei Dinge: "Abo verwalten"
oeffnet die Abo-Seite des Stores, "Rueckerstattung beantragen" fuehrt zu
`reportaproblem.apple.com` bzw. zur Play-Rueckerstattungshilfe mit dem Satz,
dass Apple und Google entscheiden, und der Status zeigt "gekuendigt, laeuft
bis" ehrlich an.

### 4. `Entitlements.js` bleibt die einzige Wahrheit fuer die Gates

Alle Aufrufstellen (Scanner, AddSupplement, Laborwerte, Wirkungskontrolle,
Analyse, Settings) fragen weiter `Entitlements.js`. Neu wird `tier` aus dem
RevenueCat-Status gespiegelt statt nur lokal gesetzt; `freeScansUsed` und
`fairUseUsed` bleiben lokal (RevenueCat zaehlt keine Scans);
`extraCredits` wird bei einem Consumable-Kauf lokal addiert, die Quittung
bleibt bei RevenueCat. `PAYWALL_ENFORCED` bleibt der eine Schalter, der nach
dem Sandbox-Test umgelegt wird.

### 5. Preise kommen nur aus dem Store

Kein Preis im Code oder in den i18n-Texten. Der Kaufscreen zeigt, was das
SDK liefert (lokalisiert, mit Waehrung). Apple rundet auf Preisstufen; ein
hart kodierter Preis waere beim ersten Stufenwechsel falsch.

## Architektur

```
PurchaseLogic.js        Fachlogik ohne UI. SDK wird uebergeben (wie der
                        Supabase-Client in AccountLogic), Tests mit Fake.
                        loadOfferings, purchase(package), restore,
                        mapCustomerInfo(customerInfo) => { status, expiresAt,
                        willRenew, platform, isTrial, entitlement-Patch },
                        linkAccount(userId), unlinkAccount()
usePurchaseStore.js     zustand-Store: available, offerings, busy, status
                        ('free'|'trial'|'active'|'cancelled'|'grace'|
                        'expired'|'pending'), expiresAt, willRenew, platform
purchaseConfig.js       RevenueCat-Public-Keys iOS/Android, Produkt-IDs,
                        Entitlement-Name 'pro'. Oeffentlich, kein Secret.
app/paywall.jsx         Kaufscreen als Modal
app/(tabs)/(more)/
  subscription.jsx      Abo-Verwaltung
  account.jsx           + E-Mail aendern, Passwort aendern
  lab.jsx               + Laborwert bearbeiten
AccountLogic.js         + changeEmail, changePassword
AccountStore.js         + changeEmail, changePassword, Ereignis USER_UPDATED,
                        Purchases.logIn/logOut bei Session-Wechsel
LabValues.js / useStore + updateLabValue
Entitlements.js         + applyPurchaseStatus(entitlement, mapped)
```

`react-native-purchases` wird nur geladen, wenn das Native-Modul vorhanden
ist (`try { require } catch`); sonst `available: false`.

## Kaufscreen

Reihenfolge: was Pro enthaelt (vier Features, unbegrenzte KI-Scans mit Fair
Use, unbegrenzter Bestand); Jahres- und Monatsabo als zwei Karten mit
Live-Preis und Trial-Hinweis; Scan-Pakete als dritte Option; die
Pflichtsaetze (Laufzeit, automatische Verlaengerung, Kuendigung mindestens
24 Stunden vor Ablauf im Store-Konto, Belastung ueber das Store-Konto);
"Kaeufe wiederherstellen"; Links auf Nutzungsbedingungen und Datenschutz.
Ohne Pflichtsaetze und Links lehnt Apple ab (Guideline 3.1.2).

Oeffnet sich aus jedem Gate und aus der Abo-Verwaltung. Solange
`PAYWALL_ENFORCED` aus ist, erreichen ihn nur die Abo-Verwaltung und der
Sandbox-Test.

## Abo-Verwaltung

Statuskarte mit ehrlichem Wortlaut je Status:
- free: "Free"
- trial: "Testphase bis {datum}, danach {preis}"
- active: "Pro, verlaengert sich am {datum}"
- cancelled: "Pro, gekuendigt, laeuft bis {datum}"
- grace: "Zahlungsproblem, bitte im Store pruefen, Pro bleibt bis {datum}"
- expired: "Pro abgelaufen am {datum}"
- pending: "Kauf wird geprueft"

Darunter Scan-Guthaben (Frei-Scans, Fair Use im Monat, Credits). Aktionen:
"Abo verwalten" (iOS `https://apps.apple.com/account/subscriptions`, Android
`https://play.google.com/store/account/subscriptions?sku={sku}&package={pkg}`),
"Kaeufe wiederherstellen", "Rueckerstattung beantragen", "Pro kaufen" wenn
free oder expired. Zwei Saetze erklaeren, dass Kuendigung im Store passiert
und die App den Status danach anzeigt.

## Konto-Einstellungen

**E-Mail aendern.** `updateUser({ email })` mit Secure email change:
Bestaetigungslink an alte und neue Adresse, Aenderung gilt erst nach beiden.
Bis dahin zeigt der Screen "Wechsel zu {email} wartet auf Bestaetigung"
(`user.new_email` aus der Session). Der Link oeffnet die App ueber den
bestehenden Callback; der Store reagiert auf `USER_UPDATED`. Schluesselmaterial
unberuehrt.

**Passwort aendern.** Altes Passwort, neues Passwort zweimal (mindestens 10
Zeichen). Ablauf: `unlockWithPassword(record, altesPasswort)` lokal (falsch:
Abbruch, nichts geschrieben), dann `updateUser({ password })`, dann
`rewrapWithPassword` und `saveKeyRecord`. Reihenfolge wie beim Reset: bricht
der zweite Schritt ab, bleibt der Recovery-Key gueltig und der Wechsel laesst
sich wiederholen. Der Screen sagt, dass der Recovery-Key gueltig bleibt.
Nach Erfolg bleibt die Sitzung bestehen, der Datenschluessel im Speicher wird
beibehalten.

**Laborwert bearbeiten.** Antippen eines Eintrags oeffnet das bestehende
Formular vorbefuellt; Speichern ersetzt den Eintrag ueber `updateLabValue(id,
input)` (gleiche Validierung wie `createLabValue`, ID bleibt). Keine
Bewertung, wie gehabt.

## Datenfluss Kauf

1. App-Start: Wenn das SDK verfuegbar ist, `Purchases.configure(key)` mit
   anonymer ID; bei bestehender Konto-Session sofort `logIn(userId)`.
   `getCustomerInfo()` liefert den Status, `mapCustomerInfo` uebersetzt ihn,
   `applyPurchaseStatus` spiegelt `tier` in den Haupt-Store. Listener auf
   `addCustomerInfoUpdateListener` haelt den Status aktuell (Verlaengerung,
   Kuendigung, Rueckerstattung kommen so an, ohne Neustart).
2. Kauf: `purchasePackage`; bei Erfolg Status wie oben; bei Consumable
   zusaetzlich `addCredits(n)` mit der Menge aus der Produkt-ID
   (`credits_10`, `credits_50`).
3. Wiederherstellen: `restorePurchases`, dann Status wie oben; ohne Treffer
   Meldung, kein Fehler.
4. Login/Logout im Konto-Store: `logIn(userId)` bzw. `logOut()`, danach
   Status neu lesen.
5. Konto loeschen: `logOut()` vor dem Loeschen; der Kauf bleibt ueber die
   Store-ID wiederherstellbar, das sagt der Loesch-Dialog.

## Fehlerbehandlung

- Kauf abgebrochen (`userCancelled`): still, zurueck zum Kaufscreen.
- Kauf fehlgeschlagen: Meldung mit dem Fehlertext des Stores.
- Angebote nicht ladbar: "Preise gerade nicht abrufbar", Knopf Neuladen.
- Quittung in Pruefung (Android, `pending`): Status "wird geprueft", Pro
  erst nach Bestaetigung ueber den Listener.
- RevenueCat nicht erreichbar: letzter Status bleibt (SDK-Cache); kein
  Rueckfall auf Free ohne Beleg.
- Wiederherstellen ohne Kauf: "Kein Kauf zu diesem Store-Konto gefunden".
- E-Mail-Wechsel: neue Adresse bereits vergeben liefert Supabase als Fehler;
  wird angezeigt, nichts geaendert.
- Passwort-Wechsel: falsches altes Passwort wird lokal erkannt, kein
  Netzaufruf; Fehler nach `updateUser` (Policy, abgelaufene Sitzung) wird
  angezeigt, Record unveraendert, Recovery-Key gueltig.

## Datenschutz und Rechtstexte

RevenueCat (USA) als neuer Auftragsverarbeiter: anonyme App-User-ID bzw.
Supabase-User-ID (UUID, keine E-Mail), Kauf-Quittungen, Geraetetyp, Land,
keine Gesundheitsdaten. Standardvertragsklauseln, AVV vorhanden. Neuer
Absatz "Kaeufe" in `data/legalContent.js` (DE/EN), `PRIVACY_VERSION`
erhoehen, `launch/avv-dokumentation.md` ergaenzen. Nutzungsbedingungen
Abschnitt "Kostenlose Nutzung und Pro" bleibt gueltig (verweist bereits auf
Store-Abwicklung).

## Store-Konfiguration (Nadine, ausserhalb des Codes)

- Apple: Developer Program auf indoo home LLC (D-U-N-S), Paid Apps
  Agreement, Bank/Steuer (W-9), App Store Connect: App anlegen, Abo-Gruppe
  "MySuplea Pro" mit `pro_yearly` (7-Tage-Trial) und `pro_monthly`,
  Consumables `credits_10`, `credits_50`; Sandbox-Tester anlegen.
- Google: Play Console auf die LLC, Zahlungsprofil, App anlegen, Abos
  `pro_yearly`/`pro_monthly`, In-App-Produkte `credits_10`/`credits_50`,
  Lizenztester.
- RevenueCat: Projekt anlegen, beide Apps verbinden (App-Store-Connect-API-
  Key, Play-Service-Account), Entitlement `pro`, Offering `default` mit
  den vier Paketen, Public-Keys in `purchaseConfig.js`.
- Preise: 29,99 Euro/Jahr, 4,99 Euro/Monat (Apple-Preisstufen), Credits
  nach Kalkulation (25 Cent Kosten je Scan).

## Testing

- `tests/purchase-logic.test.mjs`: Fake-SDK; Status-Uebersetzung fuer alle
  sieben Faelle, Kauf-Rundtrip (Abo setzt tier pro, Consumable addiert
  Credits), Wiederherstellen mit und ohne Treffer, logIn/logOut-Aufrufe bei
  Session-Wechsel, `available: false` ohne SDK.
- `tests/account-logic.test.mjs` erweitert: changePassword mit falschem
  altem Passwort schreibt nichts; mit richtigem wird neu gewickelt, alter
  Umschlag ungueltig, Recovery-Key bleibt gueltig; changeEmail ruft
  `updateUser({ email })`.
- `tests/lab-values` bzw. bestehender Test erweitert: updateLabValue behaelt
  ID, validiert wie create, unbekannte ID aendert nichts.
- Geraetetest: Expo Go fuer Konto-Einstellungen und Laborwert; Development
  Build mit Sandbox-Tester fuer Kauf, Trial, Wiederherstellen, Kuendigung im
  Store und Statuswechsel per Listener.

## Abgrenzung

Nicht enthalten: Familienfreigabe, Promo-Codes und Angebotscodes, Kauf ueber
das Web, Preis-Experimente, Sign in with Apple (eigener Nachtrag, sobald der
Developer Account steht), Umstellung von `PAYWALL_ENFORCED` (erst nach
erfolgreichem Sandbox-Test, Gate 3 des Launch-Plans).
