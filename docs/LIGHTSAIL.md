# AWS Lightsail setup for ZuriK

This is the server setup for this repository. One Ubuntu instance runs all three pieces:

| Piece | How it runs | Public URL |
|---|---|---|
| Storefront, account, and admin UI | Next.js in `frontend/`, systemd | `https://example.com` |
| API | NestJS from the repo root, systemd | `https://api.example.com` |
| Database | PostgreSQL 15 in Docker | not public |

Nginx is the only process that faces the internet. The API listens on `127.0.0.1:3001`. The website listens on `127.0.0.1:3000`. Postgres listens on `127.0.0.1:5432`. Images go to Cloudinary, so the instance does not store uploads.

Use one app instance. Abandoned-cart, order, and review emails are scheduled inside the API process. A second copy of the API sends those twice.

Replace `example.com` everywhere below with the domain you will actually serve. Commands are meant to be copied in order.

`DEPLOYMENT_SIMPLE.md` describes a different, older app. Do not follow it. The `docker-compose.yml` file at the repo root is for local development. On the server, start Postgres only from `deploy/lightsail/docker-compose.db.yml`.

## What you create in Lightsail

| Resource | Choice |
|---|---|
| App instance | Ubuntu 24.04 LTS, OS Only blueprint. 4 GB RAM. A 2 GB instance can build this app only with the swap file in step 5, and the build is easy to run out of memory. |
| Static IP | One static IP attached to the app instance. |
| DNS | `example.com`, `www.example.com`, and `api.example.com` as A records to that static IP. |

Postgres is a Docker container on that instance. There is no separate Lightsail database. Confirm the instance price in the console before you create it. A static IP is free while it is attached. Detaching it and leaving it unused is billed.

You also need, outside Lightsail:

- A domain you control
- A Cloudinary account
- SMTP credentials (Gmail app password, or another provider)
- Stripe and/or Paystack live keys, when you take payments
- A Google OAuth client, if you want Google sign-in

## 1. Create the app instance

1. From the Lightsail home page choose **Create instance**.
2. Pick the region closest to your customers. The database lives on this instance, so there is no second region to match.
3. Platform: **Linux/Unix**. Blueprint: **OS Only**, **Ubuntu 24.04 LTS**. Do not use a Node.js blueprint. This app needs Node 20 installed in the steps below.
4. Choose the **4 GB** instance plan. Postgres, the API, and the Next.js build share this memory.
5. Name it `zurik-app`.
6. Create the instance. Wait until it is **Running**.
7. Open the instance, then the **Networking** tab.
8. Under **IPv4 Firewall**, add:
   - HTTP, TCP, port 80, source `0.0.0.0/0` (Anywhere)
   - HTTPS, TCP, port 443, source `0.0.0.0/0`
   - SSH, TCP, port 22. Restrict the source to your current IP if the console lets you.
9. Do not add rules for 3000, 3001, or 5432.
10. Do not add an IPv6 AAAA record later. You can leave the IPv6 firewall as Lightsail created it.
11. Still on Networking, choose **Create static IP**. Attach it to `zurik-app` and name it `zurik-ip`. Copy the address.

On the instance **Snapshots** tab, turn on automatic snapshots. The Docker volume is on this disk, so a snapshot is a copy of the database as well as the app. Take one before every deploy. Also keep the `pg_dump` files from step 9, because a snapshot of a running database is a crash copy, and a logical dump restores more cleanly.

The public IP on the instance page changes when the instance stops unless this static IP stays attached. Use the static IP for DNS and SSH.

## 2. Point the domain at the static IP

Create these A records. The value of each one is the static IP from step 1. Do not create AAAA records.

| Name | Type | Value |
|---|---|---|
| `@` (apex) | A | static IP |
| `www` | A | static IP |
| `api` | A | static IP |

**Lightsail DNS.** Networking → **Create DNS zone** → enter the domain. Add the three A records. Lightsail shows four name servers. At the registrar, replace the domain's name servers with those four. Propagation can take from a few minutes to a few hours.

