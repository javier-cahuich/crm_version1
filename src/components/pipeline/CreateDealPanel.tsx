import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
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
import { kanbanColumns } from "@/data/mockData";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import ClientTypeahead from "@/components/ui/ClientTypeahead";

// ── Types ─────────────────────────────────────────────────────────────────────

/** Row shape returned by a Supabase query on `tratos` (with joined clientes). */
export interface TratoDB {
  id: string;
  nombre_trato: string;
  cliente_id: string | null;
  descripcion: string | null;
  ingreso_esperado: number | null;
  etapa_trato: string | null;
  created_at: string;
  // Joined from clientes
  clientes?: { nombre: string; correo?: string; numero?: string } | null;
}

interface CreateDealPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDealCreated: (trato: TratoDB) => void;
}

interface DealForm {
  nombre: string;
  clienteId: string;
  clienteNombre: string;
  descripcion: string;
  ingreso: string;
  etapa: string;
}

const emptyForm: DealForm = {
  nombre: "",
  clienteId: "",
  clienteNombre: "",
  descripcion: "",
  ingreso: "",
  etapa: "lead",
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function CreateDealPanel({
  open,
  onOpenChange,
  onDealCreated,
}: CreateDealPanelProps) {
  const [form, setForm] = useState<DealForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isValid =
    form.nombre.trim() !== "" &&
    form.clienteId !== "" &&
    form.descripcion.trim() !== "" &&
    form.ingreso.trim() !== "" &&
    form.etapa !== "";

  function handleChange(field: keyof DealForm, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleClientSelect(id: string, nombre: string) {
    setForm((prev) => ({ ...prev, clienteId: id, clienteNombre: nombre }));
  }

  async function handleSubmit() {
    if (!isValid || saving) return;

    setSaving(true);
    setError(null);

    const { data, error: sbError } = await supabase
      .from("tratos")
      .insert({
        nombre_trato: form.nombre.trim(),
        cliente_id: form.clienteId,
        descripcion: form.descripcion.trim(),
        ingreso_esperado: parseFloat(form.ingreso),
        etapa_trato: form.etapa,
      })
      .select("*, clientes(nombre, correo, numero)")
      .single();

    if (sbError) {
      setError(sbError.message);
      setSaving(false);
      return;
    }

    onDealCreated(data as TratoDB);
    setForm(emptyForm);
    setSaving(false);
    onOpenChange(false);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-[440px] flex flex-col p-0">
        {/* Header */}
        <SheetHeader className="px-6 pt-6 pb-4 border-b">
          <SheetTitle className="text-lg font-semibold">Nuevo trato</SheetTitle>
          <SheetDescription className="text-sm text-muted-foreground">
            Completa los campos para agregar un trato al pipeline.
          </SheetDescription>
        </SheetHeader>

        {/* Form */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Nombre del trato */}
          <div className="space-y-1.5">
            <Label htmlFor="deal-nombre">
              Nombre del trato <span className="text-destructive">*</span>
            </Label>
            <Input
              id="deal-nombre"
              placeholder="Ej. 200 camisetas corporativas"
              value={form.nombre}
              onChange={(e) => handleChange("nombre", e.target.value)}
            />
          </div>

          {/* Cliente — Typeahead con búsqueda real en Supabase */}
          <div className="space-y-1.5">
            <Label htmlFor="deal-cliente">
              Cliente <span className="text-destructive">*</span>
            </Label>
            <ClientTypeahead
              id="deal-cliente"
              onSelect={handleClientSelect}
              key={open ? "open" : "closed"} // reset when panel re-opens
            />
          </div>

          {/* Descripción */}
          <div className="space-y-1.5">
            <Label htmlFor="deal-descripcion">
              Descripción <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="deal-descripcion"
              placeholder="Describe el trato brevemente..."
              rows={3}
              value={form.descripcion}
              onChange={(e) => handleChange("descripcion", e.target.value)}
              className="resize-none"
            />
          </div>

          {/* Ingreso esperado */}
          <div className="space-y-1.5">
            <Label htmlFor="deal-ingreso">
              Ingreso esperado (MXN) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="deal-ingreso"
              type="number"
              min={0}
              placeholder="Ej. 15000"
              value={form.ingreso}
              onChange={(e) => handleChange("ingreso", e.target.value)}
            />
          </div>

          {/* Etapa */}
          <div className="space-y-1.5">
            <Label htmlFor="deal-etapa">
              Etapa del trato <span className="text-destructive">*</span>
            </Label>
            <Select
              value={form.etapa}
              onValueChange={(val) => handleChange("etapa", val)}
            >
              <SelectTrigger id="deal-etapa">
                <SelectValue placeholder="Selecciona una etapa" />
              </SelectTrigger>
              <SelectContent>
                {kanbanColumns.map((col) => (
                  <SelectItem key={col.id} value={col.id}>
                    {col.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Error message */}
          {error && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-2.5 text-destructive text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <SheetFooter className="px-6 py-4 border-t">
          <Button
            className="w-full"
            disabled={!isValid || saving}
            onClick={handleSubmit}
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Guardando...
              </>
            ) : (
              "Crear trato"
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
