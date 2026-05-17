import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2, AlertCircle, UserPlus } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useState, useEffect } from "react";
import CreateClientePanel, { ClienteDB } from "@/components/clientes/CreateClientePanel";

// ── Types ──────────────────────────────────────────────────────────────────────

/** Mirrors the `clientes` table in Supabase exactly. Re-exported from CreateClientePanel. */

/** Shape used by the UI layer. */
interface ClienteUI {
  id: string;
  nombre: string;
  correo: string;
  numero: string;
  direccion: string;
  createdAt: string; // human-readable
}

// ── Mapper ────────────────────────────────────────────────────────────────────

function mapClienteDBToUI(db: ClienteDB): ClienteUI {
  const fecha = db.created_at
    ? new Date(db.created_at).toLocaleDateString("es-ES", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";

  return {
    id: db.id,
    nombre: db.nombre ?? "Sin nombre",
    correo: db.correo ?? "—",
    numero: db.numero ?? "—",
    direccion: db.direccion ?? "—",
    createdAt: fecha,
  };
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function Clientes() {
  const [clientes, setClientes] = useState<ClienteUI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [panelOpen, setPanelOpen] = useState(false);

  /** Prepend new client to the list without re-fetching. */
  function handleClienteCreado(nuevo: ClienteDB) {
    setClientes((prev) => [mapClienteDBToUI(nuevo), ...prev]);
  }

  useEffect(() => {
    async function fetchClientes() {
      setLoading(true);
      setError(null);

      const { data, error: sbError } = await supabase
        .from("clientes")
        .select("id, nombre, correo, numero, direccion, created_at")
        .order("created_at", { ascending: false });

      if (sbError) {
        setError(sbError.message);
      } else {
        setClientes((data as ClienteDB[]).map(mapClienteDBToUI));
      }

      setLoading(false);
    }

    fetchClientes();
  }, []);

  const filtered = clientes.filter(
    (c) =>
      c.nombre.toLowerCase().includes(search.toLowerCase()) ||
      c.correo.toLowerCase().includes(search.toLowerCase())
  );

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Clientes</h1>
          <p className="text-muted-foreground text-sm">
            {loading ? "Cargando..." : `${clientes.length} clientes registrados`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => setPanelOpen(true)}
            className="flex items-center gap-2 whitespace-nowrap"
          >
            <UserPlus className="h-4 w-4" />
            Agregar cliente
          </Button>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar cliente..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-16 text-muted-foreground gap-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Cargando clientes...</span>
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div className="flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-destructive text-sm">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>Error al cargar clientes: {error}</span>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && filtered.length === 0 && (
        <div className="py-16 text-center text-muted-foreground text-sm">
          {search ? "No se encontraron clientes con esa búsqueda." : "No hay clientes registrados aún."}
        </div>
      )}

      {/* Clients table */}
      {!loading && !error && filtered.length > 0 && (
        <div className="w-full overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Nombre</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Correo</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Teléfono</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Dirección</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground whitespace-nowrap">Fecha de alta</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((cliente, index) => (
                <tr
                  key={cliente.id}
                  className={`border-b border-border last:border-0 transition-colors hover:bg-muted/40 ${
                    index % 2 === 0 ? "bg-background" : "bg-muted/10"
                  }`}
                >
                  <td className="px-4 py-3 font-medium">{cliente.nombre}</td>
                  <td className="px-4 py-3 text-muted-foreground">{cliente.correo}</td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{cliente.numero}</td>
                  <td className="px-4 py-3 text-muted-foreground max-w-xs truncate">{cliente.direccion}</td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{cliente.createdAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <CreateClientePanel
        open={panelOpen}
        onOpenChange={setPanelOpen}
        onClienteCreado={handleClienteCreado}
      />
    </div>
  );
}
