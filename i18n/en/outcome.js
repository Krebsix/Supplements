/**
 * i18n/en/outcome.js
 * Outcome tracking (app/outcome.jsx, OutcomeTracker.js).
 *
 * Wording rule, central here: the app puts the observation next to the
 * circumstances. It never says "X worked" and never says "keep taking it"
 * — not even softened ("seems to help"), which is the same claim with a
 * blur filter.
 *
 * Allowed: "your rating has gone up". Not allowed: "the supplement
 * improved your rating".
 */

export default {
  'outcome.kicker': 'Outcome tracking',
  'outcome.title': 'Is it actually doing anything for you?',
  'outcome.subtitle':
    'Record why you take a product, what the starting point was, and what changes over time. The app does not flatter the result, it shows you what argues against attributing the change to the product.',

  // Metrics
  'outcome.metric.sleepQuality': 'Sleep quality',
  'outcome.metric.sleepOnset': 'Time to fall asleep',
  'outcome.metric.energy': 'Everyday energy',
  'outcome.metric.focus': 'Focus',
  'outcome.metric.mood': 'Mood',
  'outcome.metric.digestion': 'Digestion',
  'outcome.metric.muscleComplaints': 'Muscle complaints',
  'outcome.metric.recovery': 'Recovery',
  'outcome.metric.trainingPerformance': 'Training performance',
  'outcome.metric.skinHairNails': 'Skin, hair, nails',
  'outcome.metric.wellbeing': 'General wellbeing',
  'outcome.metric.sideEffects': 'Side effects',

  // Creating
  'outcome.new.title': 'Start a new observation',
  'outcome.new.selectSupplement': 'Which product?',
  'outcome.new.selectMetric': 'What would you notice a change in?',
  'outcome.new.reason': 'Why are you taking it?',
  'outcome.new.reasonPlaceholder': 'e.g. sleeping restlessly for months',
  'outcome.new.baseline': 'How is it right now, before you start?',
  'outcome.new.baselineHint':
    'This starting value is the most important entry. In hindsight people almost always remember the state before taking something as worse than it was.',
  'outcome.new.duration': 'How long do you want to observe?',
  'outcome.new.durationDays': '{days} days',
  'outcome.new.start': 'Start observation',
  'outcome.new.noSupplements':
    'You have no active products yet. Add one first, then you can observe it here.',
  'outcome.new.missingFields': 'Please pick a product, a metric and a starting value.',

  // Scale
  'outcome.scale.veryLow': 'very poor',
  'outcome.scale.low': 'poor',
  'outcome.scale.mid': 'medium',
  'outcome.scale.high': 'good',
  'outcome.scale.veryHigh': 'very good',
  'outcome.scale.hintHigherBetter': '1 = very poor, 5 = very good',
  'outcome.scale.hintLowerBetter': '1 = no complaints, 5 = strong complaints',

  // Running
  'outcome.running.title': 'Running observations',
  'outcome.running.empty': 'No observation started yet.',
  'outcome.running.day': 'Day {current} of {total}',
  'outcome.running.rateToday': 'How was it today?',
  'outcome.running.rated': 'Recorded for today',
  'outcome.baselineWas': 'Starting value: {value}',
  'outcome.currentAverage': 'Recent average: {value}',
  'outcome.ratingCount_one': '{count} rating',
  'outcome.ratingCount_other': '{count} ratings',
  'outcome.adherence': 'Recorded on {days} of {total} days ({percent} %)',

  // Result
  'outcome.result.title': 'What has changed',
  'outcome.result.improved': 'Your rating is now {change} points above the starting value.',
  'outcome.result.worsened': 'Your rating is now {change} points below the starting value.',
  'outcome.result.unchanged': 'Your rating is roughly at the starting value.',
  'outcome.result.tooEarly':
    'There are not enough ratings yet for a comparison. It appears from {needed} entries onwards.',

  // Confounders — the heart of the feature
  'outcome.confounders.title': 'What argues against a clear attribution',
  'outcome.confounders.intro':
    'A change can have many causes. These points argue against attributing it to the product:',
  'outcome.confounder.parallelTrials_one':
    'You are observing another product at the same time ({names}). A change cannot be clearly attributed to either.',
  'outcome.confounder.parallelTrials_other':
    'You are observing {count} other products at the same time ({names}). A change cannot be clearly attributed to any of them.',
  'outcome.confounder.shortDuration':
    'A period of {days} days is short. Day-to-day variation and expectation affect it more than anything else.',
  'outcome.confounder.fewRatings':
    '{count} ratings so far. From {needed} onwards the trend becomes more meaningful.',
  'outcome.confounder.lowAdherence':
    'Intake is recorded on {percent} % of days. With gaps, you are observing something other than continuous use.',
  'outcome.confounder.noBaseline':
    'No starting value was recorded. Without it there is nothing to compare against.',
  'outcome.confounder.smallChange':
    'The change is less than half a scale point, which is within normal day-to-day variation.',
  'outcome.confounders.none':
    'None of the checked confounders apply. That makes the observation more solid, but still proves no causal link: season, sleep, stress and your own expectation always play a part.',

  'outcome.disclaimer':
    'This evaluation is your own assessment over time, not a measurement of efficacy. Whether a product makes sense for you cannot be derived from it. That belongs with a doctor or pharmacist.',

  // Decision
  'outcome.due.title': 'Time for a decision',
  'outcome.due.text': 'The period you set has ended. How do you want to proceed?',
  'outcome.due.continue': 'Keep taking it',
  'outcome.due.stop': 'Stop taking it',
  'outcome.due.unclear': 'Unclear, decide later',
  'outcome.dueBadge': 'Decision pending',

  // Finished
  'outcome.finished.title': 'Finished',
  'outcome.finished.continue': 'Continued',
  'outcome.finished.stop': 'Stopped',
  'outcome.finished.unclear': 'Remained unclear',
  'outcome.delete': 'Delete observation',
  'outcome.deleteConfirm.title': 'Delete observation?',
  'outcome.deleteConfirm.message': 'All ratings for it will be removed.',
};
