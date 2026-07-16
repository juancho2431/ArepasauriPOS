// scripts/migrar-contrasenas.js
// Convierte a hash bcrypt todas las contraseñas que aún estén en texto plano.
// Es idempotente: si una contraseña ya está hasheada (empieza con $2), la omite.
//
// Uso (desde la carpeta backend):
//   node scripts/migrar-contrasenas.js
//
// Con docker: docker exec -it backend_app node scripts/migrar-contrasenas.js

require('dotenv').config();
const bcrypt = require('bcryptjs');
const Empleado = require('../models/Empleado');
const sequelize = require('../config/db');

async function migrar() {
  try {
    const empleados = await Empleado.findAll();
    let migradas = 0;
    let omitidas = 0;

    for (const empleado of empleados) {
      const actual = empleado.contraseña || '';
      // Los hashes de bcrypt empiezan con $2a$, $2b$ o $2y$
      if (/^\$2[aby]\$/.test(actual)) {
        omitidas++;
        continue;
      }
      const hash = await bcrypt.hash(actual, 10);
      await empleado.update({ contraseña: hash });
      console.log(`✔ Contraseña migrada para usuario: ${empleado.usuario}`);
      migradas++;
    }

    console.log(`\nListo. Migradas: ${migradas} | Ya estaban hasheadas: ${omitidas}`);
  } catch (error) {
    console.error('Error en la migración:', error);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
}

migrar();
