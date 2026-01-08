// src/components/image/Image.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import type { ImgHTMLAttributes } from "react";

import Skeleton from "@mui/material/Skeleton";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import ImageNotSupportedOutlinedIcon from "@mui/icons-material/ImageNotSupportedOutlined";
import { useTranslation } from "react-i18next";

import { ImageHoverOverlay } from "./components/CoreImage";
import { ImagePreview } from "./components/ImagePreview";
import type { ImageOptionsDef } from "./type";

export type ImageProps = Omit<ImgHTMLAttributes<HTMLDivElement>, "src" | "width" | "height"> &
  ImageOptionsDef & {
    src: string;
    objectFit?: React.CSSProperties["objectFit"];
    className?: string;
    disablePreview?: boolean;

    width?: number | string;
    height?: number | string;

    fallbackSrc?: string | string[];
    fallbackNode?: React.ReactNode;

    imgProps?: Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src" | "width" | "height">;

    onLoading?: (loading: boolean) => void;
    onError?: (message: string) => void;
  };

export const Image: React.FC<ImageProps> = ({
  src,
  width,
  height,
  objectFit = "cover",
  className,
  disablePreview,
  fallbackSrc,
  fallbackNode,
  imgProps = {},

  onLoading,
  onError,
  style,
  ...wrapperProps
}) => {
  const { t: lag } = useTranslation();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState(false);
  const [preview, setPreview] = useState(false);

  const [currentSrc, setCurrentSrc] = useState(src);
  const [fallbackIndex, setFallbackIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fallbackList = useMemo(() => {
    if (!fallbackSrc) return [];
    return Array.isArray(fallbackSrc) ? fallbackSrc.filter(Boolean) : [fallbackSrc];
  }, [fallbackSrc]);

  useEffect(() => {
    setCurrentSrc(src);
    setFallbackIndex(0);
    setErrorMessage(null);
    setLoading(true);
  }, [src]);

  useEffect(() => {
    onLoading?.(loading);
  }, [loading, onLoading]);

  useEffect(() => {
    if (errorMessage) onError?.(errorMessage);
  }, [errorMessage, onError]);

  const tryNextFallback = () => {
    const nextIdx = fallbackIndex;
    if (nextIdx < fallbackList.length) {
      setCurrentSrc(fallbackList[nextIdx]);
      setFallbackIndex(nextIdx + 1);
      setErrorMessage(null);
      setLoading(true);
      return;
    }

    setErrorMessage("Image failed to load and no fallback left");
    setLoading(false);
  };

  const handleError = () => {
    imgProps?.onError?.(new Event("error") as any);
    tryNextFallback();
  };

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    imgProps?.onLoad?.(e);
    setErrorMessage(null);
    setLoading(false);
  };

  const showFallbackUI = !!errorMessage;

  useEffect(() => {
    if (preview) {
      setHover(false);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [preview]);

  return (
    <Box
      {...wrapperProps}
      ref={wrapperRef}
      className={className}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      sx={{
        position: "relative",
        overflow: "hidden",
        borderRadius: 2,
        width,
        height,
      }}
      style={style}
    >
      {/* MAIN or FALLBACK */}
      {!showFallbackUI ? (
        <Box
          component="img"
          {...imgProps}
          src={currentSrc}
          onError={handleError}
          onLoad={handleLoad}
          loading={imgProps.loading ?? "lazy"}
          decoding={imgProps.decoding ?? "async"}
          alt={imgProps.alt ?? "image"}
          draggable={imgProps.draggable ?? false}
          sx={{
            display: "block",
            width: "100%",
            height: "100%",
            objectFit,
            ...(imgProps?.style ? {} : {}),
          }}
          style={imgProps.style}
        />
      ) : fallbackNode ? (
        <Box
          sx={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {fallbackNode}
        </Box>
      ) : (
        <Box
          sx={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "rgba(0,0,0,0.04)",
            px: 2,
            textAlign: "center",
          }}
        >
          <ImageNotSupportedOutlinedIcon />
          <Typography variant="body2" noWrap sx={{ mt: 0.5, opacity: 0.7, maxWidth: "100%" }}>
            {lag("cpn:image:imageNotAvailable")}
          </Typography>
        </Box>
      )}

      {/* LOADING OVERLAY */}
      {loading && (
        <Box
          sx={{
            pointerEvents: "none",
            position: "absolute",
            inset: 0,
            zIndex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Skeleton animation="wave" variant="rounded" width="100%" height="100%" />
        </Box>
      )}

      {/* PREVIEW OVERLAY */}
      {!showFallbackUI && !loading && !disablePreview && hover && (
        <ImageHoverOverlay
          onClick={(e) => {
            e.stopPropagation();
            setPreview(true);
          }}
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 2,
          }}
        >
          <Typography variant="body2" sx={{ color: "#fff" }}>
            {lag("camera:action:preview")}
          </Typography>
        </ImageHoverOverlay>
      )}

      {/* FULLSCREEN PREVIEW */}
      {preview && !loading && !showFallbackUI && (
        <ImagePreview objectFit={objectFit} src={currentSrc} onClose={() => setPreview(false)} />
      )}
    </Box>
  );
};
