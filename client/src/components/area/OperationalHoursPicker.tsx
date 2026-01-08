import { Box, TextField } from "@mui/material";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import { Controller, useFormContext } from "react-hook-form";
import { AreaModel } from "@/types/area";
import { useTranslation } from "react-i18next";

interface OperationalHoursPickerProps {
  name: keyof AreaModel | string;
  label: string;
  required?: boolean;
}

export const OperationalHoursPicker = ({
  name,
  label,
  required = true,
}: OperationalHoursPickerProps) => {
  const { control, setValue } = useFormContext<AreaModel>();
  const { t } = useTranslation();

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Controller
        name={name as keyof AreaModel}
        control={control}
        render={({ field, fieldState }) => {
          const parseValue = (
            value: string | { startTime: string; endTime: string } | undefined
          ): { start: Dayjs | null; end: Dayjs | null } => {
            if (!value) return { start: null, end: null };

            if (typeof value === "object" && value) {
              return {
                start: dayjs(value.startTime, "HH:mm:ss", true),
                end: dayjs(value.endTime, "HH:mm:ss", true),
              };
            }

            const parts = value.split("-");

            const parseTime = (timeStr: string): Dayjs | null => {
              if (!timeStr) return null;
              let parsed = dayjs(timeStr, "HH:mm:ss", true);

              return parsed.isValid() ? parsed : null;
            };

            return {
              start: parseTime(parts[0]),
              end: parseTime(parts[1]),
            };
          };

          const { start, end } = parseValue(field.value as string | undefined);
          const error = fieldState.error?.message;

          const handleStartChange = (newValue: Dayjs | null) => {
            if (!newValue) {
              field.onChange("");
              return;
            }
            const startTime = newValue.format("HH:mm:ss");
            const endTime = end ? end.format("HH:mm:ss") : "";

            field.onChange(endTime ? `${startTime}-${endTime}` : startTime);
          };

          const handleEndChange = (newValue: Dayjs | null) => {
            if (!start) {
              return;
            }
            const startTime = start.format("HH:mm:ss");
            const endTime = newValue ? newValue.format("HH:mm:ss") : "";

            field.onChange(endTime ? `${startTime}-${endTime}` : startTime);
          };

          return (
            <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
              <TimePicker
                label={t("page:operationalHours:start")}
                value={start}
                ampm={false}
                ampmInClock={true}
                onChange={handleStartChange}
                views={["hours", "minutes", "seconds"]}
                format="HH:mm:ss"
                slotProps={{
                  textField: {
                    id: `${String(name)}-start`,
                    name: `${String(name)}-start`,
                    required: true,
                    error: !!error,
                    helperText: error,
                  },
                }}
              />
              <TimePicker
                label={t("page:operationalHours:end")}
                value={end}
                ampm={false}
                ampmInClock={false}
                onChange={handleEndChange}
                views={["hours", "minutes", "seconds"]}
                format="HH:mm:ss"
                slotProps={{
                  textField: {
                    id: `${String(name)}-end`,
                    name: `${String(name)}-end`,
                    required: true,
                    error: !!error,
                    helperText: error,
                  },
                }}
              />
            </Box>
          );
        }}
      />
    </LocalizationProvider>
  );
};
