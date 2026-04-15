import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Mail, Phone, MapPin, Loader2, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useState, useEffect } from "react";

// ── Types ──────────────────────────────────────────────────────────────────────

/** Mirrors the `clientes` table in Supabase exactly. */
interface ClienteDB {
  id: string;
  nombre: string;
  correo: string;
  numero: string | null;
  direccion: string | null;
  created_at: string | null;
}

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

      {/* Client cards */}
      {!loading && !error && filtered.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((cliente) => (
            <Card key={cliente.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{cliente.nombre}</CardTitle>
                <p className="text-xs text-muted-foreground">{cliente.correo}</p>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{cliente.correo}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-3.5 w-3.5 shrink-0" />
                  <span>{cliente.numero}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{cliente.direccion}</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t">
                  <Badge variant="secondary">Cliente</Badge>
                  <span className="text-xs text-muted-foreground">
                    Alta: {cliente.createdAt}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