**DNS you already have** (Route 53, Cloudflare, the registrar). Add the same three A records there. If the domain is on Cloudflare, set the records to **DNS only** (grey cloud) until the certificate in step 13 is issued. An orange-cloud proxy answers Let's Encrypt from Cloudflare instead of from this instance.

Check from your own computer, after the records exist:

```bash
dig +short example.com
dig +short www.example.com
dig +short api.example.com
```

Each command should print the static IP before you request a certificate.

## 3. Log in

Lightsail has a different default SSH key **per region**. Download the key for this instance's region from the account menu → **Account** → **SSH keys**.

```bash
chmod 400 ~/Downloads/LightsailDefaultKey-*.pem
ssh -i ~/Downloads/LightsailDefaultKey-*.pem ubuntu@STATIC_IP
```

The browser SSH button on the instance page also works. A local SSH session is easier when you later copy dump files off the server.

Every command from here through step 13 is run on the instance, as `ubuntu`, unless it says otherwise.

## 4. Update the OS and set the clock

Scheduled emails use the instance clock. `EVERY_DAY_AT_10AM` means 10:00 in this timezone. Use the zone where the business operates.

```bash
sudo apt-get update
sudo apt-get upgrade -y
sudo timedatectl set-timezone Africa/Lagos
timedatectl
```

## 5. Add swap

Next.js needs the extra memory while it compiles. Leave the swap in place afterwards.

```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
free -h
```

## 6. Install Docker, Node 20, and Nginx

The repo root `.nvmrc` is Node 20. Postgres uses the Docker engine, not Ubuntu's `postgresql` package.

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

`node -v` should print `v20.x`. `docker compose version` should print a v2 version. Do not enable `ufw`. The Lightsail firewall from step 1 is the firewall for this instance. A second firewall is how SSH gets locked out.

## 7. Create the app user and directories

```bash
sudo adduser --system --group --home /home/zurik --shell /bin/bash zurik
sudo mkdir -p /etc/zurik /var/www/certbot /var/backups/zurik /opt/zurik
sudo chown zurik:zurik /opt/zurik
sudo chmod 700 /var/backups/zurik
```

## 8. Clone the repository

Public repository:

```bash
sudo -u zurik -H git clone https://github.com/getnuevetech/ZuriK.git /opt/zurik
```

Private repository. On the instance:

```bash
sudo -u zurik -H ssh-keygen -t ed25519 -f /home/zurik/.ssh/id_ed25519 -N ""
sudo cat /home/zurik/.ssh/id_ed25519.pub
```

In GitHub, open the `getnuevetech/ZuriK` repository → **Settings** → **Deploy keys** → **Add deploy key**. Paste the public key. Leave write access off.

```bash
sudo -u zurik -H bash -lc 'ssh-keyscan github.com >> ~/.ssh/known_hosts'
sudo -u zurik -H git clone git@github.com:getnuevetech/ZuriK.git /opt/zurik
```

## 9. Start Postgres in Docker

Generate a database password:

```bash
openssl rand -base64 32
```

Put the raw password in the Docker env file. You will URL-encode a copy of it for the API in the next step.

```bash
sudo cp /opt/zurik/deploy/lightsail/env/db.env.example /etc/zurik/db.env
sudoedit /etc/zurik/db.env
sudo chown root:root /etc/zurik/db.env
sudo chmod 600 /etc/zurik/db.env
```

`/etc/zurik/db.env` should look like this, with your password in place:

```
POSTGRES_DB=african_fashion_db
POSTGRES_USER=zurik
POSTGRES_PASSWORD=the raw password
```

Install and start the database service. It runs `docker compose up -d --wait` from `deploy/lightsail/docker-compose.db.yml`. The container is `zurik-postgres`. Its port is published only on `127.0.0.1`.

```bash
sudo cp /opt/zurik/deploy/lightsail/systemd/zurik-db.service /etc/systemd/system/zurik-db.service
sudo systemctl daemon-reload
sudo systemctl enable --now zurik-db
sudo docker ps
```

