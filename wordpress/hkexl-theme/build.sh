#!/bin/sh
# Build the React app for this theme and package hkexl-theme.zip in exports/.
set -e
root="$(cd "$(dirname "$0")/../.." && pwd)"
theme="$root/wordpress/hkexl-theme"
stage="$root/exports/theme-build/hkexl"

cd "$root"
npx vite build --base=/wp-content/themes/hkexl/app/ --outDir "$theme/app" --emptyOutDir
rm -f "$theme/app/robots.txt" "$theme/app/sitemap.xml" "$theme/app/googlefe8d33e945c29a74.html"
rm -rf "$theme/app/assets/original"

rm -rf "$root/exports/theme-build" && mkdir -p "$stage"
cp "$theme/style.css" "$theme/functions.php" "$theme/index.php" "$stage/"
cp -R "$theme/app" "$stage/app"
rm -f "$root/exports/hkexl-theme.zip"
(cd "$root/exports/theme-build" && zip -qr "$root/exports/hkexl-theme.zip" hkexl)
ls -lh "$root/exports/hkexl-theme.zip"
