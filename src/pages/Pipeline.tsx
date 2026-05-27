import { useState, useEffect } from "react";
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
import { kanbanColumns, KanbanCard } from "@/data/mockData";
import { Plus, Loader2, AlertCircle } from "lucide-react";
import CreateDealPanel from "@/components/pipeline/CreateDealPanel";
import type { TratoDB } from "@/components/pipeline/CreateDealPanel";
import KanbanColumn from "@/components/pipeline/KanbanColumn";
import KanbanCardItem from "@/components/pipeline/KanbanCardItem";
import DealDetailModal from "@/components/pipeline/DealDetailModal";
import { supabase } from "@/lib/supabase";

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Maps a Supabase `tratos` row into the KanbanCard shape used by the UI. */
function tratoToCard(row: TratoDB): KanbanCard {
  return {
    id: row.id,
    title: row.nombre_trato,
    client: row.clientes?.nombre ?? "Cliente desconocido",
    quantity: 0,
    priority: "media",
    dueDate: "",
    ingreso: row.ingreso_esperado ?? undefined,
    descripcion: row.descripcion ?? undefined,
    clienteId: row.cliente_id ?? undefined,
    clienteCorreo: row.clientes?.correo ?? undefined,
    clienteNumero: row.clientes?.numero ?? undefined,
    url_adjunto: row.url_adjunto ?? undefined,
  };
}

/** Builds the board record from a flat list of tratos. */
function buildBoard(tratos: TratoDB[]): Record<string, KanbanCard[]> {
  const board: Record<string, KanbanCard[]> = {};
  for (const col of kanbanColumns) {
    board[col.id] = [];
  }
  for (const t of tratos) {
    const etapa = t.etapa_trato ?? "lead";
    if (!board[etapa]) board[etapa] = [];
    board[etapa].push(tratoToCard(t));
  }
  return board;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function Pipeline() {
  const [panelOpen, setPanelOpen] = useState(false);
  const [cards, setCards] = useState<Record<string, KanbanCard[]>>({});
  const [activeCard, setActiveCard] = useState<KanbanCard | null>(null);

  // Loading & error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Estado del modal de detalle ──────────────────────────────────────────
  const [selectedDeal, setSelectedDeal] = useState<(KanbanCard & { stage?: string }) | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  // ── Fetch tratos from Supabase on mount ──────────────────────────────────

  useEffect(() => {
    async function fetchTratos() {
      setLoading(true);
      setError(null);

      const { data, error: sbError } = await supabase
        .from("tratos")
        .select("*, clientes(nombre, correo, numero)")
        .order("created_at", { ascending: true });

      if (sbError) {
        setError(sbError.message);
        setCards({});
      } else {
        setCards(buildBoard((data ?? []) as TratoDB[]));
      }

      setLoading(false);
    }

    fetchTratos();
  }, []);

  // ── Drag-and-drop handlers ────────────────────────────────────────────────

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

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveCard(null);
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    // Find the column where the card now lives
    const col = findColumn(activeId);
    if (!col) return;

    // Persist the new etapa_trato to Supabase
    await supabase
      .from("tratos")
      .update({ etapa_trato: col })
      .eq("id", activeId);

    // Reorder within same column if needed
    if (activeId !== overId) {
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
  }

  // ── Create deal callback ─────────────────────────────────────────────────

  function handleDealCreated(trato: TratoDB) {
    const card = tratoToCard(trato);
    const etapa = trato.etapa_trato ?? "lead";
    setCards((prev) => ({
      ...prev,
      [etapa]: [card, ...(prev[etapa] ?? [])],
    }));
  }

  /** Abre el modal de detalles con el trato y su etapa actual */
  function handleCardClick(card: KanbanCard) {
    const stage = findColumn(card.id) ?? undefined;
    setSelectedDeal({ ...card, stage });
    setModalOpen(true);
  }

  // ── Delete handler ────────────────────────────────────────────────────────

  async function handleDelete(id: string) {
    await supabase.from("tratos").delete().eq("id", id);
    setCards((prev) => {
      const updated = { ...prev };
      for (const col in updated) {
        updated[col] = updated[col].filter((c) => c.id !== id);
      }
      return updated;
    });
  }

  // ── Update handler (edit mode) ──────────────────────────────────────────

  function handleUpdate(updatedCard: KanbanCard) {
    setCards((prev) => {
      const updated = { ...prev };
      for (const col in updated) {
        updated[col] = updated[col].map((c) =>
          c.id === updatedCard.id ? updatedCard : c
        );
      }
      return updated;
    });
    // Also refresh the selected deal in case the modal is still open
    setSelectedDeal((prev) =>
      prev && prev.id === updatedCard.id
        ? { ...updatedCard, stage: prev.stage }
        : prev
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Pipeline de Ventas</h1>
          <p className="text-muted-foreground text-sm">Seguimiento de tratos por etapa</p>
        </div>
        <Button onClick={() => setPanelOpen(true)} className="shrink-0 gap-2">
          <Plus className="h-4 w-4" />
          Crear trato
        </Button>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-20 text-muted-foreground gap-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Cargando tratos...</span>
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div className="flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-destructive text-sm">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>Error al cargar tratos: {error}</span>
        </div>
      )}

      {/* Kanban Board */}
      {!loading && !error && (
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
      )}

      {/* Create Deal Side Panel */}
      <CreateDealPanel
        open={panelOpen}
        onOpenChange={setPanelOpen}
        onDealCreated={handleDealCreated}
      />

      {/* Deal Detail Modal */}
      <DealDetailModal
        deal={selectedDeal}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onDelete={handleDelete}
        onUpdate={handleUpdate}
      />
    </div>
  );
}
