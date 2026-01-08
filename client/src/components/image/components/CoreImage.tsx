import { Box } from "@mui/material";
import type { HTMLAttributes, ReactNode } from "react";

export type ImageHoverOverlayProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
};

export const ImageHoverOverlay = ({ children, ...props }: ImageHoverOverlayProps) => {
  return (
    <Box
      {...props}
      sx={{
        position: "absolute",
        inset: 0,
        zIndex: 10,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "rgba(0,0,0,0.4)",
        cursor: "pointer",
        ...(props as any).sx,
      }}
    >
      {children}
    </Box>
  );
};
