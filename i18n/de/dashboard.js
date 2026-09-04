/**
 * i18n/de/dashboard.js
 * Tagesplan (app/Dashboard.jsx).
 */

export default {
  // Arbeitsfluss-Kopf (NextUp.js): erst handeln, dann Zahlen.
  'dashboard.nextUp.title': 'Als Nächstes',
  'dashboard.nextUp.slot': '{label} ({time})',
  'dashboard.nextUp.remaining': 'Danach heute noch {count} offen.',
  'dashboard.nextUp.allDone': 'Für heute ist alles dokumentiert.',
  'dashboard.nextUp.nothingPlanned': 'Heute ist nichts geplant.',
  'dashboard.summaryLine': '{done} von {total} dokumentiert',
  'dashboard.summaryDetailsShow': 'Details anzeigen',
  'dashboard.summaryDetailsHide': 'Details ausblenden',
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
  'dashboard.summaryLabel': 'Heute',
  'dashboard.summaryProgress': '{done} / {total} dokumentiert',
  'dashboard.summaryEmpty': 'Keine Einnahmen geplant',
  'dashboard.insightSetupLabel': 'Setup offen',
  'dashboard.insightSetupText':
    'Füge Supplements hinzu oder ordne Timing zu, damit der Tagesplan belastbar wird.',
  'dashboard.insightCompleteLabel': 'Alles dokumentiert',
  'dashboard.insightCompleteText':
    'Alle geplanten Einnahmen sind für heute dokumentiert.',
  'dashboard.insightPendingLabel': '{pending} offen',
  'dashboard.insightPendingText':
    'Offene Einnahmen bleiben sichtbar, bis sie dokumentiert oder rückgängig gemacht werden.',
  'dashboard.lastActivityNone': 'Heute wurde noch keine Einnahme dokumentiert.',
  'dashboard.lastActivityInvalid': 'Letzte Aktivität konnte nicht gelesen werden.',
  'dashboard.lastActivityLogged': 'Zuletzt dokumentiert: {date}',
  'dashboard.noticeTitle': 'Einnahmehinweis aktiv',
  'dashboard.metricActiveRoutine': 'Aktive Präparate',
  'dashboard.metricScheduledToday': 'Heute geplant',
  'dashboard.metricLogged': 'Dokumentiert',
  'dashboard.metricPending': 'Noch offen',
  'dashboard.cleanupTitle': 'Mehrfache Einträge erkannt',
  'dashboard.cleanupText':
    '{label} mit gleichem Namen. Zusätzliche Einträge können ins Archiv verschoben werden; je Supplement bleibt ein aktiver Eintrag erhalten.',
  'dashboard.cleanupMeta': 'Betroffen: {names}',
  'dashboard.cleanupButton': 'Duplikate archivieren',
  'dashboard.duplicateCount_one': '1 zusätzlicher Eintrag',
  'dashboard.duplicateCount_other': '{count} zusätzliche Einträge',
  'dashboard.unnamedEntry': 'Unbenannter Eintrag',
  'dashboard.sectionRoutineTitle': 'Einnahmen',
  'dashboard.sectionRoutineSubtitle':
    'Nach Timing gruppiert, damit offene und dokumentierte Einnahmen sofort unterscheidbar bleiben.',
  'dashboard.emptyRoutineTitle': 'Noch nichts eingeplant',
  'dashboard.emptyRoutineText':
    'Füge dein erstes Supplement hinzu, damit der Tagesplan nach Einnahmezeit, Dokumentation und Verlauf strukturiert werden kann.',
  'dashboard.emptyRoutineButton': 'Supplement hinzufügen',
  // Ersteinrichtung (FirstSteps.js): Schritt fuer Schritt bis zum ersten Praeparat.
  'dashboard.firstSteps.title': 'Ersteinrichtung',
  'dashboard.firstSteps.intro': 'Noch zwei Schritte, dann ist dein Tagesplan bereit.',
  'dashboard.firstSteps.profile.title': 'Lebensphase festgelegt',
  'dashboard.firstSteps.profile.done': 'Aus deinen Angaben im Onboarding (Geschlecht, Geburtsjahr). Medikamente, Erkrankungen und mehr kannst du unter Mehr, Gesundheitsprofil ergänzen.',
  'dashboard.firstSteps.profile.open': 'Lebensphase festlegen, damit Referenzwerte passen.',
  'dashboard.firstSteps.account.title': 'Konto',
  'dashboard.firstSteps.account.done': 'Angemeldet. Deine Daten bleiben auf dem Gerät verschlüsselt.',
  'dashboard.firstSteps.account.pending': 'Bestätigungslink an {email} geschickt. Öffne ihn auf diesem Gerät, dann ist dein Konto aktiv. Weitermachen kannst du jetzt schon.',
  'dashboard.firstSteps.account.skipped': 'Freiwillig, jederzeit unter Mehr nachholbar.',
  'dashboard.firstSteps.account.skippedCloud': 'Deine Daten überleben den Handywechsel.',
  'dashboard.firstSteps.account.doneCloudOn': 'Cloud-Backup aktiv.',
  'dashboard.firstSteps.account.doneCloudOff': 'Cloud-Backup aus.',
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
  'dashboard.slotStatus': 'Zeitfenster',
  'dashboard.emptySlotText': 'Für dieses Zeitfenster ist aktuell nichts geplant.',
  'dashboard.stateLogged': 'Dokumentiert',
  'dashboard.statePending': 'Offen',
  'dashboard.stockNote': 'Bestand dokumentiert: {amount} {unit}',
  'dashboard.stockUnitFallback': 'Einheiten',
  'dashboard.timingPrefix': '🕐 {timing}',
  'dashboard.inventoryLabel': 'Mein Bestand',
  'dashboard.inventoryCount_one': 'Ein Präparat ansehen und verwalten',
  'dashboard.inventoryCount_other': '{count} Präparate ansehen und verwalten',
  'dashboard.historyLink': 'Verlauf ansehen',
  'dashboard.noteHide': 'Details ausblenden',
  'dashboard.noteShow': 'Details anzeigen',
  'dashboard.undo': 'Rückgängig',
  'dashboard.logAction': 'Dokumentieren',
  'dashboard.loggedAtTime': 'Dokumentiert um {time}',
  'dashboard.nextUpAt': 'als Nächstes {time}',
  // Tagesbogen (DayArc): Status je Punkt fuer die Vorlese-Beschriftung.
  'dashboard.arc.done': 'dokumentiert',
  'dashboard.arc.next': 'als Nächstes',
  'dashboard.arc.later': 'offen',
  // Hinweis, wenn Erinnerungen faktisch aus sind (Gerätetest 02.09.):
  // geplante Einnahmen ohne aktive Push-Erinnerung.
  'dashboard.remindersOff.title': 'Erinnerungen sind aus',
  'dashboard.remindersOff.text':
    'Dein Gerät erinnert dich derzeit nicht an deine Einnahmen. Einschalten dauert einen Moment.',
  'dashboard.remindersOff.action': 'Einschalten',
  // Kuratierte Karten und Slot-Aufklapper (Spec-Iteration 2026-09-02).
  'dashboard.allTodayTitle': 'Alle Einnahmen heute ({count})',
  'dashboard.curated.stackTitle': 'Tagessumme über der Obergrenze',
  'dashboard.curated.stackText':
    '{names}: Die Summe über alle Präparate liegt über der Tagesobergrenze. Details im Tagessummen-Check.',
  'dashboard.curated.advisoryTitle': 'Hinweis für deine Lebensphase',
  'dashboard.curated.advisoryText':
    'Zu {names} sind Hinweise für deine Lebensphase hinterlegt.',
  'dashboard.curated.refillTitle': 'Bestand wird knapp',
  'dashboard.curated.refillText': '{names}: reicht noch etwa {days} Tage.',
  'dashboard.edit': 'Bearbeiten',
  'dashboard.remove': 'Entfernen',
  'dashboard.archiveAlertTitle': 'Aus dem Tagesplan entfernen',
  'dashboard.archiveAlertMessage':
    '{name} wird aus dem Tagesplan entfernt. Der Eintrag wird archiviert und nicht dauerhaft gelöscht.',
  'dashboard.cleanupAlertTitle': 'Mehrfache Einträge bereinigen',
  'dashboard.cleanupAlertMessage':
    '{label} werden archiviert. Je Supplement-Name bleibt ein aktiver Eintrag in deinem Tagesplan erhalten.',
  'dashboard.cleanupAlertConfirm': 'Bereinigen',
  'dashboard.sectionAlertsTitle': 'Prüfhinweise',
  'dashboard.sectionAlertsSubtitle':
    'Allgemeine Hinweise zur Organisation deiner Einnahmen, ohne medizinische Bewertung.',
  'dashboard.noAlertsTitle': 'Keine offenen Prüfhinweise',
  'dashboard.noAlertsText':
    'Für den aktuellen Tagesplan liegen derzeit keine zusätzlichen organisatorischen Hinweise vor.',
  'dashboard.disclaimer':
    'MySuplea unterstützt die strukturierte Dokumentation deiner Einnahmen. Hinweise bleiben allgemein, dienen der Organisation und ersetzen keine medizinische Beratung.',
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
  'dashboard.reason.moveTo': 'Auf {slot} verschieben',
  'dashboard.reason.moveHint': 'Verschiebt dieses Präparat in einen bereits genutzten Slot ohne den Partner-Wirkstoff',
  // Hinweis nach einer Cloud-Wiederherstellung beim Start.
  'dashboard.restored.title': 'Stand übernommen',
  'dashboard.restored.text': 'Stand vom {time} von {device}: {supplements} Präparate, {labValues} Laborwerte.',
  'dashboard.restored.dismiss': 'Verstanden',
};
