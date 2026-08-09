# AGENTS.md

Guidance fuer Codex und andere Coding-Agents in diesem Repo.

**Massgeblich ist CLAUDE.md im Repo-Root.** Diese Datei ist bewusst nur ein
Verweis, damit nicht zwei Dokumente auseinanderlaufen: Architektur, Befehle,
Datenbank-Aufbau, Branch-Lage, Design-Regeln und die Harten Regeln stehen
dort und gelten unveraendert auch fuer Codex.

Kurzfassung fuer den Einstieg:

```bash
npm start          # Expo Dev-Server
npm test           # Logik-Tests (esbuild + Node), muss vor jedem Commit gruen sein
```

- Arbeitsbranch ist der aktuelle `phase-*`-Branch, nicht `main` (Details:
  CLAUDE.md, Abschnitt Branch-Lage).
- Fachlogik gehoert in die Module im Repo-Root (TimingEngine, ConflictLogic,
  StackAnalyzer, ...), niemals in Screens.
- Keine erfundenen Werte, keine Gesundheitsempfehlungen, Verbindungsmenge
  ist nicht Elementmenge: siehe CLAUDE.md, Harte Regeln, bevor du Daten
  oder Ausgabetexte anfasst.
