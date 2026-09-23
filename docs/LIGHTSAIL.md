# AWS Lightsail setup for ZuriK

Follow this from an empty Lightsail account through a running site. One Ubuntu instance runs the whole app.

| Piece | Where it runs | Address |
|---|---|---|
| Website (storefront, account, admin) | Next.js, systemd service `zurik-web` | `https://example.com` → `127.0.0.1:3000` |
| API | NestJS, systemd service `zurik-api` | `https://api.example.com` → `127.0.0.1:3001` |
| Database | PostgreSQL 15 container `zurik-postgres` | `127.0.0.1:5432` only |
| HTTPS | Nginx on the instance | ports 80 and 443 |

Images are stored in Cloudinary. The instance disk holds the Postgres Docker volume, the app code, and backup dumps.

Run one app instance. Order, abandoned-cart, and review emails are scheduled inside the API process. A second API process sends them twice.

The file `docker-compose.yml` at the repository root is for a laptop. On the server, Postgres comes from `deploy/lightsail/docker-compose.db.yml`. `DEPLOYMENT_SIMPLE.md` describes an older app. Use this file instead.

Throughout this guide the domain is `example.com`. Use your real domain in its place. On the server you will save it once:

```bash
echo 'example.com' | sudo tee /etc/zurik/domain
```

Later commands read it back with `DOMAIN=$(cat /etc/zurik/domain)`.

## What you need before the console

- An AWS account that can open Lightsail
- A domain, and access to its DNS or registrar
- A Cloudinary account
- SMTP credentials
- Stripe and Paystack keys when you take payment
- A Google OAuth client if you want Google sign-in

Confirm the 4 GB instance price in the Lightsail console before you create it. A static IP is free while it is attached to a running instance.

## 1. Create the instance

1. Lightsail home → **Create instance**.
2. Region: closest to your customers.
3. Platform: **Linux/Unix**. Blueprint: **OS Only** → **Ubuntu 24.04 LTS**.
4. Plan: **4 GB RAM**. Postgres, the API, and the Next.js build share this memory. The swap file in step 5 covers the build spike.
5. Name: `zurik-app`.
6. Create the instance. Wait until it is **Running**.

### Firewall

Open the instance → **Networking** → **IPv4 Firewall**. Add:

| Application | Protocol | Port | Source |
|---|---|---|---|
| HTTP | TCP | 80 | Anywhere `0.0.0.0/0` |
| HTTPS | TCP | 443 | Anywhere `0.0.0.0/0` |
| SSH | TCP | 22 | Your current IP, if the console allows it |

Leave 3000, 3001, and 5432 closed. Those stay on localhost. Do not add AAAA records later, so the IPv6 firewall can stay as Lightsail created it.

### Static IP

On the same Networking tab, **Create static IP**. Attach it to `zurik-app`. Name it `zurik-ip`. Copy the address. DNS and SSH use this address. If the static IP is detached, the instance address changes the next time it stops.

### Snapshots

Open the instance **Snapshots** tab and turn on automatic snapshots. The Docker volume lives on this disk, so a snapshot includes the database. Take a manual snapshot before every code deploy as well. Step 8 also writes a logical `pg_dump`, which restores more cleanly than a snapshot of a running database.

## 2. Point DNS at the static IP

Create three A records. The value is the static IP from step 1.

| Name | Type | Value |
|---|---|---|
| `@` | A | static IP |
| `www` | A | static IP |
| `api` | A | static IP |

**Lightsail DNS.** Networking → **Create DNS zone** → your domain. Add the three records. Copy the four name servers Lightsail shows, and set those as the name servers at the registrar.

**DNS you already manage.** Add the same three records there. On Cloudflare, set them to **DNS only** until the certificate in step 12 exists. A proxied record makes Let's Encrypt talk to Cloudflare instead of this instance.

From your own computer:

```bash
dig +short example.com
dig +short www.example.com
dig +short api.example.com
```

Each line must be the static IP before you request a certificate. Propagation can take from a few minutes to a few hours.

## 3. Log in

