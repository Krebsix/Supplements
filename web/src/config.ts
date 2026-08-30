/**
 * Zentrale Konfiguration der Website.
 *
 * PUBLIC_LOOPS_FORM_ID kommt aus der Umgebung (Vercel-Env oder .env). Ist
 * sie leer, rendert das Beta-Formular deaktiviert mit Hinweis statt eines
 * toten Knopfs. Loops-Formulare sind oeffentliche Endpoints, die ID ist
 * kein Geheimnis.
 */
export const SITE_URL = 'https://mysuplea.com';
export const SITE_NAME = 'MySuplea';
export const OPERATOR_NAME = 'indoo home LLC';
export const CONTACT_EMAIL = 'hello@mysuplea.com';

const formId = import.meta.env.PUBLIC_LOOPS_FORM_ID;
export const LOOPS_FORM_ID: string = typeof formId === 'string' ? formId.trim() : '';
export const LOOPS_ENDPOINT = LOOPS_FORM_ID
  ? `https://app.loops.so/api/newsletter-form/${LOOPS_FORM_ID}`
  : '';
