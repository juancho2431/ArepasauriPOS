import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../styles/Inventario.css'; // Asegúrate de tener un CSS apropiado

function IngredientesTable({ isReadOnly }) {
  const [ingredientes, setIngredientes] = useState([]);
  const [newIngrediente, setNewIngrediente] = useState({
    name: '',
    stock_current: "",
    stock_minimum: ""
  });
  const [filtro, setFiltro] = useState('');
  const [error, setError] = useState('');

  const apiUrl = process.env.REACT_APP_API_URL;
  const soloLetras = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]*$/;

  useEffect(() => {
    fetchIngredientes();
  }, []);

  const fetchIngredientes = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/ingredientes`);
      setIngredientes(response.data);
    } catch (error) {
      console.error('Error al obtener los ingredientes:', error);
    }
  };

  const handleAddIngrediente = async () => {
    if (!soloLetras.test(newIngrediente.name)) {
      setError('El nombre solo debe contener letras.');
      return;
    }

    try {
      const ingredienteData = {
        ingredientes: [newIngrediente]
      };
      await axios.post(`${apiUrl}/api/ingredientes`, ingredienteData);
      fetchIngredientes();
      setNewIngrediente({ name: '', stock_current: 0, stock_minimum: 0 });
      setError('');
    } catch (error) {
      if (error.response) {
        console.error('Error al agregar el ingrediente:', error.response.data);
      } else if (error.request) {
        console.error('No se recibió respuesta del servidor:', error.request);
      } else {
        console.error('Error al configurar la solicitud:', error.message);
      }
    }
  };

  const handleEditIngrediente = async (id) => {
    try {
      const updatedIngrediente = ingredientes.find((i) => i.ingredient_id === id);
      await axios.put(`${apiUrl}/api/ingredientes/${id}`, updatedIngrediente);
      fetchIngredientes();
    } catch (error) {
      console.error('Error al editar el ingrediente:', error);
    }
  };

  const handleDeleteIngrediente = async (id) => {
    try {
      await axios.delete(`${apiUrl}/api/ingredientes/${id}`);
      fetchIngredientes();
    } catch (error) {
      console.error('Error al eliminar el ingrediente:', error);
    }
  };

  const ingredientesFiltrados = ingredientes.filter((i) =>
    i.name?.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    <div className="container">
      <h2>🧂 Gestión de Ingredientes</h2>

      {error && <p className="error">{error}</p>}

      <input
        type="text"
        placeholder="Buscar ingrediente..."
        className="input"
        value={filtro}
        onChange={(e) => setFiltro(e.target.value)}
      />

      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Stock Actual</th>
            <th>Stock Mínimo</th>
            {!isReadOnly && <th>Acciones</th>}
          </tr>
        </thead>
        <tbody>
          {ingredientesFiltrados.map((ingrediente) => (
            <tr key={ingrediente.ingredient_id}>
              <td>{ingrediente.ingredient_id}</td>
              <td>
                {isReadOnly ? (
                  ingrediente.name
                ) : (
                  <input
                    type="text"
                    value={ingrediente.name}
                    onChange={(e) =>
                      soloLetras.test(e.target.value) &&
                      setIngredientes((prev) =>
                        prev.map((i) =>
                          i.ingredient_id === ingrediente.ingredient_id
                            ? { ...i, name: e.target.value }
                            : i
                        )
                      )
                    }
                  />
                )}
              </td>
              <td>
                {isReadOnly ? (
                  ingrediente.stock_current
                ) : (
                  <input
                    type="number"
                    value={ingrediente.stock_current}
                    onChange={(e) =>
                      setIngredientes((prev) =>
                        prev.map((i) =>
                          i.ingredient_id === ingrediente.ingredient_id
                            ? { ...i, stock_current: Number(e.target.value) }
                            : i
                        )
                      )
                    }
                  />
                )}
              </td>
              <td>
                {isReadOnly ? (
                  ingrediente.stock_minimum
                ) : (
                  <input
                    type="number"
                    value={ingrediente.stock_minimum}
                    onChange={(e) =>
                      setIngredientes((prev) =>
                        prev.map((i) =>
                          i.ingredient_id === ingrediente.ingredient_id
                            ? { ...i, stock_minimum: Number(e.target.value) }
                            : i
                        )
                      )
                    }
                  />
                )}
              </td>
              {!isReadOnly && (
                <td className="table-actions">
                  <button className="edit" onClick={() => handleEditIngrediente(ingrediente.ingredient_id)}>
                    Editar
                  </button>
                  <button className="delete" onClick={() => handleDeleteIngrediente(ingrediente.ingredient_id)}>
                    Eliminar
                  </button>
                </td>
              )}
            </tr>
          ))}
          {ingredientesFiltrados.length === 0 && (
            <tr>
              <td colSpan="5" className="sin-resultados">No se encontraron ingredientes.</td>
            </tr>
          )}
        </tbody>
      </table>

      {!isReadOnly && (
        <div className="add-form">
          <h3>➕ Agregar Ingrediente</h3>
          <input
            type="text"
            placeholder="Nombre"
            value={newIngrediente.name}
            onChange={(e) => {
              if (soloLetras.test(e.target.value)) {
                setNewIngrediente({ ...newIngrediente, name: e.target.value });
              }
            }}
          />
          <input
            type="number"
            placeholder="Stock Actual"
            value={newIngrediente.stock_current}
            onChange={(e) => setNewIngrediente({ ...newIngrediente, stock_current: Number(e.target.value) })}
          />
          <input
            type="number"
            placeholder="Stock Mínimo"
            value={newIngrediente.stock_minimum}
            onChange={(e) => setNewIngrediente({ ...newIngrediente, stock_minimum: Number(e.target.value) })}
          />
          <button className="primary" onClick={handleAddIngrediente}>Agregar</button>
        </div>
      )}
    </div>
  );
}

export default IngredientesTable;
