// Tests fuer die statischen Rechtsseiten (scripts/legalSiteTemplate.mjs).
//
// Drift-Schutz in drei Richtungen:
//   1. Die committeten Dateien in web/public/ muessen exakt dem entsprechen, was
//      der aktuelle Stand von data/legalContent.js rendert. Wer den
//      Rechtstext aendert, ohne `npm run build:legal` auszufuehren,
//      veroeffentlicht sonst still einen veralteten Stand.
//   2. Die Web-Farbwerte (Template UND web/src/styles/tokens.css der
//      Landingpage) muessen woertlich in theme.js stehen, damit die Seiten
//      nicht optisch von der App wegdriften (theme.js selbst ist wegen des
//      react-native-Imports in Node nicht ladbar).
//   3. Inhaltliche Vollstaendigkeit: jede Ueberschrift aus beiden Sprachen
//      und die PRIVACY_VERSION erscheinen auf der Seite.

import { readFileSync } from 'node:fs';
import path from 'node:path';
import { renderSite, WEB_TOKENS } from '../scripts/legalSiteTemplate.mjs';
import {
  PRIVACY_VERSION,
  PRIVACY_SECTIONS,
  IMPRINT_SECTIONS,
  TERMS_VERSION,
  TERMS_SECTIONS,
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
    onDisk = readFileSync(path.join(repoRoot, 'web', 'public', fileName), 'utf8');
  } catch {
    onDisk = null;
  }
  check(
    `web/public/${fileName} entspricht data/legalContent.js`,
    onDisk === expected,
    '(npm run build:legal ausfuehren und web/public/ mitcommitten)'
  );
}

console.log('— Palette bleibt bei theme.js —');
const themeSource = readFileSync(path.join(repoRoot, 'theme.js'), 'utf8');
for (const [token, hex] of Object.entries(WEB_TOKENS)) {
  check(`Token ${token} (${hex}) steht woertlich in theme.js`, themeSource.includes(hex));
}
// Die Landingpage (web/) hat seit dem Redesign 2026-08-30 eine eigene
// Bildsprache ("Evidenz-Dossier", design_handoff_mysuplea_landing/) und
// ist bewusst NICHT mehr an theme.js gekoppelt. web/src/styles/tokens.css
// hat deshalb keine eigene Pruefung gegen theme.js mehr; die Rechtsseiten
// oben bleiben unveraendert bei ihren WEB_TOKENS.

console.log('— Inhaltliche Vollstaendigkeit —');
const privacy = site['datenschutz/index.html'];
const imprint = site['impressum/index.html'];
const terms = site['nutzung/index.html'];
check('PRIVACY_VERSION erscheint auf der Datenschutz-Seite', privacy.includes(PRIVACY_VERSION));
check('TERMS_VERSION erscheint auf der Nutzungsbedingungen-Seite', terms.includes(TERMS_VERSION));
for (const lang of ['de', 'en']) {
  for (const section of PRIVACY_SECTIONS[lang]) {
    check(`Datenschutz ${lang}: "${section.heading}"`, privacy.includes(`<h3>${section.heading}</h3>`));
  }
  for (const section of IMPRINT_SECTIONS[lang]) {
    check(`Impressum ${lang}: "${section.heading}"`, imprint.includes(`<h3>${section.heading}</h3>`));
  }
  for (const section of TERMS_SECTIONS[lang]) {
    check(`Nutzungsbedingungen ${lang}: "${section.heading}"`, terms.includes(`<h3>${section.heading}</h3>`));
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
    !terms.includes('Supplement OS') &&
    !privacy.includes('MySuplea') &&
    !imprint.includes('MySuplea') &&
    !terms.includes('MySuplea')
);

if (failures > 0) {
  console.error(`\n${failures} Fehlschlaege`);
  process.exit(1);
}
console.log('\nAlle Rechtsseiten-Tests bestanden.');
