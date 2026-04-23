import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { KanbanCard } from "@/data/mockData";
import KanbanCardItem from "./KanbanCardItem";

// ── Tarjeta arrastrable ──────────────────────────────────────────────────────
function SortableCard({
  card,
  onCardClick,
}: {
  card: KanbanCard;
  onCardClick: (card: KanbanCard) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <Card className="shadow-sm hover:shadow-md transition-shadow select-none">
        <CardContent className="p-3">
          {/*
           * El área de arrastre es el CardContent completo a través de listeners,
           * pero el título tiene su propio onClick que abre el modal.
           * Usamos onPointerDown en un wrapper para el drag, y onClick en el
           * título para no mezclar las dos interacciones.
           */}
          <div {...listeners} className="cursor-grab active:cursor-grabbing">
            <KanbanCardItem card={card} onTitleClick={() => onCardClick(card)} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Columna droppable ────────────────────────────────────────────────────────
interface ColumnProps {
  column: { id: string; title: string; colorClass: string };
  cards: KanbanCard[];
  onCardClick: (card: KanbanCard) => void;
}

export default function KanbanColumn({ column, cards, onCardClick }: ColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  // Suma del ingreso esperado de todos los tratos en esta columna
  const totalIngreso = cards.reduce((sum, c) => sum + (c.ingreso ?? 0), 0);

  return (
    <div className="min-w-[280px] w-[280px] shrink-0 snap-start">
      <div
        className={`border-t-4 ${column.colorClass} rounded-lg bg-card border border-t-4 transition-colors ${
          isOver ? "ring-2 ring-primary/40 bg-primary/5" : ""
        }`}
      >
        {/* Cabecera */}
        <div className="p-3 border-b">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-semibold text-sm">{column.title}</h3>
            <Badge variant="secondary" className="text-xs">{cards.length}</Badge>
          </div>
          <p className="text-xs text-muted-foreground font-medium tabular-nums">
            {totalIngreso.toLocaleString("es-MX", {
              style: "currency",
              currency: "MXN",
              maximumFractionDigits: 0,
            })}
          </p>
        </div>

        {/* Tarjetas */}
        <div ref={setNodeRef} className="p-2 space-y-2 min-h-[200px]">
          <SortableContext
            items={cards.map((c) => c.id)}
            strategy={verticalListSortingStrategy}
          >
            {cards.map((card) => (
              <SortableCard key={card.id} card={card} onCardClick={onCardClick} />
            ))}
          </SortableContext>
        </div>
      </div>
    </div>
  );
}
