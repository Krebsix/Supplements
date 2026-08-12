#!/bin/bash
#
# build-icons.sh
# ─────────────────────────────────────────────────────────────
# Erzeugt die vier App-Assets aus den SVG-Quellen in assets/source/.
# Aufruf: npm run build:icons
#
# WARUM EIN SKRIPT UND KEINE HANDARBEIT:
# Die PNGs sind erzeugte Artefakte. Wer das Icon aendert, aendert das SVG
# und laesst neu bauen — sonst driften Quelle und Ergebnis auseinander, und
# niemand weiss spaeter, welche Datei die Wahrheit ist.
#
# ALPHA-KANAL:
# Apple lehnt App-Icons mit Alpha-Kanal ab ("Icons must not have an alpha
# channel"). rsvg-convert schreibt aber immer RGBA. Der Umweg ueber BMP
# entfernt den Kanal verlustfrei — BMP speichert 24 Bit RGB ohne Kompression,
# PNG danach wieder verlustfrei.
# Das Android-Vordergrundbild ist die Ausnahme: Es MUSS transparent bleiben,
# damit die backgroundColor aus app.json durchscheint.
#
# Voraussetzung: rsvg-convert (brew install librsvg)

set -euo pipefail
cd "$(dirname "$0")/.."

if ! command -v rsvg-convert >/dev/null 2>&1; then
  echo "Fehlt: rsvg-convert. Installieren mit: brew install librsvg" >&2
  exit 1
fi

SRC="assets/source"
OUT="assets"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

# PNG ohne Alpha-Kanal schreiben (Umweg ueber BMP, siehe oben)
render_opaque() {
  local svg="$1" size="$2" target="$3"
  rsvg-convert -w "$size" -h "$size" "$svg" -o "$TMP/step.png"
  sips -s format bmp "$TMP/step.png" --out "$TMP/step.bmp" >/dev/null
  sips -s format png "$TMP/step.bmp" --out "$target" >/dev/null
}

render_opaque "$SRC/icon.svg"   1024 "$OUT/icon.png"
render_opaque "$SRC/icon.svg"    196 "$OUT/favicon.png"
render_opaque "$SRC/splash.svg" 1284 "$OUT/splash.png"

# Android-Vordergrund: Transparenz bleibt erhalten
rsvg-convert -w 1024 -h 1024 "$SRC/adaptive-icon.svg" -o "$OUT/adaptive-icon.png"

echo "Gebaut:"
for f in "$OUT/icon.png" "$OUT/favicon.png" "$OUT/splash.png" "$OUT/adaptive-icon.png"; do
  printf '  %-28s %s  alpha=%s\n' "$f" \
    "$(sips -g pixelWidth -g pixelHeight "$f" | awk '/pixel/{printf "%s ", $2}')" \
    "$(sips -g hasAlpha "$f" | awk '/hasAlpha/{print $2}')"
done
