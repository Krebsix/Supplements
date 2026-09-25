# Herkunft von Katalogprodukten: Befund

Stand: 2026-09-25, Branch `integration/2026-09-25`. Reine Analyse, keine
Code- oder Datenmodelländerung.

Grundsatz: Die Datenherkunft darf auf dem Weg Katalog → Suche →
Produktübernahme → eigener Bestand nicht verschwinden.

## Kurzfassung

Die Herkunft geht an genau **einer** Stelle verloren:
`seedEntryToScanDraft` (`SeedCatalog.js`) übernimmt weder `license` noch
`source` aus dem Katalogeintrag. Alles danach reicht Felder unverändert
durch. Eine Datenmodelländerung ist zum **Erhalten** nicht nötig; für die
**Anzeige** am Präparat reicht ein zusätzliches optionales Feld.

## 1. Was der Katalogeintrag beim Tipp enthält

| Feld | Herstellerkatalog (`data/seedProducts.json`, 365) | Open Food Facts (`data/offProducts.json`, 2466) |
|---|---|---|
| `source` | URL des Herstellers oder der Gebrauchsinformation | URL der OFF-API je Produkt |
| `license` | fehlt | `'ODbL'`, beim Aufbau von `CATALOG` angehängt (`SeedCatalog.js`) |
| Attribution | – | nur im Dateikopf: `license: 'ODbL-1.0'`, `attribution: 'Open Food Facts, world.openfoodfacts.org, Open Database License (ODbL)'` |
| `off` | bei 20 von 365 `true`, Bedeutung im Code nicht dokumentiert | immer `true` |

## 2. Was beim Übergang über `/AddSupplement?fromScan=1` weitergeht

`search.jsx`/`brands.jsx` → `seedEntryToScanDraft(entry)` →
`saveScanResult` → `setPendingScanResult` → AddSupplement.

Der Entwurf trägt: `productName`, `brand`, Wirkstoffe,
`warnings`, `uncertaintyNote`, `analysisMode: 'seed-catalog'`,
`certifications`, `productClass`, `barcode`, `analyzedAt`.

**Nicht übernommen:** `license`, `source`, `channel`, `country`.
Hier liegt die Verluststelle.

`saveScanResult` (`useStore.js`, `normalizeScanResult`) übernimmt den
Entwurf per Spread vollständig; was im Entwurf stünde, bliebe erhalten.

## 3. Was dauerhaft gespeichert wird

- **Scan-Ergebnis** in `scanResults`: der vollständige Entwurf. Liegt im
  verschlüsselten Store, im JSON-Backup (`BackupManager.js`) und im
  Cloud-Backup (`CloudBackup.js`).
- **Präparat** in `userSupplements` (`addSupplementFromPendingScan`,
  `normalizeUserSupplement`): `source: 'scan'`,
  `analysisMode: 'seed-catalog'`, `scanResultId` (Verweis auf das
  Scan-Ergebnis), `captureSummary`.
- **Anzeige**: `SupplementOrigin.js` bildet `seed-catalog` auf
  "aus dem Produktkatalog" ab. Herstellerkatalog und Open Food Facts sind
  dort nicht unterscheidbar.

## 4. Vorhandene Felder

- `scanResultId` ist ein bestehender Verweis vom Präparat auf das
  Scan-Ergebnis, wird aber nirgends gelesen. Stünde die Herkunft im
  Entwurf, wäre sie über diesen Verweis erreichbar.
- `captureSummary` ist kein allgemeines Herkunftsfeld: Es hält nur die
  Aufnahmeschritte einer Fotoanalyse (`normalizeCaptureSummary`).
- Ein allgemeines Feld für Datenquelle und Lizenz gibt es am Präparat
  nicht.

## 5. Kleinste Lösung (nicht umgesetzt)

1. `seedEntryToScanDraft` übernimmt `license` und `source` (als
   `sourceUrl`) in den Entwurf. Damit steht die Herkunft ohne weitere
   Änderung im gespeicherten Scan-Ergebnis und in beiden Backups.
2. `addSupplementFromPendingScan` und `normalizeUserSupplement` führen ein
   zusätzliches optionales Feld (z. B. `dataLicense`, Standard `null`)
   am Präparat, analog zu `analysisMode`. Additiv, alte Einträge bleiben
   gültig, keine Migration.
3. `SupplementOrigin.js` unterscheidet `seed-catalog` mit `license: 'ODbL'`
   als "aus Open Food Facts (ODbL)", DE/EN.

Offene Frage vor der Umsetzung: ob die ODbL-Attribution für Daten, die
nach der Übernahme am eigenen Präparat angezeigt werden, eine sichtbare
Nennung verlangt (Produced Work) oder die Nennung an anderer Stelle der
App genügt. Das ist eine Rechtsfrage und gehört mit Quelle beantwortet
(siehe `launch/odbl-recherche.md`), bevor das Label festgelegt wird.

Derselbe Weg betrifft den Barcode-Pfad nicht: `barcode-off` ist bereits
eindeutig Open Food Facts.
