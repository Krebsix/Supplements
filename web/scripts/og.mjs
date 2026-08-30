/**
 * scripts/og.mjs
 * Erzeugt die Open-Graph-Bilder (1200x630) je Sprache aus dem App-Icon und
 * der Headline des Woerterbuchs. Aufruf: npm run og (in web/).
 *
 * Laeuft lokal, das Ergebnis wird committet (public/og/<lang>.png). So
 * braucht der Vercel-Build weder sharp noch Schriften.
 *
 * Schrift: Helvetica ist auf macOS sicher vorhanden und liegt nah an der
 * Systemschrift der Seite. Zeilenumbruch von Hand, weil SVG-Text nicht
 * umbricht.
 */
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { de } from '../src/i18n/de.ts';
import { en } from '../src/i18n/en.ts';

const here = path.dirname(fileURLToPath(import.meta.url));
const iconPath = path.join(here, '..', '..', 'assets', 'icon.png');
const outDir = path.join(here, '..', 'public', 'og');

// Palette wie tokens.css (der Test im Repo-Root prueft tokens.css gegen
// theme.js; hier stehen dieselben Werte).
// Palette wie web/src/styles/tokens.css (Redesign "Evidenz-Dossier", 2026-08-30).
const CANVAS = '#ffffff';
const INK = '#0b2239';
const ACCENT = '#1e6fd9';
const INK_MUTED = '#8a99a9';

const WIDTH = 1200;
const HEIGHT = 630;
const ICON_SIZE = 220;
const PAD = 84;

function escapeXml(text) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// Bricht die Headline in Zeilen von maximal `max` Zeichen um, an Leerzeichen.
function wrap(text, max) {
  const words = text.split(' ');
  const lines = [];
  let line = '';
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > max && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function svgFor(headline, tagline) {
  const lines = wrap(headline, 26);
  const fontSize = lines.length > 2 ? 52 : 58;
  const lineHeight = Math.round(fontSize * 1.12);
  const textX = PAD + ICON_SIZE + 56;
  const blockHeight = lines.length * lineHeight;
  const startY = Math.round(HEIGHT / 2 - blockHeight / 2 + fontSize * 0.8);
  const tspans = lines
    .map((line, i) => `<tspan x="${textX}" y="${startY + i * lineHeight}">${escapeXml(line)}</tspan>`)
    .join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}">
  <rect width="${WIDTH}" height="${HEIGHT}" fill="${CANVAS}"/>
  <text font-family="Helvetica Neue, Helvetica, Arial, sans-serif" font-weight="700" font-size="${fontSize}" fill="${INK}" letter-spacing="-1.5">${tspans}</text>
  <text x="${textX}" y="${startY + blockHeight + 18}" font-family="Helvetica Neue, Helvetica, Arial, sans-serif" font-weight="600" font-size="26" fill="${ACCENT}">${escapeXml(tagline)}</text>
  <text x="${WIDTH - PAD}" y="${HEIGHT - 44}" text-anchor="end" font-family="Helvetica Neue, Helvetica, Arial, sans-serif" font-size="22" fill="${INK_MUTED}">mysuplea.com</text>
</svg>`;
}

async function render(lang, dict) {
  const icon = await sharp(iconPath)
    .resize(ICON_SIZE, ICON_SIZE)
    .composite([
      {
        // Abgerundete Ecken wie ein App-Icon (Radius rund 22 %).
        input: Buffer.from(
          `<svg width="${ICON_SIZE}" height="${ICON_SIZE}"><rect width="${ICON_SIZE}" height="${ICON_SIZE}" rx="${Math.round(ICON_SIZE * 0.22)}" fill="#000"/></svg>`
        ),
        blend: 'dest-in',
      },
    ])
    .png()
    .toBuffer();

  const svg = Buffer.from(svgFor(dict.meta.ogHeadline, 'MySuplea'));
  const out = path.join(outDir, `${lang}.png`);
  await sharp({ create: { width: WIDTH, height: HEIGHT, channels: 4, background: CANVAS } })
    .composite([
      { input: svg, top: 0, left: 0 },
      { input: icon, top: Math.round(HEIGHT / 2 - ICON_SIZE / 2), left: PAD },
    ])
    .png({ compressionLevel: 9 })
    .toFile(out);
  console.log(`geschrieben: ${path.relative(process.cwd(), out)}`);
}

mkdirSync(outDir, { recursive: true });
await render('de', de);
await render('en', en);
