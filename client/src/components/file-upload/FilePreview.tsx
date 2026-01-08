// FilePreview.tsx
import React, { useEffect, useState } from "react";
import { Box, Chip, IconButton, type BoxProps } from "@mui/material";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import { useFileUploadCtx } from "./context";
import { Image } from "../image";
import { cn } from "@/lib/utils";

export type FilePreviewProps = {
  variant?: "text" | "card";
};

type FilePreviewItemProps = {
  file: File | string | null;
  variant?: "text" | "card";
  onRemove: () => void;
};

const FilePreviewItem: React.FC<FilePreviewItemProps> = ({ file, variant, onRemove }) => {
  if (!file) return null;

  const [fileUrl, setFileUrl] = useState<string>();
  const isFile = typeof file === "object" && file instanceof File;
  const isUrl = typeof file === "string";

  useEffect(() => {
    if (isFile) {
      const url = URL.createObjectURL(file);
      setFileUrl(url);
      return () => {
        URL.revokeObjectURL(url);
      };
    } else if (isUrl) {
      setFileUrl(file);
    }
  }, [file, isFile, isUrl]);

  if (variant === "card") {
    return <FilePreviewItemCard onRemove={onRemove} file={file} fileUrl={fileUrl} />;
  }

  const fileName = isFile ? file.name : isUrl ? file.split("/").pop() || "Image" : "Unknown";

  return <Chip variant="outlined" label={fileName} onDelete={onRemove} size="small" />;
};

export const FilePreview: React.FC<FilePreviewProps> = ({ variant }) => {
  const ctx = useFileUploadCtx();
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  if (!ctx) return null;

  const { files, removeFile, moveFile } = ctx;

  if (!files || files.length === 0) return null;

  const handleDragStart = (index: number) => {
    setDraggingIndex(index);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault(); // cần để onDrop chạy
    if (index !== overIndex) {
      setOverIndex(index);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    if (draggingIndex !== null && draggingIndex !== index) {
      moveFile(draggingIndex, index);
    }
    setDraggingIndex(null);
    setOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggingIndex(null);
    setOverIndex(null);
  };

  return (
    <>
      {files.map((file, index) => (
        <Box
          key={index}
          draggable
          onDragStart={() => handleDragStart(index)}
          onDragOver={(e) => handleDragOver(e, index)}
          onDrop={(e) => handleDrop(e, index)}
          onDragEnd={handleDragEnd}
          className="file-preview-item"
          sx={{
            cursor: "grab",
            opacity: draggingIndex === index ? 0.5 : 1,
            outline:
              overIndex === index && draggingIndex !== null ? "2px dashed rgba(0,0,0,0.3)" : "none",
            borderRadius: 2,
            overflow: "hidden",
            ...(variant === "card"
              ? {
                  borderRadius: 2,
                  boxShadow: 1,
                }
              : {}),
          }}
        >
          <FilePreviewItem file={file} variant={variant} onRemove={() => removeFile(index)} />
        </Box>
      ))}
    </>
  );
};

type FilePreviewItemCardProps = BoxProps & {
  file: File | string | null;
  fileUrl?: string;
  onRemove: () => void;
};

const FilePreviewItemCard = ({ onRemove, file, fileUrl, ...props }: FilePreviewItemCardProps) => {
  const { previewItemCardProps = {} } = useFileUploadCtx();
  const [hovered, setHovered] = useState(false);
  const isFile = typeof file === "object" && file instanceof File;
  const isImage = isFile ? file.type.startsWith("image/") : true; // Assume URLs are images

  const component = isImage ? (
    !!fileUrl ? (
      <Image src={fileUrl} asset="internal" objectFit="contain" width={"100%"} height={"100%"} />
    ) : (
      <div></div>
    )
  ) : (
    <DescriptionOutlinedIcon />
  );

  return (
    <Box
      {...previewItemCardProps}
      {...props}
      sx={{
        width: 80,
        height: 80,
        ...previewItemCardProps.sx,
        position: "relative",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Box
        className={cn(
          "actions bg-background absolute top-2 right-2 z-50 rounded-full",
          hovered ? "block" : "hidden"
        )}
      >
        <IconButton
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          size={"small"}
          color="error"
        >
          <DeleteOutlineOutlinedIcon fontSize="small" />
        </IconButton>
      </Box>
      {component}
    </Box>
  );
};
