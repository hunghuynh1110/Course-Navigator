import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/supabaseClient";
import type { Course } from "@/types/course";
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
  Grid,
  CircularProgress,
} from "@mui/material";

// 1. Define Route accepting parameter $courseId
export const Route = createFileRoute("/courses/$courseId")({
  component: CourseDetail,
});

function CourseDetail() {
  // 2. Get courseId from URL
  const { courseId } = Route.useParams();

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCourse() {
      // Call Supabase to get exactly 1 course
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("id", courseId)
        .single();

      if (!error && data) {
        setCourse(data as unknown as Course);
      }
      setLoading(false);
    }
    fetchCourse();
  }, [courseId]);

  if (loading)
    return (
      <Box sx={{ p: 4, display: "flex", alignItems: "center", gap: 2 }}>
        <CircularProgress size={20} />
        <Typography>Loading course info for {courseId}...</Typography>
      </Box>
    );

  if (!course) return <Typography sx={{ p: 4 }}>Course not found!</Typography>;

  const { raw_data } = course;

  return (
    <Box sx={{ py: 4 }}>
      {/* HEADER */}
      <Typography variant="h3" color="primary" fontWeight="bold">
        {course.id}
      </Typography>
      <Typography variant="h5" color="text.secondary" gutterBottom>
        {course.title}
      </Typography>

      <Grid container spacing={4} sx={{ mt: 2 }}>
        {/* LEFT COLUMN: INFO & DESCRIPTION */}
        <Grid sx={{ xs: 12, md: 7 }}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              📖 Course Description
            </Typography>
            <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
              {raw_data.description || "No description available."}
            </Typography>

            <Box sx={{ mt: 3, display: "flex", gap: 1 }}>
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
          </Paper>

          {/* PREREQUISITES */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              🔗 Prerequisites
            </Typography>
            {raw_data.prerequisites_list &&
            raw_data.prerequisites_list.length > 0 ? (
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                {raw_data.prerequisites_list.map((pre) => (
                  <Chip
                    key={pre}
                    label={pre}
                    // Note: Using window.location forces a reload.
                    // Consider using the router's <Link> or useNavigate later for smoother transitions.
                    onClick={() => (window.location.href = `/courses/${pre}`)}
                    clickable
                  />
                ))}
              </Box>
            ) : (
              <Typography color="text.secondary">
                No prerequisites required.
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* RIGHT COLUMN: ASSESSMENTS */}
        <Grid sx={{ xs: 12, md: 5 }}>
          <Typography
            variant="h6"
            gutterBottom
            fontWeight="bold"
            sx={{ px: 1 }}
          >
            📊 Assessment Structure
          </Typography>
          <TableContainer component={Paper} elevation={3}>
            <Table>
              <TableHead sx={{ bgcolor: "#f5f5f5" }}>
                <TableRow>
                  <TableCell>
                    <strong>Task</strong>
                  </TableCell>
                  <TableCell align="right">
                    <strong>Weight</strong>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {raw_data.assessments?.map((assessment, index) => (
                  <TableRow key={index}>
                    <TableCell component="th" scope="row">
                      {assessment.category}
                      {/* Display Hurdle flag if present */}
                      {assessment.flags?.is_hurdle && (
                        <Chip
                          label="Hurdle"
                          color="error"
                          size="small"
                          sx={{ ml: 1, height: 20, fontSize: "0.6rem" }}
                        />
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <Chip
                        label={`${(assessment.weight * 100).toFixed(0)}%`}
                        color="primary"
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>
    </Box>
  );
}