`docker ps` should show `zurik-postgres` with a healthy status. Then confirm the host can log in:

```bash
PGPASSWORD='the raw password' psql \
  "host=127.0.0.1 port=5432 dbname=african_fashion_db user=zurik sslmode=disable" \
  -c 'select version();'
```

`POSTGRES_PASSWORD` is applied only when the data volume is created. A later edit of `db.env` does not change the password inside an existing volume. `docker compose down -v` deletes that volume and every table in it. Stopping the service does not.

Nightly logical backup, kept on the instance for seven days:

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
```

Copy those files off the instance as well. A Lightsail snapshot is the other copy.

Restore a dump into an empty database with:

```bash
gunzip -c /var/backups/zurik/african_fashion_db-DATE.sql.gz \
  | sudo docker exec -i zurik-postgres psql -U zurik -d african_fashion_db
```

## 10. Configure the API

Generate two different secrets:

```bash
openssl rand -base64 32
openssl rand -base64 32
```

URL-encode the same database password you put in `db.env`:

```bash
python3 - <<'PY'
import urllib.parse
print(urllib.parse.quote(input("Database password: "), safe=""))
PY
```

```bash
sudo cp /opt/zurik/deploy/lightsail/env/api.env.example /etc/zurik/api.env
sudo chown root:zurik /etc/zurik/api.env
sudo chmod 640 /etc/zurik/api.env
sudoedit /etc/zurik/api.env
```

Set these. Leave the rest as you fill in Cloudinary, SMTP, and payment keys. You can restart the API after those keys exist. The process starts without them, and mail, uploads, and payments fail until they are set.

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

`DATABASE_SSL=false` is required. In production the API otherwise expects TLS, and this Postgres container does not speak TLS. The connection stays on the loopback interface. Do not add `?sslmode=require` to `DATABASE_URL`.

`FRONTEND_URL` is the browser origin, not the API origin. It is also the allow-list for browser calls. One origin is enough because Nginx sends `www` to the apex. Quote a value only when it contains a space. systemd strips one pair of double quotes, which is why the template quotes `SMTP_FROM`.

## 11. Configure and build the website

`NEXT_PUBLIC_API_URL` is compiled into the browser bundle. Changing it later does nothing until you build again.

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

Build both apps. The first build downloads dependencies and compiles Next.js. On a 4 GB instance with swap, expect several minutes.

```bash
sudo -u zurik -H bash -lc 'cd /opt/zurik && npm ci && npm run build'
sudo -u zurik -H bash /opt/zurik/deploy/lightsail/scripts/build-web.sh
```

The web script prints `Standalone server ready at ...` and links that directory to `/opt/zurik/frontend/.next/standalone-run`.

## 12. Run the API and the website

```bash
sudo cp /opt/zurik/deploy/lightsail/systemd/zurik-api.service /etc/systemd/system/zurik-api.service
sudo cp /opt/zurik/deploy/lightsail/systemd/zurik-web.service /etc/systemd/system/zurik-web.service
sudo systemctl daemon-reload
sudo systemctl enable --now zurik-api
sudo systemctl enable --now zurik-web
```

On boot, `zurik-db` starts the Postgres container, then the API starts, then the website. The first API start creates the database tables. This project boots with TypeORM `synchronize` turned on, including in production. There is no migration that creates the schema. Do not run `npm run typeorm:run` on this server. That command applies one later alteration and expects the tables to exist already.

Watch the API until it logs that it is listening:

```bash
sudo journalctl -u zurik-api -n 80 --no-pager
curl -fsS http://127.0.0.1:3001/health
curl -fsS -o /dev/null -w "%{http_code}\n" http://127.0.0.1:3000/
```

`/health` returns `{"status":"ok"}`. The website command prints `200`. If the API exits, the log is the source of truth. The usual causes are a bad `DATABASE_URL`, `DATABASE_SSL` left unset, Postgres not healthy, or `FRONTEND_URL` left empty.

Do not run `npm run seed` or `npm run seed:prod`. The seed writes `admin@africanfashion.com` with password `Password123!` and a demo catalog.

## 13. Issue the certificate and turn on HTTPS

DNS from step 2 must already return the static IP.

Install the temporary HTTP site. It proxies the two apps and answers the certificate challenge.

The sample below uses `zurik.com`. Use your apex domain in that position. The dot in `example.com` is a sed pattern, so keep the backslash.

```bash
sudo sed 's/example\.com/zurik.com/g' \
  /opt/zurik/deploy/lightsail/nginx/zurik-http.conf \
  | sudo tee /etc/nginx/sites-available/zurik.conf >/dev/null
