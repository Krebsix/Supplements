/**
 * tests/scan-quota.test.mjs
 * ─────────────────────────────────────────────────────────────
 * Serverseitiger Kostenschutz der Foto-Analyse (Audit-Befund L2).
 *
 * Geprueft wird die reine Entscheidungslogik aus
 * supabase/functions/analyze-supplement/quota.ts plus ein Nachbau des
 * Kontrollflusses der Edge Function mit Ersatzfunktionen fuer Datenbank
 * und Claude-Aufruf. Die atomare Zaehlung selbst steckt in SQL
 * (reserve_scan_quota, Migration 20260914180000) und laesst sich hier
 * nicht ausfuehren; der Nachbau prueft, dass der Kontrollfluss sie
 * richtig benutzt: reservieren vor dem Aufruf, freigeben bei jedem
 * Ausstieg ohne verwertbares Ergebnis.
 *
 * Die geforderten sieben Faelle: innerhalb des Limits, Limit erreicht,
 * parallele Anfragen, anonymer Aufruf, Modellmanipulation durch den
 * Client, Upstream-Fehler, neuer Abrechnungszeitraum.
 */

import {
  ALLOWED_MODELS,
  DEFAULT_MODEL,
  MONTHLY_HARD_CAP,
  QUOTA_RESULT,
  SERVER_CREDIT_ALLOWANCE,
  billingPeriod,
  evaluateQuota,
  resolveModel,
} from '../supabase/functions/analyze-supplement/quota.ts';

let failed = 0;
function check(name, cond, extra = '') {
  if (cond) { console.log(`  ok   ${name}`); }
  else { console.log(`  FAIL ${name} ${extra}`); failed++; }
}

console.log('\n— Grenzen kommen aus der Produktentscheidung, nicht erfunden —');
// Brain/decisions/2026-08-09-supplements-freemium-abo-und-credits.md:
// Pro-Abo mit Fair Use rund 100 Scans je Monat. Derselbe Wert steht in
// Entitlements.js als PRO_MONTHLY_FAIR_USE.
check('Monatsobergrenze ist 100', MONTHLY_HARD_CAP === 100);
check('Server rechnet Credits vorerst nicht an', SERVER_CREDIT_ALLOWANCE === 0);

console.log('\n— Fall 1: Nutzer innerhalb des Limits —');
{
  const first = evaluateQuota({ userId: 'u1', usedInPeriod: 0 });
  check('erster Scan erlaubt', first.allowed === true && first.result === QUOTA_RESULT.ALLOWED);
  check('Restmenge 100', first.remaining === 100, `war ${first.remaining}`);

  const mid = evaluateQuota({ userId: 'u1', usedInPeriod: 99 });
  check('letzter Scan im Limit erlaubt', mid.allowed === true);
  check('Restmenge 1', mid.remaining === 1);
}

console.log('\n— Fall 2: Limit erreicht —');
{
  const exact = evaluateQuota({ userId: 'u1', usedInPeriod: 100 });
  check('bei genau 100 gesperrt', exact.allowed === false && exact.result === QUOTA_RESULT.EXHAUSTED);
  check('Restmenge 0', exact.remaining === 0);

  const over = evaluateQuota({ userId: 'u1', usedInPeriod: 250 });
  check('darueber gesperrt, kein negativer Rest', over.allowed === false && over.remaining === 0);
}

console.log('\n— Fall 4: anonymer Aufruf —');
{
  for (const userId of [null, undefined, '', 0, false]) {
    const anon = evaluateQuota({ userId, usedInPeriod: 0 });
    check(
      `ohne Konto (${JSON.stringify(userId)}) abgelehnt`,
      anon.allowed === false && anon.result === QUOTA_RESULT.UNAUTHENTICATED
    );
  }
  check('ohne Argumente abgelehnt', evaluateQuota().allowed === false);
}

