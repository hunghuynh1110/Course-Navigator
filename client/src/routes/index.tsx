import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "../supabaseClient";
import type { Course } from "../types/course";
import {
  Typography,
  Grid,
  CircularProgress,
  Box,
  Pagination,
  Container,
  Button,
} from "@mui/material";
import { useNavigate } from "@tanstack/react-router";
import CourseCard from "../components/CourseCard";
import CourseSearchInput from "../components/search-box/CourseSearchInput";
import CourseTagList from "../components/search-box/CourseTagList";
import { useScreenSize } from "@/hooks/useScreenSize";

interface DashboardSearch {
  courses?: string[];
  department?: string;
  school?: string;
}
export const Route = createFileRoute("/")({
  component: Dashboard,
  validateSearch: (search: Record<string, unknown>): DashboardSearch => {
    return {
      courses: Array.isArray(search.courses)
        ? (search.courses as string[])
        : undefined,
      department: search.department as string,
      school: search.school as string,
    };
  },
});

const PAGE_SIZE = 12;

function Dashboard() {
  const navigate = useNavigate();
  const screenSize = useScreenSize();

  // --- STATE ---
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  // Selected tags (course codes) - saved list
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);

  // Live search results (what user is currently typing)
  const [searchResults, setSearchResults] = useState<string[]>([]);

  // --- HANDLERS ---
  const handleSearchResults = useCallback((results: string[]) => {
    setSearchResults(results);
  }, []);

  const handleAddCourse = (code: string) => {
    // Add to saved list
    if (!selectedCourses.includes(code)) {
      setSelectedCourses((prev) => [...prev, code]);
    }
    // Clear search results (reset display)
    setSearchResults([]);
  };

  const handleRemoveCourse = (code: string) => {
    setSelectedCourses((prev) => prev.filter((c) => c !== code));
  };

  // --- DATA FETCHING ---
  const fetchCourses = useCallback(async () => {
    setLoading(true);

    // Priority 1: If user is actively searching (typing), show search results
    if (searchResults.length > 0 && searchResults[0]) {
      const searchTerm = searchResults[0];
      const { data } = await supabase
        .from("courses")
        .select("*")
        .ilike("id", `%${searchTerm}%`)
        .limit(50); // Limit search results

      if (data) setCourses(data as unknown as Course[]);
      setTotalPages(1); // No pagination for search
      setLoading(false);
      return;
    }

    // Priority 2: Default - show all courses with pagination
    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    const { data, count, error } = await supabase
      .from("courses")
      .select("*", { count: "exact" })
      .range(from, to)
      .order("id", { ascending: true });

    if (error) {
      console.error(error);
      setCourses([]);
    } else if (data) {
      if (selectedCourses.length > 0) {
        const filteredData = data.filter(
          (course) => !selectedCourses.includes(course.id)
        );
        setCourses(filteredData as unknown as Course[]);
      } else {
        setCourses(data as unknown as Course[]);
      }
      if (count !== null) setTotalPages(Math.ceil(count / PAGE_SIZE));
    }
    setLoading(false);
  }, [page, searchResults, selectedCourses]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const handlePageChange = (
    _event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const filters = [
    {
      id: "faculty",
      label: "Department",
      options: [
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
      ],
      defaultValue: "All",
    },
  ];

  return (
    <Container maxWidth={false} sx={{ py: 4 }}>
      {/* SEARCH AREA */}
      <Box mb={2}>
        <Box display="flex" justifyContent="center">
          <Box width={{ xs: "100%", md: "90%" }}>
            <Box display="flex" justifyContent="center" gap={3}>
              <CourseSearchInput
                onAddCourse={handleAddCourse}
                existingCourses={selectedCourses}
                onSearchResults={handleSearchResults}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={() =>
                  navigate({
                    to: "/about",
                    search: { courses: selectedCourses },
                  })
                }
              >
                Create Graph
              </Button>
            </Box>
          </Box>
        </Box>

        <Box display="flex" justifyContent="center">
          <Box width={{ xs: "100%", md: "90%" }}>
            <CourseTagList
              courses={selectedCourses}
              onRemove={handleRemoveCourse}
            />
          </Box>
        </Box>
      </Box>

      {/* COURSE LIST */}
      {loading ? (
        <Box display="flex" justifyContent="center" my={10}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {courses.length === 0 ? (
            <Box textAlign="center" py={5}>
              <Typography variant="h6" color="text.secondary">
                No courses found
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={3} alignItems="stretch">
              {courses.map((course) => (
                <Grid
                  size={{ xs: 12, md: 6, lg: 6, xl: 4 }}
                  key={course.id}
                  display="flex"
                >
                  <CourseCard
                    course={course}
                    onClick={() => {
                      navigate({ to: `/courses/${course.id}` });
                    }}
                  />
                </Grid>
              ))}
            </Grid>
          )}

          {/* Pagination only when showing all courses (no search) */}

          {courses.length > 0 && searchResults.length === 0 && (
            <Box display="flex" justifyContent="center" mt={4}>
              <Pagination
                count={totalPages}
                siblingCount={2}
                page={page}
                onChange={handlePageChange}
                color="primary"
                size={screenSize <= 2 ? "medium" : "large"}
              />
            </Box>
          )}
        </>
      )}
    </Container>
  );
}
