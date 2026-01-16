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
  Paper,
} from "@mui/material";
import type { Course, Status } from "@/types/course";
import CourseGraph from "@/components/course-graph/CourseGraph";
import CourseTagList from "@/components/search-box/CourseTagList";
import { api } from "@/services/api";
import { useScreenSize } from "@/hooks/useScreenSize";
import CourseStatus from "@/components/course-graph/CourseStatus";

export type Search = {
  department?: string;
  program?: string;
  courses?: string[];
};

export const Route = createFileRoute("/about")({
  component: About,
  validateSearch: (search: Record<string, unknown>): Search => {
    return {
      department:
        typeof search.department === "string" ? search.department : undefined,
      program: typeof search.program === "string" ? search.program : undefined,

      courses: Array.isArray(search.courses)
        ? (search.courses as string[])
        : undefined,
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
    department: searchDepartment,
    program: searchProgram,
    courses: searchCourses,
  } = Route.useSearch();
  const [graphData, setGraphData] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Program selector state
  const [programs, setPrograms] = useState<Program[]>([]);

  // Initialize state from search params
  const [loadingPrograms, setLoadingPrograms] = useState(true);

  // Displayed courses state (derived from program OR search params)
  const [displayedCourses, setDisplayedCourses] = useState<string[]>([]);

  // Update displayed courses based on program or search params
  useEffect(() => {
    if (searchProgram && programs.length > 0) {
      const prog = programs.find((p) => p.name === searchProgram);
      if (prog) {
        setDisplayedCourses(prog.courses);
        return;
      } else {
        navigate({
          to: "/about",
          search: (prev) => ({
            ...prev,
            program: undefined,
            courses: undefined,
          }),
        });
      }
    } else if (searchCourses && searchCourses.length > 0) {
      // No program selected, fallback to custom courses from URL
      setDisplayedCourses(searchCourses);
    } else {
      setDisplayedCourses([]);
    }
  }, [searchProgram, searchCourses, programs, navigate]);

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
        const data = await api.fetchPrograms(searchDepartment);
        setPrograms(data as Program[]);
      } catch (e) {
        console.error("Failed to load programs", e);
        setPrograms([]);
      } finally {
        setLoadingPrograms(false);
      }
    };
    load();
  }, [searchDepartment]);

  const handleShowRoadmap = async (courseIds: string[]) => {
    if (courseIds.length === 0) {
      setGraphData([]);
      return;
    }
    setIsLoading(true);
    setNodesStatus({});
    try {
      const fullTree = await fetchFullCourseTree(courseIds);

      setGraphData(fullTree);
    } catch (error) {
      console.error("Error loading course tree:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to load a program
  const loadProgramEvents = (program: Program | null | undefined) => {
    if (program) {
      navigate({
        to: "/about",
        search: (prev) => ({
          ...prev,
          program: program.name,
          courses: undefined, // Clear courses from URL
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

  useEffect(() => {
    // Only fetch graph when displayedCourses changes and is not empty
    if (displayedCourses.length > 0) {
      handleShowRoadmap(displayedCourses);
    } else {
      setGraphData([]);
    }
  }, [displayedCourses]); // Depend on the derived list

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

  const screen = useScreenSize();

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
              value={searchDepartment || "All"}
              label="Department"
              onChange={(e) => {
                navigate({
                  to: "/about",
                  search: (prev) => ({
                    ...prev,
                    department:
                      e.target.value === "All" ? undefined : e.target.value,
                    program: undefined, // Clear program on department change
                  }),
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
            isOptionEqualToValue={(option, value) => option.name === value.name}
            loading={loadingPrograms}
            value={programs.find((p) => p.name === searchProgram) || null}
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

        {displayedCourses.length > 0 && screen != 0 && (
          <Fragment>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Showing {displayedCourses.length}{" "}
              {searchProgram
                ? "mandatory courses of " + searchProgram
                : "selected courses"}
            </Typography>

            <CourseTagList courses={displayedCourses} />
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
      {!isLoading && displayedCourses.length > 0 && (
        <Paper sx={{ p: 3, maxWidth: 1200, mx: "auto", mb: 3, mt: 1 }}>
          <CourseGraph
            courses={graphData}
            nodesStatus={effectiveStatusMap}
            onStatusChange={(updates) =>
              setNodesStatus((prev) => ({ ...prev, ...updates }))
            }
          />
          <CourseStatus />
        </Paper>
      )}
    </>
  );
}
