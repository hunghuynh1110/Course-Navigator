import { Box, Typography } from "@mui/material";
import CourseTag from "./CourseTag";

interface SelectedCoursesBarProps {
  courses: string[];
  onRemove: (code: string) => void;
}

export default function SelectedCoursesBar({
  courses,
  onRemove,
}: SelectedCoursesBarProps) {
  if (courses.length === 0) return null;

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        overflowX: "auto",
        p: 2,
        bgcolor: "rgba(255, 255, 255, 0.5)",
        backdropFilter: "blur(10px)",
        borderRadius: 2,
        border: "1px solid rgba(255, 255, 255, 0.3)",
        mt: 2,
        minHeight: "60px",
      }}
    >
      <Typography variant="caption" color="text.secondary" sx={{ mr: 1, whiteSpace: "nowrap" }}>
        Selected:
      </Typography>
      {courses.map((code) => (
        <CourseTag key={code} courseCode={code} onDelete={() => onRemove(code)} />
      ))}
    </Box>
  );
}
