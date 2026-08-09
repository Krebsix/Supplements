// Tests fuer die statischen Rechtsseiten (scripts/legalSiteTemplate.mjs).
//
// Drift-Schutz in drei Richtungen:
//   1. Die committeten Dateien in web/ muessen exakt dem entsprechen, was
//      der aktuelle Stand von data/legalContent.js rendert. Wer den
//      Rechtstext aendert, ohne `npm run build:legal` auszufuehren,
//      veroeffentlicht sonst still einen veralteten Stand.
//   2. Die Web-Farbwerte muessen woertlich in theme.js stehen, damit die
//      Seite nicht optisch von der App wegdriftet (theme.js selbst ist
//      wegen des react-native-Imports in Node nicht ladbar).
//   3. Inhaltliche Vollstaendigkeit: jede Ueberschrift aus beiden Sprachen
//      und die PRIVACY_VERSION erscheinen auf der Seite.

import { readFileSync } from 'node:fs';
import path from 'node:path';
import { renderSite, WEB_TOKENS } from '../scripts/legalSiteTemplate.mjs';
import {
  PRIVACY_VERSION,
  PRIVACY_SECTIONS,
  IMPRINT_SECTIONS,
} from '../data/legalContent';

let failures = 0;

function check(name, condition, extra = '') {
  if (condition) {
    console.log(`  ok   ${name}`);
  } else {
    failures += 1;
    console.error(`  FAIL ${name} ${extra}`);
  }
}

// npm test laeuft aus dem Repo-Root; das Bundle liegt in node_modules/.cache,
// deshalb ist cwd der verlaessliche Anker.
const repoRoot = process.cwd();
const site = renderSite();

console.log('— Committete Seiten aktuell —');
for (const [fileName, expected] of Object.entries(site)) {
  let onDisk = null;
  try {
    onDisk = readFileSync(path.join(repoRoot, 'web', fileName), 'utf8');
  } catch {
    onDisk = null;
  }
  check(
    `web/${fileName} entspricht data/legalContent.js`,
    onDisk === expected,
    '(npm run build:legal ausfuehren und web/ mitcommitten)'
  );
}

console.log('— Palette bleibt bei theme.js —');
const themeSource = readFileSync(path.join(repoRoot, 'theme.js'), 'utf8');
for (const [token, hex] of Object.entries(WEB_TOKENS)) {
  check(`Token ${token} (${hex}) steht woertlich in theme.js`, themeSource.includes(hex));
}

console.log('— Inhaltliche Vollstaendigkeit —');
const privacy = site['index.html'];
const imprint = site['imprint.html'];
check('PRIVACY_VERSION erscheint auf der Datenschutz-Seite', privacy.includes(PRIVACY_VERSION));
for (const lang of ['de', 'en']) {
  for (const section of PRIVACY_SECTIONS[lang]) {
    check(`Datenschutz ${lang}: "${section.heading}"`, privacy.includes(`<h3>${section.heading}</h3>`));
  }
  for (const section of IMPRINT_SECTIONS[lang]) {
    check(`Impressum ${lang}: "${section.heading}"`, imprint.includes(`<h3>${section.heading}</h3>`));
  }
}

console.log('— Formregeln —');
for (const [fileName, html] of Object.entries(site)) {
  check(`web/${fileName} ohne Gedankenstrich`, !html.includes('—'));
  check(
    `web/${fileName} laedt nichts nach (kein http-Verweis, kein Script)`,
    !/\bsrc=|<script|https?:\/\//.test(html)
  );
}
check(
  'Seiten sind namensneutral (bewusst: die URL uebersteht jede Umbenennung)',
  !privacy.includes('Supplement OS') &&
    !imprint.includes('Supplement OS') &&
    !privacy.includes('MySuplea') &&
    !imprint.includes('MySuplea')
);

if (failures > 0) {
  console.error(`\n${failures} Fehlschlaege`);
  process.exit(1);
}
console.log('\nAlle Rechtsseiten-Tests bestanden.');
