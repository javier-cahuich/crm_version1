import { useState } from "react";
import { KanbanCard } from "@/data/mockData";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  User,
  DollarSign,
  Layers,
  FileText,
  Paperclip,
  Calendar,
  Flag,
  Phone,
  Trash2,
  AlertTriangle,
  X,
  Pencil,
  Save,
  Loader2,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import ContactClientModal from "@/components/ui/ContactClientModal";

// ── Etiquetas de etapa (columnas de pedidos) ─────────────────────────────────
const stageLabels: Record<string, string> = {
  en_cola: "Pedidos en cola",
  en_curso: "En curso",
  control_calidad: "Control de calidad",
  // listo_entrega: "Listo para entrega",
  // entregado: "Entregado",
};

const stageColors: Record<string, string> = {
  en_cola: "bg-blue-100 text-blue-700 border-blue-200",
  en_curso: "bg-amber-100 text-amber-700 border-amber-200",
  control_calidad: "bg-violet-100 text-violet-700 border-violet-200",
  listo_entrega: "bg-emerald-100 text-emerald-700 border-emerald-200",
  entregado: "bg-slate-100 text-slate-600 border-slate-200",
};

// ── Colores de prioridad ─────────────────────────────────────────────────────
const priorityLabels: Record<string, string> = {
  alta: "Alta",
  media: "Media",
  baja: "Baja",
};

const priorityColors: Record<string, string> = {
  alta: "bg-red-100 text-red-700 border-red-200",
  media: "bg-amber-100 text-amber-700 border-amber-200",
  baja: "bg-green-100 text-green-700 border-green-200",
};

const priorityIcons: Record<string, string> = {
  alta: "🔴",
  media: "🟡",
  baja: "🟢",
};

// ── Sub-componente: fila de detalle ──────────────────────────────────────────
function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-border/60 last:border-0">
      <span className="mt-0.5 text-muted-foreground shrink-0">{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-0.5">
          {label}
        </p>
        <div className="text-sm font-medium text-foreground">{value}</div>
      </div>
    </div>
  );
}

