/**
 * i18n/de/components.js
 * Wiederverwendete Komponenten (components/).
 */

export default {
  // SubstanceInsightCard.jsx
  'components.insight.unnamedEntry': 'Unbenannter Eintrag',
  'components.insight.referenceHeading': 'Abgleich mit Referenzwert',
  'components.insight.referenceMeta':
    'Referenzwert {reference} {unit} · Obergrenze {upperLimit} {unit} pro Tag',
  'components.insight.formLabel': 'Erkannte Form',
  'components.insight.formBio': 'Aufnahme: {bioavailability}',
  'components.insight.useCases': 'Anwendungsgebiete',
  'components.insight.formsCompare': 'Formen im Vergleich',
  'components.insight.fatSolubleHint':
    'Fettlöslich: die Aufnahme ist zu einer Mahlzeit mit Fett deutlich besser.',
  'components.insight.caution': 'Zu beachten',
  'components.insight.sources': 'Quellen',
  'components.insight.showLess': 'Weniger anzeigen',
  'components.insight.showMore': 'Formen und Hinweise anzeigen',

  // SupplementResultCard.jsx
  'components.result.fieldStateDetected': 'Erkannt',
  'components.result.fieldStateReview': 'Prüfen',
  'components.result.fieldStateMissing': 'Fehlt',
  'components.result.productNameMissing': 'Produktname nicht erkannt',
  'components.result.brandMissing': 'Marke nicht erkannt',
  'components.result.dosageMissing': 'Dosierung nicht erkannt',
  'components.result.confidenceNone': 'Keine Bewertung verfügbar',
  'components.result.confidenceHigh': 'Hohe technische Erkennung',
  'components.result.confidenceReview': 'Prüfung erforderlich',
  'components.result.confidenceManual': 'Manuelle Kontrolle erforderlich',
  'components.result.identityEyebrow': 'Erkannte Produktidentität',
  'components.result.scanBadge': 'Scan',
  'components.result.confidenceTitle': 'Technische Erkennung',
  'components.result.confidenceExplanation':
    'Der Prozentwert beschreibt nur die technische Erkennung des Testmodells. Er bestätigt weder die inhaltliche Richtigkeit noch die Eignung des Produkts.',
  'components.result.reviewSectionTitle': 'Zu prüfende Angaben',
  'components.result.reviewSectionHint': 'Vor Übernahme kontrollieren',
  'components.result.fieldProductName': 'Produktname',
  'components.result.helperProductNameDetected':
    'Mit der Vorderseite des Produkts abgleichen.',
  'components.result.helperProductNameMissing':
    'Muss im nächsten Schritt manuell ergänzt werden.',
  'components.result.fieldBrand': 'Marke',
  'components.result.helperBrandDetected':
    'Schreibweise und Hersteller kontrollieren.',
  'components.result.helperBrandMissing':
    'Auf dem Produktetikett prüfen und ergänzen.',
  'components.result.fieldDosage': 'Dosierung',
  'components.result.helperDosageDetected':
    'Menge, Einheit und Portionsbezug kontrollieren.',
  'components.result.helperDosageMissing':
    'Es wird keine Dosierung automatisch übernommen.',
  'components.result.fieldIngredients': 'Inhaltsstoffe',
  'components.result.ingredientsCount_one': '1 Wirkstoff erkannt',
  'components.result.ingredientsCount_other': '{count} Wirkstoffe erkannt',
  'components.result.helperIngredientsDetected':
    'Alle Namen und Mengen mit dem Etikett abgleichen.',
  'components.result.helperIngredientsMissing':
    'Keine auswertbaren Wirkstoffe vorhanden.',
  'components.result.ingredientsSectionTitle': 'Erkannte Wirkstoffe',
  'components.result.ingredientsSectionDescription':
    'Die Erkennung nennt zunächst nur Wirkstoffnamen. Mengen, Formen und Zusammensetzung sind dadurch noch nicht bestätigt.',
  'components.result.ingredientsEmpty': 'Keine Inhaltsstoffe erkannt.',
  'components.result.warningsSectionTitle': 'Prüfhinweise',
  'components.result.warningsEmpty': 'Keine zusätzlichen Hinweise verfügbar.',
  'components.result.timingTitle': 'Timing-Hinweis',
  'components.result.timingBadge': 'Vorschlag',
  'components.result.timingEmpty': 'Kein Timing-Vorschlag verfügbar.',
  'components.result.timingFootnote':
    'Dieser Hinweis wird nicht automatisch als persönliche Routine bestätigt.',
  'components.result.uncertaintyTitle': 'Grenzen der Analyse',

  // CertificationPanel.jsx
  'components.certification.emptyTitle': 'Keine Prüfsiegel erkannt',
  'components.certification.emptyText':
    'Auf den Aufnahmen war kein bekanntes Prüfsiegel sichtbar. Das ist kein Qualitätsurteil, viele Produkte tragen keine Zertifizierung, und Siegel können auf ungescannten Verpackungsseiten stehen.',
  'components.certification.scopeLabel': 'Was es nicht abdeckt',
  'components.certification.issuer': 'Vergeben von: {issuer}',
  'components.certification.unknownLabel': 'Nicht zugeordnet',
  'components.certification.unknownNote':
    'Diese Angaben vom Etikett sind in der Siegel-Datenbank nicht hinterlegt. Werbeaussagen wie „laborgeprüft“ oder „Premium“ sind keine geschützten Zertifizierungen.',

  // AppHeader.jsx
  'components.header.kicker': 'Supplement OS',
};
