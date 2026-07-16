// scripts/crear-admin.js
// Crea (o resetea la contraseña de) un usuario administrador.
// Reemplaza al "superadmin quemado" que antes estaba en el código del frontend.
//
// Uso (desde la carpeta backend):
//   node scripts/crear-admin.js <usuario> <contraseña> [rol]
//   Ejemplo: node scripts/crear-admin.js admin MiClaveSegura123 Superadmin
//
// Con docker: docker exec -it backend_app node scripts/crear-admin.js admin MiClaveSegura123

require('dotenv').config();
const bcrypt = require('bcryptjs');
const Empleado = require('../models/Empleado');
const sequelize = require('../config/db');

async function crearAdmin() {
  const [, , usuario, contraseña, rol = 'Superadmin'] = process.argv;

  if (!usuario || !contraseña) {
    console.error('Uso: node scripts/crear-admin.js <usuario> <contraseña> [rol]');
    process.exit(1);
  }
  if (contraseña.length < 8) {
    console.error('La contraseña debe tener al menos 8 caracteres.');
    process.exit(1);
  }

  try {
    const hash = await bcrypt.hash(contraseña, 10);
    const existente = await Empleado.findOne({ where: { usuario } });

    if (existente) {
      await existente.update({ contraseña: hash, rol });
      console.log(`✔ Usuario '${usuario}' ya existía: contraseña reseteada y rol '${rol}' asignado.`);
    } else {
      await Empleado.create({
        nombre: 'Admin',
        apellido: 'Sistema',
        rol,
        usuario,
        contraseña: hash,
      });
      console.log(`✔ Usuario '${usuario}' creado con rol '${rol}'.`);
    }
  } catch (error) {
    console.error('Error al crear el admin:', error);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
}

crearAdmin();
