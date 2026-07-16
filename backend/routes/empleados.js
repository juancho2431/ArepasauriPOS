const express = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const router = express.Router();

// Importamos los modelos necesarios
const Empleado = require('../models/Empleado');
const Ingrediente = require('../models/Ingrediente');

// Middleware de autorización por rol (req.user ya viene asignado por el middleware auth)
const authorize = require('../middleware/authorize');

// Roles que pueden administrar empleados
const ROLES_ADMIN = ['Superadmin', 'Administrador'];

// Genera una contraseña aleatoria alfanumérica de la longitud indicada
const generarContraseñaAleatoria = (longitud = 10) => {
  const caracteres = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
  const bytes = crypto.randomBytes(longitud);
  let resultado = '';
  for (let i = 0; i < longitud; i++) {
    resultado += caracteres[bytes[i] % caracteres.length];
  }
  return resultado;
};

/**
 * Rutas para Empleados
 */

// Obtener todos los empleados (cualquier usuario autenticado; sin exponer contraseñas)
router.get('/empleados', async (req, res) => {
  try {
    const empleados = await Empleado.findAll({
      attributes: { exclude: ['contraseña'] },
    });
    res.json(empleados);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener empleados' });
  }
});

// Crear un nuevo empleado (solo admin) — la contraseña se guarda hasheada
router.post('/empleados', authorize(ROLES_ADMIN), async (req, res) => {
  try {
    const { nombre, apellido, rol, usuario, contraseña } = req.body;

    if (!nombre || !apellido || !rol || !usuario || !contraseña) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }
    if (contraseña.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    }

    const hash = await bcrypt.hash(contraseña, 10);
    const nuevoEmpleado = await Empleado.create({ nombre, apellido, rol, usuario, contraseña: hash });

    // No devolver el hash en la respuesta
    const { contraseña: _omitida, ...empleadoSinContraseña } = nuevoEmpleado.toJSON();
    res.status(201).json(empleadoSinContraseña);
  } catch (error) {
    console.error('Error al crear empleado:', error);
    res.status(500).json({ error: 'Error al crear empleado' });
  }
});

// Editar un empleado (solo admin) — esta ruta no existía y el botón
// "Editar" del frontend fallaba con 404. Si llega contraseña nueva, se hashea.
router.put('/empleados/:id', authorize(ROLES_ADMIN), async (req, res) => {
  try {
    const empleado = await Empleado.findByPk(req.params.id);
    if (!empleado) {
      return res.status(404).json({ error: 'Empleado no encontrado' });
    }
    const { nombre, apellido, rol, contraseña } = req.body;
    const cambios = {};
    if (nombre) cambios.nombre = nombre;
    if (apellido) cambios.apellido = apellido;
    if (rol) cambios.rol = rol;
    if (contraseña) {
      if (contraseña.length < 6) {
        return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
      }
      cambios.contraseña = await bcrypt.hash(contraseña, 10);
    }
    await empleado.update(cambios);
    const { contraseña: _omitida, ...sinContraseña } = empleado.toJSON();
    res.json(sinContraseña);
  } catch (error) {
    console.error('Error al editar empleado:', error);
    res.status(500).json({ error: 'Error al editar empleado' });
  }
});

// Restablecer la contraseña de un empleado (solo Superadmin, reautenticando su propia contraseña)
router.post('/empleados/:id/reset-password', authorize(['Superadmin']), async (req, res) => {
  try {
    const { superadminPassword } = req.body;
    if (!superadminPassword) {
      return res.status(400).json({ error: 'Debes confirmar tu contraseña' });
    }

    // req.user.empleado_id viene del token; releemos el registro para comparar el hash actual.
    const superadmin = await Empleado.findByPk(req.user.empleado_id);
    if (!superadmin) {
      return res.status(401).json({ error: 'Sesión inválida' });
    }

    const passwordValida = await bcrypt.compare(superadminPassword, superadmin.contraseña);
    if (!passwordValida) {
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }

    const empleado = await Empleado.findByPk(req.params.id);
    if (!empleado) {
      return res.status(404).json({ error: 'Empleado no encontrado' });
    }

    const contraseñaNueva = generarContraseñaAleatoria(10);
    await empleado.update({ contraseña: await bcrypt.hash(contraseñaNueva, 10) });

    // Se muestra una sola vez: es el único momento en que se puede ver.
    res.json({ contraseña: contraseñaNueva });
  } catch (error) {
    console.error('Error al restablecer contraseña:', error);
    res.status(500).json({ error: 'Error al restablecer contraseña' });
  }
});

// Eliminar un empleado (solo admin)
router.delete('/empleados/:id', authorize(ROLES_ADMIN), async (req, res) => {
  const { id } = req.params;
  try {
    const empleado = await Empleado.findByPk(id);
    if (!empleado) {
      return res.status(404).json({ error: 'Empleado no encontrado' });
    }
    await empleado.destroy();
    res.json({ message: 'Empleado eliminado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar empleado' });
  }
});

/**
 * Rutas para Ingredientes
 */

// Actualizar un ingrediente
router.put('/ingredientes/:id', async (req, res) => {
  try {
    // Convertimos el id a número para asegurarnos de que es válido
    const ingredienteId = parseInt(req.params.id, 10);
    if (isNaN(ingredienteId)) {
      return res.status(400).json({ error: 'El ID proporcionado no es válido' });
    }

    const { name, stock_current, stock_minimum } = req.body;
    const ingrediente = await Ingrediente.findByPk(ingredienteId);
    if (!ingrediente) {
      return res.status(404).json({ error: 'Ingrediente no encontrado' });
    }

    await ingrediente.update({ name, stock_current, stock_minimum });
    res.json(ingrediente);
  } catch (error) {
    console.error('Error al actualizar el ingrediente:', error);
    res.status(500).json({ error: 'Error al actualizar el ingrediente' });
  }
});

module.exports = router;
