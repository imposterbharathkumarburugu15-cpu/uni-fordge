import { CloudUpload, FilePlus2, X } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { intakeService } from "@/services/intakeService";
import type { SourceType } from "@/types/domain";

const SOURCE_TYPES: SourceType[] = [
  "CATALOGUE",
  "DATASHEET",
  "SPECIFICATION",
  "MATERIAL_GUIDE",
  "PRICEBOOK",
  "SAFETY_SHEET",
  "BOM",
];

interface PendingFile {
  name: string;
  size: number;
}

interface UploadZoneProps {
  suppliers: Array<{ id: string; name: string; code: string }>;
  onQueued: (count: number) => void;
}

/** INTAKE — bring messy supplier sources into UniForge. */
export function UploadZone({ suppliers, onQueued }: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<PendingFile[]>([]);
  const [supplierId, setSupplierId] = useState(suppliers[0]?.id ?? "");
  const [sourceType, setSourceType] = useState<SourceType>("CATALOGUE");
  const [dragging, setDragging] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const addFiles = (list: FileList | null) => {
    if (!list) return;
    const next = Array.from(list).map((f) => ({ name: f.name, size: f.size }));
    setFiles((prev) => [...prev, ...next]);
  };

  const handleQueue = async () => {
    if (files.length === 0) return;
    setSubmitting(true);
    const ids = await intakeService.enqueue(
      files.map((f) => ({
        filename: f.name,
        type: sourceType,
        supplierId,
        sizeBytes: f.size || Math.max(1024, (f.name.length * 4096) % 4_000_000),
      })),
    );
    setSubmitting(false);
    if (ids.length > 0) {
      setFiles([]);
      onQueued(ids.length);
      toast.success(`${ids.length} source${ids.length > 1 ? "s" : ""} queued for ingestion`);
    }
  };

  return (
    <div className="uf-panel overflow-hidden">
      <div className="uf-panel-head">
        <h2 className="uf-section-title">
          <span className="idx">01</span>
          New Source Intake
        </h2>
        <span className="uf-mono hidden text-[10px] uppercase tracking-[0.12em] text-[var(--uf-text-tertiary)] sm:inline">
          PDF · XLSX · CSV · XML
        </span>
      </div>

      <div className="grid gap-4 p-4 lg:grid-cols-[1fr_320px]">
        {/* Drop zone */}
        <div
          className={`flex min-h-[160px] cursor-pointer flex-col items-center justify-center rounded-md border border-dashed p-6 text-center transition-colors ${
            dragging
              ? "border-[var(--uf-accent)] bg-[var(--uf-accent-dim)]"
              : "border-[var(--uf-border-strong)] hover:border-[var(--uf-accent-line)]"
          }`}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            addFiles(e.dataTransfer.files);
          }}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
          }}
          aria-label="Drop supplier documents or click to browse"
        >
          <CloudUpload className="size-8 text-[var(--uf-accent)]" aria-hidden />
          <p className="mt-3 text-[14px] font-medium text-[var(--uf-text-primary)]">
            Drop supplier documents here
          </p>
          <p className="mt-1 text-[12px] text-[var(--uf-text-tertiary)]">
            or click to browse — catalogues, datasheets, engineering specs, pricebooks
          </p>
          <input
            ref={inputRef}
            type="file"
            multiple
            className="sr-only"
            onChange={(e) => addFiles(e.target.files)}
          />
        </div>

        {/* Configuration + queue */}
        <div className="flex flex-col gap-3">
          <div>
            <label
              htmlFor="intake-supplier"
              className="uf-mono mb-1.5 block text-[9.5px] uppercase tracking-[0.12em] text-[var(--uf-text-tertiary)]"
            >
              Supplier
            </label>
            <Select value={supplierId} onValueChange={setSupplierId}>
              <SelectTrigger
                id="intake-supplier"
                className="w-full border-[var(--uf-border)] bg-[var(--uf-surface)] text-[var(--uf-text-primary)]"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-[var(--uf-border-strong)] bg-[var(--uf-surface-raised)] text-[var(--uf-text-primary)]">
                {suppliers.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name} · {s.code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label
              htmlFor="intake-type"
              className="uf-mono mb-1.5 block text-[9.5px] uppercase tracking-[0.12em] text-[var(--uf-text-tertiary)]"
            >
              Source type
            </label>
            <Select value={sourceType} onValueChange={(v) => setSourceType(v as SourceType)}>
              <SelectTrigger
                id="intake-type"
                className="w-full border-[var(--uf-border)] bg-[var(--uf-surface)] text-[var(--uf-text-primary)]"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-[var(--uf-border-strong)] bg-[var(--uf-surface-raised)] text-[var(--uf-text-primary)]">
                {SOURCE_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t.replace(/_/g, " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            type="button"
            onClick={handleQueue}
            disabled={files.length === 0 || submitting}
            className="mt-auto h-10 rounded-sm bg-[var(--uf-accent)] text-[13px] font-semibold text-[var(--uf-primary-foreground)] hover:bg-[var(--uf-accent-bright)] disabled:opacity-40"
          >
            <FilePlus2 className="size-4" aria-hidden />
            {submitting ? "Queuing…" : `Queue ${files.length} file${files.length === 1 ? "" : "s"}`}
          </Button>
        </div>
      </div>

      {files.length > 0 && (
        <div className="border-t border-[var(--uf-border-faint)] px-4 py-3">
          <p className="uf-mono mb-2 text-[9.5px] uppercase tracking-[0.12em] text-[var(--uf-text-tertiary)]">
            Pending ({files.length})
          </p>
          <ul className="flex flex-wrap gap-2">
            {files.map((f, i) => (
              <li
                key={`${f.name}-${i}`}
                className="flex items-center gap-2 rounded-sm border border-[var(--uf-border)] bg-[var(--uf-surface)] px-2.5 py-1.5"
              >
                <span className="uf-mono text-[11px] text-[var(--uf-text-secondary)]">{f.name}</span>
                <button
                  type="button"
                  onClick={() => setFiles((prev) => prev.filter((_, idx) => idx !== i))}
                  className="text-[var(--uf-text-tertiary)] transition-colors hover:text-[var(--uf-critical)]"
                  aria-label={`Remove ${f.name}`}
                >
                  <X className="size-3.5" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
