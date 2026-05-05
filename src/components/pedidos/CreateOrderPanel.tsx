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
import { pedidosColumns } from "@/data/mockData";
import { KanbanCard } from "@/data/mockData";

interface CreateOrderPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateOrder: (card: KanbanCard, etapa: string) => void;
}

interface OrderForm {
  nombre: string;
  cliente: string;
  descripcion: string;
  ingreso: string;
  etapa: string;
  fechaEntrega: string;
  prioridad: string;
}

const emptyForm: OrderForm = {
  nombre: "",
  cliente: "",
  descripcion: "",
  ingreso: "",
  etapa: "en_cola",
  fechaEntrega: "",
  prioridad: "media",
};

export default function CreateOrderPanel({ open, onOpenChange, onCreateOrder }: CreateOrderPanelProps) {
  const [form, setForm] = useState<OrderForm>(emptyForm);

  const isValid =
    form.nombre.trim() !== "" &&
    form.cliente.trim() !== "" &&
    form.descripcion.trim() !== "" &&
    form.ingreso.trim() !== "" &&
    form.etapa !== "" &&
    form.fechaEntrega !== "" &&
    form.prioridad !== "";

  function handleChange(field: keyof OrderForm, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit() {
    const newCard: KanbanCard = {
      id: `order-${Date.now()}`,
      title: form.nombre.trim(),
      client: form.cliente.trim(),
      quantity: 0,
      priority: form.prioridad as "baja" | "media" | "alta",
      dueDate: form.fechaEntrega,
      ingreso: parseFloat(form.ingreso),
      descripcion: form.descripcion.trim(),
    };
    onCreateOrder(newCard, form.etapa);
    setForm(emptyForm);
    onOpenChange(false);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-[440px] flex flex-col p-0">
        {/* Header */}
        <SheetHeader className="px-6 pt-6 pb-4 border-b">
          <SheetTitle className="text-lg font-semibold">Nuevo pedido</SheetTitle>
          <SheetDescription className="text-sm text-muted-foreground">
            Completa los campos para agregar un pedido al tablero.
          </SheetDescription>
        </SheetHeader>

        {/* Form */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Nombre del pedido */}
          <div className="space-y-1.5">
            <Label htmlFor="order-nombre">
              Nombre del pedido <span className="text-destructive">*</span>
            </Label>
            <Input
              id="order-nombre"
              placeholder="Ej. 200 camisetas corporativas"
              value={form.nombre}
              onChange={(e) => handleChange("nombre", e.target.value)}
            />
          </div>

          {/* Cliente */}
          <div className="space-y-1.5">
            <Label htmlFor="order-cliente">
              Cliente <span className="text-destructive">*</span>
            </Label>
            <Input
              id="order-cliente"
              placeholder="Ej. Tech Solutions"
              value={form.cliente}
              onChange={(e) => handleChange("cliente", e.target.value)}
            />
          </div>

          {/* Descripción */}
          <div className="space-y-1.5">
            <Label htmlFor="order-descripcion">
              Descripción <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="order-descripcion"
              placeholder="Describe el pedido brevemente..."
              rows={3}
              value={form.descripcion}
              onChange={(e) => handleChange("descripcion", e.target.value)}
              className="resize-none"
            />
          </div>

          {/* Ingreso esperado */}
          <div className="space-y-1.5">
            <Label htmlFor="order-ingreso">
              Valor del pedido (MXN) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="order-ingreso"
              type="number"
              min={0}
              placeholder="Ej. 15000"
              value={form.ingreso}
              onChange={(e) => handleChange("ingreso", e.target.value)}
            />
          </div>

          {/* Etapa */}
          <div className="space-y-1.5">
            <Label htmlFor="order-etapa">
              Etapa del pedido <span className="text-destructive">*</span>
            </Label>
            <Select
              value={form.etapa}
              onValueChange={(val) => handleChange("etapa", val)}
            >
              <SelectTrigger id="order-etapa">
                <SelectValue placeholder="Selecciona una etapa" />
              </SelectTrigger>
              <SelectContent>
                {pedidosColumns.map((col) => (
                  <SelectItem key={col.id} value={col.id}>
                    {col.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Fecha de entrega */}
          <div className="space-y-1.5">
            <Label htmlFor="order-fecha">
              Fecha de entrega <span className="text-destructive">*</span>
            </Label>
            <Input
              id="order-fecha"
              type="date"
              value={form.fechaEntrega}
              onChange={(e) => handleChange("fechaEntrega", e.target.value)}
            />
          </div>

          {/* Nivel de prioridad */}
          <div className="space-y-1.5">
            <Label htmlFor="order-prioridad">
              Nivel de prioridad <span className="text-destructive">*</span>
            </Label>
            <Select
              value={form.prioridad}
              onValueChange={(val) => handleChange("prioridad", val)}
            >
              <SelectTrigger id="order-prioridad">
                <SelectValue placeholder="Selecciona una prioridad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="baja">🟢 Baja</SelectItem>
                <SelectItem value="media">🟡 Media</SelectItem>
                <SelectItem value="alta">🔴 Alta</SelectItem>
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
            Crear pedido
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
