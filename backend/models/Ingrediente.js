// Importamos DataTypes de Sequelize para definir los tipos de datos de cada campo.
const { DataTypes } = require('sequelize');
// Importamos la configuración de la base de datos.
// Asegúrate de que '../config/db' esté configurado para apuntar a tu base de datos local.
const sequelize = require('../config/db');

/**
 * Modelo "Ingrediente" que representa la tabla "ingredients" en la base de datos.
 * Este modelo se usa para almacenar información sobre cada ingrediente, incluyendo
 * su nombre y el stock actual y mínimo.
 */
const Ingrediente = sequelize.define('Ingrediente', {
  // Clave primaria para cada ingrediente, se incrementa automáticamente.
  ingredient_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  // Nombre del ingrediente (por ejemplo, "Azúcar", "Harina").
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  // Stock actual del ingrediente, se utiliza FLOAT para admitir decimales.
  stock_current: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  // Stock mínimo requerido, para saber cuándo se debe reabastecer.
  stock_minimum: {
    type: DataTypes.FLOAT,
    allowNull: false
  }
}, {
  // Especifica el nombre real de la tabla en la base de datos.
  tableName: 'ingredients',
  // Desactiva la creación automática de las columnas "createdAt" y "updatedAt".
  timestamps: false
});

// Exportamos el modelo para que pueda ser utilizado en otras partes de la aplicación.
module.exports = Ingrediente;