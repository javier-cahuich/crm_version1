import { useState, useRef } from "react";
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
import { Loader2, ImagePlus, X } from "lucide-react";
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
  url_adjunto: string | null;
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

  const imgInputRef = useRef<HTMLInputElement>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

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

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  function removeImage() {
    setImageFile(null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
  }

  async function uploadImage(tratoId: string): Promise<string | null> {
    if (!imageFile) return null;
    setUploading(true);

    const ext = imageFile.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const filePath = `tratos/${tratoId}/${Date.now()}.${ext}`;

    const { error: upErr } = await supabase.storage
      .from("adjuntos")
      .upload(filePath, imageFile, { upsert: true });

    if (upErr) {
      setUploading(false);
      return null;
    }

    const { data: urlData } = supabase.storage
      .from("adjuntos")
      .getPublicUrl(filePath);

    setUploading(false);
    return urlData?.publicUrl ?? null;
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

    let url_adjunto: string | null = null;
    if (imageFile && data) {
      url_adjunto = await uploadImage((data as TratoDB).id);
      if (url_adjunto) {
        await supabase
          .from("tratos")
          .update({ url_adjunto })
          .eq("id", (data as TratoDB).id);
      }
    }

    onDealCreated({ ...(data as TratoDB), url_adjunto } as TratoDB);
    setForm(emptyForm);
    removeImage();
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

          {/* Imagen adjunta */}
          <div className="space-y-1.5">
            <Label>Imagen adjunta</Label>
            <input
              ref={imgInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.webp"
              className="hidden"
              onChange={handleImageSelect}
            />
            {imagePreview ? (
              <div className="relative rounded-lg border border-border overflow-hidden bg-muted/30">
                <img
                  src={imagePreview}
                  alt="Vista previa"
                  className="w-full h-40 object-contain"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 p-1 rounded-md bg-background/80 border border-border text-muted-foreground hover:text-destructive hover:border-destructive/50 transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => imgInputRef.current?.click()}
                className="w-full border-2 border-dashed border-border rounded-lg p-5 flex flex-col items-center justify-center gap-1.5 text-center text-muted-foreground bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer"
              >
                <ImagePlus className="h-6 w-6 opacity-50" />
                <span className="text-xs font-medium">Haz clic para seleccionar imagen</span>
                <span className="text-[10px] opacity-60">JPG, PNG, WebP</span>
              </button>
            )}
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
            disabled={!isValid || saving || uploading}
            onClick={handleSubmit}
          >
            {saving || uploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {uploading ? "Subiendo imagen..." : "Guardando..."}
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
