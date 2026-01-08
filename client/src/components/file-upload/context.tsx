// context.tsx
import React, { createContext, useCallback, useContext, useState } from "react";
import type { FileUploadProps } from ".";

export type FileUploadContextValue = FileUploadProviderProps & {
  files: (File | string)[];
  addFiles: (fileList: FileList) => void;
  removeFile: (index: number) => void;
  setFiles: React.Dispatch<React.SetStateAction<(File | string)[]>>;
  moveFile: (fromIndex: number, toIndex: number) => void;
};

const FileUploadContext = createContext<FileUploadContextValue | undefined>(undefined);

export type FileUploadProviderProps = Omit<FileUploadProps, "value" | "onChange"> & {
  children: React.ReactNode;
  defaultValue?: (File | string)[];
  onChange?: (files: (File | string)[]) => void;
};

export const FileUploadProvider: React.FC<FileUploadProviderProps> = (props) => {
  const { children, defaultValue = [], onChange } = props;

  const [files, setFiles] = useState<(File | string)[]>(defaultValue);

  const updateFiles = useCallback(
    (updater: (prev: (File | string)[]) => (File | string)[]) => {
      setFiles((prev) => {
        const next = updater(prev);
        onChange?.(next);
        return next;
      });
    },
    [onChange]
  );

  const addFiles = useCallback(
    (fileList: FileList) => {
      const newFiles = Array.from(fileList);
      updateFiles((prev) => [...prev, ...newFiles]);
    },
    [updateFiles]
  );

  const removeFile = useCallback(
    (index: number) => {
      updateFiles((prev) => prev.filter((_, i) => i !== index));
    },
    [updateFiles]
  );

  const moveFile = useCallback(
    (fromIndex: number, toIndex: number) => {
      updateFiles((prev) => {
        if (fromIndex < 0 || toIndex < 0 || fromIndex >= prev.length || toIndex >= prev.length) {
          return prev;
        }
        const next = [...prev];
        const [item] = next.splice(fromIndex, 1);
        next.splice(toIndex, 0, item);
        return next;
      });
    },
    [updateFiles]
  );

  const value: FileUploadContextValue = {
    files,
    addFiles,
    removeFile,
    moveFile,
    setFiles,
    ...props,
  };

  return <FileUploadContext.Provider value={value}>{children}</FileUploadContext.Provider>;
};

export function useFileUploadCtx(): FileUploadContextValue {
  const ctx = useContext(FileUploadContext);
  if (!ctx) throw new Error("useCameraForm must be used within <CameraFormProvider>");
  return ctx;
}
