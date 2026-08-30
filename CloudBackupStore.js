/**
 * CloudBackupStore.js
 * zustand-Factory fuer das Cloud-Backup (Spec 2026-08-30-cloud-backup-design).
 * Alle Abhaengigkeiten injiziert, in Node testbar; useCloudBackupStore.js
 * bindet die echten. Persistiert nur autoBackup, deviceLabel und
 * lastUploadedAt (kein Gesundheitsbezug), Rest ist Laufzeit.
 *
 * Regeln:
 * - Upload nur mit Session, Datenschluessel und (bei Automatik) autoBackup.
 * - scheduleUpload buendelt: ein Timer, der letzte Aufruf gewinnt; der
 *   Upload selbst laeuft ueber createCoalescedRunner, damit ein Upload
 *   waehrend eines laufenden Uploads nachgeholt statt verdoppelt wird.
 * - "ask" (Dialog offen) und "restoring" (Import laeuft) blockieren jeden
 *   Upload: ein zum Zeitpunkt des Dialogs bereits laufender Timer aus
 *   scheduleUpload() wird gecancelt, sobald pendingDecision gesetzt wird
 *   (wie restoreFrom es fuer den Restore-Fall schon tut); zusaetzlich
 *   prueft doUpload() beide Zustaende selbst noch einmal, falls der
 *   Coalesced-Runner schon laeuft.
 * - importBackup loest keinen Upload aus: waehrend des Imports ist
 *   suppress gesetzt, danach ist dirty false und lastUploadedAt der
 *   Server-Stand. Der EINE scheduleUpload()-Aufruf, der typischerweise
 *   direkt danach kommt (z. B. aus einem Store-Subscriber), darf ebenfalls
 *   keinen Rueck-Upload anstossen, obwohl suppress zu diesem Zeitpunkt
 *   schon wieder false ist: justRestored merkt sich das ueber genau einen
 *   Aufruf hinweg und loescht sich danach selbst. Einfacher als eine
 *   "echte Aenderung" von einer Restore-Nachwirkung zu unterscheiden, und
 *   ausreichend, weil nach einem Restore ohnehin kein zweiter
 *   scheduleUpload()-Aufruf folgt, bevor eine echte Aenderung passiert.
 */

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { isNetworkError } from './AccountLogic';
import {
  countsOf,
  decideOnLogin,
  decryptBackup,
  encryptBackup,
  hasLocalData,
  REMOTE_COLUMNS,
} from './CloudBackup';
import { createCoalescedRunner } from './runCoalesced';

export const CLOUD_BACKUP_STORAGE_KEY = 'mysuplea-cloud-backup-v1';
const LABEL_MAX = 60;

const RUNTIME_RESET = {
  remoteExportedAt: null,
  remoteDeviceLabel: null,
  status: 'idle',
  lastError: null,
  dirty: false,
  pendingDecision: null,
  lastRestore: null,
};

const errorCode = (error) => {
  if (isNetworkError(error) || /network|fetch failed/i.test(error?.message ?? '')) return 'network';
  return error?.code ?? 'server';
};

