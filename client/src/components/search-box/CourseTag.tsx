import { Box, Typography, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

interface CourseTagProps {
  courseCode: string;
  onDelete?: () => void;
}

export default function CourseTag({ courseCode, onDelete }: CourseTagProps) {
  return (
    <Box
      sx={{
        width: { xs: "25%", sm: "100px" },
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        bgcolor: "#fff3e0", // Cream/Tag color
        border: "1px solid #ffcc80",
        borderRadius: "4px 8px 8px 4px", // Slight tag shape
        pl: 2,
        pr: onDelete ? 1 : 2,
        py: 0.5,
        boxShadow: "2px 2px 5px rgba(0,0,0,0.1)",
        transition: "transform 0.1s ease",

        // Hole punch visual
        "&::before": {
          content: '""',
          position: "absolute",
          left: "6px",
          top: "50%",
          transform: "translateY(-50%)",
          width: "6px",
          height: "6px",
          borderRadius: "50%",
          bgcolor: "white",
          border: "1px solid #e0e0e0",
        },
      }}
    >
      <Typography
        variant="body2"
        fontWeight="bold"
        color="text.primary"
        sx={{ mr: onDelete ? 1 : 0 }}
      >
        {courseCode}
      </Typography>
      {onDelete && (
        <IconButton
          size="small"
          onClick={onDelete}
          sx={{
            padding: 0.25,
            color: "text.secondary",
            "&:hover": { color: "error.main", bgcolor: "transparent" },
          }}
        >
          <CloseIcon sx={{ fontSize: 16 }} />
        </IconButton>
      )}
    </Box>
  );
}
