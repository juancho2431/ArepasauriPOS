const express = require('express');
const router = express.Router();
const { Producto, Bebida, Ingrediente, Ventas, VentaDetalle, Empleado } = require('../models');
const sequelize = require('../config/db');

console.log('Modelo Ventas:', Ventas);

// ================================================
// GET '/' - Obtener todas las ventas
// Incluye los detalles, donde cada detalle puede
// ser un producto o una bebida.
// ================================================
router.get('/', async (req, res) => {
  console.log('Intentando obtener todas las ventas...');
  try {
    const ventas = await Ventas.findAll({
      include: [
        {
          model: VentaDetalle,
          as: 'VentaDetalles',
          include: [
            {
              model: Producto,
              as: 'producto',
              attributes: ['name', 'price'],
              required: false,
            },
            {
              model: Bebida,
              as: 'bebida',
              attributes: ['name', 'price'],
              required: false,
            },
          ],
        },
      ],
    });

    res.json(ventas);
  } catch (error) {
    console.error('Error al obtener las ventas:', error);
    res.status(500).json({ error: 'Error al obtener las ventas' });
  }
});

// ================================================
// GET '/:ventaId' - Obtener una venta específica
// Incluye sus detalles y la info del vendedor.
// ================================================
router.get('/:ventaId', async (req, res) => {
  const { ventaId } = req.params;
  try {
    console.log('Intentando obtener la venta con ventaId:', ventaId);

    const venta = await Ventas.findByPk(ventaId, {
      attributes: ['ventas_id', 'fecha', 'total', 'cliente', 'metodo_pago'],
      include: [
        {
          model: VentaDetalle,
          as: 'VentaDetalles',
          include: [
            {
              model: Producto,
              as: 'producto',
              attributes: ['name', 'price'],
              required: false,
            },
            {
              model: Bebida,
              as: 'bebida',
              attributes: ['name', 'price'],
              required: false,
            },
          ],
        },
        {
          model: Empleado,
          as: 'vendedor',
          attributes: ['nombre', 'apellido'],
        },
      ],
    });

    if (!venta) {
      console.log('Venta no encontrada para ventaId:', ventaId);
      return res.status(404).json({ error: 'Venta no encontrada' });
    }

    console.log('Resultado de la consulta:', JSON.stringify(venta, null, 2));
    res.json(venta);
  } catch (error) {
    console.error('Error al obtener la venta:', error.message);
    res.status(500).json({ error: 'Error al obtener la venta', detalle: error.message });
  }
});

// ================================================
// POST '/' - Crear una nueva venta
// Se espera un array de detalles con:
// { tipo_producto: 'producto' | 'bebida',
//   producto_id?: number, bebida_id?: number,
//   cantidad, precio, ingredientes?[] }
// ================================================
router.post('/', async (req, res) => {
  const { fecha, total, metodo_pago, cliente, vendedor_id, detalles } = req.body;

  // Validación básica de la venta
  if (
    !fecha ||
    !total ||
    !metodo_pago ||
    !cliente ||
    !vendedor_id ||
    !Array.isArray(detalles) ||
    detalles.length === 0
  ) {
    return res.status(400).json({
      message: 'Debe proporcionar fecha, total, método de pago, cliente, vendedor y detalles válidos.',
    });
  }

  try {
    await sequelize.transaction(async (transaction) => {
      // Crear la venta principal
      const venta = await Ventas.create(
        {
          fecha,
          total,
          metodo_pago,
          cliente,
          vendedor_id,
        },
        { transaction }
      );

      // Procesar cada detalle
      for (const detalle of detalles) {
        const {
          tipo_producto,
          producto_id,
          bebida_id,
          cantidad,
          precio,
          ingredientes,
        } = detalle;

        // Validar datos mínimos
        if (!cantidad || !precio) {
          throw new Error('Debe proporcionar la cantidad y el precio para cada detalle de la venta.');
        }

        // Revisar si es 'producto' o 'bebida'
        if (tipo_producto === 'producto') {
          // Si es producto, debe tener product_id
          if (!producto_id) {
            throw new Error('Para un producto, se requiere "producto_id".');
          }
        } else if (tipo_producto === 'bebida') {
          // Si es bebida, debe tener bebida_id
          if (!bebida_id) {
            throw new Error('Para una bebida, se requiere "bebida_id".');
          }
        } else {
          throw new Error('tipo_producto inválido. Debe ser "producto" o "bebida".');
        }

        // Crear el detalle en la BD
        const nuevoDetalle = await VentaDetalle.create(
          {
            venta_id: venta.ventas_id,
            tipo_producto,
            producto_id: tipo_producto === 'producto' ? producto_id : null,
            bebida_id: tipo_producto === 'bebida' ? bebida_id : null,
            cantidad,
            precio,
          },
          { transaction }
        );

        // Actualizar stock
        if (tipo_producto === 'producto') {
          // Descontar ingredientes si existen
          if (ingredientes && ingredientes.length > 0) {
            for (const ing of ingredientes) {
              const ingrediente = await Ingrediente.findByPk(ing.ingredient_id, { transaction });
              if (!ingrediente) {
                throw new Error(`Ingrediente con ID ${ing.ingredient_id} no encontrado`);
              }
              if (ingrediente.stock_current < ing.amount) {
                throw new Error(`Stock insuficiente para el ingrediente: ${ingrediente.name}`);
              }
              await ingrediente.update(
                {
                  stock_current: ingrediente.stock_current - ing.amount,
                },
                { transaction }
              );
            }
          }
        } else if (tipo_producto === 'bebida') {
          // Buscar la bebida
          const bebida = await Bebida.findByPk(bebida_id, { transaction });
          if (!bebida) {
            throw new Error(`Bebida con ID ${bebida_id} no encontrada`);
          }
          if (bebida.stock < cantidad) {
            throw new Error(`Stock insuficiente para la bebida: ${bebida.name}`);
          }
          await bebida.update({ stock: bebida.stock - cantidad }, { transaction });
        }
      }
    });

    res.status(201).json({ message: 'Venta creada con éxito' });
  } catch (error) {
    console.error('Error al crear la venta:', error);
    res.status(500).json({ message: 'Error al crear la venta', detalle: error.message });
  }
});

// ================================================
// DELETE '/:ventaId' - Eliminar una venta
// ================================================
router.delete('/:ventaId', async (req, res) => {
  const { ventaId } = req.params;
  try {
    console.log('Intentando eliminar la venta con ventaId:', ventaId);
    const venta = await Ventas.findByPk(ventaId);
    if (!venta) {
      return res.status(404).json({ error: 'Venta no encontrada' });
    }
    await venta.destroy();
    res.json({ message: 'Venta eliminada exitosamente.' });
  } catch (error) {
    console.error('Error al eliminar la venta:', error);
    res.status(500).json({ error: 'Error al eliminar la venta' });
  }
});

module.exports = router;
