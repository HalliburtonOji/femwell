// PlannerLiveTest — a PARALLEL live route that renders the clipboard Planner rebuild
// (PlannerV2ShellClipboard) with the SAME real authenticated data-loading as the live
// /Planner. Lets the rebuild be genuinely click-tested on the deployed, signed-in app
// before any swap. Live /Planner stays on the PROVEN shell — this is additive only.
import Planner from "./Planner";

export default function PlannerLiveTest() {
  return <Planner shellVariant="clipboard" />;
}
