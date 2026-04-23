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
import {
  User,
  DollarSign,
  Layers,
  FileText,
  Paperclip,
  Phone,
  Trash2,
  AlertTriangle,
  X,
} from "lucide-react";

// ── Etiqueta de etapa ────────────────────────────────────────────────────────
const stageLabels: Record<string, string> = {
  lead: "Lead",
  cotizacion: "Cotización",
  aprobacion: "Aprobación",
  trato_cerrado: "Trato Cerrado",
  trato_perdido: "Trato Perdido",
};

const stageColors: Record<string, string> = {
  lead: "bg-blue-100 text-blue-700 border-blue-200",
  cotizacion: "bg-amber-100 text-amber-700 border-amber-200",
  aprobacion: "bg-violet-100 text-violet-700 border-violet-200",
  trato_cerrado: "bg-emerald-100 text-emerald-700 border-emerald-200",
  trato_perdido: "bg-red-100 text-red-700 border-red-200",
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
      <div className="min-w-0">
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
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
      />
      {/* Card */}
      <div className="relative z-10 bg-card border border-border rounded-xl shadow-2xl w-full max-w-sm mx-4 p-6 space-y-4">
        <div className="flex items-center gap-3">
          <span className="flex items-center justify-center w-10 h-10 rounded-full bg-destructive/10 text-destructive shrink-0">
            <AlertTriangle className="h-5 w-5" />
          </span>
          <div>
            <p className="font-semibold text-sm">Eliminar trato</p>
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
      </div>
    </div>
  );
}

// ── Modal principal ──────────────────────────────────────────────────────────
interface DealDetailModalProps {
  deal: (KanbanCard & { stage?: string }) | null;
  open: boolean;
  onClose: () => void;
}

export default function DealDetailModal({
  deal,
  open,
  onClose,
}: DealDetailModalProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!deal) return null;

  const stageName = stageLabels[deal.stage ?? ""] ?? deal.stage ?? "—";
  const stageColor =
    stageColors[deal.stage ?? ""] ??
    "bg-muted text-muted-foreground border-border";

  const ingresoFormatted =
    deal.ingreso !== undefined
      ? deal.ingreso.toLocaleString("es-MX", {
          style: "currency",
          currency: "MXN",
          maximumFractionDigits: 0,
        })
      : "No especificado";

  return (
    <>
      <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
        <DialogContent className="max-w-md w-full p-0 gap-0 overflow-hidden rounded-xl">
          {/* ── Header ── */}
          <DialogHeader className="px-5 pt-5 pb-4 border-b border-border space-y-0">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <DialogTitle className="text-base font-bold leading-snug pr-2">
                  {deal.title}
                </DialogTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Detalle del trato
                </p>
              </div>
              {/* Acciones del header */}
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-xs h-8"
                  onClick={() => {}}
                >
                  <Phone className="h-3.5 w-3.5" />
                  Contactar cliente
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => setConfirmDelete(true)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </DialogHeader>

          {/* ── Cuerpo ── */}
          <div className="px-5 py-4 space-y-0 overflow-y-auto max-h-[60vh]">
            {/* Detalles del trato */}
            <DetailRow
              icon={<FileText className="h-4 w-4" />}
              label="Nombre del trato"
              value={deal.title}
            />
            <DetailRow
              icon={<User className="h-4 w-4" />}
              label="Cliente"
              value={deal.client}
            />
            <DetailRow
              icon={<DollarSign className="h-4 w-4" />}
              label="Ingreso esperado"
              value={ingresoFormatted}
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
            {deal.descripcion && (
              <DetailRow
                icon={<FileText className="h-4 w-4" />}
                label="Descripción"
                value={
                  <span className="text-sm text-foreground/80 leading-relaxed">
                    {deal.descripcion}
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
          </div>

          {/* ── Footer ── */}
          <div className="px-5 py-3 border-t border-border flex justify-end">
            <Button variant="outline" size="sm" onClick={onClose}>
              <X className="h-3.5 w-3.5 mr-1.5" />
              Cerrar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Diálogo de confirmación de eliminación */}
      <DeleteConfirmDialog
        open={confirmDelete}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => {
          setConfirmDelete(false);
          onClose();
        }}
      />
    </>
  );
}
