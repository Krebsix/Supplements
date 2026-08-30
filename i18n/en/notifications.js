/**
 * i18n/en/notifications.js
 * Reminder settings and the reminder texts themselves.
 */

export default {
  'notifications.kicker': 'Reminders',
  'notifications.title': 'Intake reminders',
  'notifications.subtitle':
    'Reminders are scheduled locally on your device. There is no server and no transmission.',
  'notifications.enableTitle': 'Reminders active',
  'notifications.enableSubtitle':
    'Each occupied intake slot gets a reminder at the configured time. Already logged products and cycle breaks are skipped.',
  'notifications.permissionDenied':
    'The system permission is missing. Enable notifications for MySuplea in the device settings.',
  'notifications.timesTitle': 'Slot times',
  'notifications.timesSubtitle':
    'Format 24 hours, for example 07:30. The slot after the fasted slot automatically waits 30 minutes.',
  'notifications.timeInvalid':
    'Time {value} is invalid. Expected HH:MM, for example 07:30.',
  'notifications.saveButton': 'Save and reschedule',
  'notifications.saved.title': 'Saved',
  'notifications.saved.message': "Today's reminders were rescheduled.",
  'notifications.resetButton': 'Restore default times',

  'notifications.refillTitle': 'Refill',
  'notifications.refillText':
    'A reminder when a supplement lasts only a few days. No purchase link, just the note.',
  'notifications.refillOff': 'Off',
  'notifications.refillDays': '{days} days',

  'logic.notifications.channelName': 'Intake reminders',
  'logic.notifications.actionTaken': 'Taken',
  'logic.notifications.actionSnooze': 'Remind me in 15 minutes',
  'logic.notifications.noDosage': 'Dosage not recorded',
  'logic.notifications.noPurpose': 'Purpose not recorded',
};
