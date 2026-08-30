/**
 * Zentrale Konfiguration der Website.
 *
 * Die Beta-Anmeldung geht an die Supabase Edge Function beta-signup
 * (supabase/functions/beta-signup). Die URL ist oeffentlich, wie in
 * scanConfig.js der App; PUBLIC_BETA_SIGNUP_URL in der Umgebung
 * ueberschreibt sie (lokal z. B. auf `supabase functions serve`). Leerer
 * String schaltet das Formular ab: Es rendert dann deaktiviert mit
 * Hinweis statt eines toten Knopfs.
 */
export const SITE_URL = 'https://mysuplea.com';
export const SITE_NAME = 'MySuplea';
export const OPERATOR_NAME = 'indoo home LLC';
export const CONTACT_EMAIL = 'hello@mysuplea.com';

const DEFAULT_BETA_SIGNUP_URL = 'https://zeflyivnxbmkyiacogzu.supabase.co/functions/v1/beta-signup';

const override = import.meta.env.PUBLIC_BETA_SIGNUP_URL;
export const BETA_SIGNUP_URL: string =
  typeof override === 'string' ? override.trim() : DEFAULT_BETA_SIGNUP_URL;
