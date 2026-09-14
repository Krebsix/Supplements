# Branch-Lage: zwei offene Arbeitspakete

Stand: 2026-09-14. Beide Pakete sind **ungemergt** und hängen auf
derselben Basis. Wer sie zusammenführt, sollte diese Reihenfolge und die
Berührungspunkte kennen.

## Gemeinsame Basis

Beide Branches zweigen von **`2dcf6ea`** (`chore: .worktrees/ ignorieren`)
auf `phase-2t-account-grundlage` ab.

```
2dcf6ea  phase-2t-account-grundlage
   ├── fix/cloud-backup-schutz      (5 Commits, abgeschlossen, ungemergt)
   └── fix/scanner-beta-readiness   (dieses Paket)
```

## Paket 1: `fix/cloud-backup-schutz`

Abgeschlossen am 2026-09-14, Kopf `0ee71f3`. Inhalt: Fremdpatch
MySuplea-Backup-Korrekturpaket-v1 plus vier eigene Korrekturbefunde plus
der sichtbar inaktive Zustand von "Jetzt sichern".

Berührte Dateien: `CloudBackup.js`, `CloudBackupStore.js`,
`app/(tabs)/(more)/account.jsx`, `app/_layout.jsx`,
`i18n/de|en/account.js`, `theme.js`, `tests/cloud-backup*.test.mjs`,
`docs/geraetetest-cloud-backup-schutz.md`, `CLAUDE.md`.

Offen: dreizehn Geräteprüfungen, dokumentiert in
`docs/geraetetest-cloud-backup-schutz.md`. Nicht als bestanden markiert.

## Paket 2: `fix/scanner-beta-readiness`

Dieses Paket. Bearbeitet die Befunde **L1** und **L5** aus
`docs/feature-audit-scanner-v1.0.md`. L2, L3 und L4 bleiben bewusst
unangetastet.

Berührte Dateien: `AmountEquivalence.js` (neu),
`SupplementOrigin.js` (neu), `StackAnalyzer.js`, `storeLogic.js`,
`useStore.js`, `app/(tabs)/(inventory)/inventory.jsx`,
`i18n/de|en/inventory.js`, `tests/stack-analyzer.test.mjs`,
`tests/supplement-origin.test.mjs` (neu),
`docs/feature-audit-scanner-v1.0.md`, diese Datei.

## Warum die Basis `2dcf6ea` ist und nicht `0ee71f3`

Der Audit wurde auf `0ee71f3` erstellt, also auf dem Kopf des
Backup-Branches. Der **Scanner-Code ist auf beiden Ständen identisch**,
geprüft mit:

```
git diff --stat 2dcf6ea 0ee71f3 -- "app/(tabs)/(scan)" ScanAnalyzer.js \
  BarcodeLookup.js SeedCatalog.js SubstanceMatcher.js DoseNormalizer.js \
  StackAnalyzer.js storeLogic.js useStore.js app/AddSupplement.jsx \
  "app/(tabs)/(discover)" supabase/functions/analyze-supplement
```

Das Ergebnis war leer. Die Audit-Befunde gelten damit unverändert auch
auf `2dcf6ea`, und die Scanner-Arbeit lässt sich unabhängig vom
Backup-Paket prüfen und zusammenführen. Hätte dieses Paket auf `0ee71f3`
aufgesetzt, wäre das Backup-Paket in jedem Scanner-Diff mitgelaufen.

## Berührungspunkte beim Zusammenführen

Die Pakete überschneiden sich in **keiner Datei**. Zwei Stellen brauchen
trotzdem Aufmerksamkeit:

| Datei | Paket 1 | Paket 2 | Konflikt |
|---|---|---|---|
| `theme.js` | neue Tokens `buttonQuietDisabled`, `buttonQuietTextDisabled` | unverändert | keiner, Ergänzung am Ende von `surfaces` |
| `i18n/de|en/*` | `account.js` | `inventory.js` | keiner, verschiedene Dateien |
| `storeLogic.js` | unverändert | `normalizeUserSupplement` erweitert | keiner |
| `tests/` | `cloud-backup*` | `stack-analyzer`, `supplement-origin` | keiner |

Empfohlene Reihenfolge: beliebig. Wer Paket 1 zuerst zusammenführt, muss
für Paket 2 nichts nachziehen, und umgekehrt. `npm test` deckt nach
beiden Zusammenführungen alle Tests gemeinsam ab; die Suite ist auf
jedem Branch einzeln grün.

## Was auf keinem der beiden Branches passiert ist

Kein Merge, kein Push nach `main`, kein Store-Upload, kein Deployment.
`app.json` trägt in der Arbeitskopie die EAS-projectId und ist auf beiden
Branches bewusst nicht committet.
