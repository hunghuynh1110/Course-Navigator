import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { Container, Box } from "@mui/material";
import { Analytics } from "@vercel/analytics/react";
import NotFound from "../components/NotFound";
import ErrorComponent from "../components/ErrorComponent";
import { useState } from "react";
import Navbar from "../components/layout/Navbar";
import Sidebar from "../components/layout/Sidebar";
import Footer from "../components/layout/Footer";

export const Route = createRootRoute({
  component: RootLayout,
  notFoundComponent: NotFound,
  errorComponent: ErrorComponent,
});

function RootLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const navItems = [
    { label: "Dashboard", path: "/" },
    { label: "About", path: "/about" },
    { label: "Grade", path: "/grade" },
  ];

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
      }}
    >
      <Navbar handleDrawerToggle={handleDrawerToggle} navItems={navItems} />

      <Sidebar
        mobileOpen={mobileOpen}
        handleDrawerToggle={handleDrawerToggle}
        navItems={navItems}
      />

      <Container component="main" maxWidth={false} sx={{ mt: 2, flexGrow: 1 }}>
        <Outlet />
      </Container>

      <Footer />

      <TanStackRouterDevtools position="bottom-right" />
      <Analytics />
    </Box>
  );
}
