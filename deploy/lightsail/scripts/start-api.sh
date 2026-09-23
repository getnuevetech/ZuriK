#!/bin/bash
# Loads the Lightsail database CA into DATABASE_CA_CERT, then starts the API.
# systemd EnvironmentFile has already exported the rest of the variables.
set -euo pipefail

CA_FILE="${DATABASE_CA_FILE:-/etc/zurik/lightsail-ca.pem}"
if [[ -f "$CA_FILE" ]]; then
  DATABASE_CA_CERT="$(cat "$CA_FILE")"
  export DATABASE_CA_CERT
fi

cd /opt/zurik
exec /usr/bin/node dist/main.js
