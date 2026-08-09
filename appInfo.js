/**
 * appInfo.js
 * Zentrale App-Identitaet fuer Stellen, die den Namen nach aussen tragen
 * (Bericht-Fusszeile, spaeter Website-Links).
 *
 * Bewusst ein eigenes Modul statt expo-constants: ExportBuilder.js laeuft
 * auch im Node-Testbundle, wo native Expo-Module nichts verloren haben.
 *
 * NAME IST NOCH NICHT ENTSCHIEDEN (Stand 2026-08-09, Recherche laeuft).
 * Bis dahin traegt die App den Arbeitstitel. Beim Umbenennen: hier UND in
 * app.json (name/slug) aendern.
 */

export const APP_NAME = 'Supplement OS';
