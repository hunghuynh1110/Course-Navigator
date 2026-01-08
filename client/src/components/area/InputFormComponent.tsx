import { Card, CardContent, Divider, Grid, MenuItem, TextField, Typography } from "@mui/material";
import { useFormContext, Controller } from "react-hook-form";
import { AreaFieldConfig } from "@/types/area";
import { AreaModel } from "@/types/area";
import { Fragment } from "react/jsx-runtime";
import { OperationalHoursPicker } from "./OperationalHoursPicker";

interface InputFormComponentProps {
  data1: AreaFieldConfig[];
  data2?: AreaFieldConfig[];
  headerString1: string;
  headerString2?: string;
}

export const InputFormComponent = ({
  data1,
  data2,
  headerString1,
  headerString2,
}: InputFormComponentProps) => {
  const {
    control,
    formState: { errors },
  } = useFormContext<AreaModel>();

  const shinkStatus = (value: string) => {
    return value ?? "";
  };

  return (
    <Card sx={{ p: 2 }}>
      <CardContent>
        <Typography variant="h4">{headerString1}</Typography>
        <Grid container spacing={4} sx={{ mt: 2, width: "100%" }}>
          {data1.map((f) => (
            <Fragment key={f.name}>
              <Grid size={f.longField ? { xs: 12, sm: 10 } : { xs: 8, sm: 4 }}>
                {f.type === "timePeriod" ? (
                  <Controller
                    name={f.name as keyof AreaModel}
                    control={control}
                    defaultValue={f.defaultValue ?? ""}
                    render={({ field }) => {
                      return (
                        <OperationalHoursPicker
                          name={field.name}
                          label={f.label}
                          required={!!f.required}
                        />
                      );
                    }}
                  />
                ) : f.type === "select" ? (
                  <Controller
                    name={f.name as keyof AreaModel}
                    control={control}
                    defaultValue={f.defaultValue ?? ""}
                    render={({ field, fieldState }) => {
                      const fieldError = errors[f.name as keyof AreaModel] || fieldState.error;
                      return (
                        <TextField
                          fullWidth
                          label={f.label}
                          required={!!f.required}
                          select
                          error={!!fieldError}
                          helperText={fieldError?.message}
                          value={field.value || f.defaultValue || ""}
                          onChange={(e) => {
                            field.onChange(e.target.value);
                            f.onChange?.(e.target.value);
                          }}
                        >
                          {!f.defaultValue && !field.value && !f.required && (
                            <MenuItem value="">Select {f.label}</MenuItem>
                          )}
                          {(f.options ?? []).map((opt: { label: string; value: string }) => (
                            <MenuItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </MenuItem>
                          ))}
                        </TextField>
                      );
                    }}
                  />
                ) : (
                  <Controller
                    name={f.name as keyof AreaModel}
                    control={control}
                    defaultValue={f.defaultValue ?? ""}
                    render={({ field, fieldState }) => {
                      const fieldError = errors[f.name as keyof AreaModel] || fieldState.error;
                      return (
                        <TextField
                          fullWidth
                          label={f.label}
                          type={f.type || "text"}
                          required={!!f.required}
                          error={!!fieldError}
                          helperText={fieldError?.message}
                          value={field.value ?? ""}
                          onChange={(e) => {
                            field.onChange(e.target.value);
                            f.onChange?.(e.target.value);
                          }}
                        />
                      );
                    }}
                  />
                )}
              </Grid>
              <Grid size={{ xs: 4, sm: 2 }} />
            </Fragment>
          ))}
        </Grid>
        {data2 && data2.length > 0 && (
          <>
            <Divider sx={{ my: 4 }} />
            {headerString2 && <Typography variant="h4">{headerString2}</Typography>}
            <Grid container spacing={4} sx={{ mt: 2, width: "100%" }}>
              {data2.map((f) => (
                <Fragment key={f.name}>
                  <Grid size={f.longField ? { xs: 12, sm: 10 } : { xs: 8, sm: 4 }}>
                    <Controller
                      name={f.name as keyof AreaModel}
                      control={control}
                      defaultValue={f.defaultValue ?? ""}
                      render={({ field, fieldState }) => {
                        // Handle nested fields like "manager.name"
                        const fieldPath = f.name.split(".");
                        let fieldError: any = errors;
                        for (const path of fieldPath) {
                          fieldError = fieldError?.[path];
                        }
                        const error = fieldError || fieldState.error;
                        return (
                          <TextField
                            slotProps={{
                              inputLabel: {
                                shrink: !!shinkStatus(field.value as string),
                              },
                            }}
                            fullWidth
                            label={f.label}
                            type={f.type || "text"}
                            required={!!f.required}
                            error={!!error}
                            helperText={error?.message}
                            value={field.value ?? ""}
                            onChange={(e) => {
                              field.onChange(e.target.value);
                              f.onChange?.(e.target.value);
                            }}
                          />
                        );
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 4, sm: 2 }} />
                </Fragment>
              ))}
            </Grid>
          </>
        )}
      </CardContent>
    </Card>
  );
};
