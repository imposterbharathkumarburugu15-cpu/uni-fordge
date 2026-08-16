import { useNavigate } from "react-router";
import { StatusBadge } from "@/components/status/StatusBadge";
import { useSuppliers } from "@/hooks/use-forge-store";
import { formatRelative } from "@/utils/format";

export function SourceHealth() {
  const navigate = useNavigate();
  const suppliers = useSuppliers();

  return (
    <div className="uf-panel overflow-hidden">
      <div className="uf-panel-head">
        <h2 className="uf-section-title">
          <span className="idx">07</span>
          Source Health
        </h2>
      </div>
      <ul className="divide-y divide-[var(--uf-border-faint)]">
        {suppliers.map((s) => (
          <li key={s.id}>
            <button
              type="button"
              onClick={() => navigate("/intake")}
              className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-[rgba(255,255,255,0.02)]"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-medium text-[var(--uf-text-primary)]">
                  {s.name}
                </p>
                <p className="uf-mono mt-0.5 text-[10.5px] text-[var(--uf-text-tertiary)]">
                  {s.code} · {s.region} · {s.sourceCount} sources · sync{" "}
                  {formatRelative(s.lastSync)}
                </p>
              </div>
              <StatusBadge status={s.health} />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
