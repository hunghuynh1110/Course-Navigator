import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { fetchFullCourseTree, getEffectiveStatusMap } from "@/utils/courseUtils";
import { useState, useMemo, useEffect, Fragment } from "react";
import { Button, Typography, Box } from "@mui/material";
import type { Course, Status } from "@/types/course";
import CourseGraph from "@/components/course-graph/CourseGraph";
import CourseTagList from "@/components/search-box/CourseTagList";

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

// Program presets - predefined course lists for different majors
const PROGRAM_PRESETS = {
  "Software Engineering": [
    "CSSE1001", "CSSE2010", "MATH1051", "MATH1052", "ENGG1100", "ENGG1300",
    "CSSE2002", "CSSE2310", "INFS1200", "STAT2020", "DECO2800",
    "COMP3506", "CSSE3002", "CSSE3200", "CYBR3000", "CSSE3100",
    "ENGG4801", "ENGG4802", "ENGG4900"
  ],
  "Computer Science": [
    "CSSE1001", "CSSE2010", "MATH1051", "MATH1061", "ENGG1100",
    "CSSE2002", "CSSE2310", "INFS1200", "STAT2020",
    "COMP3506", "COMP3301", "COMP3400", "CSSE3100"
  ],
  "Data Science": [
    "CSSE1001", "MATH1051", "MATH1052", "STAT1201",
    "CSSE2310", "INFS1200", "STAT2020", "DATA2001",
    "COMP3506", "DATA3404", "STAT3001", "STAT3003"
  ],
  "Electrical Engineering": [
    "ENGG1100", "ENGG1300", "MATH1051", "MATH1052", "PHYS1001",
    "ELEC2004", "ELEC2005", "ELEC2300", "ENGG2200",
    "ELEC3004", "ELEC3300", "ELEC3400", "ENGG4801", "ENGG4802"
  ]
};

function About() {
  const navigate = useNavigate();
  const { courses: searchCourses } = Route.useSearch();
  const [graphData, setGraphData] = useState<Course[]>([]);
  const [showGraph, setShowGraph] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState("");



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

  // Function to clear all search params
  const clearSearchParams = () => {
    navigate({ to: "/about", search: {} });
  };

  // Function to load a program preset
  const loadProgramPreset = (programName: keyof typeof PROGRAM_PRESETS) => {
    setSelectedProgram(programName);
    const courseList = PROGRAM_PRESETS[programName];
    navigate({ to: "/about", search: { courses: courseList } });
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
  }, [searchCourses, courses]); // Refresh graph when search params change


  return (
    <>
      {/* Program Selection */}
      <Box sx={{ p: 3, maxWidth: 1200, mx: "auto" }}>
        <Typography variant="h4" gutterBottom>
          Course Roadmap Planner
        </Typography>
        
        <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
          Select a Program:
        </Typography>
        
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 3 }}>
            {(Object.keys(PROGRAM_PRESETS) as Array<keyof typeof PROGRAM_PRESETS>).map((programName) => (
              <Button
                key={programName}
                variant={programName === selectedProgram ? "contained" : "outlined"}
                color="primary"
                onClick={() => loadProgramPreset(programName)}
              >
                {programName}
              </Button>
            ))}
          <Button variant="outlined" onClick={() => navigate({to: "/"})}>
            Back
            </Button>
        </Box>

        {searchCourses && searchCourses.length > 0 && (
          <Fragment>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Showing {searchCourses.length} courses of {selectedProgram}
            </Typography>

            <CourseTagList 
                              courses={searchCourses} 
                           />
          </Fragment>
        )}

      </Box>

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
