// middleware/authorize.js

/**
 * Middleware de autorización que verifica si el rol del usuario
 * está dentro de la lista de roles permitidos.
 * 
 * @param {string | string[]} roles - Rol o lista de roles permitidos.
 * @returns {Function} - Middleware de Express que valida el rol.
 */
const authorize = (roles = []) => {
    // Si 'roles' se recibe como string (ej: 'admin'), lo convertimos en array ['admin']
    if (typeof roles === 'string') {
      roles = [roles];
    }
  
    // Devolvemos la función middleware que Express usará en las rutas
    return (req, res, next) => {
      // Asegúrate de que, antes de este middleware, haya uno que asigne req.user.
      // Por ejemplo, un middleware de autenticación que guarde en req.user los datos del usuario.
      
      // Verificamos si el rol del usuario (req.user.rol) está incluido en la lista de roles permitidos
      if (!roles.includes(req.user.rol)) {
        // Si no está, enviamos un error 403 (Prohibido)
        return res.status(403).json({ message: 'No autorizado' });
      }
  
      // Si el rol es válido, continuamos con la siguiente función en la cadena de middlewares
      next();
    };
  };
  
  module.exports = authorize;
  