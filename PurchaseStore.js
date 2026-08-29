/**
 * PurchaseStore.js
 * ─────────────────────────────────────────────────────────────
 * Zustand-Store fuer die Kaufschicht. Factory statt Modul-Singleton
 * (wie AccountStore.js), damit Tests ein Fake-SDK und Fake-Entitlement-
 * Zugriffe uebergeben. Importiert bewusst KEIN react-native und KEIN
 * SDK direkt: Das SDK-Objekt (oder null, wenn das native Modul fehlt,
 * z. B. in Expo Go) kommt von aussen. So bleibt der Store in Node
 * testbar und laeuft ohne Absturz auch ohne Kaufschicht.
 */
import { create } from 'zustand';
import { applyPurchaseStatus } from './Entitlements';
import { PURCHASE_STATUS, creditsForProduct, linkAccount, loadOfferings, mapCustomerInfo, purchase, restore, unlinkAccount } from './PurchaseLogic';

export function createPurchaseStore({ sdk, apiKey, getEntitlement, setEntitlement, addCredits }) {
  return create((set, get) => {
    const apply = (customerInfo) => {
      const mapped = mapCustomerInfo(customerInfo);
      set({ status: mapped.status, expiresAt: mapped.expiresAt, willRenew: mapped.willRenew, platform: mapped.platform, productId: mapped.productId });
      setEntitlement(applyPurchaseStatus(getEntitlement(), mapped));
    };
    // lastError wird hier am Anfang zurueckgesetzt; die Aktion selbst
    // setzt den 'unavailable'-Marker DANACH, damit er sichtbar bleibt.
    const withBusy = async (fn) => { set({ busy: true, lastError: null }); try { return await fn(); } catch (error) { set({ lastError: error?.message ?? 'error' }); throw error; } finally { set({ busy: false }); } };

    return {
      available: Boolean(sdk && apiKey), configured: false, offerings: null, busy: false,
      status: PURCHASE_STATUS.FREE, expiresAt: null, willRenew: false, platform: 'unknown', productId: null, lastError: null,

      initialize: async (userId) => {
        if (!get().available) return;
        if (!get().configured) {
          sdk.configure({ apiKey, appUserID: userId ?? null });
          sdk.addCustomerInfoUpdateListener((info) => apply(info));
          set({ configured: true });
        }
        const info = userId ? await linkAccount(sdk, userId) : await sdk.getCustomerInfo();
        apply(info);
      },
      refresh: async () => { if (get().configured) apply(await sdk.getCustomerInfo()); },
      loadOfferings: () => withBusy(async () => { if (!get().available) return null; const offerings = await loadOfferings(sdk); set({ offerings }); return offerings; }),
      buy: (pkg) => withBusy(async () => {
        if (!get().available) { set({ lastError: 'unavailable' }); return { cancelled: true }; }
        const result = await purchase(sdk, pkg);
        if (result.cancelled) return result;
        apply(result.customerInfo);
        const credits = creditsForProduct(result.productId);
        if (credits > 0) addCredits(credits);
        return result;
      }),
      restore: () => withBusy(async () => { if (!get().available) return null; const info = await restore(sdk); apply(info); return mapCustomerInfo(info); }),
      onSessionChange: async (userId) => {
        if (!get().configured) return;
        const info = userId ? await linkAccount(sdk, userId) : await unlinkAccount(sdk);
        apply(info);
      },
    };
  });
}
