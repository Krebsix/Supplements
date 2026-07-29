// Findet und fuehrt alle *.test.mjs in diesem Ordner aus.
// Buendelt jede Datei einzeln mit esbuild (noetig, weil die Fachlogik-
// Module ohne Dateiendungen importieren -- Metro-Konvention, die Node
// ohne Bundling nicht aufloest).
//
// execFileSync statt execSync: Dateinamen landen nie in einem
// Shell-String, sondern als Argument-Array -- keine Shell-Interpretation
// noetig oder moeglich.
import { execFileSync } from 'node:child_process';
import { readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const testsDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.join(testsDir, '..');
const cacheDir = path.join(repoRoot, 'node_modules', '.cache');
const esbuildBin = path.join(
  repoRoot,
  'node_modules',
  '.bin',
  process.platform === 'win32' ? 'esbuild.cmd' : 'esbuild'
);
const files = readdirSync(testsDir)
  .filter((file) => file.endsWith('.test.mjs'))
  .sort();

let hadFailure = false;

for (const file of files) {
  const src = path.join(testsDir, file);
  const out = path.join(cacheDir, file);
  console.log(`\n=== ${file} ===`);

  try {
    execFileSync(
      esbuildBin,
      [src, '--bundle', '--platform=node', '--format=esm', `--outfile=${out}`, '--log-level=error'],
      { stdio: 'inherit' }
    );
    execFileSync(process.execPath, [out], { stdio: 'inherit' });
  } catch {
    hadFailure = true;
  }
}

if (files.length === 0) {
  console.log('Keine Testdateien (*.test.mjs) gefunden.');
}

process.exit(hadFailure ? 1 : 0);
