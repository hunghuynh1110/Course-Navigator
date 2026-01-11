import { createFileRoute } from "@tanstack/react-router"
import { fetchFullCourseTree, getEffectiveStatusMap } from "@/utils/courseUtils";
import { useState, useMemo } from "react";
import { Button } from "@mui/material";
import type { Course, Status } from "@/types/course";
import CourseGraph from "@/components/course-graph/CourseGraph";

export const Route = createFileRoute("/about")({
  component: About,
});

function About() {
  const [graphData, setGraphData] = useState<Course[]>([]);
  const [showGraph, setShowGraph] = useState(false);

  // State for node status (Passed/Failed etc.)
  const [nodesStatus, setNodesStatus] = useState<Record<string, Status>>({});

  // Compute effective status for visualizing "Blocked" nodes
  const effectiveStatusMap = useMemo(() => {
    return getEffectiveStatusMap(graphData, nodesStatus);
  }, [graphData, nodesStatus]);

  const handleShowRoadmap = async (courses: { id: string }[]) => {
    // 1. Gọi hàm tiện ích vừa viết
    const fullTree = await fetchFullCourseTree(
      courses.map((course) => course.id)
    );

    // 2. Lưu vào state
    setGraphData(fullTree);
    setShowGraph(true);
  };

  const courses = [
    { id: "CSSE3200" }, // Advanced Software Engineering (Requires CSSE2310, CSSE2002)
    { id: "CSSE2010" }, // Intro to Computer Systems (Requires ENGG1100 usually)
    { id: "MATH2001" }, // Advanced Calculus (Requires MATH1051, MATH1052)
    { id: "STAT2003" }, // Probability & Stats
  ];

  return (
    <>
      {/* ... Danh sách Card ... */}
      <Button onClick={() => handleShowRoadmap(courses)}>Xem lộ trình</Button>

      {/* ... Modal hoặc khu vực hiển thị Graph ... */}
      {showGraph && (
        <CourseGraph
          courses={graphData}
          nodesStatus={effectiveStatusMap}
          onStatusChange={(updates) =>
            setNodesStatus((prev) => ({ ...prev, ...updates }))
          }
        />
      )}
    </>
  );
}
