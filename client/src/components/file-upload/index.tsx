import React from "react";
import { Box, type BoxProps, type ButtonProps } from "@mui/material";
import { FilePreview, type FilePreviewProps } from "./FilePreview";
import { FileUploadBtn } from "./FileUploadBtn";
import { FileUploadProvider, useFileUploadCtx } from "./context";

export type FileUploadProps = {
  value?: (File | string)[];
  onChange?: (file: (File | string)[]) => void;
  btnProps?: ButtonProps;
  multiple?: boolean;
  accept?: string;
  maxFileSize?: number;
  maxFiles?: number;
  disabled?: boolean;
  showPreview?: boolean;
  showProgress?: boolean;
  containerProps?: BoxProps;
  previewProps?: FilePreviewProps;
  previewContainerProps?: BoxProps;
  previewItemCardProps?: BoxProps;
};

// Entry component: luôn bọc bằng Provider
export const FileUpload: React.FC<FileUploadProps> = (props) => {
  const { value, onChange, ...rest } = props;

  return (
    <FileUploadProvider defaultValue={value ?? []} onChange={onChange} {...rest}>
      <_FileUpload />
    </FileUploadProvider>
  );
};

const _FileUpload: React.FC = () => {
  const ctx = useFileUploadCtx();
  if (!ctx) return null;

  const { containerProps, previewContainerProps, previewProps } = ctx;

  return (
    <Box
      {...containerProps}
      className={["file-upload-container", containerProps?.className ?? ""].join(" ")}
    >
      <FileUploadBtn />

      <Box
        display={"flex"}
        flexWrap="wrap"
        gap={1}
        className="file-preview-container"
        sx={{ mt: 2 }}
        {...previewContainerProps}
      >
        <FilePreview {...previewProps} />
      </Box>
    </Box>
  );
};

// export Provider / hook nếu cần dùng ngoài
export * from "./context";
