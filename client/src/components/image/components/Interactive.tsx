import React, {
  Children,
  cloneElement,
  isValidElement,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";

import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import SwapHorizontalCircleOutlinedIcon from "@mui/icons-material/SwapHorizontalCircleOutlined";
import SwapVerticalCircleOutlinedIcon from "@mui/icons-material/SwapVerticalCircleOutlined";
import RotateLeftOutlinedIcon from "@mui/icons-material/RotateLeftOutlined";
import RotateRightOutlinedIcon from "@mui/icons-material/RotateRightOutlined";

import { IMAGE_ZINDEX } from "../utils";

type Props = {
  src?: string;
  className?: string;
  children: ReactNode;
  interactElement?: ReactNode;
  style?: React.CSSProperties;
  zIndex?: number;
  [key: string]: any;
};

const scaleStep = 0.32;

export const Interactive = ({
  src,
  children,
  interactElement,
  style,
  zIndex = IMAGE_ZINDEX.previewMask,
  ...props
}: Props) => {
  const EDGE_SAFE_PX = 32;

  const [scale, setScale] = useState(1);
  const [rotate, setRotate] = useState(0);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const [dragging, setDragging] = useState(false);
  const [snapping, setSnapping] = useState(false);

  const [pos, setPos] = useState<[number, number]>([0, 0]);
  const [offset, setOffset] = useState<[number, number]>([0, 0]);

  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setScale(1);
    setRotate(0);
    setRotateX(0);
    setRotateY(0);
    setPos([0, 0]);
    setOffset([0, 0]);
  }, [src]);

  const onWheel = (e: WheelEvent | any) => {
    e.stopPropagation();
    e.preventDefault?.();
    const up = e.deltaY < 0;
    const newScale = up ? scale + scaleStep : scale - scaleStep;
    if (newScale > 0.1) setScale(newScale);
  };

  const interactProps = useMemo(() => ({ onWheel }), [scale]);

  const getEffectiveSize = () => {
    const el = imgRef.current;
    if (!el) return { effW: 0, effH: 0 };

    const w = el.offsetWidth;
    const h = el.offsetHeight;

    const rot = ((rotate % 360) + 360) % 360;
    const swapped = rot === 90 || rot === 270;

    const baseW = swapped ? h : w;
    const baseH = swapped ? w : h;

    return { effW: baseW * scale, effH: baseH * scale };
  };

  const getClampBounds = () => {
    const { effW, effH } = getEffectiveSize();
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const fitsW = effW <= vw;
    const fitsH = effH <= vh;
    const fitsViewport = fitsW && fitsH;

    const halfW = Math.max(0, effW / 2 - EDGE_SAFE_PX);
    const halfH = Math.max(0, effH / 2 - EDGE_SAFE_PX);

    return {
      maxX: fitsW ? 0 : halfW,
      maxY: fitsH ? 0 : halfH,
      fitsViewport,
    };
  };

  const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);

  const handleMouseMove = (event: MouseEvent) => {
    const x = event.clientX - offset[0];
    const y = event.clientY - offset[1];

    const { maxX, maxY } = getClampBounds();
    setPos([clamp(x, -maxX, maxX), clamp(y, -maxY, maxY)]);
  };

  const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    setOffset([event.clientX - pos[0], event.clientY - pos[1]]);
    setDragging(true);
  };

  const handleMouseUp = () => setDragging(false);

  const afterMove = () => {
    const { fitsViewport, maxX, maxY } = getClampBounds();
    setSnapping(true);

    if (fitsViewport) {
      setPos([0, 0]);
    } else {
      setPos(([px, py]) => [clamp(px, -maxX, maxX), clamp(py, -maxY, maxY)]);
    }

    window.setTimeout(() => setSnapping(false), 180);
  };

  useEffect(() => {
    if (dragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    } else {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      afterMove();
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dragging, offset, scale]);

  useEffect(() => {
    const { maxX, maxY } = getClampBounds();
    setPos(([px, py]) => [clamp(px, -maxX, maxX), clamp(py, -maxY, maxY)]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scale, rotate]);

  useEffect(() => {
    const el = imgRef.current;
    if (!el) return;
    const wheelHandler = (e: WheelEvent) => onWheel(e);
    el.addEventListener("wheel", wheelHandler, { passive: false });
    return () => el.removeEventListener("wheel", wheelHandler as any);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scale]);

  return (
    <>
      {interactElement &&
        Children.map(interactElement, (child) =>
          isValidElement(child) ? cloneElement(child, { ...interactProps }) : child
        )}

      {/* action bar */}
      <Box
        sx={{
          position: "absolute",
          bottom: 8,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: IMAGE_ZINDEX.previewBtn,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "rgba(0,0,0,0.20)",
          borderRadius: 1,
          px: 1,
          py: 0.5,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <IconButton
          onClick={(e) => {
            e.stopPropagation();
            setRotate((pre) => pre - 90);
          }}
        >
          <RotateLeftOutlinedIcon />
        </IconButton>

        <IconButton
          onClick={(e) => {
            e.stopPropagation();
            setRotate((pre) => pre + 90);
          }}
        >
          <RotateRightOutlinedIcon />
        </IconButton>

        <IconButton
          onClick={(e) => {
            e.stopPropagation();
            setRotateY((v) => (v === 180 ? 0 : 180));
          }}
        >
          <SwapHorizontalCircleOutlinedIcon />
        </IconButton>

        <IconButton
          onClick={(e) => {
            e.stopPropagation();
            setRotateX((v) => (v === 180 ? 0 : 180));
          }}
        >
          <SwapVerticalCircleOutlinedIcon />
        </IconButton>
      </Box>

      {/* wrapper to pan + zoom */}
      <Box
        {...props}
        ref={imgRef}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        draggable={false}
        onClick={(e) => e.stopPropagation()}
        sx={{
          userSelect: "none",
          cursor: dragging ? "grabbing" : "grab",
          zIndex: IMAGE_ZINDEX.previewImage,
          transform: `translate(${pos[0]}px, ${pos[1]}px) scale(${scale}) rotate(${rotate}deg) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
          transformOrigin: "center center",
          transition: dragging
            ? "none"
            : snapping
            ? "transform 0.2s ease"
            : "transform 0.12s ease-out",
          ...(style ? {} : {}),
        }}
        style={style}
      >
        {children}
      </Box>
    </>
  );
};
