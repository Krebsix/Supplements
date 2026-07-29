/**
 * i18n/en/index.js
 * Merges the English section catalogues.
 * Missing keys fall back to German — see i18n/index.js.
 */

import addSupplement from './addSupplement';
import common from './common';
import components from './components';
import dashboard from './dashboard';
import history from './history';
import home from './home';
import logic from './logic';
import reference from './reference';
import results from './results';
import scanner from './scanner';
import search from './search';
import settings from './settings';
import stack from './stack';

export default {
  ...common,
  ...components,
  ...logic,
  ...reference,
  ...home,
  ...dashboard,
  ...addSupplement,
  ...scanner,
  ...results,
  ...search,
  ...history,
  ...settings,
  ...stack,
};
