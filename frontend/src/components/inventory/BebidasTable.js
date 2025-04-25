import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../styles/Inventario.css'; // Asegúrate de tener un CSS apropiado

function BebidasTable({ isReadOnly }) {
  const [bebidas, setBebidas] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [newBebida, setNewBebida] = useState({
    name: '',
    stock: '',
    price: ''
  });
  const [error, setError] = useState('');

  const apiUrl = process.env.REACT_APP_API_URL;
  const soloLetras = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]*$/;

  useEffect(() => {
    fetchBebidas();
  }, []);

  const fetchBebidas = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/bebidas`);
      setBebidas(response.data);
    } catch (error) {
      console.error('Error al obtener las bebidas:', error);
    }
  };

  const handleAddBebida = async () => {
    if (!soloLetras.test(newBebida.name)) {
      setError('El nombre solo debe contener letras.');
      return;
    }

    try {
      const bebidaToSend = {
        name: newBebida.name,
        stock: parseInt(newBebida.stock),
        price: parseFloat(newBebida.price)
      };

      await axios.post(`${apiUrl}/api/bebidas`, bebidaToSend);
      fetchBebidas();
      setNewBebida({ name: '', stock: '', price: '' });
      setError('');
    } catch (error) {
      console.error('Error al agregar la bebida:', error);
    }
  };

  const handleEditBebida = async (id) => {
    try {
      const updatedBebida = bebidas.find((b) => b.bebida_id === id);
      await axios.put(`${apiUrl}/api/bebidas/${id}`, updatedBebida);
      fetchBebidas();
    } catch (error) {
      console.error('Error al editar la bebida:', error);
    }
  };

  const handleDeleteBebida = async (id) => {
    try {
      await axios.delete(`${apiUrl}/api/bebidas/${id}`);
      fetchBebidas();
    } catch (error) {
      console.error('Error al eliminar la bebida:', error);
    }
  };

  const bebidasFiltradas = bebidas.filter((b) =>
    b.name?.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    <div className="container">
      <h2>🥤 Gestión de Bebidas</h2>

      {error && <p className="error">{error}</p>}

      <input
        type="text"
        className="input"
        placeholder="Buscar bebida..."
        value={filtro}
        onChange={(e) => setFiltro(e.target.value)}
      />

      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Stock</th>
            <th>Precio</th>
            {!isReadOnly && <th>Acciones</th>}
          </tr>
        </thead>
        <tbody>
          {bebidasFiltradas.map((bebida) => (
            <tr key={bebida.bebida_id}>
              <td>{bebida.bebida_id}</td>
              <td>
                {isReadOnly ? (
                  bebida.name
                ) : (
                  <input
                    type="text"
                    className="input"
                    value={bebida.name}
                    onChange={(e) =>
                      soloLetras.test(e.target.value) &&
                      setBebidas((prev) =>
                        prev.map((b) =>
                          b.bebida_id === bebida.bebida_id ? { ...b, name: e.target.value } : b
                        )
                      )
                    }
                  />
                )}
              </td>
              <td>
                {isReadOnly ? (
                  bebida.stock
                ) : (
                  <input
                    type="number"
                    placeholder="Stock"
                    className="input"
                    value={bebida.stock}
                    onChange={(e) =>
                      setBebidas((prev) =>
                        prev.map((b) =>
                          b.bebida_id === bebida.bebida_id ? { ...b, stock: e.target.value } : b
                        )
                      )
                    }
                  />
                )}
              </td>
              <td>
                {isReadOnly ? (
                  `$${bebida.price}`
                ) : (
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Precio"
                    className="input"
                    value={bebida.price}
                    onChange={(e) =>
                      setBebidas((prev) =>
                        prev.map((b) =>
                          b.bebida_id === bebida.bebida_id ? { ...b, price: e.target.value } : b
                        )
                      )
                    }
                  />
                )}
              </td>
              {!isReadOnly && (
                <td className="table-actions">
                  <button className="edit" onClick={() => handleEditBebida(bebida.bebida_id)}>Editar</button>
                  <button className="delete" onClick={() => handleDeleteBebida(bebida.bebida_id)}>Eliminar</button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {!isReadOnly && (
        <div className="add-form">
          <h3>➕ Agregar Bebida</h3>
          <input
            type="text"
            className="input"
            placeholder="Nombre"
            value={newBebida.name}
            onChange={(e) => {
              if (soloLetras.test(e.target.value)) {
                setNewBebida({ ...newBebida, name: e.target.value });
              }
            }}
          />
          <input
            type="number"
            className="input"
            placeholder="Stock"
            value={newBebida.stock}
            onChange={(e) => setNewBebida({ ...newBebida, stock: e.target.value })}
          />
          <input
            type="number"
            step="0.1"
            className="input"
            placeholder="Precio"
            value={newBebida.price}
            onChange={(e) => setNewBebida({ ...newBebida, price: e.target.value })}
          />
          <button className="primary" onClick={handleAddBebida}>Agregar Bebida</button>
        </div>
      )}
    </div>
  );
}

export default BebidasTable;
