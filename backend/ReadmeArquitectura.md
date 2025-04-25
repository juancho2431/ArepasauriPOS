# Arepasaurios: Sistema POS y de Gestión para Restaurantes

## Descripción del Proyecto

El proyecto "Arepasaurios" aborda la necesidad de digitalización y gestión eficiente en el sector de la restauración, específicamente para pequeñas y medianas empresas (PYMEs) como restaurantes, cafeterías y negocios de comida. Muchos de estos negocios aún dependen de procesos manuales (hojas de cálculo, papel) para tareas críticas como:

*   **Control de Inventario:**  Dificultando la planificación de compras, detección de pérdidas y optimización de costos.
*   **Gestión de Ventas:**  Registro manual propenso a errores, dificultando el seguimiento del rendimiento y la generación de informes.
*   **Facturación:**  Emisión manual de facturas, consumiendo tiempo y generando errores.
*   **Gestión de Pedidos:**  Toma y procesamiento manual de pedidos, ineficiente y propenso a confusiones.
*   **Gestión de Empleados:** Asignación de roles y permisos de manera poco efectiva.

Estos procesos manuales consumen tiempo, aumentan el riesgo de errores, dificultan la toma de decisiones y limitan el crecimiento. Las soluciones de software existentes suelen ser complejas, caras o no se adaptan a las PYMEs de restauración.

## Propósito del Proyecto (Solución)

"Arepasaurios" es un sistema POS (Point of Sale) y de gestión integral diseñado para restaurantes y negocios similares. El objetivo es proporcionar una plataforma web centralizada, accesible y fácil de usar que permita:

*   **Digitalizar y Automatizar:** Reemplazar procesos manuales por un sistema digital, automatizando tareas y reduciendo errores.
*   **Gestionar el Inventario Eficientemente:** Control preciso de ingredientes y productos, con alertas de stock bajo y seguimiento de compras.
*   **Procesar Ventas y Pedidos Rápidamente:** Registro ágil de ventas, con opciones de pago integradas (potencialmente).
*   **Emitir Facturas Electrónicas:** Generación automática de facturas (potencialmente).
*   **Gestionar Empleados y Roles:** Asignar roles y permisos, controlar el acceso y registrar acciones de usuarios.
*   **Obtener Informes Detallados:** Generar reportes de ventas, inventario y rendimiento para tomar decisiones basadas en datos.
* **Gestión de clientes (Clientes):** *Potencialmente*, permitir a los clientes registrarse para hacer pedidos online (se requiere un modelo `Cliente` separado, no implementado en el código base actual).
*   **Multi-Restaurante (Visión a Futuro):** La plataforma está concebida para que, en el futuro, cada restaurante pueda registrarse de forma independiente.

## Público Objetivo

El sistema está dirigido a PYMEs del sector de la restauración:

*   Restaurantes
*   Cafeterías
*   Bares de tapas
*   Negocios de comida para llevar
*   Food trucks

Roles dentro del negocio:

*   **Propietarios/Gerentes:** Visión global del negocio, control de costos, análisis de ventas y toma de decisiones estratégicas.
*   **Administradores:** Control y visualización completa de la información del sistema.
*   **Cajeros/Camareros:** Registro rápido y sencillo de ventas y pedidos.
*   **Cocineros:** Recepción de pedidos en tiempo real y gestión de la preparación.
* **Clientes:** *(Futuro)* Para registrarse en la plataforma y realizar pedidos (requiere desarrollo adicional).

## Tecnologías

*   **Backend:** Node.js
*   **Base de Datos:** PostgreSQL
*   **ORM:** Sequelize
*   **Frontend:** (No especificado en el código, pero se asume Node.js)

## Lógica del Proyecto

La lógica central se basa en la interacción entre los **modelos** de Sequelize (estructura de la base de datos) y las **rutas** de la API (cómo interactuar con los datos).

### Modelos

