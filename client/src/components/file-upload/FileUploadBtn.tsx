import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import { useRef, useState } from "react";
import { Typography, styled } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useFileUploadCtx } from "./context";

export const FileUploadBtn: React.FC = () => {
  const ctx = useFileUploadCtx();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const { t: lag } = useTranslation();

  if (!ctx) return null;

  const { files, addFiles, maxFiles, disabled, accept, multiple } = ctx;

  const handleBrowse = () => inputRef.current?.click();

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (disabled) return;
    e.dataTransfer.dropEffect = "copy";
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    const dt = e.dataTransfer;
    if (dt.files && dt.files.length) {
      addFiles(dt.files);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleBrowse();
    }
  };

  const slotsLeft = maxFiles !== undefined ? Math.max(0, maxFiles - (files?.length ?? 0)) : null;

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        aria-disabled={disabled}
        onKeyDown={handleKeyDown}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => !disabled && handleBrowse()}
        className={[
          "group relative flex w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 transition",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-primary/60",
          disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer",
        ].join(" ")}
      >
        <CloudUploadOutlinedIcon fontSize="large" />
        <Typography variant="body2" className="text-muted-foreground text-center text-sm">
          {lag("form:upload:btnDescription")}
        </Typography>
        {maxFiles !== undefined && (
          <Typography variant="body2" className="text-muted-foreground mt-1 text-center text-sm">
            {slotsLeft} slots left
          </Typography>
        )}
      </div>

      <VisuallyHiddenInput
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={(event) => {
          if (event.target.files) {
            addFiles(event.target.files);
          }
        }}
        multiple={multiple}
      />
    </>
  );
};

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});
