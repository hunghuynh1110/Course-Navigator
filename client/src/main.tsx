import React from "react";
import ReactDOM from "react-dom/client";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { SnackbarProvider } from "notistack";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { Analytics } from "@vercel/analytics/react";

// Import Theme
import { theme } from "./theme";

// 🔥 Import cây route tự động sinh ra (Magic ở đây)
import { routeTree } from "./routeTree.gen";

// Tạo router instance
const router = createRouter({ routeTree });

// Register router for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SnackbarProvider>
        <RouterProvider router={router} />
        <Analytics />
      </SnackbarProvider>
    </ThemeProvider>
  </React.StrictMode>
);