Lightsail has a separate default SSH key for each region. Download the key for this instance's region: account menu → **Account** → **SSH keys**.

```bash
chmod 400 ~/Downloads/LightsailDefaultKey-*.pem
ssh -i ~/Downloads/LightsailDefaultKey-*.pem ubuntu@STATIC_IP
```

The browser SSH button on the instance page works too. A local terminal is easier when you copy database dumps off the server.

From here through step 12, commands run on the instance as `ubuntu`.

## 4. Update the OS and set the clock

Scheduled mail uses the instance clock. `EVERY_DAY_AT_10AM` is 10:00 in the timezone you set. Pick the zone where the business operates.

```bash
sudo apt-get update
sudo apt-get upgrade -y
sudo timedatectl set-timezone Africa/Lagos
timedatectl
```

## 5. Add swap

```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
free -h
```

Leave the swap file in place after the build.

## 6. Install Docker, Node 20, and Nginx

```bash
sudo apt-get install -y ca-certificates curl gnupg git build-essential python3 nginx certbot postgresql-client
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
sudo systemctl enable --now docker
docker compose version

curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
node -v
npm -v
nginx -v
```

`node -v` must print `v20.x`. `docker compose version` must print a v2 version. Leave `ufw` off. The Lightsail firewall from step 1 is the firewall for this machine.

## 7. Create the app user

```bash
sudo adduser --system --group --home /home/zurik --shell /bin/bash zurik
sudo mkdir -p /etc/zurik /var/www/certbot /var/backups/zurik /opt/zurik
sudo chown zurik:zurik /opt/zurik
sudo chmod 700 /var/backups/zurik
echo 'example.com' | sudo tee /etc/zurik/domain
```

Change `example.com` in that last command to your apex domain before you run it.

## 8. Clone the repository

Public repository. Clone the branch that contains `deploy/lightsail`. `main` does not have those files until that branch is merged.

```bash
sudo -u zurik -H git clone -b cursor/lightsail-setup-guide-35ca https://github.com/getnuevetech/ZuriK.git /opt/zurik
```

If `/opt/zurik` is already a clone of `main`, switch it instead of cloning again:

```bash
sudo -u zurik -H git -C /opt/zurik fetch origin cursor/lightsail-setup-guide-35ca
sudo -u zurik -H git -C /opt/zurik checkout cursor/lightsail-setup-guide-35ca
```

Private repository:

```bash
sudo -u zurik -H ssh-keygen -t ed25519 -f /home/zurik/.ssh/id_ed25519 -N ""
sudo cat /home/zurik/.ssh/id_ed25519.pub
```

GitHub → `getnuevetech/ZuriK` → **Settings** → **Deploy keys** → **Add deploy key**. Paste the public key. Leave write access off.

```bash
sudo -u zurik -H bash -lc 'ssh-keyscan github.com >> ~/.ssh/known_hosts'
sudo -u zurik -H git clone -b cursor/lightsail-setup-guide-35ca git@github.com:getnuevetech/ZuriK.git /opt/zurik
```

## 9. Start Postgres in Docker

Generate the database password and save it in a password manager:

```bash
openssl rand -base64 32
```

```bash
sudo cp /opt/zurik/deploy/lightsail/env/db.env.example /etc/zurik/db.env
sudoedit /etc/zurik/db.env
sudo chown root:root /etc/zurik/db.env
sudo chmod 600 /etc/zurik/db.env
```

The file contents are the raw password, not the URL-encoded form:

```
POSTGRES_DB=african_fashion_db
POSTGRES_USER=zurik
POSTGRES_PASSWORD=the raw password
```

```bash
sudo cp /opt/zurik/deploy/lightsail/systemd/zurik-db.service /etc/systemd/system/zurik-db.service
sudo systemctl daemon-reload
sudo systemctl enable --now zurik-db
sudo docker ps
```

`zurik-db` runs `docker compose up -d --wait` on `deploy/lightsail/docker-compose.db.yml`. The container name is `zurik-postgres`. Port 5432 is published on `127.0.0.1` only. Data is the Docker volume `zurik_postgres`.

