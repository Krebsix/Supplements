/**
 * i18n/de/scanner.js
 * Kamera-Erfassung (app/scanner.jsx).
 */

export default {
  'scanner.kicker': 'Geführter Produktscan',
  'scanner.title': 'So viele Fotos wie nötig.',
  'scanner.subtitle':
    'Die Schritte sind ein Vorschlag, keine Bedingung. Fotografiere so viel, wie das Etikett hergibt: Ausgewertet wird, sobald das erste Foto steht.',

  'scanner.barcode.detected': 'Barcode erkannt',
  'scanner.barcode.text':
    'Der Code kann direkt in der offenen Produktdatenbank nachgeschlagen werden. Die Fotos bleiben der genauere Weg, weil sie Dosierung und Wirkstoffformen vom Etikett erfassen.',
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
    'Die Kamera wird ausschließlich für die Produktaufnahmen verwendet.',

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

  'scanner.section.title': 'Benötigte Aufnahmen',
  'scanner.section.hint': 'Tippe auf einen Schritt, um ihn zu öffnen.',

  'scanner.step.stateDone': 'Erledigt',
  'scanner.step.stateActive': 'Aktiv',
  'scanner.step.stateOpen': 'Offen',

  'scanner.analysis.readyKicker': 'Bereit zur Prüfung',
  'scanner.analysis.pendingKicker': 'Noch kein Foto',
  'scanner.analysis.noneTitle': 'Nimm zuerst ein Foto auf.',
  'scanner.analysis.count_one': 'Ein Foto liegt bereit.',
  'scanner.analysis.count_other': '{count} Fotos liegen bereit.',
  'scanner.analysis.allText':
    'Im nächsten Schritt werden die erkannten Produktdaten angezeigt und können vor dem Speichern kontrolliert werden.',
  'scanner.analysis.enoughText':
    'Das reicht, wenn Wirkstoffe und Menge auf den Fotos lesbar sind. Noch offen wären: {missing}. Was am Ende fehlt, weist das Ergebnis aus.',
  'scanner.analysis.pendingText':
    'Für die Auswertung genügt ein Foto, auf dem Wirkstoffe und Menge lesbar sind.',
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
    'Barcode {code} wurde in der Produktdatenbank nicht gefunden. Nimm das Etikett per Foto auf.',
  'scanner.error.barcodeLookupFailed': 'Die Barcode-Suche ist fehlgeschlagen.',
  'scanner.error.codeNotProduct':
    'Dieser Code enthält keine Produktnummer (EAN/GTIN). Für die Auswertung das Etikett fotografieren.',
  'scanner.liveHint.ready':
    'Barcode oder QR-Code ins Bild halten, die Suche startet automatisch',
  'scanner.liveHint.searching': 'Code erkannt, Produkt wird gesucht …',
  'scanner.error.captureTimeout':
    'Die Aufnahme hat zu lange gedauert. Bitte erneut auslösen.',
  'scanner.nameSearch.label': 'Ohne Code: nach Name suchen',
  'scanner.nameSearch.text':
    'Produktname und Hersteller eingeben. Die Daten kommen aus der Community-Datenbank Open Food Facts und werden entsprechend gekennzeichnet.',
  'scanner.nameSearch.placeholder': 'z. B. Doppelherz Magnesium 400',
  'scanner.nameSearch.button': 'Produkt suchen',
  'scanner.nameSearch.searching': 'Suche läuft …',
  'scanner.nameSearch.empty':
    'Kein Treffer in der Datenbank. Dann hilft das Foto vom Etikett weiter.',
  'scanner.nameSearch.failed': 'Die Produktsuche ist fehlgeschlagen.',
  'scanner.nameSearch.seedOrigin': 'DACH-Katalog',
  'scanner.inline.resetScan': 'Scan verwerfen und neu starten',
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

  'seedCatalog.warning.catalog':
    'Eintrag aus dem kuratierten DACH-Produktkatalog (Herstellerangaben). Dosierung und Wirkstoffmengen bitte direkt vom Etikett abgleichen.',
  'seedCatalog.uncertaintyNote':
    'Katalog-Treffer aus der Produktrecherche. Vor der Übernahme mit dem Etikett abgleichen.',
  'seedCatalog.class.arznei':
    'Dieses Produkt ist als Arzneimittel zugelassen. Für Anwendung und Dosierung gilt die Packungsbeilage, bei Fragen helfen Arztpraxis oder Apotheke.',
  'seedCatalog.class.homoeopathikum':
    'Registriertes homöopathisches Arzneimittel, daher ohne Angabe einer therapeutischen Indikation. Für die Anwendung gilt die Packungsbeilage. Der Eintrag dient der Dokumentation und fließt nicht in die Nährstoff-Auswertungen ein.',
  'seedCatalog.class.bachblueten':
    'Bachblüten-Zubereitung ohne deklarierte Nährstoffmengen. Für Anwendung und Zusammensetzung gelten die Herstellerangaben auf der Verpackung. Der Eintrag dient der Dokumentation und fließt nicht in die Nährstoff-Auswertungen ein.',
};
