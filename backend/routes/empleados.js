const express = require('express');
const router = express.Router();

// Importamos los modelos necesarios
const Empleado = require('../models/Empleado');
const Ingrediente = require('../models/Ingrediente');

/**
 * Rutas para Empleados
 */

// Obtener todos los empleados
router.get('/empleados', async (req, res) => {
  try {
    const empleados = await Empleado.findAll();
    res.json(empleados);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener empleados' });
  }
});

// Crear un nuevo empleado
router.post('/empleados', async (req, res) => {
  try {
    const { nombre, apellido, rol, usuario, contraseña } = req.body;
    const nuevoEmpleado = await Empleado.create({ nombre, apellido, rol, usuario, contraseña });
    res.status(201).json(nuevoEmpleado);
  } catch (error) {
    console.error('Error al crear empleado:', error);
    res.status(500).json({ error: 'Error al crear empleado' });
  }
});

// Eliminar un empleado
router.delete('/empleados/:id', async (req, res) => {
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
