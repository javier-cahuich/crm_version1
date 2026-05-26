# Changelog Técnico y Detallado del CRM

Este documento contiene el historial técnico y granular de los cambios recientes aplicados en el repositorio, sirviendo como memoria arquitectónica para la defensa del proyecto.

## 1. Resumen: Merge de la Rama Clientes y Supabase
**Resolución de conflictos y Merge (`110625b`)**
- Se realizó exitosamente el merge de la rama `clientes` (`79e1e38`) hacia la rama actual (`Denzel-Actualizacion`).
- El merge combinó el rediseño completo de la interfaz de clientes con la integración oficial del cliente de **Supabase** (`@supabase/supabase-js`), solucionando discrepancias entre el estado local simulado y los datos reales.
- Se restauró y verificó la conexión de Supabase en todo el proyecto, utilizando el cliente exportado de manera uniforme.

## 2. Dashboard: Ajustes de Interfaz
**Archivo(s) Modificado(s):** `src/pages/Dashboard.tsx`  
**Tecnología/Librería:** React, Tailwind CSS

**Explicación del Código:**
Se modificó el contenedor principal de la tabla de "Pedidos activos". Anteriormente, la lógica forzaba un corte artificial (`.slice(0, 10)`) que limitaba la visualización. Se eliminó esta limitante y en su lugar se agregaron clases específicas de Tailwind para encapsular la tabla en un bloque con tamaño máximo y un *scroll* vertical interno, impidiendo así que se rompa el layout general del dashboard.

```tsx
// ANTES: Limitación en lógica y sin scroll
setPedidosActivos(
  activos.slice(0, 10).map((p) => ({ ... }))
);

<div className="overflow-x-auto">
  <table className="w-full text-sm"> {/* ... */} </table>
</div>

// DESPUÉS: Renderizado completo y scroll nativo en Y
setPedidosActivos(
  activos.map((p) => ({ ... }))
);

<div className="max-h-[300px] overflow-y-auto overflow-x-auto pr-1">
  <table className="w-full text-sm"> {/* ... */} </table>
</div>
```

## 3. Módulo Clientes y Proveedores: Importación y CRUD
**Archivo(s) Modificado(s):** `src/pages/Clientes.tsx`, `src/components/ui/ClientTypeahead.tsx`, `src/components/pedidos/CreateOrderPanel.tsx`  
**Tecnología/Librería:** React, Supabase Client, PapaParse (`papaparse`), SheetJS (`xlsx`)

**Explicación del Código:**
- **Importación Masiva (CSV / Excel):** Se incluyeron librerías para el procesamiento de archivos. Se creó el handler `handleImportFile` que lee la extensión del archivo y procesa las filas correspondientes en la función `processImportRows`. 
- Se implementó un `<input type="file" ref={fileInputRef} className="hidden" />` gatillado desde un botón personalizado. Además, se añadió un `<Dialog>` avanzado para mostrar el total de registros insertados, los omitidos y un bloque de errores.
- **Inserción en Lotes (Batches):** Para evitar saturar las peticiones POST, las inserciones a Supabase se empaquetan en arrays de 100 elementos a la vez:

```tsx
// Fragmento extraído de src/pages/Clientes.tsx (processImportRows)
let inserted = 0;
const BATCH = 100;
for (let i = 0; i < toInsert.length; i += BATCH) {
  const batch = toInsert.slice(i, i + BATCH);
  const { data, error: sbError } = await supabase
    .from("clientes")
    .insert(batch)
    .select("id, nombre, correo, numero, direccion, created_at");

  // ... manejo de data y errores
}
```

## 4. Arquitectura de Datos: Cálculo Dinámico de Aportación (JOIN Relacional)
**Archivo(s) Modificado(s):** `src/pages/Clientes.tsx`  
**Tecnología/Librería:** Supabase PostgREST, Array Methods (`reduce`)

**Explicación Arquitectónica:**
Para satisfacer el requerimiento de ordenar a los clientes por su "Aportación" económica sin alterar ni corromper el modelo relacional base (la tabla `clientes` no posee un campo estático de dinero), se recurrió a un cruce de tablas en tiempo de consulta. Utilizando la capacidad de *Foreign Key* de Supabase, se solicitó de manera paralela el arreglo anidado de pedidos (`pedidos(valor_pedido)`) asociados a cada cliente. Posteriormente, en el frontend se ejecutó una reducción matemática (`reduce`) en memoria para calcular e inyectar virtualmente el campo `aportacion` en la interfaz TypeScript `ClienteLocal`.

```tsx
// Consulta Relacional
const { data, error: sbError } = await supabase
  .from("clientes")
  .select("id, nombre, correo, numero, direccion, created_at, pedidos(valor_pedido)")
  .order("created_at", { ascending: false });

if (!sbError) {
  // Cálculo Dinámico en Memoria (Frontend)
  const mapped = (data || []).map((c: any) => {
    const pedidos = c.pedidos || [];
    const aportacion = pedidos.reduce((acc: number, p: any) => acc + (p.valor_pedido || 0), 0);
    
    return {
      id: c.id,
      nombre: c.nombre,
      // ...
      aportacion, // Campo calculado insertado en tiempo real
    } as ClienteLocal;
  });
  setClientes(mapped);
}
```

