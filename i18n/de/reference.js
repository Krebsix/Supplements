/**
 * i18n/de/reference.js
 * Saetze des Referenzwert-Abgleichs (ReferenceCheck.js).
 *
 * ABGRENZUNG: Das sind erzeugte Saetze ueber Zahlen ("81 mg decken rund
 * 27 % des Referenzwerts ab") — also Oberflaeche, keine Fachtexte. Die
 * Fachtexte der Wirkstoff-Datenbank (was ein Stoff ist, wofuer er
 * eingesetzt wird, Warnhinweise) bleiben davon unberuehrt und vorerst
 * deutsch.
 *
 * FORMULIERUNGSREGEL: Die App vergleicht Mengen mit veroeffentlichten
 * Referenzwerten. Sie sagt nie, was jemand nehmen soll.
 */

export default {
  // Statusbezeichnungen
  'reference.status.below': 'Unter Referenzwert',
  'reference.status.within': 'Im Bereich des Referenzwerts',
  'reference.status.aboveReference': 'Über Referenzwert',
  'reference.status.aboveLimit': 'Über Obergrenze',
  'reference.status.safeLevel': 'Innerhalb sicherer Menge',
  'reference.status.unknown': 'Kein Referenzwert hinterlegt',

  // Kein Abgleich moeglich
  'reference.noAmount':
    'Ohne erkannte Mengenangabe ist kein Abgleich möglich. Referenzwert: {reference} {unit} pro Tag.',
  'reference.unitMismatch':
    'Die Einheit "{unit}" lässt sich nicht sicher in {targetUnit} umrechnen. Bitte vom Etikett übernehmen.',
  'reference.compoundUnknown':
    'Die Angabe bezieht sich auf {form}, nicht auf elementares {substance}. Für diese Verbindung ist kein gesicherter Elementanteil hinterlegt, deshalb ist kein Abgleich mit dem Referenzwert von {reference} {unit} möglich. Die elementare Menge steht in der Nährwerttabelle des Produkts.',

  // Vergleichsergebnisse
  'reference.aboveLimit':
    '{amount} liegen über der tolerierbaren Gesamtzufuhr von {limit} pro Tag. Diese Grenze bezieht sich auf alle Quellen zusammen, also auch auf Lebensmittel und weitere Präparate.',
  'reference.safeLevel':
    '{amount} liegen innerhalb der von EFSA/BfR als sicher bewerteten Tagesmenge von {limit}. Für diesen Stoff existiert kein eigener Tages-Referenzwert, da er kein essenzieller Nährstoff ist.',
  'reference.aboveReference':
    '{amount} liegen über dem Referenzwert von {reference} pro Tag.',
  'reference.aboveReferenceWithLimit':
    '{amount} liegen über dem Referenzwert von {reference} pro Tag, aber unter der Obergrenze von {limit}.',
  'reference.within':
    '{amount} entsprechen etwa dem Referenzwert von {reference} pro Tag.',
  'reference.below':
    '{amount} decken rund {percent} % des Referenzwerts von {reference} pro Tag ab. Die restliche Menge stammt üblicherweise aus der Ernährung.',

  // Zusatz, wenn von der Verbindung auf das Element gerechnet wurde
  'reference.compoundBasis':
    ' Grundlage der Rechnung: {amount} {unit} {compound} enthalten rund {percent} % elementares {substance}. Referenzwerte beziehen sich immer auf die elementare Menge.',
  'reference.compoundVaries':
    ' Der Anteil schwankt je nach Handelsform — maßgeblich ist die Nährwerttabelle des Produkts.',

  // Unbekannter Wirkstoff
  'reference.unmatched':
    'Dieser Eintrag ist in der Wirkstoff-Datenbank noch nicht hinterlegt. Angaben bitte direkt vom Etikett übernehmen.',
};
