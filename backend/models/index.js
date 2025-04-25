// Importamos la instancia de Sequelize configurada en '../config/db'
const sequelize = require('../config/db');

// Importamos todos los modelos necesarios
const Ventas = require('./ventas');                  // Modelo de Ventas
const VentaDetalle = require('./VentaDetalle');       // Modelo de detalle de ventas
const Producto = require('./Producto');               // Modelo de Producto (anteriormente "Arepa")
const Bebida = require('./bebida');                   // Modelo de Bebida
const Ingrediente = require('./Ingrediente');         // Modelo de Ingrediente
const ProductoIngrediente = require('./productosIngrediente'); // Modelo intermedio para Producto e Ingrediente (antes "ArepaIngrediente")
const Empleado = require('./Empleado');               // Modelo de Empleado

// ==================================================
// Definición de relaciones entre modelos
// ==================================================

// Relación muchos a muchos entre Producto e Ingrediente a través de ProductoIngrediente.
// Esto permite que un producto tenga varios ingredientes y viceversa.
Producto.belongsToMany(Ingrediente, {
  through: ProductoIngrediente,   // Especifica la tabla intermedia
  foreignKey: 'producto_id'       // Clave foránea en la tabla intermedia que apunta a Producto
});
Ingrediente.belongsToMany(Producto, {
  through: ProductoIngrediente,
  foreignKey: 'ingredient_id'     // Clave foránea en la tabla intermedia que apunta a Ingrediente
});

// Relación uno a muchos entre Ventas y VentaDetalle.
// Una venta puede tener múltiples detalles (productos vendidos).
Ventas.hasMany(VentaDetalle, {
  foreignKey: 'venta_id',
  as: 'VentaDetalles'            // Alias para acceder a los detalles de una venta
});
VentaDetalle.belongsTo(Ventas, {
  foreignKey: 'venta_id'
});

// Relación entre Ventas y Empleado.
// Cada venta está asociada a un empleado (vendedor) que la realizó.
Ventas.belongsTo(Empleado, {
  as: 'vendedor',                // Alias para referenciar el vendedor en una venta
  foreignKey: 'vendedor_id'
});

// Relación entre VentaDetalle y Producto.
// Un detalle de venta puede referirse a un producto.
// Se utiliza "constraints: false" para evitar conflictos en caso de tener asociaciones múltiples con el mismo foreignKey.
VentaDetalle.belongsTo(Producto, {
  as: 'producto',
  foreignKey: 'producto_id',
});

VentaDetalle.belongsTo(Bebida, {
  as: 'bebida',
  foreignKey: 'bebida_id',
});

// ==================================================
// Sincronización de modelos con la base de datos
// ==================================================
// La opción { force: false } evita recrear las tablas cada vez que se sincronizan.
sequelize.sync({ force: false })
  .then(() => {
    console.log('Tablas sincronizadas.');
  })
  .catch((error) => {
    console.error('Error al sincronizar las tablas:', error);
  });

// Exportamos la instancia de Sequelize y los modelos para usarlos en otras partes de la aplicación.
module.exports = {
  sequelize,
  Ventas,           // Exporta el modelo de Ventas
  VentaDetalle,
  Producto,
  Bebida,
  Ingrediente,
  ProductoIngrediente,
  Empleado
};
