# AWS Lightsail setup for ZuriK

This is the server setup for this repository. The running system is three pieces:

| Piece | Process | Public URL |
|---|---|---|
| Storefront, account, and admin UI | Next.js in `frontend/` | `https://example.com` |
| API | NestJS from the repo root | `https://api.example.com` |
| Database | PostgreSQL | not public |

Nginx on the app instance is the only process that faces the internet. The API listens on `127.0.0.1:3001`. The website listens on `127.0.0.1:3000`. Images go to Cloudinary, so the instance does not store uploads.

Use one app instance. Abandoned-cart, order, and review emails are scheduled inside the API process. A second copy of the API sends those twice.

Replace `example.com` everywhere below with the domain you will actually serve. Commands are meant to be copied in order.

`DEPLOYMENT_SIMPLE.md` describes a different, older app. Do not follow it.

## What you create in Lightsail

Create both resources in the **same region**. A Lightsail database is reachable from a Lightsail instance in that region without opening it to the internet. It is not reachable from an instance in another region.

| Resource | Choice |
|---|---|
| App instance | Ubuntu 24.04 LTS, OS Only blueprint. 4 GB RAM. A 2 GB instance can build this app only with the swap file in step 6, and the build is easy to run out of memory. |
| Database | Lightsail managed PostgreSQL, PostgreSQL 15 or 16, in that same region. The 1 GB database plan is enough to start. Skip this if you use the same-instance database in the appendix. |
| Static IP | One static IP attached to the app instance. |
| DNS | `example.com`, `www.example.com`, and `api.example.com` as A records to that static IP. |

Confirm the prices shown in the console before you create anything. A static IP is free while it is attached to an instance. Detaching it and leaving it unused is billed.

You also need, outside Lightsail:

- A domain you control
- A Cloudinary account
- SMTP credentials (Gmail app password, or another provider)
- Stripe and/or Paystack live keys, when you take payments
- A Google OAuth client, if you want Google sign-in

## 1. Create the database

Skip this section if you are putting PostgreSQL on the app instance. Use the appendix instead, then continue at step 2.

1. Open the Lightsail home page and choose **Databases**, then **Create database**.
2. Select the same region you will use for the instance.
3. Choose **PostgreSQL**. Pick version 15 or 16.
4. Choose a plan. The smallest plan is enough until the catalog and order volume grow.
5. Set the master database name to `african_fashion_db`.
6. Set a master username, or keep the one Lightsail suggests. Save it.
7. Generate a master password and store it in a password manager. You will not see it again.
8. Name the database resource `zurik-db`.
9. Create it and wait until the status is **Available**. This often takes several minutes.
10. Open the database, then the connection details. Copy the **endpoint** and the **port** (5432).
11. Download the **SSL certificate** from that same connection page. Keep the file. You will copy it to the instance as `/etc/zurik/lightsail-ca.pem`.
12. Leave **Public mode** off. The app instance connects over the private Lightsail network.

On the database's **Snapshots** tab, turn on automatic snapshots.

## 2. Create the app instance

1. From the Lightsail home page choose **Create instance**.
2. Pick the **same region** as the database.
3. Platform: **Linux/Unix**. Blueprint: **OS Only**, **Ubuntu 24.04 LTS**. Do not use a Node.js blueprint. This app needs Node 20 installed in the steps below.
4. Choose the **4 GB** instance plan.
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

On the instance **Snapshots** tab, turn on automatic snapshots.

The public IP on the instance page changes when the instance stops unless this static IP stays attached. Use the static IP for DNS and SSH.

## 3. Point the domain at the static IP

Create these A records. The value of each one is the static IP from step 2. Do not create AAAA records.

| Name | Type | Value |
|---|---|---|
| `@` (apex) | A | static IP |
| `www` | A | static IP |
| `api` | A | static IP |

**Lightsail DNS.** Networking → **Create DNS zone** → enter the domain. Add the three A records. Lightsail shows four name servers. At the registrar, replace the domain's name servers with those four. Propagation can take from a few minutes to a few hours.

