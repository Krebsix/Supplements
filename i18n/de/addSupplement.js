/**
 * i18n/de/addSupplement.js
 * Screen "Aufnehmen" (app/AddSupplement.jsx): Produktkarte, zwei Fragen
 * (wie oft, wann) und eingeklappte "Mehr Angaben". Vier Einstiege:
 * Katalog/Scan (?fromScan=1), Bearbeiten (?editId=), manuell ohne Parameter.
 */

export default {
  'addSupplement.title.new': 'Präparat aufnehmen',
  'addSupplement.title.edit': 'Präparat bearbeiten',
  'addSupplement.name.label': 'Name',
  'addSupplement.name.placeholder': 'z. B. Magnesium Bisglycinat',
  'addSupplement.amount.label': 'Menge je Einnahme',
  'addSupplement.amount.placeholder': 'z. B. 1',
  'addSupplement.unit.label': 'Einheit',
  'addSupplement.unit.capsule': 'Kapsel',
  'addSupplement.unit.tablet': 'Tablette',
  'addSupplement.unit.mg': 'mg',
  'addSupplement.unit.drops': 'Tropfen',
  'addSupplement.unit.ml': 'ml',
  'addSupplement.unit.portion': 'Portion',
  'addSupplement.unit.other': 'Andere',
  'addSupplement.unit.otherPlaceholder': 'z. B. IE, g, Beutel',
  'addSupplement.more.title': 'Mehr Angaben',
  'addSupplement.more.subtitle': 'Packung, Preis, Kur, Notiz. Alles freiwillig.',
  'addSupplement.more.packageUnits': 'Inhalt der Packung',
  'addSupplement.more.packageUnitsPlaceholder': '120',
  'addSupplement.more.price': 'Kaufpreis in Euro',
  'addSupplement.more.pricePlaceholder': '19,90',
  'addSupplement.more.cure': 'Kur-Zyklus',
  'addSupplement.more.cureSubtitle': 'Einnahmetage und Pausentage im Wechsel.',
  'addSupplement.more.cureOn': 'Einnahmetage',
  'addSupplement.more.cureOff': 'Pausentage',
  'addSupplement.more.notes': 'Notiz',
  'addSupplement.more.notesPlaceholder': 'Optional',
  'addSupplement.save.new': 'Zum Tagesplan hinzufügen',
  'addSupplement.save.edit': 'Speichern',

  'addSupplement.alert.nameMissingTitle': 'Name fehlt',
  'addSupplement.alert.nameMissingMessage':
    'Bitte gib mindestens einen Namen für das Supplement ein.',
  'addSupplement.alert.slotMissingTitle': 'Slot fehlt',
  'addSupplement.alert.slotMissingMessage': 'Bitte wähle mindestens einen Tages-Slot aus.',
  'addSupplement.alert.notFoundTitle': 'Eintrag nicht gefunden',
  'addSupplement.alert.notFoundMessage':
    'Dieser Eintrag konnte nicht mehr im lokalen Store gefunden werden.',
  'addSupplement.alert.cureInvalidTitle': 'Kur-Angaben unvollständig',
  'addSupplement.alert.cureInvalidMessage':
    'Für einen Kur-Zyklus braucht es Einnahmetage und Pausentage, jeweils mindestens 1.',
  'addSupplement.alert.limitTitle': 'Grenze im Free-Tarif erreicht',
  'addSupplement.alert.limitMessage':
    'Im Free-Tarif lassen sich bis zu {limit} Präparate gleichzeitig führen. Mit dem Pro-Abo entfällt diese Grenze.',

  'addSupplement.defaultPurpose': 'Benutzerdefiniert',
  'addSupplement.defaultCategory': 'Benutzerdefiniert',

  'addSupplement.scan.warningsNote': 'Prüfhinweise:\n- {warnings}',

  // Produktkarte, Haeufigkeits- und Slot-Chips (Task 2)
  'addSupplement.scanHint': 'Aus dem Etikett erkannt, bitte prüfen.',
  'addSupplement.product.change': 'Ändern',
  'addSupplement.product.noDetails': 'Inhaltsstoffe noch nicht erfasst.',
  'addSupplement.product.cert.product': '{name}: Produkt gelistet (Stand {date}). Quelle öffnen',
  'addSupplement.product.cert.brand': '{name}: Hersteller zertifiziert (Stand {date}). Quelle öffnen',
  'addSupplement.product.cert.law': '{name}: Herstellung unter behördlicher Herstellererlaubnis. Quelle öffnen',
  'addSupplement.frequency.title': 'Wie oft am Tag?',
  'addSupplement.frequency.times': '{count}×',
  'addSupplement.slot.title': 'Wann?',
  'addSupplement.slot.default': 'Standard: morgens. Jederzeit änderbar.',
  'addSupplement.slot.suggestion': 'Vorschlag: {text} ({source})',
  'addSupplement.slot.none': 'Bitte mindestens eine Einnahmezeit wählen.',
};
