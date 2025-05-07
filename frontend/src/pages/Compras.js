// src/components/Compras.js

import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import axios from 'axios';
import '../styles/Compras.css';

const Compras = () => {
  // Estados para datos
  const [ingredientes, setIngredientes] = useState([]);
  const [bebidas, setBebidas] = useState([]);

  // Estados para selección y cantidad
  const [stockIngrediente, setStockIngrediente] = useState({ id: null, cantidad: '' });
  const [stockBebida, setStockBebida] = useState({ id: null, cantidad: '' });

  // Mensajes de éxito / error
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  const apiUrl = process.env.REACT_APP_API_URL;

  // Al montar, carga ingredientes y bebidas
  useEffect(() => {
    obtenerIngredientes();
    obtenerBebidas();
  }, []);

  const obtenerIngredientes = async () => {
    try {
      const { data } = await axios.get(`${apiUrl}/api/ingredientes`);
      setIngredientes(data);
    } catch (err) {
      console.error('Error al obtener ingredientes:', err);
      setError('No se pudieron cargar los ingredientes.');
    }
  };

  const obtenerBebidas = async () => {
    try {
      const { data } = await axios.get(`${apiUrl}/api/bebidas`);
      setBebidas(data);
    } catch (err) {
      console.error('Error al obtener bebidas:', err);
      setError('No se pudieron cargar las bebidas.');
    }
  };

  const mostrarMensaje = (msg, isError = false) => {
    if (isError) {
      setError(msg);
    } else {
      setMensaje(msg);
    }
    setTimeout(() => {
      setMensaje('');
      setError('');
    }, 3000);
  };

  const actualizarStockIngrediente = async () => {
    try {
      const { id, cantidad } = stockIngrediente;
      if (!id || !cantidad || parseFloat(cantidad) <= 0) {
        return mostrarMensaje('Selecciona un ingrediente y cantidad válidos.', true);
      }
      const ing = ingredientes.find(i => i.ingredient_id === id);
      const nuevoStock = ing.stock_current + parseFloat(cantidad);
      await axios.put(`${apiUrl}/api/ingredientes/${id}`, { stock_current: nuevoStock });
      mostrarMensaje(`Stock de "${ing.name}" actualizado.`);
      obtenerIngredientes();
      setStockIngrediente({ id: null, cantidad: '' });
    } catch (err) {
      console.error(err);
      mostrarMensaje('Error actualizando stock de ingrediente.', true);
    }
  };

  const actualizarStockBebida = async () => {
    try {
      const { id, cantidad } = stockBebida;
      if (!id || !cantidad || parseFloat(cantidad) <= 0) {
        return mostrarMensaje('Selecciona una bebida y cantidad válidos.', true);
      }
      const beb = bebidas.find(b => b.bebida_id === id);
      const nuevoStock = beb.stock + parseFloat(cantidad);
      await axios.put(`${apiUrl}/api/bebidas/${id}`, { stock: nuevoStock });
      mostrarMensaje(`Stock de "${beb.name}" actualizado.`);
      obtenerBebidas();
      setStockBebida({ id: null, cantidad: '' });
    } catch (err) {
      console.error(err);
      mostrarMensaje('Error actualizando stock de bebida.', true);
    }
  };

  // Construye las opciones para react-select
  const opcionesIngredientes = ingredientes.map(ing => ({
    value: ing.ingredient_id,
    label: ing.name
  }));
  const opcionesBebidas = bebidas.map(beb => ({
    value: beb.bebida_id,
    label: beb.name
  }));

  return (
    <div className="container compras-container">
      <h2>🛒 Gestión de Compras</h2>
      {mensaje && <p className="mensaje-exito">{mensaje}</p>}
      {error && <p className="mensaje-error">{error}</p>}

      {/* SECCIÓN INGREDIENTES */}
      <div className="card seccion-compras">
        <h3>Ingredientes</h3>
        <div className="formulario">
          <Select
            options={opcionesIngredientes}
            placeholder="Selecciona un ingrediente..."
            isSearchable
            value={opcionesIngredientes.find(o => o.value === stockIngrediente.id) || null}
            onChange={opt =>
              setStockIngrediente({ ...stockIngrediente, id: opt ? opt.value : null })
            }
            className="react-select-container"
            classNamePrefix="react-select"
          />
          <input
            type="number"
            placeholder="Cantidad a añadir"
            value={stockIngrediente.cantidad}
            onChange={e =>
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

      {/* SECCIÓN BEBIDAS */}
      <div className="card seccion-compras">
        <h3>Bebidas</h3>
        <div className="formulario">
          <Select
            options={opcionesBebidas}
            placeholder="Selecciona una bebida..."
            isSearchable
            value={opcionesBebidas.find(o => o.value === stockBebida.id) || null}
            onChange={opt =>
              setStockBebida({ ...stockBebida, id: opt ? opt.value : null })
            }
            className="react-select-container"
            classNamePrefix="react-select"
          />
          <input
            type="number"
            placeholder="Cantidad a añadir"
            value={stockBebida.cantidad}
            onChange={e =>
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
