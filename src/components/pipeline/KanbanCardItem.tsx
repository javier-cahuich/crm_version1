import { KanbanCard } from "@/data/mockData";
import { Badge } from "@/components/ui/badge";
import { User, Calendar, DollarSign } from "lucide-react";

const priorityColors: Record<string, string> = {
  alta: "bg-destructive/10 text-destructive border-destructive/20",
  media: "bg-warning/10 text-warning border-warning/20",
  baja: "bg-muted text-muted-foreground border-border",
};

interface Props {
  card: KanbanCard;
  /** Callback invocado al hacer clic en el nombre del trato */
  onTitleClick?: () => void;
}

export default function KanbanCardItem({ card, onTitleClick }: Props) {
  return (
    <div className="space-y-2">
      {/* Título — clicable para abrir el modal de detalles */}
      <p
        className={`font-medium text-sm leading-tight ${
          onTitleClick
            ? "hover:text-primary hover:underline underline-offset-2 cursor-pointer transition-colors"
            : ""
        }`}
        onClick={(e) => {
          if (onTitleClick) {
            e.stopPropagation(); // evita disparar el drag
            onTitleClick();
          }
        }}
        // Impide que el pointer-down del drag capture este elemento
        onPointerDown={(e) => e.stopPropagation()}
      >
        {card.title}
      </p>

      {/* Cliente */}
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <User className="h-3 w-3 shrink-0" />
        <span className="truncate">{card.client}</span>
      </div>

      {/* Ingreso esperado (tratos creados desde el formulario) */}
      {card.ingreso !== undefined && (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <DollarSign className="h-3 w-3 shrink-0" />
          {card.ingreso.toLocaleString("es-MX", {
            style: "currency",
            currency: "MXN",
            maximumFractionDigits: 0,
          })}
        </div>
      )}

      {/* Fecha + Prioridad (tarjetas mock) */}
      {card.ingreso === undefined && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3 shrink-0" />
            {new Date(card.dueDate).toLocaleDateString("es-ES", {
              day: "numeric",
              month: "short",
            })}
          </div>
          <Badge
            variant="outline"
            className={`text-[10px] px-1.5 ${priorityColors[card.priority]}`}
          >
            {card.priority}
          </Badge>
        </div>
      )}
    </div>
  );
}
