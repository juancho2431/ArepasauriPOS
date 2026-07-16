// index.js
// Archivo principal de la aplicación que configura el servidor Express y registra las rutas de la API.
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

// Importar las rutas de la API
const productoRoutes = require('./routes/Productos');       // Rutas para productos (antes "arepas")
const ingredienteRoutes = require('./routes/ingredientes');   // Rutas para ingredientes
const bebidaRoutes = require('./routes/bebidas');             // Rutas para bebidas
const ventasRoutes = require('./routes/ventas');              // Rutas para ventas y detalles de ventas
const empleadosRouter = require('./routes/empleados');        // Rutas para empleados
const loginRoutes = require('./routes/login');                 // Rutas de autenticación (login)
const dashboardRoutes = require('./routes/dashboard');
const reportesRoutes = require('./routes/reportes');

// Middleware de autenticación (verifica el token JWT)
const auth = require('./middleware/auth');

// Validar que exista el secreto JWT antes de arrancar
if (!process.env.JWT_SECRET) {
  console.error('ERROR: falta la variable de entorno JWT_SECRET. Revisa backend/.env');
  process.exit(1);
}

// Middleware para analizar el cuerpo de las peticiones en formato JSON
app.use(express.json());

// CORS restringido a los orígenes permitidos (definidos en CORS_ORIGINS, separados por coma)
const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:3001')
  .split(',')
  .map((o) => o.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      // Permitir peticiones sin origin (curl, Postman, apps móviles)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Origen no permitido por CORS'));
    },
  })
);

app.get('/', (req, res) => {
  res.send('¡Bienvenido a mi API! 🚀');
});

// Ruta pública: login (no requiere token)
app.use('/api/login', loginRoutes);

// Todas las demás rutas de la API requieren token JWT válido
app.use('/api', auth);

// Registrar las rutas protegidas de la API con sus respectivos prefijos
app.use('/api/productos', productoRoutes);
app.use('/api/ingredientes', ingredienteRoutes);
app.use('/api/bebidas', bebidaRoutes);
app.use('/api/ventas', ventasRoutes);
app.use('/api/empleados', empleadosRouter);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reportes', reportesRoutes);

// Middleware global para manejo de errores
app.use((err, req, res, next) => {
  if (err.message === 'Origen no permitido por CORS') {
    return res.status(403).json({ error: err.message });
  }
  console.error(err.stack);
  res.status(500).json({ error: 'Ha ocurrido un error en el servidor' });
});

// Iniciar el servidor y escuchar en el puerto configurado
app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
