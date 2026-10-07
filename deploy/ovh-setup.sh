#!/usr/bin/env bash
# =====================================================================
# SIGRH - Installation automatique sur VPS OVH (Ubuntu)
#
# Usage (sur le VPS, depuis la racine du dépôt cloné) :
#   DOMAIN=sigrh.mondomaine.com bash deploy/ovh-setup.sh
#
# Sans domaine (test HTTP simple) :
#   bash deploy/ovh-setup.sh
#
# Le script installe Docker, configure un swap, le pare-feu, génère le
# fichier .env avec des secrets aléatoires, puis démarre la pile.
# =====================================================================
set -euo pipefail

if [ "$(id -u)" -eq 0 ]; then SUDO=""; else SUDO="sudo"; fi

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_DIR"

DOMAIN="${DOMAIN:-}"
ADMIN_EMAIL="${ADMIN_EMAIL:-}"

log() { printf "\n\033[1;32m==> %s\033[0m\n" "$*"; }

# --- 1. Docker -------------------------------------------------------
if ! command -v docker >/dev/null 2>&1; then
  log "Installation de Docker"
  curl -fsSL https://get.docker.com | $SUDO sh
  $SUDO usermod -aG docker "$(whoami)" || true
fi
log "Docker : $(docker --version)"

# --- 2. Swap (sécurité anti-OOM pour 4 Go) ---------------------------
if ! swapon --show | grep -q .; then
  log "Création d'un swap de 2 Go"
  $SUDO fallocate -l 2G /swapfile
  $SUDO chmod 600 /swapfile
  $SUDO mkswap /swapfile
  $SUDO swapon /swapfile
  echo '/swapfile none swap sw 0 0' | $SUDO tee -a /etc/fstab >/dev/null
fi

# --- 3. Pare-feu -----------------------------------------------------
if command -v ufw >/dev/null 2>&1; then
  log "Configuration du pare-feu (22, 80, 443)"
  $SUDO ufw allow 22/tcp >/dev/null 2>&1 || true
  $SUDO ufw allow 80/tcp >/dev/null 2>&1 || true
  $SUDO ufw allow 443/tcp >/dev/null 2>&1 || true
  $SUDO ufw --force enable >/dev/null 2>&1 || true
fi

# --- 4. Fichier .env -------------------------------------------------
SERVER_IP="$(curl -fsSL -4 https://ifconfig.me 2>/dev/null || hostname -I | awk '{print $1}')"

if [ -z "$DOMAIN" ]; then
  DOMAIN=":80"
  FRONTEND_URL="http://${SERVER_IP}"
  CORS_ORIGINS="http://${SERVER_IP}"
else
  FRONTEND_URL="https://${DOMAIN}"
  CORS_ORIGINS="https://${DOMAIN}"
fi

if [ -f .env ]; then
  log "Fichier .env déjà présent : conservé tel quel"
else
  log "Génération du fichier .env (secrets aléatoires)"
  JWT_SECRET="$(openssl rand -base64 48 | tr -d '\n')"
  PG_PASSWORD="$(openssl rand -base64 24 | tr -d '/+=\n')"
  cat > .env <<EOF
DOMAIN=${DOMAIN}
FRONTEND_URL=${FRONTEND_URL}
CORS_ORIGINS=${CORS_ORIGINS}

POSTGRES_DB=sigrh
POSTGRES_USER=sigrh
POSTGRES_PASSWORD=${PG_PASSWORD}
TZ=Africa/Douala

JWT_SECRET=${JWT_SECRET}
BACKEND_HEAP_MB=1024

MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=
MAIL_PASSWORD=
MAIL_FROM=
MAIL_PROVIDER=gmail
BREVO_API_KEY=
ALERT_RECIPIENTS=${ADMIN_EMAIL}

SEED_ENABLED=true
SEED_EMPLOYEES=150
SEED_PRESENCE_DAYS=30
SEED_MONTHS_PAIE=6
SEED_MATERIELS=200
DEFAULT_PASSWORD=SIGRH@2026
EOF
  chmod 600 .env
fi

# --- 5. Démarrage ----------------------------------------------------
log "Construction et démarrage de la pile SIGRH"
$SUDO docker compose -f docker-compose.prod.yml up -d --build

log "Terminé !"
$SUDO docker compose -f docker-compose.prod.yml ps
if [ "$DOMAIN" = ":80" ]; then
  echo -e "\nAccès : http://${SERVER_IP}  (compte admin / admin123)"
else
  echo -e "\nAccès : https://${DOMAIN}  (compte admin / admin123)"
  echo "Vérifie que l'enregistrement DNS A pointe bien vers ${SERVER_IP}."
fi
echo "Logs backend : docker compose -f docker-compose.prod.yml logs -f backend"