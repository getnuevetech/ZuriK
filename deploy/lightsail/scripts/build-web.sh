#!/bin/bash
# Build the Next.js app and assemble the standalone server directory.
# Run as the zurik user. Requires /etc/zurik/web.env.
set -euo pipefail

ROOT=/opt/zurik
ENV_FILE=/etc/zurik/web.env

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Missing $ENV_FILE" >&2
  exit 1
fi

set -a
# shellcheck disable=SC1090
source "$ENV_FILE"
set +a

cd "$ROOT/frontend"
# web.env sets NODE_ENV=production. Plain `npm ci` would then skip
# tailwindcss, postcss, and typescript, and `next build` would fail.
npm ci --include=dev
npm run build

STANDALONE=""
if [[ -f "$ROOT/frontend/.next/standalone/server.js" ]]; then
  STANDALONE="$ROOT/frontend/.next/standalone"
elif [[ -f "$ROOT/frontend/.next/standalone/frontend/server.js" ]]; then
  STANDALONE="$ROOT/frontend/.next/standalone/frontend"
else
  echo "Could not find the Next.js standalone server.js" >&2
  exit 1
fi

mkdir -p "$STANDALONE/.next"
rm -rf "$STANDALONE/.next/static" "$STANDALONE/public"
cp -a "$ROOT/frontend/.next/static" "$STANDALONE/.next/static"
if [[ -d "$ROOT/frontend/public" ]]; then
  cp -a "$ROOT/frontend/public" "$STANDALONE/public"
fi

# systemd reads this path. It is a symlink so either standalone layout works.
ln -sfn "$STANDALONE" /opt/zurik/frontend/.next/standalone-run
echo "Standalone server ready at $STANDALONE"
