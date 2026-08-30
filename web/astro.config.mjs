import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Statisches Output, kein Adapter: Vercel liefert dist/ als Dateien aus.
// Deutsch ist die Default-Sprache ohne Praefix (/), Englisch liegt unter /en/.
// Eine dritte Sprache: hier in locales eintragen, Woerterbuch in src/i18n/
// anlegen und in src/i18n/index.ts registrieren. Sonst nichts.
export default defineConfig({
  site: 'https://mysuplea.com',
  output: 'static',
  trailingSlash: 'always',
  build: { format: 'directory' },
  i18n: {
    defaultLocale: 'de',
    locales: ['de', 'en'],
    routing: { prefixDefaultLocale: false },
  },
  integrations: [
    sitemap({
      i18n: { defaultLocale: 'de', locales: { de: 'de', en: 'en' } },
      // Die generierten Rechtsseiten liegen in public/ und tauchen deshalb
      // nicht automatisch in der Sitemap auf.
      customPages: [
        'https://mysuplea.com/datenschutz/',
        'https://mysuplea.com/impressum/',
        'https://mysuplea.com/nutzung/',
      ],
    }),
  ],
});
