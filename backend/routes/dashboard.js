const express = require('express');
const router = express.Router();
const { sequelize } = require('../models'); // Instancia de Sequelize

router.get('/ventas/hoy', async (req, res) => {
  try {
    console.log("🔍 Consultando ventas del día con serie de tiempo por hora...");

    const [result] = await sequelize.query(`
      WITH horas AS (
    SELECT generate_series(
        date_trunc('day', NOW() AT TIME ZONE 'America/Bogota'),
        date_trunc('day', NOW() AT TIME ZONE 'America/Bogota') + INTERVAL '23 hours',
        INTERVAL '1 hour'
    ) AS hora
)
SELECT 
    to_char(h.hora, 'HH24:00') AS hora_exacta,
    COALESCE(SUM(v.total), 0) AS total_ventas,
    COALESCE(COUNT(v.ventas_id), 0) AS cantidad_ventas
FROM horas h
LEFT JOIN ventas v 
    ON date_trunc('hour', v.fecha AT TIME ZONE 'America/Bogota') = h.hora
WHERE v.fecha AT TIME ZONE 'America/Bogota' >= date_trunc('day', NOW() AT TIME ZONE 'America/Bogota')
   OR v.ventas_id IS NULL  -- Para asegurarnos de que todas las horas aparecen
GROUP BY h.hora
ORDER BY h.hora;

    `);

    console.log("✅ Ventas del día obtenidas con hora exacta:", result);
    res.json(result);
  } catch (error) {
    console.error("❌ Error SQL:", error);
    res.status(500).json({ error: 'Error al obtener ventas del día', detalle: error.message });
  }
});

module.exports = router;
