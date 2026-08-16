import { Command as CmdIcon, Scale, Box, FileText } from "lucide-react";
import { useNavigate } from "react-router";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { MODULES } from "@/app/config/modules";
import {
  useConflicts,
  useProducts,
  useSources,
} from "@/hooks/use-forge-store";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const navigate = useNavigate();
  const products = useProducts();
  const conflicts = useConflicts();
  const sources = useSources();
  const openConflicts = conflicts.filter((c) => c.status === "OPEN");

  const go = (path: string) => {
    onOpenChange(false);
    navigate(path);
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <Command className="bg-[var(--uf-surface-raised)] text-[var(--uf-text-primary)]">
        <div className="flex items-center gap-2 border-b border-[var(--uf-border-faint)] px-3">
          <CmdIcon className="size-4 text-[var(--uf-text-tertiary)]" aria-hidden />
          <CommandInput
            placeholder="Search products, MPNs, sources, conflicts…"
            className="h-11 border-0 bg-transparent text-sm focus:ring-0 focus-visible:ring-0"
          />
        </div>
        <CommandList>
          <CommandEmpty className="py-8 text-center">
            <span className="uf-mono text-[11px] uppercase tracking-[0.12em] text-[var(--uf-text-tertiary)]">
              No records match
            </span>
          </CommandEmpty>
          <CommandGroup heading="MODULES">
            {MODULES.map((m) => (
              <CommandItem
                key={m.id}
                value={`module ${m.label}`}
                onSelect={() => go(m.path)}
                className="flex items-center gap-2.5"
              >
                <span className="uf-mono text-[10px] text-[var(--uf-accent)]">{m.index}</span>
                <span className="uf-mono text-[11.5px] tracking-[0.06em]">{m.label}</span>
                <span className="ml-auto text-[11px] text-[var(--uf-text-tertiary)]">
                  {m.description}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="PRODUCTS">
            {products.slice(0, 12).map((p) => (
              <CommandItem
                key={p.id}
                value={`product ${p.mpn} ${p.name} ${p.id}`}
                onSelect={() => go(`/product/${p.id}`)}
                className="flex items-center gap-2.5"
              >
                <Box className="size-3.5 text-[var(--uf-accent)]" aria-hidden />
                <span className="uf-mono text-[12px]">{p.mpn}</span>
                <span className="text-[13px] text-[var(--uf-text-secondary)]">{p.name}</span>
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="OPEN CONFLICTS">
            {openConflicts.slice(0, 6).map((c) => (
              <CommandItem
                key={c.id}
                value={`conflict ${c.id} ${c.attributeLabel}`}
                onSelect={() => go(`/resolve?conflict=${c.id}`)}
                className="flex items-center gap-2.5"
              >
                <Scale className="size-3.5 text-[var(--uf-warning)]" aria-hidden />
                <span className="uf-mono text-[12px]">{c.id}</span>
                <span className="text-[13px] text-[var(--uf-text-secondary)]">
                  {c.productId} · {c.attributeLabel}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="SOURCES">
            {sources.slice(0, 8).map((s) => (
              <CommandItem
                key={s.id}
                value={`source ${s.filename} ${s.id}`}
                onSelect={() => go("/intake")}
                className="flex items-center gap-2.5"
              >
                <FileText className="size-3.5 text-[var(--uf-text-tertiary)]" aria-hidden />
                <span className="uf-mono text-[12px]">{s.filename}</span>
                <span className="ml-auto text-[11px] text-[var(--uf-text-tertiary)]">
                  {s.status}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  );
}
