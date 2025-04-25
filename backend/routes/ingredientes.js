const express = require('express');
const router = express.Router();
const { Ingrediente } = require('../models'); // Importamos el modelo Ingrediente

/**
 * GET '/' - Obtener todos los ingredientes
 * Consulta todos los ingredientes registrados y los retorna en formato JSON.
 */
router.get('/', async (req, res) => {
  try {
    const ingredientes = await Ingrediente.findAll();
    res.json(ingredientes);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los ingredientes' });
  }
});

/**
 * GET '/:id' - Obtener un ingrediente específico
 * Busca un ingrediente por su ID (clave primaria) y lo retorna si existe.
 */
router.get('/:id', async (req, res) => {
  try {
    const ingredienteId = req.params.id;
    const ingrediente = await Ingrediente.findByPk(ingredienteId);

    if (!ingrediente) {
      return res.status(404).json({ error: 'Ingrediente no encontrado' });
    }

    res.json(ingrediente);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el ingrediente' });
  }
});

/**
 * POST '/' - Crear nuevos ingredientes
 * Se espera recibir en el body una lista de ingredientes, cada uno con los campos:
 * name, stock_current y stock_minimum.
 * Se iteran los elementos de la lista y se crea un registro para cada uno.
 */
router.post('/', async (req, res) => {
  const { ingredientes } = req.body;

  // Verificamos que se haya enviado una lista de ingredientes
  if (!ingredientes || !Array.isArray(ingredientes)) {
    return res.status(400).json({ error: 'Debe proporcionar una lista de ingredientes.' });
  }

  try {
    // Iteramos sobre cada ingrediente y lo creamos en la base de datos
    for (const ingrediente of ingredientes) {
      await Ingrediente.create({
        name: ingrediente.name,
        stock_current: ingrediente.stock_current,
        stock_minimum: ingrediente.stock_minimum,
      });
    }

    res.status(201).json({ message: 'Ingredientes creados con éxito' });
  } catch (error) {
    console.error('Error al crear el ingrediente:', error);
    res.status(500).json({ error: 'Error al crear el ingrediente' });
  }
});

/**
 * PUT '/:id' - Actualizar un ingrediente
 * Actualiza los datos (name, stock_current, stock_minimum) de un ingrediente específico.
 */
router.put('/:id', async (req, res) => {
  try {
    const ingredienteId = req.params.id;
    const { name, stock_current, stock_minimum } = req.body;

    // Mostramos en consola los datos recibidos para depuración
    console.log('Datos recibidos:', req.body);

    // Buscamos el ingrediente por su ID
    const ingrediente = await Ingrediente.findByPk(ingredienteId);
    if (!ingrediente) {
      return res.status(404).json({ error: 'Ingrediente no encontrado' });
    }

    // Actualizamos el ingrediente con los nuevos datos
    await ingrediente.update({ name, stock_current, stock_minimum });
    res.json(ingrediente);
  } catch (error) {
    console.error('Error al actualizar el ingrediente:', error);
    res.status(500).json({ error: 'Error al actualizar el ingrediente' });
  }
});

/**
 * DELETE '/:id' - Eliminar un ingrediente
 * Elimina un ingrediente específico de la base de datos.
 */
router.delete('/:id', async (req, res) => {
  try {
    const ingredienteId = req.params.id;

    // Buscamos el ingrediente a eliminar
    const ingrediente = await Ingrediente.findByPk(ingredienteId);
    if (!ingrediente) {
      return res.status(404).json({ error: 'Ingrediente no encontrado' });
    }

    // Eliminamos el ingrediente
    await ingrediente.destroy();
    res.json({ message: 'Ingrediente eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el ingrediente' });
  }
});

module.exports = router;
