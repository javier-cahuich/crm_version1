import { useState, useRef, useEffect } from "react";
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
  Phone,
  Trash2,
  AlertTriangle,
  X,
  ShoppingCart,
  Loader2,
  CheckCircle2,
  Pencil,
  Save,
  ImagePlus,
  Upload,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import ContactClientModal from "@/components/ui/ContactClientModal";

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
      </DialogContent>
    </Dialog>
  );
}

// ── Modal de Crear Pedido (desde trato) ──────────────────────────────────────
function CreateOrderFromDealModal({
  open,
  onCancel,
  onSuccess,
  deal,
}: {
  open: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  deal: KanbanCard & { stage?: string };
}) {
  const [prioridad, setPrioridad] = useState("media");
  const [fechaEntrega, setFechaEntrega] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const isValid = prioridad !== "" && fechaEntrega !== "";

  async function handleSubmit() {
    if (!isValid || saving) return;

    setSaving(true);
    setError(null);

    const { error: sbError } = await supabase.from("pedidos").insert({
      nombre_pedido: deal.title,
      cliente_id: deal.clienteId ?? null,
      descripcion: deal.descripcion ?? null,
      valor_pedido: deal.ingreso ?? null,
      etapa_pedido: "en_cola",
      fecha_entrega: fechaEntrega,
      nivel_prioridad: prioridad,
    });

    if (sbError) {
      setError(sbError.message);
      setSaving(false);
      return;
    }

    setSaving(false);
    setSuccess(true);

    setTimeout(() => {
      setSuccess(false);
      setPrioridad("media");
      setFechaEntrega("");
      onSuccess();
    }, 1200);
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onCancel()}>
      <DialogContent className="max-w-sm p-6 space-y-5 gap-0 rounded-xl" hideCloseButton>
        {/* Header */}
        <div className="flex items-center gap-3">
          <span className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary shrink-0">
            <ShoppingCart className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <p className="font-semibold text-sm">Crear pedido desde trato</p>
            <p className="text-muted-foreground text-xs mt-0.5 truncate">
              {deal.title}
            </p>
          </div>
        </div>

        {/* Inherited info */}
        <div className="rounded-lg bg-muted/50 border border-border/60 p-3 space-y-1 text-xs text-muted-foreground">
          <p><span className="font-medium text-foreground">Cliente:</span> {deal.client}</p>
          <p>
            <span className="font-medium text-foreground">Valor:</span>{" "}
            {deal.ingreso !== undefined
              ? deal.ingreso.toLocaleString("es-MX", {
                  style: "currency",
                  currency: "MXN",
                  maximumFractionDigits: 0,
                })
              : "No especificado"}
          </p>
        </div>

        {success ? (
          <div className="flex flex-col items-center gap-2 py-4 text-emerald-600">
            <CheckCircle2 className="h-10 w-10" />
            <p className="font-medium text-sm">¡Pedido creado exitosamente!</p>
          </div>
        ) : (
          <>
            <div className="space-y-1.5">
              <Label htmlFor="order-from-deal-prioridad">
                Nivel de prioridad <span className="text-destructive">*</span>
              </Label>
              <Select value={prioridad} onValueChange={setPrioridad}>
                <SelectTrigger id="order-from-deal-prioridad">
                  <SelectValue placeholder="Selecciona prioridad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="baja">🟢 Baja</SelectItem>
                  <SelectItem value="media">🟡 Media</SelectItem>
                  <SelectItem value="alta">🔴 Alta</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="order-from-deal-fecha">
                Fecha de entrega <span className="text-destructive">*</span>
              </Label>
              <Input
                id="order-from-deal-fecha"
                type="date"
                value={fechaEntrega}
                onChange={(e) => setFechaEntrega(e.target.value)}
              />
            </div>

            {error && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-2.5 text-destructive text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-2 justify-end pt-1">
              <Button variant="outline" size="sm" onClick={onCancel}>
                Cancelar
              </Button>
              <Button
                size="sm"
                disabled={!isValid || saving}
                onClick={handleSubmit}
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  "Crear pedido"
                )}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ── Modal principal ──────────────────────────────────────────────────────────
interface DealDetailModalProps {
  deal: (KanbanCard & { stage?: string }) | null;
  open: boolean;
  onClose: () => void;
  onDelete?: (id: string) => void;
  onUpdate?: (updatedCard: KanbanCard) => void;
}

export default function DealDetailModal({
  deal,
  open,
  onClose,
  onDelete,
  onUpdate,
}: DealDetailModalProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);

  // ── Edit mode state ───────────────────────────────────────────────────────
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    nombre: "",
    descripcion: "",
    ingreso: "",
  });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const imgInputRef = useRef<HTMLInputElement>(null);
  const editImgInputRef = useRef<HTMLInputElement>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [currentUrl, setCurrentUrl] = useState<string | null>(null);

  useEffect(() => {
    setCurrentUrl(deal?.url_adjunto ?? null);
    setImageFile(null);
    setImagePreview(null);
  }, [deal?.id, deal?.url_adjunto]);

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

  function enterEditMode() {
    setEditForm({
      nombre: deal!.title,
      descripcion: deal!.descripcion ?? "",
      ingreso: deal!.ingreso?.toString() ?? "",
    });
    setImageFile(null);
    setImagePreview(null);
    setSaveError(null);
    setEditing(true);
  }

  function cancelEdit() {
    setEditing(false);
    setImageFile(null);
    setImagePreview(null);
    setSaveError(null);
  }

  function handleEditImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    setImageFile(file);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(URL.createObjectURL(file));
  }

  function handleReadOnlyImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    uploadAndPersist(file);
  }

  async function uploadAndPersist(file: File) {
    if (!deal) return;
    setUploading(true);

    const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const filePath = `tratos/${deal.id}/${Date.now()}.${ext}`;

    const { error: upErr } = await supabase.storage
      .from("adjuntos")
      .upload(filePath, file, { upsert: true });

    if (upErr) {
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from("adjuntos")
      .getPublicUrl(filePath);

    const publicUrl = urlData?.publicUrl ?? null;

    if (publicUrl) {
      await supabase
        .from("tratos")
        .update({ url_adjunto: publicUrl })
        .eq("id", deal.id);

      setCurrentUrl(publicUrl);
      if (onUpdate) {
        onUpdate({ ...deal, url_adjunto: publicUrl });
      }
    }

    setUploading(false);
  }

  async function handleSave() {
    if (saving) return;
    setSaving(true);
    setSaveError(null);

    let newUrl = currentUrl;
    if (imageFile && deal) {
      const ext = imageFile.name.split(".").pop()?.toLowerCase() ?? "jpg";
      const filePath = `tratos/${deal.id}/${Date.now()}.${ext}`;

      const { error: upErr } = await supabase.storage
        .from("adjuntos")
        .upload(filePath, imageFile, { upsert: true });

      if (!upErr) {
        const { data: urlData } = supabase.storage
          .from("adjuntos")
          .getPublicUrl(filePath);
        newUrl = urlData?.publicUrl ?? currentUrl;
      }
    }

    const { error: sbError } = await supabase
      .from("tratos")
      .update({
        nombre_trato: editForm.nombre.trim(),
        descripcion: editForm.descripcion.trim() || null,
        ingreso_esperado: editForm.ingreso ? parseFloat(editForm.ingreso) : null,
        url_adjunto: newUrl,
      })
      .eq("id", deal!.id);

    if (sbError) {
      setSaveError(sbError.message);
      setSaving(false);
      return;
    }

    setCurrentUrl(newUrl);

    if (onUpdate) {
      onUpdate({
        ...deal!,
        title: editForm.nombre.trim(),
        descripcion: editForm.descripcion.trim() || undefined,
        ingreso: editForm.ingreso ? parseFloat(editForm.ingreso) : undefined,
        url_adjunto: newUrl ?? undefined,
      });
    }

    setImageFile(null);
    setImagePreview(null);
    setSaving(false);
    setEditing(false);
  }

  return (
    <>
      <Dialog open={open} onOpenChange={(v) => { if (!v) { setEditing(false); onClose(); } }}>
        <DialogContent className="max-w-md w-full p-0 gap-0 overflow-hidden rounded-xl" hideCloseButton>
          {/* ── Header ── */}
          <DialogHeader className="px-5 pt-5 pb-4 border-b border-border space-y-0">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <DialogTitle className="text-base font-bold leading-snug pr-2">
                  {editing ? "Editando trato" : deal.title}
                </DialogTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {editing ? deal.title : "Detalle del trato"}
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
                  <Label htmlFor="edit-deal-nombre">Nombre del trato</Label>
                  <Input
                    id="edit-deal-nombre"
                    value={editForm.nombre}
                    onChange={(e) => setEditForm((f) => ({ ...f, nombre: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="edit-deal-descripcion">Descripción</Label>
                  <Textarea
                    id="edit-deal-descripcion"
                    value={editForm.descripcion}
                    onChange={(e) => setEditForm((f) => ({ ...f, descripcion: e.target.value }))}
                    rows={3}
                    className="resize-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="edit-deal-ingreso">Ingreso esperado (MXN)</Label>
                  <Input
                    id="edit-deal-ingreso"
                    type="number"
                    min={0}
                    value={editForm.ingreso}
                    onChange={(e) => setEditForm((f) => ({ ...f, ingreso: e.target.value }))}
                  />
                </div>
                {/* Read-only info */}
                <DetailRow
                  icon={<User className="h-4 w-4" />}
                  label="Cliente"
                  value={deal.client}
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

                <div className="space-y-1.5 pt-2 border-t border-border">
                  <Label>Imagen adjunta</Label>
                  <input
                    ref={editImgInputRef}
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp"
                    className="hidden"
                    onChange={handleEditImageSelect}
                  />
                  {(imagePreview || currentUrl) ? (
                    <div className="relative rounded-lg border border-border overflow-hidden bg-muted/30">
                      <img
                        src={imagePreview ?? currentUrl!}
                        alt="Vista previa"
                        className="w-full h-36 object-contain"
                      />
                      <button
                        type="button"
                        onClick={() => editImgInputRef.current?.click()}
                        className="absolute bottom-2 right-2 p-1.5 rounded-md bg-background/80 border border-border text-muted-foreground hover:text-primary hover:border-primary/50 transition-colors"
                        title="Cambiar imagen"
                      >
                        <Upload className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => editImgInputRef.current?.click()}
                      className="w-full border-2 border-dashed border-border rounded-lg p-4 flex flex-col items-center justify-center gap-1.5 text-center text-muted-foreground bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer"
                    >
                      <ImagePlus className="h-5 w-5 opacity-50" />
                      <span className="text-xs font-medium">Seleccionar imagen</span>
                      <span className="text-[10px] opacity-60">JPG, PNG, WebP</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              /* ── Read-only view ── */
              <>
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

                <div className="mt-5 pt-4 border-t border-border">
                  <div className="flex items-center gap-2 mb-3">
                    <Paperclip className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm font-semibold">Imagen adjunta</p>
                  </div>
                  <input
                    ref={imgInputRef}
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp"
                    className="hidden"
                    onChange={handleReadOnlyImageSelect}
                  />
                  {uploading ? (
                    <div className="border-2 border-dashed border-border rounded-lg p-6 flex flex-col items-center justify-center gap-2 text-center text-muted-foreground bg-muted/30">
                      <Loader2 className="h-6 w-6 animate-spin opacity-50" />
                      <p className="text-xs font-medium">Subiendo imagen...</p>
                    </div>
                  ) : currentUrl ? (
                    <div className="relative rounded-lg border border-border overflow-hidden bg-muted/30">
                      <img
                        src={currentUrl}
                        alt="Adjunto del trato"
                        className="w-full h-44 object-contain"
                      />
                      <button
                        type="button"
                        onClick={() => imgInputRef.current?.click()}
                        className="absolute bottom-2 right-2 p-1.5 rounded-md bg-background/80 border border-border text-muted-foreground hover:text-primary hover:border-primary/50 transition-colors"
                        title="Cambiar imagen"
                      >
                        <Upload className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => imgInputRef.current?.click()}
                      className="w-full border-2 border-dashed border-border rounded-lg p-6 flex flex-col items-center justify-center gap-2 text-center text-muted-foreground bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer"
                    >
                      <ImagePlus className="h-8 w-8 opacity-40" />
                      <p className="text-xs font-medium">Haz clic para adjuntar una imagen</p>
                      <p className="text-[10px] opacity-60">JPG, PNG, WebP</p>
                    </button>
                  )}
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
              <>
                <Button variant="outline" size="sm" onClick={onClose}>
                  <X className="h-3.5 w-3.5 mr-1.5" />
                  Cerrar
                </Button>
                <Button
                  size="sm"
                  className="gap-1.5 bg-orange-600 hover:bg-orange-700 text-white"
                  onClick={() => setShowOrderModal(true)}
                >
                  <ShoppingCart className="h-3.5 w-3.5" />
                  Crear pedido
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Diálogo de confirmación de eliminación */}
      <DeleteConfirmDialog
        open={confirmDelete}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => {
          setConfirmDelete(false);
          if (onDelete) onDelete(deal.id);
          onClose();
        }}
      />

      {/* Modal de Crear Pedido desde el trato */}
      <CreateOrderFromDealModal
        open={showOrderModal}
        onCancel={() => setShowOrderModal(false)}
        onSuccess={() => setShowOrderModal(false)}
        deal={deal}
      />

      {/* Modal de Contactar Cliente */}
      <ContactClientModal
        open={showContactModal}
        onClose={() => setShowContactModal(false)}
        clienteNombre={deal.client}
        clienteCorreo={deal.clienteCorreo}
        clienteNumero={deal.clienteNumero}
      />
    </>
  );
}
