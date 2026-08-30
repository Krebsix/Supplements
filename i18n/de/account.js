/**
 * i18n/de/account.js
 * Konto: Anmelden, Registrieren, Recovery-Key, Passwort-Reset, Loeschen
 * (app/(tabs)/(more)/account*.jsx, app/auth/callback.jsx).
 */

export default {
  'account.kicker': 'Konto',
  'account.title.anonymous': 'Ohne Konto nutzbar',
  'account.intro':
    'Diese App funktioniert vollständig ohne Konto. Ein Konto brauchst du nur, wenn du deine Daten später auf mehreren Geräten nutzen oder automatisch sichern willst. Gesundheitsdaten verlassen dein Gerät dann ausschließlich verschlüsselt: Der Schlüssel entsteht aus deinem Passwort und wird nie übertragen.',

  'account.mode.signIn': 'Anmelden',
  'account.mode.signUp': 'Konto anlegen',

  'account.field.email': 'E-Mail-Adresse',
  'account.field.password': 'Passwort',
  'account.field.passwordRepeat': 'Passwort wiederholen',
  'account.hint.password':
    'Mindestens 10 Zeichen. Das Passwort schützt nicht nur den Login, sondern auch deine Daten.',

  'account.action.signIn': 'Anmelden',
  'account.action.continue': 'Weiter',
  'account.action.forgot': 'Passwort vergessen?',
  'account.action.signOut': 'Abmelden',

  'account.busy.deriving': 'Schlüssel wird erzeugt. Das dauert einen Moment.',

  'account.error.title': 'Das hat nicht geklappt',
  'account.error.emailInvalid': 'Bitte eine gültige E-Mail-Adresse eingeben.',
  'account.error.passwordShort': 'Das Passwort braucht mindestens 10 Zeichen.',
  'account.error.passwordMismatch': 'Die Passwörter stimmen nicht überein.',
  'account.error.offline': 'Keine Verbindung. Prüfe dein Netz und versuche es erneut.',
  'account.error.credentials': 'Anmeldung nicht möglich. Prüfe E-Mail-Adresse und Passwort.',
  'account.error.generic': 'Unerwarteter Fehler: {message}',

  'account.confirmMail.title': 'Bestätige deine E-Mail-Adresse',
  'account.confirmMail.text':
    'Wir haben einen Link an {email} geschickt. Öffne ihn auf diesem Gerät, dann ist dein Konto aktiv.',

  'account.signedIn.title': 'Angemeldet',
  'account.signedIn.as': 'Angemeldet als {email}',
  'account.signedIn.keyReady': 'Datenschlüssel ist für diese Sitzung entsperrt.',
  'account.signedIn.keyLocked':
    'Datenschlüssel ist auf diesem Gerät nicht hinterlegt. Melde dich einmal ab und wieder an, dann ist das Cloud-Backup verfügbar.',
  'account.signedIn.recoveryNote':
    'Dein Recovery-Key wurde beim Anlegen einmalig angezeigt. Ohne Passwort und ohne Recovery-Key sind synchronisierte Daten nicht wiederherstellbar. Daten auf diesem Gerät sind davon nicht betroffen.',

  'account.cloud.title': 'Cloud-Backup',
  'account.cloud.intro': 'Dein Stand liegt Ende-zu-Ende verschlüsselt auf unserem Server. Weder wir noch der Anbieter können ihn lesen. Ohne dein Passwort oder deinen Recovery-Key ist er nicht wiederherstellbar.',
  'account.cloud.lastUpload': 'Letzter Stand {time} von {device}',
  'account.cloud.none': 'Noch kein Stand auf dem Server.',
  'account.cloud.uploading': 'Wird gesichert.',
  'account.cloud.restoring': 'Wird wiederhergestellt.',
  'account.cloud.offline': 'Offline. Wird beim nächsten Öffnen nachgeholt.',
  'account.cloud.error': 'Sichern fehlgeschlagen. Beim nächsten Öffnen wird es erneut versucht.',
  'account.cloud.wrongKey': 'Der Stand auf dem Server wurde mit einem früheren Schlüssel verschlüsselt und kann nicht gelesen werden. Beim nächsten Sichern wird er ersetzt.',
  'account.cloud.auto': 'Automatisch sichern',
  'account.cloud.autoSub': 'Nach jeder Änderung, gebündelt, nur mit Internet.',
  'account.cloud.now': 'Jetzt sichern',
  'account.cloud.device': 'Gerätename',
  'account.cloud.deviceSub': 'Erscheint auf anderen Geräten als Herkunft des Standes.',
  'account.cloud.delete': 'Stand auf dem Server löschen',
  'account.cloud.deleteConfirmTitle': 'Stand löschen?',
  'account.cloud.deleteConfirmText': 'Der verschlüsselte Stand wird vom Server entfernt. Deine Daten auf diesem Gerät bleiben. Automatisches Sichern wird ausgeschaltet.',
  'account.cloud.deleteConfirm': 'Löschen',
  'account.cloud.keyMissing': 'Cloud-Backup ist auf diesem Gerät nicht verfügbar, weil der Datenschlüssel fehlt. Einmal ab- und wieder anmelden.',
  'account.cloud.decisionTitle': 'Neuerer Stand auf dem Server',
  'account.cloud.decisionText': 'Auf deinem Konto liegt ein Stand vom {time} von {device} ({supplements} Präparate, {labValues} Laborwerte). Diesen Stand übernehmen oder den Stand dieses Geräts hochladen?',
  'account.cloud.decisionRestore': 'Server-Stand übernehmen',
  'account.cloud.decisionUpload': 'Diesen Stand hochladen',

  'account.delete.title': 'Konto löschen',
  'account.delete.text':
    'Löscht dein Konto und den verschlüsselten Schlüssel bei uns. Deine Daten auf diesem Gerät bleiben erhalten. Willst du auch die löschen: Einstellungen, Alle Daten löschen.',
  'account.delete.confirmTitle': 'Konto wirklich löschen?',
  'account.delete.confirmText': 'Das lässt sich nicht rückgängig machen. Lokale Daten bleiben.',
  'account.delete.confirm': 'Löschen',
  'account.delete.cancel': 'Abbrechen',
  'account.delete.done': 'Konto gelöscht',

  'account.recovery.kicker': 'Recovery-Key',
  'account.recovery.title': 'Einmal sichern, dann nie wieder sichtbar',
  'account.recovery.text':
    'Dieser Key entsperrt deine synchronisierten Daten, falls du dein Passwort vergisst. Er wird nur jetzt angezeigt und liegt nirgends sonst, auch nicht bei uns. Ohne Passwort und ohne diesen Key sind synchronisierte Daten weg.',
  'account.recovery.copy': 'Kopieren',
  'account.recovery.copied': 'In die Zwischenablage kopiert',
  'account.recovery.checkbox': 'Ich habe den Recovery-Key an einem sicheren Ort gespeichert.',
  'account.recovery.confirm': 'Konto anlegen',
  'account.recovery.cancel': 'Abbrechen',
  'account.recovery.newTitle': 'Dein neuer Recovery-Key',
  'account.recovery.newText':
    'Weil der alte Recovery-Key nicht vorlag, wurde ein neuer Schlüssel erzeugt. Bisher synchronisierte Daten sind damit nicht mehr lesbar. Sichere diesen Key jetzt.',
  'account.recovery.done': 'Fertig',

  'account.forgot.title': 'Passwort zurücksetzen',
  'account.forgot.text':
    'Wir schicken dir einen Link. Damit deine synchronisierten Daten lesbar bleiben, brauchst du danach deinen Recovery-Key.',
  'account.forgot.action': 'Link senden',
  'account.forgot.sent': 'Wenn zu {email} ein Konto existiert, ist ein Link unterwegs.',

  'account.reset.title': 'Neues Passwort setzen',
  'account.reset.text':
    'Mit deinem Recovery-Key bleiben synchronisierte Daten lesbar. Ohne ihn setzen wir einen neuen Schlüssel, und bisher synchronisierte Daten sind nicht mehr lesbar.',
  'account.reset.field.recoveryKey': 'Recovery-Key (optional)',
  'account.reset.recoveryPlaceholder': 'ABCD-EFGH-…',
  'account.reset.action': 'Passwort setzen',
  'account.reset.withoutKeyTitle': 'Ohne Recovery-Key fortfahren?',
  'account.reset.withoutKeyText':
    'Bisher synchronisierte Daten sind danach nicht mehr lesbar. Daten auf diesem Gerät bleiben.',
  'account.reset.withoutKeyConfirm': 'Fortfahren',
  'account.reset.wrongKey': 'Der Recovery-Key passt nicht. Prüfe die Eingabe.',
  'account.reset.done': 'Passwort gesetzt',

  'account.callback.title': 'Link wird geprüft',
  'account.callback.errorTitle': 'Link ungültig oder abgelaufen',

  'account.settings.title': 'Konto-Einstellungen',
  'account.settings.email': 'E-Mail-Adresse ändern',
  'account.settings.emailText': 'Du bekommst je einen Bestätigungslink an die alte und die neue Adresse. Die Änderung gilt, sobald beide bestätigt sind.',
  'account.settings.emailPending': 'Wechsel zu {email} wartet auf Bestätigung.',
  'account.settings.emailField': 'Neue E-Mail-Adresse',
  'account.settings.emailAction': 'Bestätigungslinks senden',
  'account.settings.emailSent': 'Links sind unterwegs an beide Adressen.',
  'account.settings.emailChanged': 'E-Mail-Adresse geändert.',
  'account.settings.password': 'Passwort ändern',
  'account.settings.passwordText': 'Dein Recovery-Key bleibt gültig. Der Datenschlüssel wird mit dem neuen Passwort neu verschlüsselt.',
  'account.settings.currentPassword': 'Aktuelles Passwort',
  'account.settings.newPassword': 'Neues Passwort',
  'account.settings.passwordAction': 'Passwort ändern',
  'account.settings.passwordDone': 'Passwort geändert',
  'account.error.currentPassword': 'Das aktuelle Passwort passt nicht.',
  'account.error.keyRecordSaveFailed':
    'Das Passwort wurde bei der Anmeldung geändert, aber der Datenschlüssel konnte nicht neu gespeichert werden. Melde dich mit dem neuen Passwort an. Entsperrt der Datenschlüssel dann nicht, nutze den Recovery-Key über Passwort vergessen.',
};
