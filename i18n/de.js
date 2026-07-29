/**
 * i18n/de.js — Pflegesprache
 * ─────────────────────────────────────────────────────────────
 * Neue Texte entstehen hier zuerst, danach in en.js. Fehlt ein
 * englischer Eintrag, faellt die App auf den deutschen Satz zurueck.
 *
 * Schluessel-Aufbau: <bereich>.<element>
 * Platzhalter in geschweiften Klammern: "{count} Produkte"
 */

export default {
  // Wiederkehrend
  'common.back': 'Zurück',
  'common.backToHome': 'Zurück zur Startseite',
  'common.cancel': 'Abbrechen',
  'common.save': 'Speichern',
  'common.delete': 'Löschen',
  'common.language': 'Sprache',

  // Sprachumschaltung
  'language.title': 'Sprache',
  'language.hint': 'Die Oberfläche wechselt sofort. Fachtexte der Wirkstoff-Datenbank bleiben vorerst auf Deutsch.',

  // Startseite
  'home.kicker': 'Supplement OS',
  'home.title': 'Scannen. Prüfen. In Routine überführen.',
  'home.subtitle':
    'Dein strukturierter Workspace für Supplement-Daten, Tagesroutine, Verlauf und spätere Scanner-Qualität.',

  'home.hero.label': 'Klinischer Workflow',
  'home.hero.title': 'Erfassen, validieren, dokumentieren.',
  'home.hero.text':
    'Supplement OS priorisiert belastbare Einträge: erst klare Produktdaten, dann Routine-Logik, später echte Scanner-Intelligenz.',
  'home.hero.scan': 'Produkt scannen',
  'home.hero.manual': 'Manuell erfassen',

  'home.trust.label': 'Produktprinzip',
  'home.trust.quality.title': 'Datenqualität vor Automatisierung',
  'home.trust.quality.text':
    'Scanner- und manuelle Einträge sollen nachvollziehbar bleiben, bevor sie Routine-Logik beeinflussen.',
  'home.trust.archive.title': 'Archiv statt Datenverlust',
  'home.trust.archive.text':
    'Entfernte Supplements bleiben wiederherstellbar, damit Verlauf und Kontext erhalten bleiben.',
  'home.trust.advice.title': 'Allgemeine Hinweise',
  'home.trust.advice.text':
    'Die App organisiert und dokumentiert. Sie ersetzt keine medizinische Beratung.',

  'home.section.workflow': 'Workflow',
  'home.nav.today.title': 'Tagesplan',
  'home.nav.today.subtitle':
    'Heute geplante Einnahmen, dokumentierte Routinen, offene Einträge und organisatorische Prüfhinweise.',
  'home.nav.add.title': 'Neues Supplement',
  'home.nav.add.subtitle':
    'Manuellen Eintrag mit Dosierung, Timing und Zweck sauber in die aktive Routine aufnehmen.',
  'home.nav.history.title': 'Verlauf',
  'home.nav.history.subtitle':
    'Dokumentierte Einnahmen, Routine-Aktivität und frühere Einträge nachvollziehen.',
  'home.nav.settings.title': 'Einstellungen',
  'home.nav.settings.subtitle':
    'Archiv, lokale Daten, Systemstatus und spätere Datenquellen verwalten.',

  // Bestandsanalyse (StackAnalyzer)
  'stack.title': 'Tagessumme über alle Produkte',
  'stack.subtitle':
    'Obergrenzen gelten für die Gesamtmenge pro Tag, nicht für die einzelne Dose.',
  'stack.empty': 'Noch keine aktiven Produkte im Bestand.',
  'stack.fromProducts_one': 'aus {count} Produkt',
  'stack.fromProducts_other': 'aus {count} Produkten',
  'stack.converted': 'enthält umgerechnete Verbindungsmengen',
  'stack.unresolved.title': 'Nicht verrechnet',
  'stack.unresolved.unknownSubstance': 'Wirkstoff nicht in der Datenbank',
  'stack.unresolved.noAmount': 'Keine Mengenangabe erfasst',
  'stack.unresolved.noComparable': 'Menge nicht sicher umrechenbar',
};
