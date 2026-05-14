#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DIST="$ROOT/dist"
VERSION=$(grep '"version"' "$ROOT/manifest.json" | head -1 | sed 's/.*: *"\([^"]*\)".*/\1/')

rm -rf "$DIST"
mkdir -p "$DIST"

SHARED_FILES=(
  js/background.js
  js/content.js
  js/interceptor.js
  js/interceptor-loader.js
  js/patterns.js
  js/popup.js
  js/results.js
  css/popup.css
  css/results.css
  icons/icon16.png
  icons/icon48.png
  icons/icon128.png
  popup.html
  results.html
)

# --- Chrome build ---
CHROME_DIR="$DIST/chrome"
mkdir -p "$CHROME_DIR"/{js,css,icons}
cp "$ROOT/manifest.json" "$CHROME_DIR/manifest.json"
for f in "${SHARED_FILES[@]}"; do
  cp "$ROOT/$f" "$CHROME_DIR/$f"
done
(cd "$CHROME_DIR" && zip -r "$DIST/keyfinder-v${VERSION}-chrome.zip" . -x '.*')
echo "Built: dist/keyfinder-v${VERSION}-chrome.zip"

# --- Firefox build ---
FF_DIR="$DIST/firefox"
mkdir -p "$FF_DIR"/{js,css,icons}
cp "$ROOT/manifest.firefox.json" "$FF_DIR/manifest.json"
for f in "${SHARED_FILES[@]}"; do
  cp "$ROOT/$f" "$FF_DIR/$f"
done
(cd "$FF_DIR" && zip -r "$DIST/keyfinder-v${VERSION}-firefox.zip" . -x '.*')
echo "Built: dist/keyfinder-v${VERSION}-firefox.zip"

echo "Done. Upload dist/keyfinder-v${VERSION}-firefox.zip to addons.mozilla.org"