sudo ln -sfn /etc/nginx/sites-available/zurik.conf /etc/nginx/sites-enabled/zurik.conf
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

That substitution rewrites `example.com` to the apex, `www.example.com` to `www.` plus the apex, and `api.example.com` to `api.` plus the apex. With `zurik.com` the three names are `zurik.com`, `www.zurik.com`, and `api.zurik.com`. Use those same three names in the `certbot` command.

Request the certificate:

```bash
sudo certbot certonly --webroot -w /var/www/certbot \
  -d example.com -d www.example.com -d api.example.com \
  --agree-tos -m you@example.com --no-eff-email
```

Install the HTTPS site, using the same domain substitution:

```bash
sudo sed 's/example\.com/zurik.com/g' \
  /opt/zurik/deploy/lightsail/nginx/zurik.conf \
  | sudo tee /etc/nginx/sites-available/zurik.conf >/dev/null
sudo nginx -t
sudo systemctl reload nginx
```

Reload Nginx when a certificate renews:

```bash
sudo tee /etc/letsencrypt/renewal-hooks/deploy/reload-nginx.sh >/dev/null <<'EOF'
#!/bin/bash
systemctl reload nginx
EOF
sudo chmod 755 /etc/letsencrypt/renewal-hooks/deploy/reload-nginx.sh
sudo systemctl status certbot.timer
```

Ubuntu enables `certbot.timer` with the certbot package. `systemctl status` should show it active.

From your own computer:

```bash
curl -fsS https://api.example.com/health
curl -fsS -o /dev/null -w "%{http_code}\n" https://example.com/
```

Open `https://example.com` in a browser. `http://` and `https://www` should both land on `https://example.com`.

## 14. Create the first admin

Registration only creates a customer, designer, or fabric seller. Register your own account on the site, then promote it on the instance.

```bash
PGPASSWORD='the raw password' psql \
  "host=127.0.0.1 port=5432 dbname=african_fashion_db user=zurik sslmode=disable" \
  -c "update users set role = 'admin', \"isEmailVerified\" = true where email = 'you@example.com';"
```

Sign out and sign in again. The admin screens read the role from the new token.

## 15. Connect Cloudinary, email, payments, and Google

Edit `/etc/zurik/api.env` and fill in the keys from `deploy/lightsail/env/api.env.example`. Then:

```bash
sudo systemctl restart zurik-api
```

Use these public URLs in the provider dashboards:

| Provider | URL |
|---|---|
| Stripe webhook | `https://api.example.com/payments/webhooks/stripe` |
| Paystack webhook | `https://api.example.com/payments/webhooks/paystack` |
| Google authorized redirect URI | `https://api.example.com/auth/google/callback` |
| Stripe and Paystack callback after checkout | `https://example.com/payments/callback` |

`PAYMENT_CALLBACK_URL` in `/etc/zurik/api.env` is the checkout callback, `https://example.com/payments/callback`.

