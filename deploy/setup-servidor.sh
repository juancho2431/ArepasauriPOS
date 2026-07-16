#!/usr/bin/env bash
# Prepara un servidor Ubuntu 24.04 limpio para alojar ArepasauriosPOS:
# instala Docker, el plugin de Docker Compose, Nginx y Certbot, y publica
# el server block de arepasauripos.click. Idempotente: se puede volver a
# ejecutar sin romper nada si ya se corrió antes.
#
# Uso: sudo bash deploy/setup-servidor.sh

set -euo pipefail

if [ "$(id -u)" -ne 0 ]; then
  echo "Este script debe ejecutarse como root (usa sudo)." >&2
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
NGINX_CONF_SRC="$SCRIPT_DIR/nginx-arepasauripos.conf"
NGINX_CONF_NAME="arepasauripos.click"

echo "==> Actualizando índice de paquetes"
apt-get update -y

echo "==> Instalando docker.io, docker-compose-plugin, nginx y certbot"
apt-get install -y docker.io docker-compose-plugin nginx certbot python3-certbot-nginx

echo "==> Habilitando e iniciando Docker"
systemctl enable --now docker

echo "==> Publicando configuración de Nginx"
cp "$NGINX_CONF_SRC" "/etc/nginx/sites-available/$NGINX_CONF_NAME"
ln -sf "/etc/nginx/sites-available/$NGINX_CONF_NAME" "/etc/nginx/sites-enabled/$NGINX_CONF_NAME"

if [ -e /etc/nginx/sites-enabled/default ]; then
  echo "==> Eliminando el sitio 'default' de Nginx"
  rm -f /etc/nginx/sites-enabled/default
fi

echo "==> Validando y recargando Nginx"
nginx -t
systemctl reload nginx

echo "==> Listo. Nginx está sirviendo el server block de $NGINX_CONF_NAME en el puerto 80."
echo "    Cuando el DNS apunte al servidor, corre:"
echo "    certbot --nginx -d arepasauripos.click -d www.arepasauripos.click"
