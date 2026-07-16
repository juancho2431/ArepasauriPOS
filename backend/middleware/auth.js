// middleware/auth.js
// Middleware de autenticación: verifica el token JWT enviado en el header
// "Authorization: Bearer <token>" y asigna los datos del usuario a req.user.

const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'No autenticado: falta el token' });
  }

  try {
    // Verifica firma y expiración. El payload contiene: empleado_id, usuario, rol.
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
};

module.exports = auth;
