import { Pencil, X, Plus, Check, Printer, Package, Truck, TrendingUp, ClipboardList, ShoppingBag } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { dailyTasks, activeOrders, monthlySales } from "@/data/mockData";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useState, useRef } from "react";

interface SimpleTask {
  id: string;
  text: string;
}

export default function Dashboard() {
  const [tasks, setTasks] = useState<SimpleTask[]>(
    dailyTasks.map((t) => ({ id: t.id, text: t.title }))
  );
  const [inputValue, setInputValue] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Agregar nueva tarea
  const handleAdd = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    const newTask: SimpleTask = { id: Date.now().toString(), text: trimmed };
    setTasks((prev) => [...prev, newTask]);
    setInputValue("");
  };

  // Iniciar edición
  const handleEdit = (task: SimpleTask) => {
    setEditingId(task.id);
    setInputValue(task.text);
    inputRef.current?.focus();
  };

  // Confirmar edición
  const handleUpdate = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    setTasks((prev) =>
      prev.map((t) => (t.id === editingId ? { ...t, text: trimmed } : t))
    );
    setEditingId(null);
    setInputValue("");
  };

  // Cancelar edición
  const handleCancel = () => {
    setEditingId(null);
    setInputValue("");
  };

  // Eliminar tarea
  const handleDelete = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    if (editingId === id) handleCancel();
  };

  // Manejar Enter en el input
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") editingId ? handleUpdate() : handleAdd();
    if (e.key === "Escape" && editingId) handleCancel();
  };

  const isEditing = editingId !== null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground text-sm">Resumen del taller — {new Date().toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 pb-3 px-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <ClipboardList className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{tasks.length}</p>
                <p className="text-xs text-muted-foreground">Tareas hoy</p>
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
                <p className="text-2xl font-bold">{activeOrders.length}</p>
                <p className="text-xs text-muted-foreground">Pedidos activos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 px-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">$5.4k</p>
                <p className="text-xs text-muted-foreground">Ventas mes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 px-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <Truck className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">2</p>
                <p className="text-xs text-muted-foreground">Entregas hoy</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Daily Tasks — CRUD */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Tareas del Día</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Input de agregar / editar */}
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isEditing ? "Editar tarea..." : "Nueva tarea..."}
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

            {/* Lista de tareas */}
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {tasks.length === 0 && (
                <p className="text-center text-sm text-muted-foreground py-4">Sin tareas. ¡Añade una!</p>
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
                  <span className="text-sm flex-1 leading-snug">{task.text}</span>
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

        {/* Sales Chart */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Ventas Mensuales</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={monthlySales}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)",
                    fontSize: 12,
                  }}
                  formatter={(value: number) => [`$${value}`, "Ventas"]}
                />
                <Bar dataKey="ventas" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Active Orders */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Pedidos Activos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-3 font-medium text-muted-foreground">#</th>
                  <th className="text-left py-2 px-3 font-medium text-muted-foreground">Cliente</th>
                  <th className="text-left py-2 px-3 font-medium text-muted-foreground hidden md:table-cell">Descripción</th>
                  <th className="text-left py-2 px-3 font-medium text-muted-foreground">Etapa</th>
                  <th className="text-left py-2 px-3 font-medium text-muted-foreground hidden sm:table-cell">Entrega</th>
                </tr>
              </thead>
              <tbody>
                {activeOrders.map((order) => (
                  <tr key={order.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="py-2.5 px-3 font-mono text-xs">{order.id}</td>
                    <td className="py-2.5 px-3 font-medium">{order.client}</td>
                    <td className="py-2.5 px-3 hidden md:table-cell text-muted-foreground">{order.description}</td>
                    <td className="py-2.5 px-3">
                      <Badge variant="secondary" className="text-xs whitespace-nowrap">{order.stage}</Badge>
                    </td>
                    <td className="py-2.5 px-3 hidden sm:table-cell text-muted-foreground">{new Date(order.dueDate).toLocaleDateString("es-ES", { day: "numeric", month: "short" })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
