# Guía: cambios de seguridad y prueba en local

## Qué cambió

### Backend
- **`routes/login.js`**: ya no compara la contraseña en texto plano contra la BD. Busca el usuario, compara con `bcrypt.compare()` y, si es válido, devuelve un **token JWT** (dura 8h, configurable con `JWT_EXPIRES_IN` en `backend/.env`).
- **`middleware/auth.js`** (nuevo): verifica el token `Authorization: Bearer <token>` en cada petición y asigna `req.user`.
- **`index.js`**: todas las rutas `/api/*` requieren token, excepto `/api/login`. CORS ahora solo acepta los orígenes de `CORS_ORIGINS` (en `backend/.env`). El puerto sale de `PORT`.
- **`routes/empleados.js`**: crear/eliminar empleados requiere rol `Superadmin` o `Administrador` (usa el `middleware/authorize.js` que ya existía pero estaba huérfano). Las contraseñas nuevas se guardan hasheadas y la API ya no devuelve el campo contraseña.
- **`backend/.env`**: se agregaron `JWT_SECRET`, `JWT_EXPIRES_IN` y `CORS_ORIGINS`.

### Frontend
- **Eliminado el superadmin quemado** (`admin/supersecret`) que cualquiera podía ver en el código del navegador. Ahora se crea un admin real en la BD con un script (ver abajo).
- **`src/setupAxios.js`** (nuevo): adjunta el token a todas las peticiones y, si el backend responde 401 (sesión vencida), limpia la sesión y redirige al login.
- **`Login.js`** guarda el token; **`PrivateRoute.js`** exige que exista; **logout** lo borra.
- Se quitaron `bcrypt` y `jsonwebtoken` de las dependencias del frontend (no se usaban y no deben ir ahí).
- **`frontend/.env.development`** (nuevo): apunta a `http://localhost:3000` cuando corres `npm start`. El `.env` normal queda con la URL de producción.

### Otros
- **`.gitignore`** raíz: los `.env` (credenciales) ya no deberían subirse al repo.
- **`backend/scripts/`**: dos scripts nuevos (ver pasos 3 y 4).

## Cómo probarlo en local

### 1. Instalar dependencias nuevas
```bash
cd backend
npm install
cd ../frontend
npm install
```
(En backend se agregan `bcryptjs` y `jsonwebtoken`; en frontend solo se limpian paquetes.)

### 2. Levantar la base de datos y el backend
Con Docker (recomendado, igual que antes):
```bash
docker compose up --build -d postgres_db backend
```
> El `--build` es necesario esta vez porque cambiaron las dependencias del backend.

### 3. Migrar las contraseñas existentes a hash (una sola vez)
```bash
docker exec -it backend_app node scripts/migrar-contrasenas.js
```
Sin docker (BD accesible en localhost): `cd backend && node scripts/migrar-contrasenas.js`
(ajusta `DB_HOST=localhost` en `backend/.env` si corres fuera de docker).

### 4. Crear tu usuario administrador real
```bash
docker exec -it backend_app node scripts/crear-admin.js admin TuClaveSegura123
```
Esto reemplaza al `admin/supersecret` que estaba quemado en el código. Si el usuario ya existe, le resetea la contraseña.

### 5. Levantar el frontend
```bash
docker compose up --build -d frontend    # opción docker (puerto 3001)
# o en modo desarrollo:
cd frontend && npm start                 # usa .env.development → localhost:3000
```

### 6. Checklist de pruebas
- [ ] Login con el admin creado en el paso 4 → debe entrar.
- [ ] Login con contraseña incorrecta → "Usuario o contraseña incorrectos".
- [ ] Login con `admin/supersecret` → ya NO debe funcionar (a menos que ese sea el usuario que creaste).
- [ ] Sin loguearte, abre `http://localhost:3000/api/ventas` en el navegador → debe responder `{"error":"No autenticado: falta el token"}` (antes devolvía todos los datos).
- [ ] Ya logueado, navega Facturación, Inventario, Reportes → todo debe cargar normal.
- [ ] Crea una venta y verifica que descuente stock.
- [ ] Crea un empleado nuevo en Usuarios → en la BD su contraseña debe verse como `$2b$10$...` y debe poder loguearse.
- [ ] Cierra sesión y verifica que te saque al login.
- [ ] (Opcional) En la consola del navegador ejecuta `localStorage.setItem('isAuthenticated','true')` sin loguearte: la interfaz podrá abrirse pero **ninguna página cargará datos**, porque el backend rechaza las peticiones sin token. Esa es la diferencia clave con antes.

## Segunda ronda: pruebas funcionales y mejoras UX (16-jul)

Probé la aplicación completa contra una copia real de tu base de datos (restauré `postgres_backup.sql` en un Postgres 17 y ejecuté la API):

**Pruebas que pasaron:** login correcto/incorrecto, rechazo del viejo `admin/supersecret`, API bloqueada sin token, token inválido rechazado, empleados sin exponer contraseñas, creación de empleado con hash + login inmediato, Cajero bloqueado (403) al intentar crear empleados, ventas de productos y bebidas con descuento de stock, rollback de la transacción cuando no hay stock, dashboard e historial.

**Bugs encontrados y corregidos:**
1. `docker-compose`/`Dockerfile` frontend: el build local usaba la URL de producción (`arepasauripos.click`) — por eso viste `ERR_CONNECTION_TIMED_OUT`. Ahora el build local apunta a `localhost:3000` y en producción se define `FRONTEND_API_URL` en el `.env` raíz.
2. **Ventas sin lista de ingredientes no descontaban inventario.** Ahora, si no llega la lista (o llega vacía), el backend descuenta según la receta del producto.
3. **Ventas de 2+ unidades descontaban ingredientes de solo 1.** Ahora multiplica por la cantidad vendida.
4. Login descentrado en escritorio (`margin-left: 40%` forzado en CSS).

**Mejoras UX/UI aplicadas:** logo en el login + botón con estado "Ingresando…" y deshabilitado durante la petición + foco automático + autocompletado del navegador; mensaje distinto cuando el servidor no responde vs credenciales malas; aviso "Tu sesión expiró" al volver al login por token vencido; tablas con scroll horizontal en pantallas pequeñas (antes se rompían en móvil); tipografía del sistema (más moderna que Arial); `lang="es"` y metadatos correctos en el HTML.

**IMPORTANTE para probar:** como cambió el Dockerfile del frontend, ejecuta:
```bash
docker compose up --build -d
```

## Notas
- El `JWT_SECRET` en `backend/.env` fue generado aleatorio. Al pasar a producción (EC2) generaremos otro distinto.
- Las credenciales siguen en los `.env` del repo git (historial). Antes de subir a EC2 conviene cambiarlas y limpiar el historial o dejar de trackear esos archivos: `git rm --cached .env backend/.env frontend/.env`.
- Si un usuario tenía sesión abierta de antes, deberá volver a loguearse (no tiene token).
