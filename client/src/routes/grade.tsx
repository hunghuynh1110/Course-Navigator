import GradeTable from "@/components/grade-calc/GradeTable";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/grade")({
  component: RouteComponent,
});

function RouteComponent() {
  return <GradeTable courseId="CSSE3200" />;
}
