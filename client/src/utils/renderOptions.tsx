import { useTranslation } from "react-i18next";
import { Chip } from "@mui/material";

export const renderStatusChip = (v: string): React.ReactNode => {
  const { t } = useTranslation();

  const map: Record<string, { color?: "success" | "warning" | "primary" | "default" }> = {
    running: { color: "success" },
    charging: { color: "warning" },
    active: { color: "success" },
    inactive: { color: "default" },
    monitoring: { color: "primary" },
    idle: { color: "default" },
  };
  return (
    <Chip label={t(`page:user.robotList.statusOptions.${v}`)} color={map[v]?.color} size="small" />
  );
};
