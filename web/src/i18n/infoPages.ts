/**
 * Inhalte fuer Support und Konto-Loeschung. Eigenstaendig vom Haupt-
 * Woerterbuch (types.ts/de.ts/en.ts), weil diese Seiten nicht Teil der
 * Marketing-Landingpage sind, sondern reine Store-Pflicht-Seiten (Apple
 * Guideline 5.1.1(v), Google Play Data Safety: Account-Loeschung muss
 * auch ohne App beschreibbar/anstossbar sein).
 *
 * Menue-Pfade und Knopf-Beschriftungen sind woertlich aus der App
 * uebernommen (i18n/de/home.js, i18n/de/account.js, i18n/de/settings.js
 * im Repo-Root), nicht erfunden: home.nav.account.title = "Konto",
 * home.nav.settings.title = "Einstellungen", tabs.more = "Mehr",
 * account.delete.title = "Konto löschen", settings.deleteAllButton =
 * "Alle Daten löschen".
 */

export interface InfoPageContent {
  readonly meta: { readonly title: string; readonly description: string };
  readonly eyebrow: string;
  readonly title: string;
  readonly intro: string;
  readonly backLink: string;
}

export interface SupportContent extends InfoPageContent {
  readonly emailLabel: string;
  readonly emailNote: string;
  readonly faqLabel: string;
  readonly faqLinkText: string;
  readonly privacyLabel: string;
  readonly privacyLinkText: string;
}

export interface DeletionContent extends InfoPageContent {
  readonly withoutAccount: {
    readonly title: string;
    readonly body: string;
    readonly steps: readonly string[];
    readonly effect: string;
  };
  readonly withAccount: {
    readonly title: string;
    readonly body: string;
    readonly steps: readonly string[];
    readonly effect: string;
  };
  readonly noAppAccess: {
    readonly title: string;
    readonly body: string;
  };
}

export const support: Record<'de' | 'en', SupportContent> = {
  de: {
    meta: {
      title: 'Support · MySuplea',
      description: 'Fragen oder Probleme mit MySuplea? So erreichst du uns.',
    },
    eyebrow: 'Kontakt',
    title: 'Support',
    intro:
      'Fragen zur App, ein Fehler, eine Idee für ein Feature: Schreib uns direkt. Wir sind ein kleines Team und antworten persönlich, ohne Ticket-System.',
    backLink: 'Zurück zur Startseite',
    emailLabel: 'E-Mail',
    emailNote: 'Antwort in der Regel innerhalb weniger Werktage.',
    faqLabel: 'Häufige Fragen',
    faqLinkText: 'Fragen auf der Startseite ansehen',
    privacyLabel: 'Datenschutz',
    privacyLinkText: 'Datenschutzerklärung lesen',
  },
  en: {
    meta: {
      title: 'Support · MySuplea',
      description: 'Questions or issues with MySuplea? Here is how to reach us.',
    },
    eyebrow: 'Contact',
    title: 'Support',
    intro:
      'Questions about the app, a bug, an idea for a feature: write to us directly. We are a small team and reply personally, no ticket system.',
    backLink: 'Back to the homepage',
    emailLabel: 'Email',
    emailNote: 'We usually reply within a few business days.',
    faqLabel: 'Frequently asked questions',
    faqLinkText: 'See the questions on the homepage',
    privacyLabel: 'Privacy',
    privacyLinkText: 'Read the privacy policy',
  },
};

export const deletion: Record<'de' | 'en', DeletionContent> = {
  de: {
    meta: {
      title: 'Konto und Daten löschen · MySuplea',
      description: 'So löschst du deine lokalen Daten und dein optionales MySuplea-Konto.',
    },
    eyebrow: 'Deine Daten',
    title: 'Konto und Daten löschen',
    intro:
      'MySuplea speichert deine Präparate, Einnahmen und Laborwerte lokal auf deinem Gerät. Ein Konto ist freiwillig und betrifft nur E-Mail-Adresse und Schlüssel-Umschlag. Beides löschst du getrennt voneinander.',
    backLink: 'Zurück zur Startseite',
    withoutAccount: {
      title: 'Lokale Daten löschen',
      body: 'Gilt für alle, mit oder ohne Konto: Präparate, Einnahme-Verlauf, Profil, Laborwerte und Beobachtungen liegen ausschließlich auf deinem Gerät. Wir können sie nicht aus der Ferne löschen, weil wir sie nie erhalten.',
      steps: [
        'App öffnen → Tab „Mehr" → „Einstellungen"',
        'Zu „Alle Daten" scrollen, „Alle Daten löschen" antippen',
        'Zweimal bestätigen ("Weiter", dann "Endgültig löschen")',
      ],
      effect: 'Danach sind alle lokalen Daten unwiederbringlich gelöscht. Ein bestehendes Konto bleibt davon unberührt.',
    },
    withAccount: {
      title: 'Konto löschen',
      body: 'Falls du ein Konto angelegt hast: Es enthält nur deine E-Mail-Adresse, einen Passwort-Hash und einen verschlüsselten Schlüssel-Datensatz. Keine Präparate, keine Laborwerte.',
      steps: [
        'App öffnen → Tab „Mehr" → „Konto"',
        '„Konto löschen" antippen',
        'Mit "Löschen" bestätigen',
      ],
      effect: 'Konto, E-Mail-Adresse und Schlüssel-Datensatz werden serverseitig entfernt. Lokale Daten auf dem Gerät bleiben, dafür oben "Lokale Daten löschen" zusätzlich nutzen.',
    },
    noAppAccess: {
      title: 'Kein Zugriff mehr auf die App?',
      body: 'Schreib uns von der registrierten E-Mail-Adresse aus eine Mail mit der Bitte um Konto-Löschung. Wir entfernen dein Konto dann manuell und bestätigen es dir per Mail.',
    },
  },
  en: {
    meta: {
      title: 'Delete account and data · MySuplea',
      description: 'How to delete your local data and your optional MySuplea account.',
    },
    eyebrow: 'Your data',
    title: 'Delete account and data',
    intro:
      'MySuplea stores your products, intake history and lab values locally on your device. An account is optional and only involves an email address and a key envelope. You delete the two separately.',
    backLink: 'Back to the homepage',
    withoutAccount: {
      title: 'Delete local data',
      body: 'Applies to everyone, with or without an account: products, intake history, profile, lab values and observations live only on your device. We cannot delete them remotely because we never receive them.',
      steps: [
        'Open the app → "More" tab → "Settings"',
        'Scroll to "All data", tap "Delete all data"',
        'Confirm twice ("Continue", then "Delete permanently")',
      ],
      effect: 'After that, all local data is deleted beyond recovery. An existing account is not affected.',
    },
    withAccount: {
      title: 'Delete account',
      body: 'If you created an account: it only holds your email address, a password hash and an encrypted key record. No products, no lab values.',
      steps: [
        'Open the app → "More" tab → "Account"',
        'Tap "Delete account"',
        'Confirm with "Delete"',
      ],
      effect: 'The account, email address and key record are removed on the server. Local data on the device stays; use "Delete local data" above as well for that.',
    },
    noAppAccess: {
      title: 'No access to the app anymore?',
      body: 'Email us from your registered email address and ask us to delete your account. We will remove it manually and confirm it by email.',
    },
  },
};
