/**
 * i18n/de/analysis.js
 * Analyse-Bereich (app/analysis.jsx): Tagessummen, Kosten, ungeprueftes.
 *
 * FORMULIERUNGSREGEL:
 * "Kein dokumentierter Nutzen" heisst NICHT "wirkungslos", sondern "nie
 * ueberprueft". Aus einer Beobachtungsluecke darf kein Urteil ueber das
 * Produkt werden.
 */

export default {
  'analysis.kicker': 'Analyse',
  'analysis.title': 'Dein Bestand im Überblick',
  'analysis.subtitle':
    'Tagessummen über alle Produkte, laufende Kosten und die Frage, was davon je überprüft wurde.',

  // Tagessummen
  'analysis.totals.title': 'Tagessumme je Wirkstoff',
  'analysis.totals.subtitle':
    'Obergrenzen gelten für die Gesamtmenge pro Tag, nicht für die einzelne Dose.',
  'analysis.totals.empty': 'Noch keine aktiven Produkte im Bestand.',
  'analysis.totals.fromProducts_one': 'aus {count} Produkt',
  'analysis.totals.fromProducts_other': 'aus {count} Produkten',
  'analysis.totals.converted': 'enthält umgerechnete Verbindungsmengen',
  'analysis.totals.unresolved_one': '{count} Position konnte nicht verrechnet werden',
  'analysis.totals.unresolved_other': '{count} Positionen konnten nicht verrechnet werden',
  'analysis.totals.allClear':
    'Keine Tagessumme überschreitet eine hinterlegte Obergrenze.',

  // Kosten
  'analysis.cost.title': 'Laufende Kosten',
  'analysis.cost.perMonth': '{amount} {currency} pro Monat',
  'analysis.cost.perDay': '{amount} {currency} pro Tag',
  'analysis.cost.empty':
    'Für keines deiner Produkte ist ein Preis hinterlegt. Trage Kaufpreis und Packungsgröße ein, dann wird hier gerechnet.',
  'analysis.cost.estimated_one':
    '{count} Posten ist auf Basis des geplanten Verbrauchs hochgerechnet, weil noch keine Einnahmen dokumentiert sind.',
  'analysis.cost.estimated_other':
    '{count} Posten sind auf Basis des geplanten Verbrauchs hochgerechnet, weil noch keine Einnahmen dokumentiert sind.',
  'analysis.cost.withoutPrice_one': 'Für {count} Produkt fehlt der Preis: {names}',
  'analysis.cost.withoutPrice_other': 'Für {count} Produkte fehlt der Preis: {names}',
  'analysis.cost.isEstimate': 'hochgerechnet',

  // Preis erfassen
  'analysis.price.title': 'Preis hinterlegen',
  'analysis.price.purchasePrice': 'Kaufpreis',
  'analysis.price.packageUnits': 'Kapseln/Portionen je Packung',
  'analysis.price.save': 'Speichern',

  // Nie überprüft
  'analysis.unreviewed.title': 'Nie überprüft',
  'analysis.unreviewed.text_one':
    '{count} Produkt für {amount} {currency} im Monat läuft mit, ohne dass du je festgehalten hättest, ob es dir etwas bringt: {names}',
  'analysis.unreviewed.text_other':
    '{count} Produkte für zusammen {amount} {currency} im Monat laufen mit, ohne dass du je festgehalten hättest, ob sie dir etwas bringen: {names}',
  'analysis.unreviewed.hint':
    'Das ist kein Urteil über die Produkte: es heißt nur, dass es dazu keine Beobachtung gibt. Über die Wirkungskontrolle kannst du das nachholen.',
  'analysis.unreviewed.allReviewed': 'Zu allen bezifferten Produkten gibt es eine Beobachtung.',
  'analysis.unreviewed.goToOutcome': 'Zur Wirkungskontrolle',

  // Gleiches Ziel
  'analysis.sharedGoals.title': 'Mehrere Produkte, dasselbe Ziel',
  'analysis.sharedGoals.entry': '{metric}: {names}',
  'analysis.sharedGoals.hint':
    'Das muss kein Fehler sein. Es lohnt sich aber zu prüfen, ob wirklich alle davon nötig sind.',

  'analysis.status.reviewedContinue': 'überprüft, weitergenommen',
  'analysis.status.reviewedStop': 'überprüft, abgesetzt',
  'analysis.status.reviewedUnclear': 'überprüft, unklar',
  'analysis.status.running': 'wird beobachtet',
  'analysis.status.neverReviewed': 'nie überprüft',
};
