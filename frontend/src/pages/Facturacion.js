import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/Facturacion.css';

const Facturacion = () => {
  const [ventas, setVentas] = useState([]);
  const [productos, setProductos] = useState([]);
  const [bebidas, setBebidas] = useState([]);
  const [ingredientes, setIngredientes] = useState([]);
  const [carrito, setCarrito] = useState(() => {
    const saved = localStorage.getItem('carrito');
    return saved ? JSON.parse(saved) : [];
  });
  const [total, setTotal] = useState(() => {
    const saved = localStorage.getItem('total');
    return saved ? parseFloat(saved) : 0;
  });
  const [cliente, setCliente] = useState('');
  const [metodoPago, setMetodoPago] = useState('Efectivo');
  const [empleados, setEmpleados] = useState([]);
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState('');

  const apiUrl = process.env.REACT_APP_API_URL;

  const [showIngredientsModal, setShowIngredientsModal] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [selectedIngredients, setSelectedIngredients] = useState([]);

  const formatPrice = (price) => price.toLocaleString('es-CO');

  useEffect(() => {
    localStorage.setItem('carrito', JSON.stringify(carrito));
    localStorage.setItem('total', total.toString());
  }, [carrito, total]);

  const fetchProductos = useCallback(async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/productos`);
      setProductos(response.data);
    } catch {
      toast.error('Error al obtener los productos');
    }
  }, [apiUrl]);

  const fetchBebidas = useCallback(async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/bebidas`);
      setBebidas(response.data);
    } catch {
      toast.error('Error al obtener las bebidas');
    }
  }, [apiUrl]);

  const fetchIngredientes = useCallback(async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/ingredientes`);
      setIngredientes(response.data);
    } catch {
      toast.error('Error al obtener los ingredientes');
    }
  }, [apiUrl]);

  const fetchVentas = useCallback(async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/ventas`);
      setVentas(response.data);
    } catch {
      toast.error('Error al obtener las ventas');
    }
  }, [apiUrl]);

  const fetchEmpleados = useCallback(async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/empleados/empleados`);
      setEmpleados(response.data);
    } catch {
      toast.error('Error al obtener los empleados');
    }
  }, [apiUrl]);

  useEffect(() => {
    fetchProductos();
    fetchBebidas();
    fetchIngredientes();
    fetchVentas();
    fetchEmpleados();
  }, [fetchProductos, fetchBebidas, fetchIngredientes, fetchVentas, fetchEmpleados]);

  const handleOpenIngredientsModal = (producto) => {
    setCurrentProduct(producto);
    const ingredientesProducto = producto.Ingredientes.map((ing) => ({
      ...ing,
      checked: true,
      amount: ing.ProductoIngrediente.amount || 1,
    }));
    setSelectedIngredients(ingredientesProducto);
    setShowIngredientsModal(true);
  };

  const handleToggleIngredient = (ingredientId) => {
    setSelectedIngredients((prev) =>
      prev.map((ing) =>
        ing.ingredient_id === ingredientId ? { ...ing, checked: !ing.checked } : ing
      )
    );
  };

  const handleChangeAmount = (ingredientId, value) => {
    setSelectedIngredients((prev) =>
      prev.map((ing) =>
        ing.ingredient_id === ingredientId
          ? { ...ing, amount: parseFloat(value) || 1 }
          : ing
      )
    );
  };

  const handleAddToCarrito = (item) => {
    const idKey = item.type === 'producto' ? 'producto_id' : 'bebida_id';
    const existing = carrito.find((i) => i[idKey] === item[idKey]);

    if (existing) {
      toast.info('Ya está en el carrito. Se incrementó la cantidad.');
      const updated = carrito.map((i) =>
        i[idKey] === item[idKey] ? { ...i, cantidad: (i.cantidad || 1) + 1 } : i
      );
      setCarrito(updated);
    } else {
      setCarrito([...carrito, { ...item, cantidad: 1 }]);
      toast.success('Agregado al carrito');
    }

    setTotal((prev) => prev + item.price);
  };

  const handleConfirmIngredients = () => {
    if (!currentProduct) return;
    const ingredientesSeleccionados = selectedIngredients
      .filter((ing) => ing.checked && ing.amount > 0)
      .map(({ ingredient_id, name, amount }) => ({ ingredient_id, name, amount }));

    const productoConIngredientes = {
      ...currentProduct,
      type: 'producto',
      producto_id: currentProduct.producto_id,
      bebida_id: null,
      ingredientesSeleccionados,
    };

    handleAddToCarrito(productoConIngredientes);
    setShowIngredientsModal(false);
  };

  const handleRemoveFromCarrito = (index) => {
    const item = carrito[index];
    setTotal((prev) => prev - item.price * (item.cantidad || 1));
    setCarrito(carrito.filter((_, i) => i !== index));
    toast.warn('Eliminado del carrito');
  };

  const handleConfirmSale = async () => {
    if (carrito.length === 0 || !cliente || !empleadoSeleccionado) {
      toast.error('Complete todos los campos y agregue al menos un producto.');
      return;
    }

    const ventaData = {
      cliente,
      metodo_pago: metodoPago,
      vendedor_id: empleadoSeleccionado,
      fecha: new Date().toISOString(),
      total,
      detalles: carrito.map((item) => ({
        tipo_producto: item.type,
        producto_id: item.type === 'producto' ? item.producto_id : null,
        bebida_id: item.type === 'bebida' ? item.bebida_id : null,
        cantidad: item.cantidad,
        precio: item.price,
        ingredientes: item.ingredientesSeleccionados || [],
      })),
    };

    try {
      await axios.post(`${apiUrl}/api/ventas`, ventaData);
      toast.success('Venta registrada exitosamente');
      setCarrito([]);
      setTotal(0);
      setCliente('');
      setMetodoPago('Efectivo');
      setEmpleadoSeleccionado('');
      fetchVentas();
      fetchIngredientes();
    } catch {
      toast.error('Error al registrar la venta');
    }
  };

  return (
    <div className="facturacion-container">
      <ToastContainer />
  
      <h1>Facturación</h1>
  
      {/* Selección de productos y bebidas */}
      <div className="productos-bebidas">
        <div className="productos-list">
          <h2>Productos</h2>
          {productos.map((producto) => (
            <div key={producto.producto_id} className="item">
              <span>
                {producto.name} - ${formatPrice(producto.price)}
              </span>
              <button onClick={() => handleOpenIngredientsModal(producto)}>
                Seleccionar Ingredientes
              </button>
            </div>
          ))}
        </div>
  
        <div className="bebidas-list">
          <h2>Bebidas</h2>
          {bebidas.map((bebida) => (
            <div key={bebida.bebida_id} className="item">
              <span>
                {bebida.name} - ${formatPrice(bebida.price)}
              </span>
              <button
                onClick={() =>
                  handleAddToCarrito({ ...bebida, type: 'bebida', bebida_id: bebida.bebida_id })
                }
              >
                Agregar
              </button>
            </div>
          ))}
        </div>
      </div>
  
      {/* Carrito */}
      <div className="carrito">
        <h2>Carrito de Compra</h2>
        {carrito.length === 0 ? (
          <p>No hay productos seleccionados</p>
        ) : (
          <ul>
            {carrito.map((item, index) => (
              <li key={index}>
                <strong>{item.name}</strong> x {item.cantidad} - ${formatPrice(item.price)}
                {item.type === 'producto' &&
                  item.ingredientesSeleccionados &&
                  item.ingredientesSeleccionados.length > 0 && (
                    <ul>
                      {item.ingredientesSeleccionados.map((ing, i) => (
                        <li key={i}>
                          {ing.name} x {ing.amount}
                        </li>
                      ))}
                    </ul>
                  )}
                <button onClick={() => handleRemoveFromCarrito(index)}>Eliminar</button>
              </li>
            ))}
          </ul>
        )}
        <p>Total: ${formatPrice(total)}</p>
  
        {/* Datos de la venta */}
        <div className="venta-datos">
          <label>Cliente:</label>
          <input
            type="text"
            value={cliente}
            onChange={(e) => setCliente(e.target.value)}
            placeholder="Nombre del cliente"
          />
          <label>Método de Pago:</label>
          <select value={metodoPago} onChange={(e) => setMetodoPago(e.target.value)}>
            <option value="Efectivo">Efectivo</option>
            <option value="Nequi">Nequi</option>
            <option value="Daviplata">Daviplata</option>
            <option value="Transferencia">Transferencia</option>
          </select>
          <label>Empleado (Vendedor):</label>
          <select
            value={empleadoSeleccionado}
            onChange={(e) => setEmpleadoSeleccionado(e.target.value)}
          >
            <option value="">Seleccione un empleado</option>
            {empleados.map((empleado) => (
              <option key={empleado.empleado_id} value={empleado.empleado_id}>
                {empleado.nombre} {empleado.apellido}
              </option>
            ))}
          </select>
        </div>
  
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
            {ventas.map((venta) => (
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
            <h2>Seleccionar Ingredientes</h2>
            <p>Producto: {currentProduct?.name}</p>
            <div className="ingredientes-list">
              {selectedIngredients.map((ing) => (
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
                    step="1"
                    value={ing.amount}
                    onChange={(e) => handleChangeAmount(ing.ingredient_id, e.target.value)}
                    placeholder="Cantidad"
                  />
                </div>
              ))}
            </div>
            <div className="modal-actions">
              <button onClick={handleConfirmIngredients}>Confirmar</button>
              <button onClick={() => setShowIngredientsModal(false)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
  };

export default Facturacion;