## 5. Control de Interfaz: Paginación de Registros
**Archivo(s) Modificado(s):** `src/pages/Clientes.tsx`  
**Tecnología/Librería:** React (`useState`)

**Explicación del Código:**
Para optimizar el DOM en listas masivas, se implementó una paginación que limita la vista a 20 registros. Se definieron las variables de estado `currentPage` y una constante limitante `ITEMS_PER_PAGE`. La matriz de clientes ordenados (`sorted`) se fragmenta a través del método `.slice()` utilizando matemáticas basadas en el índice de página activa. Se añadieron manipuladores de estado acotados usando `Math.max()` y `Math.min()` para prevenir desbordamientos en la UI.

```tsx
// Lógica de fragmentación
const ITEMS_PER_PAGE = 20;
const totalPages = Math.ceil(sorted.length / ITEMS_PER_PAGE) || 1;

const paginated = sorted.slice(
  (currentPage - 1) * ITEMS_PER_PAGE,
  currentPage * ITEMS_PER_PAGE
);

// Controles de Paginación en UI
<Button
  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
  disabled={currentPage === 1}
>
  Anterior
</Button>
<Button
  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
  disabled={currentPage === totalPages}
>
  Siguiente
</Button>
```

## 6. Herramientas de Interacción: Filtros y Ordenamiento Dinámico
**Archivo(s) Modificado(s):** `src/pages/Clientes.tsx`  
**Tecnología/Librería:** `@radix-ui/react-dropdown-menu`, React

**Explicación del Código:**
Se integró el componente compuesto `<DropdownMenu>` para agrupar los criterios de ordenamiento sin sobrecargar la cabecera visualmente. El sistema escucha los estados `sortBy` y `sortOrder`, inyectando la matriz `filtered` dentro de una función nativa de JavaScript `.sort()`. Para valores literales ("nombre"), usa `localeCompare`, para métricas de tiempo evalúa la instancia de `Date().getTime()`, y para la Aportación, efectúa una resta directa.

```tsx
// Componente de Selección UI
<DropdownMenuRadioGroup value={sortBy} onValueChange={(val: any) => setSortBy(val)}>
  <DropdownMenuRadioItem value="nombre">Alfabético</DropdownMenuRadioItem>
  <DropdownMenuRadioItem value="aportacion">Aportación</DropdownMenuRadioItem>
  <DropdownMenuRadioItem value="created_at">Fecha de alta</DropdownMenuRadioItem>
</DropdownMenuRadioGroup>

// Lógica de Ordenamiento Multicriterio
const sorted = [...filtered].sort((a, b) => {
  let cmp = 0;
  if (sortBy === "nombre") {
    cmp = a.nombre.localeCompare(b.nombre);
  } else if (sortBy === "created_at") {
    const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
    const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
    cmp = timeA - timeB;
  } else if (sortBy === "aportacion") {
    cmp = a.aportacion - b.aportacion;
  }
  return sortOrder === "asc" ? cmp : -cmp;
});
```

## 7. Global: Supabase Storage para Adjuntos
**Archivo(s) Modificado(s):** `src/pages/Pedidos.tsx`, `src/data/mockData.ts` (tipos)  
**Tecnología/Librería:** Typescript, Supabase Storage

**Explicación del Código:**
A nivel global, la estructura de la base de datos y de la aplicación se ha ajustado para persistir imágenes conectadas a Supabase Storage. Al mapear una fila de base de datos en un objeto local que usa la aplicación (por ejemplo en el sistema Kanban), se extrae explícitamente el registro de la URL de adjunto `url_adjunto` desde el objeto original `PedidoDB`.

```tsx
// Archivo: src/pages/Pedidos.tsx
// Función: pedidoToCard
function pedidoToCard(row: PedidoDB): KanbanCard {
  return {
    id: row.id,
    nombre_pedido: row.nombre_pedido,
    etapa_pedido: row.etapa_pedido ?? "en_cola",
    // ...otros mapeos
    clienteId: row.cliente_id ?? undefined,
    clienteCorreo: row.clientes?.correo ?? undefined,
    clienteNumero: row.clientes?.numero ?? undefined,
    url_adjunto: row.url_adjunto ?? undefined, // <-- Nueva integración para soporte de Storage
  };
}
```

---
> ### ⚠️ Restricciones de Diseño
> Al realizar futuras modificaciones en la interfaz de usuario, es de carácter obligatorio acatar las siguientes reglas:
> * **Mantener los colores sólidos originales** del diseño existente.
> * **NO utilizar efectos de desenfoque** (*blur* / *glassmorphism*) en los componentes.
> * **NO cambiar tipografías** (utilizar las familias de fuentes ya establecidas).
> * **NO agregar fotos de perfil** a los componentes de usuarios o clientes.
