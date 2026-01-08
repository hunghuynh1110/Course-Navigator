import type { FormFieldItem } from "../form/types";
import { OverridableComponent } from "@mui/material/OverridableComponent";
import { SvgIconTypeMap } from "@mui/material";

export type FilterIcon = OverridableComponent<SvgIconTypeMap<{}, "svg">>;
export type FilterFieldItem = FormFieldItem & {
  Icon?: FilterIcon;
  hideDelete?: boolean;
};

export type FilterValues = Record<string, any>;
