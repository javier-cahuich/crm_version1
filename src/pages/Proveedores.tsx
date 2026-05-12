import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import { suppliers } from "@/data/mockData";
import { useState } from "react";

export default function Proveedores() {
  const [search, setSearch] = useState("");

  const filtered = suppliers.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.category.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Proveedores</h1>
          <p className="text-muted-foreground text-sm">
            {suppliers.length} proveedores registrados
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar proveedor..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="py-16 text-center text-muted-foreground text-sm">
          {search
            ? "No se encontraron proveedores con esa búsqueda."
            : "No hay proveedores registrados aún."}
        </div>
      )}

      {/* Suppliers table */}
      {filtered.length > 0 && (
        <div className="w-full overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Nombre</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Correo</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Teléfono</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Categoría</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Dirección</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground whitespace-nowrap">
                  Fecha de alta
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((supplier, index) => (
                <tr
                  key={supplier.id}
                  className={`border-b border-border last:border-0 transition-colors hover:bg-muted/40 ${
                    index % 2 === 0 ? "bg-background" : "bg-muted/10"
                  }`}
                >
                  <td className="px-4 py-3 font-medium">{supplier.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{supplier.email}</td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{supplier.phone}</td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className="text-xs">
                      {supplier.category}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground max-w-xs truncate">
                    {supplier.direccion}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                    {supplier.createdAt}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
