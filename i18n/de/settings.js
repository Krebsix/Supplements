/**
 * i18n/de/settings.js
 * Einstellungen (app/settings.jsx).
 */

export default {
  'settings.kicker': 'Einstellungen',
  'settings.title': 'App-Status und lokale Daten',
  'settings.textSize.title': 'Textgröße',
  'settings.textSize.text': 'Die App folgt der Textgröße deines Geräts. Größer oder kleiner stellst du sie in den iOS-Einstellungen unter Anzeige und Helligkeit, Textgröße; alle Bildschirme passen sich an.',
  'settings.textSize.action': 'Geräte-Einstellungen öffnen',
  'settings.subtitle':
    'Prüfe deinen lokalen Datenbestand, verwalte die Einnahmehistorie und stelle archivierte Supplements wieder her.',

  'settings.profileLabel': 'Profil',
  'settings.lifeStageTitle': 'Lebensphase für Referenzwerte',
  'settings.lifeStageText':
    'Referenzwerte und Obergrenzen unterscheiden sich deutlich zwischen Kindern, Schwangerschaft, Menopause und höherem Alter. Die Auswahl gilt für alle Wirkstoff-Ansichten in der App.',
  'settings.lifeStageNote':
    'Die App gleicht Mengen mit öffentlichen Referenzwerten ab (D-A-CH, EFSA, NIH) und spricht keine gesundheitlichen Empfehlungen aus.',

  'settings.localStatusLabel': 'Lokaler Status',
  'settings.localStatusTitle': 'Datenbestand auf diesem Gerät',
  'settings.localStatusText':
    'Diese Übersicht zeigt den aktuell in der App gespeicherten Zustand.',
  'settings.statusActive': 'Aktiv',
  'settings.statusArchived': 'Archiviert',
  'settings.statusDocumented': 'Dokumentiert',

  'settings.dataManagementLabel': 'Datenhaltung',
  'settings.dataManagementTitle': 'Lokale Datenverwaltung',
  'settings.dataManagementText':
    'Supplements, Archiv, Scanner-Ergebnisse, Bestände und Einnahmehistorie werden aktuell im lokalen App-Zustand verwaltet. Änderungen in diesem Bereich betreffen ausschließlich die jeweils ausdrücklich genannte Datenkategorie.',
  'settings.controlledChangesTitle': 'Kontrollierte Änderungen',
  'settings.controlledChangesText':
    'Destruktive Aktionen werden vor der Ausführung bestätigt. Archivierte Supplements bleiben erhalten und können wiederhergestellt werden.',

  'settings.dataHygieneLabel': 'Datenhygiene',
  'settings.intakeHistoryTitle': 'Lokale Einnahmehistorie',
  'settings.intakeHistoryText':
    'Hier kannst du ausschließlich die auf diesem Gerät dokumentierten Einnahmen entfernen.',
  'settings.historyStatIntakes': 'Einnahmen',
  'settings.historyStatUndone': 'Rückgängig',
  'settings.historyStatTotal': 'Gesamt',
  'settings.scopeDeletedLabel': 'Wird gelöscht',
  'settings.scopeDeletedText':
    'Dokumentierte Einnahmen und rückgängig gemachte Einträge',
  'settings.scopeKeptLabel': 'Bleibt erhalten',
  'settings.scopeKeptText':
    'Supplements, Archiv, Scanner-Ergebnisse und Bestände',
  'settings.deleteHistoryButton': 'Lokale Einnahmehistorie löschen',

  'settings.archiveLabel': 'Archiv',
  'settings.archiveTitle': 'Archivierte Supplements',
  'settings.archiveText':
    'Archivierte Supplements sind nicht endgültig gelöscht. Ihre gespeicherten Angaben bleiben erhalten und können wieder als aktive Supplements geführt werden.',
  'settings.emptyArchiveTitle': 'Archiv ist leer',
  'settings.emptyArchiveText':
    'Aktuell sind keine Supplements archiviert. Aus der aktiven Routine entfernte Supplements werden hier sicher aufbewahrt.',
  'settings.archivedBadge': 'Archiviert',
  'settings.storedPurposeLabel': 'Gespeicherter Zweck',
  'settings.dataStatusLabel': 'Datenstatus',
  'settings.dataStatusText': 'Angaben bleiben lokal erhalten',
  'settings.restoreFromArchiveButton': 'Aus Archiv wiederherstellen',

  'settings.generalNoticeLabel': 'Allgemeiner Hinweis',
  'settings.generalNoticeTitle': 'Dokumentation statt Diagnose',
  'settings.generalNoticeText':
    'Die App unterstützt die strukturierte Erfassung und Organisation von Supplements. Sie ersetzt keine medizinische Beratung, Diagnose oder Behandlung.',

  'settings.cancel': 'Abbrechen',
  'settings.clearHistoryEmpty.title': 'Keine Einnahmehistorie vorhanden',
  'settings.clearHistoryEmpty.message':
    'Auf diesem Gerät sind aktuell keine dokumentierten Einnahmen gespeichert.',
  'settings.clearHistoryConfirm.title': 'Lokale Einnahmehistorie löschen?',
  'settings.clearHistoryConfirm.message':
    'Gelöscht werden {count} dokumentierte Einnahmen einschließlich rückgängig gemachter Einträge.\n\nErhalten bleiben deine Supplements, archivierten Supplements, Scanner-Ergebnisse und Bestände.',
  'settings.clearHistoryConfirm.confirmButton': 'Historie löschen',
  'settings.restoreConfirm.title': 'Supplement wiederherstellen?',
  'settings.restoreConfirm.message':
    '{name} wird aus dem Archiv entfernt und wieder als aktives Supplement geführt.',
  'settings.restoreConfirm.confirmButton': 'Wiederherstellen',
  'settings.backupLabel': 'Backup',
  'settings.backupTitle': 'Daten sichern und übertragen',
  'settings.backupText':
    'Alle Daten liegen nur auf diesem Gerät. Das Backup ist eine JSON-Datei mit deinem kompletten Bestand: für den Gerätewechsel, als Sicherung, oder als vollständiger Datenauszug. Du entscheidest über das Teilen-Menü, wo die Datei landet.',
  'settings.backupExportButton': 'Backup erstellen',
  'settings.backupImportButton': 'Backup einspielen',
  'settings.backupExportError.title': 'Backup fehlgeschlagen',
  'settings.backupExportError.message': 'Die Datei konnte nicht erstellt werden.',
  'settings.backupImportError.title': 'Einspielen fehlgeschlagen',
  'settings.backupImportError.invalidJson':
    'Die Datei ist kein lesbares JSON.',
  'settings.backupImportError.wrongSchema':
    'Die Datei ist kein Backup dieser App.',
  'settings.backupImportError.newerVersion':
    'Das Backup stammt aus einer neueren App-Version. Bitte erst die App aktualisieren.',
  'settings.backupImportError.missingData':
    'Die Datei enthält keinen Datenbestand.',
  'settings.backupImportConfirm.title': 'Backup einspielen?',
  'settings.backupImportConfirm.message':
    'Backup vom {date}. Der aktuelle Bestand auf diesem Gerät wird dabei vollständig ersetzt.',
  'settings.backupImportConfirm.confirmButton': 'Ersetzen',
  'settings.backupImportDone.title': 'Backup eingespielt',
  'settings.backupImportDone.message': 'Der Bestand wurde übernommen.',
  'settings.legalLabel': 'Rechtliches',
  'settings.legalTitle': 'Datenschutz und Impressum',
  'settings.legalText':
    'Was die App speichert, was das Gerät verlässt und wer sie betreibt.',
  'settings.privacyLink': 'Datenschutzerklärung',
  'settings.imprintLink': 'Impressum',
  'settings.scanConsentTitle': 'Einwilligung Foto-Analyse',
  'settings.scanConsentGiven':
    'Erteilt am {date}. Etikettenfotos dürfen zur Auswertung übertragen werden.',
  'settings.scanConsentNone':
    'Nicht erteilt. Die App fragt vor der ersten Foto-Analyse.',
  'settings.scanConsentRevoke': 'Einwilligung widerrufen',
  'settings.scanConsentRevoked.title': 'Einwilligung widerrufen',
  'settings.scanConsentRevoked.message':
    'Die Foto-Analyse fragt vor der nächsten Nutzung erneut.',
  'settings.deleteAllLabel': 'Alle Daten',
  'settings.deleteAllTitle': 'Sämtliche Daten löschen',
  'settings.deleteAllText':
    'Entfernt alle Präparate, Einnahmen, Scan-Ergebnisse, dein Profil, Laborwerte, Beobachtungen und Einwilligungen von diesem Gerät. Es gibt kein Backup auf einem Server, gelöscht ist gelöscht.',
  'settings.deleteAllButton': 'Alle Daten löschen',
  'settings.deleteAllConfirm.title': 'Wirklich alles löschen?',
  'settings.deleteAllConfirm.message':
    'Alle Einträge werden unwiederbringlich von diesem Gerät entfernt. Die App startet danach wie beim ersten Öffnen.',
  'settings.deleteAllConfirm.confirmButton': 'Weiter',
  'settings.deleteAllConfirm2.title': 'Letzte Bestätigung',
  'settings.deleteAllConfirm2.message':
    'Das ist der letzte Schritt. Danach sind alle Daten weg.',
  'settings.deleteAllConfirm2.confirmButton': 'Endgültig löschen',
  'settings.quotaLabel': 'Kontingent',
  'settings.quotaTitle': 'Tarif und Scans',
  'settings.quotaText':
    'Barcode-Scans sind unbegrenzt frei. KI-Foto-Scans laufen über das Freikontingent, das Pro-Abo oder nachgekaufte Scans.',
  'settings.quotaTierLabel': 'Tarif',
  'settings.quotaTierFree': 'Free',
  'settings.quotaTierPro': 'Pro',
  'settings.quotaFreeLabel': 'Freie KI-Scans übrig',
  'settings.quotaFairUseLabel': 'Fair-Use übrig (Monat)',
  'settings.quotaCreditsLabel': 'Zusatz-Scans',
};
