#!/bin/bash
# Pull, build both apps, and restart them. Run on the server as root:
#   sudo bash /opt/zurik/deploy/lightsail/scripts/build-and-restart.sh
set -euo pipefail

if [[ "$(id -u)" -ne 0 ]]; then
  echo "Run as root: sudo bash $0" >&2
  exit 1
fi

cd /opt/zurik
sudo -u zurik -H git pull --ff-only
sudo -u zurik -H npm ci
sudo -u zurik -H npm run build
sudo -u zurik -H bash /opt/zurik/deploy/lightsail/scripts/build-web.sh

systemctl restart zurik-api
for _ in $(seq 1 30); do
  if curl -fsS http://127.0.0.1:3001/health >/dev/null; then
    break
  fi
  sleep 1
done
curl -fsS http://127.0.0.1:3001/health
echo
systemctl restart zurik-web
sleep 2
curl -fsS -o /dev/null -w "web %{http_code}\n" http://127.0.0.1:3000/
echo "Restarted zurik-api and zurik-web"