**DNS you already have** (Route 53, Cloudflare, the registrar). Add the same three A records there. If the domain is on Cloudflare, set the records to **DNS only** (grey cloud) until the certificate in step 12 is issued. An orange-cloud proxy answers Let's Encrypt from Cloudflare instead of from this instance.

Check from your own computer, after the records exist:

```bash
dig +short example.com
dig +short www.example.com
dig +short api.example.com
```

Each command should print the static IP before you request a certificate.

## 4. Log in

Lightsail has a different default SSH key **per region**. Download the key for this instance's region from the account menu → **Account** → **SSH keys**.

```bash
chmod 400 ~/Downloads/LightsailDefaultKey-*.pem
ssh -i ~/Downloads/LightsailDefaultKey-*.pem ubuntu@STATIC_IP
```

The browser SSH button on the instance page also works. Uploading the database certificate is easier from your own terminal, so prefer a local SSH session.

Every command from here through step 14 is run on the instance, as `ubuntu`, unless it says otherwise.

## 5. Update the OS and set the clock

Scheduled emails use the instance clock. `EVERY_DAY_AT_10AM` means 10:00 in this timezone. Use the zone where the business operates.

```bash
sudo apt-get update
sudo apt-get upgrade -y
sudo timedatectl set-timezone Africa/Lagos
timedatectl
```

## 6. Add swap

Next.js needs the extra memory while it compiles. Leave the swap in place afterwards.

```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
free -h
```

## 7. Install Node 20, Nginx, and the database client

The repo root `.nvmrc` is Node 20. The API and the Next.js app both run on that version.

```bash
sudo apt-get install -y ca-certificates curl gnupg git build-essential python3 nginx certbot postgresql-client
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
node -v
npm -v
nginx -v
```

`node -v` should print `v20.x`. Do not enable `ufw`. The Lightsail firewall from step 2 is the firewall for this instance. A second firewall is how SSH gets locked out.

## 8. Create the app user and directories

```bash
sudo adduser --system --group --home /home/zurik --shell /bin/bash zurik
sudo mkdir -p /etc/zurik /var/www/certbot /opt/zurik
sudo chown zurik:zurik /opt/zurik
```

## 9. Put the database certificate on the instance

From your own computer, not from the SSH session:

```bash
scp -i ~/Downloads/LightsailDefaultKey-*.pem ~/Downloads/lightsail-ca.pem ubuntu@STATIC_IP:/tmp/lightsail-ca.pem
```

The downloaded file may have a longer name. Use that name.

Back on the instance:

```bash
sudo mv /tmp/lightsail-ca.pem /etc/zurik/lightsail-ca.pem
sudo chown root:zurik /etc/zurik/lightsail-ca.pem
sudo chmod 640 /etc/zurik/lightsail-ca.pem
```

Skip this if you are using PostgreSQL on the same instance.

## 10. Clone the repository

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

## 11. Configure the API

Generate two different secrets:

```bash
openssl rand -base64 32
openssl rand -base64 32
```

URL-encode the database password so characters like `@`, `#`, or `/` do not break the connection string:

```bash
python3 - <<'PY'
import urllib.parse
print(urllib.parse.quote(input("Database password: "), safe=""))
PY
```

Create the env file from the template in the repo:

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
DATABASE_URL=postgresql://MASTER_USER:URL_ENCODED_PASSWORD@DB_ENDPOINT:5432/african_fashion_db
FRONTEND_URL=https://example.com
JWT_ACCESS_SECRET=first openssl value
JWT_REFRESH_SECRET=second openssl value
```

Do not add `?sslmode=require` to `DATABASE_URL`. The API turns TLS on itself when `NODE_ENV=production`, and the start script loads `/etc/zurik/lightsail-ca.pem` into `DATABASE_CA_CERT`.

`FRONTEND_URL` is the browser origin, not the API origin. It is also the allow-list for browser calls. One origin is enough because Nginx sends `www` to the apex. Quote a value only when it contains a space. systemd strips one pair of double quotes, which is why the template quotes `SMTP_FROM`.

For Postgres on the same instance, use the `DATABASE_URL` and `DATABASE_SSL=false` lines described in the appendix instead, and do not leave a managed-database URL in the file.

Check that the instance can reach the database. Replace the user, password, and host:

```bash
PGPASSWORD='the raw password' psql \
  "host=DB_ENDPOINT port=5432 dbname=african_fashion_db user=MASTER_USER sslmode=verify-full sslrootcert=/etc/zurik/lightsail-ca.pem" \
  -c 'select version();'
