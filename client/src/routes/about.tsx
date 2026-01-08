import { createFileRoute } from "@tanstack/react-router";
import CourseGraph from "@/components/course-graph/CourseGraph";
import { fetchFullCourseTree } from "@/utils/courseUtils";
import { useState } from "react";
import { Button } from "@mui/material";
import type { Course } from "@/types/course";

export const Route = createFileRoute("/about")({
  component: About,
});

function About() {
  const [graphData, setGraphData] = useState<Course[]>([]);
  const [showGraph, setShowGraph] = useState(false);

  const handleShowRoadmap = async (courses: { id: string }[]) => {
    // 1. Gọi hàm tiện ích vừa viết
    const fullTree = await fetchFullCourseTree(
      courses.map((course) => course.id)
    );

    // 2. Lưu vào state
    setGraphData(fullTree);
    setShowGraph(true);
  };

  const courses = [{ id: "CSSE3200" }, { id: "CSSE3100" }, { id: "CSSE3010" }];

  return (
    <>
      {/* ... Danh sách Card ... */}
      <Button onClick={() => handleShowRoadmap(courses)}>Xem lộ trình</Button>

      {/* ... Modal hoặc khu vực hiển thị Graph ... */}
      {showGraph && <CourseGraph courses={graphData} />}
    </>
  );
}
