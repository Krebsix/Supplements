/**
 * i18n/en/dashboard.js
 * Daily plan (app/Dashboard.jsx).
 * Descriptive wording only — the app organizes and documents, it does not advise.
 */

export default {
  // Header greeting, by time of day (display only, no logic module).
  'dashboard.greeting.morning': 'Good morning',
  'dashboard.greeting.day': 'Hello',
  'dashboard.greeting.evening': 'Good evening',
  'dashboard.greetingName': '{greeting}, {name}.',
  'dashboard.greetingPlain': '{greeting}.',
  'dashboard.kicker': 'MySuplea',
  'dashboard.profileLabel': 'Profile: {profile}',
  'dashboard.title': 'Daily plan',
  'dashboard.subtitle':
    'Daily control center for intake, timing, history and clean documentation.',
  'dashboard.summaryLabel': 'Daily routine',
  'dashboard.summaryProgress': '{done} / {total} documented',
  'dashboard.summaryEmpty': 'No intake scheduled',
  'dashboard.insightSetupLabel': 'Setup pending',
  'dashboard.insightSetupText':
    'Add supplements or assign timing so the daily routine becomes reliable.',
  'dashboard.insightCompleteLabel': 'Routine complete',
  'dashboard.insightCompleteText':
    'All intake scheduled for today has been documented.',
  'dashboard.insightPendingLabel': '{pending} open',
  'dashboard.insightPendingText':
    'Open intake stays visible until it is documented or undone.',
  'dashboard.lastActivityNone': 'No intake has been documented today yet.',
  'dashboard.lastActivityInvalid': 'Last activity could not be read.',
  'dashboard.lastActivityLogged': 'Last documented: {date}',
  'dashboard.noticeTitle': 'Intake notice active',
  'dashboard.metricActiveRoutine': 'Active routine',
  'dashboard.metricScheduledToday': 'Scheduled today',
  'dashboard.metricLogged': 'Documented',
  'dashboard.metricPending': 'Still open',
  'dashboard.cleanupTitle': 'Multiple routine entries detected',
  'dashboard.cleanupText':
    '{label} with the same name. Additional entries can be moved to the archive; one active routine entry remains per supplement.',
  'dashboard.cleanupMeta': 'Affected: {names}',
  'dashboard.cleanupButton': 'Archive duplicates',
  'dashboard.duplicateCount_one': '1 additional entry',
  'dashboard.duplicateCount_other': '{count} additional entries',
  'dashboard.unnamedEntry': 'Unnamed entry',
  'dashboard.sectionRoutineTitle': 'Routine',
  'dashboard.sectionRoutineSubtitle':
    'Grouped by timing, so open and documented intake stay immediately distinguishable.',
  'dashboard.emptyRoutineTitle': 'Routine not set up yet',
  'dashboard.emptyRoutineText':
    'Add your first supplement so the daily plan can be structured by intake time, documentation and history.',
  'dashboard.emptyRoutineButton': 'Add supplement',
  'dashboard.timingIncompleteTitle': 'Timing still incomplete',
  'dashboard.timingIncompleteText':
    'Your supplements exist, but are currently not assigned to a time window. Use "Edit" to complete the timing.',
  'dashboard.slotCountEmpty': 'No intake scheduled',
  'dashboard.slotCount_one': '1 scheduled intake',
  'dashboard.slotCount_other': '{count} scheduled intakes',
  'dashboard.slotStatus': 'Routine window',
  'dashboard.emptySlotText': 'Nothing is currently scheduled for this time window.',
  'dashboard.stateLogged': 'Documented',
  'dashboard.statePending': 'Open',
  'dashboard.stockNote': 'Stock documented: {amount} {unit}',
  'dashboard.stockUnitFallback': 'units',
  'dashboard.timingPrefix': '🕐 {timing}',
  'dashboard.inventoryLabel': 'My inventory',
  'dashboard.inventoryCount_one': 'View and manage one product',
  'dashboard.inventoryCount_other': 'View and manage {count} products',
  'dashboard.noteHide': 'Hide details',
  'dashboard.noteShow': 'Show details',
  'dashboard.undo': 'Undo',
  'dashboard.logAction': 'Document',
  'dashboard.edit': 'Edit',
  'dashboard.remove': 'Remove',
  'dashboard.archiveAlertTitle': 'Remove from routine',
  'dashboard.archiveAlertMessage':
    '{name} will be removed from the active routine. The entry is archived, not permanently deleted.',
  'dashboard.cleanupAlertTitle': 'Clean up duplicate entries',
  'dashboard.cleanupAlertMessage':
    '{label} will be archived. One active entry per supplement remains in your routine.',
  'dashboard.cleanupAlertConfirm': 'Clean up',
  'dashboard.sectionAlertsTitle': 'Review notices',
  'dashboard.sectionAlertsSubtitle':
    'General notices on routine organization, without medical assessment.',
  'dashboard.noAlertsTitle': 'No open review notices',
  'dashboard.noAlertsText':
    'No additional organizational notices are currently documented for the current daily plan.',
  'dashboard.disclaimer':
    'MySuplea supports the structured documentation of your routine. Notices remain general, serve organization and do not replace medical advice.',
  'dashboard.profileAdult': 'Adult',
  'dashboard.profileChild': 'Child',
  'dashboard.profileDefault': 'Default',
  'dashboard.curePausedTitle': 'Cycle break today',
};
