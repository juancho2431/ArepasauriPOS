// src/pages/Login.js
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import '../styles/Login.css';
import logo from '../assets/LOGO_AREPASAURIOS.png';

const Login = ({ setAuthenticatedUser }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const apiUrl = process.env.REACT_APP_API_URL;

  // Aviso cuando la sesión expiró (redirección desde setupAxios)
  const sesionExpirada = new URLSearchParams(location.search).get('expired') === '1';

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await axios.post(`${apiUrl}/api/login`, {
        username,
        password,
      });

      const { token, username: user, role } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('authenticatedUser', user);
      localStorage.setItem('userRole', role);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      setAuthenticatedUser(user);
      navigate('/');
    } catch (error) {
      if (error.response) {
        setError('Usuario o contraseña incorrectos');
      } else {
        setError('No se pudo conectar con el servidor. Intenta de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <img src={logo} alt="Arepasaurios" className="login-logo" />
        <h2>Bienvenido</h2>
        <p className="login-subtitle">Ingresa a tu punto de venta</p>

        {sesionExpirada && !error && (
          <p className="info-message">Tu sesión expiró. Ingresa de nuevo.</p>
        )}

        <form onSubmit={handleLogin}>
          <div className="input-container">
            <label htmlFor="login-user">Usuario</label>
            <input
              id="login-user"
              type="text"
              placeholder="tu.usuario"
              value={username}
              onChange={(e) => { setUsername(e.target.value); setError(''); }}
              autoFocus
              autoComplete="username"
              required
            />
          </div>
          <div className="input-container">
            <label htmlFor="login-pass">Contraseña</label>
            <input
              id="login-pass"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            </button>
          </div>
          <button type="submit" disabled={loading}>
            {loading ? 'Ingresando…' : 'Ingresar'}
          </button>
          {error && <p className="error-message">{error}</p>}
        </form>

        <p className="login-footer">Arepasaurios POS</p>
      </div>
    </div>
  );
};

export default Login;
