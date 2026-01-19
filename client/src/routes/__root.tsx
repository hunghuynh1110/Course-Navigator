import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { AppBar, Toolbar, Button, Container, Box } from "@mui/material";
import { Analytics } from "@vercel/analytics/react";
import NotFound from "../components/NotFound";
import ErrorComponent from "../components/ErrorComponent";

export const Route = createRootRoute({
  component: RootLayout,
  notFoundComponent: NotFound,
  errorComponent: ErrorComponent,
});

function RootLayout() {
  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Button
            color="inherit"
            component={Link}
            to="/"
            sx={{
              fontSize: 30,
              fontWeight: "bold",
              background: "linear-gradient(to right, #fbc2eb, #a6c1ee)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            UQ Navigator
          </Button>
          <Box
            sx={{ flexGrow: 1, justifyContent: "flex-end", display: "flex" }}
          >
            <Button color="inherit" component={Link} to="/">
              Dashboard
            </Button>
            <Button color="inherit" component={Link} to="/about">
              About
            </Button>
            <Button color="inherit" component={Link} to="/grade">
              Grade
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth={false} sx={{ mt: 2 }}>
        <Outlet />
      </Container>

      <TanStackRouterDevtools />
      <Analytics />
    </>
  );
}
