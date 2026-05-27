import { useState, useEffect } from "react";
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
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Search,
  Plus,
  Loader2,
  AlertCircle,
  Trash2,
  AlertTriangle,
  Pencil,
  Save,
  X,
  Building2,
  Mail,
  Phone,
  MapPin,
  Calendar,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import ContactClientModal from "@/components/ui/ContactClientModal";

// ── Types ─────────────────────────────────────────────────────────────────────

interface ProveedorDB {
  id: string;
  nombre: string;
  correo: string | null;
  numero: string | null;
  direccion: string | null;
  created_at: string;
}

interface ProveedorForm {
  nombre: string;
  correo: string;
  numero: string;
  direccion: string;
}

const emptyForm: ProveedorForm = {
  nombre: "",
  correo: "",
  numero: "",
  direccion: "",
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
            <p className="font-semibold text-sm">Eliminar proveedor</p>
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

// ── Modal de detalle del proveedor ────────────────────────────────────────────
function ProveedorDetailModal({
  proveedor,
  open,
  onClose,
  onDelete,
  onUpdate,
}: {
  proveedor: ProveedorDB | null;
  open: boolean;
  onClose: () => void;
  onDelete: (id: string) => void;
  onUpdate: (updated: ProveedorDB) => void;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<ProveedorForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  if (!proveedor) return null;

  const fechaFormatted = new Date(proveedor.created_at).toLocaleDateString(
    "es-MX",
    { day: "numeric", month: "long", year: "numeric" }
  );

  function enterEditMode() {
    setEditForm({
      nombre: proveedor!.nombre,
      correo: proveedor!.correo ?? "",
      numero: proveedor!.numero ?? "",
      direccion: proveedor!.direccion ?? "",
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
      .from("proveedores")
      .update({
        nombre: editForm.nombre.trim(),
        correo: editForm.correo.trim() || null,
        numero: editForm.numero.trim() || null,
        direccion: editForm.direccion.trim() || null,
      })
      .eq("id", proveedor!.id);

    if (sbError) {
      setSaveError(sbError.message);
      setSaving(false);
      return;
    }

    onUpdate({
      ...proveedor!,
      nombre: editForm.nombre.trim(),
      correo: editForm.correo.trim() || null,
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
          className="max-w-md w-full p-0 gap-0 overflow-hidden rounded-xl"
          hideCloseButton
        >
          {/* ── Header ── */}
          <DialogHeader className="px-5 pt-5 pb-4 border-b border-border space-y-0">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <DialogTitle className="text-base font-bold leading-snug pr-2">
                  {editing ? "Editando proveedor" : proveedor.nombre}
                </DialogTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {editing ? proveedor.nombre : "Detalle del proveedor"}
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
                  <Label htmlFor="edit-prov-nombre">
                    Nombre <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="edit-prov-nombre"
                    value={editForm.nombre}
                    onChange={(e) =>
                      setEditForm((f) => ({ ...f, nombre: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="edit-prov-correo">Correo</Label>
                  <Input
                    id="edit-prov-correo"
                    type="email"
                    value={editForm.correo}
                    onChange={(e) =>
                      setEditForm((f) => ({ ...f, correo: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="edit-prov-numero">Teléfono</Label>
                  <Input
                    id="edit-prov-numero"
                    value={editForm.numero}
                    onChange={(e) =>
                      setEditForm((f) => ({ ...f, numero: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="edit-prov-direccion">Dirección</Label>
                  <Textarea
                    id="edit-prov-direccion"
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
                  icon={<Building2 className="h-4 w-4" />}
                  label="Nombre"
                  value={proveedor.nombre}
                />
                <DetailRow
                  icon={<Mail className="h-4 w-4" />}
                  label="Correo"
                  value={proveedor.correo || "Sin correo registrado"}
                />
                <DetailRow
                  icon={<Phone className="h-4 w-4" />}
                  label="Teléfono"
                  value={proveedor.numero || "Sin teléfono registrado"}
                />
                <DetailRow
                  icon={<MapPin className="h-4 w-4" />}
                  label="Dirección"
                  value={proveedor.direccion || "Sin dirección registrada"}
                />
                <DetailRow
                  icon={<Calendar className="h-4 w-4" />}
                  label="Fecha de alta"
                  value={fechaFormatted}
                />
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
          onDelete(proveedor.id);
          onClose();
        }}
      />

      <ContactClientModal
        open={showContactModal}
        onClose={() => setShowContactModal(false)}
        clienteNombre={proveedor.nombre}
        clienteCorreo={proveedor.correo || undefined}
        clienteNumero={proveedor.numero || undefined}
      />
    </>
  );
}

// ── Página principal ──────────────────────────────────────────────────────────

export default function Proveedores() {
  const [proveedores, setProveedores] = useState<ProveedorDB[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // Create panel
  const [panelOpen, setPanelOpen] = useState(false);
  const [form, setForm] = useState<ProveedorForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Detail modal
  const [selectedProveedor, setSelectedProveedor] =
    useState<ProveedorDB | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // ── Fetch ──────────────────────────────────────────────────────────────────

  useEffect(() => {
    async function fetchProveedores() {
      setLoading(true);
      setError(null);

      const { data, error: sbError } = await supabase
        .from("proveedores")
        .select("*")
        .order("created_at", { ascending: false });

      if (sbError) {
        setError(sbError.message);
        setProveedores([]);
      } else {
        setProveedores((data ?? []) as ProveedorDB[]);
      }
      setLoading(false);
    }

    fetchProveedores();
  }, []);

  // ── Filtered list ──────────────────────────────────────────────────────────

  const filtered = proveedores.filter((p) => {
    const q = search.toLowerCase();
    return (
      p.nombre.toLowerCase().includes(q) ||
      (p.correo?.toLowerCase().includes(q) ?? false) ||
      (p.numero?.toLowerCase().includes(q) ?? false) ||
      (p.direccion?.toLowerCase().includes(q) ?? false)
    );
  });

  // ── Create handler ─────────────────────────────────────────────────────────

  async function handleCreate() {
    if (!form.nombre.trim() || saving) return;
    setSaving(true);
    setFormError(null);

    const { data, error: sbError } = await supabase
      .from("proveedores")
      .insert({
        nombre: form.nombre.trim(),
        correo: form.correo.trim() || null,
        numero: form.numero.trim() || null,
        direccion: form.direccion.trim() || null,
      })
      .select("*")
      .single();

    if (sbError) {
      setFormError(sbError.message);
      setSaving(false);
      return;
    }

    setProveedores((prev) => [data as ProveedorDB, ...prev]);
    setForm(emptyForm);
    setSaving(false);
    setPanelOpen(false);
  }

  // ── Delete handler ─────────────────────────────────────────────────────────

  async function handleDelete(id: string) {
    await supabase.from("proveedores").delete().eq("id", id);
    setProveedores((prev) => prev.filter((p) => p.id !== id));
  }

  // ── Update handler ─────────────────────────────────────────────────────────

  function handleUpdate(updated: ProveedorDB) {
    setProveedores((prev) =>
      prev.map((p) => (p.id === updated.id ? updated : p))
    );
    setSelectedProveedor(updated);
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Proveedores</h1>
          <p className="text-muted-foreground text-sm">
            {proveedores.length} proveedor{proveedores.length !== 1 ? "es" : ""}{" "}
            registrado{proveedores.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar proveedor..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button
            onClick={() => setPanelOpen(true)}
            className="shrink-0 gap-2"
          >
            <Plus className="h-4 w-4" />
            Agregar Proveedor
          </Button>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-20 text-muted-foreground gap-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Cargando proveedores...</span>
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div className="flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-destructive text-sm">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>Error al cargar proveedores: {error}</span>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && filtered.length === 0 && (
        <div className="py-16 text-center text-muted-foreground text-sm">
          {search
            ? "No se encontraron proveedores con esa búsqueda."
            : "No hay proveedores registrados aún. Agrega el primero."}
        </div>
      )}

      {/* Suppliers table */}
      {!loading && !error && filtered.length > 0 && (
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
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground whitespace-nowrap">
                  Fecha de alta
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((prov, index) => (
                <tr
                  key={prov.id}
                  className={`border-b border-border last:border-0 transition-colors hover:bg-muted/40 cursor-pointer ${
                    index % 2 === 0 ? "bg-background" : "bg-muted/10"
                  }`}
                  onClick={() => {
                    setSelectedProveedor(prov);
                    setModalOpen(true);
                  }}
                >
                  <td className="px-4 py-3 font-medium">{prov.nombre}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {prov.correo || "—"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                    {prov.numero || "—"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground max-w-xs truncate">
                    {prov.direccion || "—"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                    {new Date(prov.created_at).toLocaleDateString("es-MX", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Create Supplier Panel ── */}
      <Sheet open={panelOpen} onOpenChange={setPanelOpen}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-[440px] flex flex-col p-0"
        >
          <SheetHeader className="px-6 pt-6 pb-4 border-b">
            <SheetTitle className="text-lg font-semibold">
              Nuevo proveedor
            </SheetTitle>
            <SheetDescription className="text-sm text-muted-foreground">
              Completa los campos para agregar un proveedor.
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="prov-nombre">
                Nombre <span className="text-destructive">*</span>
              </Label>
              <Input
                id="prov-nombre"
                placeholder="Ej. TintaMax"
                value={form.nombre}
                onChange={(e) =>
                  setForm((f) => ({ ...f, nombre: e.target.value }))
                }
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="prov-correo">Correo electrónico</Label>
              <Input
                id="prov-correo"
                type="email"
                placeholder="ventas@ejemplo.com"
                value={form.correo}
                onChange={(e) =>
                  setForm((f) => ({ ...f, correo: e.target.value }))
                }
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="prov-numero">Teléfono</Label>
              <Input
                id="prov-numero"
                placeholder="+52 55 1234-5678"
                value={form.numero}
                onChange={(e) =>
                  setForm((f) => ({ ...f, numero: e.target.value }))
                }
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="prov-direccion">Dirección</Label>
              <Textarea
                id="prov-direccion"
                placeholder="Av. Reforma 123, Ciudad de México"
                rows={2}
                value={form.direccion}
                onChange={(e) =>
                  setForm((f) => ({ ...f, direccion: e.target.value }))
                }
                className="resize-none"
              />
            </div>

            {formError && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-2.5 text-destructive text-sm">
                {formError}
              </div>
            )}
          </div>

          <SheetFooter className="px-6 py-4 border-t">
            <Button
              className="w-full"
              disabled={!form.nombre.trim() || saving}
              onClick={handleCreate}
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                "Agregar proveedor"
              )}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* ── Supplier Detail Modal ── */}
      <ProveedorDetailModal
        proveedor={selectedProveedor}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onDelete={handleDelete}
        onUpdate={handleUpdate}
      />
    </div>
  );
}
