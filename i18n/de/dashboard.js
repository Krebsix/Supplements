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
  // Ersteinrichtung (FirstSteps.js): Schritt fuer Schritt bis zum ersten Praeparat.
  'dashboard.firstSteps.title': 'Ersteinrichtung',
  'dashboard.firstSteps.intro': 'Noch zwei Schritte, dann ist dein Tagesplan bereit.',
  'dashboard.firstSteps.profile.title': 'Profil angelegt',
  'dashboard.firstSteps.profile.done': 'Deine Lebensphase bestimmt die Referenzwerte. Anpassen unter Mehr, Gesundheitsprofil.',
  'dashboard.firstSteps.profile.open': 'Lebensphase festlegen, damit Referenzwerte passen.',
  'dashboard.firstSteps.account.title': 'Konto',
  'dashboard.firstSteps.account.done': 'Angemeldet. Deine Daten bleiben auf dem Gerät verschlüsselt.',
  'dashboard.firstSteps.account.pending': 'Bestätigungslink an {email} geschickt. Öffne ihn auf diesem Gerät, dann ist dein Konto aktiv. Weitermachen kannst du jetzt schon.',
  'dashboard.firstSteps.account.skipped': 'Freiwillig, jederzeit unter Mehr nachholbar.',
  'dashboard.firstSteps.account.action': 'Konto anlegen',
  'dashboard.firstSteps.supplement.title': 'Erstes Präparat hinzufügen',
  'dashboard.firstSteps.supplement.current': 'Scanne das Etikett, suche im Katalog oder trage es von Hand ein. Die App ordnet es dann einer Einnahmezeit zu und erklärt, warum.',
  'dashboard.firstSteps.supplement.open': 'Kommt, sobald das Profil steht.',
  'dashboard.firstSteps.reminders.title': 'Erinnerungen einschalten',
  'dashboard.firstSteps.reminders.done': 'Dein Gerät erinnert dich zu den Einnahmezeiten.',
  'dashboard.firstSteps.reminders.open': 'Dein Gerät erinnert dich zu den Einnahmezeiten. Lässt sich jederzeit ändern.',
  'dashboard.firstSteps.reminders.action': 'Erinnerungen einrichten',
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
  // Erklaerung je Eintrag (SlotReason.jsx): Einnahme-Hinweise, Konflikte
  // und Synergien aus belegten Regeln (ScheduleGuidance.js).
  'dashboard.reason.conflict': 'Getrennt von {partner}:',
  'dashboard.reason.synergy': 'Zusammen mit {partner}:',
  'dashboard.reason.sourceHint': 'Quelle antippen für das vollständige Zitat',
  'dashboard.reason.openSource': 'Quelle öffnen',
};
