/**
 * i18n/en/account.js
 * Account: sign in, sign up, recovery key, password reset, deletion.
 */

export default {
  'account.kicker': 'Account',
  'account.title.anonymous': 'Works without an account',
  'account.intro':
    'This app works fully without an account. You only need one if you want to use your data on several devices later or back it up automatically. Health data then leaves your device encrypted only: the key is derived from your password and is never transmitted.',

  'account.mode.signIn': 'Sign in',
  'account.mode.signUp': 'Create account',

  'account.field.email': 'Email address',
  'account.field.password': 'Password',
  'account.field.passwordRepeat': 'Repeat password',
  'account.hint.password':
    'At least 10 characters. The password protects your data, not just the login.',

  'account.action.signIn': 'Sign in',
  'account.action.continue': 'Continue',
  'account.action.forgot': 'Forgot password?',
  'account.action.signOut': 'Sign out',

  'account.busy.deriving': 'Generating key. This takes a moment.',

  'account.error.title': 'That did not work',
  'account.error.emailInvalid': 'Please enter a valid email address.',
  'account.error.passwordShort': 'The password needs at least 10 characters.',
  'account.error.passwordMismatch': 'The passwords do not match.',
  'account.error.offline': 'No connection. Check your network and try again.',
  'account.error.credentials': 'Sign in not possible. Check email address and password.',
  'account.error.generic': 'Unexpected error: {message}',

  'account.confirmMail.title': 'Confirm your email address',
  'account.confirmMail.text':
    'We sent a link to {email}. Open it on this device to activate your account.',

  'account.signedIn.title': 'Signed in',
  'account.signedIn.as': 'Signed in as {email}',
  'account.signedIn.keyReady': 'Data key is unlocked for this session.',
  'account.signedIn.keyLocked':
    'The data key is not stored on this device. Sign out and back in once, then cloud backup is available.',
  'account.signedIn.recoveryNote':
    'Your recovery key was shown once when the account was created. Without password and without recovery key, synced data cannot be restored. Data on this device is not affected.',

  'account.cloud.title': 'Cloud backup',
  'account.cloud.intro': 'Your data is stored end-to-end encrypted on our server. Neither we nor the provider can read it. Without your password or recovery key it cannot be restored.',
  'account.cloud.lastUpload': 'Last backup {time} from {device}',
  'account.cloud.none': 'No backup on the server yet.',
  'account.cloud.uploading': 'Backing up.',
  'account.cloud.restoring': 'Restoring.',
  'account.cloud.offline': 'Offline. Will catch up next time the app opens.',
  'account.cloud.error': 'Backup failed. It will be retried next time the app opens.',
  'account.cloud.wrongKey': 'The backup on the server was encrypted with an earlier key and cannot be read. It will be replaced with the next backup.',
  'account.cloud.auto': 'Back up automatically',
  'account.cloud.autoSub': 'After every change, batched, only with internet.',
  'account.cloud.now': 'Back up now',
  'account.cloud.device': 'Device name',
  'account.cloud.deviceSub': 'Shown on other devices as the origin of the backup.',
  'account.cloud.delete': 'Delete backup on the server',
  'account.cloud.deleteConfirmTitle': 'Delete backup?',
  'account.cloud.deleteConfirmText': 'The encrypted backup is removed from the server. Your data on this device stays. Automatic backup is switched off.',
  'account.cloud.deleteConfirm': 'Delete',
  'account.cloud.keyMissing': 'Cloud backup is not available on this device because the data key is missing. Sign out and back in once.',
  'account.cloud.decisionTitle': 'Newer backup on the server',
  'account.cloud.decisionText': 'Your account holds a backup from {time} from {device} ({supplements} supplements, {labValues} lab values). Use that backup or upload the data on this device?',
  'account.cloud.decisionRestore': 'Use server backup',
  'account.cloud.decisionUpload': 'Upload this device',

  'account.delete.title': 'Delete account',
  'account.delete.text':
    'Deletes your account and the encrypted key on our side. Your data on this device stays. To delete that too: Settings, Delete all data.',
  'account.delete.confirmTitle': 'Really delete the account?',
  'account.delete.confirmText': 'This cannot be undone. Local data stays.',
  'account.delete.confirm': 'Delete',
  'account.delete.cancel': 'Cancel',
  'account.delete.done': 'Account deleted',

  'account.recovery.kicker': 'Recovery key',
  'account.recovery.title': 'Save it once, it will never be shown again',
  'account.recovery.text':
    'This key unlocks your synced data if you forget your password. It is shown only now and stored nowhere else, not even with us. Without password and without this key, synced data is gone.',
  'account.recovery.copy': 'Copy',
  'account.recovery.copied': 'Copied to clipboard',
  'account.recovery.checkbox': 'I have saved the recovery key in a safe place.',
  'account.recovery.confirm': 'Create account',
  'account.recovery.cancel': 'Cancel',
  'account.recovery.newTitle': 'Your new recovery key',
  'account.recovery.newText':
    'Because the old recovery key was not available, a new key was generated. Previously synced data can no longer be read. Save this key now.',
  'account.recovery.done': 'Done',

  'account.forgot.title': 'Reset password',
  'account.forgot.text':
    'We will send you a link. To keep your synced data readable you will need your recovery key afterwards.',
  'account.forgot.action': 'Send link',
  'account.forgot.sent': 'If an account exists for {email}, a link is on its way.',

  'account.reset.title': 'Set a new password',
  'account.reset.text':
    'With your recovery key, synced data stays readable. Without it we set a new key and previously synced data can no longer be read.',
  'account.reset.field.recoveryKey': 'Recovery key (optional)',
  'account.reset.recoveryPlaceholder': 'ABCD-EFGH-…',
  'account.reset.action': 'Set password',
  'account.reset.withoutKeyTitle': 'Continue without recovery key?',
  'account.reset.withoutKeyText':
    'Previously synced data will no longer be readable. Data on this device stays.',
  'account.reset.withoutKeyConfirm': 'Continue',
  'account.reset.wrongKey': 'The recovery key does not match. Check the input.',
  'account.reset.done': 'Password set',

  'account.callback.title': 'Checking link',
  'account.callback.errorTitle': 'Link invalid or expired',

  'account.settings.title': 'Account settings',
  'account.settings.email': 'Change email address',
  'account.settings.emailText': 'You will receive a confirmation link at both the old and the new address. The change applies once both are confirmed.',
  'account.settings.emailPending': 'Change to {email} is waiting for confirmation.',
  'account.settings.emailField': 'New email address',
  'account.settings.emailAction': 'Send confirmation links',
  'account.settings.emailSent': 'Links are on their way to both addresses.',
  'account.settings.emailChanged': 'Email address changed.',
  'account.settings.password': 'Change password',
  'account.settings.passwordText': 'Your recovery key stays valid. The data key is re-encrypted with the new password.',
  'account.settings.currentPassword': 'Current password',
  'account.settings.newPassword': 'New password',
  'account.settings.passwordAction': 'Change password',
  'account.settings.passwordDone': 'Password changed',
  'account.error.currentPassword': 'The current password does not match.',
  'account.error.keyRecordSaveFailed':
    'The password was changed for sign in, but the data key could not be saved again. Sign in with the new password. If the data key does not unlock, use the recovery key via Forgot password.',
};