console.log('\n— Fall 7: neuer Abrechnungszeitraum —');
{
  check('Zeitraum als YYYY-MM', /^[0-9]{4}-[0-9]{2}$/.test(billingPeriod(new Date('2026-09-14T10:00:00Z'))));
  check('September', billingPeriod(new Date('2026-09-14T10:00:00Z')) === '2026-09');
  check('Monatswechsel zaehlt neu', billingPeriod(new Date('2026-10-01T00:00:00Z')) === '2026-10');
  // UTC, nicht Geraetezeitzone: Sonst liesse sich der Monatswechsel durch
  // Umstellen der Zeitzone zweimal durchlaufen.
  check(
    'Silvester spaetabends UTC-basiert',
    billingPeriod(new Date('2026-12-31T23:30:00Z')) === '2026-12'
  );
  check(
    'Neujahr frueh UTC-basiert',
    billingPeriod(new Date('2027-01-01T00:30:00Z')) === '2027-01'
  );
  // Ein verbrauchtes Konto ist im neuen Zeitraum wieder frei, weil der
  // Zaehler je (Konto, Zeitraum) gefuehrt wird.
  const neuerMonat = evaluateQuota({ userId: 'u1', usedInPeriod: 0 });
  check('im neuen Zeitraum wieder erlaubt', neuerMonat.allowed === true);
}

console.log('\n— Fall 5: Modellmanipulation durch den Client —');
{
  // resolveModel nimmt NUR den Server-Secret-Wert. Der Request-Body wird
  // in der Function nicht mehr gelesen (Kommentar dort).
  check('ohne Secret der Default', resolveModel(undefined).model === DEFAULT_MODEL);
  check('leeres Secret der Default', resolveModel('   ').model === DEFAULT_MODEL);
  check('Default ist Opus', DEFAULT_MODEL === 'claude-opus-5');
  check('gelistetes Modell wird uebernommen', resolveModel('claude-sonnet-5').model === 'claude-sonnet-5');
  check('uebernommenes Modell als Secret markiert', resolveModel('claude-sonnet-5').fromSecret === true);

  for (const boese of [
    'claude-fable-5',
    'gpt-4',
    'claude-opus-5; DROP TABLE',
    '../../etc/passwd',
    'claude-opus-5 ',
  ]) {
    const resolved = resolveModel(boese);
    if (boese.trim() === 'claude-opus-5') {
      check(`"${boese}" getrimmt akzeptiert`, resolved.model === 'claude-opus-5');
    } else {
      check(`"${boese}" abgewiesen, Default greift`, resolved.model === DEFAULT_MODEL, resolved.model);
    }
  }
  check('Whitelist ist eingefroren', Object.isFrozen(ALLOWED_MODELS));
  check('nur drei Modelle zugelassen', ALLOWED_MODELS.length === 3);
  check(
    'kein teureres Modell als Opus in der Liste',
    !ALLOWED_MODELS.some((m) => m.includes('fable') || m.includes('mythos'))
  );
}

// ────────────────────────────────────────────────────────────
// Nachbau des Kontrollflusses: reservieren, aufrufen, bei Fehler
// freigeben. Ersetzt werden nur Datenbank und Claude-Aufruf.
function makeServer({ cap = MONTHLY_HARD_CAP } = {}) {
  const store = new Map(); // `${userId}:${period}` → used
  const calls = { reserve: 0, release: 0, upstream: 0 };

  // Bildet reserve_scan_quota nach: prueft und erhoeht in EINEM Schritt.
  // Genau das macht die SQL-Function unter einem Row-Lock.
  const reserve = (userId, period) => {
    calls.reserve += 1;
    if (!userId) return { allowed: false };
    const key = `${userId}:${period}`;
    const used = store.get(key) ?? 0;
    if (used >= cap) return { allowed: false, usedAfter: used };
    store.set(key, used + 1);
    return { allowed: true, usedAfter: used + 1 };
  };
  const release = (userId, period) => {
    calls.release += 1;
    const key = `${userId}:${period}`;
    store.set(key, Math.max(0, (store.get(key) ?? 0) - 1));
  };

  // Der Kontrollfluss der Edge Function, auf das Wesentliche verkuerzt.
  const analyze = async ({ userId, period = '2026-09', upstream = 'ok' }) => {
    const decision = evaluateQuota({ userId, usedInPeriod: store.get(`${userId}:${period}`) ?? 0, cap });
    if (decision.result === QUOTA_RESULT.UNAUTHENTICATED) {
      return { status: 401, reason: 'auth_required' };
    }
    const reservation = reserve(userId, period);
    if (!reservation.allowed) return { status: 429, reason: 'quota_exhausted' };

    calls.upstream += 1;
    if (upstream === 'error') {
      release(userId, period);
      return { status: 502 };
    }
    if (upstream === 'refusal') {
      release(userId, period);
      return { status: 422 };
    }
    return { status: 200, result: { productName: 'Testprodukt' } };
  };

  return { analyze, used: (userId, period = '2026-09') => store.get(`${userId}:${period}`) ?? 0, calls };
}

