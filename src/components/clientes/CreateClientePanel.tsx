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
import { Loader2, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { isValidEmail, isValidPhone } from "@/lib/validation";

// ── Types ──────────────────────────────────────────────────────────────────────

export interface ClienteDB {
  id: string;
  nombre: string;
  correo: string;
  numero: string | null;
  direccion: string | null;
  created_at: string | null;
}

interface CreateClientePanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClienteCreado: (cliente: ClienteDB) => void;
}

interface ClienteForm {
  nombre: string;
  correo: string;
  telefono: string;
  direccion: string;
}

const emptyForm: ClienteForm = {
  nombre: "",
  correo: "",
  telefono: "",
  direccion: "",
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function CreateClientePanel({
  open,
  onOpenChange,
  onClienteCreado,
}: CreateClientePanelProps) {
  const [form, setForm] = useState<ClienteForm>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const correoTrimmed = form.correo.trim();
  const correoInvalid =
    correoTrimmed !== "" && !isValidEmail(form.correo);

  const telefonoTrimmed = form.telefono.trim();
  const telefonoInvalid =
    telefonoTrimmed !== "" && !isValidPhone(form.telefono);

  const isValid =
    form.nombre.trim() !== "" &&
    correoTrimmed !== "" &&
    isValidEmail(form.correo) &&
    telefonoTrimmed !== "" &&
    isValidPhone(form.telefono) &&
    form.direccion.trim() !== "";

  function handleChange(field: keyof ClienteForm, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (field === "correo" || field === "telefono") setSubmitError(null);
  }

  async function handleSubmit() {
    if (!isValidEmail(form.correo)) {
      setSubmitError("Introduce un correo electrónico válido (ej. nombre@dominio.com).");
      return;
    }
    if (!isValidPhone(form.telefono)) {
      setSubmitError(
        "Introduce un teléfono válido de 10 dígitos (ej. 9811234567) o con código de país +52.",
      );
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    const { data, error } = await supabase
      .from("clientes")
      .insert({
        nombre: form.nombre.trim(),
        correo: form.correo.trim(),
        numero: form.telefono.trim(),
        direccion: form.direccion.trim(),
      })
      .select("id, nombre, correo, numero, direccion, created_at")
      .single();

    setSubmitting(false);

    if (error) {
      setSubmitError(error.message);
      return;
    }

    onClienteCreado(data as ClienteDB);
    setForm(emptyForm);
    setSubmitError(null);
    onOpenChange(false);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-[440px] flex flex-col p-0">
        {/* Header */}
        <SheetHeader className="px-6 pt-6 pb-4 border-b">
          <SheetTitle className="text-lg font-semibold">Nuevo cliente</SheetTitle>
          <SheetDescription className="text-sm text-muted-foreground">
            Completa los campos para registrar un nuevo cliente.
          </SheetDescription>
        </SheetHeader>

        {/* Form */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Nombre */}
          <div className="space-y-1.5">
            <Label htmlFor="cliente-nombre">
              Nombre del cliente <span className="text-destructive">*</span>
            </Label>
            <Input
              id="cliente-nombre"
              placeholder="Ej. María García"
              value={form.nombre}
              onChange={(e) => handleChange("nombre", e.target.value)}
            />
          </div>

          {/* Correo */}
          <div className="space-y-1.5">
            <Label htmlFor="cliente-correo">
              Correo <span className="text-destructive">*</span>
            </Label>
            <Input
              id="cliente-correo"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="Ej. maria@ejemplo.com"
              value={form.correo}
              aria-invalid={correoInvalid}
              className={cn(correoInvalid && "border-destructive focus-visible:ring-destructive")}
              onChange={(e) => handleChange("correo", e.target.value)}
            />
            {correoInvalid && (
              <p className="text-xs text-destructive">
                Introduce un correo electrónico válido (ej. nombre@dominio.com).
              </p>
            )}
          </div>

          {/* Teléfono */}
          <div className="space-y-1.5">
            <Label htmlFor="cliente-telefono">
              Teléfono <span className="text-destructive">*</span>
            </Label>
            <Input
              id="cliente-telefono"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="Ej. 9811234567"
              value={form.telefono}
              aria-invalid={telefonoInvalid}
              className={cn(telefonoInvalid && "border-destructive focus-visible:ring-destructive")}
              onChange={(e) => handleChange("telefono", e.target.value)}
            />
            {telefonoInvalid && (
              <p className="text-xs text-destructive">
                Introduce un teléfono válido de 10 dígitos (ej. 9811234567) o con código +52.
              </p>
            )}
          </div>

          {/* Dirección */}
          <div className="space-y-1.5">
            <Label htmlFor="cliente-direccion">
              Dirección <span className="text-destructive">*</span>
            </Label>
            <Input
              id="cliente-direccion"
              placeholder="Ej. Av. Central 123, Campeche"
              value={form.direccion}
              onChange={(e) => handleChange("direccion", e.target.value)}
            />
          </div>
        </div>

        {/* Submit error */}
        {submitError && (
          <div className="mx-6 mb-2 flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-destructive text-xs">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            <span>{submitError}</span>
          </div>
        )}

        {/* Footer */}
        <SheetFooter className="px-6 py-4 border-t">
          <Button
            className="w-full"
            disabled={!isValid || submitting}
            onClick={handleSubmit}
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              "Añadir cliente"
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
