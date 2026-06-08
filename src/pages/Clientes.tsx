import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Search,
  Loader2,
  AlertCircle,
  UserPlus,
  Trash2,
  AlertTriangle,
  Pencil,
  Save,
  X,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ShoppingBag,
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState, useEffect, useRef } from "react";
import CreateClientePanel, {
  ClienteDB,
} from "@/components/clientes/CreateClientePanel";
import ContactClientModal from "@/components/ui/ContactClientModal";
import Papa from "papaparse";
import * as XLSX from "xlsx";

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
      <DialogContent
        className="max-w-sm p-6 space-y-4 gap-0 rounded-xl"
        hideCloseButton
      >
        <div className="flex items-center gap-3">
          <span className="flex items-center justify-center w-10 h-10 rounded-full bg-destructive/10 text-destructive shrink-0">
            <AlertTriangle className="h-5 w-5" />
          </span>
          <div>
            <p className="font-semibold text-sm">Eliminar cliente</p>
            <p className="text-muted-foreground text-sm mt-0.5">
              ¿Seguro que quieres eliminarlo? Esta acción no se puede deshacer.
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

// ── Tipos e info para historial de pedidos ───────────────────────────────────

interface PedidoHistorial {
  id: string;
  nombre_pedido: string;
  valor_pedido: number | null;
  etapa_pedido: string | null;
  fecha_entrega: string | null;
  created_at: string;
}

const stageLabels: Record<string, string> = {
  en_cola: "En cola",
  en_curso: "En curso",
  control_calidad: "Control de calidad",
  listo_entrega: "Listo para entrega",
  entregado: "Entregado",
};

const stageColors: Record<string, string> = {
  en_cola: "bg-blue-100 text-blue-700 border-blue-200",
  en_curso: "bg-amber-100 text-amber-700 border-amber-200",
  control_calidad: "bg-violet-100 text-violet-700 border-violet-200",
  listo_entrega: "bg-emerald-100 text-emerald-700 border-emerald-200",
  entregado: "bg-slate-100 text-slate-600 border-slate-200",
};

// ── Modal de detalle del cliente ──────────────────────────────────────────────

interface ClienteForm {
  nombre: string;
  correo: string;
  numero: string;
  direccion: string;
}

const emptyEditForm: ClienteForm = {
  nombre: "",
  correo: "",
  numero: "",
  direccion: "",
};

