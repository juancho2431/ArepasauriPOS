const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const { Producto, Ingrediente, ProductoIngrediente, Ventas, VentaDetalle } = require('../models');

// Obtener todos los productos con sus ingredientes
router.get('/', async (req, res) => {
  console.log('Intentando obtener todos los productos...');
  try {
    const productos = await Producto.findAll({
      include: {
        model: Ingrediente,
        through: {
          attributes: ['amount'],
        },
      },
    });
    console.log('Productos obtenidos:', productos);
    res.json(productos);
  } catch (error) {
    console.error('Error al obtener los productos:', error);
    res.status(500).json({ error: 'Error al obtener los productos', detalle: error.message });
  }
});

// Obtener un producto específico con sus ingredientes
router.get('/:id', async (req, res) => {
  console.log(`Intentando obtener el producto con id: ${req.params.id}`);
  try {
    const productoId = req.params.id;
    const producto = await Producto.findByPk(productoId, {
      include: {
        model: Ingrediente,
        through: {
          attributes: ['amount'],
        },
      },
    });

    if (!producto) {
      console.log(`Producto con id ${productoId} no encontrado`);
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    console.log('Producto encontrado:', producto);
    res.json(producto);
  } catch (error) {
    console.error('Error al obtener el producto:', error);
    res.status(500).json({ error: 'Error al obtener el producto', detalle: error.message });
  }
});

// Crear un nuevo producto con sus ingredientes
router.post('/', [
  body('name').notEmpty().withMessage('El nombre es requerido'),
  body('price').isInt({ min: 1 }).withMessage('El precio debe ser un número entero positivo'),
], async (req, res) => {
  console.log('Intentando crear un nuevo producto...');
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('Errores de validación:', errors.array());
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name, price, ingredientes } = req.body;

    // Crear el producto
    const nuevoProducto = await Producto.create({ name, price });
    console.log('Producto creado:', nuevoProducto);

    // Agregar ingredientes al producto, si se indican
    if (ingredientes && ingredientes.length > 0) {
      console.log('Intentando agregar ingredientes al producto...');
      for (const ingrediente of ingredientes) {
        await ProductoIngrediente.create({
          producto_id: nuevoProducto.producto_id,
          ingredient_id: ingrediente.id,
          amount: ingrediente.amount,
        });
      }
    }

    res.status(201).json(nuevoProducto);
  } catch (error) {
    console.error('Error al crear el producto:', error);
    res.status(500).json({ error: 'Error al crear el producto', detalle: error.message });
  }
});

// Actualizar un producto y sus ingredientes
router.put('/:id', [
  body('name').notEmpty().withMessage('El nombre es requerido'),
  body('price').isInt({ min: 1 }).withMessage('El precio debe ser un número entero positivo'),
], async (req, res) => {
  console.log(`Intentando actualizar el producto con id: ${req.params.id}`);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('Errores de validación:', errors.array());
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const productoId = req.params.id;
    const { name, price, ingredientes } = req.body;

    // Buscar el producto
    const producto = await Producto.findByPk(productoId);
    if (!producto) {
      console.log(`Producto con id ${productoId} no encontrado`);
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    // Actualizar el producto
    await producto.update({ name, price });
    console.log('Producto actualizado:', producto);

    // Actualizar ingredientes: primero eliminamos los actuales y luego creamos los nuevos
    if (ingredientes && ingredientes.length > 0) {
      console.log('Intentando actualizar ingredientes del producto...');
      await ProductoIngrediente.destroy({ where: { producto_id: productoId } });

      for (const ingrediente of ingredientes) {
        await ProductoIngrediente.create({
          producto_id: productoId,
          ingredient_id: ingrediente.id,
          amount: ingrediente.amount,
        });
      }
    }

    res.json(producto);
  } catch (error) {
    console.error('Error al actualizar el producto:', error);
    res.status(500).json({ error: 'Error al actualizar el producto', detalle: error.message });
  }
});

// Eliminar un producto y sus ingredientes
router.delete('/:id', async (req, res) => {
  console.log(`Intentando eliminar el producto con id: ${req.params.id}`);
  try {
    const productoId = req.params.id;

    // Buscar el producto
    const producto = await Producto.findByPk(productoId);
    if (!producto) {
      console.log(`Producto con id ${productoId} no encontrado`);
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    // Eliminar el producto
    await producto.destroy();
    console.log('Producto eliminado correctamente');

    res.json({ message: 'Producto eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar el producto:', error);
    res.status(500).json({ error: 'Error al eliminar el producto', detalle: error.message });
  }
});

module.exports = router;
