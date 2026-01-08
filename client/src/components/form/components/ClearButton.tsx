import { InputAdornment, IconButton, Tooltip } from "@mui/material";
import ClearIcon from "@mui/icons-material/Close";
import { useTranslation } from "react-i18next";

type Props = {
  onClear: () => void;
  show: boolean;
  disabled?: boolean;
};

export const ClearAdornment = ({ onClear, show, disabled }: Props) => {
  const { t: lag } = useTranslation();
  if (!show) return null;

  return (
    <InputAdornment position="end">
      <Tooltip title={lag("form:clear")}>
        <span>
          <IconButton size="small" onClick={onClear} disabled={disabled} edge="end">
            <ClearIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
    </InputAdornment>
  );
};
