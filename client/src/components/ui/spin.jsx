import { CircularProgress } from "@mui/material";

export const Spin = ({ className, size = 40 }) => {
  return <CircularProgress size={size} className={className} />;
};