`docker ps` should show the container as healthy. Then:

```bash
PGPASSWORD='the raw password' psql \
  "host=127.0.0.1 port=5432 dbname=african_fashion_db user=zurik sslmode=disable" \
  -c 'select version();'
```

The version string must print. `POSTGRES_PASSWORD` is read only when the volume is first created. Editing `db.env` later does not change the password inside an existing volume. `docker compose down -v` deletes that volume.

Install the nightly dump. It keeps seven days on the instance:

```bash
sudo tee /etc/cron.daily/zurik-pgdump >/dev/null <<'EOF'
#!/bin/bash
set -euo pipefail
umask 077
docker exec zurik-postgres pg_dump -U zurik african_fashion_db \
  | gzip > "/var/backups/zurik/african_fashion_db-$(date +%F).sql.gz"
find /var/backups/zurik -name 'african_fashion_db-*.sql.gz' -mtime +7 -delete
EOF
sudo chmod 755 /etc/cron.daily/zurik-pgdump
sudo bash /etc/cron.daily/zurik-pgdump
ls -l /var/backups/zurik
```

Copy those `.sql.gz` files off the instance on a schedule you control. Restore one into the same database with:

```bash
gunzip -c /var/backups/zurik/african_fashion_db-DATE.sql.gz \
  | sudo docker exec -i zurik-postgres psql -U zurik -d african_fashion_db
```

## 10. Configure the API

Generate two different JWT secrets:

```bash
openssl rand -base64 32
openssl rand -base64 32
```

URL-encode the database password from step 9:

```bash
python3 -c 'import urllib.parse; print(urllib.parse.quote(input("Database password: "), safe=""))'
```

```bash
sudo cp /opt/zurik/deploy/lightsail/env/api.env.example /etc/zurik/api.env
sudo chown root:zurik /etc/zurik/api.env
sudo chmod 640 /etc/zurik/api.env
sudoedit /etc/zurik/api.env
```

Set these now. Cloudinary, SMTP, Stripe, Paystack, and Google can stay as the placeholders until step 14. The API starts without them. Mail, uploads, and payments fail until they are filled in.

`DOMAIN` below is your apex, already saved in `/etc/zurik/domain`.

```
NODE_ENV=production
PORT=3001
TRUST_PROXY=1
DATABASE_SSL=false
DATABASE_URL=postgresql://zurik:URL_ENCODED_PASSWORD@127.0.0.1:5432/african_fashion_db
FRONTEND_URL=https://example.com
JWT_ACCESS_SECRET=first openssl value
JWT_REFRESH_SECRET=second openssl value
```

`DATABASE_SSL=false` stays. This Postgres container does not speak TLS, and the connection stays on the loopback interface. Do not append `?sslmode=require` to `DATABASE_URL`.

`FRONTEND_URL` is the site origin the browser uses. Nginx sends `www` to the apex, so one origin is enough. Quote a value in this file only when it contains a space. systemd removes one pair of double quotes. The template already quotes `SMTP_FROM`.

## 11. Build the website and start both apps

`NEXT_PUBLIC_API_URL` is compiled into the browser bundle. Changing it later has no effect until you build again.

```bash
sudo cp /opt/zurik/deploy/lightsail/env/web.env.example /etc/zurik/web.env
sudo chown root:zurik /etc/zurik/web.env
sudo chmod 640 /etc/zurik/web.env
sudoedit /etc/zurik/web.env
```

```
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://api.example.com
NEXT_PUBLIC_APP_URL=https://example.com
```

Build. The first run downloads dependencies and compiles Next.js. On a 4 GB instance with swap, expect several minutes.

```bash
sudo -u zurik -H bash -lc 'cd /opt/zurik && npm ci && npm run build'
sudo -u zurik -H bash /opt/zurik/deploy/lightsail/scripts/build-web.sh
```

The web script prints `Standalone server ready at ...` and links that directory to `/opt/zurik/frontend/.next/standalone-run`.