console.log('\n— Fall 3: parallele Anfragen umgehen das Limit nicht —');
{
  const server = makeServer({ cap: 3 });
  // Zehn gleichzeitige Anfragen auf ein Kontingent von drei.
  const antworten = await Promise.all(
    Array.from({ length: 10 }, () => server.analyze({ userId: 'u-par' }))
  );
  const ok = antworten.filter((a) => a.status === 200).length;
  const gesperrt = antworten.filter((a) => a.status === 429).length;

  check('genau drei kommen durch', ok === 3, `waren ${ok}`);
  check('sieben werden gesperrt', gesperrt === 7, `waren ${gesperrt}`);
  check('Zaehler steht auf 3, nicht hoeher', server.used('u-par') === 3, `war ${server.used('u-par')}`);
  check('nur drei Upstream-Aufrufe', server.calls.upstream === 3, `waren ${server.calls.upstream}`);
}

console.log('\n— Fall 6: Upstream-Fehler kostet kein Kontingent —');
{
  const server = makeServer();
  const fehler = await server.analyze({ userId: 'u-err', upstream: 'error' });
  check('Fehler wird gemeldet', fehler.status === 502);
  check('Kontingent wieder freigegeben', server.used('u-err') === 0, `war ${server.used('u-err')}`);
  check('Freigabe wurde aufgerufen', server.calls.release === 1);

  const abgelehnt = await server.analyze({ userId: 'u-err', upstream: 'refusal' });
  check('Modell-Ablehnung gemeldet', abgelehnt.status === 422);
  check('auch dort freigegeben', server.used('u-err') === 0);

  const gut = await server.analyze({ userId: 'u-err' });
  check('erfolgreicher Scan zaehlt', gut.status === 200 && server.used('u-err') === 1);
}

console.log('\n— Faelle 1, 2, 4, 7 im Kontrollfluss —');
{
  const server = makeServer({ cap: 2 });
  check('anonym: 401, kein Upstream', (await server.analyze({ userId: null })).status === 401);
  check('kein Upstream-Aufruf fuer anonym', server.calls.upstream === 0);

  check('erster Scan 200', (await server.analyze({ userId: 'u-x' })).status === 200);
  check('zweiter Scan 200', (await server.analyze({ userId: 'u-x' })).status === 200);
  const dritter = await server.analyze({ userId: 'u-x' });
  check('dritter Scan 429', dritter.status === 429 && dritter.reason === 'quota_exhausted');
  check('kein Upstream-Aufruf nach Sperre', server.calls.upstream === 2);

  // Neuer Abrechnungszeitraum: dasselbe Konto ist wieder frei.
  check(
    'im Folgemonat wieder erlaubt',
    (await server.analyze({ userId: 'u-x', period: '2026-10' })).status === 200
  );
  check('alter Zeitraum bleibt verbraucht', server.used('u-x', '2026-09') === 2);
}

console.log(`\n${failed === 0 ? 'ALLE TESTS BESTANDEN' : failed + ' FEHLER'}\n`);
process.exit(failed === 0 ? 0 : 1);
