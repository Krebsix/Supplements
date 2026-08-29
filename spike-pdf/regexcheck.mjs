// Die Regex aus dem Plan (Task 3) gegen den rekonstruierten Text
const zeilen = [
  'Laborbefund vom 05.08.2026',
  'Ferritin 45 ng/ml 30 - 300',
  '25-OH-Vitamin D 18,4 ng/ml 30 - 70',
  'TSH 2,1 mU/l 0,4 - 4,0',
];
const RE = /^([A-Za-zÄÖÜäöüß0-9().\-\s]*?[A-Za-zÄÖÜäöüß)])\s+(\d+(?:[.,]\d+)?)\s*([A-Za-zµ%/]+(?:\/[A-Za-zµ]+)?)?\s*(.*)$/;
const IGNORE = [/befund/i, /praxis/i, /labor(?!wert)/i, /stra(ss|ß)e/i, /^\d{5}\s/, /patient/i, /geb\./i, /telefon/i, /seite \d/i];

for (const z of zeilen) {
  if (IGNORE.some((p) => p.test(z))) { console.log(`IGNORIERT: ${z}`); continue; }
  const m = z.match(RE);
  if (!m) { console.log(`KEIN TREFFER: ${z}`); continue; }
  console.log(JSON.stringify({ name: m[1], wert: m[2], einheit: m[3], rest: m[4] }));
}
