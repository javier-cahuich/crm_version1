import { CheckCircle2, Circle, Printer, Package, Truck, TrendingUp, ClipboardList, ShoppingBag } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { dailyTasks, activeOrders, monthlySales } from "@/data/mockData";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useState } from "react";

const taskIcons = {
  preparar: Package,
  imprimir: Printer,
  entrega: Truck,
};

const taskColors = {
  preparar: "text-accent",
  imprimir: "text-primary",
  entrega: "text-success",
};

export default function Dashboard() {
  const [tasks, setTasks] = useState(dailyTasks);

  const toggleTask = (id: string) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
  };

  const completedCount = tasks.filter((t) => t.completed).length;

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
                <p className="text-2xl font-bold">{completedCount}/{tasks.length}</p>
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
        {/* Daily Tasks */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Tareas del Día</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {tasks.map((task) => {
              const Icon = taskIcons[task.type];
              return (
                <button
                  key={task.id}
                  onClick={() => toggleTask(task.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-colors ${
                    task.completed ? "bg-muted/50 opacity-60" : "hover:bg-muted/30"
                  }`}
                >
                  {task.completed ? (
                    <CheckCircle2 className="h-5 w-5 text-success shrink-0" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground shrink-0" />
                  )}
                  <Icon className={`h-4 w-4 shrink-0 ${taskColors[task.type]}`} />
                  <span className={`text-sm flex-1 ${task.completed ? "line-through" : ""}`}>{task.title}</span>
                </button>
              );
            })}
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
