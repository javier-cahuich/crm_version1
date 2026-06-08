# ProyecsionCRM

Sistema de gestión de relaciones con clientes (CRM) orientado a talleres y negocios de servicio. Permite administrar clientes y proveedores, visualizar el embudo de ventas en un tablero Kanban, registrar pedidos y consultar reportes analíticos, todo desde una interfaz web moderna con autenticación y persistencia en la nube.

---

## Descripción general

**ProyecsionCRM** centraliza las operaciones comerciales y operativas de un taller: contactos, oportunidades de venta, pedidos activos y métricas de desempeño. La aplicación es una SPA (Single Page Application) que consume datos en tiempo real desde **Supabase** (PostgreSQL + Auth + API REST).

### Módulos principales

| Módulo | Ruta | Función |
|--------|------|---------|
| **Dashboard** | `/` | Resumen ejecutivo: indicadores, pedidos activos y vista general del negocio. |
| **Clientes** | `/clientes` | CRUD de clientes, importación masiva (CSV/Excel) y cálculo de aportación por pedidos. |
| **Proveedores** | `/proveedores` | Gestión de proveedores y contactos asociados. |
| **Pipeline** | `/pipeline` | Tablero Kanban de tratos/oportunidades con arrastrar y soltar. |
| **Pedidos** | `/pedidos` | Creación, seguimiento y detalle de pedidos vinculados a clientes. |
| **Reportes** | `/reportes` | Gráficas y análisis de datos del negocio. |

Las rutas protegidas requieren sesión activa en Supabase; la pantalla de acceso está en `/auth`.

---

## Tecnologías

### Frontend

