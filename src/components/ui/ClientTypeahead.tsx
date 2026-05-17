import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { Search, Loader2, User } from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────────

interface ClienteResult {
  id: string;
  nombre: string;
  correo: string;
}

interface ClientTypeaheadProps {
  /** Called when a client is selected — passes the UUID */
  onSelect: (clienteId: string, clienteNombre: string) => void;
  /** Optional: pre-selected client name (for edit mode) */
  initialValue?: string;
  /** Optional: HTML id for the input */
  id?: string;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function ClientTypeahead({
  onSelect,
  initialValue = "",
  id,
}: ClientTypeaheadProps) {
  const [query, setQuery] = useState(initialValue);
  const [results, setResults] = useState<ClienteResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(!!initialValue);

  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Search clientes in Supabase with debounce ────────────────────────────

  useEffect(() => {
    // Don't search if the user just selected a client
    if (selected) return;

    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }

    // Debounce: wait 300ms after the user stops typing
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("clientes")
        .select("id, nombre, correo")
        .ilike("nombre", `%${trimmed}%`)
        .order("nombre")
        .limit(8);

      if (!error && data) {
        setResults(data as ClienteResult[]);
        setOpen(data.length > 0);
      } else {
        setResults([]);
        setOpen(false);
      }
      setLoading(false);
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, selected]);

  // ── Close dropdown when clicking outside ─────────────────────────────────

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ── Handlers ─────────────────────────────────────────────────────────────

  function handleSelect(cliente: ClienteResult) {
    setQuery(cliente.nombre);
    setSelected(true);
    setOpen(false);
    onSelect(cliente.id, cliente.nombre);
  }

  function handleInputChange(value: string) {
    setQuery(value);
    setSelected(false);
    // Reset the parent selection when the user modifies the text
    if (value.trim() === "") {
      onSelect("", "");
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div ref={containerRef} className="relative">
      {/* Input with search icon */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          id={id}
          placeholder="Buscar cliente por nombre..."
          className="pl-9 pr-9"
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => {
            if (results.length > 0 && !selected) setOpen(true);
          }}
          autoComplete="off"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin" />
        )}
      </div>

      {/* Dropdown results */}
      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-border bg-popover shadow-lg overflow-hidden animate-in fade-in-0 zoom-in-95 duration-100">
          <ul className="max-h-56 overflow-y-auto py-1">
            {results.map((cliente) => (
              <li key={cliente.id}>
                <button
                  type="button"
                  className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-accent/60 focus:bg-accent/60 focus:outline-none"
                  onClick={() => handleSelect(cliente)}
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0">
                    <User className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{cliente.nombre}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {cliente.correo}
                    </p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