function ClientDetailModal({
  cliente,
  open,
  onClose,
  onDelete,
  onUpdate,
}: {
  cliente: ClienteDB | null;
  open: boolean;
  onClose: () => void;
  onDelete: (id: string) => void;
  onUpdate: (updated: ClienteDB) => void;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<ClienteForm>(emptyEditForm);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // ── Historial de pedidos ────────────────────────────────────────────────────
  const [pedidos, setPedidos] = useState<PedidoHistorial[]>([]);
  const [pedidosLoading, setPedidosLoading] = useState(false);

  useEffect(() => {
    if (!open || !cliente) {
      setPedidos([]);
      return;
    }

    async function fetchPedidos() {
      setPedidosLoading(true);
      const { data } = await supabase
        .from("pedidos")
        .select("id, nombre_pedido, valor_pedido, etapa_pedido, fecha_entrega, created_at")
        .eq("cliente_id", cliente!.id)
        .order("created_at", { ascending: false });

      setPedidos((data as PedidoHistorial[]) ?? []);
      setPedidosLoading(false);
    }

    fetchPedidos();
  }, [open, cliente?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!cliente) return null;

  const fechaFormatted = cliente.created_at
    ? new Date(cliente.created_at).toLocaleDateString("es-MX", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "—";

  function enterEditMode() {
    setEditForm({
      nombre: cliente!.nombre,
      correo: cliente!.correo ?? "",
      numero: cliente!.numero ?? "",
      direccion: cliente!.direccion ?? "",
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
      .from("clientes")
      .update({
        nombre: editForm.nombre.trim(),
        correo: editForm.correo.trim() || null,
        numero: editForm.numero.trim() || null,
        direccion: editForm.direccion.trim() || null,
      })
      .eq("id", cliente!.id);

    if (sbError) {
      setSaveError(sbError.message);
      setSaving(false);
      return;
    }

    onUpdate({
      ...cliente!,
      nombre: editForm.nombre.trim(),
      correo: editForm.correo.trim() || "",
      numero: editForm.numero.trim() || null,
      direccion: editForm.direccion.trim() || null,
    });

    setSaving(false);
    setEditing(false);
  }

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(v) => {
          if (!v) {
            setEditing(false);
            onClose();
          }
        }}
      >
        <DialogContent
          className="max-w-lg w-full p-0 gap-0 overflow-hidden rounded-xl"
          hideCloseButton
        >
          {/* ── Header ── */}
          <DialogHeader className="px-5 pt-5 pb-4 border-b border-border space-y-0">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <DialogTitle className="text-base font-bold leading-snug pr-2">
                  {editing ? "Editando cliente" : cliente.nombre}
                </DialogTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {editing ? cliente.nombre : "Detalle del cliente"}
                </p>
              </div>
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
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="edit-cli-nombre">
                    Nombre <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="edit-cli-nombre"
                    value={editForm.nombre}
                    onChange={(e) =>
                      setEditForm((f) => ({ ...f, nombre: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="edit-cli-correo">Correo</Label>
                  <Input
                    id="edit-cli-correo"
                    type="email"
                    value={editForm.correo}
                    onChange={(e) =>
                      setEditForm((f) => ({ ...f, correo: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="edit-cli-numero">Teléfono</Label>
                  <Input
                    id="edit-cli-numero"
                    value={editForm.numero}
                    onChange={(e) =>
                      setEditForm((f) => ({ ...f, numero: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="edit-cli-direccion">Dirección</Label>
                  <Textarea
                    id="edit-cli-direccion"
                    value={editForm.direccion}
                    onChange={(e) =>
                      setEditForm((f) => ({ ...f, direccion: e.target.value }))
                    }
                    rows={2}
                    className="resize-none"
                  />
                </div>
                {saveError && (
                  <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-2.5 text-destructive text-sm">
                    {saveError}
                  </div>
                )}
              </div>
            ) : (
              <>
                <DetailRow
                  icon={<User className="h-4 w-4" />}
                  label="Nombre"
                  value={cliente.nombre}
                />
                <DetailRow
                  icon={<Mail className="h-4 w-4" />}
                  label="Correo"
                  value={cliente.correo || "Sin correo registrado"}
                />
                <DetailRow
                  icon={<Phone className="h-4 w-4" />}
                  label="Teléfono"
                  value={cliente.numero || "Sin teléfono registrado"}
                />
                <DetailRow
                  icon={<MapPin className="h-4 w-4" />}
                  label="Dirección"
                  value={cliente.direccion || "Sin dirección registrada"}
                />
                <DetailRow
                  icon={<Calendar className="h-4 w-4" />}
                  label="Fecha de alta"
                  value={fechaFormatted}
                />

                {/* ── Historial de Pedidos ── */}
                <div className="mt-5 pt-4 border-t border-border">
                  <div className="flex items-center gap-2 mb-3">
                    <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm font-semibold">Historial de Pedidos</p>
                  </div>

                  {pedidosLoading && (
                    <div className="flex items-center justify-center py-6 text-muted-foreground gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-xs">Cargando pedidos...</span>
                    </div>
                  )}

                  {!pedidosLoading && pedidos.length === 0 && (
                    <div className="py-6 text-center text-muted-foreground text-xs rounded-lg border border-dashed border-border bg-muted/30">
                      Este cliente aún no tiene un historial de pedidos registrado.
                    </div>
                  )}

                  {!pedidosLoading && pedidos.length > 0 && (
                    <div className="rounded-lg border border-border overflow-hidden">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-border bg-muted/50">
                            <th className="px-3 py-2 text-left font-semibold text-muted-foreground">Pedido</th>
                            <th className="px-3 py-2 text-left font-semibold text-muted-foreground">Valor</th>
                            <th className="px-3 py-2 text-left font-semibold text-muted-foreground">Etapa</th>
                            <th className="px-3 py-2 text-left font-semibold text-muted-foreground whitespace-nowrap">Entrega</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pedidos.map((p, idx) => {
                            const etapa = p.etapa_pedido ?? "";
                            const etapaLabel = stageLabels[etapa] ?? etapa;
                            const etapaColor = stageColors[etapa] ?? "bg-muted text-muted-foreground border-border";
                            const valor = p.valor_pedido != null
                              ? p.valor_pedido.toLocaleString("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 })
                              : "—";
                            const fecha = p.fecha_entrega
                              ? new Date(p.fecha_entrega + "T00:00:00").toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" })
                              : "—";

                            return (
                              <tr
                                key={p.id}
                                className={`border-b border-border last:border-0 transition-colors ${
                                  idx % 2 === 0 ? "bg-background" : "bg-muted/10"
                                }`}
                              >
                                <td className="px-3 py-2 font-medium max-w-[140px] truncate">{p.nombre_pedido}</td>
                                <td className="px-3 py-2 text-muted-foreground whitespace-nowrap">{valor}</td>
                                <td className="px-3 py-2">
                                  <Badge variant="outline" className={`text-[10px] font-medium ${etapaColor}`}>
                                    {etapaLabel}
                                  </Badge>
                                </td>
                                <td className="px-3 py-2 text-muted-foreground whitespace-nowrap">{fecha}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
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
              <Button variant="outline" size="sm" onClick={onClose}>
                <X className="h-3.5 w-3.5 mr-1.5" />
                Cerrar
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog
        open={confirmDelete}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => {
          setConfirmDelete(false);
          onDelete(cliente.id);
          onClose();
        }}
      />

      <ContactClientModal
        open={showContactModal}
        onClose={() => setShowContactModal(false)}
        clienteNombre={cliente.nombre}
        clienteCorreo={cliente.correo || undefined}
        clienteNumero={cliente.numero || undefined}
      />
    </>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

// ── Column mapping helpers ────────────────────────────────────────────────────

const COLUMN_MAP: Record<string, keyof Pick<ClienteDB, "nombre" | "correo" | "numero" | "direccion">> = {
  nombre: "nombre",
  name: "nombre",
  "nombre del cliente": "nombre",
  cliente: "nombre",
  correo: "correo",
  email: "correo",
  "correo electrónico": "correo",
  "correo electronico": "correo",
  "e-mail": "correo",
  telefono: "numero",
  teléfono: "numero",
  numero: "numero",
  número: "numero",
  celular: "numero",
  phone: "numero",
  tel: "numero",
  direccion: "direccion",
  dirección: "direccion",
  domicilio: "direccion",
  address: "direccion",
};

function mapColumnName(raw: string): keyof Pick<ClienteDB, "nombre" | "correo" | "numero" | "direccion"> | null {
  const key = raw.trim().toLowerCase().replace(/[\s_]+/g, " ");
  return COLUMN_MAP[key] ?? null;
}

interface ImportResult {
  inserted: number;
  skipped: number;
  errors: string[];
}

export interface ClienteLocal extends ClienteDB {
  aportacion: number;
}

export default function Clientes() {
  const [clientes, setClientes] = useState<ClienteLocal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [panelOpen, setPanelOpen] = useState(false);

  // Detail modal
  const [selectedCliente, setSelectedCliente] = useState<ClienteLocal | null>(
    null
  );
  const [modalOpen, setModalOpen] = useState(false);

  // Pagination & Sorting state
  const ITEMS_PER_PAGE = 20;
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<"nombre" | "aportacion" | "created_at">("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Import state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [importResultOpen, setImportResultOpen] = useState(false);

  function handleClienteCreado(nuevo: ClienteDB) {
    const local = { ...nuevo, aportacion: 0 } as ClienteLocal;
    setClientes((prev) => [local, ...prev]);
  }

  useEffect(() => {
    async function fetchClientes() {
      setLoading(true);
      setError(null);

      const { data, error: sbError } = await supabase
        .from("clientes")
        .select("id, nombre, correo, numero, direccion, created_at, pedidos(valor_pedido)")
        .order("created_at", { ascending: false });

      if (sbError) {
        setError(sbError.message);
      } else {
        const mapped = (data || []).map((c: any) => {
          const pedidos = c.pedidos || [];
          const aportacion = pedidos.reduce((acc: number, p: any) => acc + (p.valor_pedido || 0), 0);
          return {
            id: c.id,
            nombre: c.nombre,
            correo: c.correo,
            numero: c.numero,
            direccion: c.direccion,
            created_at: c.created_at,
            aportacion,
          } as ClienteLocal;
        });
        setClientes(mapped);
      }

      setLoading(false);
    }

    fetchClientes();
  }, []);

  // Reset pagination on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, sortBy, sortOrder]);

  const filtered = clientes.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.nombre.toLowerCase().includes(q) ||
      (c.correo?.toLowerCase().includes(q) ?? false) ||
      (c.numero?.toLowerCase().includes(q) ?? false) ||
      (c.direccion?.toLowerCase().includes(q) ?? false)
    );
  });

  // ── Delete handler ─────────────────────────────────────────────────────────

  async function handleDelete(id: string) {
    await supabase.from("clientes").delete().eq("id", id);
    setClientes((prev) => prev.filter((c) => c.id !== id));
  }

  // ── Update handler ─────────────────────────────────────────────────────────

  function handleUpdate(updated: ClienteDB) {
    setClientes((prev) =>
      prev.map((c) => (c.id === updated.id ? { ...c, ...updated } : c))
    );
    setSelectedCliente((prev) => prev ? { ...prev, ...updated } : null);
  }

  // ── Sorting and Pagination ──────────────────────────────────────────────────
  const sorted = [...filtered].sort((a, b) => {
    let cmp = 0;
    if (sortBy === "nombre") {
      cmp = a.nombre.localeCompare(b.nombre);
    } else if (sortBy === "created_at") {
      const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
      cmp = timeA - timeB;
    } else if (sortBy === "aportacion") {
      cmp = a.aportacion - b.aportacion;
    }
    return sortOrder === "asc" ? cmp : -cmp;
  });

  const totalPages = Math.ceil(sorted.length / ITEMS_PER_PAGE) || 1;
  const paginated = sorted.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // ── Import handler ─────────────────────────────────────────────────────────

  async function processImportRows(rows: Record<string, string>[]) {
    if (rows.length === 0) {
      setImportResult({ inserted: 0, skipped: 0, errors: ["El archivo no contiene filas de datos."] });
      setImportResultOpen(true);
      setImporting(false);
      return;
    }

    // Map headers
    const headers = Object.keys(rows[0]);
    const colMapping: Record<string, keyof Pick<ClienteDB, "nombre" | "correo" | "numero" | "direccion">> = {};
    for (const h of headers) {
      const mapped = mapColumnName(h);
      if (mapped) colMapping[h] = mapped;
    }

    if (!Object.values(colMapping).includes("nombre")) {
      setImportResult({
        inserted: 0,
        skipped: rows.length,
        errors: [
          `No se encontró la columna "nombre" en el archivo. Columnas detectadas: ${headers.join(", ")}`,
        ],
      });
      setImportResultOpen(true);
      setImporting(false);
      return;
    }

    const toInsert: { nombre: string; correo?: string; numero?: string; direccion?: string }[] = [];
    let skipped = 0;
    const errors: string[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const mapped: Record<string, string> = {};
      for (const [rawCol, dbCol] of Object.entries(colMapping)) {
        const val = row[rawCol]?.trim();
        if (val) mapped[dbCol] = val;
      }

      if (!mapped.nombre) {
        skipped++;
        continue;
      }

      toInsert.push({
        nombre: mapped.nombre,
        correo: mapped.correo || undefined,
        numero: mapped.numero || undefined,
        direccion: mapped.direccion || undefined,
      });
    }

    if (toInsert.length === 0) {
      setImportResult({ inserted: 0, skipped, errors: ["Ninguna fila tenía un nombre válido."] });
      setImportResultOpen(true);
      setImporting(false);
      return;
    }

    // Bulk insert in batches of 100
    let inserted = 0;
    const BATCH = 100;
    for (let i = 0; i < toInsert.length; i += BATCH) {
      const batch = toInsert.slice(i, i + BATCH);
      const { data, error: sbError } = await supabase
        .from("clientes")
        .insert(batch)
        .select("id, nombre, correo, numero, direccion, created_at");

      if (sbError) {
        errors.push(`Error en lote ${Math.floor(i / BATCH) + 1}: ${sbError.message}`);
      } else if (data) {
        inserted += data.length;
        const mapped = data.map((d: any) => ({ ...d, aportacion: 0 } as ClienteLocal));
        setClientes((prev) => [...mapped, ...prev]);
      }
    }

    setImportResult({ inserted, skipped, errors });
    setImportResultOpen(true);
    setImporting(false);
  }

  function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    // Reset input so the same file can be re-selected
    e.target.value = "";

    setImporting(true);

    const ext = file.name.split(".").pop()?.toLowerCase();

    if (ext === "csv") {
      Papa.parse<Record<string, string>>(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          processImportRows(results.data);
        },
        error: (err) => {
          setImportResult({ inserted: 0, skipped: 0, errors: [`Error al leer CSV: ${err.message}`] });
          setImportResultOpen(true);
          setImporting(false);
        },
      });
    } else if (ext === "xls" || ext === "xlsx") {
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const data = evt.target?.result;
          const workbook = XLSX.read(data, { type: "array" });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const rows = XLSX.utils.sheet_to_json<Record<string, string>>(firstSheet, { defval: "" });
          processImportRows(rows);
        } catch (err) {
          setImportResult({ inserted: 0, skipped: 0, errors: [`Error al leer archivo Excel: ${(err as Error).message}`] });
          setImportResultOpen(true);
          setImporting(false);
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      setImportResult({ inserted: 0, skipped: 0, errors: ["Formato no soportado. Usa archivos .csv, .xls o .xlsx."] });
      setImportResultOpen(true);
      setImporting(false);
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Clientes</h1>
          <p className="text-muted-foreground text-sm">
            {loading
              ? "Cargando..."
              : `${clientes.length} cliente${clientes.length !== 1 ? "s" : ""} registrado${clientes.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => setPanelOpen(true)}
            className="flex items-center gap-2 whitespace-nowrap"
          >
            <UserPlus className="h-4 w-4" />
            Agregar cliente
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xls,.xlsx"
            className="hidden"
            onChange={handleImportFile}
          />
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={importing}
            className="flex items-center gap-2 whitespace-nowrap"
          >
            {importing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Importando...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Importar
              </>
            )}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <ArrowUpDown className="h-4 w-4" />
                Ordenar
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel className="text-xs">Ordenar por</DropdownMenuLabel>
              <DropdownMenuRadioGroup value={sortBy} onValueChange={(val: any) => setSortBy(val)}>
                <DropdownMenuRadioItem value="nombre">Alfabético</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="aportacion">Aportación</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="created_at">Fecha de alta</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-xs">Orden</DropdownMenuLabel>
              <DropdownMenuRadioGroup value={sortOrder} onValueChange={(val: any) => setSortOrder(val)}>
                <DropdownMenuRadioItem value="desc">Mayor a menor / Recientes</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="asc">Menor a mayor / Antiguos</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
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
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-16 text-muted-foreground gap-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Cargando clientes...</span>
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div className="flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-destructive text-sm">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>Error al cargar clientes: {error}</span>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && filtered.length === 0 && (
        <div className="py-16 text-center text-muted-foreground text-sm">
          {search
            ? "No se encontraron clientes con esa búsqueda."
            : "No hay clientes registrados aún."}
        </div>
      )}

      {/* Clients table */}
      {!loading && !error && filtered.length > 0 && (
        <div className="space-y-4">
          <div className="w-full overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">
                    Nombre
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">
                    Correo
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">
                    Teléfono
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">
                    Dirección
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">
                    Aportación
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground whitespace-nowrap">
                    Fecha de alta
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((cliente, index) => (
                  <tr
                    key={cliente.id}
                    className={`border-b border-border last:border-0 transition-colors hover:bg-muted/40 cursor-pointer ${
                      index % 2 === 0 ? "bg-background" : "bg-muted/10"
                    }`}
                    onClick={() => {
                      setSelectedCliente(cliente);
                      setModalOpen(true);
                    }}
                  >
                    <td className="px-4 py-3 font-medium">{cliente.nombre}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {cliente.correo || "—"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      {cliente.numero || "—"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground max-w-xs truncate">
                      {cliente.direccion || "—"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      {cliente.aportacion.toLocaleString("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 })}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      {cliente.created_at
                        ? new Date(cliente.created_at).toLocaleDateString(
                            "es-MX",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            }
                          )
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Mostrando {Math.min(filtered.length, (currentPage - 1) * ITEMS_PER_PAGE + 1)} - {Math.min(filtered.length, currentPage * ITEMS_PER_PAGE)} de {filtered.length} clientes
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Siguiente
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      )}

      <CreateClientePanel
        open={panelOpen}
        onOpenChange={setPanelOpen}
        onClienteCreado={handleClienteCreado}
      />

      {/* Client Detail Modal */}
      <ClientDetailModal
        cliente={selectedCliente}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onDelete={handleDelete}
        onUpdate={handleUpdate}
      />

      {/* Import Result Modal */}
      <Dialog open={importResultOpen} onOpenChange={setImportResultOpen}>
        <DialogContent className="max-w-sm p-6 gap-0 rounded-xl" hideCloseButton>
          <DialogHeader className="pb-4 space-y-0">
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary shrink-0">
                <FileSpreadsheet className="h-5 w-5" />
              </span>
              <div>
                <DialogTitle className="text-sm font-semibold">Resultado de importación</DialogTitle>
                <p className="text-muted-foreground text-xs mt-0.5">
                  Resumen del proceso de importación.
                </p>
              </div>
            </div>
          </DialogHeader>

          {importResult && (
            <div className="space-y-3 pt-1">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-border bg-muted/30 px-3 py-2.5 text-center">
                  <p className="text-lg font-bold text-foreground">{importResult.inserted}</p>
                  <p className="text-[11px] text-muted-foreground">Importados</p>
                </div>
                <div className="rounded-lg border border-border bg-muted/30 px-3 py-2.5 text-center">
                  <p className="text-lg font-bold text-muted-foreground">{importResult.skipped}</p>
                  <p className="text-[11px] text-muted-foreground">Omitidos</p>
                </div>
              </div>

              {importResult.errors.length > 0 && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 space-y-1">
                  {importResult.errors.map((err, i) => (
                    <p key={i} className="text-xs text-destructive flex items-start gap-1.5">
                      <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                      {err}
                    </p>
                  ))}
                </div>
              )}

              {importResult.errors.length === 0 && importResult.inserted > 0 && (
                <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  <p className="text-xs text-emerald-600">Todos los registros se importaron correctamente.</p>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end pt-4">
            <Button variant="outline" size="sm" onClick={() => setImportResultOpen(false)}>
              Cerrar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
