/**
 * i18n/en/settings.js
 * Settings screen (app/settings.jsx).
 */

export default {
  'settings.kicker': 'Settings',
  'settings.title': 'App status and local data',
  'settings.textSize.title': 'Text size',
  'settings.textSize.text': 'The app follows your device text size. Make it larger or smaller in the iOS settings under Display and Brightness, Text Size; every screen adapts.',
  'settings.textSize.action': 'Open device settings',
  'settings.subtitle':
    'Check your local data, manage the intake history and restore archived supplements.',

  'settings.profileLabel': 'Profile',
  'settings.lifeStageTitle': 'Life stage for reference values',
  'settings.lifeStageText':
    'Reference values and upper limits differ significantly between children, pregnancy, menopause and older age. The selection applies to all substance views in the app.',
  'settings.lifeStageNote':
    'The app compares amounts against public reference values (D-A-CH, EFSA, NIH) and does not make health recommendations.',

  'settings.localStatusLabel': 'Local status',
  'settings.localStatusTitle': 'Data on this device',
  'settings.localStatusText':
    'This overview shows the state currently stored in the app.',
  'settings.statusActive': 'Active',
  'settings.statusArchived': 'Archived',
  'settings.statusDocumented': 'Documented',

  'settings.dataManagementLabel': 'Data storage',
  'settings.dataManagementTitle': 'Local data management',
  'settings.dataManagementText':
    'Supplements, archive, scanner results, inventory and intake history are currently managed in the local app state. Changes in this section only affect the explicitly named data category.',
  'settings.controlledChangesTitle': 'Controlled changes',
  'settings.controlledChangesText':
    'Destructive actions are confirmed before they run. Archived supplements are kept and can be restored.',

  'settings.dataHygieneLabel': 'Data hygiene',
  'settings.intakeHistoryTitle': 'Local intake history',
  'settings.intakeHistoryText':
    'Here you can remove only the intakes documented on this device.',
  'settings.historyStatIntakes': 'Intakes',
  'settings.historyStatUndone': 'Undone',
  'settings.historyStatTotal': 'Total',
  'settings.scopeDeletedLabel': 'Will be deleted',
  'settings.scopeDeletedText':
    'Documented intakes and entries marked as undone',
  'settings.scopeKeptLabel': 'Stays intact',
  'settings.scopeKeptText':
    'Supplements, archive, scanner results and inventory',
  'settings.deleteHistoryButton': 'Delete local intake history',

  'settings.archiveLabel': 'Archive',
  'settings.archiveTitle': 'Archived supplements',
  'settings.archiveText':
    'Archived supplements are not permanently deleted. Their stored data is kept and they can be listed as active supplements again.',
  'settings.emptyArchiveTitle': 'Archive is empty',
  'settings.emptyArchiveText':
    'No supplements are currently archived. Supplements removed from the active inventory are kept safely here.',
  'settings.archivedBadge': 'Archived',
  'settings.storedPurposeLabel': 'Stored purpose',
  'settings.dataStatusLabel': 'Data status',
  'settings.dataStatusText': 'Data is kept locally',
  'settings.restoreFromArchiveButton': 'Restore from archive',

  'settings.generalNoticeLabel': 'General notice',
  'settings.generalNoticeTitle': 'Documentation, not diagnosis',
  'settings.generalNoticeText':
    'The app supports structured recording and organization of supplements. It does not replace medical advice, diagnosis or treatment.',

  'settings.cancel': 'Cancel',
  'settings.clearHistoryEmpty.title': 'No intake history available',
  'settings.clearHistoryEmpty.message':
    'No documented intakes are currently stored on this device.',
  'settings.clearHistoryConfirm.title': 'Delete local intake history?',
  'settings.clearHistoryConfirm.message':
    '{count} documented intakes will be deleted, including entries marked as undone.\n\nYour supplements, archived supplements, scanner results and inventory are kept.',
  'settings.clearHistoryConfirm.confirmButton': 'Delete history',
  'settings.restoreConfirm.title': 'Restore supplement?',
  'settings.restoreConfirm.message':
    '{name} is removed from the archive and listed as an active supplement again.',
  'settings.restoreConfirm.confirmButton': 'Restore',
  'settings.backupLabel': 'Backup',
  'settings.backupTitle': 'Save and transfer your data',
  'settings.backupText':
    'All data lives only on this device. The backup is a JSON file with your complete records: for switching devices, as a safeguard, or as a full data extract. You decide via the share menu where the file goes.',
  'settings.backupExportButton': 'Create backup',
  'settings.backupImportButton': 'Restore backup',
  'settings.backupExportError.title': 'Backup failed',
  'settings.backupExportError.message': 'The file could not be created.',
  'settings.backupImportError.title': 'Restore failed',
  'settings.backupImportError.invalidJson': 'The file is not readable JSON.',
  'settings.backupImportError.wrongSchema':
    'The file is not a backup of this app.',
  'settings.backupImportError.newerVersion':
    'The backup comes from a newer app version. Please update the app first.',
  'settings.backupImportError.missingData': 'The file contains no data.',
  'settings.backupImportConfirm.title': 'Restore backup?',
  'settings.backupImportConfirm.message':
    'Backup from {date}. The current records on this device will be completely replaced.',
  'settings.backupImportConfirm.confirmButton': 'Replace',
  'settings.backupImportDone.title': 'Backup restored',
  'settings.backupImportDone.message': 'The records were imported.',
  'settings.legalLabel': 'Legal',
  'settings.legalTitle': 'Privacy and legal notice',
  'settings.legalText':
    'What the app stores, what leaves the device and who operates it.',
  'settings.privacyLink': 'Privacy policy',
  'settings.imprintLink': 'Legal notice',
  'settings.scanConsentTitle': 'Photo analysis consent',
  'settings.scanConsentGiven':
    'Given on {date}. Label photos may be transmitted for evaluation.',
  'settings.scanConsentNone':
    'Not given. The app asks before the first photo analysis.',
  'settings.scanConsentRevoke': 'Withdraw consent',
  'settings.scanConsentRevoked.title': 'Consent withdrawn',
  'settings.scanConsentRevoked.message':
    'The photo analysis will ask again before the next use.',
  'settings.deleteAllLabel': 'All data',
  'settings.deleteAllTitle': 'Delete all data',
  'settings.deleteAllText':
    'Removes all products, intakes, scan results, your profile, lab values, observations and consents from this device. There is no server backup; deleted means deleted.',
  'settings.deleteAllButton': 'Delete all data',
  'settings.deleteAllConfirm.title': 'Really delete everything?',
  'settings.deleteAllConfirm.message':
    'All entries are irrevocably removed from this device. Afterwards the app starts like on first launch.',
  'settings.deleteAllConfirm.confirmButton': 'Continue',
  'settings.deleteAllConfirm2.title': 'Final confirmation',
  'settings.deleteAllConfirm2.message':
    'This is the last step. After this, all data is gone.',
  'settings.deleteAllConfirm2.confirmButton': 'Delete permanently',
  'settings.quotaLabel': 'Quota',
  'settings.quotaTitle': 'Plan and scans',
  'settings.quotaText':
    'Barcode scans are free without limit. AI photo scans draw on the free quota, the Pro subscription or purchased scans.',
  'settings.quotaTierLabel': 'Plan',
  'settings.quotaTierFree': 'Free',
  'settings.quotaTierPro': 'Pro',
  'settings.quotaFreeLabel': 'Free AI scans left',
  'settings.quotaFairUseLabel': 'Fair use left (month)',
  'settings.quotaCreditsLabel': 'Extra scans',
};
