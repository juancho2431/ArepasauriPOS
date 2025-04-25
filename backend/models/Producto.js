// Importamos DataTypes de Sequelize para definir los tipos de datos de cada campo.
const { DataTypes } = require('sequelize');
// Importamos la instancia de Sequelize configurada en '../config/db'.
// Asegúrate de que este archivo apunte a tu base de datos local.
const sequelize = require('../config/db');

/**
 * Modelo "Producto" que representa la tabla "productos" en la base de datos.
 * Se utiliza para almacenar información sobre los productos, incluyendo su nombre y precio.
 */
const Producto = sequelize.define('Producto', {
  // Clave primaria: producto_id, autoincrementable para identificar cada registro.
  producto_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  // Campo 'name' para almacenar el nombre del producto.
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  // Campo 'price' para almacenar el precio del producto.
  // Se utiliza INTEGER para manejar precios sin decimales.
  price: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  // Especificamos el nombre real de la tabla en la base de datos.
  tableName: 'productos',
  // Desactivamos la creación automática de campos de timestamp (createdAt y updatedAt).
  timestamps: false
});

// Exportamos el modelo para usarlo en otras partes de la aplicación.
module.exports = Producto;