```

`verify-full` must succeed before you start the API. If it does not:

- The instance and the database are in different regions, or the database is not **Available** yet.
- The certificate file is not the one downloaded for this database.
- The password, user, or database name does not match the connection page.

## 12. Configure and build the website

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

## 13. Run the API and the website

```bash
sudo cp /opt/zurik/deploy/lightsail/systemd/zurik-api.service /etc/systemd/system/zurik-api.service
sudo cp /opt/zurik/deploy/lightsail/systemd/zurik-web.service /etc/systemd/system/zurik-web.service
sudo systemctl daemon-reload
sudo systemctl enable --now zurik-api
sudo systemctl enable --now zurik-web
```

The first API start creates the database tables. This project boots with TypeORM `synchronize` turned on, including in production. There is no migration that creates the schema. Do not run `npm run typeorm:run` on this server. That command applies one later alteration and expects the tables to exist already.

Watch the API until it logs that it is listening:

```bash
sudo journalctl -u zurik-api -n 80 --no-pager
curl -fsS http://127.0.0.1:3001/health
curl -fsS -o /dev/null -w "%{http_code}\n" http://127.0.0.1:3000/
```

`/health` returns `{"status":"ok"}`. The website command prints `200`. If the API exits, the log is the source of truth. The usual causes are a bad `DATABASE_URL`, a missing CA file, or `FRONTEND_URL` left empty.

Do not run `npm run seed` or `npm run seed:prod`. The seed writes `admin@africanfashion.com` with password `Password123!` and a demo catalog.

## 14. Issue the certificate and turn on HTTPS

DNS from step 3 must already return the static IP.

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

## 15. Create the first admin

Registration only creates a customer, designer, or fabric seller. Register your own account on the site, then promote it on the instance.

Managed database:

```bash
PGPASSWORD='the raw password' psql \
  "host=DB_ENDPOINT port=5432 dbname=african_fashion_db user=MASTER_USER sslmode=verify-full sslrootcert=/etc/zurik/lightsail-ca.pem" \
  -c "update users set role = 'admin', \"isEmailVerified\" = true where email = 'you@example.com';"
```

Same-instance database:

```bash
sudo -u postgres psql -d african_fashion_db \
  -c "update users set role = 'admin', \"isEmailVerified\" = true where email = 'you@example.com';"
```

Sign out and sign in again. The admin screens read the role from the new token.

## 16. Connect Cloudinary, email, payments, and Google

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

## 17. Deploy an update

Take a Lightsail snapshot of the database (and of the instance, if the database runs on it) before you pull. The running API can alter tables on startup because schema sync is enabled.

On the instance:

```bash
sudo bash /opt/zurik/deploy/lightsail/scripts/build-and-restart.sh
```

The script fast-forwards git, builds the API, rebuilds the website with `/etc/zurik/web.env`, waits until `/health` answers, and restarts both services.

Change a `NEXT_PUBLIC_` value only in `/etc/zurik/web.env`, then run that same script. A restart without a build keeps the old API URL in the browser bundle.

## Day-to-day checks

```bash
sudo systemctl status zurik-api zurik-web nginx
sudo journalctl -u zurik-api -f
sudo journalctl -u zurik-web -f
curl -fsS https://api.example.com/health
```

`/health` means the API process is up. It does not query PostgreSQL.

## Stop or resize

Stop the instance from the Lightsail console only when you mean to. The static IP stays attached and DNS does not change. The managed database keeps running and keeps its own billing. To resize, snapshot the instance first, then use the console snapshot to create a larger instance, move the static IP, and stop the old instance.

## What this layout does not do

- It does not run the root `Dockerfile`. That image is the API only, and it does not include the website.
- It does not use `docker-compose.yml`. That file is a local development database with development secrets.
- It does not use `ecosystem.config.js`, `start.sh`, or `build.sh`. Those scripts start the wrong process and call npm scripts this repo does not have.
- It does not scale the API to a second instance. The scheduled jobs would run twice.
- It does not turn schema sync off. Turning it off without a baseline migration leaves later entity changes unapplied. Snapshot before every deploy until that migration exists.

## When something fails

**API restarts in a loop.** `sudo journalctl -u zurik-api -n 100 --no-pager`. Missing `DATABASE_URL`, `FRONTEND_URL`, or either JWT secret exits on purpose in production.

**`psql` works and the API does not.** Confirm `DATABASE_CA_FILE` is unset so the start script reads `/etc/zurik/lightsail-ca.pem`, and that the `zurik` user can read that file (`chmod 640`, group `zurik`).

**The site loads and every API call fails in the browser.** The website was built with the wrong `NEXT_PUBLIC_API_URL`, or `FRONTEND_URL` does not exactly match the origin in the address bar, including `https://`. Fix the env file and run the build script again. CORS allows the origins in `FRONTEND_URL` plus any `*.vercel.app` host.

