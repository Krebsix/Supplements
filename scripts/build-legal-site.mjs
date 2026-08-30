/**
 * scripts/build-legal-site.mjs
 * Generiert die statischen Rechtsseiten (web/public/) aus data/legalContent.js.
 * Die Astro-Landingpage in web/ liefert sie unter /datenschutz/, /impressum/
 * und /nutzung/ mit aus.
 *
 * Aufruf: npm run build:legal
 *
 * Buendelt das Template mit esbuild, weil legalContent.js ohne
 * "type": "module" laeuft und die Fachlogik-Konventionen des Repos nutzt
 * (gleiche Begruendung wie tests/run.mjs). Das gebuendelte Modul wird
 * ueber eine data:-URL importiert, damit kein Temp-File noetig ist.
 */
import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const esbuild = require('esbuild');

const repoRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const templatePath = path.join(repoRoot, 'scripts', 'legalSiteTemplate.mjs');
const outDir = path.join(repoRoot, 'web', 'public');

const bundled = esbuild.buildSync({
  entryPoints: [templatePath],
  bundle: true,
  platform: 'node',
  format: 'esm',
  write: false,
  logLevel: 'error',
});
const code = Buffer.from(bundled.outputFiles[0].contents).toString('base64');
const { renderSite } = await import(`data:text/javascript;base64,${code}`);

mkdirSync(outDir, { recursive: true });

const site = renderSite();
for (const [fileName, html] of Object.entries(site)) {
  const target = path.join(outDir, fileName);
  mkdirSync(path.dirname(target), { recursive: true });
  writeFileSync(target, html);
  console.log(`web/public/${fileName} geschrieben (${html.length} Zeichen)`);
}

// Offene Platzhalter sichtbar machen: Die Seite darf so gebaut, aber
// nicht veroeffentlicht werden, solange Pflichtangaben fehlen.
const placeholders = Object.values(site)
  .join('')
  .match(/\[[^\]]*einsetzen\]/g);
if (placeholders) {
  console.warn(
    `\nWARNUNG: ${placeholders.length} Platzhalter offen, vor Veroeffentlichung fuellen (data/legalContent.js):`
  );
  for (const p of [...new Set(placeholders)]) console.warn(`  ${p}`);
}
