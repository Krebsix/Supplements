/**
 * i18n/de/dashboard.js
 * Tagesplan (app/Dashboard.jsx).
 */

export default {
  // Begruessung im Kopf, nach Tageszeit (Anzeige, kein Logik-Modul).
  'dashboard.greeting.morning': 'Guten Morgen',
  'dashboard.greeting.day': 'Hallo',
  'dashboard.greeting.evening': 'Guten Abend',
  'dashboard.greetingName': '{greeting}, {name}.',
  'dashboard.greetingPlain': '{greeting}.',
  'dashboard.kicker': 'MySuplea',
  'dashboard.profileLabel': 'Profil: {profile}',
  'dashboard.title': 'Tagesplan',
  'dashboard.subtitle':
    'Tägliches Kontrollzentrum für Einnahmen, Timing, Verlauf und saubere Dokumentation.',
  'dashboard.summaryLabel': 'Tagesroutine',
  'dashboard.summaryProgress': '{done} / {total} dokumentiert',
  'dashboard.summaryEmpty': 'Keine Einnahmen geplant',
  'dashboard.insightSetupLabel': 'Setup offen',
  'dashboard.insightSetupText':
    'Füge Supplements hinzu oder ordne Timing zu, damit die Tagesroutine belastbar wird.',
  'dashboard.insightCompleteLabel': 'Routine vollständig',
  'dashboard.insightCompleteText':
    'Alle geplanten Einnahmen sind für heute dokumentiert.',
  'dashboard.insightPendingLabel': '{pending} offen',
  'dashboard.insightPendingText':
    'Offene Einnahmen bleiben sichtbar, bis sie dokumentiert oder rückgängig gemacht werden.',
  'dashboard.lastActivityNone': 'Heute wurde noch keine Einnahme dokumentiert.',
  'dashboard.lastActivityInvalid': 'Letzte Aktivität konnte nicht gelesen werden.',
  'dashboard.lastActivityLogged': 'Zuletzt dokumentiert: {date}',
  'dashboard.noticeTitle': 'Einnahmehinweis aktiv',
  'dashboard.metricActiveRoutine': 'Aktive Routine',
  'dashboard.metricScheduledToday': 'Heute geplant',
  'dashboard.metricLogged': 'Dokumentiert',
  'dashboard.metricPending': 'Noch offen',
  'dashboard.cleanupTitle': 'Mehrfache Routine-Einträge erkannt',
  'dashboard.cleanupText':
    '{label} mit gleichem Namen. Zusätzliche Einträge können ins Archiv verschoben werden; je Supplement bleibt ein aktiver Routine-Eintrag erhalten.',
  'dashboard.cleanupMeta': 'Betroffen: {names}',
  'dashboard.cleanupButton': 'Duplikate archivieren',
  'dashboard.duplicateCount_one': '1 zusätzlicher Eintrag',
  'dashboard.duplicateCount_other': '{count} zusätzliche Einträge',
  'dashboard.unnamedEntry': 'Unbenannter Eintrag',
  'dashboard.sectionRoutineTitle': 'Routine',
  'dashboard.sectionRoutineSubtitle':
    'Nach Timing gruppiert, damit offene und dokumentierte Einnahmen sofort unterscheidbar bleiben.',
  'dashboard.emptyRoutineTitle': 'Routine noch nicht eingerichtet',
  'dashboard.emptyRoutineText':
    'Füge dein erstes Supplement hinzu, damit der Tagesplan nach Einnahmezeit, Dokumentation und Verlauf strukturiert werden kann.',
  'dashboard.emptyRoutineButton': 'Supplement hinzufügen',
  'dashboard.timingIncompleteTitle': 'Timing noch unvollständig',
  'dashboard.timingIncompleteText':
    'Deine Supplements sind vorhanden, aber aktuell keinem Zeitfenster zugeordnet. Über „Bearbeiten“ kannst du das Timing sauber ergänzen.',
  'dashboard.slotCountEmpty': 'Keine geplanten Einnahmen',
  'dashboard.slotCount_one': '1 geplante Einnahme',
  'dashboard.slotCount_other': '{count} geplante Einnahmen',
  'dashboard.slotStatus': 'Routine-Fenster',
  'dashboard.emptySlotText': 'Für dieses Zeitfenster ist aktuell nichts geplant.',
  'dashboard.stateLogged': 'Dokumentiert',
  'dashboard.statePending': 'Offen',
  'dashboard.stockNote': 'Bestand dokumentiert: {amount} {unit}',
  'dashboard.stockUnitFallback': 'Einheiten',
  'dashboard.timingPrefix': '🕐 {timing}',
  'dashboard.inventoryLabel': 'Mein Bestand',
  'dashboard.inventoryCount_one': 'Ein Präparat ansehen und verwalten',
  'dashboard.inventoryCount_other': '{count} Präparate ansehen und verwalten',
  'dashboard.noteHide': 'Details ausblenden',
  'dashboard.noteShow': 'Details anzeigen',
  'dashboard.undo': 'Rückgängig',
  'dashboard.logAction': 'Dokumentieren',
  'dashboard.edit': 'Bearbeiten',
  'dashboard.remove': 'Entfernen',
  'dashboard.archiveAlertTitle': 'Aus Routine entfernen',
  'dashboard.archiveAlertMessage':
    '{name} wird aus der aktiven Routine entfernt. Der Eintrag wird archiviert und nicht dauerhaft gelöscht.',
  'dashboard.cleanupAlertTitle': 'Mehrfache Einträge bereinigen',
  'dashboard.cleanupAlertMessage':
    '{label} werden archiviert. Je Supplement-Name bleibt ein aktiver Eintrag in deiner Routine erhalten.',
  'dashboard.cleanupAlertConfirm': 'Bereinigen',
  'dashboard.sectionAlertsTitle': 'Prüfhinweise',
  'dashboard.sectionAlertsSubtitle':
    'Allgemeine Hinweise zur Routine-Organisation, ohne medizinische Bewertung.',
  'dashboard.noAlertsTitle': 'Keine offenen Prüfhinweise',
  'dashboard.noAlertsText':
    'Für den aktuellen Tagesplan liegen derzeit keine zusätzlichen organisatorischen Hinweise vor.',
  'dashboard.disclaimer':
    'MySuplea unterstützt die strukturierte Dokumentation deiner Routine. Hinweise bleiben allgemein, dienen der Organisation und ersetzen keine medizinische Beratung.',
  'dashboard.profileAdult': 'Erwachsen',
  'dashboard.profileChild': 'Kind',
  'dashboard.profileDefault': 'Standard',
  'dashboard.curePausedTitle': 'Heute Kur-Pause',
};
