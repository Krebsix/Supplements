/**
 * i18n/de/profile.js
 * Persoenliches Profil (app/profile.jsx).
 *
 * FORMULIERUNGSREGEL, hier besonders wichtig:
 * Ein Treffer heisst "dazu ist ein Hinweis hinterlegt", niemals "das ist
 * fuer dich gefaehrlich". Die App kennt weder Praeparat noch Dosis noch
 * Befund und darf deshalb nichts ueber die konkrete Situation behaupten.
 */

export default {
  'profile.kicker': 'Persönliches Profil',
  'profile.title': 'Was in deinem Fall zusätzlich gilt',
  'profile.subtitle':
    'Die App gleicht deinen Bestand mit den hinterlegten Quellen ab. Sie bewertet dabei nicht deine Situation, sondern zeigt, wo in den Quellen etwas zu einer Medikamentengruppe steht.',

  'profile.privacy.title': 'Bleibt auf deinem Gerät',
  'profile.privacy.text':
    'Diese Angaben werden nirgends hochgeladen und mit niemandem geteilt. Sie liegen wie alle anderen Daten der App nur lokal.',

  'profile.medications.title': 'Medikamente',
  'profile.medications.hint':
    'Wähle die Gruppen, aus denen du etwas einnimmst. Präparatenamen brauchst du nicht anzugeben, denn die hinterlegten Hinweise beziehen sich ohnehin auf Gruppen.',
  'profile.medications.none': 'Keine Angabe',

  'profile.findings.title': 'Hinweise aus den Quellen',
  'profile.findings.empty':
    'Zu deinem aktuellen Bestand ist zu den gewählten Medikamentengruppen kein Hinweis hinterlegt.',
  'profile.findings.emptyNoSelection':
    'Sobald du oben eine Medikamentengruppe auswählst, erscheinen hier die dazu hinterlegten Hinweise.',
  'profile.findings.emptyNoStack':
    'Dein Bestand ist noch leer. Sobald du Produkte erfasst hast, wird hier abgeglichen.',
  'profile.findings.count_one': '{count} Hinweis gefunden',
  'profile.findings.count_other': '{count} Hinweise gefunden',
  'profile.findings.inProducts': 'In deinem Bestand: {products}',
  'profile.findings.quoteLabel': 'Aus der hinterlegten Quelle:',
  'profile.findings.sources': 'Quellen',

  'profile.findings.disclaimer':
    'Diese Hinweise stammen wörtlich aus den hinterlegten Fachquellen zum jeweiligen Wirkstoff. Ob sie in deinem Fall zutreffen, hängt von Präparat, Dosierung und Befund ab. Das kann die App nicht beurteilen. Besprich offene Fragen mit Ärztin, Arzt oder Apotheke.',

  'profile.severity.contraindicated': 'Quelle nennt es kontraindiziert',
  'profile.severity.medical': 'Quelle verweist auf ärztliche Abklärung',
  'profile.severity.attention': 'Quelle beschreibt eine mögliche Beeinflussung',

  'profile.reset': 'Angaben zurücksetzen',
  'profile.resetConfirm.title': 'Profil zurücksetzen?',
  'profile.resetConfirm.message': 'Alle Angaben zu Medikamenten werden gelöscht.',
  'profile.resetConfirm.confirm': 'Zurücksetzen',
};
