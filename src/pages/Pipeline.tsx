import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { kanbanColumns, kanbanCards } from "@/data/mockData";
import { Calendar, User } from "lucide-react";

const priorityColors: Record<string, string> = {
  alta: "bg-destructive/10 text-destructive border-destructive/20",
  media: "bg-warning/10 text-warning border-warning/20",
  baja: "bg-muted text-muted-foreground border-border",
};

export default function Pipeline() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Pipeline de Ventas</h1>
        <p className="text-muted-foreground text-sm">Seguimiento de pedidos por etapa</p>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
        {kanbanColumns.map((col) => {
          const cards = kanbanCards[col.id] || [];
          return (
            <div key={col.id} className="min-w-[280px] w-[280px] shrink-0 snap-start">
              <div className={`border-t-4 ${col.colorClass} rounded-lg bg-card border border-t-4`}>
                <div className="p-3 border-b flex items-center justify-between">
                  <h3 className="font-semibold text-sm">{col.title}</h3>
                  <Badge variant="secondary" className="text-xs">{cards.length}</Badge>
                </div>
                <div className="p-2 space-y-2 min-h-[200px]">
                  {cards.map((card) => (
                    <Card key={card.id} className="shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-3 space-y-2">
                        <p className="font-medium text-sm leading-tight">{card.title}</p>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <User className="h-3 w-3" />
                          {card.client}
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {new Date(card.dueDate).toLocaleDateString("es-ES", { day: "numeric", month: "short" })}
                          </div>
                          <Badge variant="outline" className={`text-[10px] px-1.5 ${priorityColors[card.priority]}`}>
                            {card.priority}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
