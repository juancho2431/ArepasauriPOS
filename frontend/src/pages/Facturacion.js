// src/pages/Facturacion.js

import React, { useState, useEffect, useCallback } from 'react';
import Select from 'react-select';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/Facturacion.css';

const Facturacion = () => {
  // Datos maestros
  const [productos, setProductos] = useState([]);
  const [bebidas, setBebidas] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [ventasHistorial, setVentasHistorial] = useState([]);

  // Carrito y totales
  const [carrito, setCarrito] = useState(() => {
    const saved = localStorage.getItem('carrito');
    return saved ? JSON.parse(saved) : [];
  });
  const [total, setTotal] = useState(() => {
    const saved = localStorage.getItem('total');
    return saved ? parseFloat(saved) : 0;
  });

  // Datos de venta
  const [cliente, setCliente] = useState('');
  const [metodoPago, setMetodoPago] = useState('Efectivo');
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState('');

  // Modal de ingredientes
  const [showIngredientsModal, setShowIngredientsModal] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [cantidadProductos, setCantidadProductos] = useState(1);

  // Selects buscables
  const [selectedProductoOption, setSelectedProductoOption] = useState(null);
  const [selectedBebidaOption, setSelectedBebidaOption] = useState(null);

  const apiUrl = process.env.REACT_APP_API_URL;

  // Persistir carrito y total
  useEffect(() => {
    localStorage.setItem('carrito', JSON.stringify(carrito));
    localStorage.setItem('total', total.toString());
  }, [carrito, total]);

  // Fetchers
  const fetchProductos = useCallback(async () => {
    try {
      const { data } = await axios.get(`${apiUrl}/api/productos`);
      setProductos(data);
    } catch {
      toast.error('Error al obtener productos');
    }
  }, [apiUrl]);

  const fetchBebidas = useCallback(async () => {
    try {
      const { data } = await axios.get(`${apiUrl}/api/bebidas`);
      setBebidas(data);
    } catch {
      toast.error('Error al obtener bebidas');
    }
  }, [apiUrl]);

  const fetchEmpleados = useCallback(async () => {
    try {
      const { data } = await axios.get(`${apiUrl}/api/empleados/empleados`);
      setEmpleados(data);
    } catch {
      toast.error('Error al obtener empleados');
    }
  }, [apiUrl]);

  const fetchHistorial = useCallback(async () => {
    try {
      const { data } = await axios.get(`${apiUrl}/api/ventas`);
      setVentasHistorial(data);
    } catch {
      toast.error('Error al obtener historial de ventas');
    }
  }, [apiUrl]);

  useEffect(() => {
    fetchProductos();
    fetchBebidas();
    fetchEmpleados();
    fetchHistorial();
  }, [fetchProductos, fetchBebidas, fetchEmpleados, fetchHistorial]);

  // Formateo de precios
  const formatPrice = price => price.toLocaleString('es-CO');

  // Opciones para react-select
  const opcionesProductos = productos.map(p => ({
    value: p.producto_id,
    label: `${p.name} - $${formatPrice(p.price)}`,
    data: p
  }));
  const opcionesBebidas = bebidas.map(b => ({
    value: b.bebida_id,
    label: `${b.name} - $${formatPrice(b.price)}`,
    data: b
  }));

  // Abre modal de ingredientes
  const handleOpenIngredientsModal = producto => {
    setCurrentProduct(producto);
    setCantidadProductos(1);
    const ings = producto.Ingredientes.map(ing => ({
      ...ing,
      checked: true,
      amount: ing.ProductoIngrediente.amount || 1
    }));
    setSelectedIngredients(ings);
    setShowIngredientsModal(true);
    setSelectedProductoOption({
      value: producto.producto_id,
      label: `${producto.name} - $${formatPrice(producto.price)}`,
      data: producto
    });
  };

  // Toggle y cantidad en modal
  const handleToggleIngredient = id => {
    setSelectedIngredients(prev =>
      prev.map(ing =>
        ing.ingredient_id === id
          ? { ...ing, checked: !ing.checked }
          : ing
      )
    );
  };

  const handleChangeIngredientAmount = (id, value) => {
    setSelectedIngredients(prev =>
      prev.map(ing =>
        ing.ingredient_id === id
          ? { ...ing, amount: parseFloat(value) || 1 }
          : ing
      )
    );
  };

  // Agrega item al carrito
  const handleAddToCarrito = item => {
    const key = item.type === 'producto' ? 'producto_id' : 'bebida_id';
    const existing = carrito.find(i => i[key] === item[key]);

    if (existing) {
      toast.info('Ítem ya en carrito, incrementando cantidad');
      setCarrito(prev =>
        prev.map(i =>
          i[key] === item[key]
            ? { ...i, cantidad: i.cantidad + item.cantidad }
            : i
        )
      );
    } else {
      toast.success('Agregado al carrito');
      setCarrito(prev => [...prev, item]);
    }
    setTotal(prev => prev + item.price * item.cantidad);
  };

  // Confirma selección de ingredientes y cantidad
  const handleConfirmIngredients = () => {
    if (!currentProduct) return;
    const ings = selectedIngredients
      .filter(i => i.checked && i.amount > 0)
      .map(({ ingredient_id, name, amount }) => ({
        ingredient_id,
        name,
        amount
      }));
    const prodItem = {
      ...currentProduct,
      type: 'producto',
      producto_id: currentProduct.producto_id,
      bebida_id: null,
      ingredientesSeleccionados: ings,
      cantidad: cantidadProductos,
      price: currentProduct.price
    };
    handleAddToCarrito(prodItem);
    setShowIngredientsModal(false);
    setSelectedProductoOption(null);
  };

  // Añadir bebida al carrito al seleccionar
  useEffect(() => {
    if (selectedBebidaOption) {
      const beb = selectedBebidaOption.data;
      handleAddToCarrito({
        ...beb,
        type: 'bebida',
        bebida_id: beb.bebida_id,
        cantidad: 1,
        price: beb.price
      });
      setSelectedBebidaOption(null);
    }
  }, [selectedBebidaOption]);

  // Confirma la venta e imprime
  const handleConfirmSale = async () => {
    if (!cliente || !empleadoSeleccionado || carrito.length === 0) {
      return toast.error('Complete todos los campos y agregue ítems.');
    }
    const ventaData = {
      cliente,
      metodo_pago: metodoPago,
      vendedor_id: empleadoSeleccionado,
      fecha: new Date().toISOString(),
      total,
      detalles: carrito.map(item => ({
        tipo_producto: item.type,
        producto_id: item.type === 'producto' ? item.producto_id : null,
        bebida_id: item.type === 'bebida' ? item.bebida_id : null,
        cantidad: item.cantidad,
        precio: item.price,
        ingredientes: item.ingredientesSeleccionados || []
      }))
    };
    try {
      const resp = await axios.post(`${apiUrl}/api/ventas`, ventaData);
      toast.success('Venta registrada');
      setCarrito([]);
      setTotal(0);
      setCliente('');
      setMetodoPago('Efectivo');
      setEmpleadoSeleccionado('');
      fetchHistorial();
    } catch {
      toast.error('Error al registrar venta');
    }
  };

  return (
    <div className="facturacion-container">
      <ToastContainer />

      <h1>Facturación</h1>

      {/* DROPDOWNS BUSCABLES */}
      <div className="seleccion-opcional">
        <div className="campo-select">
          <label>Producto (opcional)</label>
          <Select
            options={opcionesProductos}
            placeholder="Selecciona un producto..."
            isSearchable
            value={selectedProductoOption}
            onChange={opt => opt ? handleOpenIngredientsModal(opt.data) : setSelectedProductoOption(null)}
          />
        </div>
        <div className="campo-select">
          <label>Bebida (opcional)</label>
          <Select
            options={opcionesBebidas}
            placeholder="Selecciona una bebida..."
            isSearchable
            value={selectedBebidaOption}
            onChange={setSelectedBebidaOption}
          />
        </div>
      </div>
      {/* Carrito */}
      <div className="carrito">
        <h2>Carrito</h2>
        {carrito.length === 0 ? (
          <p>No hay ítems</p>
        ) : (
          <ul>
            {carrito.map((item, i) => (
              <li key={i}>
                <strong>{item.name}</strong> x {item.cantidad} – ${formatPrice(item.price)}
                {item.type === 'producto' && item.ingredientesSeleccionados?.length > 0 && (
                  <ul>
                    {item.ingredientesSeleccionados.map((ing, j) => (
                      <li key={j}>
                        {ing.name} x {ing.amount}
                      </li>
                    ))}
                  </ul>
                )}
                <button
                  onClick={() => {
                    setTotal(t => t - item.price * item.cantidad);
                    setCarrito(c => c.filter((_, idx) => idx !== i));
                    toast.warn('Ítem eliminado');
                  }}
                >
                  Eliminar
                </button>
              </li>
            ))}
          </ul>
        )}
        <p className="total">Total: ${formatPrice(total)}</p>
      </div>

      {/* Datos de la venta */}
      <div className="venta-datos">
        <input
          type="text"
          placeholder="Nombre del cliente"
          value={cliente}
          onChange={e => setCliente(e.target.value)}
        />
        <select value={metodoPago} onChange={e => setMetodoPago(e.target.value)}>
          <option value="Efectivo">Efectivo</option>
          <option value="Nequi">Nequi</option>
          <option value="Daviplata">Daviplata</option>
          <option value="Transferencia">Transferencia</option>
        </select>
        <select value={empleadoSeleccionado} onChange={e => setEmpleadoSeleccionado(e.target.value)}>
          <option value="">Vendedor</option>
          {empleados.map(emp => (
            <option key={emp.empleado_id} value={emp.empleado_id}>
              {emp.nombre} {emp.apellido}
            </option>
          ))}
        </select>
        <button onClick={handleConfirmSale} disabled={carrito.length === 0}>
          Confirmar Venta
        </button>
      </div>

      {/* Historial de Ventas */}
      <div className="ventas">
        <h2>Historial de Ventas</h2>
        <table>
          <thead>
            <tr>
              <th>ID Venta</th>
              <th>Fecha</th>
              <th>Total</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {ventasHistorial.map(venta => (
              <tr key={venta.ventas_id}>
                <td>{venta.ventas_id}</td>
                <td>{new Date(venta.fecha).toLocaleString()}</td>
                <td>${formatPrice(venta.total)}</td>
                <td>
                  <Link to={`/facturacion/imprimir/${venta.ventas_id}`} className="btn">
                    Imprimir Factura
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de ingredientes */}
      {showIngredientsModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Ingredientes para {currentProduct.name}</h2>
            <div className="ingredientes-list">
              {selectedIngredients.map(ing => (
                <div key={ing.ingredient_id} className="ingrediente-item">
                  <label>
                    <input
                      type="checkbox"
                      checked={ing.checked}
                      onChange={() => handleToggleIngredient(ing.ingredient_id)}
                    />
                    {ing.name}
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={ing.amount}
                    onChange={e => handleChangeIngredientAmount(ing.ingredient_id, e.target.value)}
                    placeholder="Cantidad"
                  />
                </div>
              ))}
            </div>
            <div className="modal-actions">
              <label>Cantidad de productos:</label>
              <input
                type="number"
                min="1"
                value={cantidadProductos}
                onChange={e => setCantidadProductos(parseInt(e.target.value, 10) || 1)}
              />
              <button onClick={handleConfirmIngredients}>Añadir al carrito</button>
              <button
                onClick={() => {
                  setShowIngredientsModal(false);
                  setSelectedProductoOption(null);
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Facturacion;
