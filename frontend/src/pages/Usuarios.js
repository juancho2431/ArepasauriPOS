import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/tables.css';

const Empleados = () => {
    const [empleados, setEmpleados] = useState([]);
    const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState(null);
    const [nuevoEmpleado, setNuevoEmpleado] = useState({
        nombre: '',
        apellido: '',
        rol: 'Cajero'
    });
    const [contraseñaGenerada, setContraseñaGenerada] = useState('');
    const [error, setError] = useState('');

    // Restablecer contraseña: requiere reingresar la propia contraseña del superadmin
    const [empleadoAResetear, setEmpleadoAResetear] = useState(null);
    const [superadminPassword, setSuperadminPassword] = useState('');
    const [resetError, setResetError] = useState('');
    const [resetLoading, setResetLoading] = useState(false);
    const [contraseñaReseteada, setContraseñaReseteada] = useState(null); // { usuario, contraseña }

    useEffect(() => {
        obtenerEmpleados();    }, []);

    const apiUrl = process.env.REACT_APP_API_URL;

    const obtenerEmpleados = async () => {
        try {
            const response = await axios.get(`${apiUrl}/api/empleados/empleados`);
            setEmpleados(response.data);
        } catch (error) {
            console.error('Error al obtener empleados:', error);
            setError('Error al obtener empleados');
        }
    };

    const eliminarEmpleado = async (id) => {
        try {
            await axios.delete(`${apiUrl}/api/empleados/empleados/${id}`);
            obtenerEmpleados(); // Refresh the list after deletion
        } catch (error) {
            console.error('Error al eliminar empleado:', error);
            setError('Error al eliminar empleado');
        }
    };

    const crearEmpleado = async () => {
        if (!nuevoEmpleado.nombre || !nuevoEmpleado.apellido) {
            setError('Por favor, complete todos los campos.');
            return;
        }

        try {
            if (empleadoSeleccionado) {
                // Editar empleado (solo nombre, apellido y rol; la contraseña no cambia aquí)
                await axios.put(`${apiUrl}/api/empleados/empleados/${empleadoSeleccionado.empleado_id}`, nuevoEmpleado);
                setEmpleadoSeleccionado(null);
            } else {
                // Generar usuario y contraseña antes de crear
                const usuarioGenerado = `${nuevoEmpleado.nombre.toLowerCase()}.${nuevoEmpleado.apellido.toLowerCase()}`;
                const contraseñaNueva = Math.random().toString(36).slice(-8);

                const empleadoConCredenciales = {
                    ...nuevoEmpleado,
                    usuario: usuarioGenerado,
                    contraseña: contraseñaNueva
                };

                await axios.post(`${apiUrl}/api/empleados/empleados`, empleadoConCredenciales);

                // Mostrarla una sola vez: es el único momento en que se puede ver
                setContraseñaGenerada(contraseñaNueva);
            }

            // Limpiar el formulario (sin borrar la contraseña generada para que se alcance a copiar)
            setNuevoEmpleado({ nombre: '', apellido: '', rol: 'Cajero' });
            obtenerEmpleados();
            setError('');
        } catch (error) {
            console.error('Error al crear o editar empleado:', error);
            setError('Error al crear o editar empleado');
        }
    };

    const seleccionarEmpleado = (empleado) => {
        setEmpleadoSeleccionado(empleado);
        setContraseñaGenerada('');
        setNuevoEmpleado({
            nombre: empleado.nombre,
            apellido: empleado.apellido,
            rol: empleado.rol
        });
    };

    const cancelarEdicion = () => {
        setEmpleadoSeleccionado(null);
        setNuevoEmpleado({ nombre: '', apellido: '', rol: 'Cajero' });
        setContraseñaGenerada('');
        setError('');
    };

    const abrirResetPassword = (empleado) => {
        setEmpleadoAResetear(empleado);
        setSuperadminPassword('');
        setResetError('');
        setContraseñaReseteada(null);
    };

    const cerrarResetPassword = () => {
        setEmpleadoAResetear(null);
        setSuperadminPassword('');
        setResetError('');
        setResetLoading(false);
    };

    const confirmarResetPassword = async () => {
        if (!superadminPassword) {
            setResetError('Ingresa tu contraseña para confirmar.');
            return;
        }
        setResetLoading(true);
        setResetError('');
        try {
            const response = await axios.post(
                `${apiUrl}/api/empleados/empleados/${empleadoAResetear.empleado_id}/reset-password`,
                { superadminPassword }
            );
            setContraseñaReseteada({
                usuario: empleadoAResetear.usuario,
                contraseña: response.data.contraseña
            });
            setEmpleadoAResetear(null);
            setSuperadminPassword('');
        } catch (error) {
            const mensaje = error.response?.data?.error || 'Error al restablecer la contraseña';
            setResetError(mensaje);
        } finally {
            setResetLoading(false);
        }
    };

    const soloLetras = /^[a-zÁÉÍÓÚáéíóúÑñ\s]*$/;

    return (
        <div className="table-container">
            <h2>Gestión de Empleados</h2>
            {error && <p style={{ color: 'var(--danger)', fontWeight: 600 }}>{error}</p>}

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
                <input
                    type="text"
                    placeholder="Nombre"
                    value={nuevoEmpleado.nombre}
                    onChange={(e) => {
                        const valor = e.target.value;
                        if (soloLetras.test(valor)) {
                            setNuevoEmpleado({ ...nuevoEmpleado, nombre: valor });
                        }
                    }}
                />
                <input
                    type="text"
                    placeholder="Apellido"
                    value={nuevoEmpleado.apellido}
                    onChange={(e) => {
                        const valor = e.target.value;
                        if (soloLetras.test(valor)) {
                            setNuevoEmpleado({ ...nuevoEmpleado, apellido: valor });
                        }
                    }}
                />
                <select
                    value={nuevoEmpleado.rol}
                    onChange={(e) => setNuevoEmpleado({ ...nuevoEmpleado, rol: e.target.value })}
                >
                    <option value="Cajero">Cajero</option>
                    <option value="Administrador">Administrador</option>
                    <option value="Mesero">Mesero</option>
                </select>
                <button onClick={crearEmpleado}>
                    {empleadoSeleccionado ? 'Guardar Cambios' : 'Agregar Empleado'}
                </button>
                {empleadoSeleccionado && <button className="cancelar" onClick={cancelarEdicion}>Cancelar</button>}
            </div>

            {contraseñaGenerada && (
                <p style={{
                    background: 'var(--gold-100)',
                    border: '1px solid var(--gold-500)',
                    borderRadius: '8px',
                    padding: '10px 14px',
                    marginTop: '14px'
                }}>
                    Contraseña generada (cópiala ahora, no se volverá a mostrar):{' '}
                    <strong>{contraseñaGenerada}</strong>
                </p>
            )}

            {contraseñaReseteada && (
                <p style={{
                    background: 'var(--gold-100)',
                    border: '1px solid var(--gold-500)',
                    borderRadius: '8px',
                    padding: '10px 14px',
                    marginTop: '14px'
                }}>
                    Nueva contraseña para <strong>{contraseñaReseteada.usuario}</strong> (cópiala ahora, no se volverá a mostrar):{' '}
                    <strong>{contraseñaReseteada.contraseña}</strong>
                </p>
            )}

            <h3 style={{ marginTop: '24px' }}>Lista de Empleados</h3>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Apellido</th>
                        <th>Rol</th>
                        <th>Usuario</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {empleados.map((empleado) => (
                        <tr key={empleado.empleado_id}>
                            <td>{empleado.empleado_id}</td>
                            <td>{empleado.nombre}</td>
                            <td>{empleado.apellido}</td>
                            <td>{empleado.rol}</td>
                            <td>{empleado.usuario}</td>
                            <td>
                                <button className="edit" onClick={() => seleccionarEmpleado(empleado)}>Editar</button>
                                <button onClick={() => abrirResetPassword(empleado)}>Restablecer contraseña</button>
                                <button className="delete" onClick={() => eliminarEmpleado(empleado.empleado_id)}>Eliminar</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {empleadoAResetear && (
                <div className="modal-overlay" onClick={cerrarResetPassword}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3>Restablecer contraseña</h3>
                        <p>
                            Vas a generar una nueva contraseña para{' '}
                            <strong>{empleadoAResetear.usuario}</strong>. Por seguridad, confirma tu
                            propia contraseña de superadmin.
                        </p>
                        <div style={{ margin: '12px 0', textAlign: 'left' }}>
                            <label htmlFor="reset-superadmin-password" style={{ display: 'block', marginBottom: '6px' }}>
                                Tu contraseña
                            </label>
                            <input
                                id="reset-superadmin-password"
                                type="password"
                                style={{ width: '100%' }}
                                value={superadminPassword}
                                onChange={(e) => { setSuperadminPassword(e.target.value); setResetError(''); }}
                                autoFocus
                                autoComplete="current-password"
                            />
                        </div>
                        {resetError && <p style={{ color: 'var(--danger)', fontWeight: 600 }}>{resetError}</p>}
                        <div className="modal-actions">
                            <button onClick={confirmarResetPassword} disabled={resetLoading}>
                                {resetLoading ? 'Confirmando…' : 'Confirmar'}
                            </button>
                            <button className="cancelar" onClick={cerrarResetPassword}>Cancelar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Empleados;
