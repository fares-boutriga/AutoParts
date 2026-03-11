# AutoParts Deployment on OVH VPS (Docker)

This guide deploys the full project on an OVH VPS using Docker:
- `frontend` (Vite app served by Nginx) on port `80`
- `api` (NestJS + Prisma) on port `3000`
- `db` (PostgreSQL) as an internal service

## 1. Prerequisites

- OVH VPS (Ubuntu 22.04/24.04 recommended)
- A domain/subdomain (recommended for production)
- SSH access to the VPS as a sudo user

## 2. Prepare the VPS

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y ca-certificates curl git ufw
```

Optional but recommended firewall:

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 3000/tcp
sudo ufw --force enable
```

## 3. Install Docker + Compose plugin

```bash
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER
newgrp docker
docker --version
docker compose version
```

## 4. Get the project on the VPS

```bash
git clone <YOUR_REPO_URL> autoparts
cd autoparts
```

## 5. Create environment files

Create root compose env:

```bash
cp .env.docker.example .env
```

Create backend env:

```bash
cp server/.env.docker.example server/.env
```

Then edit both files:

```bash
nano .env
nano server/.env
```

Important values:
- `.env`
  - `POSTGRES_PASSWORD` strong password
  - `FRONTEND_URL` example: `https://app.example.com` or `http://YOUR_SERVER_IP`
  - `VITE_API_URL` example: `https://api.example.com` or `http://YOUR_SERVER_IP:3000`
- `server/.env`
  - JWT secrets
  - OVH SMTP values (`SMTP_*`, `EMAIL_FROM`, `ADMIN_EMAIL`)

## 6. Start containers

```bash
docker compose up -d --build
```

Check status:

```bash
docker compose ps
docker compose logs -f api
```

## 7. Run first-time seed (default admin + roles)

Run once after first deployment:

```bash
docker compose exec api npx prisma db seed
```

Default login created by seed:
- Email: `admin@autoparts.com`
- Password: `admin123`

Change this password immediately in production.

## 8. Access the app

- Frontend: `http://YOUR_SERVER_IP` (or your domain)
- API: `http://YOUR_SERVER_IP:3000`
- Swagger: `http://YOUR_SERVER_IP:3000/api/docs`

## 9. Deploy updates

```bash
git pull
docker compose up -d --build
```

## 10. Useful operations

Stop:

```bash
docker compose down
```

Restart one service:

```bash
docker compose restart api
```

View logs:

```bash
docker compose logs -f frontend
docker compose logs -f api
docker compose logs -f db
```

## 11. Database backup and restore

Backup:

```bash
docker compose exec -T db pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB" > backup.sql
```

Restore:

```bash
cat backup.sql | docker compose exec -T db psql -U "$POSTGRES_USER" "$POSTGRES_DB"
```

## 12. Production notes

- `VITE_API_URL` is injected at build time. If it changes, run `docker compose up -d --build`.
- If you enable HTTPS through reverse proxy (Nginx/Traefik), set:
  - `FRONTEND_URL=https://your-frontend-domain`
  - `VITE_API_URL=https://your-api-domain`
- Keep `server/.env`, `.env`, and database volume backups safe.
