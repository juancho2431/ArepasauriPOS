const express = require('express');
const router = express.Router();
const { Bebida } = require('../models'); // Importamos el modelo Bebida

/**
 * GET / - Obtener todas las bebidas
 * Se consultan todas las bebidas de la base de datos y se devuelven en formato JSON.
 */
router.get('/', async (req, res) => {
  try {
    const bebidas = await Bebida.findAll();
    res.json(bebidas);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener las bebidas' });
  }
});

/**
 * GET /:id - Obtener una bebida específica
 * Se busca una bebida por su id (clave primaria) y se devuelve si se encuentra.
 */
router.get('/:id', async (req, res) => {
  try {
    const bebidaId = req.params.id;
    const bebida = await Bebida.findByPk(bebidaId);
    if (!bebida) {
      return res.status(404).json({ error: 'Bebida no encontrada' });
    }
    res.json(bebida);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener la bebida' });
  }
});

/**
 * POST / - Crear una nueva bebida
 * Se reciben los datos (name, stock, price) en el body de la petición y se crea una nueva bebida.
 */
router.post('/', async (req, res) => {
  try {
    const { name, stock, price } = req.body;
    const nuevaBebida = await Bebida.create({ name, stock, price });
    res.status(201).json(nuevaBebida);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear la bebida' });
  }
});

/**
 * PUT /:id - Actualizar una bebida
 * Se busca la bebida por id y se actualizan sus datos con los valores enviados en el body.
 */
router.put('/:id', async (req, res) => {
  try {
    const bebidaId = req.params.id;
    const { name, stock, price } = req.body;
    const bebida = await Bebida.findByPk(bebidaId);
    if (!bebida) {
      return res.status(404).json({ error: 'Bebida no encontrada' });
    }
    await bebida.update({ name, stock, price });
    res.json(bebida);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar la bebida' });
  }
});

/**
 * DELETE /:id - Eliminar una bebida
 * Se busca la bebida por id y, si existe, se elimina de la base de datos.
 */
router.delete('/:id', async (req, res) => {
  try {
    const bebidaId = req.params.id;
    const bebida = await Bebida.findByPk(bebidaId);
    if (!bebida) {
      return res.status(404).json({ error: 'Bebida no encontrada' });
    }
    await bebida.destroy();
    res.json({ message: 'Bebida eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar la bebida' });
  }
});

module.exports = router;
