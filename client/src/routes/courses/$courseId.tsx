import { createFileRoute } from "@tanstack/react-router";
import { useParams } from "@tanstack/react-router";

export const Route = createFileRoute("/courses/$courseId")({
  component: CourseDetails,
});

function CourseDetails() {
  const { courseId } = useParams({ from: Route.id });
  return <div>Hello {courseId}!</div>;
}
