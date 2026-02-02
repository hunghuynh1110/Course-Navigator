import { Link, useLocation } from "@tanstack/react-router";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
  Divider,
} from "@mui/material";

interface NavItem {
  label: string;
  path: string;
}

interface SidebarProps {
  mobileOpen: boolean;
  handleDrawerToggle: () => void;
  navItems: NavItem[];
}

const Sidebar = ({
  mobileOpen,
  handleDrawerToggle,
  navItems,
}: SidebarProps) => {
  const location = useLocation();

  const drawer = (
    <Box
      sx={{
        textAlign: "center",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box sx={{ flexShrink: 0 }}>
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
      </Box>
      <List sx={{ flexGrow: 1, overflowY: "auto", overflowX: "hidden" }}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem key={item.label} disablePadding>
              <ListItemButton
                component={Link}
                to={item.path}
                selected={isActive}
                sx={{
                  "&.Mui-selected": {
                    bgcolor: "rgba(150, 42, 139, 0.08)",
                    borderLeft: "4px solid #962a8b",
                    "& .MuiListItemText-primary": {
                      fontWeight: "bold",
                      color: "#51247a",
                    },
                    "&:hover": {
                      bgcolor: "rgba(150, 42, 139, 0.12)",
                    },
                  },
                }}
              >
                <ListItemText primary={item.label} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
      <Box sx={{ flexShrink: 0, p: 2 }}>
        <Divider sx={{ mb: 2 }} />
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          © {new Date().getFullYear()} UQ Navigator.
        </Typography>
      </Box>
    </Box>
  );

  return (
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
  );
};

export default Sidebar;
