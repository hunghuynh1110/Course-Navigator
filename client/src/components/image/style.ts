import { styled, keyframes } from "@mui/material/styles";

export const growLarger = keyframes`
  from { transform: scale(0.96); opacity: 0.9; }
  to   { transform: scale(1); opacity: 1; }
`;

export const ImagePreviewStyled = styled("div")(() => ({}));
