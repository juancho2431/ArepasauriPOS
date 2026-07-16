// src/components/login/PrivateRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children, roles }) => {
  // La sesión es válida solo si existe un token JWT.
  // Nota: la seguridad real la aplica el backend validando el token en cada
  // petición; este chequeo solo controla la navegación de la interfaz.
  const token = localStorage.getItem('token');
  const isAuthenticated = Boolean(token) && localStorage.getItem('isAuthenticated') === 'true';
  const userRole = localStorage.getItem('userRole');

  // Verificar si el usuario está autenticado y tiene uno de los roles permitidos
  if (!isAuthenticated || (roles && !roles.includes(userRole))) {
    return <Navigate to="/login" replace />;
  }

  // Renderizar el componente si se cumple la validación
  return children;
};

export default PrivateRoute;
