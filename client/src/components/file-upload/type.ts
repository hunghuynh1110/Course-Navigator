export type UploadedFile = {
  id: string;
  file: File;
  fileName: string;
  ext?: string;
  previewUrl: string;
  error?: string;
};
