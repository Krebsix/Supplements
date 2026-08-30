/**
 * useCloudBackupStore.js
 * Bindet CloudBackupStore.js an die echten Abhaengigkeiten: Supabase,
 * Haupt-Store (Zustand + importBackup), Konto-Store (Session +
 * Datenschluessel), expo-device fuer den Geraetenamen, AsyncStorage fuer
 * die drei persistierten Felder (kein Gesundheitsbezug, daher
 * unverschluesselt).
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import * as Device from 'expo-device';

import { ACCOUNT_STATUS } from './AccountStore';
import { createCloudBackupStore } from './CloudBackupStore';
import { supabase } from './supabaseClient';
import useAccountStore from './useAccountStore';
import useStore from './useStore';

const randomBytes = async (length) => new Uint8Array(await Crypto.getRandomBytesAsync(length));

export function defaultDeviceLabel() {
  return (Device.deviceName || Device.modelName || 'Dieses Gerät').slice(0, 60);
}

export const useCloudBackupStore = createCloudBackupStore(
  {
    client: supabase,
    randomBytes,
    getMainState: () => useStore.getState(),
    importBackup: (data) => useStore.getState().importBackup(data),
    getAccount: () => {
      const account = useAccountStore.getState();
      return {
        signedIn: account.status === ACCOUNT_STATUS.SIGNED_IN,
        userId: account.userId,
        dataKey: account.dataKey,
      };
    },
    defaultDeviceLabel: defaultDeviceLabel(),
  },
  { storage: AsyncStorage }
);

// Abmelden oder Konto weg: Laufzeitfelder und lastUploadedAt raeumen.
let previousUserId = useAccountStore.getState().userId;
useAccountStore.subscribe((state) => {
  if (state.userId !== previousUserId) {
    previousUserId = state.userId;
    if (!state.userId) useCloudBackupStore.getState().onSignedOut();
  }
});

export default useCloudBackupStore;
