/**
 * scripts/scan-quality-test.mjs
 * Haiku-Qualitaetstest fuer die Scan-Analyse (Decision 2026-08-09).
 *
 * Schickt jedes Foto eines Ordners zweimal an die Edge Function:
 * einmal mit dem Produktiv-Default (ANALYZE_MODEL-Secret, aktuell Opus)
 * und einmal mit dem Haiku-Override. Schreibt eine Vergleichstabelle
 * als Markdown, die neben den echten Etiketten ausgewertet wird.
 *
 * Aufruf:
 *   node scripts/scan-quality-test.mjs <foto-ordner> [bericht.md]
 *
 * Erwartet JPEG/PNG/WebP. HEIC (iPhone-Standard) wird auf macOS
 * automatisch per `sips` nach JPEG konvertiert und auf 1600 px
 * verkleinert — dieselbe Groessenordnung wie der App-Downscale.
 *
 * Kostenrahmen: 10 Fotos x 2 Modelle = 20 Aufrufe. Das serverseitige
 * Rate-Limit liegt bei 20 Aufrufen pro Stunde und IP — ein kompletter
 * Lauf passt genau einmal pro Stunde. Bei 429 bricht das Script sauber
 * ab und nennt die Wartezeit; bereits erhobene Ergebnisse bleiben im
 * Bericht.
 *
 * Auswertung (Kill-Kriterium bis 2026-08-16): Unter 50 % korrekt
 * erkannter Substanz+Dosis bei Haiku ist die Umstellung tot. "Korrekt"
 * beurteilt ein Mensch gegen das echte Etikett — das Script liefert nur
 * die Gegenueberstellung, kein Urteil.
 */
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { SCAN_ANALYZE_URL, SUPABASE_ANON_KEY } from '../scanConfig.js';

const HAIKU_MODEL = 'claude-haiku-4-5';
const MAX_DIMENSION = 1600;

const [, , photoDir, reportArg] = process.argv;
if (!photoDir) {
  console.error('Aufruf: node scripts/scan-quality-test.mjs <foto-ordner> [bericht.md]');
  process.exit(1);
}
const reportPath = reportArg ?? path.join(photoDir, 'scan-quality-report.md');

const MEDIA_TYPES = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp' };
const CONVERTIBLE = new Set(['.heic', '.heif', '.tiff']);

/** Liefert { mediaType, base64 } — konvertiert HEIC/uebergrosse Bilder via sips (macOS). */
function loadImage(filePath, workDir) {
  const ext = path.extname(filePath).toLowerCase();
  let sourcePath = filePath;
  let mediaType = MEDIA_TYPES[ext];

  const needsConvert =
    CONVERTIBLE.has(ext) || (mediaType && readFileSync(filePath).length > 3_500_000);
  if (!mediaType && !CONVERTIBLE.has(ext)) return null;

  if (needsConvert) {
    if (process.platform !== 'darwin') {
      throw new Error(`${path.basename(filePath)}: Konvertierung braucht macOS (sips). Bitte als JPEG unter 3,5 MB liefern.`);
    }
    const outPath = path.join(workDir, `${path.basename(filePath, ext)}.jpg`);
    execFileSync('sips', ['-s', 'format', 'jpeg', '-Z', String(MAX_DIMENSION), filePath, '--out', outPath], { stdio: 'pipe' });
    sourcePath = outPath;
    mediaType = 'image/jpeg';
  }

  return { mediaType, base64: readFileSync(sourcePath).toString('base64') };
}

async function analyze(image, model) {
  const body = {
    language: 'de',
    images: [{ step: 'ingredients', mediaType: image.mediaType, data: image.base64 }],
  };
  if (model) body.model = model;

  const response = await fetch(SCAN_ANALYZE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify(body),
  });

  const payload = await response.json().catch(() => ({}));
  if (response.status === 429) return { rateLimited: true };
  if (!response.ok) return { error: payload?.error ?? `HTTP ${response.status}` };
  return payload;
}

function describeIngredients(result) {
  const list = result?.ingredients ?? [];
  if (list.length === 0) return '(keine erkannt)';
  return list
    .map((entry) => {
      const form = entry.form ? ` (${entry.form})` : '';
      const amount = entry.amount ? ` ${entry.amount}${entry.unit ? ` ${entry.unit}` : ''}` : ' [Menge fehlt]';
      return `${entry.name}${form}:${amount}`;
    })
    .join('<br>');
}

const files = readdirSync(photoDir)
  .filter((file) => MEDIA_TYPES[path.extname(file).toLowerCase()] || CONVERTIBLE.has(path.extname(file).toLowerCase()))
  .sort();

if (files.length === 0) {
  console.error(`Keine Bilder in ${photoDir} gefunden (jpg/png/webp/heic).`);
  process.exit(1);
}
console.log(`${files.length} Fotos, ${files.length * 2} Aufrufe (Rate-Limit: 20/Stunde).`);

const workDir = mkdtempSync(path.join(tmpdir(), 'scan-test-'));
const rows = [];
let aborted = false;

for (const file of files) {
  if (aborted) break;
  const image = loadImage(path.join(photoDir, file), workDir);
  if (!image) continue;

  const row = { file };
  for (const [label, model] of [['default', null], ['haiku', HAIKU_MODEL]]) {
    process.stdout.write(`${file} → ${label} ... `);
    const outcome = await analyze(image, model);
    if (outcome.rateLimited) {
      console.log('RATE-LIMIT — Abbruch, in einer Stunde fortsetzen.');
      aborted = true;
      break;
    }
    row[label] = outcome;
    console.log(outcome.error ? `FEHLER: ${outcome.error}` : `ok (${outcome.model}, ${outcome.usage?.outputTokens ?? '?'} Tokens)`);
  }
  rows.push(row);
}

const lines = [
  '# Scan-Qualitaetsvergleich: Produktiv-Default vs. Haiku',
  '',
  `Stand: ${new Date().toISOString().slice(0, 10)} · ${rows.length} von ${files.length} Fotos ausgewertet${aborted ? ' (Rate-Limit, Rest offen)' : ''}`,
  '',
  'Beurteilung gegen das ECHTE Etikett vornehmen: Eine Zeile gilt als korrekt,',
  'wenn Substanzname UND Menge stimmen. Kill-Kriterium (Council 2026-08-09):',
  'unter 50 % korrekte Zeilen bei Haiku bis 2026-08-16 → Umstellung tot.',
  '',
];

for (const row of rows) {
  lines.push(`## ${row.file}`, '');
  lines.push('| | Default | Haiku |');
  lines.push('|---|---|---|');
  const d = row.default ?? {};
  const h = row.haiku ?? {};
  lines.push(`| Modell | ${d.model ?? d.error ?? '-'} | ${h.model ?? h.error ?? '-'} |`);
  lines.push(`| Produkt | ${d.result?.productName ?? '-'} | ${h.result?.productName ?? '-'} |`);
  lines.push(`| Konfidenz | ${d.result?.confidence ?? '-'} | ${h.result?.confidence ?? '-'} |`);
  lines.push(`| Wirkstoffe | ${describeIngredients(d.result)} | ${describeIngredients(h.result)} |`);
  lines.push(`| Unsicherheiten | ${(d.result?.uncertainties ?? []).join('; ') || '-'} | ${(h.result?.uncertainties ?? []).join('; ') || '-'} |`);
  lines.push(`| Output-Tokens | ${d.usage?.outputTokens ?? '-'} | ${h.usage?.outputTokens ?? '-'} |`);
  lines.push('');
}

writeFileSync(reportPath, lines.join('\n'));
console.log(`\nBericht: ${reportPath}`);
