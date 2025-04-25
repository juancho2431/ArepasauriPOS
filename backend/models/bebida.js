/**
 * Importamos DataTypes de Sequelize para definir los tipos de columnas
 */
const { DataTypes } = require('sequelize');

/**
 * Importamos la instancia de Sequelize que está configurada en '../config/db'.
 * Asegúrate de que en ese archivo se use la conexión local (por ejemplo, 'postgres://usuario:password@localhost:5432/tu_basededatos').
 */
const sequelize = require('../config/db');

/**
 * Definimos el modelo "Bebida". Este modelo representará la tabla "bebidas" en la base de datos.
 * El primer parámetro ('Bebida') es el nombre interno que usará Sequelize,
 * y el segundo es un objeto con las columnas que tendrá la tabla.
 */
const Bebida = sequelize.define('Bebida', {
  /**
   * 'bebida_id' es la clave primaria y se autoincrementa.
   * type: El tipo de dato es INTEGER.
   * primaryKey: Indica que es la clave primaria.
   * autoIncrement: Incrementa el valor automáticamente al crear un nuevo registro.
   */
  bebida_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  /**
   * 'name' es un campo de tipo STRING y no puede ser nulo.
   */
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  /**
   * 'stock' es un campo de tipo INTEGER que tampoco puede ser nulo.
   * Representa la cantidad de unidades disponibles de la bebida.
   */
  stock: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  /**
   * 'price' es un campo de tipo INTEGER para manejar el precio sin decimales.
   * Si quieres manejar decimales (por ejemplo, 10.99), podrías usar DataTypes.DECIMAL.
   */
  price: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  /**
   * tableName: especifica el nombre real de la tabla en la base de datos.
   */
  tableName: 'bebidas',
  /**
   * timestamps: false indica que no se crearán las columnas 'createdAt' y 'updatedAt'.
   */
  timestamps: false
});

/**
 * Exportamos el modelo para poder usarlo en otras partes de la aplicación.
 */
module.exports = Bebida;
