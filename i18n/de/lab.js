/**
 * i18n/de/lab.js — Laborwerte und Arztbericht.
 *
 * FORMULIERUNGSREGEL: Die App bewertet Laborwerte nicht. Kein "zu
 * niedrig", kein "Mangel", kein "im Normbereich". Sie dokumentiert und
 * stellt den Verlauf dar; die Einordnung macht die Fachperson.
 */

export default {
  'lab.kicker': 'Laborwerte',
  'lab.title': 'Deine Werte im Verlauf',
  'lab.subtitle':
    'Trage Befunde ein, um sie über die Zeit zu verfolgen. Die App ordnet die Werte nicht ein, sie stellt sie zusammen.',
  'lab.privacy': 'Auch diese Angaben bleiben auf deinem Gerät.',

  'lab.marker.ferritin': 'Ferritin',
  'lab.marker.hemoglobin': 'Hämoglobin',
  'lab.marker.vitaminD': 'Vitamin D (25-OH)',
  'lab.marker.vitaminB12': 'Vitamin B12',
  'lab.marker.holoTC': 'Holo-Transcobalamin',
  'lab.marker.folate': 'Folsäure',
  'lab.marker.magnesium': 'Magnesium',
  'lab.marker.zinc': 'Zink',
  'lab.marker.selenium': 'Selen',
  'lab.marker.calcium': 'Calcium',
  'lab.marker.tsh': 'TSH',
  'lab.marker.crp': 'CRP',
  'lab.marker.hba1c': 'HbA1c',
  'lab.marker.ldl': 'LDL-Cholesterin',
  'lab.marker.hdl': 'HDL-Cholesterin',
  'lab.marker.triglycerides': 'Triglyzeride',
  'lab.marker.creatinine': 'Kreatinin',
  'lab.marker.altGpt': 'ALT (GPT)',
  'lab.marker.other': 'Anderer Wert',

  'lab.new.title': 'Wert eintragen',
  'lab.new.marker': 'Welcher Wert?',
  'lab.new.customName': 'Bezeichnung',
  'lab.new.value': 'Ergebnis',
  'lab.new.unit': 'Einheit',
  'lab.new.date': 'Datum der Messung',
  'lab.new.datePlaceholder': 'JJJJ-MM-TT',
  'lab.new.labName': 'Labor oder Praxis',
  'lab.new.reference': 'Referenzbereich laut Befund',
  'lab.new.referenceHint':
    'Optional. Referenzbereiche unterscheiden sich je nach Labor und Messverfahren, deshalb bringt die App keine eigenen mit. Steht auf dem Befund einer, kannst du ihn hier übernehmen.',
  'lab.new.referenceMin': 'von',
  'lab.new.referenceMax': 'bis',
  'lab.new.save': 'Wert speichern',
  'lab.new.invalid': 'Bitte Ergebnis und Datum angeben.',

  'lab.list.title': 'Erfasste Werte',
  'lab.list.empty': 'Noch keine Werte eingetragen.',
  'lab.list.referenceGiven': 'Referenz laut Befund: {min} bis {max}',
  'lab.list.noReference': 'Kein Referenzbereich hinterlegt',
  'lab.list.intakeContext': 'In den 14 Tagen davor dokumentiert: {names}',
  'lab.list.delete': 'Wert löschen',
  'lab.list.deleteConfirm': 'Diesen Wert löschen?',

  'lab.disclaimer':
    'Die App bewertet Laborwerte nicht und leitet daraus keinen Bedarf ab. Sie hält fest, was gemessen wurde und was zu diesem Zeitpunkt eingenommen wurde. Die Beurteilung gehört in ärztliche Hände.',

  'export.kicker': 'Bericht',
  'export.screenTitle': 'Bericht für Praxis oder Apotheke',
  'export.screenSubtitle':
    'Erstellt eine Übersicht aus deinen Angaben. Du entscheidest, was hineinkommt.',
  'export.sections': 'Was soll enthalten sein?',
  'export.section.supplements': 'Aktuelle Präparate',
  'export.section.totals': 'Tagessummen je Wirkstoff',
  'export.section.profile': 'Medikamentengruppen und Hinweise',
  'export.section.lab': 'Laborwerte',
  'export.section.outcomes': 'Beobachtungen zur Wirkung',
  'export.section.adherence': 'Dokumentierte Einnahmen',
  'export.generate': 'Bericht erstellen',
  'export.copy': 'Text kopieren',
  'export.copied': 'In die Zwischenablage kopiert',
  'export.preview': 'Vorschau',

  'export.title': 'Supplement-Übersicht',
  'export.generatedOn': 'Erstellt am {date}',
  'export.lifeStage': 'Referenzwerte bezogen auf: {stage}',
  'export.disclaimer':
    'Diese Übersicht wurde aus Selbstangaben einer Supplement-App erzeugt. Sie enthält keine Diagnose und keine Empfehlung. Mengenangaben stammen von Produktetiketten, Referenzwerte aus öffentlichen Quellen (DGE, EFSA, BfR).',
  'export.none': 'Keine Angaben.',
  'export.purpose': 'Zweck laut Nutzerin: {purpose}',
  'export.totalsIntro':
    'Summe je Wirkstoff über alle erfassten Präparate. Verbindungsmengen wurden auf die elementare Menge umgerechnet.',
  'export.fromProducts_one': 'aus {count} Produkt',
  'export.fromProducts_other': 'aus {count} Produkten',
  'export.aboveLimit': 'über der Obergrenze von {limit} {unit}',
  'export.aboveReference': 'über dem Referenzwert von {reference} {unit}',
  'export.unresolved': '{count} Position(en) konnten nicht verrechnet werden.',
  'export.noMedication': 'Keine Medikamentengruppen angegeben.',
  'export.medicationGroups': 'Angegebene Medikamentengruppen:',
  'export.medicationFindings':
    'Dazu hinterlegte Hinweise aus den Fachquellen (wörtliches Zitat, keine Bewertung des Einzelfalls):',
  'export.labReference': 'Referenz laut Befund: {min} bis {max}',
  'export.labNote':
    'Referenzbereiche stammen aus dem jeweiligen Befund, nicht von der App.',
  'export.trialRunning': 'läuft seit {days} Tagen',
  'export.trialConcluded.continue': 'abgeschlossen, weitergenommen',
  'export.trialConcluded.stop': 'abgeschlossen, abgesetzt',
  'export.trialConcluded.unclear': 'abgeschlossen, unklar',
  'export.trialChange':
    'Selbsteinschätzung: Ausgangswert {baseline}, zuletzt {current} (bei {count} Bewertungen, Skala 1 bis 5)',
  'export.trialLimitations':
    '{count} Einschränkung(en) sprechen gegen eine eindeutige Zuordnung zur Einnahme.',
  'export.outcomesNote':
    'Die Angaben zur Wirkung sind Selbsteinschätzungen im Zeitverlauf, keine Wirksamkeitsmessung.',
  'export.adherenceSummary': 'Dokumentierte Einnahmen in den letzten 30 Tagen: {count}',
  'export.footer': 'Erstellt mit {app}. Alle Daten liegen ausschließlich auf dem Gerät der Nutzerin, die App überträgt nichts an Server. Dieser Bericht ist eine Dokumentation, keine ärztliche Beratung.',
};
