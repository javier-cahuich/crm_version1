import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  MessageSquare,
  Mail,
  Phone,
  Send,
  ExternalLink,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

interface ContactClientModalProps {
  open: boolean;
  onClose: () => void;
  clienteNombre: string;
  clienteCorreo?: string;
  clienteNumero?: string;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function ContactClientModal({
  open,
  onClose,
  clienteNombre,
  clienteCorreo,
  clienteNumero,
}: ContactClientModalProps) {
  const [mensaje, setMensaje] = useState("");

  // Clean phone number for WhatsApp link (remove spaces, dashes, etc.)
  const cleanNumber = clienteNumero
    ?.replace(/[\s\-\(\)]/g, "")
    .replace(/^\+/, "") ?? "";

  function handleSendEmail() {
    if (!clienteCorreo) return;
    const subject = encodeURIComponent("Actualización de tu proyecto");
    const body = encodeURIComponent(mensaje);
    window.open(`mailto:${clienteCorreo}?subject=${subject}&body=${body}`);
  }

  function handleWhatsApp() {
    if (!cleanNumber) return;
    const text = encodeURIComponent(mensaje || `Hola ${clienteNombre}, te contactamos por tu proyecto.`);
    window.open(`https://wa.me/${cleanNumber}?text=${text}`, "_blank");
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md w-full p-0 gap-0 overflow-hidden rounded-xl" hideCloseButton>
        {/* ── Header ── */}
        <DialogHeader className="px-5 pt-5 pb-4 border-b border-border space-y-0">
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary shrink-0">
              <Phone className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <DialogTitle className="text-base font-bold leading-snug">
                Contactar cliente
              </DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                {clienteNombre}
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* ── Cuerpo ── */}
        <div className="px-5 py-5 space-y-5">
          {/* Teléfono / WhatsApp */}
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5 text-sm font-semibold">
              <MessageSquare className="h-4 w-4 text-emerald-600" />
              Teléfono / WhatsApp
            </Label>
            {clienteNumero ? (
              <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 px-4 py-3">
                <span className="text-sm font-medium flex-1">
                  {clienteNumero}
                </span>
                <Button
                  size="sm"
                  className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white h-8"
                  onClick={handleWhatsApp}
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  WhatsApp
                </Button>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                Sin número registrado
              </p>
            )}
          </div>

          {/* Correo electrónico */}
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5 text-sm font-semibold">
              <Mail className="h-4 w-4 text-blue-600" />
              Correo electrónico
            </Label>
            {clienteCorreo ? (
              <div className="rounded-lg border border-border bg-muted/30 px-4 py-3">
                <span className="text-sm font-medium">{clienteCorreo}</span>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                Sin correo registrado
              </p>
            )}
          </div>

          {/* Redactar mensaje */}
          <div className="space-y-2">
            <Label htmlFor="contact-mensaje" className="text-sm font-semibold">
              Redactar mensaje
            </Label>
            <Textarea
              id="contact-mensaje"
              placeholder={`Hola ${clienteNombre}, te escribo para informarte sobre el avance de tu proyecto...`}
              rows={4}
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
              className="resize-none"
            />
            <p className="text-[11px] text-muted-foreground">
              Este mensaje se usará como cuerpo del correo y como texto de WhatsApp.
            </p>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="px-5 py-3 border-t border-border flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cerrar
          </Button>
          {clienteCorreo && (
            <Button
              size="sm"
              className="gap-1.5"
              disabled={!mensaje.trim()}
              onClick={handleSendEmail}
            >
              <Send className="h-3.5 w-3.5" />
              Enviar correo
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
