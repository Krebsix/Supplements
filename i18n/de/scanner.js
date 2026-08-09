/**
 * i18n/de/scanner.js
 * Kamera-Erfassung (app/scanner.jsx).
 */

export default {
  'scanner.kicker': 'Geführter Produktscan',
  'scanner.title': 'Vier Fotos. Ein klares Ergebnis.',
  'scanner.subtitle':
    'Die App führt dich Schritt für Schritt durch alle relevanten Produktseiten. So können Angaben später vollständig und nachvollziehbar geprüft werden.',

  'scanner.progress.label': 'Scan-Fortschritt',
  'scanner.progress.count': '{completed} von {total} Aufnahmen',
  'scanner.progress.complete': 'Vollständig',
  'scanner.progress.remaining': '{count} offen',

  'scanner.barcode.detected': 'Barcode erkannt',
  'scanner.barcode.text':
    'Der Code kann direkt in der offenen Produktdatenbank nachgeschlagen werden. Die vier Fotos bleiben der genauere Weg, weil sie Dosierung und Wirkstoffformen vom Etikett erfassen.',
  'scanner.barcode.searching': 'Produkt wird gesucht…',
  'scanner.barcode.search': 'Produkt per Barcode suchen',
  'scanner.barcode.discard': 'Barcode verwerfen',

  'scanner.capture.eyebrow': 'Aufnahme {current} von {total}',
  'scanner.capture.statusSaved': 'Gespeichert',
  'scanner.capture.statusOpen': 'Offen',

  'scanner.camera.checkingPermission': 'Kamerazugriff wird geprüft',
  'scanner.camera.permissionBlocked': 'Kamerazugriff ist deaktiviert',
  'scanner.camera.permissionRequired': 'Kamerazugriff erforderlich',
  'scanner.camera.enableInSettings':
    'Aktiviere die Kamera für Expo Go in den iPhone-Einstellungen.',
  'scanner.camera.purpose':
    'Die Kamera wird ausschließlich für die vier Produktaufnahmen verwendet.',

  'scanner.frame.saved': 'Echte Aufnahme für diesen Schritt gespeichert',
  'scanner.frame.positionProduct':
    'Produkt ruhig und vollständig im Rahmen positionieren',
  'scanner.frame.preparing': 'Kamera wird vorbereitet',
  'scanner.frame.enableInSettings':
    'Kamerazugriff in den iPhone-Einstellungen aktivieren',
  'scanner.frame.allowAccess': 'Kamerazugriff für die Aufnahme erlauben',

  'scanner.guidance.label': 'Für eine gute Erkennung',

  'scanner.primaryButton.retake': 'Foto neu aufnehmen',
  'scanner.primaryButton.saving': 'Foto wird gespeichert',
  'scanner.primaryButton.openSettings': 'iPhone-Einstellungen öffnen',
  'scanner.primaryButton.allowAccess': 'Kamerazugriff erlauben',
  'scanner.primaryButton.preparing': 'Kamera wird vorbereitet',
  'scanner.primaryButton.capture': 'Foto aufnehmen',

  'scanner.inline.removeCapture': 'Gespeicherte Aufnahme entfernen',

  'scanner.section.title': 'Benötigte Aufnahmen',
  'scanner.section.hint': 'Tippe auf einen Schritt, um ihn zu öffnen.',

  'scanner.step.stateDone': 'Erledigt',
  'scanner.step.stateActive': 'Aktiv',
  'scanner.step.stateOpen': 'Offen',

  'scanner.analysis.readyKicker': 'Bereit zur Prüfung',
  'scanner.analysis.pendingKicker': 'Aufnahmen vervollständigen',
  'scanner.analysis.readyTitle': 'Alle Produktseiten sind erfasst.',
  'scanner.analysis.remaining_one': '{count} Aufnahme fehlt noch.',
  'scanner.analysis.remaining_other': '{count} Aufnahmen fehlen noch.',
  'scanner.analysis.readyText':
    'Im nächsten Schritt werden die erkannten Produktdaten angezeigt und können vor dem Speichern kontrolliert werden.',
  'scanner.analysis.pendingText':
    'Die Analyse startet erst, wenn alle erforderlichen Produktbereiche aufgenommen wurden.',
  'scanner.analysis.running': 'Analyse läuft…',
  'scanner.analysis.start': 'Analyse starten',
  'scanner.analysis.startTest': 'Test-Analyse starten',
  'scanner.analysis.nextOpen': 'Nächste offene Aufnahme',

  'scanner.backHome': 'Zurück zur Startseite',

  'scanner.disclaimer.vision':
    'Die Fotos werden verkleinert, einmalig zur KI-Auswertung übertragen und dort nicht gespeichert. Erkannte Angaben sind ein Arbeitsstand und müssen vor der Übernahme geprüft werden.',
  'scanner.disclaimer.mock':
    'Die Fotos werden nur für den laufenden Scan im App-Speicher gehalten. Ohne konfiguriertes Analyse-Backend nutzt die Auswertung ein klar gekennzeichnetes Test-Ergebnis (siehe scanConfig.js).',

  'scanner.error.permissionDenied':
    'Ohne Kamerazugriff können keine Produktfotos aufgenommen werden.',
  'scanner.error.permissionRequestFailed':
    'Der Kamerazugriff konnte nicht angefragt werden. Bitte versuche es erneut.',
  'scanner.error.noPhotoFile': 'Die Kamera hat keine Bilddatei zurückgegeben.',
  'scanner.error.captureFailed':
    'Das Foto konnte nicht gespeichert werden. Halte das Produkt ruhig und versuche es erneut.',
  'scanner.error.cameraMountFailed':
    'Die Kamera konnte nicht gestartet werden. Bitte öffne den Scanner erneut.',
  'scanner.error.barcodeNotFound':
    'Barcode {code} wurde in der Produktdatenbank nicht gefunden. Bitte die vier Fotos aufnehmen.',
  'scanner.error.barcodeLookupFailed': 'Die Barcode-Suche ist fehlgeschlagen.',
  'scanner.error.analysisFailed':
    'Die Analyse ist fehlgeschlagen. Bitte erneut versuchen.',

  'scanner.step.front.title': 'Vorderseite',
  'scanner.step.front.shortLabel': 'Produkt erkennen',
  'scanner.step.front.description':
    'Fotografiere Marke und Produktname vollständig und gut lesbar.',
  'scanner.step.front.requirement':
    'Das gesamte Produkt sollte im Rahmen sichtbar sein.',

  'scanner.step.back.title': 'Rückseite',
  'scanner.step.back.shortLabel': 'Produktangaben',
  'scanner.step.back.description':
    'Erfasse die Rückseite mit Hersteller-, Mengen- und weiteren Produktangaben.',
  'scanner.step.back.requirement':
    'Vermeide Spiegelungen und verdeckte Textbereiche.',

  'scanner.step.ingredients.title': 'Inhaltsstoffe',
  'scanner.step.ingredients.shortLabel': 'Zusammensetzung',
  'scanner.step.ingredients.description':
    'Fotografiere die vollständige Zutaten- oder Wirkstofftabelle.',
  'scanner.step.ingredients.requirement':
    'Alle Zeilen und Mengenangaben müssen erkennbar sein.',

  'scanner.step.dosage.title': 'Dosierung',
  'scanner.step.dosage.shortLabel': 'Einnahmehinweise',
  'scanner.step.dosage.description':
    'Erfasse Dosierung, Portionsgröße und Anwendungshinweise des Herstellers.',
  'scanner.step.dosage.requirement':
    'Achte besonders auf Einheit und empfohlene Tagesmenge.',
  'scanner.consent.title': 'Fotos zur Auswertung übertragen?',
  'scanner.consent.message':
    'Für die Analyse werden deine Etikettenfotos verkleinert und einmalig an unsere Auswertungsfunktion (Supabase) sowie die Anthropic API (Claude) übertragen. Die Fotos werden dort nicht gespeichert, die Verarbeitung kann außerhalb der EU stattfinden. Die Zustimmung gilt auch für künftige Scans und lässt sich in den Einstellungen jederzeit widerrufen. Einzelheiten stehen in der Datenschutzerklärung.',
  'scanner.consent.confirm': 'Zustimmen und analysieren',
  'scanner.limit.title': 'Scan-Kontingent aufgebraucht',
  'scanner.limit.message':
    'Die kostenlosen KI-Scans sind verbraucht. Mit dem Pro-Abo scannst du unbegrenzt, oder du kaufst ein Scan-Paket. Der Barcode-Scan bleibt immer kostenlos.',
};
