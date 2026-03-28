export interface Task {
  id: string;
  title: string;
  type: "preparar" | "imprimir" | "entrega";
  completed: boolean;
}

export interface Order {
  id: string;
  client: string;
  description: string;
  quantity: number;
  stage: string;
  dueDate: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  totalOrders: number;
  lastOrder: string;
}

export interface Supplier {
  id: string;
  name: string;
  category: string;
  email: string;
  phone: string;
  products: string;
}

export interface KanbanCard {
  id: string;
  title: string;
  client: string;
  quantity: number;
  priority: "alta" | "media" | "baja";
  dueDate: string;
}

export const dailyTasks: Task[] = [
  { id: "1", title: "Preparar marco 120T para pedido #142", type: "preparar", completed: false },
  { id: "2", title: "Emulsionar pantallas para diseño floral", type: "preparar", completed: true },
  { id: "3", title: "Imprimir 200 camisetas Club Deportivo", type: "imprimir", completed: false },
  { id: "4", title: "Imprimir 50 bolsas Café Origen", type: "imprimir", completed: false },
  { id: "5", title: "Entrega pedido #138 - Uniformes Colegio", type: "entrega", completed: false },
  { id: "6", title: "Entrega pedido #135 - Tazas corporativas", type: "entrega", completed: true },
];

export const activeOrders: Order[] = [
  { id: "142", client: "Club Deportivo Luna", description: "200 camisetas técnicas", quantity: 200, stage: "En Producción", dueDate: "2026-03-25" },
  { id: "143", client: "Café Origen", description: "50 bolsas de tela", quantity: 50, stage: "Diseño/Aprobación", dueDate: "2026-03-28" },
  { id: "144", client: "Restaurante El Fogón", description: "100 delantales", quantity: 100, stage: "Cotización", dueDate: "2026-04-01" },
  { id: "145", client: "Tech Solutions", description: "300 polos corporativos", quantity: 300, stage: "Control de Calidad", dueDate: "2026-03-24" },
  { id: "146", client: "Escuela San Martín", description: "150 buzos escolares", quantity: 150, stage: "Listo para Entrega", dueDate: "2026-03-23" },
];

export const monthlySales = [
  { month: "Oct", ventas: 4200 },
  { month: "Nov", ventas: 5800 },
  { month: "Dic", ventas: 7200 },
  { month: "Ene", ventas: 3900 },
  { month: "Feb", ventas: 6100 },
  { month: "Mar", ventas: 5400 },
];

export const clients: Client[] = [
  { id: "1", name: "Club Deportivo Luna", email: "contacto@cdluna.com", phone: "+54 11 5555-1234", company: "CD Luna", totalOrders: 12, lastOrder: "2026-03-20" },
  { id: "2", name: "Café Origen", email: "pedidos@cafeorigen.com", phone: "+54 11 5555-5678", company: "Café Origen SRL", totalOrders: 5, lastOrder: "2026-03-18" },
  { id: "3", name: "Restaurante El Fogón", email: "admin@elfogon.com", phone: "+54 11 5555-9012", company: "El Fogón SA", totalOrders: 3, lastOrder: "2026-03-15" },
  { id: "4", name: "Tech Solutions", email: "rrhh@techsolutions.com", phone: "+54 11 5555-3456", company: "Tech Solutions Inc", totalOrders: 8, lastOrder: "2026-03-22" },
  { id: "5", name: "Escuela San Martín", email: "compras@sanmartin.edu", phone: "+54 11 5555-7890", company: "Escuela San Martín", totalOrders: 15, lastOrder: "2026-03-21" },
];

export const suppliers: Supplier[] = [
  { id: "1", name: "TintaMax", category: "Tintas", email: "ventas@tintamax.com", phone: "+54 11 4444-1111", products: "Tintas plastisol, base agua, sublimación" },
  { id: "2", name: "TextilPro", category: "Prendas", email: "info@textilpro.com", phone: "+54 11 4444-2222", products: "Camisetas, polos, buzos, remeras" },
  { id: "3", name: "Emulsiones del Sur", category: "Emulsiones", email: "ventas@emulsionesdelsur.com", phone: "+54 11 4444-3333", products: "Emulsiones fotosensibles, removedores" },
  { id: "4", name: "MarcosYa", category: "Marcos", email: "pedidos@marcosya.com", phone: "+54 11 4444-4444", products: "Marcos de aluminio, mallas 110T-160T" },
  { id: "5", name: "Suministros Gráficos", category: "Varios", email: "info@sumgraficos.com", phone: "+54 11 4444-5555", products: "Raseros, cintas, espátulas, adhesivos" },
];

export const kanbanColumns: { id: string; title: string; colorClass: string }[] = [
  { id: "cotizacion", title: "Cotización", colorClass: "kanban-col-cotizacion" },
  { id: "diseno", title: "Diseño/Aprobación", colorClass: "kanban-col-diseno" },
  { id: "produccion", title: "En Producción", colorClass: "kanban-col-produccion" },
  { id: "calidad", title: "Control de Calidad", colorClass: "kanban-col-calidad" },
  { id: "entrega", title: "Listo para Entrega", colorClass: "kanban-col-entrega" },
];

export const kanbanCards: Record<string, KanbanCard[]> = {
  cotizacion: [
    { id: "k1", title: "100 delantales personalizados", client: "Restaurante El Fogón", quantity: 100, priority: "media", dueDate: "2026-04-01" },
    { id: "k2", title: "500 stickers vinilo", client: "Cervecería Artesanal Norte", quantity: 500, priority: "baja", dueDate: "2026-04-05" },
  ],
  diseno: [
    { id: "k3", title: "50 bolsas de tela ecológicas", client: "Café Origen", quantity: 50, priority: "media", dueDate: "2026-03-28" },
  ],
  produccion: [
    { id: "k4", title: "200 camisetas técnicas", client: "Club Deportivo Luna", quantity: 200, priority: "alta", dueDate: "2026-03-25" },
    { id: "k5", title: "80 gorras bordadas", client: "Farmacia Central", quantity: 80, priority: "media", dueDate: "2026-03-27" },
  ],
  calidad: [
    { id: "k6", title: "300 polos corporativos", client: "Tech Solutions", quantity: 300, priority: "alta", dueDate: "2026-03-24" },
  ],
  entrega: [
    { id: "k7", title: "150 buzos escolares", client: "Escuela San Martín", quantity: 150, priority: "media", dueDate: "2026-03-23" },
  ],
};
