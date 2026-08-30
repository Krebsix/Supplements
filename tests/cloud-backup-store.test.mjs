// Tests fuer CloudBackupStore.js: Upload gebuendelt, Login-Entscheidung,
// Wiederherstellen ohne Rueck-Upload, Offline, Widerruf.
import { webcrypto } from 'node:crypto';
import { createCloudBackupStore } from '../CloudBackupStore';
import { decryptBackup, encryptBackup } from '../CloudBackup';

let failures = 0;
function check(name, condition, extra = '') {
  if (condition) console.log(`  ok   ${name}`);
  else { failures += 1; console.error(`  FAIL ${name} ${extra}`); }
}
const randomBytes = async (n) => webcrypto.getRandomValues(new Uint8Array(n));
const tick = () => new Promise((resolve) => setTimeout(resolve, 0));

function memoryStorage() {
  const map = new Map();
  return {
    getItem: async (k) => map.get(k) ?? null,
    setItem: async (k, v) => { map.set(k, v); },
    removeItem: async (k) => { map.delete(k); },
  };
}

function makeClient({ row = null, fail = null } = {}) {
  const calls = [];
  return {
    calls,
    get row() { return row; },
    from: () => ({
      select: () => ({ maybeSingle: async () => { calls.push(['select']); if (fail === 'select') throw Object.assign(new Error('fetch failed'), { name: 'TypeError' }); return { data: row, error: null }; } }),
      upsert: async (next) => { calls.push(['upsert', next]); if (fail === 'upsert') return { error: { message: 'Network request failed' } }; row = { ...next, updated_at: '2026-08-30T12:00:01.000Z' }; return { error: null }; },
      delete: () => ({ eq: async () => { calls.push(['delete']); row = null; return { error: null }; } }),
    }),
  };
}

// Manuell steuerbarer Timer: schedule sammelt, flush fuehrt aus.
function makeTimer() {
  let queue = [];
  return {
    schedule: (fn, ms) => { const id = Symbol(ms); queue.push({ id, fn }); return id; },
    cancel: (id) => { queue = queue.filter((item) => item.id !== id); },
    flush: async () => { const items = queue; queue = []; for (const item of items) await item.fn(); },
    get size() { return queue.length; },
  };
}

async function setup({ row = null, fail = null, state, account, storage = memoryStorage() } = {}) {
  const key = await randomBytes(32);
  const main = { current: state ?? { userSupplements: [{ id: 'user-1', name: 'Magnesium', status: 'active' }], intakeLogs: [], labValues: [] } };
  const imported = [];
  const timer = makeTimer();
  const client = makeClient({ row, fail });
  const store = createCloudBackupStore(
    {
      client,
      randomBytes,
      getMainState: () => main.current,
      importBackup: (data) => { imported.push(data); main.current = { ...main.current, ...data }; },
      getAccount: () => account ?? { signedIn: true, userId: 'u1', dataKey: key },
      defaultDeviceLabel: 'Testgeraet',
      now: () => new Date('2026-08-30T12:00:00.000Z'),
      schedule: timer.schedule,
      cancel: timer.cancel,
      delayMs: 5000,
    },
    { storage }
  );
  await tick();
  await store.persist.rehydrate();
  return { store, client, timer, imported, key, main };
}

console.log('— scheduleUpload buendelt —');
{
  const { store, client, timer } = await setup();
  store.getState().scheduleUpload();
  store.getState().scheduleUpload();
  store.getState().scheduleUpload();
  check('nur ein Timer offen', timer.size === 1);
  check('dirty gesetzt', store.getState().dirty === true);
  await timer.flush();
  await tick();
  const upserts = client.calls.filter(([n]) => n === 'upsert');
  check('genau ein Upload', upserts.length === 1);
  check('Upload traegt Geraetename', upserts[0][1].device_label === 'Testgeraet');
  check('Upload traegt user_id', upserts[0][1].user_id === 'u1');
  check('lastUploadedAt = exported_at', store.getState().lastUploadedAt === upserts[0][1].exported_at);
  check('dirty zurueckgesetzt', store.getState().dirty === false);
  check('status idle', store.getState().status === 'idle');
}