```bash
sudo cp /opt/zurik/deploy/lightsail/systemd/zurik-api.service /etc/systemd/system/zurik-api.service
sudo cp /opt/zurik/deploy/lightsail/systemd/zurik-web.service /etc/systemd/system/zurik-web.service
sudo systemctl daemon-reload
sudo systemctl enable --now zurik-api
sudo systemctl enable --now zurik-web
```

Boot order is Docker, then `zurik-db`, then `zurik-api`, then `zurik-web`. The first API start creates the tables. TypeORM schema sync is on in production, and the repository has no migration that creates the schema. Do not run `npm run typeorm:run`. Do not run `npm run seed` or `npm run seed:prod`. The seed writes `admin@africanfashion.com` with password `Password123!`.

```bash
sudo journalctl -u zurik-api -n 80 --no-pager
curl -fsS http://127.0.0.1:3001/health
curl -fsS -o /dev/null -w "%{http_code}\n" http://127.0.0.1:3000/
```

`/health` returns `{"status":"ok"}`. The second command prints `200`. If the API exits, read the journal. Typical causes are a wrong `DATABASE_URL`, `DATABASE_SSL` missing, Postgres not healthy, or an empty `FRONTEND_URL`.

## 12. Turn on HTTPS

DNS from step 2 must already return the static IP.

```bash
DOMAIN=$(cat /etc/zurik/domain)
sudo sed "s/example\\.com/${DOMAIN}/g" \
  /opt/zurik/deploy/lightsail/nginx/zurik-http.conf \
  | sudo tee /etc/nginx/sites-available/zurik.conf >/dev/null
sudo ln -sfn /etc/nginx/sites-available/zurik.conf /etc/nginx/sites-enabled/zurik.conf
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

That rewrite turns `example.com` into your apex, `www.example.com` into `www.` plus the apex, and `api.example.com` into `api.` plus the apex.

```bash
DOMAIN=$(cat /etc/zurik/domain)
sudo certbot certonly --webroot -w /var/www/certbot \
  -d "$DOMAIN" -d "www.$DOMAIN" -d "api.$DOMAIN" \
  --agree-tos -m "admin@${DOMAIN}" --no-eff-email
```

Use a mailbox you actually read for the `-m` address.

```bash
DOMAIN=$(cat /etc/zurik/domain)
sudo sed "s/example\\.com/${DOMAIN}/g" \
  /opt/zurik/deploy/lightsail/nginx/zurik.conf \
  | sudo tee /etc/nginx/sites-available/zurik.conf >/dev/null
sudo nginx -t
sudo systemctl reload nginx
```

Nginx now redirects HTTP to HTTPS, redirects `www` to the apex, proxies the apex to port 3000, and proxies `api` to port 3001. The upload limit is 55 MB.

Reload Nginx when the certificate renews:

```bash
sudo tee /etc/letsencrypt/renewal-hooks/deploy/reload-nginx.sh >/dev/null <<'EOF'
#!/bin/bash
systemctl reload nginx
EOF
sudo chmod 755 /etc/letsencrypt/renewal-hooks/deploy/reload-nginx.sh
sudo systemctl status certbot.timer
```

`certbot.timer` should be active. From your own computer, with your domain:

```bash
curl -fsS https://api.example.com/health
curl -fsS -o /dev/null -w "%{http_code}\n" https://example.com/
```

Open `https://example.com`. `http://example.com` and `https://www.example.com` should both land on `https://example.com`.

## 13. Create the first admin

The register form creates a customer, designer, or fabric seller. Register your own account on the site, then promote it:

```bash
PGPASSWORD='the raw password' psql \
  "host=127.0.0.1 port=5432 dbname=african_fashion_db user=zurik sslmode=disable" \
  -c "update users set role = 'admin', \"isEmailVerified\" = true where email = 'you@example.com';"
```

Sign out and sign in again so the new token carries the admin role.

## 14. Connect Cloudinary, email, payments, and Google

Edit `/etc/zurik/api.env` and replace the remaining placeholders from `deploy/lightsail/env/api.env.example`. Then:

