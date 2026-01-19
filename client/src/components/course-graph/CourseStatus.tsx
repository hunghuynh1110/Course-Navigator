import { Box, Typography } from "@mui/material";

const CourseStatus = () => {
  return (
    <Box mt={2} display="flex" gap={2} alignItems="center">
      <Typography variant="caption" color="text.secondary">
        Legend:
      </Typography>
      <Box display="flex" alignItems="center" gap={0.5}>
        <Box
          sx={{
            w: 12,
            h: 12,
            bgcolor: "#e0e0e0",
            borderRadius: "50%",
            width: 12,
            height: 12,
          }}
        />
        <Typography variant="caption">Not Started</Typography>
      </Box>
      <Box display="flex" alignItems="center" gap={0.5}>
        <Box
          sx={{
            w: 12,
            h: 12,
            bgcolor: "#a5d6a7",
            borderRadius: "50%",
            width: 12,
            height: 12,
          }}
        />
        <Typography variant="caption">Passed</Typography>
      </Box>
      <Box display="flex" alignItems="center" gap={0.5}>
        <Box
          sx={{
            w: 12,
            h: 12,
            bgcolor: "#ef9a9a",
            borderRadius: "50%",
            width: 12,
            height: 12,
          }}
        />
        <Typography variant="caption">Failed</Typography>
      </Box>
      <Box display="flex" alignItems="center" gap={0.5}>
        <Box
          sx={{
            w: 12,
            h: 12,
            bgcolor: "#757575",
            borderRadius: "50%",
            width: 12,
            height: 12,
          }}
        />
        <Typography variant="caption">Blocked</Typography>
      </Box>
    </Box>
  );
};

export default CourseStatus;
