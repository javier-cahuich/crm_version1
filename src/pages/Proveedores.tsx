import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Mail, Phone, Tag } from "lucide-react";
import { suppliers } from "@/data/mockData";
import { useState } from "react";

export default function Proveedores() {
  const [search, setSearch] = useState("");
  const filtered = suppliers.filter(
    (s) => s.name.toLowerCase().includes(search.toLowerCase()) || s.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Proveedores</h1>
          <p className="text-muted-foreground text-sm">{suppliers.length} proveedores registrados</p>
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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((supplier) => (
          <Card key={supplier.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{supplier.name}</CardTitle>
                <Badge variant="outline" className="text-xs">{supplier.category}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-3.5 w-3.5" /> {supplier.email}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-3.5 w-3.5" /> {supplier.phone}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2 border-t">
                <Tag className="h-3.5 w-3.5 shrink-0" />
                <span className="line-clamp-2">{supplier.products}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
