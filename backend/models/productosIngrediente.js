// Importamos DataTypes de Sequelize para definir los tipos de datos de cada campo.
const { DataTypes } = require('sequelize');
// Importamos la instancia de Sequelize configurada en '../config/db'.
// Asegúrate de que este archivo esté apuntando a tu base de datos local.
const sequelize = require('../config/db');

/**
 * Modelo "ProductoIngrediente"
 *
 * Este modelo representa la tabla intermedia que relaciona los productos y sus ingredientes.
 * Se utiliza para manejar una relación muchos a muchos entre Producto e Ingrediente,
 * permitiendo además almacenar la cantidad (amount) de cada ingrediente que compone un producto.
 */
const ProductoIngrediente = sequelize.define('ProductoIngrediente', {
  // Clave foránea que referencia a un producto.
  producto_id: {
    type: DataTypes.INTEGER,
    // Se hace referencia al modelo "Producto", usando la clave primaria 'producto_id' de dicho modelo.
    references: {
      model: 'Producto', // Asegúrate de que este nombre coincida con el nombre definido en el modelo Producto.
      key: 'producto_id'
    }
  },
  // Clave foránea que referencia a un ingrediente.
  ingredient_id: {
    type: DataTypes.INTEGER,
    // Se hace referencia al modelo "Ingrediente", usando la clave primaria 'ingredient_id' de dicho modelo.
    references: {
      model: 'Ingrediente', // Asegúrate de que este nombre coincida con el nombre definido en el modelo Ingrediente.
      key: 'ingredient_id'
    }
  },
  // Campo 'amount' que indica la cantidad del ingrediente utilizada en el producto.
  amount: {
    type: DataTypes.FLOAT,
    allowNull: false
  }
}, {
  // Nombre real de la tabla en la base de datos.
  tableName: 'producto_ingredients',
  // Desactiva la creación automática de los campos 'createdAt' y 'updatedAt'.
  timestamps: false
});

// Exportamos el modelo para poder utilizarlo en otras partes de la aplicación.
module.exports = ProductoIngrediente;
