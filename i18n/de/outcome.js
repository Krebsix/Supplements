/**
 * i18n/de/outcome.js
 * Wirkungskontrolle (app/outcome.jsx, OutcomeTracker.js).
 *
 * FORMULIERUNGSREGEL, hier zentral:
 * Die App stellt Beobachtung und Rahmenbedingungen nebeneinander. Sie sagt
 * nie "X hat gewirkt" und nie "nimm es weiter". Auch nicht in abgemilderter
 * Form ("scheint zu helfen") — das ist dieselbe Aussage mit Weichzeichner.
 *
 * Was erlaubt ist: "Deine Bewertung ist gestiegen." Was nicht erlaubt ist:
 * "Das Praeparat hat Deine Bewertung verbessert."
 */

export default {
  'outcome.kicker': 'Wirkungskontrolle',
  'outcome.title': 'Bringt es dir tatsächlich etwas?',
  'outcome.subtitle':
    'Halte fest, warum du ein Präparat nimmst, wie der Ausgangszustand war und was sich über die Zeit verändert. Die App rechnet nichts schön — sie zeigt dir daneben, was gegen eine eindeutige Zuordnung spricht.',

  // Zielgrößen
  'outcome.metric.sleepQuality': 'Schlafqualität',
  'outcome.metric.sleepOnset': 'Einschlafdauer',
  'outcome.metric.energy': 'Energie im Alltag',
  'outcome.metric.focus': 'Konzentration',
  'outcome.metric.mood': 'Stimmung',
  'outcome.metric.digestion': 'Verdauung',
  'outcome.metric.muscleComplaints': 'Muskelbeschwerden',
  'outcome.metric.recovery': 'Regeneration',
  'outcome.metric.trainingPerformance': 'Trainingsleistung',
  'outcome.metric.skinHairNails': 'Haut, Haare, Nägel',
  'outcome.metric.wellbeing': 'Allgemeines Wohlbefinden',
  'outcome.metric.sideEffects': 'Nebenwirkungen',

  // Anlegen
  'outcome.new.title': 'Neue Beobachtung starten',
  'outcome.new.selectSupplement': 'Welches Präparat?',
  'outcome.new.selectMetric': 'Woran würdest du eine Veränderung merken?',
  'outcome.new.reason': 'Warum nimmst du es?',
  'outcome.new.reasonPlaceholder': 'z. B. schlafe seit Monaten unruhig',
  'outcome.new.baseline': 'Wie ist es aktuell — vor dem Start?',
  'outcome.new.baselineHint':
    'Dieser Ausgangswert ist der wichtigste Eintrag. Rückblickend erinnert man den Zustand vor der Einnahme fast immer schlechter, als er war.',
  'outcome.new.duration': 'Wie lange beobachten?',
  'outcome.new.durationDays': '{days} Tage',
  'outcome.new.start': 'Beobachtung starten',
  'outcome.new.noSupplements':
    'Du hast noch keine aktiven Präparate. Erfasse zuerst eines, dann kannst du es hier beobachten.',
  'outcome.new.missingFields': 'Bitte Präparat, Zielgröße und Ausgangswert angeben.',

  // Skala
  'outcome.scale.veryLow': 'sehr schlecht',
  'outcome.scale.low': 'schlecht',
  'outcome.scale.mid': 'mittel',
  'outcome.scale.high': 'gut',
  'outcome.scale.veryHigh': 'sehr gut',
  'outcome.scale.hintHigherBetter': '1 = sehr schlecht, 5 = sehr gut',
  'outcome.scale.hintLowerBetter': '1 = keine Beschwerden, 5 = starke Beschwerden',

  // Laufende Beobachtungen
  'outcome.running.title': 'Laufende Beobachtungen',
  'outcome.running.empty': 'Noch keine Beobachtung gestartet.',
  'outcome.running.day': 'Tag {current} von {total}',
  'outcome.running.rateToday': 'Wie war es heute?',
  'outcome.running.rated': 'Für heute eingetragen',
  'outcome.baselineWas': 'Ausgangswert: {value}',
  'outcome.currentAverage': 'Zuletzt im Schnitt: {value}',
  'outcome.ratingCount_one': '{count} Bewertung',
  'outcome.ratingCount_other': '{count} Bewertungen',
  'outcome.adherence': 'An {days} von {total} Tagen dokumentiert ({percent} %)',

  // Auswertung
  'outcome.result.title': 'Was sich verändert hat',
  'outcome.result.improved': 'Deine Bewertung liegt jetzt {change} Punkte über dem Ausgangswert.',
  'outcome.result.worsened': 'Deine Bewertung liegt jetzt {change} Punkte unter dem Ausgangswert.',
  'outcome.result.unchanged': 'Deine Bewertung liegt etwa auf dem Ausgangswert.',
  'outcome.result.tooEarly':
    'Für einen Vergleich liegen noch nicht genug Bewertungen vor. Ab {needed} Einträgen wird er angezeigt.',

  // Störfaktoren — der Kern des Ganzen
  'outcome.confounders.title': 'Was gegen eine eindeutige Zuordnung spricht',
  'outcome.confounders.intro':
    'Eine Veränderung kann viele Ursachen haben. Diese Punkte sprechen dagegen, sie dem Präparat zuzuschreiben:',
  'outcome.confounder.parallelTrials_one':
    'Du beobachtest parallel ein weiteres Präparat ({names}). Eine Veränderung lässt sich keinem der beiden eindeutig zuordnen.',
  'outcome.confounder.parallelTrials_other':
    'Du beobachtest parallel {count} weitere Präparate ({names}). Eine Veränderung lässt sich keinem davon eindeutig zuordnen.',
  'outcome.confounder.shortDuration':
    'Der Zeitraum von {days} Tagen ist kurz. Tagesform und Erwartung wirken sich darauf stärker aus als alles andere.',
  'outcome.confounder.fewRatings':
    'Bisher {count} Bewertungen — ab {needed} wird der Verlauf aussagekräftiger.',
  'outcome.confounder.lowAdherence':
    'Die Einnahme ist an {percent} % der Tage dokumentiert. Bei Lücken beobachtest du etwas anderes als eine durchgehende Einnahme.',
  'outcome.confounder.noBaseline':
    'Es wurde kein Ausgangswert festgehalten. Ohne ihn gibt es nichts zu vergleichen.',
  'outcome.confounder.smallChange':
    'Die Veränderung liegt unter einem halben Skalenpunkt — das entspricht normaler Tagesschwankung.',
  'outcome.confounders.none':
    'Keiner der geprüften Störfaktoren liegt vor. Das macht die Beobachtung belastbarer, beweist aber weiterhin keinen ursächlichen Zusammenhang: Jahreszeit, Schlaf, Stress und die Erwartung an das Präparat wirken immer mit.',

  'outcome.disclaimer':
    'Diese Auswertung ist deine eigene Einschätzung im Zeitverlauf, keine Wirksamkeitsmessung. Ob ein Präparat für dich sinnvoll ist, lässt sich daraus nicht ableiten — das gehört in ärztliche oder pharmazeutische Hände.',

  // Entscheidung
  'outcome.due.title': 'Zeit für eine Entscheidung',
  'outcome.due.text':
    'Der von dir gesetzte Zeitraum ist vorbei. Wie möchtest du weiter verfahren?',
  'outcome.due.continue': 'Weiter nehmen',
  'outcome.due.stop': 'Absetzen',
  'outcome.due.unclear': 'Unklar, später entscheiden',
  'outcome.dueBadge': 'Entscheidung offen',

  // Abgeschlossene
  'outcome.finished.title': 'Abgeschlossen',
  'outcome.finished.continue': 'Weitergenommen',
  'outcome.finished.stop': 'Abgesetzt',
  'outcome.finished.unclear': 'Unklar geblieben',
  'outcome.delete': 'Beobachtung löschen',
  'outcome.deleteConfirm.title': 'Beobachtung löschen?',
  'outcome.deleteConfirm.message': 'Alle Bewertungen dazu werden entfernt.',
};
