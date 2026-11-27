# Hostinger VPS (KVM 4) Worker Setup — Easy Step-by-Step Guide

Your **existing Redis on port `6379` will NOT be touched**, so your other projects on this VPS will continue running with zero downtime or config changes.

Instead, we create a **dedicated, isolated Redis instance on port `6380`** just for Verityra.

---

## Step 1: Log in & Install Node.js 20 + PM2

SSH into your Hostinger VPS:

```bash
ssh root@YOUR_VPS_IP
```

Install Node.js 20 and PM2:

```bash
apt update && apt upgrade -y
apt install -y git curl openssl
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
npm install -g pm2
node -v   # Should print v20.x.x
```

---

## Step 2: Create an Isolated Redis for Verityra (Port `6380`)

This leaves `/etc/redis/redis.conf` and port `6379` **100% untouched** for your other projects.

1. Generate a strong password for Verityra's Redis:

```bash
openssl rand -hex 24
```

Copy the output — this is `YOUR_VERITYRA_REDIS_PASS`.

2. Create an isolated data folder & config on port `6380` (replace `YOUR_VERITYRA_REDIS_PASS` first):

```bash
mkdir -p /var/lib/redis-verityra
chown redis:redis /var/lib/redis-verityra

cat <<'EOF' > /etc/redis/redis-verityra.conf
port 6380
bind 0.0.0.0
protected-mode yes
requirepass YOUR_VERITYRA_REDIS_PASS
dir /var/lib/redis-verityra
appendonly yes
maxmemory-policy noeviction
rename-command FLUSHALL ""
rename-command FLUSHDB ""
EOF

chown redis:redis /etc/redis/redis-verityra.conf
chmod 640 /etc/redis/redis-verityra.conf
```

> Make sure you replaced `YOUR_VERITYRA_REDIS_PASS` inside `/etc/redis/redis-verityra.conf` (`nano /etc/redis/redis-verityra.conf` if needed).

3. Create a background service for port `6380` and start it:

```bash
cat <<'EOF' > /etc/systemd/system/redis-verityra.service
[Unit]
Description=Isolated Redis for Verityra (Port 6380)
After=network.target

[Service]
User=redis
Group=redis
ExecStart=/usr/bin/redis-server /etc/redis/redis-verityra.conf --daemonize no
Restart=always

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable --now redis-verityra
```

4. Test both Redis instances (your old `6379` should still work untouched, and `6380` should reply `PONG`):

```bash
redis-cli -p 6380 -a YOUR_VERITYRA_REDIS_PASS ping
```

5. Allow port `6380` in the firewall **only if UFW is active** (do not reset/disable ports used by your other projects):

```bash
ufw status
# If Status is "active", run ONLY:
ufw allow 6380/tcp
```

*(If `ufw status` says `inactive`, skip UFW or make sure your existing SSH/web ports like `22`, `80`, `443` are allowed before enabling it.)*

---

## Step 3: Clone Repo & Build Worker

```bash
mkdir -p /opt/verityra
cd /opt/verityra
git clone YOUR_GIT_REPO_URL .
cd /opt/verityra/worker
npm ci
npm run build
```

---

## Step 4: Create `worker/.env`

```bash
nano /opt/verityra/worker/.env
```

Paste this and fill in your real keys (use `127.0.0.1` and port `6380`):

```env
NODE_ENV=production
PORT=8080

# Isolated Verityra Redis on this same VPS (port 6380, NOT 6379)
REDIS_URL="redis://:YOUR_VERITYRA_REDIS_PASS@127.0.0.1:6380"

DATABASE_URL="YOUR_SUPABASE_DATABASE_URL"
DIRECT_URL="YOUR_SUPABASE_DIRECT_URL"

GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
GEMINI_MODEL="gemini-3.8-flash"

SUPABASE_URL="https://YOUR_PROJECT.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="YOUR_SUPABASE_SERVICE_ROLE_KEY"

NEXT_PUBLIC_APP_URL="https://verityra-fr.vercel.app"
NEXT_PUBLIC_BRAND_NAME="Verityra"
ENABLE_EMAIL_DELIVERY="false"

WORKER_CONCURRENCY=3
```

Save (`Ctrl + O`, `Enter`, `Ctrl + X`) and lock permissions:

```bash
chmod 600 /opt/verityra/worker/.env
```

---

## Step 5: Start Worker with PM2 (24/7 + Auto-Reboot)

```bash
cd /opt/verityra/worker
pm2 start dist/index.js --name verityra-worker
pm2 save
pm2 startup
```

> **Important:** `pm2 startup` prints one `sudo env PATH=...` command at the bottom. Copy and run that command so the worker starts automatically on VPS reboot.

Verify it is healthy:

```bash
pm2 logs verityra-worker --lines 30
curl http://127.0.0.1:8080/health
```

Look for:
- `[Worker] Started BullMQ evaluation listener (Concurrency: 3).`
- `[Worker:Redis] Connected successfully to Redis.`
- `[Worker] Database connection established.`

---

## Step 6: Update `REDIS_URL` in Vercel (Required!)

1. Open **Vercel -> Your Project -> Settings -> Environment Variables**.
2. Set `REDIS_URL` to use your VPS IP and **port `6380`**:

```env
redis://:YOUR_VERITYRA_REDIS_PASS@YOUR_VPS_IP:6380
```

3. **Redeploy Vercel** so Vercel starts sending jobs to port `6380`.

---

## Step 7: Turn Off Old Render Worker

Go to your Render dashboard and **Suspend** or **Delete** the broken worker service so only your Hostinger VPS handles jobs.

---

## How to Update Code Later

```bash
cd /opt/verityra
git pull origin main
cd worker
npm ci
npm run build
pm2 restart verityra-worker --update-env
pm2 logs verityra-worker --lines 30
```

---

## Quick Troubleshooting

- **Other projects check:** Confirm `/etc/redis/redis.conf` and port `6379` were never modified — other projects stay completely isolated on `6379`.
- **Jobs stuck in Pending:** Confirm Vercel's `REDIS_URL` uses `YOUR_VPS_IP:6380` (not `localhost` and not `6379`) and you clicked **Redeploy** on Vercel.
- **Check Verityra Redis status anytime:** `systemctl status redis-verityra`
- **Check live worker logs anytime:** `pm2 logs verityra-worker`
