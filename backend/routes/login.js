// routes/login.js

// Importamos Express para definir la ruta
const express = require('express');
const router = express.Router();

// Importamos el modelo Empleado para buscar el usuario que intenta iniciar sesión
const Empleado = require('../models/Empleado');

/**
 * Ruta POST para manejar el inicio de sesión.
 * Se espera que en el body de la petición se envíen 'username' y 'password'.
 */
router.post('/', async (req, res) => {
  // Extraemos los datos de usuario y contraseña del body
  const { username, password } = req.body;
  
  try {
    // Buscamos un empleado que coincida con el usuario y contraseña proporcionados
    // Nota: En producción se debe utilizar un hash para comparar la contraseña.
    const empleado = await Empleado.findOne({ where: { usuario: username, contraseña: password } });
    
    // Si no se encuentra un empleado, se retorna un error de autenticación (HTTP 401)
    if (!empleado) {
      return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
    }
    
    // Si se encuentra, se devuelve la información necesaria (en este caso, el nombre de usuario y el rol)
    res.json({ username: empleado.usuario, role: empleado.rol });
  } catch (error) {
    // Si ocurre algún error, se muestra en consola y se responde con un error de servidor (HTTP 500)
    console.error('Error al autenticar:', error);
    res.status(500).json({ error: 'Error al autenticar' });
  }
});

module.exports = router;
