// Tests fuer PurchaseStore.js: der Store bindet PurchaseLogic.js an ein
// Fake-SDK (kein Netzwerk, kein Native-Modul) und an Fake-Entitlement-
// Zugriffe. Geprueft: ohne SDK stuerzt nichts ab, mit SDK verdrahten
// initialize/buy/restore/onSessionChange den Entitlement-Zustand korrekt.
import { createPurchaseStore } from '../PurchaseStore';
import { PURCHASE_STATUS } from '../PurchaseLogic';
import { EMPTY_ENTITLEMENT, TIERS } from '../Entitlements';

let failures = 0;
function check(name, condition, extra = '') {
  if (condition) console.log(`  ok   ${name}`);
  else { failures += 1; console.error(`  FAIL ${name} ${extra}`); }
}

const later = '2027-09-01T10:00:00Z';
const info = (pro) => ({ entitlements: { active: pro ? { pro } : {}, all: pro ? { pro } : {} }, nonSubscriptionTransactions: [] });
const ent = (over) => ({ isActive: true, willRenew: true, periodType: 'NORMAL', store: 'APP_STORE', expirationDate: later, productIdentifier: 'pro_yearly', billingIssueDetectedAt: null, unsubscribeDetectedAt: null, ...over });
const pkg = (id) => ({ identifier: id, product: { identifier: id, priceString: '29,99 €' } });

// Fake-SDK aus Task 3 (tests/purchase-logic.test.mjs), erweitert um
// configure, isConfigured, getCustomerInfo, addCustomerInfoUpdateListener.
// Der Listener wird gespeichert, damit der Test ihn selbst feuern kann.
function makeSdk() {
  const calls = [];
  let listener = null;
  let customerInfo = info(null);
  return {
    calls,
    get listener() { return listener; },
    fireListener: (nextInfo) => { customerInfo = nextInfo; listener?.(nextInfo); },
    configure: (opts) => { calls.push(['configure', opts]); },
    isConfigured: async () => true,
    getCustomerInfo: async () => customerInfo,
    addCustomerInfoUpdateListener: (cb) => { listener = cb; },
    getOfferings: async () => ({ current: { availablePackages: [pkg('pro_yearly'), pkg('pro_monthly'), pkg('credits_10'), pkg('credits_50')] } }),
    purchasePackage: async (p) => { calls.push(['purchase', p.identifier]); customerInfo = p.identifier === 'credits_10' ? info(null) : info(ent()); return { customerInfo, productIdentifier: p.identifier }; },
    restorePurchases: async () => { calls.push(['restore']); customerInfo = info(ent()); return customerInfo; },
    logIn: async (id) => { calls.push(['logIn', id]); customerInfo = info(ent()); return { customerInfo, created: false }; },
    logOut: async () => { calls.push(['logOut']); customerInfo = info(null); return customerInfo; },
  };
}

function makeDeps(sdk) {
  let entitlement = EMPTY_ENTITLEMENT;
  const creditsAdded = [];
  return {
    sdk,
    apiKey: sdk ? 'test-key' : '',
    getEntitlement: () => entitlement,
    setEntitlement: (next) => { entitlement = next; },
    addCredits: (count) => { creditsAdded.push(count); entitlement = { ...entitlement, extraCredits: entitlement.extraCredits + count }; },
    creditsAdded,
    getEntitlementState: () => entitlement,
  };
}

console.log('— Ohne SDK —');
{
  const deps = makeDeps(null);
  const store = createPurchaseStore(deps);
  check('available false', store.getState().available === false);
  const result = await store.getState().buy(pkg('pro_yearly'));
  check('buy wirft nicht, cancelled zurueck', result.cancelled === true);
  check('lastError unavailable', store.getState().lastError === 'unavailable');
  check('busy wieder false', store.getState().busy === false);
  await store.getState().initialize('u1');
  check('initialize ohne SDK tut nichts', store.getState().configured === false);
  const offers = await store.getState().loadOfferings();
  check('loadOfferings ohne SDK: null', offers === null);
  await store.getState().restore();
  check('restore ohne SDK: bleibt free', store.getState().status === PURCHASE_STATUS.FREE);
}

console.log('— Mit SDK: initialize —');
{
  const sdk = makeSdk();
  const deps = makeDeps(sdk);
  const store = createPurchaseStore(deps);
  check('available true', store.getState().available === true);
  await store.getState().initialize('u1');
  check('configure aufgerufen', sdk.calls.some(([n]) => n === 'configure'));
  check('logIn mit userId aufgerufen', sdk.calls.some(([n, a]) => n === 'logIn' && a === 'u1'));
  check('Status active', store.getState().status === PURCHASE_STATUS.ACTIVE);
  check('productId gesetzt', store.getState().productId === 'pro_yearly');
  check('configured true', store.getState().configured === true);

  const before = sdk.calls.length;
  await store.getState().initialize('u1');
  check('zweiter initialize-Aufruf konfiguriert nicht erneut', sdk.calls.filter(([n]) => n === 'configure').length === 1);

  console.log('— Kauf Abo —');
  const boughtYearly = await store.getState().buy(pkg('pro_yearly'));
  check('Kauf liefert customerInfo', boughtYearly.cancelled !== true);
  check('Status nach Kauf active', store.getState().status === PURCHASE_STATUS.ACTIVE);
  check('Entitlement tier pro', deps.getEntitlementState().tier === TIERS.PRO);

  console.log('— Kauf Credits —');
  const before2 = deps.creditsAdded.length;
  await store.getState().buy(pkg('credits_10'));
  check('addCredits(10) aufgerufen', deps.creditsAdded[before2] === 10);

  console.log('— Wiederherstellen —');
  await store.getState().restore();
  check('restore ruft SDK und aktualisiert Status', sdk.calls.some(([n]) => n === 'restore') && store.getState().status === PURCHASE_STATUS.ACTIVE);

  console.log('— Listener —');
  sdk.fireListener(info(null));
  check('Listener setzt Status free', store.getState().status === PURCHASE_STATUS.FREE);
  check('Listener setzt Entitlement-Tier free', deps.getEntitlementState().tier === TIERS.FREE);

  console.log('— onSessionChange —');
  await store.getState().onSessionChange(null);
  check('onSessionChange(null) ruft logOut', sdk.calls.some(([n]) => n === 'logOut'));
  check('Status nach Logout free', store.getState().status === PURCHASE_STATUS.FREE);
}

if (failures > 0) { console.error(`\n${failures} Fehler`); process.exit(1); }
console.log('\nAlle PurchaseStore-Tests bestanden.');
