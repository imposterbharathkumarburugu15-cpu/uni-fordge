import { ActivityPanel } from "./ActivityPanel";
import { ActivePipeline } from "./ActivePipeline";
import { BottomWorkflow } from "./BottomWorkflow";
import { Intelligence } from "./Intelligence";
import { InterventionZone } from "./InterventionZone";
import { PipelineOverview } from "./PipelineOverview";
import { ReadyShipment } from "./ReadyShipment";
import { SourceHealth } from "./SourceHealth";
import { SystemHeader } from "./SystemHeader";

/**
 * COMMAND CENTER — the master control screen.
 * One connected operational view: what is running, what is blocked,
 * what needs human review, what is verified, what can ship.
 */
export default function CommandCenter() {
  return (
    <div className="flex flex-col gap-8">
      <SystemHeader />
      <PipelineOverview />
      <InterventionZone />
      <ActivePipeline />
      <Intelligence />
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ActivityPanel />
        </div>
        <SourceHealth />
      </div>
      <ReadyShipment />
      <BottomWorkflow />
    </div>
  );
}
