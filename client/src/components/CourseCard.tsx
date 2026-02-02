import { Card, CardContent, Typography, Chip, Box } from "@mui/material";
import type { Course } from "../types/course";

interface CourseCardProps {
  course: Course;
  onClick?: () => void;
}

export default function CourseCard({ course, onClick }: CourseCardProps) {
  return (
    <Card
      sx={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        transition: "0.3s",
        "&:hover": {
          boxShadow: 6,
          transform: "translateY(-4px)",
        },
        cursor: onClick ? "pointer" : "default",
      }}
      onClick={onClick}
    >
      <CardContent
        sx={{
          p: { xs: 1.5, sm: 2 },
          "&:last-child": { pb: { xs: 1.5, sm: 2 } },
        }}
      >
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={1}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              alignItems: "flex-start",
              gap: 1,
              overflow: "hidden",
            }}
          >
            <Typography
              variant="h5"
              color="primary"
              fontWeight="bold"
              sx={{
                whiteSpace: "nowrap",
                fontSize: { xs: "1.1rem", sm: "1.5rem" },
              }}
            >
              {course.id}
            </Typography>

            <Typography
              variant="h6"
              color="text.secondary"
              fontWeight="bold"
              noWrap
              sx={{
                minWidth: 0,
                fontSize: { xs: "1rem", sm: "1.25rem" },
              }}
            >
              {course.title}
            </Typography>
          </Box>
          <Box
            display="flex"
            gap={1}
            flexDirection={{ xs: "column", sm: "row" }}
          >
            <Chip
              label={`${course.raw_data.units} Units`}
              size="small"
              sx={{
                height: { xs: 20, sm: 24 },
                fontSize: { xs: "0.75rem", sm: "0.8125rem" },
              }}
            />
          </Box>
        </Box>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            width: "100%",
            display: "-webkit-box",
            overflow: "hidden",
            WebkitBoxOrient: "vertical",
            WebkitLineClamp: 3,
            minHeight: { xs: "4em", sm: "4.5em" },
          }}
        >
          {course.raw_data.description}
        </Typography>
      </CardContent>
    </Card>
  );
}
