// purchaseSdk.js: Native-Modul optional laden. In Expo Go fehlt es; dann
// null, und die Kaufschicht meldet "nicht verfuegbar" statt abzustuerzen.
export function loadPurchasesSdk() {
  try {
    // eslint-disable-next-line global-require
    const mod = require('react-native-purchases');
    const Purchases = mod.default ?? mod;
    return typeof Purchases?.configure === 'function' ? Purchases : null;
  } catch {
    return null;
  }
}