| Modelo             | Descripción                                                                                                                                                                                               | Campos Clave                                                                                                                                   |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `Empleado`         | Representa un usuario del sistema (empleado) con permisos.  Esencial para la autenticación y autorización.                                                                                             | `usuario`, `contraseña` (hasheada), `rol` (fundamental para control de acceso), `nombre`, `apellido`, `telefono`, `email` , `direccion`.        |
| `Ingrediente`     | Representa una materia prima.  Esencial para el control de inventario.                                                                                                                                  | `name`, `stock_current` (cantidad actual), `stock_minimum` (nivel mínimo deseado).                                                              |
| `Arepa`           | Representa un producto final (una arepa). La relación muchos a muchos con `Ingrediente` (a través de `ArepaIngrediente`) define su receta.                                                                  | `name`, `price`.                                                                                                                             |
| `Bebida`          | Representa otro tipo de producto final (bebida).  Se separa de `Arepa` porque no tiene ingredientes (en este modelo simplificado).                                                                             | `name`, `price`, `stock`.                                                                                                                       |
| `Ventas`           | El registro *maestro* de cada venta.  Guarda información general. La relación con `Empleado` indica quién realizó la venta.                                                                                    | `fecha`, `total`, `metodo_pago`, `cliente` (opcional), `vendedor_id` (FK a `Empleado`).                                                             |
| `VentaDetalle`    | El registro *detalle* de cada venta.  Guarda *qué* se vendió, *cuánto* y a *qué precio*.  Usa `producto_id` y `tipo_producto` para referenciar a `Arepa` o `Bebida`.                                             | `venta_id` (FK a `Ventas`), `producto_id`, `tipo_producto` ('arepa' o 'bebida'), `cantidad`, `precio`.                                          |
| `ArepaIngrediente` | Tabla intermedia (relación muchos a muchos entre `Arepa` e `Ingrediente`). Define la receta de cada arepa.  El campo `amount` indica la cantidad de cada ingrediente por arepa.                               | `arepa_id` (FK a `Arepa`), `ingrediente_id` (FK a `Ingrediente`), `amount` (cantidad del ingrediente).                                     |

### Flujo Principal (Creación de una Venta)

1.  **Frontend:** El usuario (empleado) selecciona arepas/bebidas y las añade a un "carrito" (gestionado en el frontend).
2.  **Petición al Backend:** El frontend envía una petición `POST /api/ventas` con:
    *   `vendedor_id` (ID del empleado).
    *   `detalles`:  Un array de objetos, cada uno con `producto_id`, `tipo_producto`, `cantidad` y `precio`.
3.  **Backend (Dentro de una Transacción):**
    *   Se crea un registro en `Ventas`.
    *   Por cada `detalle` en el array:
        *   Se crea un registro en `VentaDetalle`.
        *   **Actualización de Stock:**
            *   Si `tipo_producto` es 'arepa': Se busca la arepa, se obtienen sus ingredientes (a través de `ArepaIngrediente`), y se *reduce* el `stock_current` de *cada ingrediente* en la cantidad correspondiente.
            *   Si `tipo_producto` es 'bebida': Se *reduce* el `stock` de la bebida.
        *   Se calcula y guarda el `total` de la venta (suma de los subtotales de cada detalle).
    *   Si todo es correcto: *commit* de la transacción. Si hay un error (ej: stock insuficiente): *rollback* de la transacción.

### Otros Flujos Importantes

*   **Gestión de Inventario:**  Crear, actualizar, eliminar ingredientes y actualizar su stock.
*   **Gestión de Productos:** Crear, actualizar, eliminar arepas y bebidas, y asociar ingredientes a las arepas.
*   **Gestión de Empleados:** Crear, actualizar, eliminar empleados (con *hashing* de contraseñas).
*   **Login:** Autenticar a un empleado (verificar credenciales).
*   **Reportes:** Obtener datos agregados (ej: ventas totales, ventas por período, etc.).

## Rutas (API)

### `/api/arepas`

| Método | Ruta       | Descripción                                                                                                                      |
| ------ | ---------- | -------------------------------------------------------------------------------------------------------------------------------- |
| GET    | `/`        | Obtiene *todas* las arepas, incluyendo sus ingredientes y la cantidad de cada uno.                                                 |
| GET    | `/:id`     | Obtiene una arepa *específica*, incluyendo sus ingredientes.                                                                     |
| POST   | `/`        | *Crea* una nueva arepa, definiendo su nombre, precio y, *opcionalmente*, sus ingredientes (creando registros en `ArepaIngrediente`). |
| PUT    | `/:id`     | *Actualiza* una arepa existente (nombre, precio y/o ingredientes).                                                                |
| DELETE | `/:id`     | *Elimina* una arepa y sus asociaciones con ingredientes.                                                                         |

### `/api/ingredientes`

