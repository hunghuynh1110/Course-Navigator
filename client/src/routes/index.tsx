import { createFileRoute, useNavigate } from "@tanstack/react-router";
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
import CourseCard from "../components/CourseCard";
import CourseSearchInput from "../components/search-box/CourseSearchInput";
import CourseTagList from "../components/search-box/CourseTagList";
import { useScreenSize } from "@/hooks/useScreenSize";

interface DashboardSearch {
  courses?: string[];
  page?: number;
  q?: string; // search query
}

export const Route = createFileRoute("/")({
  component: Dashboard,
  validateSearch: (search: Record<string, unknown>): DashboardSearch => {
    return {
      courses: Array.isArray(search.courses)
        ? (search.courses as string[])
        : [],
      page: typeof search.page === "number" ? search.page : 1,
      q: typeof search.q === "string" ? search.q : undefined,
    };
  },
});

const PAGE_SIZE = 12;

function Dashboard() {
  const navigate = useNavigate();
  const screenSize = useScreenSize();
  const {
    courses: selectedCourses = [],
    page = 1,
    q: searchQuery,
  } = Route.useSearch();

  // --- STATE ---
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(0);

  // Local state for live search (not in URL until Enter is pressed)
  const [liveSearchQuery, setLiveSearchQuery] = useState<string | undefined>(
    undefined
  );

  // --- HANDLERS ---
  // This is called while typing (for live results)
  const handleSearchResults = useCallback((results: string[]) => {
    const query = results.length > 0 ? results[0] : undefined;
    setLiveSearchQuery(query);
  }, []);

  // This is called on Enter key press (updates URL)
  const handleSearchSubmit = useCallback(
    (query: string) => {
      navigate({
        to: "/",
        search: (prev) => ({
          ...prev,
          q: query || undefined,
          page: 1, // Reset to page 1 when searching
        }),
      });
    },
    [navigate]
  );

  const handleAddCourse = useCallback(
    (code: string) => {
      navigate({
        to: "/",
        search: (prev) => ({
          ...prev,
          courses: prev.courses?.includes(code)
            ? prev.courses
            : [...(prev.courses || []), code],
          q: undefined, // Clear search when adding a course
        }),
      });
    },
    [navigate]
  );

  const handleRemoveCourse = useCallback(
    (code: string) => {
      navigate({
        to: "/",
        search: (prev) => ({
          ...prev,
          courses: prev.courses?.filter((c) => c !== code),
        }),
      });
    },
    [navigate]
  );

  // --- DATA FETCHING ---
  const fetchCourses = useCallback(async () => {
    setLoading(true);

    // Use liveSearchQuery if available (while typing), otherwise use URL searchQuery
    const activeQuery = liveSearchQuery || searchQuery;

    // Priority 1: If user is actively searching (typing), show search results
    if (activeQuery) {
      const { data } = await supabase
        .from("courses")
        .select("*")
        .ilike("id", `%${activeQuery}%`)
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
  }, [page, liveSearchQuery, searchQuery, selectedCourses]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const handlePageChange = (
    _event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    navigate({
      to: "/",
      search: (prev) => ({
        ...prev,
        page: value,
      }),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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

          {courses.length > 0 && !liveSearchQuery && !searchQuery && (
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
