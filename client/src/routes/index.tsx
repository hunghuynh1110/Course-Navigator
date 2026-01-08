import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import type { Course } from "../types/course";
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Grid,
  CircularProgress,
  Box,
} from "@mui/material";
import { Link, useNavigate } from "@tanstack/react-router";

// 🔥 Định nghĩa Route tại đây
export const Route = createFileRoute("/")({
  component: Dashboard,
});

function Dashboard() {
  const navigate = useNavigate();

  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCourses() {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .limit(12);

      if (!error && data) {
        setCourses(data as unknown as Course[]);
      }
      setLoading(false);
    }
    fetchCourses();
  }, []);

  if (loading) return <CircularProgress />;

  return (
    <Grid container spacing={3}>
      {courses.map((course) => (
        <Grid sx={{ xs: 12, md: 6, lg: 4 }} key={course.id}>
          <Card
            sx={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              hover: { boxShadow: 6 },
              cursor: "pointer",
            }}
            onClick={() => {
              navigate({ to: `/courses/${course.id}` });
            }}
          >
            <CardContent>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={1}
              >
                <Typography variant="h6" color="primary" fontWeight="bold">
                  {course.id}
                </Typography>
                <Chip
                  label={`${course.raw_data.units} Units`}
                  size="small"
                  component={Link}
                />
              </Box>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  display: "-webkit-box",
                  overflow: "hidden",
                  WebkitBoxOrient: "vertical",
                  WebkitLineClamp: 3,
                }}
              >
                {course.raw_data.description}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
