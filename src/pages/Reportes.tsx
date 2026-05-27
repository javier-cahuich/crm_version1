import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import {
  Users, DollarSign, Handshake, ShoppingBag, Loader2,
  FileDown, Filter, Calendar,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useState, useEffect, useRef } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────

interface PedidoRow {
  id: string;
  nombre_pedido: string;
  valor_pedido: number | null;
  etapa_pedido: string | null;
  fecha_entrega: string | null;
  created_at: string;
  clientes: { nombre: string } | null;
}

interface TratoRow {
  id: string;
  nombre_trato: string;
  ingreso_esperado: number | null;
  etapa_trato: string | null;
  created_at: string;
  clientes: { nombre: string } | null;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const pedidoStageLabels: Record<string, string> = {
  en_cola: "En cola", en_curso: "En curso",
  control_calidad: "Control de calidad",
  listo_entrega: "Listo para entrega", entregado: "Entregado",
};
const pedidoStageColors: Record<string, string> = {
  en_cola: "bg-blue-100 text-blue-700 border-blue-200",
  en_curso: "bg-amber-100 text-amber-700 border-amber-200",
  control_calidad: "bg-violet-100 text-violet-700 border-violet-200",
  listo_entrega: "bg-emerald-100 text-emerald-700 border-emerald-200",
  entregado: "bg-slate-100 text-slate-600 border-slate-200",
};
const tratoStageLabels: Record<string, string> = {
  lead: "Lead", cotizacion: "Cotización", aprobacion: "Aprobación",
  trato_cerrado: "Trato Cerrado", trato_perdido: "Trato Perdido",
};
const tratoStageColors: Record<string, string> = {
  lead: "bg-blue-100 text-blue-700 border-blue-200",
  cotizacion: "bg-amber-100 text-amber-700 border-amber-200",
  aprobacion: "bg-violet-100 text-violet-700 border-violet-200",
  trato_cerrado: "bg-emerald-100 text-emerald-700 border-emerald-200",
  trato_perdido: "bg-red-100 text-red-700 border-red-200",
};
const pieColorsPedidos: Record<string, string> = {
  en_cola: "#3b82f6", en_curso: "#f59e0b", control_calidad: "#8b5cf6",
  listo_entrega: "#10b981", entregado: "#64748b",
};

function fmtMXN(n: number) {
  return n.toLocaleString("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 });
}
function fmtDate(d: string) {
  return new Date(d.includes("T") ? d : d + "T00:00:00").toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" });
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function Reportes() {
  const [pedidos, setPedidos] = useState<PedidoRow[]>([]);
  const [tratos, setTratos] = useState<TratoRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalClientes, setTotalClientes] = useState(0);

  // Filters
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [etapaPedido, setEtapaPedido] = useState("");
  const [etapaTrato, setEtapaTrato] = useState("");

  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetch() {
      setLoading(true);
      const [pRes, tRes, cRes] = await Promise.all([
        supabase.from("pedidos").select("id, nombre_pedido, valor_pedido, etapa_pedido, fecha_entrega, created_at, clientes(nombre)").order("created_at", { ascending: false }),
        supabase.from("tratos").select("id, nombre_trato, ingreso_esperado, etapa_trato, created_at, clientes(nombre)").order("created_at", { ascending: false }),
        supabase.from("clientes").select("id", { count: "exact", head: true }),
      ]);
      setPedidos((pRes.data ?? []) as unknown as PedidoRow[]);
      setTratos((tRes.data ?? []) as unknown as TratoRow[]);
      setTotalClientes(cRes.count ?? 0);
      setLoading(false);
    }
    fetch();
  }, []);

