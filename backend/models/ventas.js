// models/Ventas.js

// Importamos DataTypes de Sequelize para definir los tipos de datos de cada campo.
const { DataTypes } = require('sequelize');
// Importamos la instancia de Sequelize configurada en '../config/db'.
// Asegúrate de que este archivo esté configurado para conectarse a tu base de datos local.
const sequelize = require('../config/db');
// Importamos el modelo de Empleado para definir la relación con el campo 'vendedor_id'.
const Empleado = require('./Empleado');

/**
 * Modelo "Ventas" que representa la tabla "ventas" en la base de datos.
 * Este modelo almacena la información de cada venta, incluyendo fecha, total,
 * cliente, método de pago y el vendedor asociado (relacionado con el modelo Empleado).
 */
const Ventas = sequelize.define('Ventas', {
  // Clave primaria: ventas_id, autoincrementable.
  ventas_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  // Campo 'fecha' que almacena la fecha de la venta.
  fecha: {
    type: DataTypes.DATE,
    allowNull: false
  },
  // Campo 'total' que almacena el monto total de la venta.
  total: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  // Campo 'cliente' para el nombre o identificación del cliente (opcional).
  cliente: {
    type: DataTypes.STRING,
    allowNull: true
  },
  // Campo 'metodo_pago' que indica el método de pago utilizado en la venta (opcional).
  metodo_pago: {
    type: DataTypes.STRING,
    allowNull: true
  },
  // Campo 'vendedor_id' que referencia al empleado (vendedor) que realizó la venta.
  // Se define como clave foránea que hace referencia al campo 'empleado_id' del modelo Empleado.
  vendedor_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: Empleado,
      key: 'empleado_id'
    }
  }
}, {
  // Especificamos el nombre real de la tabla en la base de datos.
  tableName: 'ventas',
  // Desactivamos la creación automática de los campos 'createdAt' y 'updatedAt'.
  timestamps: false
});

// Exportamos el modelo para poder utilizarlo en otras partes de la aplicación.
module.exports = Ventas;
