import { ActivityFeed } from "@/components/activity/ActivityFeed";
import { useActivity } from "@/hooks/use-forge-store";

export function ActivityPanel() {
  const activity = useActivity();
  return (
    <div className="uf-panel overflow-hidden">
      <div className="uf-panel-head">
        <h2 className="uf-section-title">
          <span className="idx">06</span>
          Recent System Activity
        </h2>
        <span className="uf-mono text-[10px] uppercase tracking-[0.12em] text-[var(--uf-text-tertiary)]">
          {activity.length} events
        </span>
      </div>
      <div className="px-4 py-2">
        <ActivityFeed items={activity} limit={9} />
      </div>
    </div>
  );
}
