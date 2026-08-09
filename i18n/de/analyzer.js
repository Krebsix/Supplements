/**
 * i18n/de/analyzer.js
 * Meldungen der Scan-Analyse (ScanAnalyzer.js).
 *
 * Nur die Texte, die die App selbst formuliert. Fehlermeldungen, die von
 * der Edge Function kommen, werden unveraendert durchgereicht — sie
 * entstehen serverseitig und tragen dort ihre eigene Sprache.
 */

export default {
  'analyzer.notConfigured': 'Die Scan-Analyse ist nicht konfiguriert (scanConfig.js).',
  'analyzer.noCaptures': 'Keine Aufnahmen vorhanden.',
  'analyzer.prepareFailed': 'Aufnahme "{step}" konnte nicht aufbereitet werden.',
  'analyzer.timeout': 'Die Analyse hat zu lange gedauert. Bitte erneut versuchen.',
  'analyzer.unreachable': 'Die Analyse ist nicht erreichbar. Internetverbindung pruefen.',
  'analyzer.failedWithStatus': 'Die Analyse ist fehlgeschlagen (Status {status}).',
  'analyzer.noResult': 'Die Analyse hat kein verwertbares Ergebnis geliefert.',

  'analyzer.manufacturerNote': 'Herstellerangabe: {text}',
  'analyzer.uncertain': 'Unsicher erkannt: {text}',
  'analyzer.uncertaintyNote':
    'KI-Auswertung der Etikettenfotos. Alle Angaben stammen vom Produktetikett und müssen vor der Übernahme kontrolliert werden. Keine gesundheitliche Beratung.',
};
