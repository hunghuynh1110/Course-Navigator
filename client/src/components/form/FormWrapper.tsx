import { Controller } from "react-hook-form";
import type { FieldValues, Path, UseFormReturn } from "react-hook-form";
import { Box, Button, Grid, Stack } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";

import type { FormFieldItem, FormGridConfig } from "./types";
import { FormField } from "./FormField";

interface FormWrapperProps<T extends FieldValues> {
  fields: FormFieldItem[];
  form: UseFormReturn<T>;
  gridConfig?: FormGridConfig;
  hasFooter?: boolean;
  onSubmit?: (values: T) => void;
  onCancel?: () => void;
  formId?: string;
  asChild?: boolean;
  loading?: boolean;
}

export const FormWrapper = <T extends FieldValues>({
  fields,
  form,
  gridConfig,
  hasFooter,
  onSubmit = () => {},
  onCancel,
  asChild,
  formId,
  loading,
}: FormWrapperProps<T>) => {
  const { control, formState } = form;
  const { t: lag } = useTranslation();

  useEffect(() => {
    console.log(formState.errors);
  }, [formState.errors]);

  return (
    <Box
      id={formId}
      component={asChild ? "div" : "form"}
      onSubmit={form.handleSubmit(onSubmit)}
      sx={{ pt: 1 }}
    >
      <Grid
        container
        className="form-fields"
        columns={gridConfig?.cols ?? 1}
        spacing={gridConfig?.gutter ?? 2}
      >
        {fields.map((field) => {
          const key = field.name as Path<T>;
          const col = field.col ?? 1;
          return (
            <Grid size={col} key={key}>
              <Controller
                name={key}
                control={control}
                render={({ field: rhfField, fieldState }) => (
                  <FormField
                    config={field}
                    fieldControl={rhfField}
                    error={fieldState.error?.message}
                    loading={loading}
                  />
                )}
              />
            </Grid>
          );
        })}
      </Grid>

      {hasFooter && (
        <Stack direction="row" justifyContent="space-between" mt={2}>
          <Box />
          <Stack direction="row" spacing={2}>
            <Button variant="text" onClick={onCancel}>
              {lag("common:cancel")}
            </Button>
            <Button variant="contained" type="submit" disabled={!formState.isValid}>
              {lag("common:submit")}
            </Button>
          </Stack>
        </Stack>
      )}
    </Box>
  );
};
