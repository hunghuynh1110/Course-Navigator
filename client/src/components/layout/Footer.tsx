import { Box, Typography, IconButton } from "@mui/material";
import GitHubIcon from "@mui/icons-material/GitHub";
import LinkedInIcon from "@mui/icons-material/LinkedIn";

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: "auto",
        textAlign: "center",
        bgcolor: (theme) => theme.palette.grey[100],
      }}
    >
      <Typography variant="body2" color="text.secondary" gutterBottom>
        © {new Date().getFullYear()} UQ Navigator. All rights reserved.
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Developed by Gia Hung Huynh (Tony)
      </Typography>
      <Box display="flex" justifyContent="center" gap={1}>
        <IconButton
          component="a"
          href="https://github.com/hunghuynh1110"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub"
          size="small"
          color="inherit"
        >
          <GitHubIcon />
        </IconButton>
        <IconButton
          component="a"
          href="https://www.linkedin.com/in/gia-hung-huynh-1966772b9/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="LinkedIn"
          size="small"
          color="inherit"
        >
          <LinkedInIcon />
        </IconButton>
      </Box>
    </Box>
  );
};

export default Footer;
