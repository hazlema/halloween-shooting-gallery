#!/usr/bin/env bash
# Build an itch.io HTML5 upload: a zip with index.html at its root.
set -euo pipefail
cd "$(dirname "$0")/.."
FILES=(index.html style.css fonts.css tuning.js sim.js art.js audio.js main.js)
mkdir -p dist
OUT=dist/midnight-carnival-itch.zip
rm -f "$OUT"
zip -9 -X "$OUT" "${FILES[@]}"
echo "Built $OUT ($(du -h "$OUT" | cut -f1))"
