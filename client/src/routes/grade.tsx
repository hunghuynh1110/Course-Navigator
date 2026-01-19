import AssessmentTable from "@/components/grade-calc/AssessmentTable";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/grade")({
  component: RouteComponent,
});

function RouteComponent() {
  return <AssessmentTable courseId="CSSE3200" />;
}