**The homepage or admin pages return 429.** The API allows 3 requests per second per visitor, then 20 per 10 seconds, then 100 per minute. `TRUST_PROXY=1` must be set, or every visitor is counted as `127.0.0.1` and the limit is shared by the whole site. Confirm the log line `Trusting one reverse-proxy hop` after a restart.

**Certificate request fails.** `dig +short example.com` must be the static IP from the instance itself (`curl -4 ifconfig.me` is not the right check; use the static IP you attached). Cloudflare must not be proxying the name. Port 80 must be open in the Lightsail IPv4 firewall.

**Uploads return an error.** Cloudinary keys are missing or the Nginx body limit was replaced. The API logs the Cloudinary error.

**Google redirects to the wrong host.** `GOOGLE_CALLBACK_URL` and the Google console redirect URI are both `https://api.example.com/auth/google/callback`. The API then sends the browser to `FRONTEND_URL/auth/google/callback`.

## Appendix: PostgreSQL on the app instance

Use this instead of a Lightsail database when you want one resource and you accept doing your own backups. The database then dies with the instance disk. Turn on automatic instance snapshots, and keep the dumps from the cron job below.

Still use a 4 GB instance. Postgres, the API, and Next.js share that memory.

```bash
sudo apt-get install -y postgresql postgresql-contrib
sudo -u postgres psql <<'SQL'
CREATE USER zurik WITH PASSWORD 'choose-a-long-password';
CREATE DATABASE african_fashion_db OWNER zurik;
SQL
```

Ubuntu's PostgreSQL listens on `127.0.0.1` only. Do not change that, and do not open port 5432 in the Lightsail firewall.

In `/etc/zurik/api.env`:

```
DATABASE_URL=postgresql://zurik:URL_ENCODED_PASSWORD@127.0.0.1:5432/african_fashion_db
DATABASE_SSL=false
```

`DATABASE_SSL=false` is required. In production the API otherwise expects TLS, and a local Postgres install does not speak TLS. Traffic stays on the loopback interface.

Nightly dump, retained on the instance disk for seven days:

```bash
sudo mkdir -p /var/backups/zurik
sudo tee /etc/cron.daily/zurik-pgdump >/dev/null <<'EOF'
#!/bin/bash
set -euo pipefail
umask 077
sudo -u postgres pg_dump african_fashion_db | gzip > "/var/backups/zurik/african_fashion_db-$(date +%F).sql.gz"
find /var/backups/zurik -name 'african_fashion_db-*.sql.gz' -mtime +7 -delete
EOF
sudo chmod 755 /etc/cron.daily/zurik-pgdump
```

Copy those dump files off the instance as well. A snapshot of a dead disk is the only other copy if you do not.

Continue at step 10. Skip step 9. In step 11, skip the `psql` TLS check and use:

```bash
PGPASSWORD='choose-a-long-password' psql \
  "host=127.0.0.1 dbname=african_fashion_db user=zurik" \
  -c 'select version();'
```
