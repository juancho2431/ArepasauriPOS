// src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, NavLink, Navigate } from 'react-router-dom';
import './App.css';
import Dashboard from './pages/Dashboard';
import Inventario from './pages/Inventario';
import Compras from './pages/Compras';
import Facturacion from './pages/Facturacion';
import Usuarios from './pages/Usuarios';
import Reportes from './pages/Reportes';
import ImprimirFactura from './components/facturacion/ImprimirFactura';
import Login from './pages/Login';
import PrivateRoute from './components/login/PrivateRoute';
import logo from './assets/LOGO_AREPASAURIOS.png';

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [authenticatedUser, setAuthenticatedUser] = useState(localStorage.getItem('authenticatedUser') || '');
  const [userRole, setUserRole] = useState(localStorage.getItem('userRole') || 'Desconocido');
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';

  useEffect(() => {
    setAuthenticatedUser(localStorage.getItem('authenticatedUser') || 'Usuario no definido');
    setUserRole(localStorage.getItem('userRole') || 'Desconocido');
  }, [isAuthenticated]);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const closeMenu = () => setMenuOpen(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('authenticatedUser');
    localStorage.removeItem('userRole');
    setAuthenticatedUser('');
    setUserRole('');
    window.location.reload();
  };

  // Clase del enlace según esté activo o no
  const navClass = ({ isActive }) => (isActive ? 'nav-link active' : 'nav-link');

  return (
    <Router>
      <div className="app-container">
        {isAuthenticated ? (
          <>
            <aside className={`sidebar ${menuOpen ? 'open' : ''}`}>
              <div className="logo-container">
                <img src={logo} alt="Arepasaurios" className="logo" />
              </div>

              <div className="user-chip">
                <div className="user-avatar">
                  {(authenticatedUser || '?').charAt(0).toUpperCase()}
                </div>
                <div className="user-info">
                  <div className="user-name">{authenticatedUser || 'Desconocido'}</div>
                  <div className="user-role">{userRole || 'Sin rol'}</div>
                </div>
              </div>

              <nav>
                <NavLink to="/" end className={navClass} onClick={closeMenu}>
                  Dashboard
                </NavLink>
                <NavLink to="/inventario" className={navClass} onClick={closeMenu}>
                  Inventario
                </NavLink>
                {userRole !== 'Mesero' && userRole !== 'Empleado' && (
                  <NavLink to="/compras" className={navClass} onClick={closeMenu}>
                    Compras
                  </NavLink>
                )}
                <NavLink to="/facturacion" className={navClass} onClick={closeMenu}>
                  Facturación
                </NavLink>
                {userRole === 'Superadmin' && (
                  <NavLink to="/usuarios" className={navClass} onClick={closeMenu}>
                    Usuarios
                  </NavLink>
                )}
                <NavLink to="/reportes" className={navClass} onClick={closeMenu}>
                  Reportes
                </NavLink>
              </nav>

              <div className="logout-button" onClick={handleLogout} role="button" tabIndex={0}>
                Cerrar sesión
              </div>
            </aside>

            {menuOpen && <div className="sidebar-overlay" onClick={closeMenu} />}

            <div
              className="menu-hamburguesa"
              onClick={toggleMenu}
              role="button"
              aria-label="Abrir menú"
            >
              ☰
            </div>

            <div className="content">
              <Routes>
                <Route
                  path="/"
                  element={
                    <PrivateRoute roles={['Superadmin', 'Administrador', 'Cajero', 'Mesero', 'Empleado']}>
                      <Dashboard userRole={userRole} />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/inventario"
                  element={
                    <PrivateRoute roles={['Superadmin', 'Administrador', 'Cajero', 'Mesero', 'Empleado']}>
                      <Inventario userRole={userRole} />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/compras"
                  element={
                    <PrivateRoute roles={['Superadmin', 'Administrador', 'Cajero']}>
                      <Compras />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/facturacion"
                  element={
                    <PrivateRoute roles={['Superadmin', 'Administrador', 'Cajero']}>
                      <Facturacion />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/facturacion/imprimir/:ventaId"
                  element={
                    <PrivateRoute roles={['Superadmin', 'Administrador', 'Cajero']}>
                      <ImprimirFactura />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/usuarios"
                  element={
                    <PrivateRoute roles={['Superadmin']}>
                      <Usuarios />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/reportes"
                  element={
                    <PrivateRoute roles={['Superadmin', 'Administrador', 'Cajero', 'Empleado']}>
                      <Reportes dailySalesOnly={userRole === 'Empleado' || userRole === 'Cajero'} />
                    </PrivateRoute>
                  }
                />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </>
        ) : (
          <Routes>
            <Route path="/login" element={<Login setAuthenticatedUser={setAuthenticatedUser} />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        )}
      </div>
    </Router>
  );
}

export default App;
