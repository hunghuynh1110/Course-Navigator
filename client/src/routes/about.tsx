import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  fetchFullCourseTree,
  getEffectiveStatusMap,
} from "@/utils/courseUtils";
import { useState, useMemo, useEffect, Fragment } from "react";
import {
  Button,
  Typography,
  Box,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Autocomplete,
  TextField,
} from "@mui/material";
import type { Course, Status } from "@/types/course";
import CourseGraph from "@/components/course-graph/CourseGraph";
import CourseTagList from "@/components/search-box/CourseTagList";
import { api } from "@/services/api";

type AboutSearch = {
  courses?: string[];
  department?: string;
  program?: string;
};

export const Route = createFileRoute("/about")({
  component: About,
  validateSearch: (search: Record<string, unknown>): AboutSearch => {
    return {
      courses: Array.isArray(search.courses)
        ? (search.courses as string[])
        : undefined,
      department:
        typeof search.department === "string" ? search.department : undefined,
      program: typeof search.program === "string" ? search.program : undefined,
    };
  },
});
type SearchItem = {
  value: string;
  label: string;
  status?: boolean;
};

type Program = {
  id: number;
  name: string;
  total_units: number;
  courses: string[];
  faculty: string;
};

function About() {
  const navigate = useNavigate();
  const {
    courses: searchCourses,
    department: searchDepartment,
    program: searchProgram,
  } = Route.useSearch();
  const [graphData, setGraphData] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Program selector state
  const [programs, setPrograms] = useState<Program[]>([]);

  // Initialize state from search params
  const [selectedFaculty, setSelectedFaculty] = useState(
    searchDepartment || "All"
  );
  const [selectedProgram, setSelectedProgram] = useState<Program | undefined>(
    undefined
  );
  const [loadingPrograms, setLoadingPrograms] = useState(true);

  // Sync state with search params changes
  useEffect(() => {
    if (searchDepartment) {
      setSelectedFaculty(searchDepartment);
    }
  }, [searchDepartment]);

  useEffect(() => {
    if (programs.length > 0 && searchProgram) {
      const prog = programs.find((p) => p.name === searchProgram);
      if (prog) {
        setSelectedProgram(prog);
      }
    } else if (!searchProgram) {
      setSelectedProgram(undefined);
    }
  }, [programs, searchProgram]);

  // State for node status (Passed/Failed etc.)
  const [nodesStatus, setNodesStatus] = useState<Record<string, Status>>({});

  // Compute effective status for visualizing "Blocked" nodes
  const effectiveStatusMap = useMemo(() => {
    return getEffectiveStatusMap(graphData, nodesStatus);
  }, [graphData, nodesStatus]);

  // Load Programs when faculty changes
  useEffect(() => {
    const load = async () => {
      setLoadingPrograms(true);
      try {
        // Fetch programs for the selected faculty (or all if "All")
        const data = await api.fetchPrograms(selectedFaculty);
        setPrograms(data as Program[]);
      } catch (e) {
        console.error("Failed to load programs", e);
        setPrograms([]);
      } finally {
        setLoadingPrograms(false);
      }
    };
    load();
  }, [selectedFaculty]);

  const handleShowRoadmap = async (courses: { id: string }[]) => {
    setIsLoading(true);
    setNodesStatus({});
    try {
      const fullTree = await fetchFullCourseTree(
        courses.map((course) => course.id)
      );

      setGraphData(fullTree);
    } catch (error) {
      console.error("Error loading course tree:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to load a program
  const loadProgramEvents = (program: Program | undefined) => {
    setSelectedProgram(program);
    if (program) {
      navigate({
        to: "/about",
        search: (prev) => ({
          ...prev,
          program: program.name,
          courses: program.courses,
        }),
      });
    } else {
      // Clear program and courses if no program selected (though Autocomplete is disableClearable currently)
      navigate({
        to: "/about",
        search: (prev) => ({
          ...prev,
          program: undefined,
          courses: undefined,
        }),
      });
    }
  };

  // Use courses from search params or fallback to default
  const courses = useMemo(() => {
    if (searchCourses && searchCourses.length > 0) {
      return searchCourses.map((id) => ({ id }));
    }
    return [];
  }, [searchCourses]);

  // Auto-load graph if courses are provided via search params
  useEffect(() => {
    if (searchCourses && searchCourses.length > 0) {
      handleShowRoadmap(courses);
    }
  }, [selectedFaculty, searchCourses, courses]); // Refresh graph when search params change

  const searchItems: SearchItem[] = [
    {
      value: "All",
      label: "All Departments",
    },
    {
      value: "eait",
      label: "Engineering, Architecture & IT (EAIT)",
    },
    {
      value: "bel",
      label: "Business, Economics & Law (BEL)",
    },
    {
      value: "hlbs",
      label: "Health & Behavioural Sciences (HLBS)",
    },
    {
      value: "hss",
      label: "Humanities & Social Sciences (HSS)",
    },
    {
      value: "med",
      label: "Medicine (MED)",
    },
    {
      value: "sci",
      label: "Science (SCI)",
    },
  ];

  return (
    <>
      {/* Program Selection */}
      <Box sx={{ p: 3, maxWidth: 1200, mx: "auto" }}>
        <Typography variant="h4" gutterBottom>
          Course Roadmap Planner
        </Typography>

        <Box
          display="flex"
          gap={2}
          my={3}
          flexDirection={{ xs: "column", sm: "row" }}
        >
          {/* Faculty Filter */}
          <FormControl
            sx={{
              width: { xs: "100%", sm: "35%" },
              mt: { xs: 1, md: 0 },
            }}
          >
            <InputLabel>Department</InputLabel>
            <Select
              value={selectedFaculty}
              label="Department"
              onChange={(e) => {
                const newFaculty = e.target.value;
                setSelectedFaculty(newFaculty);
                // Update URL + CLEAR program and courses
                navigate({
                  to: "/about",
                  search: {
                    department: newFaculty,
                    program: undefined,
                    courses: undefined,
                  },
                });
              }}
            >
              {searchItems.map((item) => (
                <MenuItem key={item.value} value={item.value}>
                  {item.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Program Search */}

          <Autocomplete
            sx={{
              width: { xs: "100%", sm: "55%" },
              mt: { xs: 1, md: 0 },
            }}
            disableClearable={true}
            options={programs}
            getOptionLabel={(option) => option.name}
            loading={loadingPrograms}
            value={selectedProgram}
            onChange={(_, newValue) => loadProgramEvents(newValue)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Search Programs"
                placeholder="Type to search (e.g. Computer Science)"
              />
            )}
          />

          <Button variant="outlined" onClick={() => navigate({ to: "/" })}>
            Back
          </Button>
        </Box>

        {searchCourses && searchCourses.length > 0 && (
          <Fragment>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Showing {searchCourses.length} mandatory courses of{" "}
              {selectedProgram?.name}
            </Typography>

            <CourseTagList courses={searchCourses} />
          </Fragment>
        )}
      </Box>

      {/* Loading State */}
      {isLoading && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            p: 8,
          }}
        >
          <CircularProgress size={60} />
        </Box>
      )}

      {/* Graph Display */}
      {!isLoading && searchCourses && (
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
