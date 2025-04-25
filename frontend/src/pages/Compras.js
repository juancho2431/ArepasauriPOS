import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/Compras.css';

const Compras = () => {
  const [ingredientes, setIngredientes] = useState([]);
  const [bebidas, setBebidas] = useState([]);
  const [stockIngrediente, setStockIngrediente] = useState({ id: '', cantidad: '' });
  const [stockBebida, setStockBebida] = useState({ id: '', cantidad: '' });
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  const apiUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {
    obtenerIngredientes();
    obtenerBebidas();
  }, []);

  const obtenerIngredientes = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/ingredientes`);
      setIngredientes(response.data);
    } catch (error) {
      console.error('Error al obtener ingredientes:', error);
    }
  };

  const obtenerBebidas = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/bebidas`);
      setBebidas(response.data);
    } catch (error) {
      console.error('Error al obtener bebidas:', error);
    }
  };

  const mostrarMensaje = (msg, isError = false) => {
    if (isError) setError(msg);
    else setMensaje(msg);

    setTimeout(() => {
      setMensaje('');
      setError('');
    }, 3000);
  };

  const actualizarStockIngrediente = async () => {
    try {
      const { id, cantidad } = stockIngrediente;
      if (!id || !cantidad || parseFloat(cantidad) <= 0) {
        mostrarMensaje('Por favor selecciona un ingrediente y una cantidad válida.', true);
        return;
      }

      const ingrediente = ingredientes.find((ing) => ing.ingredient_id === parseInt(id));
      if (!ingrediente) return mostrarMensaje('Ingrediente no encontrado.', true);

      const nuevoStock = ingrediente.stock_current + parseFloat(cantidad);

      await axios.put(`${apiUrl}/api/ingredientes/${id}`, { stock_current: nuevoStock });
      mostrarMensaje(`Stock actualizado correctamente para ${ingrediente.name}.`);
      obtenerIngredientes();
      setStockIngrediente({ id: '', cantidad: '' });
    } catch (error) {
      console.error('Error al actualizar ingrediente:', error);
      mostrarMensaje('Error al actualizar el stock del ingrediente.', true);
    }
  };

  const actualizarStockBebida = async () => {
    try {
      const { id, cantidad } = stockBebida;
      if (!id || !cantidad || parseFloat(cantidad) <= 0) {
        mostrarMensaje('Por favor selecciona una bebida y una cantidad válida.', true);
        return;
      }

      const bebida = bebidas.find((b) => b.bebida_id === parseInt(id));
      if (!bebida) return mostrarMensaje('Bebida no encontrada.', true);

      const nuevoStock = bebida.stock + parseFloat(cantidad);

      await axios.put(`${apiUrl}/api/bebidas/${id}`, { stock: nuevoStock });
      mostrarMensaje(`Stock actualizado correctamente para ${bebida.name}.`);
      obtenerBebidas();
      setStockBebida({ id: '', cantidad: '' });
    } catch (error) {
      console.error('Error al actualizar bebida:', error);
      mostrarMensaje('Error al actualizar el stock de la bebida.', true);
    }
  };

  return (
    <div className="container compras-container">
      <h2>🛒 Gestión de Compras</h2>

      {mensaje && <p className="mensaje-exito">{mensaje}</p>}
      {error && <p className="mensaje-error">{error}</p>}

      <div className="card seccion-compras">
        <h3>Ingredientes</h3>
        <div className="formulario">
          <select
            value={stockIngrediente.id}
            onChange={(e) => setStockIngrediente({ ...stockIngrediente, id: e.target.value })}
          >
            <option value="">Selecciona un ingrediente</option>
            {ingredientes.map((ing) => (
              <option key={ing.ingredient_id} value={ing.ingredient_id}>
                {ing.name}
              </option>
            ))}
          </select>
          <input
            type="number"
            placeholder="Cantidad a añadir"
            value={stockIngrediente.cantidad}
            onChange={(e) =>
              setStockIngrediente({ ...stockIngrediente, cantidad: e.target.value })
            }
          />
          <button
            onClick={actualizarStockIngrediente}
            disabled={!stockIngrediente.id || !stockIngrediente.cantidad}
          >
            Actualizar Stock
          </button>
        </div>
      </div>

      <div className="card seccion-compras">
        <h3>Bebidas</h3>
        <div className="formulario">
          <select
            value={stockBebida.id}
            onChange={(e) => setStockBebida({ ...stockBebida, id: e.target.value })}
          >
            <option value="">Selecciona una bebida</option>
            {bebidas.map((beb) => (
              <option key={beb.bebida_id} value={beb.bebida_id}>
                {beb.name}
              </option>
            ))}
          </select>
          <input
            type="number"
            placeholder="Cantidad a añadir"
            value={stockBebida.cantidad}
            onChange={(e) =>
              setStockBebida({ ...stockBebida, cantidad: e.target.value })
            }
          />
          <button
            onClick={actualizarStockBebida}
            disabled={!stockBebida.id || !stockBebida.cantidad}
          >
            Actualizar Stock
          </button>
        </div>
      </div>
    </div>
  );
};

export default Compras;
