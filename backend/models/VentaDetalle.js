// models/VentaDetalle.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// Modelo "VentaDetalle" con dos columnas (producto_id, bebida_id) + validación
const VentaDetalle = sequelize.define('VentaDetalle', {
  venta_detalle_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  // Clave foránea a la tabla "ventas"
  venta_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'ventas', // Nombre real de la tabla de ventas
      key: 'ventas_id'
    },
  },
  // Campo que indica si es 'producto' o 'bebida'
  tipo_producto: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isIn: {
        args: [['producto', 'bebida']],
        msg: "tipo_producto debe ser 'producto' o 'bebida'."
      }
    }
  },
  // Columna que apunta a la tabla "productos"
  producto_id: {
    type: DataTypes.INTEGER,
    allowNull: true, // Podrá ser null si es una bebida
  },
  // Columna que apunta a la tabla "bebidas"
  bebida_id: {
    type: DataTypes.INTEGER,
    allowNull: true, // Podrá ser null si es un producto
  },
  // Cantidad vendida
  cantidad: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  // Precio unitario en el momento de la venta
  precio: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  tableName: 'venta_detalles',
  timestamps: false,

  // Validación interna para impedir mezclar datos
  // Se ejecuta antes de un create/update
  validate: {
    checkProductoBebida() {
      // Si es "producto", 'producto_id' no debe ser null y 'bebida_id' debe ser null
      if (this.tipo_producto === 'producto') {
        if (!this.producto_id || this.bebida_id) {
          throw new Error(
            "Si tipo_producto es 'producto', se requiere producto_id y bebida_id debe ser nulo."
          );
        }
      // Si es "bebida", 'bebida_id' no debe ser null y 'producto_id' debe ser null
      } else if (this.tipo_producto === 'bebida') {
        if (!this.bebida_id || this.producto_id) {
          throw new Error(
            "Si tipo_producto es 'bebida', se requiere bebida_id y producto_id debe ser nulo."
          );
        }
      }
      // De llegar aquí, todo está bien
    }
  }
});

module.exports = VentaDetalle;
