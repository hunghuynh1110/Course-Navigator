import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import {
  AppBar,
  Toolbar,
  Button,
  Container,
  Box,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
  Divider,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { Analytics } from "@vercel/analytics/react";
import NotFound from "../components/NotFound";
import ErrorComponent from "../components/ErrorComponent";
import { useState } from "react";

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

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: "center" }}>
      <Typography
        variant="h6"
        sx={{
          my: 2,
          fontWeight: "bold",
          fontSize: "1.5rem",
          background: "linear-gradient(to right, #fbc2eb, #a6c1ee)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        UQ Navigator
      </Typography>
      <Divider />
      <List>
        {navItems.map((item) => (
          <ListItem key={item.label} disablePadding>
            <ListItemButton component={Link} to={item.path}>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: "none" } }}
          >
            <MenuIcon />
          </IconButton>
          <Button
            color="inherit"
            component={Link}
            to="/"
            sx={{
              fontSize: { xs: 24, md: 30 },
              fontWeight: "bold",
              background: "linear-gradient(to right, #fbc2eb, #a6c1ee)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              flexGrow: { xs: 1, md: 0 }, // Center on mobile if needed or take space
              textAlign: { xs: "center", md: "left" },
            }}
          >
            UQ Navigator
          </Button>
          <Box
            sx={{
              flexGrow: 1,
              justifyContent: "flex-end",
              display: { xs: "none", md: "flex" },
            }}
          >
            {navItems.map((item) => (
              <Button
                key={item.label}
                color="inherit"
                component={Link}
                to={item.path}
              >
                {item.label}
              </Button>
            ))}
          </Box>
        </Toolbar>
      </AppBar>

      <nav>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: 240,
            },
          }}
        >
          {drawer}
        </Drawer>
      </nav>

      <Container maxWidth={false} sx={{ mt: 2 }}>
        <Outlet />
      </Container>

      <TanStackRouterDevtools />
      <Analytics />
    </>
  );
}
