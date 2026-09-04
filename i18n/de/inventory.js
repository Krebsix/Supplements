/**
 * i18n/de/inventory.js
 * Bestandsuebersicht (app/(tabs)/(today)/inventory.jsx).
 */

export default {
  'inventory.kicker': 'Alles Angelegte',
  'inventory.title': 'Mein Bestand',
  'inventory.subtitle_one': 'Ein Präparat ist angelegt.',
  'inventory.subtitle_other': '{count} Präparate sind angelegt.',
  'inventory.searchPlaceholder': 'Im Bestand suchen',

  'inventory.noSlotTitle_one': 'Ein Präparat hat keinen Einnahmezeitpunkt.',
  'inventory.noSlotTitle_other': '{count} Präparate haben keinen Einnahmezeitpunkt.',
  'inventory.noSlotText':
    'Ohne Zeitpunkt erscheinen sie nicht im Tagesplan. Sie stehen hier oben; über Bearbeiten lässt sich ein Zeitpunkt ergänzen.',
  'inventory.noSlotBadge': 'Kein Zeitpunkt gewählt, erscheint nicht im Tagesplan',

  'inventory.emptyTitle': 'Noch nichts angelegt.',
  'inventory.emptyText':
    'Hier stehen später alle Präparate, die du angelegt hast, unabhängig vom Einnahmezeitpunkt.',
  'inventory.emptyButton': 'Erstes Präparat anlegen',

  'inventory.paused': 'Pausiert',
  'inventory.edit': 'Bearbeiten',
  'inventory.pause': 'Pausieren',
  'inventory.resume': 'Fortsetzen',
  'inventory.archive': 'Ins Archiv',
  'inventory.restore': 'Zurückholen',
  'inventory.addButton': 'Weiteres Präparat anlegen',

  'inventory.filter.active': 'Aktiv · {count}',
  'inventory.filter.archived': 'Archiv · {count}',
  'inventory.filter.emptyActive': 'Keine passenden Präparate im aktiven Bestand.',
  'inventory.filter.emptyArchived': 'Keine passenden Präparate im Archiv.',

  'inventory.archiveTitle': 'Ins Archiv legen?',
  'inventory.archiveMessage':
    '{name} verschwindet aus Tagesplan und Bestand. Die Einnahmen bleiben in der Historie erhalten, und du kannst den Eintrag jederzeit zurückholen.',
  'inventory.archiveConfirm': 'Ins Archiv',

  'inventory.refillIn': 'Reicht noch etwa {days} Tage',
  // Faellig-Fall der Nachfuell-Prognose: eigener Wortlaut statt nur
  // Farbwechsel, sonst waere der Status nur ueber Farbe erkennbar
  // (Bedienregeln, CLAUDE.md).
  'inventory.refillDue': 'Bald nachfüllen, reicht noch etwa {days} Tage',
};
