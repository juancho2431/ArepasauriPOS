import React, { useState } from 'react';
import IngredientesTable from '../components/inventory/IngredientesTable';
import ArepasTable from '../components/inventory/ProductosTable';
import BebidasTable from '../components/inventory/BebidasTable';
import '../styles/Inventario.css';

function InventarioPage({ userRole }) {
  const isReadOnly = userRole === 'Cajero' || userRole === 'Mesero' || userRole === 'Empleado';
  const [vistaActiva, setVistaActiva] = useState('ingredientes'); // 👈 inicial

  return (
    <div className="container">
      <h1>📦 Inventario</h1>

      {/* Selector de vista */}
      <div className="tabs">
        <button
          className={vistaActiva === 'ingredientes' ? 'tab active' : 'tab'}
          onClick={() => setVistaActiva('ingredientes')}
        >
          Ingredientes
        </button>
        <button
          className={vistaActiva === 'productos' ? 'tab active' : 'tab'}
          onClick={() => setVistaActiva('productos')}
        >
          Productos
        </button>
        <button
          className={vistaActiva === 'bebidas' ? 'tab active' : 'tab'}
          onClick={() => setVistaActiva('bebidas')}
        >
          Bebidas
        </button>
      </div>

      {/* Contenido dinámico */}
      <div className="contenido">
        {vistaActiva === 'ingredientes' && <IngredientesTable isReadOnly={isReadOnly} />}
        {vistaActiva === 'productos' && <ArepasTable isReadOnly={isReadOnly} />}
        {vistaActiva === 'bebidas' && <BebidasTable isReadOnly={isReadOnly} />}
      </div>
    </div>
  );
}

export default InventarioPage;
