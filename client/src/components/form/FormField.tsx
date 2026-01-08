import {
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
  FormControlLabel,
  RadioGroup,
  Radio,
  Switch,
  FormHelperText,
  FormLabel,
  Box,
} from "@mui/material";
import { DatePicker, TimePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import type { ControllerRenderProps, FieldValues, Path } from "react-hook-form";

import type { FormFieldItem } from "./types";
import FormFieldPassword from "../form-field/FormFieldPassword";
import { FileUpload } from "../file-upload";
import { ClearAdornment } from "./components/ClearButton";

export interface FormFieldProps<
  TForm extends FieldValues,
  TName extends Path<TForm>
> {
  config: FormFieldItem;
  error?: string;
  fieldControl?: ControllerRenderProps<TForm, TName>;
  loading?: boolean;
  disabled?: boolean;
}


export const FormField = <
  TForm extends FieldValues,
  TName extends Path<TForm>
>({
  config,
  error,
  fieldControl,
  loading,
}: FormFieldProps<TForm, TName>) => {
  const { type, label, placeholder, onChangeValue, disabled, allowClear } = config;

  const commonProps = {
    ...fieldControl,
    disabled: disabled || loading,
    required: config.required,
  };

  const labelId = fieldControl?.name + "-label";

  const onChange = (value: any) => {
    onChangeValue?.(value);
    fieldControl?.onChange(value);
  };

  const hasValue = Boolean(fieldControl?.value);

  switch (type) {
    case "text":
    case "area":
      return (
        <TextField
          fullWidth
          multiline={type === "area"}
          label={label}
          placeholder={placeholder}
          error={!!error}
          helperText={error}
          {...commonProps}
          value={fieldControl?.value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          InputProps={{
            endAdornment: (
              <ClearAdornment show={hasValue && !!allowClear} onClear={() => onChange("")} />
            ),
          }}
        />
      );

    case "number":
      return (
        <TextField
          fullWidth
          type="number"
          label={label}
          placeholder={placeholder}
          error={!!error}
          helperText={error}
          {...commonProps}
          value={fieldControl?.value ?? ""}
          onChange={(e) => onChange(e.target.value ? +e.target.value : undefined)}
          InputProps={{
            endAdornment: (
              <ClearAdornment show={hasValue && !!allowClear} onClear={() => onChange(undefined)} />
            ),
          }}
        />
      );

    case "password":
      return (
        <FormFieldPassword
          fullWidth
          label={label}
          placeholder={placeholder}
          error={!!error}
          helperText={error}
          {...commonProps}
          value={fieldControl?.value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          InputProps={{
            endAdornment: (
              <ClearAdornment show={hasValue && !!allowClear} onClear={() => onChange("")} />
            ),
          }}
        />
      );

    case "select":
      const multiple = config.inputs?.multiple === true;
      const selectValue = fieldControl?.value ?? (multiple ? [] : "");
      return (
        <FormControl fullWidth error={!!error} required={config.required}>
          <InputLabel>{label}</InputLabel>
          <Select
            {...commonProps}
            label={label}
            value={selectValue}
            multiple={multiple}
            onChange={(e) => onChange(e.target.value)}
            renderValue={multiple ? (selected) => {
              const selectedValues = selected as string[];
              return selectedValues
                .map((val) => config.options?.find((opt) => opt.value === val)?.label)
                .filter(Boolean)
                .join(", ");
            } : undefined}
          >
            {config.options?.map((opt) =>
              config.renderOptionItem ? (
                config.renderOptionItem(opt)
              ) : (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              )
            )}
          </Select>
          <FormHelperText>{error}</FormHelperText>
        </FormControl>
      );

    case "checkbox":
      return (
        <FormControlLabel
          label={label}
          control={
            <Checkbox
              {...commonProps}
              checked={Boolean(commonProps.value)}
              onChange={(e) => onChange(e.target.checked)}
            />
          }
        />
      );

    case "toggle":
      return (
        <FormControlLabel
          label={label}
          control={
            <Switch
              {...commonProps}
              checked={Boolean(commonProps.value)}
              onChange={(e) => onChange(e.target.checked)}
            />
          }
        />
      );

    case "radio":
      return (
        <FormControl error={!!error}>
          <FormLabel id={labelId}>{label}</FormLabel>
          <RadioGroup
            row
            aria-labelledby={labelId}
            value={fieldControl?.value}
            onChange={(e) => onChange(e.target.value)}
          >
            {config.options?.map((opt) => (
              <FormControlLabel
                key={opt.value}
                value={opt.value}
                control={<Radio />}
                label={opt.label}
              />
            ))}
          </RadioGroup>
          <FormHelperText>{error}</FormHelperText>
        </FormControl>
      );

    case "date":
      return (
        <DatePicker
          label={label}
          value={fieldControl?.value ? dayjs(fieldControl.value) : null}
          onChange={(v) => v?.isValid() && onChange(v.format(config.pickerProps?.format))}
          slotProps={{
            textField: {
              fullWidth: true,
              error: !!error,
              helperText: error,
            },
          }}
        />
      );

    case "time":
      const format = config.pickerProps?.format ?? "HH:mm:ss";
      return (
        <TimePicker
          label={label}
          value={fieldControl?.value ? dayjs(fieldControl.value, format) : null}
          onChange={(v) => onChange(v?.format(format))}
          slotProps={{
            textField: {
              fullWidth: true,
              error: !!error,
              helperText: error,
            },
          }}
        />
      );

    case "upload":
      return (
        <Box>
          <FormLabel>{label}</FormLabel>
          <FileUpload value={fieldControl?.value} onChange={onChange} {...config.inputProps} />
        </Box>
      );

    default:
      return null;
  }
};
