/**
 * i18n/en/scanner.js
 * Camera capture (app/scanner.jsx).
 */

export default {
  'scanner.kicker': 'Guided product scan',
  'scanner.title': 'Four photos. One clear result.',
  'scanner.subtitle':
    'The app guides you step by step through all relevant product sides, so details can later be checked completely and traceably.',

  'scanner.progress.label': 'Scan progress',
  'scanner.progress.count': '{completed} of {total} photos',
  'scanner.progress.complete': 'Complete',
  'scanner.progress.remaining': '{count} open',

  'scanner.barcode.detected': 'Barcode detected',
  'scanner.barcode.text':
    'The code can be looked up directly in the open product database. The four photos remain the more precise route, since they capture dosage and substance forms from the label.',
  'scanner.barcode.searching': 'Looking up product…',
  'scanner.barcode.search': 'Look up product by barcode',
  'scanner.barcode.discard': 'Discard barcode',

  'scanner.capture.eyebrow': 'Photo {current} of {total}',
  'scanner.capture.statusSaved': 'Saved',
  'scanner.capture.statusOpen': 'Open',

  'scanner.camera.checkingPermission': 'Checking camera access',
  'scanner.camera.permissionBlocked': 'Camera access is disabled',
  'scanner.camera.permissionRequired': 'Camera access required',
  'scanner.camera.enableInSettings':
    'Enable the camera for Expo Go in the iPhone settings.',
  'scanner.camera.purpose':
    'The camera is used exclusively for the four product photos.',

  'scanner.frame.saved': 'Real photo saved for this step',
  'scanner.frame.positionProduct':
    'Hold the product steady and fully within the frame',
  'scanner.frame.preparing': 'Preparing camera',
  'scanner.frame.enableInSettings':
    'Enable camera access in the iPhone settings',
  'scanner.frame.allowAccess': 'Allow camera access for this photo',

  'scanner.guidance.label': 'For good recognition',

  'scanner.primaryButton.retake': 'Retake photo',
  'scanner.primaryButton.saving': 'Saving photo',
  'scanner.primaryButton.openSettings': 'Open iPhone settings',
  'scanner.primaryButton.allowAccess': 'Allow camera access',
  'scanner.primaryButton.preparing': 'Preparing camera',
  'scanner.primaryButton.capture': 'Take photo',

  'scanner.inline.removeCapture': 'Remove saved photo',

  'scanner.section.title': 'Required photos',
  'scanner.section.hint': 'Tap a step to open it.',

  'scanner.step.stateDone': 'Done',
  'scanner.step.stateActive': 'Active',
  'scanner.step.stateOpen': 'Open',

  'scanner.analysis.readyKicker': 'Ready to check',
  'scanner.analysis.pendingKicker': 'Complete the photos',
  'scanner.analysis.readyTitle': 'All product sides are captured.',
  'scanner.analysis.remaining_one': '{count} photo still missing.',
  'scanner.analysis.remaining_other': '{count} photos still missing.',
  'scanner.analysis.readyText':
    'The next step shows the detected product data, which can be checked before saving.',
  'scanner.analysis.pendingText':
    'The analysis only starts once all required product areas have been photographed.',
  'scanner.analysis.running': 'Analysis running…',
  'scanner.analysis.start': 'Start analysis',
  'scanner.analysis.startTest': 'Start test analysis',
  'scanner.analysis.nextOpen': 'Next open photo',

  'scanner.backHome': 'Back to home',

  'scanner.disclaimer.vision':
    'Photos are resized, sent once for AI analysis, and not stored there. Detected details are a draft and must be checked before being applied.',
  'scanner.disclaimer.mock':
    'Photos are only held in app memory for the current scan. Without a configured analysis backend, the evaluation uses a clearly labeled test result (see scanConfig.js).',

  'scanner.error.permissionDenied':
    'Without camera access, no product photos can be taken.',
  'scanner.error.permissionRequestFailed':
    'Camera access could not be requested. Please try again.',
  'scanner.error.noPhotoFile': 'The camera did not return an image file.',
  'scanner.error.captureFailed':
    'The photo could not be saved. Hold the product steady and try again.',
  'scanner.error.cameraMountFailed':
    'The camera could not be started. Please open the scanner again.',
  'scanner.error.barcodeNotFound':
    'Barcode {code} was not found in the product database. Please take the four photos.',
  'scanner.error.barcodeLookupFailed': 'The barcode lookup failed.',
  'scanner.error.analysisFailed': 'The analysis failed. Please try again.',

  'scanner.step.front.title': 'Front',
  'scanner.step.front.shortLabel': 'Identify product',
  'scanner.step.front.description':
    'Photograph the brand and product name completely and legibly.',
  'scanner.step.front.requirement':
    'The entire product should be visible within the frame.',

  'scanner.step.back.title': 'Back',
  'scanner.step.back.shortLabel': 'Product details',
  'scanner.step.back.description':
    'Capture the back with manufacturer, quantity and other product details.',
  'scanner.step.back.requirement':
    'Avoid reflections and covered text areas.',

  'scanner.step.ingredients.title': 'Ingredients',
  'scanner.step.ingredients.shortLabel': 'Composition',
  'scanner.step.ingredients.description':
    'Photograph the complete ingredients or active substance table.',
  'scanner.step.ingredients.requirement':
    'All rows and amounts must be legible.',

  'scanner.step.dosage.title': 'Dosage',
  'scanner.step.dosage.shortLabel': 'Intake information',
  'scanner.step.dosage.description':
    "Capture dosage, serving size and the manufacturer's usage information.",
  'scanner.step.dosage.requirement':
    "Pay close attention to unit and the manufacturer's stated daily amount.",
  'scanner.consent.title': 'Transmit photos for evaluation?',
  'scanner.consent.message':
    'For the analysis, your label photos are downscaled and transmitted once to our evaluation function (Supabase) and the Anthropic API (Claude). The photos are not stored there; processing may take place outside the EU. This consent also covers future scans and can be withdrawn at any time in the settings. Details are in the privacy policy.',
  'scanner.consent.confirm': 'Agree and analyse',
  'scanner.limit.title': 'Scan quota used up',
  'scanner.limit.message':
    'Your free AI scans are used up. With the Pro subscription you scan without limits, or you buy a scan pack. Barcode scanning always stays free.',
};
