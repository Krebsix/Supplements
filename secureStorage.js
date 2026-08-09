/**
 * secureStorage.js
 * Verschluesselter Storage-Adapter fuer den zustand-persist-Store.
 *
 * WARUM:
 * Der Store enthaelt Gesundheitsdaten nach Art. 9 DSGVO (Laborwerte,
 * Medikamentengruppen, Erkrankungen). Als Klartext-JSON im AsyncStorage
 * waeren sie bei Geraetezugriff oder ungesichertem Backup lesbar — fuer
 * diese Datenkategorie ist Verschluesselung im Ruhezustand der angemessene
 * Stand der Technik (Art. 32 DSGVO).
 *
 * WIE:
 * Der 256-Bit-Schluessel liegt im Schluesselbund des Betriebssystems
 * (expo-secure-store: iOS Keychain, Android Keystore). Die Nutzdaten
 * bleiben im AsyncStorage, aber AES-256-CTR-verschluesselt mit zufaelligem
 * IV je Schreibvorgang. aes-js statt einer nativen Bibliothek, weil die
 * Payload klein ist (wenige hundert KB Obergrenze) und der Expo-Managed-
 * Workflow so erhalten bleibt.
 *
 * MIGRATION:
 * Bestandsdaten liegen als Klartext unter demselben Schluessel. getItem
 * erkennt das am fehlenden Praefix, liefert den Klartext aus und schreibt
 * sofort die verschluesselte Fassung zurueck — die Migration passiert also
 * beim ersten Start nach dem Update, ohne Nutzerinteraktion.
 *
 * GRENZEN (bewusst):
 * - CTR ohne MAC schuetzt Vertraulichkeit, nicht Integritaet. Der
 *   Angreifer im Modell ist ein Auslesen des Speichers, kein gezieltes
 *   Manipulieren einzelner Bytes.
 * - Geht der Schluesselbund-Eintrag verloren (z. B. Neuinstallation mit
 *   wiederhergestelltem App-Speicher), sind die Daten nicht entschluesselbar.
 *   Dann verhaelt sich die App wie beim ersten Start; dafuer gibt es das
 *   JSON-Backup.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';
import aesjs from 'aes-js';

const KEY_NAME = 'supplement-os-data-key-v1';
const PREFIX = 'enc1:';

let cachedKeyPromise = null;

async function getOrCreateKey() {
  if (!cachedKeyPromise) {
    cachedKeyPromise = (async () => {
      let hex = await SecureStore.getItemAsync(KEY_NAME);
      if (!hex) {
        const bytes = await Crypto.getRandomBytesAsync(32);
        hex = aesjs.utils.hex.fromBytes(Array.from(bytes));
        await SecureStore.setItemAsync(KEY_NAME, hex);
      }
      return aesjs.utils.hex.toBytes(hex);
    })();
    // Fehlgeschlagene Initialisierung nicht dauerhaft cachen.
    cachedKeyPromise.catch(() => {
      cachedKeyPromise = null;
    });
  }
  return cachedKeyPromise;
}

function makeCounter(ivBytes) {
  const counter = new aesjs.Counter(0);
  counter.setBytes(ivBytes);
  return counter;
}

async function encrypt(plaintext) {
  const key = await getOrCreateKey();
  const iv = Array.from(await Crypto.getRandomBytesAsync(16));
  const cipher = new aesjs.ModeOfOperation.ctr(key, makeCounter(iv));
  const encrypted = cipher.encrypt(aesjs.utils.utf8.toBytes(plaintext));
  return `${PREFIX}${aesjs.utils.hex.fromBytes(iv)}:${aesjs.utils.hex.fromBytes(encrypted)}`;
}

async function decrypt(stored) {
  const key = await getOrCreateKey();
  const [ivHex, dataHex] = stored.slice(PREFIX.length).split(':');
  if (!ivHex || !dataHex) throw new Error('secureStorage: unlesbares Format');
  const cipher = new aesjs.ModeOfOperation.ctr(
    key,
    makeCounter(aesjs.utils.hex.toBytes(ivHex))
  );
  const decrypted = cipher.decrypt(aesjs.utils.hex.toBytes(dataHex));
  return aesjs.utils.utf8.fromBytes(decrypted);
}

export const secureStorage = {
  getItem: async (name) => {
    const stored = await AsyncStorage.getItem(name);
    if (stored === null) return null;

    // Klartext-Bestand aus der Zeit vor der Verschluesselung: ausliefern
    // und im Hintergrund sofort verschluesselt zurueckschreiben.
    if (!stored.startsWith(PREFIX)) {
      encrypt(stored)
        .then((encrypted) => AsyncStorage.setItem(name, encrypted))
        .catch(() => {});
      return stored;
    }

    try {
      return await decrypt(stored);
    } catch (error) {
      // Ohne Schluessel ist der Bestand nicht lesbar. Kein stilles
      // Ueberschreiben: Der Eintrag bleibt stehen, bis der naechste
      // Schreibvorgang ihn regulaer ersetzt.
      console.error('secureStorage: Entschluesselung fehlgeschlagen', error);
      return null;
    }
  },

  setItem: async (name, value) => {
    const encrypted = await encrypt(value);
    await AsyncStorage.setItem(name, encrypted);
  },

  removeItem: (name) => AsyncStorage.removeItem(name),
};

export default secureStorage;
