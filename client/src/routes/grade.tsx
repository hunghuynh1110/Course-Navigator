import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/grade")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/grade"!</div>;
}
