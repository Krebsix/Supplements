const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Metro waehlt sonst per `import`-Bedingung die ESM-Builds von zustand & Co,
// die `import.meta.env` fuer Dev-Warnungen nutzen. Metro polyfillt import.meta
// nicht (Absturz "Cannot use 'import.meta' outside a module", nur Web-Build
// betroffen, native laeuft ueber die `react-native`-Bedingung). Ohne
// Package-Exports-Aufloesung greift ueberall das universelle `main`-Feld.
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
