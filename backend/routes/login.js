// routes/login.js
// Autenticación con contraseña hasheada (bcrypt) y emisión de token JWT.

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();

const Empleado = require('../models/Empleado');

/**
 * POST /api/login
 * Body: { username, password }
 * Respuesta: { token, username, role }
 */
router.post('/', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Usuario y contraseña son requeridos' });
  }

  try {
    // Buscamos solo por usuario; la contraseña se compara con bcrypt.
    const empleado = await Empleado.findOne({ where: { usuario: username } });

    // Comparamos contra un hash aunque el usuario no exista para no revelar
    // qué usuarios existen (mitiga ataques de enumeración por tiempo de respuesta).
    const hashComparar = empleado
      ? empleado.contraseña
      : '$2a$10$invalidinvalidinvalidinvalidinvalidinvalidinva12345678';

    const passwordValida = await bcrypt.compare(password, hashComparar);

    if (!empleado || !passwordValida) {
      return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
    }

    // Firmamos el token con los datos mínimos necesarios.
    const token = jwt.sign(
      {
        empleado_id: empleado.empleado_id,
        usuario: empleado.usuario,
        rol: empleado.rol,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
    );

    res.json({ token, username: empleado.usuario, role: empleado.rol });
  } catch (error) {
    console.error('Error al autenticar:', error);
    res.status(500).json({ error: 'Error al autenticar' });
  }
});

module.exports = router;