```bash
sudo systemctl restart zurik-api
```

Register these URLs with the providers. `example.com` is your apex.

| Provider | URL |
|---|---|
| Stripe webhook | `https://api.example.com/payments/webhooks/stripe` |
| Paystack webhook | `https://api.example.com/payments/webhooks/paystack` |
| Google authorized redirect URI | `https://api.example.com/auth/google/callback` |
| Checkout return URL | `https://example.com/payments/callback` |

`PAYMENT_CALLBACK_URL` in `/etc/zurik/api.env` is that checkout return URL. Google sign-in stays off until both `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set. SMTP errors are logged and do not block registration:

```bash
sudo journalctl -u zurik-api -n 50 --no-pager
```

Hero banners accept up to 50 MB. Product images accept up to 5 MB.

## 15. Deploy a later change

Snapshot the instance in the Lightsail console, then dump the database:

```bash
sudo bash /etc/cron.daily/zurik-pgdump
sudo bash /opt/zurik/deploy/lightsail/scripts/build-and-restart.sh
```

The script fast-forwards git, builds the API, rebuilds the website from `/etc/zurik/web.env`, waits for `/health`, and restarts the API and the website. The Postgres container keeps running.

Change `NEXT_PUBLIC_API_URL` or `NEXT_PUBLIC_APP_URL` only in `/etc/zurik/web.env`, then run that script. A restart without a build keeps the previous URL in the browser bundle.

If the pull changes `docker-compose.db.yml`:

```bash
sudo systemctl restart zurik-db
```

## Checks

```bash
sudo systemctl status zurik-db zurik-api zurik-web nginx
sudo docker ps
sudo journalctl -u zurik-api -f
sudo journalctl -u zurik-web -f
curl -fsS http://127.0.0.1:3001/health
```

`/health` means the API process is up. It does not query Postgres. `sudo docker logs zurik-postgres` is the database log.

## Stop or resize

Stopping the instance from the Lightsail console stops Postgres with it. The static IP stays attached, and DNS stays valid. On the next boot, Docker starts, then Postgres, then the API, then the website, and the same Docker volume is reused.

To resize: snapshot `zurik-app`, create a new instance from that snapshot, attach `zurik-ip` to the new instance, and stop the old one.

## When a step fails

**`dig` does not show the static IP.** Wait for the name servers, or fix the A records. Certificate requests fail until this matches.

**`docker ps` has no `zurik-postgres`, or it is not healthy.** `sudo systemctl status zurik-db` and `sudo docker logs zurik-postgres`. The first start can take a few seconds. A password edited in `db.env` after the volume exists is ignored. The password that worked at first start is still the one in the volume.

**`psql` succeeds and the API restarts.** `DATABASE_URL` must use `127.0.0.1`, user `zurik`, and the URL-encoded password. `DATABASE_SSL` must be `false`. `sudo journalctl -u zurik-api -n 100 --no-pager` prints a missing `FRONTEND_URL` or JWT secret directly.

**The site loads and API calls fail in the browser.** Rebuild after fixing `NEXT_PUBLIC_API_URL` in `/etc/zurik/web.env`. `FRONTEND_URL` must match the address bar, including `https://`.

**Pages return 429.** The API allows 3 requests per second per visitor, then 20 per 10 seconds, then 100 per minute. `TRUST_PROXY=1` must be set. After a restart the log should contain `Trusting one reverse-proxy hop`.

**Certbot fails.** `dig +short` for the apex, `www`, and `api` must be the static IP. Cloudflare must be DNS-only. Port 80 must be open in the instance firewall. The HTTP Nginx site from the start of step 12 must be loaded.

**Uploads fail.** Fill the three `CLOUDINARY_` values and restart `zurik-api`. The API log has the Cloudinary error.

**Google returns to the wrong host.** `GOOGLE_CALLBACK_URL` and the Google console redirect URI are both `https://api.example.com/auth/google/callback`. The API then sends the browser to `FRONTEND_URL/auth/google/callback`.
