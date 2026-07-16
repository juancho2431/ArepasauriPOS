// src/setupAxios.js
// Configuración global de axios:
// 1. Adjunta el token JWT (guardado en el login) a todas las peticiones.
// 2. Si el backend responde 401 (token vencido o inválido), cierra la sesión
//    y redirige al login automáticamente.

import axios from 'axios';

// Al cargar la app, restaurar el token si existe una sesión previa
const token = localStorage.getItem('token');
if (token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

// Interceptor de respuestas: manejar sesión expirada
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    const esLogin = error.config?.url?.includes('/api/login');
    if (error.response?.status === 401 && !esLogin) {
      // Token vencido o inválido: limpiar sesión y volver al login
      localStorage.removeItem('token');
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('authenticatedUser');
      localStorage.removeItem('userRole');
      delete axios.defaults.headers.common['Authorization'];
      window.location.href = '/login?expired=1';
    }
    return Promise.reject(error);
  }
);
