import { createFileRoute } from "@tanstack/react-router";
import { Container, Typography, Box } from "@mui/material";

export const Route = createFileRoute("/create")({
  component: CreatePage,
});

function CreatePage() {
  return (
    <Container sx={{ py: 4 }}>
      <Box>
        <Typography variant="h4" gutterBottom>
          Create Course
        </Typography>
        {/* Add your create course form here */}
      </Box>
    </Container>
  );
}
