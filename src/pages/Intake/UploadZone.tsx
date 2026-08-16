import { CloudDownload, FilePlus2, X } from "lucide-react";
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

/** Sample catalogue the USE SAMPLE DATA action queues for inspection. */
const SAMPLE_FILES: Array<{
  filename: string;
  type: SourceType;
  supplierId: string;
  sizeBytes: number;
}> = [
  {
    filename: "vandal_catalogue_2026.csv",
    type: "CATALOGUE",
    supplierId: "SUP-VND",
    sizeBytes: 2_846_000,
  },
  {
    filename: "precision_valve_datasheet_2026.pdf",
    type: "DATASHEET",
    supplierId: "SUP-PVF",
    sizeBytes: 1_204_000,
  },
];

interface PendingFile {
  name: string;
  size: number;
}

interface UploadZoneProps {
  suppliers: Array<{ id: string; name: string; code: string }>;
  onQueued: (count: number) => void;
}

const CLIP = "polygon(14px 0, calc(100% - 14px) 0, 100% 14px, 100% calc(100% - 14px), calc(100% - 14px) 100%, 14px 100%, 0 calc(100% - 14px), 0 14px)";

/** INTAKE — the reference drop-zone hero. Glowing intake port with circuit decals. */
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

  const openPicker = () => inputRef.current?.click();

  const handleQueue = async () => {
    if (files.length === 0 || submitting) return;
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

  const handleSample = async () => {
    if (submitting) return;
    setSubmitting(true);
    const ids = await intakeService.enqueue(SAMPLE_FILES);
    setSubmitting(false);
    if (ids.length > 0) {
      onQueued(ids.length);
      toast.success("Sample catalogue queued — 2 sources ready for inspection");
    }
  };

  const borderGlow = dragging
    ? "linear-gradient(135deg, rgba(55,199,234,0.9), rgba(55,199,234,0.35))"
    : "linear-gradient(135deg, rgba(55,199,234,0.45), rgba(55,199,234,0.12))";

  return (
    <div>
      <div className="relative">
        {/* floating attribute decals — circuit feeds into the intake port */}
        <div className="absolute -top-10 left-0 z-10 hidden flex-col gap-2 lg:flex" aria-hidden>
          <Decal label="PART_NUMBER" value="NSM-440-T" />
          <Decal label="MATERIAL" value="316 SS" />
          <Decal label="SIZE" value='1"' />
          <Decal label="DESCRIPTION" value="SS TEE 1&quot; FNPT 316" />
        </div>

        {/* glowing angled intake port */}
        <div className="relative">
          <span
            className="pointer-events-none absolute -left-px top-[22%] z-10 hidden text-[10px] leading-none text-[var(--uf-accent)] md:block"
            aria-hidden
          >
            +
          </span>
          <span
            className="pointer-events-none absolute -left-px top-[74%] z-10 hidden text-[10px] leading-none text-[var(--uf-accent)] md:block"
            aria-hidden
          >
            +
          </span>
          <span
            className="pointer-events-none absolute -right-px top-[22%] z-10 hidden text-[10px] leading-none text-[var(--uf-accent)] md:block"
            aria-hidden
          >
            +
          </span>
          <span
            className="pointer-events-none absolute -right-px top-[74%] z-10 hidden text-[10px] leading-none text-[var(--uf-accent)] md:block"
            aria-hidden
          >
            +
          </span>

          <div
            className="p-px"
            style={{
              clipPath: CLIP,
              background: borderGlow,
              boxShadow: dragging
                ? "0 0 34px rgba(55,199,234,0.28)"
                : "0 0 22px rgba(55,199,234,0.1)",
            }}
          >
            <div
              className="flex min-h-[300px] flex-col items-center justify-center px-6 py-8 text-center transition-colors"
              style={{
                clipPath: CLIP,
                background: dragging
                  ? "rgba(55,199,234,0.06)"
                  : "var(--uf-bg-raised)",
              }}
              onClick={openPicker}
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
                if (e.key === "Enter" || e.key === " ") openPicker();
              }}
              aria-label="Drop supplier catalogues or click to browse"
            >
              <span className="uf-mono flex items-center gap-2 text-[9.5px] uppercase tracking-[0.16em] text-[var(--uf-text-tertiary)]">
                <span className="h-px w-6 bg-[var(--uf-accent-line)]" aria-hidden />
                Intake port · stage 01
                <span className="h-px w-6 bg-[var(--uf-accent-line)]" aria-hidden />
              </span>

              <CloudDownload
                className={`mt-6 size-9 transition-transform ${dragging ? "scale-110" : ""}`}
                style={{ color: dragging ? "var(--uf-accent-bright)" : "var(--uf-accent)" }}
                aria-hidden
              />
              <p className="mt-4 text-[22px] font-bold uppercase tracking-[0.02em] text-[var(--uf-text-primary)]">
                Drop catalogue
              </p>
              <p className="uf-mono mt-1.5 text-[10.5px] uppercase tracking-[0.18em] text-[var(--uf-text-tertiary)]">
                CSV / XLSX / PDF / JSON
              </p>

              <Button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  openPicker();
                }}
                className="uf-mono mt-7 h-9 rounded-full border border-[var(--uf-accent-line)] bg-[var(--uf-accent-dim)] px-6 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-[var(--uf-accent)] shadow-[0_0_18px_rgba(55,199,234,0.18)] transition-colors hover:bg-[var(--uf-accent)] hover:text-[var(--uf-primary-foreground)]"
              >
                Select catalogue
              </Button>
              <input
                ref={inputRef}
                type="file"
                multiple
                className="sr-only"
                onChange={(e) => addFiles(e.target.files)}
              />

              {/* pending files */}
              {files.length > 0 && (
                <div className="mt-6 w-full max-w-md border-t border-[var(--uf-border-faint)] pt-4">
                  <p className="uf-mono mb-2 text-left text-[9px] uppercase tracking-[0.14em] text-[var(--uf-text-tertiary)]">
                    Pending ({files.length})
                  </p>
                  <ul className="flex flex-wrap justify-center gap-1.5">
                    {files.map((f, i) => (
                      <li
                        key={`${f.name}-${i}`}
                        className="flex items-center gap-1.5 rounded-sm border border-[var(--uf-border)] bg-[var(--uf-surface)] px-2 py-1"
                      >
                        <span className="uf-mono max-w-[180px] truncate text-[10px] text-[var(--uf-text-secondary)]">
                          {f.name}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setFiles((prev) => prev.filter((_, idx) => idx !== i));
                          }}
                          className="text-[var(--uf-text-tertiary)] transition-colors hover:text-[var(--uf-critical)]"
                          aria-label={`Remove ${f.name}`}
                        >
                          <X className="size-3" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* USE SAMPLE DATA — connector stub ties it to the intake port */}
        <div className="mt-4 flex items-center gap-4">
          <button
            type="button"
            onClick={handleSample}
            disabled={submitting}
            className="uf-mono rounded-full border border-[var(--uf-border-strong)] bg-[var(--uf-surface)] px-5 py-2 text-[10.5px] uppercase tracking-[0.14em] text-[var(--uf-text-secondary)] transition-colors hover:border-[var(--uf-accent-line)] hover:text-[var(--uf-accent)] disabled:opacity-50"
          >
            Use sample data
          </button>
          <span
            className="relative hidden h-px max-w-28 flex-1 border-t border-dashed border-[var(--uf-accent-line)] md:block"
            aria-hidden
          >
            <span className="absolute -top-[3px] right-0 size-1.5 rounded-full bg-[var(--uf-accent)]" />
          </span>
          <span className="uf-mono hidden text-[9px] uppercase tracking-[0.12em] text-[var(--uf-text-tertiary)] md:block">
            Loads the reference sample catalogue
          </span>
        </div>
      </div>

      {/* compact intake configuration */}
      <div className="mt-5 grid gap-3 rounded-sm border border-[var(--uf-border-faint)] bg-[var(--uf-bg-deep)] p-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <div>
          <label
            htmlFor="intake-supplier"
            className="uf-mono mb-1.5 block text-[9px] uppercase tracking-[0.12em] text-[var(--uf-text-tertiary)]"
          >
            Supplier
          </label>
          <Select value={supplierId} onValueChange={setSupplierId}>
            <SelectTrigger
              id="intake-supplier"
              className="h-8 w-full rounded-sm border-[var(--uf-border)] bg-[var(--uf-surface)] text-[11px] text-[var(--uf-text-primary)]"
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
            className="uf-mono mb-1.5 block text-[9px] uppercase tracking-[0.12em] text-[var(--uf-text-tertiary)]"
          >
            Source type
          </label>
          <Select value={sourceType} onValueChange={(v) => setSourceType(v as SourceType)}>
            <SelectTrigger
              id="intake-type"
              className="h-8 w-full rounded-sm border-[var(--uf-border)] bg-[var(--uf-surface)] text-[11px] text-[var(--uf-text-primary)]"
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
          className="h-8 rounded-sm bg-[var(--uf-accent)] px-4 text-[11px] font-semibold text-[var(--uf-primary-foreground)] hover:bg-[var(--uf-accent-bright)] disabled:opacity-40"
        >
          <FilePlus2 className="size-3.5" aria-hidden />
          {submitting ? "Queuing…" : `Queue ${files.length} file${files.length === 1 ? "" : "s"}`}
        </Button>
      </div>
    </div>
  );
}

function Decal({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-end gap-1.5">
      <span
        className="h-px w-6 bg-gradient-to-r from-transparent to-[var(--uf-accent-line)]"
        aria-hidden
      />
      <span className="uf-mono whitespace-nowrap rounded-sm border border-[var(--uf-accent-line)] bg-[var(--uf-accent-dim)] px-1.5 py-0.5 text-[9px] uppercase tracking-[0.08em] text-[var(--uf-accent)]">
        {label}
        <span className="text-[var(--uf-text-secondary)]">: {value}</span>
      </span>
    </div>
  );
}