  // ── Filtered data ───────────────────────────────────────────────────────────
  const filteredPedidos = pedidos.filter((p) => {
    if (etapaPedido && p.etapa_pedido !== etapaPedido) return false;
    const d = new Date(p.created_at);
    if (fechaDesde && d < new Date(fechaDesde + "T00:00:00")) return false;
    if (fechaHasta && d > new Date(fechaHasta + "T23:59:59")) return false;
    return true;
  });
  const filteredTratos = tratos.filter((t) => {
    if (etapaTrato && t.etapa_trato !== etapaTrato) return false;
    const d = new Date(t.created_at);
    if (fechaDesde && d < new Date(fechaDesde + "T00:00:00")) return false;
    if (fechaHasta && d > new Date(fechaHasta + "T23:59:59")) return false;
    return true;
  });

  // ── KPIs ────────────────────────────────────────────────────────────────────
  const ingresosPedidos = filteredPedidos.reduce((s, p) => s + (p.valor_pedido ?? 0), 0);
  const ingresosTratos = filteredTratos.filter((t) => t.etapa_trato === "trato_cerrado").reduce((s, t) => s + (t.ingreso_esperado ?? 0), 0);

  // Pie data
  const etapaCounts: Record<string, number> = {};
  for (const p of filteredPedidos) {
    const e = p.etapa_pedido ?? "en_cola";
    etapaCounts[e] = (etapaCounts[e] ?? 0) + 1;
  }
  const pieData = Object.entries(etapaCounts).map(([k, v]) => ({
    name: pedidoStageLabels[k] ?? k, value: v, color: pieColorsPedidos[k] ?? "#94a3b8",
  }));

  // Deal performance
  const dealCounts: Record<string, number> = {};
  for (const t of filteredTratos) {
    const e = t.etapa_trato ?? "lead";
    dealCounts[e] = (dealCounts[e] ?? 0) + 1;
  }
  const dealPerf = Object.entries(dealCounts).map(([k, v]) => ({
    metrica: tratoStageLabels[k] ?? k, valor: v,
  }));

  // ── PDF ─────────────────────────────────────────────────────────────────────
  function handlePrint() {
    window.print();
  }

