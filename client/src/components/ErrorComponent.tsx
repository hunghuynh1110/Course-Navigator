import { Box, Button, Typography, Container } from "@mui/material";
import { Link, useRouter } from "@tanstack/react-router";

export default function ErrorComponent({ error }: { error: Error }) {
  const router = useRouter();

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "60vh",
          textAlign: "center",
        }}
      >
        <Typography
          variant="h1"
          color="error"
          sx={{ fontSize: "6rem", fontWeight: "bold" }}
        >
          Oops!
        </Typography>
        <Typography variant="h4" gutterBottom>
          Something went wrong
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          {error.message || "An unexpected error occurred."}
        </Typography>
        <Box display="flex" gap={2} mt={3}>
          <Button
            variant="outlined"
            size="large"
            onClick={() => {
              router.invalidate();
              window.location.reload();
            }}
          >
            Try Again
          </Button>
          <Button component={Link} to="/" variant="contained" size="large">
            Go Home
          </Button>
        </Box>
      </Box>
    </Container>
  );
}
