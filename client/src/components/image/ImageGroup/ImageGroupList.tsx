// src/components/image/ImageGroup/ImageGroupList.tsx
import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useTranslation } from "react-i18next";

import { Image } from "../Image";
import { ImageGroupPreview } from "./ImageGroupPreview";
import { ImageHoverOverlay } from "../components/CoreImage";

export type ImageGroupListProps = {
  srcs: string[];

  objectFit?: React.CSSProperties["objectFit"];
  width?: number | string;
  height?: number | string;

  // wrapper chung của group
  className?: string;

  // wrapper của từng item
  itemClassName?: string;
  itemStyle?: React.CSSProperties;

  // wrapper của component Image
  imageClassName?: string;
  imageStyle?: React.CSSProperties;

  gap?: number | string;
  limit?: number;
  disablePreview?: boolean;
};

export const ImageGroupList: React.FC<ImageGroupListProps> = ({
  srcs,
  objectFit,
  width,
  height,
  className,
  itemClassName,
  itemStyle,
  imageClassName,
  imageStyle,
  gap = 8,
  limit = 4,
  disablePreview,
}) => {
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [errorIndexes, setErrorIndexes] = useState<number[]>([]);
  const { t: lag } = useTranslation();

  if (!srcs || srcs.length === 0) return null;

  const previewOpen = previewIndex !== null;

  const visibleCount = Math.min(limit, srcs.length);
  const hiddenCount = srcs.length - visibleCount;

  const handleOpenPreview = (index: number) => {
    if (disablePreview) return;
    setPreviewIndex(index);
  };

  const handleClosePreview = () => setPreviewIndex(null);

  useEffect(() => {
    if (previewOpen) setHoverIndex(null);
  }, [previewOpen]);

  useEffect(() => {
    document.body.style.overflow = previewOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [previewOpen]);

  const markError = (index: number) => {
    setErrorIndexes((prev) => (prev.includes(index) ? prev : [...prev, index]));
  };

  const gapValue = typeof gap === "number" ? `${gap}px` : gap;

  return (
    <>
      <Box
        className={className}
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: gapValue,
        }}
      >
        {srcs.slice(0, visibleCount).map((src, idx) => {
          const globalIndex = idx; // vì slice từ 0
          const isLastVisible = idx === visibleCount - 1 && hiddenCount > 0;
          const hasError = errorIndexes.includes(globalIndex);

          return (
            <Box
              key={`${src}-${idx}`}
              className={itemClassName}
              sx={{
                position: "relative",
                display: "inline-block",
                cursor: disablePreview ? "default" : "pointer",
                overflow: "hidden",
                borderRadius: 2,
                width,
                height,
              }}
              style={itemStyle}
              onClick={() => handleOpenPreview(globalIndex)}
              onMouseEnter={() => setHoverIndex(globalIndex)}
              onMouseLeave={() =>
                setHoverIndex((prev) => (prev === globalIndex ? null : prev))
              }
            >
              <Image
                src={src}
                objectFit={objectFit ?? "cover"}
                width={width}
                height={height}
                disablePreview
                className={imageClassName}
                style={imageStyle}
                imgProps={{
                  onError: () => {
                    markError(globalIndex);
                  },
                }}
              />

              {/* overlay +N cho phần dư */}
              {isLastVisible && hiddenCount > 0 && (
                <Box
                  sx={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: "rgba(0,0,0,0.5)",
                    zIndex: 3,
                  }}
                >
                  <Typography
                    sx={{ color: "#fff", fontSize: 18, fontWeight: 600 }}
                  >
                    +{hiddenCount}
                  </Typography>
                </Box>
              )}

              {/* hover overlay preview (nếu không lỗi & không disable) */}
              {!hasError && !disablePreview && hoverIndex === globalIndex && (
                <ImageHoverOverlay
                  onClick={(e) => {
                    e.stopPropagation();
                    setPreviewIndex(globalIndex);
                  }}
                >
                  <Typography variant="body2" sx={{ color: "#fff" }}>
                    {lag("camera:action:preview")}
                  </Typography>
                </ImageHoverOverlay>
              )}
            </Box>
          );
        })}
      </Box>

      {previewOpen && (
        <ImageGroupPreview
          srcs={srcs}
          initialIndex={previewIndex ?? 0}
          objectFit={objectFit}
          onClose={handleClosePreview}
        />
      )}
    </>
  );
};
