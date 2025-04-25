import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../styles/Inventario.css'; // Asegúrate de tener un CSS apropiado

function ProductosTable({ isReadOnly }) {
  const [productos, setProductos] = useState([]);
  const [newProducto, setNewProducto] = useState({
    name: '',
    price: '',
    ingredientes: []
  });
  const [ingredientesDisponibles, setIngredientesDisponibles] = useState([]);
  const [ingredienteSeleccionado, setIngredienteSeleccionado] = useState({
    ingredient_id: '',
    amount: ''
  });
  const [filtro, setFiltro] = useState('');

  const apiUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {
    fetchProductos();
    fetchIngredientes();
  }, []);

  const fetchProductos = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/productos`);
      setProductos(response.data);
    } catch (error) {
      console.error('Error al obtener los productos:', error);
    }
  };

  const fetchIngredientes = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/ingredientes`);
      setIngredientesDisponibles(response.data);
    } catch (error) {
      console.error('Error al obtener los ingredientes:', error);
    }
  };

  const handleAddProducto = async () => {
    if (newProducto.ingredientes.length === 0) {
      alert('Debe agregar al menos un ingrediente con cantidad válida.');
      return;
    }

    for (const ing of newProducto.ingredientes) {
      if (isNaN(ing.amount) || ing.amount <= 0) {
        alert('Las cantidades deben ser mayores a 0.');
        return;
      }
    }

    const productoToSend = {
      name: newProducto.name,
      price: parseFloat(newProducto.price),
      ingredientes: newProducto.ingredientes.map((ing) => ({
        id: parseInt(ing.ingredient_id),
        amount: parseFloat(ing.amount)
      }))
    };

    try {
      await axios.post(`${apiUrl}/api/productos`, productoToSend);
      fetchProductos();
      setNewProducto({ name: '', price: '', ingredientes: [] });
    } catch (error) {
      console.error('Error al agregar el producto:', error);
    }
  };

  const handleEditProducto = async (id) => {
    try {
      const updatedProducto = productos.find((p) => p.producto_id === id);
      await axios.put(`${apiUrl}/api/productos/${id}`, updatedProducto);
      fetchProductos();
    } catch (error) {
      console.error('Error al editar el producto:', error);
    }
  };

  const handleDeleteProducto = async (id) => {
    try {
      await axios.delete(`${apiUrl}/api/productos/${id}`);
      fetchProductos();
    } catch (error) {
      console.error('Error al eliminar el producto:', error);
    }
  };

  const handleAddIngredient = () => {
    const ingredientId = parseInt(ingredienteSeleccionado.ingredient_id);
    const amount = parseFloat(ingredienteSeleccionado.amount);

    if (isNaN(ingredientId) || isNaN(amount) || amount <= 0) {
      alert('Debe seleccionar un ingrediente y cantidad válida.');
      return;
    }

    const ingrediente = ingredientesDisponibles.find((ing) => ing.ingredient_id === ingredientId);
    if (!ingrediente) {
      alert('Ingrediente no válido.');
      return;
    }

    setNewProducto((prev) => ({
      ...prev,
      ingredientes: [...prev.ingredientes, { ingredient_id: ingredientId, amount }]
    }));

    setIngredienteSeleccionado({ ingredient_id: '', amount: '' });
  };

  // 🔍 Filtro de productos
  const productosFiltrados = productos.filter((producto) =>
    producto.name?.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    <div className="container">
      <h2>🍔 Gestión de Productos</h2>

      <input
        type="text"
        className="input"
        placeholder="Buscar producto por nombre..."
        value={filtro}
        onChange={(e) => setFiltro(e.target.value)}
      />

      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Precio</th>
            <th>Ingredientes</th>
            {!isReadOnly && <th>Acciones</th>}
          </tr>
        </thead>
        <tbody>
          {productosFiltrados.map((producto) => (
            <tr key={producto.producto_id}>
              <td>{producto.producto_id}</td>
              <td>
                {isReadOnly ? (
                  producto.name
                ) : (
                  <input
                    type="text"
                    className="input"
                    value={producto.name}
                    onChange={(e) =>
                      setProductos((prev) =>
                        prev.map((p) =>
                          p.producto_id === producto.producto_id ? { ...p, name: e.target.value } : p
                        )
                      )
                    }
                  />
                )}
              </td>
              <td>
                {isReadOnly ? (
                  `$${producto.price}`
                ) : (
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Precio"
                    className="input"
                    value={producto.price}
                    onChange={(e) =>
                      setProductos((prev) =>
                        prev.map((p) =>
                          p.producto_id === producto.producto_id ? { ...p, price: e.target.value } : p
                        )
                      )
                    }
                  />
                )}
              </td>
              <td>
                {producto.Ingredientes && producto.Ingredientes.length > 0 ? (
                  <ul style={{ margin: 0, paddingLeft: '1em' }}>
                    {producto.Ingredientes.map((ingrediente) => (
                      <li key={ingrediente.ingredient_id}>
                        {ingrediente.name}: <strong>{ingrediente.ProductoIngrediente.amount}</strong>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <em>Sin ingredientes</em>
                )}
              </td>
              {!isReadOnly && (
                <td className="table-actions">
                  <button className="edit" onClick={() => handleEditProducto(producto.producto_id)}>Editar</button>
                  <button className="delete" onClick={() => handleDeleteProducto(producto.producto_id)}>Eliminar</button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {!isReadOnly && (
        <div className="add-form">
          <h3>➕ Agregar Producto</h3>
          <input
            type="text"
            className="input"
            placeholder="Nombre"
            value={newProducto.name}
            onChange={(e) => setNewProducto({ ...newProducto, name: e.target.value })}
          />
          <input
            type="number"
            step="0.1"
            className="input"
            placeholder="Precio"
            value={newProducto.price}
            onChange={(e) => setNewProducto({ ...newProducto, price: e.target.value })}
          />

          <h4>Agregar Ingrediente</h4>
          <select
            className="input"
            value={ingredienteSeleccionado.ingredient_id}
            onChange={(e) =>
              setIngredienteSeleccionado({ ...ingredienteSeleccionado, ingredient_id: e.target.value })
            }
          >
            <option value="">Seleccione un ingrediente</option>
            {ingredientesDisponibles.map((ing) => (
              <option key={ing.ingredient_id} value={ing.ingredient_id}>
                {ing.name}
              </option>
            ))}
          </select>
          <input
            type="number"
            step="0.1"
            className="input"
            placeholder="Cantidad"
            value={ingredienteSeleccionado.amount}
            onChange={(e) =>
              setIngredienteSeleccionado({ ...ingredienteSeleccionado, amount: e.target.value })
            }
          />
          <button className="primary" onClick={handleAddIngredient}>Agregar Ingrediente</button>

          <button className="primary" onClick={handleAddProducto}>Guardar Producto</button>
        </div>
      )}
    </div>
  );
}

export default ProductosTable;
