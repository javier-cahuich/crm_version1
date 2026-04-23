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
import { kanbanColumns, kanbanCards as initialCards, KanbanCard } from "@/data/mockData";
import { Plus } from "lucide-react";
import CreateDealPanel from "@/components/pipeline/CreateDealPanel";
import KanbanColumn from "@/components/pipeline/KanbanColumn";
import KanbanCardItem from "@/components/pipeline/KanbanCardItem";
import DealDetailModal from "@/components/pipeline/DealDetailModal";

export default function Pipeline() {
  const [panelOpen, setPanelOpen] = useState(false);
  const [cards, setCards] = useState<Record<string, KanbanCard[]>>(initialCards);
  const [activeCard, setActiveCard] = useState<KanbanCard | null>(null);
  const [activeColId, setActiveColId] = useState<string | null>(null);

  // ── Estado del modal de detalle ──────────────────────────────────────────
  const [selectedDeal, setSelectedDeal] = useState<(KanbanCard & { stage?: string }) | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  // Encuentra en qué columna está una tarjeta dado su id
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
    setActiveColId(colId);
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);
    if (activeId === overId) return;

    const fromCol = findColumn(activeId);
    // El over puede ser el id de una columna o el id de una tarjeta
    const toCol =
      kanbanColumns.find((c) => c.id === overId)?.id ?? findColumn(overId);

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
    setActiveColId(null);
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);
    if (activeId === overId) return;

    // Reordenar dentro de la misma columna
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

  function handleCreateDeal(newCard: KanbanCard, etapa: string) {
    setCards((prev) => ({
      ...prev,
      [etapa]: [newCard, ...(prev[etapa] ?? [])],
    }));
  }

  /** Abre el modal de detalles con el trato y su etapa actual */
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
          <h1 className="text-2xl font-bold">Pipeline de Ventas</h1>
          <p className="text-muted-foreground text-sm">Seguimiento de pedidos por etapa</p>
        </div>
        <Button onClick={() => setPanelOpen(true)} className="shrink-0 gap-2">
          <Plus className="h-4 w-4" />
          Crear trato
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
          {kanbanColumns.map((col) => (
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

      {/* Create Deal Side Panel */}
      <CreateDealPanel
        open={panelOpen}
        onOpenChange={setPanelOpen}
        onCreateDeal={handleCreateDeal}
      />

      {/* Deal Detail Modal */}
      <DealDetailModal
        deal={selectedDeal}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}
