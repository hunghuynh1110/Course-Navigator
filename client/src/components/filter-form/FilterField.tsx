import {
  Box,
  Button,
  Divider,
  InputAdornment,
  ListItemText,
  MenuItem,
  MenuList,
  Stack,
  TextField,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import { EditOutlined } from "@mui/icons-material";
import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import { NumericFormat } from "react-number-format";
import { DateCalendar, MultiSectionDigitalClock } from "@mui/x-date-pickers";
import dayjs, { type Dayjs } from "dayjs";
import { useTranslation } from "react-i18next";

import type { FilterFieldItem } from "./types";
import type { FormOption } from "../form";

export type FilterItemInputProps = {
  config: FilterFieldItem;
  value: any;
  onValueChange: (value: any) => void;
  size: "small" | "medium" | "large";
};

export const FilterDebouceTime = 500;

export const FilterTextField = (props: FilterItemInputProps) => {
  const { value, onValueChange, size } = props;
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  return (
    <TextField
      inputRef={inputRef}
      value={value}
      onChange={(event) => {
        onValueChange(event.target.value);
      }}
      size={size === "large" ? "medium" : "small"}
      sx={{ width: "100%", p: 2 }}
    />
  );
};

export const FilterSelectField = (props: FilterItemInputProps) => {
  const { t: lag } = useTranslation();
  const { config, value, onValueChange } = props;
  if (config.type !== "select" && config.type !== "radio") return null;

  const [query, setQuery] = useState("");

  const [debounced, setDebounced] = useState(query);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(query), config.debounceTime ?? FilterDebouceTime);
    return () => clearTimeout(t);
  }, [query, config.debounceTime ?? 0]);

  const options = useMemo(() => {
    if (!debounced) return config.options;

    const q = debounced.toLowerCase();
    return config.options.filter(
      (o) => o.label.toLowerCase().includes(q) || o.value.toLowerCase().includes(q)
    );
  }, [config, debounced]);

  return (
    <Box minWidth={240}>
      <Box px={1.5} pt={1.5} pb={0.5}>
        <TextField
          autoFocus
          fullWidth
          size="small"
          placeholder={lag("form:search")}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          slotProps={{
            input: {
              startAdornment: query ? (
                <InputAdornment position="start">
                  <ClearIcon
                    fontSize="small"
                    onClick={() => setQuery("")}
                    className="hover:cursor-pointer"
                  />
                </InputAdornment>
              ) : (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
        />
      </Box>

      <Divider sx={{ my: 0.5 }} />

      <MenuList dense disablePadding>
        {options.length === 0 ? (
          <MenuItem disabled>
            <ListItemText>{lag("form:noResult")}</ListItemText>
          </MenuItem>
        ) : (
          options.map((opt) => (
            <MenuItem
              key={opt.value}
              selected={opt.value === value}
              onClick={() => onValueChange(opt.value)}
            >
              <ListItemText>{opt.label}</ListItemText>
            </MenuItem>
          ))
        )}
      </MenuList>
    </Box>
  );
};

export const FilterAutocompleteField = (props: FilterItemInputProps) => {
  const { t: lag } = useTranslation();
  const { config, value, onValueChange } = props;
  if (config.type !== "autocomplete") return null;

  const query = useMemo(() => value, [value]);
  const [debounced, setDebounced] = useState(query);

  // tất cả option load từ config (array hoặc Promise)
  const [options, setOptions] = useState<FormOption[]>([]);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query), config.debounceTime ?? FilterDebouceTime);
    return () => clearTimeout(t);
  }, [query, config.debounceTime]);

  useEffect(() => {
    let active = true;

    const loadOptions = async () => {
      // sync: mảng FormOption[]
      if (Array.isArray(config.options)) {
        if (!active) return;
        setOptions(config.options);
        return;
      }

      // async: Promise<FormOption[]>
      setLoading(true);
      try {
        if (!debounced) {
          setOptions([]);
          return;
        }
        const res = await config.options(query);
        if (!active) return;
        if (Array.isArray(res)) {
          setOptions(res ?? []);
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadOptions();

    return () => {
      active = false;
    };
  }, [config.options, debounced]);

  useEffect(() => {
    searchRef.current?.focus();
  }, []);

  return (
    <Box minWidth={240} sx={{ position: "relative" }}>
      <Box
        className="flex items-center justify-between gap-2"
        sx={{
          position: "sticky",
          top: 40,
          backgroundColor: "background.paper",
          zIndex: 1,
          borderBottom: 1,
          p: 1.5,
          borderColor: "divider",
        }}
      >
        <TextField
          inputRef={searchRef}
          autoFocus
          fullWidth
          size="small"
          placeholder={lag("form:search")}
          value={query}
          onChange={(e) => {
            const value = e.target.value;
            onValueChange(value);
          }}
          slotProps={{
            input: {
              startAdornment: query ? (
                <InputAdornment position="start">
                  <ClearIcon
                    fontSize="small"
                    onClick={() => onValueChange("")}
                    className="hover:cursor-pointer"
                  />
                </InputAdornment>
              ) : (
                <InputAdornment position="start">
                  <EditOutlined fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
        />
      </Box>

      <MenuList dense disablePadding>
        {loading ? (
          <MenuItem disabled>
            <ListItemText>{lag("common:loading") ?? "Loading..."}</ListItemText>
          </MenuItem>
        ) : options.length === 0 ? (
          <MenuItem disabled>
            <ListItemText>{lag("form:noResult")}</ListItemText>
          </MenuItem>
        ) : (
          options.map((opt) => {
            const active = opt.value === value;
            return (
              <MenuItem
                key={opt.value}
                selected={active}
                onClick={() => {
                  onValueChange(opt.value);
                }}
              >
                <ListItemText>{opt.label}</ListItemText>
              </MenuItem>
            );
          })
        )}
      </MenuList>
    </Box>
  );
};

export const FilterMultiSelectField = (props: FilterItemInputProps) => {
  const { t: lag } = useTranslation();
  const { config, value = [], onValueChange } = props;
  if (config.type !== "select") return null;

  const [query, setQuery] = useState("");

  const [debounced, setDebounced] = useState(query);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(query), config.debounceTime ?? 0);
    return () => clearTimeout(t);
  }, [query, config.debounceTime ?? 0]);

  const options = useMemo(() => {
    if (!debounced) return config.options;
    const q = debounced.toLowerCase();
    return config.options.filter(
      (o) => o.label.toLowerCase().includes(q) || o.value.toLowerCase().includes(q)
    );
  }, [config, debounced]);

  const selectAll = value?.length === config.options.length;

  return (
    <Box minWidth={240}>
      <Box px={1.5} pt={1.5} pb={0.5} className="flex items-center justify-between gap-2">
        <TextField
          autoFocus
          fullWidth
          size="small"
          placeholder="Type to filter…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          InputProps={{
            startAdornment: query ? (
              <InputAdornment position="start">
                <ClearIcon
                  fontSize="small"
                  onClick={() => setQuery("")}
                  className="hover:cursor-pointer"
                />
              </InputAdornment>
            ) : (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
        {!selectAll && (
          <Button
            onClick={() => onValueChange(config.options.map((e) => e.value))}
            size="small"
            variant="text"
            color="inherit"
          >
            {lag("form:selectAll")}
          </Button>
        )}
      </Box>

      <Divider sx={{ my: 0.5 }} />

      <MenuList dense disablePadding>
        {options.length === 0 ? (
          <MenuItem disabled>
            <ListItemText>No results</ListItemText>
          </MenuItem>
        ) : (
          options.map((opt) => {
            const active = value.includes(opt.value);
            return (
              <MenuItem
                key={opt.value}
                selected={active}
                onClick={() => {
                  const result = value.slice();
                  if (active) {
                    const index = value.findIndex((e: string) => e === opt.value);
                    result.splice(index, 1);
                  } else {
                    result.push(opt.value);
                  }
                  onValueChange(result);
                }}
              >
                <ListItemText>{opt.label}</ListItemText>
              </MenuItem>
            );
          })
        )}
      </MenuList>
    </Box>
  );
};

export const FilterNumberField = (props: FilterItemInputProps) => {
  const { value, onValueChange, size } = props;
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onValueChange(event.target.value);
  };

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  return (
    <NumericFormat
      inputRef={inputRef}
      value={value}
      onChange={handleChange}
      customInput={TextField}
      thousandSeparator
      valueIsNumericString
      variant="outlined"
      sx={{ width: "100%", p: 2 }}
      size={size === "large" ? "medium" : "small"}
    />
  );
};

export const FilterDateField = (props: FilterItemInputProps) => {
  const { value, onValueChange, size } = props;

  const [_value, setValue] = useState(dayjs(value));

  useEffect(() => {
    if (dayjs(value).isValid()) {
      setValue(dayjs(value));
    }
  }, [value]);
  return (
    <DateCalendar
      value={_value}
      onChange={(value) => {
        onValueChange(value?.toISOString());
      }}
      sx={{ width: "100%", p: 2 }}
    />
  );
};

export const FilterDateTimeField = (props: FilterItemInputProps) => {
  const { value, onValueChange } = props;

  const parseToDayjs = (v?: string | null): Dayjs | null => {
    if (!v) return null;
    const d = dayjs(v);
    return d.isValid() ? d : null;
  };

  const [dt, setDt] = useState<Dayjs | null>(() => parseToDayjs(value));

  // Cập nhật khi prop value đổi từ ngoài
  useEffect(() => {
    setDt(parseToDayjs(value));
  }, [value]);

  const commit = (next: Dayjs | null) => {
    setDt(next);
    onValueChange(next ? next.millisecond(0).toISOString() : null);
  };

  // Khi đổi ngày: giữ nguyên giờ/phút/giây hiện có
  const handleDateChange = (newDate: Dayjs | null) => {
    if (!newDate) return commit(null);
    const base = dt ?? dayjs(); // nếu chưa có, dùng hôm nay
    const next = newDate
      .hour(base.hour())
      .minute(base.minute())
      .second(base.second())
      .millisecond(0);
    commit(next);
  };

  // Khi đổi giờ: giữ nguyên ngày hiện có (hoặc hôm nay nếu chưa có)
  const handleTimeChange = (newTime: Dayjs | null) => {
    if (!newTime) return; // clock hiếm khi trả null, bỏ qua
    const base = dt ?? dayjs();
    const next = base
      .hour(newTime.hour())
      .minute(newTime.minute())
      .second(newTime.second())
      .millisecond(0);
    commit(next);
  };

  return (
    <Box>
      <Stack sx={{ p: 2 }} direction="row" spacing={1}>
        <Button size="small" variant="outlined" onClick={() => commit(dayjs().millisecond(0))}>
          Now
        </Button>
      </Stack>
      <Box sx={{ width: "100%", p: 2 }} className="flex gap-2">
        <DateCalendar value={dt} onChange={handleDateChange} />
        <Stack spacing={1}>
          <MultiSectionDigitalClock
            value={dt}
            onChange={handleTimeChange}
            ampm={false}
            timeSteps={{ minutes: 1, seconds: 1 }}
            sx={{
              maxHeight: 336,
              "& > ul": { maxHeight: 336 },
              borderBottom: "none",
            }}
            views={["hours", "minutes", "seconds"]}
          />
        </Stack>
      </Box>
    </Box>
  );
};
