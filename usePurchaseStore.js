/**
 * usePurchaseStore.js
 * Bindet PurchaseStore.js an die echten Abhaengigkeiten der App: das
 * optionale native SDK, den API-Key je Plattform und das Entitlement im
 * Haupt-Store (useStore.js).
 */
import { Platform } from 'react-native';
import { createPurchaseStore } from './PurchaseStore';
import { loadPurchasesSdk } from './purchaseSdk';
import { REVENUECAT_API_KEY_ANDROID, REVENUECAT_API_KEY_IOS } from './purchaseConfig';
import { useStore } from './useStore';

export const usePurchaseStore = createPurchaseStore({
  sdk: loadPurchasesSdk(),
  apiKey: Platform.OS === 'ios' ? REVENUECAT_API_KEY_IOS : REVENUECAT_API_KEY_ANDROID,
  getEntitlement: () => useStore.getState().entitlement,
  setEntitlement: (entitlement) => useStore.setState({ entitlement }),
  addCredits: (count) => useStore.getState().grantScanCredits(count),
});
export default usePurchaseStore;
