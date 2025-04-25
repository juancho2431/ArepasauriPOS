const express = require('express');
const router = express.Router();
const { sequelize } = require('../models'); // Instancia de Sequelize
const { Op } = require("sequelize");

/**
 * Endpoint: GET /api/reportes/best-selling
 * Parámetros de query:
 *   - type: "producto" o "bebida"
 *   - period: "dia", "semana", "mes" o "anio"
 *
 * Devuelve los productos o bebidas más vendidos en el período especificado.
 */
router.get('/best-selling', async (req, res) => {
  const { type, period } = req.query;

  if (!type || !['producto', 'bebida'].includes(type)) {
    return res.status(400).json({
      error: 'El parámetro "type" es obligatorio y debe ser "producto" o "bebida".'
    });
  }
  if (!period || !['dia','semana','mes','anio'].includes(period)) {
    return res.status(400).json({
      error: 'El parámetro "period" es obligatorio y debe ser "dia", "semana", "mes" o "anio".'
    });
  }

  try {
    let startDate, endDate;
    const now = new Date();

    switch (period) {
      case 'dia':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 1);
        break;
      case 'semana':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - now.getDay());
        endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 7);
        break;
      case 'mes':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        break;
      case 'anio':
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear() + 1, 0, 1);
        break;
      default:
        return res.status(400).json({ error: 'Período inválido.' });
    }

    console.log('period:', period);
    console.log('startDate:', startDate, 'endDate:', endDate);

    // Para evitar confusiones, vamos a definir el JOIN según el tipo.
    // Si el sistema usa una sola columna (producto_id para ambos), para bebidas usaremos:
    // d.producto_id = b.bebida_id
    // Si usas dos columnas, ajusta la condición a: d.bebida_id = b.bebida_id.
    let joinTable, joinCondition, nameField;
    if (type === 'producto') {
      joinTable = '"productos" p';
      joinCondition = 'd.producto_id = p.producto_id';
      nameField = 'p.name';
    } else {
      joinTable = '"bebidas" b';
      // Suponiendo que en tu tabla venta_detalles, para bebidas guardas el ID en bebida_id,
      // usa: d.bebida_id = b.bebida_id
      // Si en cambio reutilizas producto_id para bebidas, usa: d.producto_id = b.bebida_id
      joinCondition = 'd.bebida_id = b.bebida_id';
      nameField = 'b.name';
    }

    // La consulta agrupa por producto/bebida y suma la cantidad
    const result = await sequelize.query(`
      SELECT
        ${type === 'producto' ? 'd.producto_id' : 'd.bebida_id'} AS id,
        ${nameField} AS name,
        SUM(d.cantidad) AS cantidad_vendida
      FROM "venta_detalles" d
      JOIN ${joinTable} ON ${joinCondition}
      JOIN "ventas" v ON d.venta_id = v.ventas_id
      WHERE d.tipo_producto = :type
        AND v.fecha BETWEEN :startDate AND :endDate
      GROUP BY ${type === 'producto' ? 'd.producto_id' : 'd.bebida_id'}, ${nameField}
      ORDER BY cantidad_vendida DESC
      LIMIT 10;
    `, {
      replacements: { type, startDate, endDate },
      type: sequelize.QueryTypes.SELECT
    });

    // Nos aseguramos de devolver un array
    res.json(Array.isArray(result) ? result : [result]);
  } catch (error) {
    console.error("Error en best-selling:", error);
    res.status(500).json({ error: "Error al obtener los más vendidos", detalle: error.message });
  }
});
/**
 * Endpoint: GET /api/reportes/total-sales
 * Parámetro de query:
 *   - payment: "nequi", "daviplata" o "efectivo"
 *
 * Devuelve el total de ventas por día o semana según el método de pago.
 */
router.get('/total-sales', async (req, res) => {
    const { period } = req.query;
  
    if (!period || !['dia', 'semana', 'mes', 'anio'].includes(period)) {
      return res.status(400).json({ error: 'El parámetro "period" es obligatorio y debe ser "dia", "semana", "mes" o "anio".' });
    }
  
    try {
      let startDate, endDate;
      const now = new Date();
  
      // Definir el rango de fechas según el período
      if (period === 'dia') {
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 1);
      } else if (period === 'semana') {
        startDate = new Date(now);
        startDate.setDate(now.getDate() - now.getDay());
        endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 7);
      } else if (period === 'mes') {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      } else if (period === 'anio') {
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear() + 1, 0, 1);
      }
  
      // Consultar el total de ventas por método de pago
      const queryResult = await sequelize.query(`
        SELECT v.metodo_pago, COALESCE(SUM(v.total), 0) AS total_ventas
        FROM "ventas" v
        WHERE v.fecha BETWEEN :startDate AND :endDate
        GROUP BY v.metodo_pago
        ORDER BY total_ventas DESC;
      `, {
        replacements: { startDate, endDate },
        type: sequelize.QueryTypes.SELECT
      });
  
      // Si queryResult no es un array, lo convertimos en uno
      const results = Array.isArray(queryResult) ? queryResult : [queryResult];
  
      // Estructurar la respuesta asegurando que todos los métodos de pago están presentes
      const salesData = {
        "Efectivo": 0,
        "Nequi": 0,
        "Daviplata": 0,
        "Transferencia": 0
      };
  
      results.forEach(sale => {
        if (salesData.hasOwnProperty(sale.metodo_pago)) {
          salesData[sale.metodo_pago] = parseFloat(sale.total_ventas);
        }
      });
  
      res.json(salesData);
    } catch (error) {
      console.error("Error en total-sales:", error);
      res.status(500).json({ error: "Error al obtener el total de ventas", detalle: error.message });
    }
  });
    
module.exports = router;
