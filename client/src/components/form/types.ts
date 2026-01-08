import type { DatePickerProps, TimePickerProps } from "@mui/x-date-pickers";
import type { ReactNode } from "react";
import type { ZodTypeAny } from "zod";
import type { FileUploadProps } from "../file-upload";

// Tùy chọn giá trị trong các input như Select, Radio, Autocomplete
export type FormOption = {
  value: string;
  label: string;
};

export type FormOptionSync = (inputValue: string) => Promise<FormOption[]>;
export type FormOptionType = FormOption[] | FormOptionSync;

// Cấu hình layout dạng lưới nếu cần
export type FormGridConfig = {
  itemLabel?: string;
  cols?: number;
  rowHeight?: number | string;
  col?: number;
  row?: number;
  gutter?: number;
};

// Cấu hình chung cho form
export type FormOptions = {
  appearance?: "filled" | "outlined" | "standard"; // MUI
  fieldAttrs?: Record<string, unknown>;
  isGrid?: boolean;
};

export const DEFAULT_FORM_OPTIONS: FormOptions = {
  appearance: "outlined",
  fieldAttrs: {},
  isGrid: false,
};

// 🧱 Cơ bản cho mọi loại field
export type BaseFormFieldItem = {
  name: string;
  label?: string;
  value?: unknown;
  defaultValue?: unknown;
  disabled?: boolean;
  placeholder?: string;
  validation?: ZodTypeAny;
  component?: ReactNode;
  inputs?: Record<string, unknown>;
  col?: number;
  row?: number;
  hidden?: boolean;
  allowClear?: boolean;

  isArray?: boolean;
  arrayConfig?: FormGridConfig;
  onChangeValue?: (value: unknown) => void;
  debounceTime?: number;

  required?: boolean;
};

// 🧩 Các loại field cụ thể
export type TextFormFieldItem = BaseFormFieldItem & {
  type: "text" | "number" | "password" | "area";
};

export type DateFormFieldItem = BaseFormFieldItem & {
  type: "date" | "dateTime";
  pickerProps?: DatePickerProps<any>; // tùy date lib bạn dùng, có thể thay any bằng Dayjs/Moment
};

export type TimeFormFieldItem = BaseFormFieldItem & {
  type: "time";
  pickerProps?: TimePickerProps<any>;
};

export type CheckboxFormFieldItem = BaseFormFieldItem & {
  type: "checkbox";
};

export type ToggleFormFieldItem = BaseFormFieldItem & {
  type: "toggle";
};

export type SelectFormFieldItem = BaseFormFieldItem & {
  type: "select";
  options: FormOption[];
  renderOptionItem?: (option: FormOption) => ReactNode;
};

export type RadioFormFieldItem = BaseFormFieldItem & {
  type: "radio";
  options: FormOption[];
};

export type AutocompleteFormFieldItem = BaseFormFieldItem & {
  type: "autocomplete";
  options: FormOptionType;
  debounceTime?: number;
};

export type UploadFormFieldItem = BaseFormFieldItem & {
  type: "upload";
  isArray?: false; // upload này không phải mảng field (khác với groupArray)
  variant?: "default" | "custom";
  multiple: boolean;
  accept?: string;
  maxFileSize?: number;
  showPreview?: boolean;
  showProgress?: boolean;
  inputProps?: FileUploadProps;
};

export type GroupFormFieldItem = BaseFormFieldItem & {
  type: "group";
  fields: FormFieldItem[];
};

export type GroupArrayFormFieldItem = BaseFormFieldItem & {
  type: "groupArray";
  arrayFields: FormFieldItem[];
  config?: FormGridConfig;
  formOptions?: FormOptions;
};

export type CustomFormFieldItem = BaseFormFieldItem & {
  type: "custom";
};

export type FormFieldItemType =
  | "text"
  | "area"
  | "number"
  | "password"
  | "date"
  | "time"
  | "dateTime"
  | "autocomplete"
  | "select"
  | "toggle"
  | "radio"
  | "upload"
  | "location"
  | "group"
  | "groupArray";

// 🔗 Union cho tất cả field
export type FormFieldItem =
  | TextFormFieldItem
  | SelectFormFieldItem
  | RadioFormFieldItem
  | CheckboxFormFieldItem
  | ToggleFormFieldItem
  | AutocompleteFormFieldItem
  | GroupFormFieldItem
  | DateFormFieldItem
  | TimeFormFieldItem
  | UploadFormFieldItem
  | GroupArrayFormFieldItem
  | CustomFormFieldItem;
