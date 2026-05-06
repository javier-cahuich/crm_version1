import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  closestCorners,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { pedidosColumns, KanbanCard } from "@/data/mockData";
import { Plus } from "lucide-react";
import CreateOrderPanel from "@/components/pedidos/CreateOrderPanel";
import KanbanColumn from "@/components/pipeline/KanbanColumn";
import KanbanCardItem from "@/components/pipeline/KanbanCardItem";
import OrderDetailModal from "@/components/pedidos/OrderDetailModal";

// Tablero inicial con pedidos simulados
const initialPedidosBoard: Record<string, KanbanCard[]> = {
  en_cola: [
    {
      id: "order-1",
      title: "100 delantales personalizados",
      client: "Restaurante El Fogón",
      quantity: 100,
      priority: "media",
      dueDate: "2026-05-18",
      descripcion: "Delantales con bordado de logotipo para el personal de cocina.",
    },
  ],
  en_curso: [
    {
      id: "order-2",
      title: "300 polos corporativos",
      client: "Tech Solutions",
      quantity: 300,
      priority: "alta",
      dueDate: "2026-05-12",
      descripcion: "Polos manga corta con serigrafía de marca para evento anual.",
    },
  ],
  control_calidad: [
    {
      id: "order-3",
      title: "150 buzos escolares",
      client: "Escuela San Martín",
      quantity: 150,
      priority: "baja",
      dueDate: "2026-05-25",
      descripcion: "Buzos con escudo bordado para nivel secundaria.",
    },
  ],
  listo_entrega: [],
  entregado: [],
};

export default function Pedidos() {
  const [panelOpen, setPanelOpen] = useState(false);
  const [cards, setCards] = useState<Record<string, KanbanCard[]>>(initialPedidosBoard);
  const [activeCard, setActiveCard] = useState<KanbanCard | null>(null);

  // Estado del modal de detalle
  const [selectedDeal, setSelectedDeal] = useState<(KanbanCard & { stage?: string }) | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  function findColumn(cardId: string): string | null {
    for (const [colId, colCards] of Object.entries(cards)) {
      if (colCards.some((c) => c.id === cardId)) return colId;
    }
    return null;
  }

  function handleDragStart(event: DragStartEvent) {
    const cardId = String(event.active.id);
    const colId = findColumn(cardId);
    if (!colId) return;
    const card = cards[colId].find((c) => c.id === cardId) ?? null;
    setActiveCard(card);
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);
    if (activeId === overId) return;

    const fromCol = findColumn(activeId);
    const toCol =
      pedidosColumns.find((c) => c.id === overId)?.id ?? findColumn(overId);

    if (!fromCol || !toCol || fromCol === toCol) return;

    setCards((prev) => {
      const fromCards = [...prev[fromCol]];
      const toCards = [...(prev[toCol] ?? [])];
      const cardIndex = fromCards.findIndex((c) => c.id === activeId);
      const [movedCard] = fromCards.splice(cardIndex, 1);
      toCards.push(movedCard);
      return { ...prev, [fromCol]: fromCards, [toCol]: toCards };
    });
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveCard(null);
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);
    if (activeId === overId) return;

    const col = findColumn(activeId);
    if (!col) return;
    const colCards = cards[col];
    const oldIdx = colCards.findIndex((c) => c.id === activeId);
    const newIdx = colCards.findIndex((c) => c.id === overId);
    if (oldIdx !== -1 && newIdx !== -1) {
      setCards((prev) => ({
        ...prev,
        [col]: arrayMove(colCards, oldIdx, newIdx),
      }));
    }
  }

  function handleCreateOrder(newCard: KanbanCard, etapa: string) {
    setCards((prev) => ({
      ...prev,
      [etapa]: [newCard, ...(prev[etapa] ?? [])],
    }));
  }

  function handleCardClick(card: KanbanCard) {
    const stage = findColumn(card.id) ?? undefined;
    setSelectedDeal({ ...card, stage });
    setModalOpen(true);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Pedidos</h1>
          <p className="text-muted-foreground text-sm">Seguimiento de pedidos por etapa de producción</p>
        </div>
        <Button onClick={() => setPanelOpen(true)} className="shrink-0 gap-2">
          <Plus className="h-4 w-4" />
          Crear pedido
        </Button>
      </div>

      {/* Kanban Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
          {pedidosColumns.map((col) => (
            <KanbanColumn
              key={col.id}
              column={col}
              cards={cards[col.id] ?? []}
              onCardClick={handleCardClick}
            />
          ))}
        </div>

        {/* Ghost card while dragging */}
        <DragOverlay>
          {activeCard ? (
            <div className="rotate-2 opacity-90 scale-105 shadow-2xl w-[264px]">
              <Card className="shadow-lg">
                <CardContent className="p-3">
                  <KanbanCardItem card={activeCard} />
                </CardContent>
              </Card>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Create Order Side Panel */}
      <CreateOrderPanel
        open={panelOpen}
        onOpenChange={setPanelOpen}
        onCreateOrder={handleCreateOrder}
      />

      {/* Order Detail Modal */}
      <OrderDetailModal
        order={selectedDeal}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onDelete={(id) =>
          setCards((prev) => {
            const updated = { ...prev };
            for (const col in updated) {
              updated[col] = updated[col].filter((c) => c.id !== id);
            }
            return updated;
          })
        }
      />
    </div>
  );
}
