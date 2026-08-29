/**
 * PurchaseLogic.js
 * ─────────────────────────────────────────────────────────────
 * Kaufschicht ohne UI. Das RevenueCat-SDK wird uebergeben (wie der
 * Supabase-Client in AccountLogic), damit Tests einen Fake einsetzen und
 * das Modul in Node laeuft. Uebersetzt den Status des Stores in sieben
 * ehrliche Zustaende, die die Abo-Verwaltung woertlich anzeigt.
 *
 * GRUNDSATZ: Kuendigen und Stornieren passieren im Store. Hier gibt es
 * kaufen, wiederherstellen, Status lesen und das Konto verknuepfen, sonst
 * nichts. Preise kommen nur aus dem SDK (product.priceString).
 */
import { CREDIT_AMOUNTS, ENTITLEMENT_ID, PRODUCT_IDS } from './purchaseConfig';

export const PURCHASE_STATUS = {
  FREE: 'free', TRIAL: 'trial', ACTIVE: 'active', CANCELLED: 'cancelled',
  GRACE: 'grace', EXPIRED: 'expired', PENDING: 'pending',
};

function platformOf(store) {
  if (store === 'APP_STORE' || store === 'MAC_APP_STORE') return 'ios';
  if (store === 'PLAY_STORE' || store === 'AMAZON') return 'android';
  return 'unknown';
}

export function mapCustomerInfo(customerInfo, now = new Date()) {
  const active = customerInfo?.entitlements?.active?.[ENTITLEMENT_ID] ?? null;
  const any = customerInfo?.entitlements?.all?.[ENTITLEMENT_ID] ?? null;
  const base = { status: PURCHASE_STATUS.FREE, expiresAt: null, willRenew: false, platform: 'unknown', productId: null, isPro: false };

  if (active) {
    let status = PURCHASE_STATUS.ACTIVE;
    if (active.billingIssueDetectedAt) status = PURCHASE_STATUS.GRACE;
    else if (active.periodType === 'TRIAL') status = PURCHASE_STATUS.TRIAL;
    else if (active.willRenew === false || active.unsubscribeDetectedAt) status = PURCHASE_STATUS.CANCELLED;
    return { status, expiresAt: active.expirationDate ?? null, willRenew: Boolean(active.willRenew), platform: platformOf(active.store), productId: active.productIdentifier ?? null, isPro: true };
  }
  if (any && any.expirationDate && new Date(any.expirationDate) < now) {
    return { ...base, status: PURCHASE_STATUS.EXPIRED, expiresAt: any.expirationDate, platform: platformOf(any.store), productId: any.productIdentifier ?? null };
  }
  return base;
}

export function creditsForProduct(productId) {
  return CREDIT_AMOUNTS[productId] ?? 0;
}

export async function loadOfferings(sdk) {
  const offerings = await sdk.getOfferings();
  const packages = offerings?.current?.availablePackages ?? null;
  if (!packages) return null;
  const byProduct = (id) => packages.find((p) => p.product?.identifier === id) ?? null;
  return {
    yearly: byProduct(PRODUCT_IDS.yearly),
    monthly: byProduct(PRODUCT_IDS.monthly),
    credits: [PRODUCT_IDS.credits10, PRODUCT_IDS.credits50].map(byProduct).filter(Boolean),
  };
}

export async function purchase(sdk, pkg) {
  try {
    const result = await sdk.purchasePackage(pkg);
    return { cancelled: false, customerInfo: result.customerInfo, productId: result.productIdentifier ?? pkg.product?.identifier ?? null };
  } catch (error) {
    if (error?.userCancelled) return { cancelled: true, customerInfo: null, productId: null };
    throw error;
  }
}

export const restore = (sdk) => sdk.restorePurchases();
export const linkAccount = async (sdk, userId) => (await sdk.logIn(userId)).customerInfo;
export const unlinkAccount = (sdk) => sdk.logOut();

export function isNativeError(error) {
  return /native module|RNPurchases|not linked/i.test(String(error?.message ?? ''));
}