export function createCloudBackupStore(deps, { storage } = {}) {
  const {
    client,
    randomBytes,
    getMainState,
    importBackup,
    getAccount,
    defaultDeviceLabel = '',
    now = () => new Date(),
    schedule = (fn, ms) => setTimeout(fn, ms),
    cancel = (id) => clearTimeout(id),
    delayMs = 5000,
  } = deps;

  return create(
    persist(
      (set, get) => {
        let timerId = null;
        let suppress = false;
        let justRestored = false;

        const ready = () => {
          const account = getAccount();
          return Boolean(account?.signedIn && account?.userId && account?.dataKey);
        };

        const fetchRemote = async () => {
          const { data, error } = await client.from('user_backups').select(REMOTE_COLUMNS).maybeSingle();
          if (error) throw Object.assign(new Error(error.message), { code: 'server' });
          return data ?? null;
        };

        const doUpload = async () => {
          if (!ready()) return;
          // Waehrend ein Dialog offen ist (pendingDecision) darf kein Upload
          // laufen: die Entscheidung koennte "restore" sein, ein Upload
          // wuerde den fremden Stand ueberschreiben, bevor die Nutzerin
          // gewaehlt hat. Ebenso waehrend restoreFrom laeuft (status
          // 'restoring'): sonst liefe ein Upload parallel zum Import und
          // koennte lastUploadedAt/remoteExportedAt verfaelschen.
          if (get().pendingDecision || get().status === 'restoring') return;
          const { userId, dataKey } = getAccount();
          set({ status: 'uploading', lastError: null });
          try {
            const sealed = await encryptBackup(getMainState(), dataKey, randomBytes, now());
            const { error } = await client.from('user_backups').upsert({
              user_id: userId,
              ciphertext: sealed.ciphertext,
              payload_version: sealed.payloadVersion,
              device_label: get().deviceLabel,
              exported_at: sealed.exportedAt,
            });
            if (error) throw Object.assign(new Error(error.message), { code: 'server' });
            set({
              status: 'idle',
              dirty: false,
              lastUploadedAt: sealed.exportedAt,
              remoteExportedAt: sealed.exportedAt,
              remoteDeviceLabel: get().deviceLabel,
            });
          } catch (error) {
            const code = errorCode(error);
            // Fehlgeschlagen heisst: der Server-Stand ist NICHT der unsere,
            // also bleibt (bzw. wird) dirty true, damit ein spaeterer
            // Versuch (Timer, manuell, naechster App-Start) es erneut
            // versucht statt den Stand faelschlich als gesichert zu fuehren.
            set({ status: code === 'network' ? 'offline' : 'error', lastError: code, dirty: true });
          }
        };
        const runUpload = createCoalescedRunner(doUpload);

        const restoreFrom = async (remote) => {
          const { dataKey } = getAccount();
          set({ status: 'restoring', lastError: null });
          const opened = decryptBackup(remote.ciphertext, dataKey); // wirft mit code
          const counts = countsOf(opened.data);
          suppress = true;
          try {
            importBackup(opened.data);
          } finally {
            suppress = false;
          }
          if (timerId) { cancel(timerId); timerId = null; }
          justRestored = true;
          set({
            status: 'idle',
            dirty: false,
            lastUploadedAt: remote.exported_at,
            remoteExportedAt: remote.exported_at,
            remoteDeviceLabel: remote.device_label ?? null,
            lastRestore: { exportedAt: remote.exported_at, deviceLabel: remote.device_label ?? '', counts },
          });
        };

        return {
          autoBackup: true,
          deviceLabel: defaultDeviceLabel,
          lastUploadedAt: null,
          ...RUNTIME_RESET,

          scheduleUpload: () => {
            if (suppress) return;
            if (justRestored) {
              // Der Import selbst hat den Stand gerade erst auf den
              // Server-Stand gebracht: dieser eine Nachlauf-Aufruf ist
              // keine echte Aenderung, sondern nur der Reflex eines
              // Store-Subscribers auf den Import. Verwerfen statt hochladen.
              justRestored = false;
              return;
            }
            set({ dirty: true });
            if (!get().autoBackup || !ready() || get().pendingDecision) return;
            if (timerId) cancel(timerId);
            timerId = schedule(() => {
              timerId = null;
              runUpload();
            }, delayMs);
          },

          uploadNow: () => runUpload(),

          checkOnLogin: async () => {
            if (!ready()) return 'none';
            let remote;
            try {
              remote = await fetchRemote();
            } catch (error) {
              const code = errorCode(error);
              set({ status: code === 'network' ? 'offline' : 'error', lastError: code });
              return 'none';
            }
            set({ remoteExportedAt: remote?.exported_at ?? null, remoteDeviceLabel: remote?.device_label ?? null });
            const decision = decideOnLogin({
              remote,
              localHasData: hasLocalData(getMainState()),
              lastUploadedAt: get().lastUploadedAt,
            });
            if (decision === 'restore') {
              try {
                await restoreFrom(remote);
                return 'restore';
              } catch (error) {
                // doUpload setzt lastError beim Start auf null: der Code des
                // Restore-Fehlers muss deshalb NACH dem Upload gesetzt
                // werden, sonst verschluckt der (erfolgreiche) Upload ihn.
                const code = errorCode(error);
                set({ status: 'idle' });
                await runUpload();
                set({ lastError: code });
                return 'upload';
              }
            }
            if (decision === 'ask') {
              try {
                const opened = decryptBackup(remote.ciphertext, getAccount().dataKey);
                // Ein aus scheduleUpload() noch offener Timer darf jetzt
                // nicht mehr feuern: "ask" blockiert Uploads bis zur
                // Entscheidung (wie restoreFrom es fuer den Restore-Fall
                // schon tut).
                if (timerId) { cancel(timerId); timerId = null; }
                set({ pendingDecision: { remote, counts: countsOf(opened.data) } });
                return 'ask';
              } catch (error) {
                // Unlesbar (z. B. Reset ohne Recovery-Key): unser Stand
                // ersetzt ihn, aber lastError muss NACH dem Upload gesetzt
                // werden (siehe Kommentar oben beim restore-Zweig).
                const code = errorCode(error);
                await runUpload();
                set({ lastError: code });
                return 'upload';
              }
            }
            if (decision === 'upload') await runUpload();
            return decision;
          },

          resolveDecision: async (choice) => {
            const pending = get().pendingDecision;
            set({ pendingDecision: null });
            if (!pending) return;
            if (choice === 'restore') {
              try {
                await restoreFrom(pending.remote);
              } catch (error) {
                set({ status: 'idle', lastError: errorCode(error) });
              }
              return;
            }
            await runUpload();
          },

          deleteRemote: async () => {
            const { userId } = getAccount();
            if (!userId) return;
            const { error } = await client.from('user_backups').delete().eq('user_id', userId);
            if (error) {
              set({ status: 'error', lastError: 'server' });
              return;
            }
            set({ remoteExportedAt: null, remoteDeviceLabel: null, lastUploadedAt: null, status: 'idle', lastError: null });
          },

          setAutoBackup: (value) => set({ autoBackup: Boolean(value) }),
          setDeviceLabel: (text) => set({ deviceLabel: String(text ?? '').trim().slice(0, LABEL_MAX) }),
          dismissRestoreNotice: () => set({ lastRestore: null }),
          onSignedOut: () => {
            if (timerId) { cancel(timerId); timerId = null; }
            set({ ...RUNTIME_RESET, lastUploadedAt: null });
          },
        };
      },
      {
        name: CLOUD_BACKUP_STORAGE_KEY,
        storage: createJSONStorage(() => storage ?? memoryFallback()),
        partialize: (state) => ({
          autoBackup: state.autoBackup,
          deviceLabel: state.deviceLabel,
          lastUploadedAt: state.lastUploadedAt,
        }),
      }
    )
  );
}

// Nur fuer Aufrufer ohne storage (sollte in der App nie vorkommen).
function memoryFallback() {
  const map = new Map();
  return {
    getItem: async (key) => map.get(key) ?? null,
    setItem: async (key, value) => { map.set(key, value); },
    removeItem: async (key) => { map.delete(key); },
  };
}
