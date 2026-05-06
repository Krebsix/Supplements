const mockScanResult = {
  productName: 'Sleep Hero Complex',
  brand: 'Demo Brand',
  confidence: 82,
  detectedIngredients: [
    'Magnesiumbisglycinat',
    'Glycin',
    'L-Tryptophan',
    'Vitamin B6'
  ],
  warnings: [
    'Produktname und Wirkstoffe müssen getrennt bewertet werden.',
    'L-Tryptophan sollte bei SSRI/Antidepressiva besonders vorsichtig geprüft werden.',
    'Die exakte Dosierung wurde im Demo-Ergebnis noch nicht validiert.'
  ],
  timingSuggestion: 'Abends 30–60 Minuten vor dem Schlafen prüfen. Nicht blind übernehmen, solange Dosierung und Wechselwirkungen nicht bestätigt sind.',
  uncertaintyNote: 'Demo-Analyse: Kein medizinischer Rat. Die echte Version muss Wirkstoffe, Synonyme, Dosierungen und Quellen systematisch validieren.'
};

export default mockScanResult;
