/**
 * scripts/legalSiteTemplate.mjs
 * Render-Funktionen fuer die statischen Rechtsseiten (Datenschutz-URL,
 * Pflichtfeld im App Store und bei Google Play).
 *
 * Einzige Inhaltsquelle ist data/legalContent.js: Die Seiten werden
 * GENERIERT, nie von Hand editiert. Wer den Rechtstext aendert, aendert
 * ihn dort und fuehrt `npm run build:legal` aus; tests/legal-site.test.mjs
 * schlaegt fehl, wenn die committeten Seiten hinter der Quelle zurueckbleiben.
 *
 * Bewusst namensneutral: Die Seiten nennen nur die Betreiberin, damit die
 * URL eine Umbenennung unveraendert uebersteht (Name seit 2026-08-09
 * MySuplea, appInfo.js).
 *
 * Seit 2026-08-30 liegen die Seiten unter web/public/<pfad>/index.html und
 * werden von der Astro-Landingpage (web/) mit ausgeliefert:
 * /datenschutz/, /impressum/, /nutzung/. Die Palette kommt aus
 * web/src/styles/tokens.css, die der Test gegen theme.js prueft.
 */

import {
  PRIVACY_VERSION,
  PRIVACY_SECTIONS,
  IMPRINT_SECTIONS,
  TERMS_VERSION,
  TERMS_SECTIONS,
} from '../data/legalContent.js';

/**
 * Spiegel der Design-Tokens aus theme.js (native iOS-Anmutung seit
 * 2026-08-12). theme.js selbst importiert react-native und laeuft deshalb
 * nicht in Node; der Test prueft stattdessen, dass jeder Wert hier und in
 * web/src/styles/tokens.css woertlich in theme.js steht.
 */
export const WEB_TOKENS = {
  canvas: '#f2f2f7',
  surface: '#ffffff',
  ink: '#1c1c1e',
  inkMuted: '#6c6c70',
  inkFaint: '#8e8e93',
  rule: '#e5e5ea',
  accent: '#1c4f5c',
};

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Zeilenumbrueche in den Rechtstexten (Adressen) bleiben sichtbar.
function bodyHtml(text) {
  return escapeHtml(text).replace(/\n/g, '<br>');
}

function sectionsHtml(sections) {
  return sections
    .map(
      (section) => `      <section>
        <h3>${escapeHtml(section.heading)}</h3>
        <p>${bodyHtml(section.body)}</p>
      </section>`
    )
    .join('\n');
}

/**
 * Gemeinsames Seitengeruest. Kein JavaScript, keine externen Schriften,
 * keine eingebundenen Dienste: Die Datenschutz-Seite selbst setzt kein
 * einziges Cookie und laedt nichts nach, sonst widersprae sie ihrem
 * eigenen Inhalt.
 */
function page({ lang, title, eyebrow, bodyContent }) {
  const t = WEB_TOKENS;
  return `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="index, follow">
<title>${escapeHtml(title)}</title>
<style>
  :root {
    --canvas: ${t.canvas};
    --surface: ${t.surface};
    --ink: ${t.ink};
    --ink-muted: ${t.inkMuted};
    --ink-faint: ${t.inkFaint};
    --rule: ${t.rule};
    --accent: ${t.accent};
  }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    background: var(--canvas);
    color: var(--ink-muted);
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    font-size: 17px;
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
  }
  main {
    max-width: 640px;
    margin: 0 auto;
    padding: 40px 22px 64px;
  }
  .eyebrow {
    font-size: 13px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--accent);
    font-weight: 600;
    margin: 0 0 12px;
  }
  h1, h2, h3 {
    color: var(--ink);
    font-weight: 600;
    letter-spacing: -0.015em;
  }
  h1 { font-size: 32px; line-height: 1.2; margin: 0 0 6px; letter-spacing: -0.025em; font-weight: 700; }
  h2 { font-size: 22px; margin: 44px 0 6px; }
  h3 { font-size: 17px; margin: 24px 0 4px; }
  p { margin: 0 0 10px; }
  a { color: var(--accent); }
  nav {
    margin: 14px 0 0;
    padding: 10px 0;
    border-top: 1px solid var(--rule);
    border-bottom: 1px solid var(--rule);
    font-size: 15px;
  }
  nav a { margin-right: 16px; font-weight: 500; }
  .lang-note {
    font-size: 15px;
    color: var(--ink-faint);
    margin: 2px 0 0;
  }
  footer {
    margin-top: 44px;
    padding-top: 14px;
    border-top: 1px solid var(--rule);
    font-size: 14px;
    color: var(--ink-faint);
  }
</style>
</head>
<body>
<main>
${bodyContent}
</main>
</body>
</html>
`;
}