  function clearFilters() {
    setFechaDesde(""); setFechaHasta(""); setEtapaPedido(""); setEtapaTrato("");
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground gap-2">
        <Loader2 className="h-5 w-5 animate-spin" /><span>Cargando reportes...</span>
      </div>
    );
  }

  const rangoLabel = fechaDesde || fechaHasta
    ? `${fechaDesde ? fmtDate(fechaDesde) : "Inicio"} — ${fechaHasta ? fmtDate(fechaHasta) : "Hoy"}`
    : "Todo el periodo";

  return (
    <>
      {/* Print-only header */}
      <div className="hidden print:block mb-6 pb-4 border-b-2 border-black">
        <h1 className="text-2xl font-bold text-black">Reporte Ejecutivo — SerigrafíaPro CRM</h1>
        <p className="text-sm text-gray-600 mt-1">Generado: {new Date().toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
        <p className="text-sm text-gray-600">Periodo: {rangoLabel}</p>
        <div className="flex gap-8 mt-3 text-sm">
          <span><strong>Pedidos analizados:</strong> {filteredPedidos.length}</span>
          <span><strong>Ingreso total pedidos:</strong> {fmtMXN(ingresosPedidos)}</span>
          <span><strong>Tratos cerrados:</strong> {fmtMXN(ingresosTratos)}</span>
        </div>
      </div>

      <div ref={printRef} className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
          <div>
            <h1 className="text-2xl font-bold">Reportes</h1>
            <p className="text-muted-foreground text-sm">Métricas y rendimiento del negocio en tiempo real</p>
          </div>
          <Button onClick={handlePrint} className="gap-2 print:hidden">
            <FileDown className="h-4 w-4" />Descargar Reporte en PDF
          </Button>
        </div>

        {/* Filters */}
        <Card className="print:hidden">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-2 mb-3">
              <Filter className="h-4 w-4 text-muted-foreground" /><span className="text-sm font-semibold">Filtros</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
              <div className="space-y-1">
                <Label className="text-xs flex items-center gap-1"><Calendar className="h-3 w-3" />Desde</Label>
                <Input type="date" value={fechaDesde} onChange={(e) => setFechaDesde(e.target.value)} className="h-9 text-sm" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs flex items-center gap-1"><Calendar className="h-3 w-3" />Hasta</Label>
                <Input type="date" value={fechaHasta} onChange={(e) => setFechaHasta(e.target.value)} className="h-9 text-sm" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Etapa Pedido</Label>
                <select value={etapaPedido} onChange={(e) => setEtapaPedido(e.target.value)} className="h-9 w-full rounded-md border bg-background px-3 text-sm">
                  <option value="">Todas</option>
                  {Object.entries(pedidoStageLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Etapa Trato</Label>
                <select value={etapaTrato} onChange={(e) => setEtapaTrato(e.target.value)} className="h-9 w-full rounded-md border bg-background px-3 text-sm">
                  <option value="">Todas</option>
                  {Object.entries(tratoStageLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <Button variant="outline" size="sm" onClick={clearFilters} className="h-9">Limpiar</Button>
            </div>
          </CardContent>
        </Card>

        {/* KPI cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-5 pb-4 px-5">
              <div className="flex items-start gap-4">
                <div className="h-11 w-11 rounded-xl flex items-center justify-center shrink-0 bg-blue-500/10 text-blue-500"><Users className="h-5 w-5" /></div>
                <div><p className="text-xs text-muted-foreground">Clientes totales</p><p className="text-2xl font-bold mt-1">{totalClientes}</p></div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5 pb-4 px-5">
              <div className="flex items-start gap-4">
                <div className="h-11 w-11 rounded-xl flex items-center justify-center shrink-0 bg-emerald-500/10 text-emerald-500"><DollarSign className="h-5 w-5" /></div>
                <div><p className="text-xs text-muted-foreground">Ingresos pedidos (filtrado)</p><p className="text-2xl font-bold mt-1">{fmtMXN(ingresosPedidos)}</p></div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5 pb-4 px-5">
              <div className="flex items-start gap-4">
                <div className="h-11 w-11 rounded-xl flex items-center justify-center shrink-0 bg-violet-500/10 text-violet-500"><Handshake className="h-5 w-5" /></div>
                <div><p className="text-xs text-muted-foreground">Tratos cerrados (valor)</p><p className="text-2xl font-bold mt-1">{fmtMXN(ingresosTratos)}</p></div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5 pb-4 px-5">
              <div className="flex items-start gap-4">
                <div className="h-11 w-11 rounded-xl flex items-center justify-center shrink-0 bg-amber-500/10 text-amber-500"><ShoppingBag className="h-5 w-5" /></div>
                <div><p className="text-xs text-muted-foreground">Pedidos analizados</p><p className="text-2xl font-bold mt-1">{filteredPedidos.length}</p></div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid md:grid-cols-2 gap-6 print:hidden">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Pedidos por etapa</CardTitle></CardHeader>
            <CardContent className="flex-1 flex items-center justify-center">
              {pieData.length > 0 ? (
                <div className="w-full">
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={65} outerRadius={100} paddingAngle={3} dataKey="value">
                        {pieData.map((e) => <Cell key={e.name} fill={e.color} stroke="transparent" />)}
                      </Pie>
                      <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "var(--radius)", fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-wrap gap-3 justify-center mt-1">
                    {pieData.map((e) => (
                      <div key={e.name} className="flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: e.color }} />
                        <span className="text-xs text-muted-foreground">{e.name} ({e.value})</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : <p className="text-sm text-muted-foreground py-12">Sin datos</p>}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Rendimiento de tratos</CardTitle></CardHeader>
            <CardContent>
              {dealPerf.length > 0 ? (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={dealPerf} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis type="category" dataKey="metrica" tick={{ fontSize: 11 }} width={110} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "var(--radius)", fontSize: 12 }} />
                    <Bar dataKey="valor" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : <p className="text-sm text-muted-foreground py-12 text-center">Sin tratos</p>}
            </CardContent>
          </Card>
        </div>

        {/* Pedidos table */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Detalle de Pedidos ({filteredPedidos.length})</CardTitle></CardHeader>
          <CardContent>
            {filteredPedidos.length > 0 ? (
              <div className="overflow-x-auto rounded-lg border border-border">
                <table className="w-full text-sm print:text-xs">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="px-4 py-2.5 text-left font-semibold text-muted-foreground">Pedido</th>
                      <th className="px-4 py-2.5 text-left font-semibold text-muted-foreground">Cliente</th>
                      <th className="px-4 py-2.5 text-left font-semibold text-muted-foreground">Valor</th>
                      <th className="px-4 py-2.5 text-left font-semibold text-muted-foreground">Etapa</th>
                      <th className="px-4 py-2.5 text-left font-semibold text-muted-foreground">Entrega</th>
                      <th className="px-4 py-2.5 text-left font-semibold text-muted-foreground">Creado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPedidos.map((p, i) => (
                      <tr key={p.id} className={`border-b last:border-0 ${i % 2 === 0 ? "bg-background" : "bg-muted/10"}`}>
                        <td className="px-4 py-2.5 font-medium">{p.nombre_pedido}</td>
                        <td className="px-4 py-2.5 text-muted-foreground">{p.clientes?.nombre ?? "—"}</td>
                        <td className="px-4 py-2.5 text-muted-foreground whitespace-nowrap">{p.valor_pedido != null ? fmtMXN(p.valor_pedido) : "—"}</td>
                        <td className="px-4 py-2.5">
                          <Badge variant="outline" className={`text-[10px] font-medium print:border print:border-gray-300 ${pedidoStageColors[p.etapa_pedido ?? ""] ?? ""}`}>
                            {pedidoStageLabels[p.etapa_pedido ?? ""] ?? p.etapa_pedido}
                          </Badge>
                        </td>
                        <td className="px-4 py-2.5 text-muted-foreground whitespace-nowrap">{p.fecha_entrega ? fmtDate(p.fecha_entrega) : "—"}</td>
                        <td className="px-4 py-2.5 text-muted-foreground whitespace-nowrap">{fmtDate(p.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : <p className="text-center text-sm text-muted-foreground py-8">Sin pedidos en este rango.</p>}
          </CardContent>
        </Card>

        {/* Tratos table */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Detalle de Tratos ({filteredTratos.length})</CardTitle></CardHeader>
          <CardContent>
            {filteredTratos.length > 0 ? (
              <div className="overflow-x-auto rounded-lg border border-border">
                <table className="w-full text-sm print:text-xs">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="px-4 py-2.5 text-left font-semibold text-muted-foreground">Trato</th>
                      <th className="px-4 py-2.5 text-left font-semibold text-muted-foreground">Cliente</th>
                      <th className="px-4 py-2.5 text-left font-semibold text-muted-foreground">Ingreso esperado</th>
                      <th className="px-4 py-2.5 text-left font-semibold text-muted-foreground">Etapa</th>
                      <th className="px-4 py-2.5 text-left font-semibold text-muted-foreground">Creado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTratos.map((t, i) => (
                      <tr key={t.id} className={`border-b last:border-0 ${i % 2 === 0 ? "bg-background" : "bg-muted/10"}`}>
                        <td className="px-4 py-2.5 font-medium">{t.nombre_trato}</td>
                        <td className="px-4 py-2.5 text-muted-foreground">{t.clientes?.nombre ?? "—"}</td>
                        <td className="px-4 py-2.5 text-muted-foreground whitespace-nowrap">{t.ingreso_esperado != null ? fmtMXN(t.ingreso_esperado) : "—"}</td>
                        <td className="px-4 py-2.5">
                          <Badge variant="outline" className={`text-[10px] font-medium print:border print:border-gray-300 ${tratoStageColors[t.etapa_trato ?? ""] ?? ""}`}>
                            {tratoStageLabels[t.etapa_trato ?? ""] ?? t.etapa_trato}
                          </Badge>
                        </td>
                        <td className="px-4 py-2.5 text-muted-foreground whitespace-nowrap">{fmtDate(t.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : <p className="text-center text-sm text-muted-foreground py-8">Sin tratos en este rango.</p>}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
