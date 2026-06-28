// PlannerElite — PARALLEL live route rendering the ELEVATED, fully-wired Planner
// (PlannerEliteShell) with the SAME real authenticated data. For genuine click-testing on
// the signed-in app before flipping live /Planner. Additive only; live /Planner untouched.
import Planner from "./Planner";

export default function PlannerElite() {
  return <Planner shellVariant="elite" />;
}
