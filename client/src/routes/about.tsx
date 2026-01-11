import { createFileRoute } from "@tanstack/react-router"
import { fetchFullCourseTree, getEffectiveStatusMap } from "@/utils/courseUtils";
import { useState, useMemo, useEffect } from "react";
import { Button } from "@mui/material";
import type { Course, Status } from "@/types/course";
import CourseGraph from "@/components/course-graph/CourseGraph";

type AboutSearch = {
  courses?: string[];
};

export const Route = createFileRoute("/about")({
  component: About,
  validateSearch: (search: Record<string, unknown>): AboutSearch => {
    return {
      courses: Array.isArray(search.courses) ? search.courses as string[] : undefined,
    };
  },
});

function About() {
  const { courses: searchCourses } = Route.useSearch();
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

  // Use courses from search params or fallback to default
  const courses = useMemo(() => {
    if (searchCourses && searchCourses.length > 0) {
      return searchCourses.map(id => ({ id }));
    }
    return [
      { id: "CSSE3200" }, // Advanced Software Engineering (Requires CSSE2310, CSSE2002)
      { id: "CSSE2010" }, // Intro to Computer Systems (Requires ENGG1100 usually)
      { id: "MATH2001" }, // Advanced Calculus (Requires MATH1051, MATH1052)
      { id: "STAT2003" }, // Probability & Stats
    ];
  }, [searchCourses]);

  // Auto-load graph if courses are provided via search params
  useEffect(() => {
    if (searchCourses && searchCourses.length > 0) {
      handleShowRoadmap(courses);
    }
  }, []); // Only run once on mount

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
