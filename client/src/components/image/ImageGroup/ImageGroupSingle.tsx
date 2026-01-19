import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import { Image } from "../Image";
import { ImageGroupPreview } from "./ImageGroupPreview";
import { ImageHoverOverlay } from "../components/CoreImage";
import { useTranslation } from "react-i18next";

export type ImageGroupCommonProps = {
  srcs: string[];
  objectFit?: React.CSSProperties["objectFit"];
  width?: number | string;
  height?: number | string;

  className?: string;
  itemClassName?: string;
  itemStyle?: React.CSSProperties;

  imageClassName?: string;
  imageStyle?: React.CSSProperties;

  gap?: number | string;
  limit?: number;
  disablePreview?: boolean;
};

export type ImageGroupSingleProps = ImageGroupCommonProps;

export const ImageGroupSingle: React.FC<ImageGroupSingleProps> = ({
  srcs,
  objectFit,
  width,
  height,
  className,
  itemStyle,
  imageClassName,
  imageStyle,
  disablePreview,
}) => {
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const [hover, setHover] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t: lag } = useTranslation();

  const previewOpen = previewIndex !== null;

  if (!srcs || srcs.length === 0) return null;

  const handleOpenPreview = () => {
    if (disablePreview) return;
    setPreviewIndex(0);
  };

  useEffect(() => {
    if (previewOpen) setHover(false);
  }, [previewOpen]);

  useEffect(() => {
    document.body.style.overflow = previewOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [previewOpen]);

  return (
    <>
      <Box
        className={className}
        sx={{
          position: "relative",
          display: "inline-block",
          cursor: "pointer",
          width,
          height,
          borderRadius: 2,
          overflow: "hidden",
        }}
        style={itemStyle}
        onClick={handleOpenPreview}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        <Image
          src={srcs[0]}
          objectFit={objectFit ?? "cover"}
          width={width}
          height={height}
          disablePreview
          className={imageClassName}
          style={imageStyle}
          imgProps={{
            onError: (e) => {
              setError(String(e));
            },
          }}
        />

        {!error && !disablePreview && hover && (
          <ImageHoverOverlay
            onClick={(e) => {
              e.stopPropagation();
              setPreviewIndex(0);
            }}
          >
            <Typography variant="body2" sx={{ color: "#fff" }}>
              {lag("camera:action:preview")}
            </Typography>
          </ImageHoverOverlay>
        )}
      </Box>

      {previewOpen && (
        <ImageGroupPreview
          srcs={srcs}
          initialIndex={previewIndex ?? 0}
          objectFit={objectFit}
          onClose={() => setPreviewIndex(null)}
        />
      )}
    </>
  );
};
