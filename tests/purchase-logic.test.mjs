// Tests fuer PurchaseLogic.js gegen ein Fake-SDK. Kein Netzwerk, kein
// Native-Modul. Geprueft: die Uebersetzung des RevenueCat-Status in unseren
// Abo-Status, Kauf und Wiederherstellen, Verknuepfung mit dem Konto.
import { PURCHASE_STATUS, creditsForProduct, isNativeError, linkAccount, loadOfferings, mapCustomerInfo, purchase, restore, unlinkAccount } from '../PurchaseLogic';
import { EMPTY_ENTITLEMENT, applyPurchaseStatus, isPro } from '../Entitlements';

let failures = 0;
function check(name, condition, extra = '') {
  if (condition) console.log(`  ok   ${name}`);
  else { failures += 1; console.error(`  FAIL ${name} ${extra}`); }
}
const NOW = new Date('2026-09-01T10:00:00Z');
const later = '2027-09-01T10:00:00Z';
const earlier = '2026-08-01T10:00:00Z';
const info = (pro) => ({ entitlements: { active: pro ? { pro } : {} , all: pro ? { pro } : {} }, nonSubscriptionTransactions: [] });
const ent = (over) => ({ isActive: true, willRenew: true, periodType: 'NORMAL', store: 'APP_STORE', expirationDate: later, productIdentifier: 'pro_yearly', billingIssueDetectedAt: null, unsubscribeDetectedAt: null, ...over });

console.log('— Status-Uebersetzung —');
check('kein Entitlement: free', mapCustomerInfo(info(null), NOW).status === PURCHASE_STATUS.FREE);
check('aktiv, verlaengert: active + isPro', (() => { const m = mapCustomerInfo(info(ent()), NOW); return m.status === PURCHASE_STATUS.ACTIVE && m.isPro && m.willRenew && m.platform === 'ios' && m.productId === 'pro_yearly'; })());
check('Trial: trial', mapCustomerInfo(info(ent({ periodType: 'TRIAL' })), NOW).status === PURCHASE_STATUS.TRIAL);
check('gekuendigt, noch aktiv: cancelled + isPro', (() => { const m = mapCustomerInfo(info(ent({ willRenew: false, unsubscribeDetectedAt: earlier })), NOW); return m.status === PURCHASE_STATUS.CANCELLED && m.isPro; })());
check('Zahlungsproblem: grace + isPro', (() => { const m = mapCustomerInfo(info(ent({ billingIssueDetectedAt: earlier })), NOW); return m.status === PURCHASE_STATUS.GRACE && m.isPro; })());
check('abgelaufen (nur in all, nicht active): expired, nicht pro', (() => { const ci = { entitlements: { active: {}, all: { pro: ent({ isActive: false, expirationDate: earlier }) } }, nonSubscriptionTransactions: [] }; const m = mapCustomerInfo(ci, NOW); return m.status === PURCHASE_STATUS.EXPIRED && !m.isPro && m.expiresAt === earlier; })());
check('Play Store: platform android', mapCustomerInfo(info(ent({ store: 'PLAY_STORE' })), NOW).platform === 'android');

console.log('— Entitlement-Spiegelung —');
const pro = applyPurchaseStatus(EMPTY_ENTITLEMENT, mapCustomerInfo(info(ent()), NOW));
check('isPro true nach aktivem Abo', isPro(pro));
check('lokale Zaehler bleiben', pro.freeScansUsed === 0 && pro.extraCredits === 0);
check('zurueck auf free nach Ablauf', !isPro(applyPurchaseStatus(pro, mapCustomerInfo(info(null), NOW))));

console.log('— Credits —');
check('credits_10 → 10, credits_50 → 50, unbekannt → 0', creditsForProduct('credits_10') === 10 && creditsForProduct('credits_50') === 50 && creditsForProduct('pro_yearly') === 0);

console.log('— Angebote, Kauf, Wiederherstellen, Konto —');
function makeSdk() {
  const calls = [];
  const pkg = (id) => ({ identifier: id, product: { identifier: id, priceString: '29,99 €' } });
  return {
    calls,
    PURCHASES_ERROR_CODE: { PURCHASE_CANCELLED_ERROR: 'CANCELLED' },
    getOfferings: async () => ({ current: { availablePackages: [pkg('pro_yearly'), pkg('pro_monthly'), pkg('credits_10'), pkg('credits_50')] } }),
    purchasePackage: async (p) => {
      calls.push(['purchase', p.identifier]);
      if (p.identifier === 'cancel') { const e = new Error('cancelled'); e.userCancelled = true; throw e; }
      if (p.identifier === 'cancel-code') { throw Object.assign(new Error('cancelled'), { code: 'CANCELLED' }); }
      return { customerInfo: info(ent()), productIdentifier: p.identifier };
    },
    restorePurchases: async () => { calls.push(['restore']); return info(ent()); },
    logIn: async (id) => { calls.push(['logIn', id]); return { customerInfo: info(ent()), created: false }; },
    logOut: async () => { calls.push(['logOut']); return info(null); },
  };
}
{
  const sdk = makeSdk();
  const offers = await loadOfferings(sdk);
  check('Pakete zugeordnet', offers.yearly.identifier === 'pro_yearly' && offers.monthly.identifier === 'pro_monthly' && offers.credits.length === 2);
  check('ohne current: null', (await loadOfferings({ getOfferings: async () => ({ current: null }) })) === null);
  const bought = await purchase(sdk, offers.yearly);
  check('Kauf liefert customerInfo und productId', !bought.cancelled && bought.productId === 'pro_yearly' && bought.customerInfo);
  const cancelled = await purchase(sdk, { identifier: 'cancel', product: { identifier: 'cancel' } });
  check('Abbruch ist kein Fehler', cancelled.cancelled === true && cancelled.customerInfo === null);
  const cancelledByCode = await purchase(sdk, { identifier: 'cancel-code', product: { identifier: 'cancel-code' } });
  check('Abbruch ueber Fehlercode (ohne userCancelled) erkannt', cancelledByCode.cancelled === true);
  check('restore ruft SDK', (await restore(sdk)) && sdk.calls.some(([n]) => n === 'restore'));
  await linkAccount(sdk, 'u1'); await unlinkAccount(sdk);
  check('logIn/logOut durchgereicht', sdk.calls.some(([n, a]) => n === 'logIn' && a === 'u1') && sdk.calls.some(([n]) => n === 'logOut'));
}
check('isNativeError erkennt fehlendes Modul', isNativeError(new Error("Cannot find native module 'RNPurchases'")));

if (failures > 0) { console.error(`\n${failures} Fehler`); process.exit(1); }
console.log('\nAlle PurchaseLogic-Tests bestanden.');
