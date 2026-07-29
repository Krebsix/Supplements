/**
 * i18n/en/settings.js
 * Settings screen (app/settings.jsx).
 */

export default {
  'settings.kicker': 'Settings',
  'settings.title': 'App status and local data',
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
    'No supplements are currently archived. Supplements removed from the active routine are kept safely here.',
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
};