// ── Diálogo de confirmación de eliminación ────────────────────────────────────
function DeleteConfirmDialog({
  open,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onCancel()}>
      <DialogContent className="max-w-sm p-6 space-y-4 gap-0 rounded-xl" hideCloseButton>
        <div className="flex items-center gap-3">
          <span className="flex items-center justify-center w-10 h-10 rounded-full bg-destructive/10 text-destructive shrink-0">
            <AlertTriangle className="h-5 w-5" />
          </span>
          <div>
            <p className="font-semibold text-sm">Eliminar pedido</p>
            <p className="text-muted-foreground text-sm mt-0.5">
              ¿Seguro que quieres eliminarlo?
            </p>
          </div>
        </div>
        <div className="flex gap-2 justify-end pt-1">
          <Button variant="outline" size="sm" onClick={onCancel}>
            Cancelar
          </Button>
          <Button variant="destructive" size="sm" onClick={onConfirm}>
            Sí, eliminar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Modal principal ──────────────────────────────────────────────────────────
interface OrderDetailModalProps {
  order: (KanbanCard & { stage?: string }) | null;
  open: boolean;
  onClose: () => void;
  onDelete?: (orderId: string) => void;
  onUpdate?: (updatedCard: KanbanCard) => void;
}

export default function OrderDetailModal({
  order,
  open,
  onClose,
  onDelete,
  onUpdate,
}: OrderDetailModalProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);

  // ── Edit mode state ───────────────────────────────────────────────────────
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    nombre: "",
    descripcion: "",
    valor: "",
    fechaEntrega: "",
    prioridad: "media",
  });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  if (!order) return null;

  const stageName = stageLabels[order.stage ?? ""] ?? order.stage ?? "—";
  const stageColor =
    stageColors[order.stage ?? ""] ??
    "bg-muted text-muted-foreground border-border";

  const priorityKey = order.priority ?? "media";
  const priorityLabel = priorityLabels[priorityKey] ?? priorityKey;
  const priorityColor =
    priorityColors[priorityKey] ?? "bg-muted text-muted-foreground border-border";
  const priorityIcon = priorityIcons[priorityKey] ?? "";

  const valorFormatted =
    order.ingreso !== undefined
      ? order.ingreso.toLocaleString("es-MX", {
        style: "currency",
        currency: "MXN",
        maximumFractionDigits: 0,
      })
      : "No especificado";

  const fechaFormatted = order.dueDate
    ? new Date(order.dueDate + "T00:00:00").toLocaleDateString("es-MX", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
    : "No especificada";

  function enterEditMode() {
    setEditForm({
      nombre: order!.title,
      descripcion: order!.descripcion ?? "",
      valor: order!.ingreso?.toString() ?? "",
      fechaEntrega: order!.dueDate ?? "",
      prioridad: order!.priority ?? "media",
    });
    setSaveError(null);
    setEditing(true);
  }

  function cancelEdit() {
    setEditing(false);
    setSaveError(null);
  }

  async function handleSave() {
    if (saving) return;
    setSaving(true);
    setSaveError(null);

    const { error: sbError } = await supabase
      .from("pedidos")
      .update({
        nombre_pedido: editForm.nombre.trim(),
        descripcion: editForm.descripcion.trim() || null,
        valor_pedido: editForm.valor ? parseFloat(editForm.valor) : null,
        fecha_entrega: editForm.fechaEntrega || null,
        nivel_prioridad: editForm.prioridad,
      })
      .eq("id", order!.id);

    if (sbError) {
      setSaveError(sbError.message);
      setSaving(false);
      return;
    }

    if (onUpdate) {
      onUpdate({
        ...order!,
        title: editForm.nombre.trim(),
        descripcion: editForm.descripcion.trim() || undefined,
        ingreso: editForm.valor ? parseFloat(editForm.valor) : undefined,
        dueDate: editForm.fechaEntrega ?? "",
        priority: editForm.prioridad as "alta" | "media" | "baja",
      });
    }

    setSaving(false);
    setEditing(false);
  }

  function handleConfirmDelete() {
    setConfirmDelete(false);
    onDelete?.(order!.id);
    onClose();
  }

  return (
    <>
      <Dialog open={open} onOpenChange={(v) => { if (!v) { setEditing(false); onClose(); } }}>
        <DialogContent
          className="max-w-md w-full p-0 gap-0 overflow-hidden rounded-xl"
          hideCloseButton
        >
          {/* ── Header ── */}
          <DialogHeader className="px-5 pt-5 pb-4 border-b border-border space-y-0">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <DialogTitle className="text-base font-bold leading-snug pr-2">
                  {editing ? "Editando pedido" : order.title}
                </DialogTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {editing ? order.title : "Detalle del pedido"}
                </p>
              </div>
              {/* Acciones del header */}
              <div className="flex items-center gap-2 shrink-0">
                {!editing && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5 text-xs h-8"
                      onClick={() => setShowContactModal(true)}
                    >
                      <Phone className="h-3.5 w-3.5" />
                      Contactar
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      onClick={enterEditMode}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => setConfirmDelete(true)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          </DialogHeader>

          {/* ── Cuerpo ── */}
          <div className="px-5 py-4 space-y-0 overflow-y-auto max-h-[60vh]">
            {editing ? (
              /* ── Edit form ── */
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="edit-order-nombre">Nombre del pedido</Label>
                  <Input
                    id="edit-order-nombre"
                    value={editForm.nombre}
                    onChange={(e) => setEditForm((f) => ({ ...f, nombre: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="edit-order-descripcion">Descripción</Label>
                  <Textarea
                    id="edit-order-descripcion"
                    value={editForm.descripcion}
                    onChange={(e) => setEditForm((f) => ({ ...f, descripcion: e.target.value }))}
                    rows={3}
                    className="resize-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="edit-order-valor">Valor del pedido (MXN)</Label>
                  <Input
                    id="edit-order-valor"
                    type="number"
                    min={0}
                    value={editForm.valor}
                    onChange={(e) => setEditForm((f) => ({ ...f, valor: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="edit-order-fecha">Fecha de entrega</Label>
                  <Input
                    id="edit-order-fecha"
                    type="date"
                    value={editForm.fechaEntrega}
                    onChange={(e) => setEditForm((f) => ({ ...f, fechaEntrega: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="edit-order-prioridad">Nivel de prioridad</Label>
                  <Select
                    value={editForm.prioridad}
                    onValueChange={(val) => setEditForm((f) => ({ ...f, prioridad: val }))}
                  >
                    <SelectTrigger id="edit-order-prioridad">
                      <SelectValue placeholder="Selecciona prioridad" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="baja">🟢 Baja</SelectItem>
                      <SelectItem value="media">🟡 Media</SelectItem>
                      <SelectItem value="alta">🔴 Alta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {/* Read-only info */}
                <DetailRow
                  icon={<User className="h-4 w-4" />}
                  label="Cliente"
                  value={order.client}
                />
                <DetailRow
                  icon={<Layers className="h-4 w-4" />}
                  label="Etapa"
                  value={
                    <Badge variant="outline" className={`text-xs font-medium ${stageColor}`}>
                      {stageName}
                    </Badge>
                  }
                />
                {saveError && (
                  <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-2.5 text-destructive text-sm">
                    {saveError}
                  </div>
                )}
              </div>
            ) : (
              /* ── Read-only view ── */
              <>
                <DetailRow
                  icon={<FileText className="h-4 w-4" />}
                  label="Nombre del pedido"
                  value={order.title}
                />
                <DetailRow
                  icon={<User className="h-4 w-4" />}
                  label="Cliente"
                  value={order.client}
                />
                <DetailRow
                  icon={<DollarSign className="h-4 w-4" />}
                  label="Valor del pedido"
                  value={valorFormatted}
                />
                <DetailRow
                  icon={<Layers className="h-4 w-4" />}
                  label="Etapa"
                  value={
                    <Badge
                      variant="outline"
                      className={`text-xs font-medium ${stageColor}`}
                    >
                      {stageName}
                    </Badge>
                  }
                />
                <DetailRow
                  icon={<Calendar className="h-4 w-4" />}
                  label="Fecha de entrega"
                  value={fechaFormatted}
                />
                <DetailRow
                  icon={<Flag className="h-4 w-4" />}
                  label="Nivel de prioridad"
                  value={
                    <Badge
                      variant="outline"
                      className={`text-xs font-medium ${priorityColor}`}
                    >
                      {priorityIcon} {priorityLabel}
                    </Badge>
                  }
                />
                {order.descripcion && (
                  <DetailRow
                    icon={<FileText className="h-4 w-4" />}
                    label="Descripción"
                    value={
                      <span className="text-sm text-foreground/80 leading-relaxed">
                        {order.descripcion}
                      </span>
                    }
                  />
                )}

                {/* ── Sección Adjuntar archivo ── */}
                <div className="mt-5 pt-4 border-t border-border">
                  <div className="flex items-center gap-2 mb-3">
                    <Paperclip className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm font-semibold">Adjuntar archivo</p>
                  </div>
                  <div className="border-2 border-dashed border-border rounded-lg p-6 flex flex-col items-center justify-center gap-2 text-center text-muted-foreground bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer">
                    <Paperclip className="h-8 w-8 opacity-40" />
                    <p className="text-sm font-medium">
                      Arrastra archivos aquí o haz clic para seleccionar
                    </p>
                    <p className="text-xs opacity-70">
                      PDF, imágenes, documentos (máx. 10 MB)
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* ── Footer ── */}
          <div className="px-5 py-3 border-t border-border flex justify-end gap-2">
            {editing ? (
              <>
                <Button variant="outline" size="sm" onClick={cancelEdit}>
                  Cancelar
                </Button>
                <Button
                  size="sm"
                  className="gap-1.5"
                  disabled={!editForm.nombre.trim() || saving}
                  onClick={handleSave}
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="h-3.5 w-3.5" />
                      Guardar cambios
                    </>
                  )}
                </Button>
              </>
            ) : (
              <Button variant="outline" size="sm" onClick={onClose}>
                <X className="h-3.5 w-3.5 mr-1.5" />
                Cerrar
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Diálogo de confirmación de eliminación */}
      <DeleteConfirmDialog
        open={confirmDelete}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={handleConfirmDelete}
      />

      {/* Modal de Contactar Cliente */}
      <ContactClientModal
        open={showContactModal}
        onClose={() => setShowContactModal(false)}
        clienteNombre={order.client}
        clienteCorreo={order.clienteCorreo}
        clienteNumero={order.clienteNumero}
      />
    </>
  );
}
