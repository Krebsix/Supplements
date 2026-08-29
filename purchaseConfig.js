/**
 * purchaseConfig.js
 * RevenueCat-Konfiguration. Public-Keys sind oeffentlich (wie der
 * Supabase-Anon-Key), Produkt-IDs muessen mit App Store Connect, Play
 * Console und dem RevenueCat-Offering "default" uebereinstimmen (Spec,
 * Abschnitt Store-Konfiguration). Leere Keys = Kaufschicht nicht
 * verfuegbar, die App laeuft trotzdem.
 */
export const REVENUECAT_API_KEY_IOS = '';
export const REVENUECAT_API_KEY_ANDROID = '';
export const ENTITLEMENT_ID = 'pro';
export const PRODUCT_IDS = { yearly: 'pro_yearly', monthly: 'pro_monthly', credits10: 'credits_10', credits50: 'credits_50' };
export const CREDIT_AMOUNTS = { credits_10: 10, credits_50: 50 };
export const MANAGE_URL_IOS = 'https://apps.apple.com/account/subscriptions';
export const MANAGE_URL_ANDROID = 'https://play.google.com/store/account/subscriptions?package=com.indoohome.mysuplea';
export const REFUND_URL_IOS = 'https://reportaproblem.apple.com';
export const REFUND_URL_ANDROID = 'https://support.google.com/googleplay/answer/2479637';
