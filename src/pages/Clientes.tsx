import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Mail, Phone } from "lucide-react";
import { clients } from "@/data/mockData";
import { useState } from "react";

export default function Clientes() {
  const [search, setSearch] = useState("");
  const filtered = clients.filter(
    (c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.company.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Clientes</h1>
          <p className="text-muted-foreground text-sm">{clients.length} clientes registrados</p>
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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((client) => (
          <Card key={client.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{client.name}</CardTitle>
              <p className="text-xs text-muted-foreground">{client.company}</p>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-3.5 w-3.5" /> {client.email}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-3.5 w-3.5" /> {client.phone}
              </div>
              <div className="flex items-center justify-between pt-2 border-t">
                <Badge variant="secondary">{client.totalOrders} pedidos</Badge>
                <span className="text-xs text-muted-foreground">
                  Último: {new Date(client.lastOrder).toLocaleDateString("es-ES", { day: "numeric", month: "short" })}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
