/**
 * i18n/de/purchase.js
 * Abo und Kaeufe: Paywall, Abo-Status, Scan-Pakete (app/paywall.jsx,
 * app/(tabs)/(more)/subscription.jsx).
 *
 * 'nav.subscription' und 'home.nav.subscription.*' stehen bewusst hier statt
 * in common.js/home.js, damit diese Datei die vollstaendige Textquelle fuer
 * die Kaufschicht bleibt. Die Index-Reihenfolge sorgt dafuer, dass sie
 * trotzdem geladen werden.
 */

export default {
  'nav.subscription': 'Abo',
  'home.nav.subscription.title': 'Abo und Käufe',
  'home.nav.subscription.subtitle': 'Status, Abo verwalten, Käufe wiederherstellen.',

  'paywall.kicker': 'MySuplea Pro',
  'paywall.title': 'Alles ohne Limit, nichts verkauft',
  'paywall.intro': 'Pro finanziert die KI-Auswertung deiner Scans und die Pflege der Wirkstoff-Datenbank. Keine Werbung, kein Affiliate, keine Markenkooperation.',
  'paywall.feature.scans': 'Unbegrenzte KI-Foto-Scans (Fair Use)',
  'paywall.feature.inventory': 'Unbegrenzter Bestand',
  'paywall.feature.outcome': 'Wirkungskontrolle',
  'paywall.feature.cost': 'Kostenanalyse',
  'paywall.feature.lab': 'Laborwerte-Verlauf',
  'paywall.feature.cycles': 'Kur-Zyklen',
  'paywall.yearly': 'Jahresabo',
  'paywall.monthly': 'Monatsabo',
  'paywall.trial': '7 Tage kostenlos testen, danach {price}',
  'paywall.perYear': '{price} pro Jahr',
  'paywall.perMonth': '{price} pro Monat',
  'paywall.credits.title': 'Lieber einzeln? Scan-Pakete',
  'paywall.credits.item': '{count} KI-Scans für {price}',
  'paywall.buy': 'Auswählen',
  'paywall.legal': 'Das Abo verlängert sich automatisch, bis du es kündigst. Die Belastung erfolgt über dein Apple- oder Google-Konto. Kündigen kannst du jederzeit in den Abo-Einstellungen deines Store-Kontos, mindestens 24 Stunden vor Ablauf der laufenden Periode.',
  'paywall.restore': 'Käufe wiederherstellen',
  'paywall.unavailable': 'Käufe sind in dieser Testversion nicht verfügbar. In der App aus dem Store funktioniert es.',
  'paywall.loading': 'Preise werden geladen',
  'paywall.loadError': 'Preise gerade nicht abrufbar.',
  'paywall.retry': 'Neu laden',
  'paywall.error.title': 'Kauf nicht abgeschlossen',
  'paywall.success.title': 'Willkommen bei Pro',
  'paywall.success.credits': '{count} Scans wurden deinem Guthaben gutgeschrieben.',

  'subscription.kicker': 'Abo und Käufe',
  'subscription.title': 'Dein Status',
  'subscription.status.free': 'Free',
  'subscription.status.trial': 'Testphase bis {date}',
  'subscription.status.active': 'Pro, verlängert sich am {date}',
  'subscription.status.cancelled': 'Pro, gekündigt, läuft bis {date}',
  'subscription.status.grace': 'Zahlungsproblem, bitte im Store prüfen. Pro bleibt bis {date}.',
  'subscription.status.expired': 'Pro abgelaufen am {date}',
  'subscription.status.pending': 'Kauf wird geprüft',
  'subscription.platform.ios': 'über den App Store',
  'subscription.platform.android': 'über Google Play',
  'subscription.quota.title': 'Scan-Guthaben',
  'subscription.quota.free': 'Freie KI-Scans übrig',
  'subscription.quota.fairUse': 'Fair Use übrig (Monat)',
  'subscription.quota.credits': 'Gekaufte Scans',
  'subscription.manage': 'Abo verwalten',
  'subscription.manageText': 'Kündigen, Tarif wechseln und Zahlungsmittel ändern geht im Abo-Bereich deines Store-Kontos. Nach einer Kündigung zeigt die App hier "gekündigt, läuft bis".',
  'subscription.restore': 'Käufe wiederherstellen',
  'subscription.restoreText': 'Holt ein bestehendes Abo auf dieses Gerät. Scan-Pakete sind Verbrauchsgüter und lassen sich nicht wiederherstellen.',
  'subscription.restore.none': 'Kein Abo zu diesem Store-Konto gefunden.',
  'subscription.restore.done': 'Abo wiederhergestellt.',
  'subscription.refund': 'Rückerstattung beantragen',
  'subscription.refundText': 'Über Rückerstattungen entscheiden Apple und Google, nicht wir. Der Antrag läuft über den Store.',
  'subscription.buy': 'Pro ansehen',
  'subscription.unavailable': 'Käufe sind in dieser Testversion nicht verfügbar.',
  'subscription.openFailed': 'Der Link konnte nicht geöffnet werden.',

  'proGate.action': 'Pro ansehen',
  'scanner.limit.action': 'Pro ansehen',
  'addSupplement.alert.limitAction': 'Pro ansehen',
};
