import React, { useState } from "react";
import { createPortal } from "react-dom";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import CloseIcon from "@mui/icons-material/Close";

import { Interactive } from "../components/Interactive";
import { IMAGE_ZINDEX } from "../utils";
import { ImagePreviewStyled, growLarger } from "../style";

export type ImageGroupPreviewProps = {
  srcs: string[];
  initialIndex?: number;
  objectFit?: React.CSSProperties["objectFit"];
  onClose: () => void;
};

export const ImageGroupPreview: React.FC<ImageGroupPreviewProps> = ({
  srcs,
  initialIndex = 0,
  objectFit,
  onClose,
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(initialIndex);

  if (!srcs || srcs.length === 0) return null;

  const activeSrc = srcs[currentIndex] ?? srcs[0];

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + srcs.length) % srcs.length);
  };

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % srcs.length);
  };

  return createPortal(
    <ImagePreviewStyled>
      <Box
        sx={{
          position: "fixed",
          inset: 0,
          zIndex: IMAGE_ZINDEX.previewRoot,
        }}
      >
        {/* Mask */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            bgcolor: "rgba(0,0,0,0.40)",
            zIndex: IMAGE_ZINDEX.previewMask,
          }}
          onClick={onClose}
        />

        {/* Main */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            zIndex: IMAGE_ZINDEX.previewMask + 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={onClose}
        >
          {/* Close */}
          <Box
            sx={{
              position: "absolute",
              top: 16,
              right: 16,
              borderRadius: "999px",
              bgcolor: "rgba(0,0,0,0.60)",
              zIndex: IMAGE_ZINDEX.previewBtn,
            }}
          >
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
            >
              <CloseIcon htmlColor="#fff" fontSize="small" />
            </IconButton>
          </Box>

          {/* Prev / Next */}
          {srcs.length > 1 && (
            <>
              <IconButton
                sx={{
                  position: "absolute",
                  top: "50%",
                  left: 16,
                  transform: "translateY(-50%)",
                  bgcolor: "rgba(0,0,0,0.60)",
                  zIndex: IMAGE_ZINDEX.previewBtn,
                  "&:hover": { bgcolor: "rgba(0,0,0,0.70)" },
                }}
                size="large"
                onClick={handlePrev}
              >
                <ChevronLeftIcon htmlColor="#fff" />
              </IconButton>

              <IconButton
                sx={{
                  position: "absolute",
                  top: "50%",
                  right: 16,
                  transform: "translateY(-50%)",
                  bgcolor: "rgba(0,0,0,0.60)",
                  zIndex: IMAGE_ZINDEX.previewBtn,
                  "&:hover": { bgcolor: "rgba(0,0,0,0.70)" },
                }}
                size="large"
                onClick={handleNext}
              >
                <ChevronRightIcon htmlColor="#fff" />
              </IconButton>
            </>
          )}

          {/* Interactive */}
          <Interactive
            src={String(currentIndex)}
            interactElement={
              <Box
                sx={{
                  position: "absolute",
                  inset: 0,
                  zIndex: IMAGE_ZINDEX.interactiveOverlay,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
              />
            }
          >
            <Box
              component="img"
              src={activeSrc}
              onClick={(e) => e.stopPropagation()}
              sx={{
                display: "block",
                margin: "auto",
                maxHeight: "90vh",
                maxWidth: "100vw",
                objectFit: (objectFit as React.CSSProperties["objectFit"]) || "contain",
                borderRadius: 1,
                animation: `${growLarger} 0.4s ease`,
              }}
            />
          </Interactive>

          {/* Thumbnails */}
          {srcs.length > 1 && (
            <Box
              sx={{
                position: "absolute",
                bottom: 64,
                left: "50%",
                transform: "translateX(-50%)",
                display: "flex",
                gap: 1,
                maxWidth: "80vw",
                overflowX: "auto",
                bgcolor: "rgba(0,0,0,0.60)",
                px: 1.5,
                py: 1,
                borderRadius: 1,
                zIndex: IMAGE_ZINDEX.previewBtn,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {srcs.map((thumbSrc, idx) => {
                const active = idx === currentIndex;
                return (
                  <Box
                    key={`${thumbSrc}-${idx}`}
                    component="button"
                    type="button"
                    onClick={() => setCurrentIndex(idx)}
                    sx={{
                      flexShrink: 0,
                      border: "2px solid",
                      borderColor: active ? "primary.main" : "transparent",
                      borderRadius: 1,
                      overflow: "hidden",
                      padding: 0,
                      cursor: "pointer",
                      opacity: active ? 1 : 0.75,
                      "&:hover": { opacity: 1 },
                    }}
                  >
                    <Box
                      component="img"
                      src={thumbSrc}
                      draggable={false}
                      sx={{ width: 64, height: 64, objectFit: "cover", display: "block" }}
                    />
                  </Box>
                );
              })}
            </Box>
          )}
        </Box>
      </Box>
    </ImagePreviewStyled>,
    document.querySelector("#root") || document.body
  );
};
