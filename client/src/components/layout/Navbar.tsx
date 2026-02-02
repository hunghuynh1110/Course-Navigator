import { Link } from "@tanstack/react-router";
import { AppBar, Toolbar, Button, Box, IconButton } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";

interface NavItem {
  label: string;
  path: string;
}

interface NavbarProps {
  handleDrawerToggle: () => void;
  navItems: NavItem[];
}

const Navbar = ({ handleDrawerToggle, navItems }: NavbarProps) => {
  return (
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
          disableRipple={true}
          sx={{
            fontSize: { xs: 24, md: 30 },
            fontWeight: "bold",
            background: "linear-gradient(to right, #fbc2eb, #a6c1ee)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            flexGrow: { xs: 1, md: 0 },
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
  );
};

export default Navbar;
