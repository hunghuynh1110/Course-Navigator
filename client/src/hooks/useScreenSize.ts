import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

/**
 * Returns an integer representing the screen size based on MUI breakpoints.
 * 0: xs (<600px)
 * 1: sm (600px - 900px)
 * 2: md (900px - 1200px)
 * 3: lg (1200px - 1536px)
 * 4: xl (>1536px)
 */
export const useScreenSize = (): number => {
  const theme = useTheme();
  const isXl = useMediaQuery(theme.breakpoints.up("xl"));
  const isLg = useMediaQuery(theme.breakpoints.up("lg"));
  const isMd = useMediaQuery(theme.breakpoints.up("md"));
  const isSm = useMediaQuery(theme.breakpoints.up("sm"));

  if (isXl) return 4;
  if (isLg) return 3;
  if (isMd) return 2;
  if (isSm) return 1;
  return 0;
};
