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
  // Checklist (redesign phase 2, task B): header line with progress and the
  // mono-uppercase mark of the due time group. Single curly braces, the
  // i18n runtime only interpolates this form.
  'dashboard.takenCount': '{done} of {total} taken',
  'dashboard.nowSuffix': ' · NOW',
  'dashboard.subtitle':
    'Daily control center for intake, timing, history and clean documentation.',
  'dashboard.noticeTitle': 'Intake notice active',
  'dashboard.cleanupTitle': 'Multiple entries detected',
  'dashboard.cleanupText':
    '{label} with the same name. Additional entries can be moved to the archive; one active entry remains per supplement.',
  'dashboard.cleanupMeta': 'Affected: {names}',
  'dashboard.cleanupButton': 'Archive duplicates',
  'dashboard.duplicateCount_one': '1 additional entry',
  'dashboard.duplicateCount_other': '{count} additional entries',
  'dashboard.unnamedEntry': 'Unnamed entry',
  'dashboard.sectionRoutineTitle': 'Intake',
  'dashboard.sectionRoutineSubtitle':
    'Grouped by timing, so open and documented intake stay immediately distinguishable.',
  'dashboard.emptyRoutineTitle': 'Nothing planned yet',
  'dashboard.emptyRoutineText':
    'Add your first supplement so the daily plan can be structured by intake time, documentation and history.',
  'dashboard.emptyRoutineButton': 'Add supplement',
  'dashboard.firstSteps.title': 'First setup',
  'dashboard.firstSteps.intro': 'Two more steps and your daily plan is ready.',
  'dashboard.firstSteps.profile.title': 'Life stage set',
  'dashboard.firstSteps.profile.done': 'From your onboarding answers (gender, birth year). Medication, conditions and more can be added under More, Health profile.',
  'dashboard.firstSteps.profile.open': 'Set your life stage so reference values match.',
  'dashboard.firstSteps.account.title': 'Account',
  'dashboard.firstSteps.account.done': 'Signed in. Your data stays encrypted on this device.',
  'dashboard.firstSteps.account.pending': 'Confirmation link sent to {email}. Open it on this device to activate your account. You can continue right away.',
  'dashboard.firstSteps.account.skipped': 'Optional, available any time under More.',
  'dashboard.firstSteps.account.skippedCloud': 'Your data survives a phone change.',
  'dashboard.firstSteps.account.doneCloudOn': 'Cloud backup on.',
  'dashboard.firstSteps.account.doneCloudOff': 'Cloud backup off.',
  'dashboard.firstSteps.account.action': 'Create account',
  'dashboard.firstSteps.supplement.title': 'Add your first supplement',
  'dashboard.firstSteps.supplement.current': 'Scan the label, search the catalog or enter it by hand. The app then assigns an intake time and explains why.',
  'dashboard.firstSteps.supplement.open': 'Available once your profile is set.',
  'dashboard.firstSteps.reminders.title': 'Turn on reminders',
  'dashboard.firstSteps.reminders.done': 'Your device reminds you at intake times.',
  'dashboard.firstSteps.reminders.open': 'Your device reminds you at intake times. Can be changed any time.',
  'dashboard.firstSteps.reminders.action': 'Set up reminders',
  'dashboard.timingIncompleteTitle': 'Timing still incomplete',
  'dashboard.timingIncompleteText':
    'Your supplements exist, but are currently not assigned to a time window. Use "Edit" to complete the timing.',
  'dashboard.slotStatus': 'Time window',
  'dashboard.emptySlotText': 'Nothing is currently scheduled for this time window.',
  'dashboard.statePending': 'Open',
  'dashboard.stockUnitFallback': 'units',
  'dashboard.timingPrefix': '🕐 {timing}',
  'dashboard.inventoryLabel': 'My inventory',
  'dashboard.inventoryCount_one': 'View and manage one product',
  'dashboard.inventoryCount_other': 'View and manage {count} products',
  'dashboard.historyLink': 'View history',
  'dashboard.noteHide': 'Hide details',
  'dashboard.noteShow': 'Show details',
  'dashboard.undo': 'Undo',
  'dashboard.logAction': 'Document',
  'dashboard.nextUpAt': 'next at {time}',
  'dashboard.remindersOff.title': 'Reminders are off',
  'dashboard.remindersOff.text':
    'Your device currently does not remind you of your intake. Turning them on takes a moment.',
  'dashboard.remindersOff.action': 'Turn on',
  'dashboard.curated.stackTitle': 'Daily total above the upper limit',
  'dashboard.curated.stackText':
    '{names}: the sum across all products lies above the daily upper limit. Details in the daily total check.',
  'dashboard.curated.advisoryTitle': 'Note for your life stage',
  'dashboard.curated.advisoryText':
    'Notes for your life stage are documented for {names}.',
  'dashboard.curated.refillTitle': 'Stock running low',
  'dashboard.curated.refillText': '{names}: about {days} days left.',
  'dashboard.remove': 'Remove',
  'dashboard.archiveAlertTitle': 'Remove from daily plan',
  'dashboard.archiveAlertMessage':
    '{name} will be removed from the daily plan. The entry is archived, not permanently deleted.',
  'dashboard.cleanupAlertTitle': 'Clean up duplicate entries',
  'dashboard.cleanupAlertMessage':
    '{label} will be archived. One active entry per supplement remains in your daily plan.',
  'dashboard.cleanupAlertConfirm': 'Clean up',
  'dashboard.noAlertsTitle': 'No open review notices',
  'dashboard.noAlertsText':
    'No additional organizational notices are currently documented for the current daily plan.',
  'dashboard.disclaimer':
    'MySuplea supports the structured documentation of your intake. Notices remain general, serve organization and do not replace medical advice.',
  'dashboard.profileAdult': 'Adult',
  'dashboard.profileChild': 'Child',
  'dashboard.profileDefault': 'Default',
  'dashboard.curePausedTitle': 'Cycle break today',
  // Per-entry explanation (SlotReason.jsx): intake notes, conflicts and
  // synergies from documented rules (ScheduleGuidance.js).
  'dashboard.reason.conflict': 'Apart from {partner}:',
  'dashboard.reason.synergy': 'Together with {partner}:',
  'dashboard.reason.sourceHint': 'Tap the source for the full quote',
  'dashboard.reason.openSource': 'Open source',
  'dashboard.reason.moveTo': 'Move to {slot}',
  'dashboard.reason.moveHint': 'Moves this product to an already used slot without the partner substance',
  // Notice after a cloud restore at startup.
  'dashboard.restored.title': 'Backup restored',
  'dashboard.restored.text': 'Backup from {time} from {device}: {supplements} supplements, {labValues} lab values.',
  'dashboard.restored.dismiss': 'Got it',
};