console.log('— kein Upload ohne Schluessel / ohne autoBackup / abgemeldet —');
{
  const { store, client, timer } = await setup({ account: { signedIn: true, userId: 'u1', dataKey: null } });
  store.getState().scheduleUpload();
  await timer.flush();
  check('ohne Schluessel kein Upload', client.calls.filter(([n]) => n === 'upsert').length === 0);
}
{
  const { store, client, timer } = await setup();
  store.getState().setAutoBackup(false);
  store.getState().scheduleUpload();
  await timer.flush();
  check('autoBackup aus: kein Timer, kein Upload', timer.size === 0 && client.calls.filter(([n]) => n === 'upsert').length === 0);
  await store.getState().uploadNow();
  check('uploadNow geht trotzdem (manuell)', client.calls.filter(([n]) => n === 'upsert').length === 1);
}
{
  const { store, client, timer } = await setup({ account: { signedIn: false, userId: null, dataKey: null } });
  store.getState().scheduleUpload();
  await timer.flush();
  check('abgemeldet: kein Upload', client.calls.filter(([n]) => n === 'upsert').length === 0);
}

console.log('— checkOnLogin: restore importiert und laedt nicht sofort wieder hoch —');
{
  const key = await randomBytes(32);
  const remoteState = { userSupplements: [{ id: 'user-9', name: 'Eisen', status: 'active' }], labValues: [{ id: 'lab-1' }], intakeLogs: [] };
  const sealed = await encryptBackup(remoteState, key, randomBytes, new Date('2026-08-29T10:00:00.000Z'));
  const row = { ciphertext: sealed.ciphertext, payload_version: 1, device_label: 'Altes iPhone', exported_at: sealed.exportedAt, updated_at: sealed.exportedAt };
  const { store, client, timer, imported } = await setup({ row, state: { userSupplements: [], labValues: [], intakeLogs: [] }, account: { signedIn: true, userId: 'u1', dataKey: key } });
  const decision = await store.getState().checkOnLogin();
  check('Entscheidung restore', decision === 'restore');
  check('importBackup aufgerufen', imported.length === 1 && imported[0].userSupplements[0].name === 'Eisen');
  check('lastRestore gesetzt mit Zaehlern', store.getState().lastRestore?.counts.supplements === 1 && store.getState().lastRestore.deviceLabel === 'Altes iPhone');
  check('lastUploadedAt = Server-Stand', store.getState().lastUploadedAt === sealed.exportedAt);
  store.getState().scheduleUpload();
  check('kein Timer direkt nach Restore (dirty false)', store.getState().dirty === false || timer.size === 0);
  await timer.flush();
  check('kein Rueck-Upload', client.calls.filter(([n]) => n === 'upsert').length === 0);
  store.getState().dismissRestoreNotice();
  check('Hinweis weggetippt', store.getState().lastRestore === null);
}

console.log('— checkOnLogin: ask, dann Entscheidung —');
{
  const key = await randomBytes(32);
  const sealed = await encryptBackup({ userSupplements: [{ id: 'a', status: 'active' }, { id: 'b', status: 'active' }], labValues: [], intakeLogs: [] }, key, randomBytes, new Date('2026-08-30T09:00:00.000Z'));
  const row = { ciphertext: sealed.ciphertext, payload_version: 1, device_label: 'Anderes Geraet', exported_at: sealed.exportedAt, updated_at: sealed.exportedAt };
  const { store, client, imported } = await setup({ row, account: { signedIn: true, userId: 'u1', dataKey: key } });
  const decision = await store.getState().checkOnLogin();
  check('Entscheidung ask', decision === 'ask');
  check('pendingDecision mit Zaehlern', store.getState().pendingDecision?.counts.supplements === 2);
  check('nichts hochgeladen, nichts importiert', client.calls.filter(([n]) => n === 'upsert').length === 0 && imported.length === 0);
  await store.getState().resolveDecision('upload');
  check('upload: hochgeladen', client.calls.filter(([n]) => n === 'upsert').length === 1);
  check('pendingDecision geleert', store.getState().pendingDecision === null);
}
{
  const key = await randomBytes(32);
  const sealed = await encryptBackup({ userSupplements: [{ id: 'a', status: 'active' }], labValues: [], intakeLogs: [] }, key, randomBytes, new Date('2026-08-30T09:00:00.000Z'));
  const row = { ciphertext: sealed.ciphertext, payload_version: 1, device_label: 'Anderes Geraet', exported_at: sealed.exportedAt, updated_at: sealed.exportedAt };
  const { store, imported } = await setup({ row, account: { signedIn: true, userId: 'u1', dataKey: key } });
  await store.getState().checkOnLogin();
  await store.getState().resolveDecision('restore');
  check('restore: importiert', imported.length === 1);
}

