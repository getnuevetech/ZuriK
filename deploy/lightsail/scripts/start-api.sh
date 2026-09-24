#!/bin/bash
# Starts the API. systemd EnvironmentFile has already exported the variables.
# A CA file is optional. The Docker Postgres container on this host does not use one.
set -euo pipefail

CA_FILE="${DATABASE_CA_FILE:-/etc/zurik/lightsail-ca.pem}"
if [[ -f "$CA_FILE" ]]; then
  DATABASE_CA_CERT="$(cat "$CA_FILE")"
  export DATABASE_CA_CERT
fi

cd /opt/zurik
exec /usr/bin/node dist/main.js
