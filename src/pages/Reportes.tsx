import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { monthlySales } from "@/data/mockData";
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
  Legend,
} from "recharts";
import { Users, DollarSign, Handshake, RefreshCw } from "lucide-react";

// ── Mock data ─────────────────────────────────────────────────────────────────

const kpiData = [
  {
    id: "nuevos_clientes",
    label: "Clientes nuevos este mes",
    value: "9",
    icon: Users,
    colorClass: "bg-blue-500/10 text-blue-500",
  },
  {
    id: "ingresos",
    label: "Ingresos este mes",
    value: "$4,000",
    icon: DollarSign,
    colorClass: "bg-emerald-500/10 text-emerald-500",
  },
  {
    id: "tratos_cerrados",
    label: "Valor de tratos cerrados",
    value: "$8,000",
    icon: Handshake,
    colorClass: "bg-violet-500/10 text-violet-500",
  },
  {
    id: "recurrencia",
    label: "Tasa de recurrencia",
    value: "40%",
    icon: RefreshCw,
    colorClass: "bg-amber-500/10 text-amber-500",
  },
];

const orderStatusData = [
  { name: "Pedidos en cola", value: 12, color: "#ef4444" },
  { name: "En curso", value: 8, color: "#3b82f6" },
  { name: "Control de calidad", value: 5, color: "#f59e0b" },
  { name: "Listo para entregar", value: 9, color: "#93c5fd" },
  { name: "Entregado", value: 20, color: "#22c55e" },
];

const dealPerformance = [
  { metrica: "Leads", valor: 24 },
  { metrica: "Tratos en proceso", valor: 11 },
  { metrica: "Tratos cerrados", valor: 9 },
  { metrica: "Tratos perdidos", valor: 4 },
];

// ── Sub-components ─────────────────────────────────────────────────────────────

function KpiCard({
  label,
  value,
  icon: Icon,
  colorClass,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  colorClass: string;
}) {
  return (
    <Card>
      <CardContent className="pt-5 pb-4 px-5">
        <div className="flex items-start gap-4">
          <div className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 ${colorClass}`}>
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground leading-snug">{label}</p>
            <p className="text-2xl font-bold mt-1 tracking-tight">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function OrderStatusChart() {
  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Distribución del estado de los pedidos</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex items-center justify-center">
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie
              data={orderStatusData}
              cx="40%"
              cy="50%"
              innerRadius={65}
              outerRadius={100}
              paddingAngle={3}
              dataKey="value"
            >
              {orderStatusData.map((entry) => (
                <Cell key={entry.name} fill={entry.color} stroke="transparent" />
              ))}
            </Pie>
            <Legend
              layout="vertical"
              align="right"
              verticalAlign="middle"
              iconType="circle"
              iconSize={9}
              formatter={(value) => (
                <span className="text-xs text-muted-foreground">{value}</span>
              )}
            />
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
      </CardContent>
    </Card>
  );
}

function MonthlySalesChart() {
  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Ventas mensuales</CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={monthlySales}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 12 }}
              stroke="hsl(var(--muted-foreground))"
            />
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
  );
}

function DealPerformanceTable() {
  const currentMonth = new Date().toLocaleDateString("es-ES", {
    month: "long",
    year: "numeric",
  });
  const label =
    currentMonth.charAt(0).toUpperCase() + currentMonth.slice(1);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Rendimiento de tratos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="w-full overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">
                  Rendimiento
                </th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">
                  {label}
                </th>
              </tr>
            </thead>
            <tbody>
              {dealPerformance.map((row, index) => (
                <tr
                  key={row.metrica}
                  className={`border-b border-border last:border-0 transition-colors hover:bg-muted/40 ${
                    index % 2 === 0 ? "bg-background" : "bg-muted/10"
                  }`}
                >
                  <td className="px-4 py-3 font-medium">{row.metrica}</td>
                  <td className="px-4 py-3 text-muted-foreground">{row.valor}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function Reportes() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Reportes</h1>
        <p className="text-muted-foreground text-sm">
          Resumen de métricas y rendimiento del negocio
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiData.map((kpi) => (
          <KpiCard
            key={kpi.id}
            label={kpi.label}
            value={kpi.value}
            icon={kpi.icon}
            colorClass={kpi.colorClass}
          />
        ))}
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        <OrderStatusChart />
        <MonthlySalesChart />
      </div>

      {/* Deal performance table */}
      <DealPerformanceTable />
    </div>
  );
}
