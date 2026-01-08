import VuiTypography from "../base/VuiTypography";
import VuiBox from "../base/VuiBox";
import ContentPasteOffIcon from "@mui/icons-material/ContentPasteOff";
import { useTranslation } from "react-i18next";

export const Empty = ({ title, iconSize = 40, sx, ...props }) => {
  const { t } = useTranslation();
  return (
    <VuiBox
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      p={5}
      {...props}
    >
      <ContentPasteOffIcon
        alt="No data"
        style={{ width: 100, marginBottom: 8, fontSize: iconSize }}
      />
      <VuiTypography variant="body1">{title || t("noData")}</VuiTypography>
    </VuiBox>
  );
};
