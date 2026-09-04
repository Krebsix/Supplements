// Rechnerischer Kontrast-Check (WCAG 2.1, relative Luminanz) fuer die
// Markenfarben aus theme.js. Verhindert, dass eine kuenftige Farbaenderung
// unter die Bedienregeln-Grenze rutscht, ohne dass es jemand bemerkt.
import { colors } from '../theme';

let failures = 0;
function check(name, condition, extra = '') {
  if (condition) console.log(`  ok   ${name}`);
  else { failures += 1; console.error(`  FAIL ${name} ${extra}`); }
}

function toLinear(channel) {
  const c = channel / 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function luminance(hex) {
  const n = parseInt(hex.replace('#', ''), 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

export function contrastRatio(hexA, hexB) {
  const lumA = luminance(hexA);
  const lumB = luminance(hexB);
  const [lighter, darker] = lumA > lumB ? [lumA, lumB] : [lumB, lumA];
  return (lighter + 0.05) / (darker + 0.05);
}

console.log('— Markenfarbe Kontrast (WCAG AA) —');
check(
  'Akzent auf canvas mindestens 4.5:1 (Fliesstext)',
  contrastRatio(colors.accent, colors.canvas) >= 4.5,
  `war ${contrastRatio(colors.accent, colors.canvas).toFixed(2)}:1`
);
check(
  'Akzent auf surface (Weiss) mindestens 4.5:1',
  contrastRatio(colors.accent, colors.surface) >= 4.5,
  `war ${contrastRatio(colors.accent, colors.surface).toFixed(2)}:1`
);
check(
  'accentInk auf surface mindestens 4.5:1 (dunkler Ton als Text)',
  contrastRatio(colors.accentInk, colors.surface) >= 4.5,
  `war ${contrastRatio(colors.accentInk, colors.surface).toFixed(2)}:1`
);

if (failures > 0) {
  console.error(`\n${failures} Fehler`);
  process.exit(1);
}
console.log('\nAlle Kontrast-Tests bestanden.');
