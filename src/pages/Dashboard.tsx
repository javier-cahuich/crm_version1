import {
  Pencil,
  X,
  Plus,
  Check,
  TrendingUp,
  ClipboardList,
  ShoppingBag,
  Users,
  Handshake,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useState, useEffect, useRef } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────

interface TareaDB {
  id: string;
  titulo: string;
  completada: boolean;
  created_at: string;
}

interface DashboardStats {
  totalClientes: number;
  pedidosActivos: number;
  tratosEnProceso: number;
  ingresosEntregados: number;
}

interface PedidoActivo {
  id: string;
  nombre_pedido: string;
  etapa_pedido: string;
  fecha_entrega: string | null;
  clientes: { nombre: string } | null;
}

interface PedidoPorEtapa {
  name: string;
  value: number;
  color: string;
}

interface VentaMensual {
  month: string;
  ventas: number;
}

// ── Constantes de etapas ──────────────────────────────────────────────────────

const stageLabels: Record<string, string> = {
  en_cola: "En cola",
  en_curso: "En curso",
  control_calidad: "Control de calidad",
  listo_entrega: "Listo para entrega",
  entregado: "Entregado",
};

const stageColors: Record<string, string> = {
  en_cola: "bg-blue-100 text-blue-700 border-blue-200",
  en_curso: "bg-amber-100 text-amber-700 border-amber-200",
  control_calidad: "bg-violet-100 text-violet-700 border-violet-200",
  listo_entrega: "bg-emerald-100 text-emerald-700 border-emerald-200",
  entregado: "bg-slate-100 text-slate-600 border-slate-200",
};

const pieColors: Record<string, string> = {
  en_cola: "#3b82f6",
  en_curso: "#f59e0b",
  control_calidad: "#8b5cf6",
  listo_entrega: "#10b981",
  entregado: "#64748b",
};