console.log('— checkOnLogin: unser eigener Stand → upload; falscher Schluessel → wrongKey + upload —');
{
  const key = await randomBytes(32);
  const sealed = await encryptBackup({ userSupplements: [{ id: 'a', status: 'active' }], labValues: [], intakeLogs: [] }, key, randomBytes, new Date('2026-08-30T09:00:00.000Z'));
  const row = { ciphertext: sealed.ciphertext, payload_version: 1, device_label: 'Testgeraet', exported_at: sealed.exportedAt, updated_at: sealed.exportedAt };
  const storage = memoryStorage();
  await storage.setItem('mysuplea-cloud-backup-v1', JSON.stringify({ state: { autoBackup: true, deviceLabel: 'Testgeraet', lastUploadedAt: sealed.exportedAt }, version: 0 }));
  const { store, client } = await setup({ row, storage, account: { signedIn: true, userId: 'u1', dataKey: key } });
  const decision = await store.getState().checkOnLogin();
  check('eigener Stand → upload', decision === 'upload');
  check('hochgeladen', client.calls.filter(([n]) => n === 'upsert').length === 1);
}
{
  const key = await randomBytes(32);
  const otherKey = await randomBytes(32);
  const sealed = await encryptBackup({ userSupplements: [{ id: 'a', status: 'active' }], labValues: [], intakeLogs: [] }, otherKey, randomBytes, new Date('2026-08-30T09:00:00.000Z'));
  const row = { ciphertext: sealed.ciphertext, payload_version: 1, device_label: 'Fremd', exported_at: sealed.exportedAt, updated_at: sealed.exportedAt };
  const { store, client } = await setup({ row, account: { signedIn: true, userId: 'u1', dataKey: key } });
  const decision = await store.getState().checkOnLogin();
  check('unlesbar → upload', decision === 'upload');
  check('lastError wrongKey', store.getState().lastError === 'wrongKey');
  check('ersetzt den Stand', client.calls.filter(([n]) => n === 'upsert').length === 1);
}

console.log('— Offline und Widerruf —');
{
  const { store } = await setup({ fail: 'upsert' });
  await store.getState().uploadNow();
  check('Netzfehler → status offline, kein throw', store.getState().status === 'offline');
  check('dirty bleibt', store.getState().dirty === true);
}
{
  const { store, client } = await setup({ row: { ciphertext: 'aa'.repeat(12) + ':bb', payload_version: 1, device_label: 'x', exported_at: '2026-08-30T09:00:00.000Z', updated_at: '2026-08-30T09:00:00.000Z' } });
  await store.getState().deleteRemote();
  check('delete aufgerufen', client.calls.some(([n]) => n === 'delete'));
  check('remoteExportedAt und lastUploadedAt geleert', store.getState().remoteExportedAt === null && store.getState().lastUploadedAt === null);
}
{
  const { store } = await setup();
  store.getState().setDeviceLabel('  Nadines iPhone  ');
  check('Geraetename getrimmt', store.getState().deviceLabel === 'Nadines iPhone');
  store.getState().setDeviceLabel('x'.repeat(80));
  check('Geraetename auf 60 gekappt', store.getState().deviceLabel.length === 60);
  store.getState().onSignedOut();
  check('onSignedOut raeumt Laufzeitfelder', store.getState().pendingDecision === null && store.getState().remoteExportedAt === null && store.getState().lastUploadedAt === null);
}

if (failures > 0) { console.error(`\n${failures} Test(s) fehlgeschlagen`); process.exit(1); }
console.log('\nCloudBackupStore: alle Tests bestanden');