| Método | Ruta       | Descripción                                                                              |
| ------ | ---------- | ---------------------------------------------------------------------------------------- |
| GET    | `/`        | Obtiene *todos* los ingredientes.                                                         |
| GET    | `/:id`     | Obtiene un ingrediente específico.                                                        |
| POST   | `/`        | *Crea* uno o varios nuevos ingredientes.                                                 |
| PUT    | `/:id`     | *Actualiza* un ingrediente (nombre, `stock_current`, `stock_minimum`).                    |
| DELETE | `/:id`     | *Elimina* un ingrediente.                                                                |

### `/api/bebidas`

| Método | Ruta       | Descripción                                                                 |
| ------ | ---------- | --------------------------------------------------------------------------- |
| GET    | `/`        | Obtiene todas las bebidas.                                                   |
| GET    | `/:id`     | Obtiene una bebida específica.                                               |
| POST   | `/`        | Crea una nueva bebida.                                                      |
| PUT    | `/:id`     | Actualiza una bebida (nombre, precio, stock).                                |
| DELETE | `/:id`     | Elimina una bebida.                                                        |

### `/api/empleados`
| Método | Ruta       | Descripción                                                                 |
| ------ | ---------- | --------------------------------------------------------------------------- |
| GET    | `/`        | Obtiene todos los Empleados.                                                   |
| POST   | `/`        | Crea un nuevo Empleado.                                                      |
| DELETE | `/:id`     | Elimina un Empleado.                                                        |

### `/api/login`

| Método | Ruta | Descripción                                                                                                                |
| ------ | ---- | -------------------------------------------------------------------------------------------------------------------------- |
| POST   | `/`  | Autentica a un empleado.  Recibe `usuario` y `contraseña`.  **Importante:** *Debe ser actualizado para usar hashing y JWT.* |

### `/api/ventas`

| Método | Ruta        | Descripción                                                                                                                                                                                                                          |
| ------ | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| GET    | `/`         | Obtiene *todas* las ventas, incluyendo los detalles de cada venta (productos y vendedor).                                                                                                                                              |
| GET    | `/:ventaId` | Obtiene una venta *específica* por ID, con todos sus detalles.                                                                                                                                                                       |
| POST   | `/`         | *Crea* una nueva venta (la ruta más compleja).  Dentro de una transacción, crea la venta, los detalles de venta y *actualiza el stock* de ingredientes y/o bebidas.  **Garantiza la atomicidad de la operación.** |
| DELETE | `/:ventaId` | Elimina una venta.                                                                                                                                                                                                               |

###  /api/reportes

| Método | Ruta                    | Descripción                                                                 |
| ------ | ----------------------- | --------------------------------------------------------------------------- |
| GET    | `/ventas/reportes`      | Obtiene las ventas filtradas por fecha                                    |

## Mejoras y Consideraciones Cruciales

*   **Seguridad:**
    *   **Hashing de Contraseñas (¡Obligatorio!):**  Usar `bcryptjs` (u otra biblioteca similar) para hashear las contraseñas *antes* de guardarlas.
    *   **Autenticación con JWT (¡Obligatorio!):** Implementar JWT para una API RESTful segura.
    *   **Validación de Datos (¡Obligatorio!):** Validar *todos* los datos de entrada en *todas* las rutas, tanto en el frontend como en el backend.
    *   **Autorización (Control de Acceso):** Implementar la autorización basada en roles (usando el middleware `authorize.js` proporcionado como base).
    *   **Protección contra Inyección SQL:** Asegurarse de usar los métodos de Sequelize correctamente para evitar inyecciones SQL.
    *   **HTTPS (¡Obligatorio en producción!):** Usar HTTPS para proteger la comunicación.

*   **Modelo `Cliente`:**  Si se va a permitir el registro de clientes, crear un modelo `Cliente` *separado* de `Empleado`.

*   **Manejo de Errores:** Usar un middleware de manejo de errores centralizado para respuestas de error consistentes.

*   **Relación Polimórfica en `VentaDetalle`:**  Considerar alternativas (tablas separadas o campos separados) si la complejidad de la relación polimórfica actual se vuelve un problema.

*   **Stock Negativo:** *Impedir* que el stock se vuelva negativo; devolver un error 400 si no hay suficiente stock.

*   **Testeo (¡Fundamental!):**  Escribir tests unitarios y de integración para el backend.

*   **Documentación de la API:**  Generar documentación de la API (ej: con Swagger/OpenAPI).

* **Actualizacion de stock de Arepas**: El stock de las Arepas se actualiza.
