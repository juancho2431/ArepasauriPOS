// index.js
// Archivo principal de la aplicación que configura el servidor Express y registra las rutas de la API.
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

// Importar las rutas de la API
const productoRoutes = require('./routes/Productos');       // Rutas para productos (antes "arepas")
const ingredienteRoutes = require('./routes/ingredientes');   // Rutas para ingredientes
const bebidaRoutes = require('./routes/bebidas');             // Rutas para bebidas
const ventasRoutes = require('./routes/ventas');              // Rutas para ventas y detalles de ventas
const empleadosRouter = require('./routes/empleados');        // Rutas para empleados
const loginRoutes = require('./routes/login');                 // Rutas de autenticación (login)
const dashboardRoutes = require('./routes/dashboard');
const reportesRoutes = require('./routes/reportes');

// Middleware para analizar el cuerpo de las peticiones en formato JSON
app.use(express.json());

// Middleware para habilitar CORS (Cross-Origin Resource Sharing)
app.use(cors());

app.get('/', (req, res) => {
  res.send('¡Bienvenido a mi API! 🚀');
});

// Registrar las rutas de la API con sus respectivos prefijos
app.use('/api/productos', productoRoutes);
app.use('/api/ingredientes', ingredienteRoutes);
app.use('/api/bebidas', bebidaRoutes);
app.use('/api/ventas', ventasRoutes);
app.use('/api/empleados', empleadosRouter);
app.use('/api/login', loginRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reportes', reportesRoutes);
// Middleware global para manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Ha ocurrido un error en el servidor' });
});

// Iniciar el servidor y escuchar en el puerto configurado
app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
