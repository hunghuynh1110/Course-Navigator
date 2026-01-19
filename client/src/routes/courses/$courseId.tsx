import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import type { Course, Status } from "@/types/course";
import {
  fetchFullCourseTree,
  getEffectiveStatusMap,
} from "@/utils/courseUtils";
import CourseGraph from "@/components/course-graph/CourseGraph";
import {
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Box,
  CircularProgress,
  Container,
  Divider,
  Button,
} from "@mui/material";
import CourseStatus from "@/components/course-graph/CourseStatus";

export const Route = createFileRoute("/courses/$courseId")({
  component: CourseDetail,
});

function CourseDetail() {
  const { courseId } = Route.useParams();

  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [nodesStatus, setNodesStatus] = useState<Record<string, Status>>({});

  // 1. Fetch Full Tree
  useEffect(() => {
    async function init() {
      setLoading(true);
      try {
        const treeData = await fetchFullCourseTree([courseId]);
        if (Array.isArray(treeData)) {
          setCourses(treeData);
        } else {
          console.error(
            "Unexpected return from fetchFullCourseTree:",
            treeData
          );
          setCourses([]);
        }
      } catch (error) {
        console.error("Failed to fetch course tree:", error);
        setCourses([]);
      }
      setLoading(false);
    }
    init();
  }, [courseId]);
  console.log("courses", courses);

  // 2. Identify Target Course (The one in URL)
  const targetCourse = useMemo(
    () => courses.find((c) => c.id === courseId),
    [courses, courseId]
  );

  // 3. Calculate Effective Status (Recursive Blocked Logic)
  const effectiveStatusMap = useMemo(() => {
    return getEffectiveStatusMap(courses, nodesStatus);
  }, [courses, nodesStatus]);

  if (loading)
    return (
      <Box sx={{ p: 4, display: "flex", alignItems: "center", gap: 2 }}>
        <CircularProgress size={20} />
        <Typography>Loading ...</Typography>
      </Box>
    );

  if (!targetCourse)
    return <Typography sx={{ p: 4 }}>Course not found!</Typography>;

  const { raw_data } = targetCourse;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Button
        href={`/courses/${courseId}/grade-calculator`}
        variant="contained"
      >
        Grade Calculator
      </Button>
      {/* HERO SECTION */}
      <Box mb={4}>
        <Typography variant="h3" color="primary" fontWeight="bold">
          {targetCourse.id}
        </Typography>
        <Typography variant="h5" color="text.secondary" gutterBottom>
          {targetCourse.title}
        </Typography>
        <Box display="flex" gap={1} mt={1}>
          <Chip
            label={`${raw_data.units} Units`}
            color="primary"
            variant="outlined"
          />
          <Chip
            label={`${raw_data.level}`}
            color="secondary"
            variant="outlined"
          />
        </Box>
      </Box>

      {/* LEFT: GRAPH (PATHWAY) */}
      <Paper sx={{ p: 3, m: 3, width: "60%" }}>
        <Typography variant="h6" gutterBottom fontWeight="bold">
          🗺️ Course Pathway
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <CourseGraph
          courses={courses}
          nodesStatus={effectiveStatusMap}
          onStatusChange={(updates) => {
            setNodesStatus((prev) => ({ ...prev, ...updates }));
          }}
        />
        <CourseStatus />
      </Paper>

      {/* RIGHT: INFO */}
      <Box display="flex" flexDirection="column" gap={3}>
        {/* DESCRIPTION */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            📖 Description
          </Typography>
          <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
            {raw_data.description || "No description available."}
          </Typography>
        </Paper>

        {/* PREREQUISITES LIST (TEXT) */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            🔗 Prerequisites
          </Typography>
          <Box display="flex" flexWrap="wrap" gap={1}>
            {raw_data.prerequisites_list?.length ? (
              raw_data.prerequisites_list.map((p) => (
                <Chip key={p} label={p} size="small" />
              ))
            ) : (
              <Typography color="text.secondary">None</Typography>
            )}
          </Box>
        </Paper>

        {/* ASSESSMENTS */}
        <Paper sx={{ p: 0, overflow: "hidden" }}>
          <Box p={2} bgcolor="#f5f5f5">
            <Typography variant="h6" fontWeight="bold">
              📊 Assessments
            </Typography>
          </Box>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Task</TableCell>
                  <TableCell align="right">Weight</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {raw_data.assessments?.map((a, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      {a.category}
                      {a.flags?.is_hurdle && (
                        <Chip
                          label="Hurdle"
                          color="error"
                          size="small"
                          sx={{ ml: 1, zoom: 0.7 }}
                        />
                      )}
                    </TableCell>
                    <TableCell align="right">
                      {(a.weight * 100).toFixed(0)}%
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>
    </Container>
  );
}
