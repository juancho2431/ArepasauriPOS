// Ejemplo de modelo de Empleado en Sequelize para entorno local

// Importamos DataTypes de Sequelize para definir los tipos de datos de cada campo.
const { DataTypes } = require('sequelize');

// Importamos la configuración de la base de datos.
// Asegúrate de que este archivo esté apuntando a tu base de datos local.
const sequelize = require('../config/db');

// Definimos el modelo 'Empleado' que representa la tabla 'empleados' en la base de datos.
const Empleado = sequelize.define('Empleado', {
    // Campo 'empleado_id' es la clave primaria auto incrementable.
    empleado_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    // Campo 'nombre' para el nombre del empleado.
    nombre: {
        type: DataTypes.STRING,
        allowNull: false
    },
    // Campo 'apellido' para el apellido del empleado.
    apellido: {
        type: DataTypes.STRING,
        allowNull: false
    },
    // Campo 'rol' que indica el rol del empleado (por ejemplo, 'admin', 'usuario', etc.).
    rol: {
        type: DataTypes.STRING,
        allowNull: false
    },
    // Campo 'usuario' para el nombre de usuario, que debe ser único.
    usuario: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    // Campo 'contraseña' para almacenar la contraseña del empleado.
    // Nota: Es recomendable almacenar contraseñas encriptadas (hash) en producción.
    contraseña: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    // Indicamos el nombre real de la tabla en la base de datos.
    tableName: 'empleados',
    // Desactivamos la generación automática de 'createdAt' y 'updatedAt'.
    timestamps: false
});

// Exportamos el modelo para poder utilizarlo en otras partes de la aplicación.
module.exports = Empleado;