export function renderPrivacyPage() {
  const bodyContent = `  <p class="eyebrow">Rechtliches · Legal</p>
  <h1>Datenschutzerklärung</h1>
  <p class="lang-note">Privacy Policy, English version below.</p>
  <nav>
    <a href="/">Startseite · Home</a>
    <a href="#de">Deutsch</a>
    <a href="#en">English</a>
    <a href="/impressum/">Impressum</a>
    <a href="/nutzung/">Nutzungsbedingungen</a>
  </nav>
  <div lang="de" id="de">
${sectionsHtml(PRIVACY_SECTIONS.de)}
  </div>
  <div lang="en" id="en">
    <h2>Privacy Policy (English)</h2>
${sectionsHtml(PRIVACY_SECTIONS.en)}
  </div>
  <footer>
    <p>Stand · Version: ${escapeHtml(PRIVACY_VERSION)}</p>
    <p><a href="/impressum/">Impressum · Provider information</a> · <a href="/nutzung/">Nutzungsbedingungen · Terms of use</a></p>
  </footer>`;
  return page({
    lang: 'de',
    title: 'Datenschutzerklärung · Privacy Policy',
    bodyContent,
  });
}

export function renderImprintPage() {
  const bodyContent = `  <p class="eyebrow">Rechtliches · Legal</p>
  <h1>Impressum</h1>
  <p class="lang-note">Provider information, English version below.</p>
  <nav>
    <a href="/">Startseite · Home</a>
    <a href="#de">Deutsch</a>
    <a href="#en">English</a>
    <a href="/datenschutz/">Datenschutzerklärung</a>
    <a href="/nutzung/">Nutzungsbedingungen</a>
  </nav>
  <div lang="de" id="de">
${sectionsHtml(IMPRINT_SECTIONS.de)}
  </div>
  <div lang="en" id="en">
    <h2>Provider information (English)</h2>
${sectionsHtml(IMPRINT_SECTIONS.en)}
  </div>
  <footer>
    <p><a href="/datenschutz/">Datenschutzerklärung · Privacy Policy</a> · <a href="/nutzung/">Nutzungsbedingungen · Terms of use</a></p>
  </footer>`;
  return page({
    lang: 'de',
    title: 'Impressum · Provider information',
    bodyContent,
  });
}

export function renderTermsPage() {
  const bodyContent = `  <p class="eyebrow">Rechtliches · Legal</p>
  <h1>Nutzungsbedingungen</h1>
  <p class="lang-note">Terms of use, English version below.</p>
  <nav>
    <a href="/">Startseite · Home</a>
    <a href="#de">Deutsch</a>
    <a href="#en">English</a>
    <a href="/datenschutz/">Datenschutzerklärung</a>
    <a href="/impressum/">Impressum</a>
  </nav>
  <div lang="de" id="de">
${sectionsHtml(TERMS_SECTIONS.de)}
  </div>
  <div lang="en" id="en">
    <h2>Terms of use (English)</h2>
${sectionsHtml(TERMS_SECTIONS.en)}
  </div>
  <footer>
    <p>Stand · Version: ${escapeHtml(TERMS_VERSION)}</p>
    <p><a href="/datenschutz/">Datenschutzerklärung · Privacy Policy</a> · <a href="/impressum/">Impressum · Provider information</a></p>
  </footer>`;
  return page({
    lang: 'de',
    title: 'Nutzungsbedingungen · Terms of use',
    bodyContent,
  });
}

/** Pfad (relativ zu web/public) → Inhalt. Store-Datenschutz-URL ist
 *  https://mysuplea.com/datenschutz/ . */
export function renderSite() {
  return {
    'datenschutz/index.html': renderPrivacyPage(),
    'impressum/index.html': renderImprintPage(),
    'nutzung/index.html': renderTermsPage(),
  };
}