const MONTH_NAMES = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatMXN(n: number): string {
  if (n >= 1000) {
    return `$${(n / 1000).toFixed(1)}k`;
  }
  return `$${n.toLocaleString("es-MX")}`;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function Dashboard() {
  // ── Tasks (Supabase) ────────────────────────────────────────────────────────
  const [tasks, setTasks] = useState<TareaDB[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tasksLoading, setTasksLoading] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  // ── Stats from Supabase ─────────────────────────────────────────────────────
  const [stats, setStats] = useState<DashboardStats>({
    totalClientes: 0,
    pedidosActivos: 0,
    tratosEnProceso: 0,
    ingresosEntregados: 0,
  });
  const [pedidosActivos, setPedidosActivos] = useState<PedidoActivo[]>([]);
  const [pedidosPorEtapa, setPedidosPorEtapa] = useState<PedidoPorEtapa[]>([]);
  const [ventasMensuales, setVentasMensuales] = useState<VentaMensual[]>([]);
  const [loading, setLoading] = useState(true);

  // ── Fetch tasks from Supabase ────────────────────────────────────────────────
  useEffect(() => {
    async function fetchTareas() {
      setTasksLoading(true);
      const { data } = await supabase
        .from("tareas")
        .select("*")
        .order("completada", { ascending: true })
        .order("created_at", { ascending: false });
      setTasks((data as TareaDB[]) ?? []);
      setTasksLoading(false);
    }
    fetchTareas();
  }, []);

  // ── Fetch dashboard data ────────────────────────────────────────────────────
  useEffect(() => {
    async function fetchDashboard() {
      setLoading(true);

      const [clientesRes, pedidosRes, tratosRes] = await Promise.all([
        supabase.from("clientes").select("id", { count: "exact", head: true }),
        supabase.from("pedidos").select("id, nombre_pedido, valor_pedido, etapa_pedido, fecha_entrega, created_at, clientes(nombre)").order("created_at", { ascending: false }),
        supabase.from("tratos").select("id, etapa_trato, ingreso_esperado, created_at"),
      ]);

      const totalClientes = clientesRes.count ?? 0;
      const allPedidos = (pedidosRes.data ?? []) as unknown as Array<{
        id: string; nombre_pedido: string; valor_pedido: number | null;
        etapa_pedido: string | null; fecha_entrega: string | null;
        created_at: string; clientes: { nombre: string } | null;
      }>;
      const allTratos = (tratosRes.data ?? []) as unknown as Array<{
        id: string; etapa_trato: string | null;
        ingreso_esperado: number | null; created_at: string;
      }>;

      const activos = allPedidos.filter((p) => p.etapa_pedido !== "entregado");
      const tratosEnProceso = allTratos.filter(
        (t) => t.etapa_trato !== "trato_cerrado" && t.etapa_trato !== "trato_perdido"
      );
      const ingresosEntregados = allPedidos
        .filter((p) => p.etapa_pedido === "entregado")
        .reduce((sum, p) => sum + (p.valor_pedido ?? 0), 0);

      setStats({ totalClientes, pedidosActivos: activos.length, tratosEnProceso: tratosEnProceso.length, ingresosEntregados });

      setPedidosActivos(
        activos.slice(0, 10).map((p) => ({
          id: p.id, nombre_pedido: p.nombre_pedido,
          etapa_pedido: p.etapa_pedido ?? "en_cola",
          fecha_entrega: p.fecha_entrega, clientes: p.clientes,
        }))
      );

      const etapaCounts: Record<string, number> = {};
      for (const p of allPedidos) {
        const etapa = p.etapa_pedido ?? "en_cola";
        etapaCounts[etapa] = (etapaCounts[etapa] ?? 0) + 1;
      }
      setPedidosPorEtapa(
        Object.entries(etapaCounts).map(([key, value]) => ({
          name: stageLabels[key] ?? key, value, color: pieColors[key] ?? "#94a3b8",
        }))
      );

      const now = new Date();
      const monthlyMap: Record<string, number> = {};
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        monthlyMap[`${d.getFullYear()}-${String(d.getMonth()).padStart(2, "0")}`] = 0;
      }
      for (const p of allPedidos) {
        if (p.valor_pedido == null) continue;
        const d = new Date(p.created_at);
        const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, "0")}`;
        if (key in monthlyMap) monthlyMap[key] += p.valor_pedido;
      }
      setVentasMensuales(
        Object.entries(monthlyMap).map(([key, ventas]) => {
          const [, m] = key.split("-");
          return { month: MONTH_NAMES[parseInt(m)], ventas };
        })
      );

      setLoading(false);
    }
    fetchDashboard();
  }, []);

  // ── Task CRUD (Supabase) ────────────────────────────────────────────────────
  const handleAdd = async () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    setInputValue("");
    const { data } = await supabase
      .from("tareas")
      .insert({ titulo: trimmed })
      .select()
      .single();
    if (data) setTasks((prev) => [data as TareaDB, ...prev]);
  };

  const handleEdit = (task: TareaDB) => {
    setEditingId(task.id);
    setInputValue(task.titulo);
    inputRef.current?.focus();
  };

  const handleUpdate = async () => {
    const trimmed = inputValue.trim();
    if (!trimmed || !editingId) return;
    await supabase.from("tareas").update({ titulo: trimmed }).eq("id", editingId);
    setTasks((prev) => prev.map((t) => (t.id === editingId ? { ...t, titulo: trimmed } : t)));
    setEditingId(null);
    setInputValue("");
  };

  const handleCancel = () => {
    setEditingId(null);
    setInputValue("");
  };

  const handleDelete = async (id: string) => {
    if (editingId === id) handleCancel();
    await supabase.from("tareas").delete().eq("id", id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const handleToggle = async (task: TareaDB) => {
    const newVal = !task.completada;
    await supabase.from("tareas").update({ completada: newVal }).eq("id", task.id);
    setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, completada: newVal } : t)));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") editingId ? handleUpdate() : handleAdd();
    if (e.key === "Escape" && editingId) handleCancel();
  };
  const isEditing = editingId !== null;

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground text-sm">
          Resumen del taller —{" "}
          {new Date().toLocaleDateString("es-ES", {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
        </p>
      </div>

      {/* Stats */}
      {loading ? (
        <div className="flex items-center justify-center py-8 text-muted-foreground gap-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm">Cargando métricas...</span>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4 pb-3 px-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalClientes}</p>
                  <p className="text-xs text-muted-foreground">
                    Clientes totales
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-3 px-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <ShoppingBag className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.pedidosActivos}</p>
                  <p className="text-xs text-muted-foreground">
                    Pedidos activos
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-3 px-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-violet-500/10 flex items-center justify-center">
                  <Handshake className="h-5 w-5 text-violet-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {stats.tratosEnProceso}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Tratos en proceso
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-3 px-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {formatMXN(stats.ingresosEntregados)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Ingresos (entregados)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Daily Tasks — CRUD */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
              Tareas del Día
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  isEditing ? "Editar tarea..." : "Nueva tarea..."
                }
                className="flex-1 text-sm px-3 py-2 rounded-lg border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
              />
              {isEditing ? (
                <>
                  <button
                    onClick={handleUpdate}
                    className="flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                  >
                    <Check className="h-4 w-4" />
                    Actualizar
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    Cancelar
                  </button>
                </>
              ) : (
                <button
                  onClick={handleAdd}
                  className="flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Agregar
                </button>
              )}
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {tasksLoading && (
                <div className="flex items-center justify-center py-4 text-muted-foreground gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-xs">Cargando tareas...</span>
                </div>
              )}
              {!tasksLoading && tasks.length === 0 && (
                <p className="text-center text-sm text-muted-foreground py-4">
                  Sin tareas. ¡Añade una!
                </p>
              )}
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                    editingId === task.id
                      ? "border-primary/50 bg-primary/5"
                      : "hover:bg-muted/30"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={task.completada}
                    onChange={() => handleToggle(task)}
                    className="h-4 w-4 rounded border-border accent-primary cursor-pointer shrink-0"
                  />
                  <span className={`text-sm flex-1 leading-snug ${
                    task.completada ? "line-through text-muted-foreground" : ""
                  }`}>
                    {task.titulo}
                  </span>
                  <button
                    onClick={() => handleEdit(task)}
                    title="Editar"
                    className="shrink-0 p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(task.id)}
                    title="Eliminar"
                    className="shrink-0 p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Sales Chart — real data */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              Ventas Mensuales (valor de pedidos)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {ventasMensuales.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={ventasMensuales}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                  />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 12 }}
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)",
                      fontSize: 12,
                    }}
                    formatter={(value: number) => [
                      `$${value.toLocaleString("es-MX")}`,
                      "Ventas",
                    ]}
                  />
                  <Bar
                    dataKey="ventas"
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-sm text-muted-foreground py-12">
                Sin datos de ventas aún.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Pie chart — pedidos por etapa */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              Distribución de Pedidos por Etapa
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pedidosPorEtapa.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={pedidosPorEtapa}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={95}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pedidosPorEtapa.map((entry) => (
                      <Cell
                        key={entry.name}
                        fill={entry.color}
                        stroke="transparent"
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)",
                      fontSize: 12,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-sm text-muted-foreground py-12">
                Sin pedidos registrados.
              </p>
            )}
            {pedidosPorEtapa.length > 0 && (
              <div className="flex flex-wrap gap-3 justify-center mt-2">
                {pedidosPorEtapa.map((entry) => (
                  <div key={entry.name} className="flex items-center gap-1.5">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: entry.color }}
                    />
                    <span className="text-xs text-muted-foreground">
                      {entry.name} ({entry.value})
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Active Orders Table — real data */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Pedidos Activos</CardTitle>
          </CardHeader>
          <CardContent>
            {pedidosActivos.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-3 font-medium text-muted-foreground">
                        Pedido
                      </th>
                      <th className="text-left py-2 px-3 font-medium text-muted-foreground">
                        Cliente
                      </th>
                      <th className="text-left py-2 px-3 font-medium text-muted-foreground">
                        Etapa
                      </th>
                      <th className="text-left py-2 px-3 font-medium text-muted-foreground hidden sm:table-cell">
                        Entrega
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {pedidosActivos.map((order) => (
                      <tr
                        key={order.id}
                        className="border-b last:border-0 hover:bg-muted/30"
                      >
                        <td className="py-2.5 px-3 font-medium max-w-[160px] truncate">
                          {order.nombre_pedido}
                        </td>
                        <td className="py-2.5 px-3 text-muted-foreground">
                          {order.clientes?.nombre ?? "—"}
                        </td>
                        <td className="py-2.5 px-3">
                          <Badge
                            variant="outline"
                            className={`text-[10px] font-medium whitespace-nowrap ${stageColors[order.etapa_pedido] ?? ""}`}
                          >
                            {stageLabels[order.etapa_pedido] ??
                              order.etapa_pedido}
                          </Badge>
                        </td>
                        <td className="py-2.5 px-3 hidden sm:table-cell text-muted-foreground">
                          {order.fecha_entrega
                            ? new Date(
                                order.fecha_entrega + "T00:00:00"
                              ).toLocaleDateString("es-MX", {
                                day: "numeric",
                                month: "short",
                              })
                            : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-center text-sm text-muted-foreground py-8">
                No hay pedidos activos.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