| Tecnología | Uso en el proyecto |
|------------|-------------------|
| [React 18](https://react.dev/) | Interfaz de usuario basada en componentes. |
| [TypeScript](https://www.typescriptlang.org/) | Tipado estático y mayor mantenibilidad. |
| [Vite 5](https://vitejs.dev/) | Bundler y servidor de desarrollo (puerto **8080**). |
| [React Router 6](https://reactrouter.com/) | Enrutamiento y rutas protegidas. |
| [TanStack Query](https://tanstack.com/query) | Caché y sincronización de datos del servidor. |
| [Tailwind CSS 3](https://tailwindcss.com/) | Estilos utilitarios y diseño responsivo. |
| [shadcn/ui](https://ui.shadcn.com/) + [Radix UI](https://www.radix-ui.com/) | Componentes accesibles (diálogos, tablas, sidebar, etc.). |
| [Lucide React](https://lucide.dev/) | Iconografía de la interfaz. |
| [Recharts](https://recharts.org/) | Gráficas en reportes y dashboard. |
| [@dnd-kit](https://dndkit.com/) | Drag and drop en el tablero Pipeline. |
| [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) | Formularios y validación de esquemas. |
| [date-fns](https://date-fns.org/) | Manejo de fechas. |

### Backend y datos

| Tecnología | Uso en el proyecto |
|------------|-------------------|
| [Supabase](https://supabase.com/) | Base de datos PostgreSQL, autenticación y API. Cliente: `@supabase/supabase-js`. |

### Utilidades

| Librería | Uso |
|----------|-----|
| `papaparse` | Lectura e importación de archivos CSV. |
| `xlsx` (SheetJS) | Importación de hojas de cálculo Excel. |
| `sonner` | Notificaciones toast. |

### Herramientas de desarrollo

- **ESLint** — Análisis estático del código.
- **Vitest** + **Testing Library** — Pruebas unitarias.
- **Playwright** — Pruebas end-to-end (configuración en `playwright.config.ts`).

---

## Requisitos previos

- **Node.js** 18 o superior (recomendado: LTS 20+).
- **npm** (incluido con Node) o **Bun** (el repositorio incluye `bun.lock`; ambos gestores son compatibles).
- Cuenta y proyecto en **Supabase** con las tablas y políticas RLS configuradas para el CRM.
- Navegador moderno (Chrome, Firefox, Edge o Safari).

---

## Instalación y ejecución local

### 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd crm_version1
```

### 2. Instalar dependencias

Con npm:

```bash
npm install
```

Con Bun:

```bash
bun install
```

### 3. Configurar Supabase

El cliente de Supabase se inicializa en `src/lib/supabase.ts` con la URL del proyecto y la clave pública (anon/publishable). Para desarrollo local:

1. Crea un proyecto en [Supabase](https://supabase.com/).
2. Obtén la **Project URL** y la **anon key** en *Settings → API*.
3. Actualiza `src/lib/supabase.ts` con tus credenciales, o refactoriza el archivo para leer variables de entorno (recomendado en producción):

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_clave_publica
```

> **Nota:** Las variables en Vite deben tener el prefijo `VITE_` para exponerse al frontend.

Migraciones SQL adicionales del proyecto se encuentran en `supabase/migrations/` (por ejemplo, columnas nuevas en tablas como `tratos`).

### 4. Iniciar el servidor de desarrollo

```bash
npm run dev
```

La aplicación estará disponible en **http://localhost:8080** (configurado en `vite.config.ts`).

### 5. Compilar para producción

```bash
npm run build
npm run preview
```

`preview` sirve la carpeta `dist/` generada por el build.

---

## Scripts disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo con recarga en caliente (HMR). |
| `npm run build` | Compilación optimizada para producción. |
| `npm run build:dev` | Build en modo development. |
| `npm run preview` | Vista previa del build de producción. |
| `npm run lint` | Ejecuta ESLint sobre el proyecto. |
| `npm run test` | Ejecuta las pruebas con Vitest (una sola pasada). |
| `npm run test:watch` | Vitest en modo observación. |

---

## Estructura de carpetas

```
crm_version1/
├── public/                 # Archivos estáticos servidos tal cual
│   ├── img/                # Imágenes (p. ej. logo de la aplicación)
│   ├── robots.txt
│   └── placeholder.svg
├── src/                    # Código fuente de la aplicación
│   ├── main.tsx            # Punto de entrada: monta React en el DOM
│   ├── App.tsx             # Rutas, proveedores globales (Query, Toaster, Router)
│   ├── App.css             # Estilos globales complementarios
│   ├── index.css           # Estilos base y variables de Tailwind / tema
│   ├── vite-env.d.ts       # Tipos de Vite
│   ├── components/         # Componentes reutilizables
│   │   ├── AppLayout.tsx   # Layout principal (sidebar + contenido)
│   │   ├── AppSidebar.tsx  # Navegación lateral del CRM
│   │   ├── NavLink.tsx     # Enlace con estado activo
│   │   ├── ProtectedRoute.tsx  # Guard de autenticación Supabase
│   │   ├── clientes/       # Paneles y formularios de clientes
│   │   ├── pedidos/        # Creación y detalle de pedidos
│   │   ├── pipeline/       # Kanban: columnas, tarjetas y modales de tratos
│   │   └── ui/             # Componentes shadcn/ui y piezas compartidas
│   ├── pages/              # Vistas por ruta (una página ≈ un módulo)
│   │   ├── Index.tsx       # Redirige al Dashboard
│   │   ├── Dashboard.tsx
│   │   ├── Clientes.tsx
│   │   ├── Proveedores.tsx
│   │   ├── Pipeline.tsx
│   │   ├── Pedidos.tsx
│   │   ├── Reportes.tsx
│   │   ├── Auth.tsx
│   │   └── NotFound.tsx
│   ├── hooks/              # Hooks personalizados (auth, toast, mobile)
│   ├── lib/                # Utilidades y cliente Supabase
│   │   ├── supabase.ts
│   │   └── utils.ts        # Helpers (p. ej. cn() para clases Tailwind)
│   ├── data/               # Datos mock o constantes de desarrollo
│   └── test/               # Configuración y pruebas de ejemplo (Vitest)
├── supabase/
│   └── migrations/         # Scripts SQL para el esquema en Supabase
├── index.html              # Plantilla HTML raíz
├── vite.config.ts          # Configuración de Vite (alias @ → src, puerto 8080)
├── tailwind.config.ts      # Tema y plugins de Tailwind
├── tsconfig.json           # Configuración TypeScript del monorepo
├── tsconfig.app.json       # TS para código de la app
├── tsconfig.node.json      # TS para archivos de configuración (Vite)
├── components.json         # Configuración de shadcn/ui
├── eslint.config.js        # Reglas de linting
├── vitest.config.ts        # Configuración de pruebas unitarias
├── playwright.config.ts    # Configuración de pruebas E2E
├── package.json            # Dependencias y scripts npm
└── INFORME_CAMBIOS.md      # Registro técnico de cambios recientes del proyecto
```

### Convenciones de importación

El alias `@/` apunta a `src/` (definido en `vite.config.ts` y `components.json`). Ejemplo:

```ts
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
```

---

## Autenticación

- El hook `useAuth` (`src/hooks/use-auth.ts`) escucha la sesión de Supabase.
- `ProtectedRoute` redirige a `/auth` si no hay sesión activa.
- Tras iniciar sesión, el usuario accede al layout con sidebar y a todos los módulos del CRM.

---

## Pruebas

```bash
# Pruebas unitarias
npm run test

# Pruebas E2E (requiere dependencias de Playwright instaladas)
npx playwright test
```

---

## Documentación adicional

Para un historial detallado de cambios técnicos, migraciones de datos y decisiones de arquitectura, consulta [INFORME_CAMBIOS.md](./INFORME_CAMBIOS.md).

---

## Licencia

Proyecto privado (`"private": true` en `package.json`). Uso académico y operativo según los términos acordados por el equipo de desarrollo.
