#!/usr/bin/env bash

set -euo pipefail
shopt -s nullglob

if ! command -v sips >/dev/null 2>&1; then
  echo "sips is required to convert HEIC images on macOS."
  exit 1
fi

for file in public/cards/*.{heic,HEIC}; do
  output="${file%.*}.jpg"
  sips \
    -s format jpeg \
    -s formatOptions 80 \
    --resampleHeightWidthMax 1400 \
    "$file" \
    --out "$output" >/dev/null
  echo "Prepared $(basename "$output")"
done
