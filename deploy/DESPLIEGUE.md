# Despliegue de ArepasauriosPOS en EC2 (Ubuntu 24.04)

Guía paso a paso para publicar el sistema en `https://arepasauripos.click`,
detrás de Nginx con SSL (Let's Encrypt), en una instancia EC2.

Requisitos previos: una instancia EC2 Ubuntu 24.04 con una Elastic IP
asociada, puertos 22, 80 y 443 abiertos en el Security Group, y acceso SSH.

## 1. Clonar el repositorio

```bash
git clone <URL-del-repo> arepasaurios
cd arepasaurios
```

## 2. Crear el archivo `.env` en la raíz

Este archivo NO se sube al repo (está en `.gitignore`). Créalo a mano:

```bash
cat > .env <<'EOF'
POSTGRES_DB=postgres
POSTGRES_USER=postgres
POSTGRES_PASSWORD=<contraseña-fuerte>
POSTGRES_PORT=5432
FRONTEND_API_URL=https://arepasauripos.click
EOF
```

## 3. Crear `backend/.env`

Genera un `JWT_SECRET` nuevo (no reutilices el de desarrollo):

```bash
openssl rand -hex 32
```

```bash
cat > backend/.env <<'EOF'
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=<misma-contraseña-que-en-el-.env-raíz>
DB_HOST=postgres_db
DB_PORT=5432

PORT=3000

JWT_SECRET=<pega-aquí-el-valor-generado-con-openssl>
JWT_EXPIRES_IN=8h

CORS_ORIGINS=https://arepasauripos.click,https://www.arepasauripos.click
EOF
```

## 4. Preparar el servidor (Docker, Nginx, Certbot)

```bash
sudo bash deploy/setup-servidor.sh
```

Esto instala Docker, el plugin de Docker Compose, Nginx y Certbot, y publica
el server block de `deploy/nginx-arepasauripos.conf` (HTTP, puerto 80).
El script es idempotente: se puede volver a correr sin problema.

## 5. Levantar los contenedores

```bash
docker compose -f docker-compose.prod.yml up --build -d
```

Verifica que los tres servicios estén arriba:

```bash
docker compose -f docker-compose.prod.yml ps
```

## 6. Restaurar el respaldo de la base de datos (si aplica)

Si vienes de un `postgres_backup.sql` existente:

```bash
docker exec -i postgres_db psql -U postgres -d postgres < postgres_backup.sql
```

Ajusta `-U` / `-d` si tu `.env` usa un usuario o nombre de base distintos.

## 7. Migrar contraseñas y crear el usuario administrador

```bash
docker exec -it backend_app node scripts/migrar-contrasenas.js
docker exec -it backend_app node scripts/crear-admin.js admin <contraseña-segura> Superadmin
```

`migrar-contrasenas.js` es idempotente: hashea con bcrypt cualquier
contraseña que aún esté en texto plano y omite las que ya están hasheadas.
`crear-admin.js` crea el usuario si no existe, o resetea su contraseña y rol
si ya existe.

## 8. Apuntar el DNS

En el proveedor de DNS del dominio, crea (o actualiza) los registros:

| Tipo | Nombre | Valor              |
|------|--------|---------------------|
| A    | @      | `<Elastic IP de EC2>` |
| A    | www    | `<Elastic IP de EC2>` |

Espera a que propague (verifica con `dig arepasauripos.click`).

## 9. Activar SSL con Certbot

Una vez que el DNS resuelve a la Elastic IP:

```bash
sudo certbot --nginx -d arepasauripos.click -d www.arepasauripos.click
```

Certbot reconfigura automáticamente el server block para servir HTTPS y
programa la renovación automática del certificado.

## Actualizaciones posteriores

```bash
git pull
docker compose -f docker-compose.prod.yml up --build -d
```
