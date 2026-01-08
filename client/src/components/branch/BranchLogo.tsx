import { Box } from "@mui/material";
import { Image } from "../image";

export type BranchLogoProps = {
  appName?: string;
  size?: "default" | "mini";
  width?: number | string;
  height?: number | string;
};

export const BranchLogo = ({ size = "default" }: BranchLogoProps) => {
  const collapse = size === "mini";

  const logoData = {
    logo: `/branch/logo.png`,
    logoMini: `/branch/logo_mini.png`,
  };

  return (
    <Box>
      <>
        <Box
          sx={{
            opacity: collapse ? 1 : 0,
            transition: "opacity 0.2s ease",
          }}
          width={collapse ? "auto" : 0}
          height={collapse ? "auto" : 0}
        >
          <Image src={logoData.logo} alt="Logo full" disablePreview width={120} />
        </Box>
        <Box
          sx={{
            opacity: collapse ? 0 : 1,
            transition: "opacity 0.2s ease",
            marginX: "auto",
          }}
        >
          <Image
            src={logoData.logoMini}
            alt="Logo mini"
            width={!collapse ? 40 : 0}
            disablePreview
          />
        </Box>
      </>
    </Box>
  );
};
