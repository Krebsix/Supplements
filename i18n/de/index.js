/**
 * i18n/de/index.js
 * Fuehrt die deutschen Bereichs-Kataloge zusammen.
 *
 * Aufgeteilt nach Bildschirm/Bereich, damit die Dateien handhabbar bleiben
 * und mehrere Aenderungen sich nicht gegenseitig ins Gehege kommen.
 * Die Schluessel selbst bleiben flach ('home.title'), das Nachschlagen
 * bleibt dadurch ein einfacher Objektzugriff.
 *
 * Deutsch ist die Pflegesprache: Ein neuer Text entsteht hier zuerst,
 * die englische Fassung darf nachlaufen (siehe i18n/index.js, Fallback).
 */

import addSupplement from './addSupplement';
import analyzer from './analyzer';
import analysis from './analysis';
import common from './common';
import complaint from './complaint';
import components from './components';
import dashboard from './dashboard';
import history from './history';
import home from './home';
import lab from './lab';
import logic from './logic';
import notifications from './notifications';
import onboarding from './onboarding';
import reference from './reference';
import outcome from './outcome';
import profile from './profile';
import results from './results';
import scanner from './scanner';
import search from './search';
import settings from './settings';
import stack from './stack';

export default {
  ...common,
  ...analyzer,
  ...analysis,
  ...components,
  ...complaint,
  ...logic,
  ...lab,
  ...notifications,
  ...onboarding,
  ...reference,
  ...home,
  ...dashboard,
  ...addSupplement,
  ...profile,
  ...outcome,
  ...scanner,
  ...results,
  ...search,
  ...history,
  ...settings,
  ...stack,
};
