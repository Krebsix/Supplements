/**
 * i18n/de/addSupplement.js
 * Supplement anlegen und bearbeiten (app/AddSupplement.jsx).
 */

export default {
  'addSupplement.screenTitle.edit': 'Supplement bearbeiten',
  'addSupplement.screenTitle.scan': 'Scan-Ergebnis prüfen',
  'addSupplement.screenTitle.manual': 'Manueller Routine-Eintrag',

  'addSupplement.screenSubtitle.edit':
    'Passe Name, Dosierung, Tages-Slots und Notizen für deine aktive Routine an.',
  'addSupplement.screenSubtitle.scan':
    'Überprüfe die erkannten Angaben, ergänze fehlende Details und übernimm den Eintrag erst nach deiner Bestätigung in die Routine.',
  'addSupplement.screenSubtitle.manual':
    'Erstelle einen eigenen Routine-Eintrag mit Name, Dosierung, Tages-Slots und optionalen Notizen. Keine medizinische Beratung.',

  'addSupplement.primaryButton.edit': 'Änderungen speichern',
  'addSupplement.primaryButton.scan': 'Scan-Ergebnis übernehmen',
  'addSupplement.primaryButton.manual': 'Manuellen Eintrag speichern',

  'addSupplement.modeLabel.edit': 'Aktive Routine',
  'addSupplement.modeLabel.scan': 'Scannerprüfung',
  'addSupplement.modeLabel.manual': 'Neuer Routine-Eintrag',

  'addSupplement.modePill.edit': 'Bearbeiten',
  'addSupplement.modePill.scan': 'Prüfen',
  'addSupplement.modePill.manual': 'Manuell',

  'addSupplement.trustTitle': 'Prüfhinweis',
  'addSupplement.trustCopy.scan':
    'Scan-Daten sind ein Startpunkt. Nicht erkannte Dosierung und Einheit bleiben bewusst leer und werden transparent als fehlend gespeichert, bis du sie ergänzt.',
  'addSupplement.trustCopy.edit':
    'Änderungen wirken sich auf deine aktive Tagesroutine aus. Historische Einnahmen bleiben davon unberührt.',
  'addSupplement.trustCopy.manual':
    'Dieser Eintrag strukturiert deine persönliche Routine. Die App gibt hier keine Diagnose, Therapie- oder Dosierungsempfehlung.',

  'addSupplement.nameLabel': 'Supplement-Name',
  'addSupplement.nameHelper':
    'Nutze einen klaren Produkt- oder Wirkstoffnamen, damit Dashboard, Verlauf und Archiv eindeutig bleiben.',
  'addSupplement.namePlaceholder': 'z. B. Magnesium Bisglycinat',

  'addSupplement.purposeLabel': 'Ziel / Kontext',
  'addSupplement.purposeHelper':
    'Beschreibt den persönlichen Routine-Kontext, nicht die medizinische Wirkung.',
  'addSupplement.purposePlaceholder': 'z. B. Abendroutine, Regeneration, Fokus',

  'addSupplement.categoryLabel': 'Kategorie / Gruppe',
  'addSupplement.categoryHelper':
    'Hilft später bei Filterung, Stack-Logik und sauberer Auswertung.',
  'addSupplement.categoryPlaceholder': 'z. B. Mineralien',
  'addSupplement.categoryExamples': 'Beispiele aus deinem aktuellen Bestand: {examples}',

  'addSupplement.amountLabel': 'Menge pro Einnahme',
  'addSupplement.amountHelper': 'Nur die sichtbare Routine-Menge, keine Empfehlung.',
  'addSupplement.amountPlaceholder': 'z. B. 300',

  'addSupplement.unitLabel': 'Einheit',
  'addSupplement.unitHelper': 'z. B. mg, IE, Kapsel, Tropfen oder Portion.',
  'addSupplement.unitPlaceholder': 'mg',

  'addSupplement.packageUnitsLabel': 'Inhalt der Packung',
  'addSupplement.packageUnitsHelper':
    'Wie viele Kapseln, Tabletten oder Portionen sind in der Dose?',
  'addSupplement.packageUnitsPlaceholder': '120',
  'addSupplement.priceLabel': 'Kaufpreis in Euro',
  'addSupplement.priceHelper':
    'Was du zuletzt bezahlt hast. Daraus errechnet die Kostenanalyse den Tagespreis.',
  'addSupplement.pricePlaceholder': '19,90',

  'addSupplement.routineSectionTitle': 'Tagesroutine',
  'addSupplement.routineSectionSubtitle':
    'Wähle die Tageszeit, in der dieser Eintrag sichtbar sein soll. Mehrere Slots sind möglich.',
  'addSupplement.selectedSlots': 'Ausgewählt: {slots}',
  'addSupplement.noSlotSelected': 'Noch kein Tages-Slot ausgewählt.',

  'addSupplement.timingLabel': 'Timing-Anzeige',
  'addSupplement.timingHelper':
    'Optionaler Freitext für eine natürlichere Anzeige, z. B. „abends nach dem Essen“.',
  'addSupplement.timingPlaceholder': 'Optional: z. B. abends nach dem Essen',

  'addSupplement.childSafeTitle': 'Familienhinweis vormerken',
  'addSupplement.childSafeSubtitle':
    'Interner Marker für spätere Hinweise und Filter. Keine Sicherheitsfreigabe und keine Dosierungsempfehlung.',

  'addSupplement.notesLabel': 'Interne Notizen',
  'addSupplement.notesHelper':
    'Optional: Herkunft, Einnahme-Kontext oder persönliche Beobachtungen.',
  'addSupplement.notesPlaceholder': 'Optional: Hinweise zur Einnahme oder Herkunft',

  'addSupplement.alert.nameMissingTitle': 'Name fehlt',
  'addSupplement.alert.nameMissingMessage':
    'Bitte gib mindestens einen Namen für das Supplement ein.',
  'addSupplement.alert.slotMissingTitle': 'Slot fehlt',
  'addSupplement.alert.slotMissingMessage': 'Bitte wähle mindestens einen Tages-Slot aus.',
  'addSupplement.alert.notFoundTitle': 'Eintrag nicht gefunden',
  'addSupplement.alert.notFoundMessage':
    'Dieser Eintrag konnte nicht mehr im lokalen Store gefunden werden.',
  'addSupplement.alert.updatedTitle': 'Aktualisiert',
  'addSupplement.alert.updatedMessage':
    'Die Änderungen wurden in deiner aktiven Routine gespeichert.',
  'addSupplement.alert.savedTitle': 'Gespeichert',
  'addSupplement.alert.savedScanMessage':
    'Das bestätigte Scan-Ergebnis wurde deiner Routine hinzugefügt.',
  'addSupplement.alert.savedManualMessage':
    'Das Supplement wurde deiner Routine als manueller Eintrag hinzugefügt.',
  'addSupplement.alert.goToDashboard': 'Zum Dashboard',

  'addSupplement.scan.purpose': 'Aus Scan übernommen',
  'addSupplement.scan.category': 'Scan-Ergebnis',
  'addSupplement.scan.brandNote': 'Marke: {brand}',
  'addSupplement.scan.ingredientsNote': 'Erkannte Inhaltsstoffe: {ingredients}',
  'addSupplement.scan.timingNote': 'Unbestätigter Timing-Hinweis: {timing}',
  'addSupplement.scan.warningsNote': 'Prüfhinweise:\n- {warnings}',

  'addSupplement.defaultPurpose': 'Benutzerdefiniert',
  'addSupplement.defaultCategory': 'Benutzerdefiniert',

  'addSupplement.cureTitle': 'Kur-Zyklus',
  'addSupplement.cureSubtitle':
    'Einnahmephase und Pause im Wechsel, zum Beispiel 21 Tage Einnahme, 7 Tage Pause. An Pausentagen erscheint das Präparat nicht im Tagesplan.',
  'addSupplement.cureOnLabel': 'Einnahmetage',
  'addSupplement.cureOnHelper': 'Länge der Einnahmephase in Tagen.',
  'addSupplement.cureOffLabel': 'Pausentage',
  'addSupplement.cureOffHelper': 'Länge der Pause in Tagen.',
  'addSupplement.alert.cureInvalidTitle': 'Kur-Angaben unvollständig',
  'addSupplement.alert.cureInvalidMessage':
    'Für einen Kur-Zyklus braucht es Einnahmetage und Pausentage, jeweils mindestens 1.',
  'addSupplement.alert.limitTitle': 'Grenze im Free-Tarif erreicht',
  'addSupplement.alert.limitMessage':
    'Im Free-Tarif lassen sich bis zu {limit} Präparate gleichzeitig führen. Mit dem Pro-Abo entfällt diese Grenze.',
};
