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

import { KanbanCard } from "@/data/mockData";

interface CreateDealPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateDeal: (card: KanbanCard, etapa: string) => void;
}

interface DealForm {
  nombre: string;
  cliente: string;
  descripcion: string;
  ingreso: string;
  etapa: string;
}

const emptyForm: DealForm = {
  nombre: "",
  cliente: "",
  descripcion: "",
  ingreso: "",
  etapa: "lead",
};

export default function CreateDealPanel({ open, onOpenChange, onCreateDeal }: CreateDealPanelProps) {
  const [form, setForm] = useState<DealForm>(emptyForm);

  const isValid =
    form.nombre.trim() !== "" &&
    form.cliente.trim() !== "" &&
    form.descripcion.trim() !== "" &&
    form.ingreso.trim() !== "" &&
    form.etapa !== "";

  function handleChange(field: keyof DealForm, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit() {
    const newCard: KanbanCard = {
      id: `deal-${Date.now()}`,
      title: form.nombre.trim(),
      client: form.cliente.trim(),
      quantity: 0,
      priority: "media",
      dueDate: new Date().toISOString().split("T")[0],
      ingreso: parseFloat(form.ingreso),
      descripcion: form.descripcion.trim(),
    };
    onCreateDeal(newCard, form.etapa);
    setForm(emptyForm);
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

          {/* Cliente */}
          <div className="space-y-1.5">
            <Label htmlFor="deal-cliente">
              Cliente <span className="text-destructive">*</span>
            </Label>
            <Input
              id="deal-cliente"
              placeholder="Ej. Tech Solutions"
              value={form.cliente}
              onChange={(e) => handleChange("cliente", e.target.value)}
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
        </div>

        {/* Footer */}
        <SheetFooter className="px-6 py-4 border-t">
          <Button
            className="w-full"
            disabled={!isValid}
            onClick={handleSubmit}
          >
            Crear trato
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
