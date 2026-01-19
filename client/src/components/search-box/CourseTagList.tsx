import { Box } from "@mui/material";
import CourseTag from "./CourseTag";

interface CourseTagListProps {
  courses: string[];
  onRemove?: (code: string) => void;
}

export default function CourseTagList({
  courses,
  onRemove,
}: CourseTagListProps) {
  if (courses.length === 0) return null;

  return (
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        gap: 2,
        mt: 2,
        justifyContent: { xs: "center", sm: "flex-start" },
      }}
    >
      {courses.map((code) => (
        <CourseTag
          key={code}
          courseCode={code}
          onDelete={onRemove ? () => onRemove(code) : undefined}
        />
      ))}
    </Box>
  );
}