Google sign-in stays off until both `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set. Leave the pair empty if you are not using Google.

SMTP failures are logged and do not stop registration. Check them with:

```bash
sudo journalctl -u zurik-api -n 50 --no-pager
```

Hero banner uploads accept up to 50 MB. Nginx is already set to 55 MB. Product images are limited to 5 MB by the API.

## 16. Deploy an update

Take a Lightsail snapshot of the instance, and run the dump once by hand, before you pull. The running API can alter tables on startup because schema sync is enabled.

```bash
sudo bash /etc/cron.daily/zurik-pgdump
sudo bash /opt/zurik/deploy/lightsail/scripts/build-and-restart.sh
```

The script fast-forwards git, builds the API, rebuilds the website with `/etc/zurik/web.env`, waits until `/health` answers, and restarts both app services. It leaves the Postgres container running.

Change a `NEXT_PUBLIC_` value only in `/etc/zurik/web.env`, then run that same script. A restart without a build keeps the old API URL in the browser bundle.

After a git pull that changes `docker-compose.db.yml`, restart the database service too:

```bash
sudo systemctl restart zurik-db
```

## Day-to-day checks

```bash
sudo systemctl status zurik-db zurik-api zurik-web nginx
sudo docker ps
sudo journalctl -u zurik-api -f
sudo journalctl -u zurik-web -f
curl -fsS https://api.example.com/health
```

`/health` means the API process is up. It does not query PostgreSQL. `docker logs zurik-postgres` is the database log.

## Stop or resize

Stop the instance from the Lightsail console only when you mean to. The static IP stays attached and DNS does not change. Postgres stops with the instance and starts again on boot from the Docker volume. To resize, snapshot the instance first, create a larger instance from that snapshot, move the static IP, and stop the old instance.

## What this layout does not do

- It does not run the root `Dockerfile` or the root `docker-compose.yml`. That compose file starts Postgres with the password `postgres` and publishes port 5432 on every interface, and it also starts the API in development mode.
- It does not use `ecosystem.config.js`, `start.sh`, or `build.sh`. Those scripts start the wrong process and call npm scripts this repo does not have.
- It does not scale the API to a second instance. The scheduled jobs would run twice.
- It does not turn schema sync off. Turning it off without a baseline migration leaves later entity changes unapplied. Snapshot and dump before every deploy until that migration exists.

## When something fails

**API restarts in a loop.** `sudo journalctl -u zurik-api -n 100 --no-pager`. Missing `DATABASE_URL`, `FRONTEND_URL`, or either JWT secret exits on purpose in production. `ECONNREFUSED` on port 5432 means the container is not up: `sudo systemctl status zurik-db` and `sudo docker ps`.

**`psql` works and the API does not.** `DATABASE_URL` must use `127.0.0.1`, the user `zurik`, and the URL-encoded password. `DATABASE_SSL` must be `false`.

**The container restarts or stays unhealthy.** `sudo docker logs zurik-postgres`. The first start needs a few seconds. If you changed `POSTGRES_PASSWORD` after the volume was created, the old password is still the one inside the volume.

**The site loads and every API call fails in the browser.** The website was built with the wrong `NEXT_PUBLIC_API_URL`, or `FRONTEND_URL` does not exactly match the origin in the address bar, including `https://`. Fix the env file and run the build script again. CORS allows the origins in `FRONTEND_URL` plus any `*.vercel.app` host.

**The homepage or admin pages return 429.** The API allows 3 requests per second per visitor, then 20 per 10 seconds, then 100 per minute. `TRUST_PROXY=1` must be set, or every visitor is counted as `127.0.0.1` and the limit is shared by the whole site. Confirm the log line `Trusting one reverse-proxy hop` after a restart.

**Certificate request fails.** `dig +short example.com` must be the static IP you attached. Cloudflare must not be proxying the name. Port 80 must be open in the Lightsail IPv4 firewall.

**Uploads return an error.** Cloudinary keys are missing or the Nginx body limit was replaced. The API logs the Cloudinary error.

**Google redirects to the wrong host.** `GOOGLE_CALLBACK_URL` and the Google console redirect URI are both `https://api.example.com/auth/google/callback`. The API then sends the browser to `FRONTEND_URL/auth/google/callback`.
