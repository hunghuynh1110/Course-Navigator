import React from "react";
import { ImageGroupSingle, type ImageGroupSingleProps } from "./ImageGroupSingle";
import { ImageGroupList, type ImageGroupListProps } from "./ImageGroupList";
import type { ImageOptionsDef } from "../type";

export type ImageGroupVariant = "single" | "list";

export * from "./ImageGroupSingle";
export * from "./ImageGroupList";
export * from "./ImageGroupPreview";

export type ImageGroupProps = {
  variant?: ImageGroupVariant;
} & (
  | (Omit<ImageGroupSingleProps, "srcs"> & { srcs: string[] })
  | (Omit<ImageGroupListProps, "srcs"> & { srcs: string[] })
) &
  ImageOptionsDef;

export const ImageGroup: React.FC<ImageGroupProps> = (props) => {
  const { variant = "single", srcs, asset, ...rest } = props as any;

  if (!srcs || srcs.length === 0) return null;

  if (variant === "list") {
    return <ImageGroupList srcs={srcs} {...(rest as any)} />;
  }

  return <ImageGroupSingle srcs={srcs} {...(rest as any)} />;
};
