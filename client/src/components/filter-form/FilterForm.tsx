import {
  Box,
  Button,
  Chip,
  Divider,
  ListItemIcon,
  ListItemText,
  MenuItem,
  MenuList,
  Popover,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useRef, useState, type MouseEvent } from "react";
import { useForm } from "react-hook-form";
import { AddOutlined, DeleteOutlineOutlined, FilterAltOffOutlined } from "@mui/icons-material";

import { FilterFormProvider, type FilterFormProviderProps, useFilterForm } from "./context";
import {
  FilterAutocompleteField,
  FilterDateField,
  FilterDateTimeField,
  FilterMultiSelectField,
  FilterNumberField,
  FilterSelectField,
  FilterTextField,
} from "./FilterField";
import { FILTER_FORM_SIZE, getFilterIcon, getFilterLabel } from "./utils";
import type { FilterFieldItem } from "./types";

export interface FilterFormProps extends FilterFormProviderProps {}

export const FilterForm = (props: FilterFormProps) => (
  <FilterFormProvider {...props}>
    <FilterList filterBtn={<FilterButton />} />
  </FilterFormProvider>
);

/* ========== BUTTON ========== */

export const FilterButton = () => {
  const { lag, items, addFilter, activeKeys } = useFilterForm();
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const inactiveItems = useMemo(
    () => items.filter((i) => !activeKeys.includes(i.name)),
    [items, activeKeys]
  );

  return (
    <>
      <Button
        size="small"
        disabled={!inactiveItems.length}
        onClick={(e: MouseEvent<HTMLButtonElement>) => setAnchorEl(e.currentTarget)}
      >
        <AddOutlined fontSize="small" />
        {lag("cpn:filterForm:filterBtn:title")}
      </Button>

      <Popover open={!!anchorEl} anchorEl={anchorEl} onClose={() => setAnchorEl(null)}>
        <Typography sx={{ px: 2, py: 1 }}>{lag("cpn:filterForm:filterBtn:title")}</Typography>
        <Divider />
        <MenuList>
          {inactiveItems.map((item) => {
            const Icon = getFilterIcon(item);
            return (
              <MenuItem
                key={item.name}
                onClick={() => {
                  addFilter(item.name);
                  setAnchorEl(null);
                }}
              >
                <ListItemIcon>
                  <Icon fontSize="small" />
                </ListItemIcon>
                <ListItemText>{item.label}</ListItemText>
              </MenuItem>
            );
          })}
        </MenuList>
      </Popover>
    </>
  );
};

/* ========== LIST ========== */

export const FilterList = ({ filterBtn }: { filterBtn: React.ReactNode }) => {
  const { items, activeKeys, lag, handleClearFilter } = useFilterForm();

  return (
    <Stack direction="row" spacing={1} flexWrap="wrap">
      {activeKeys.map((key) => {
        const item = items.find((e) => e.name === key);
        return item ? <FilterItem key={key} config={item} /> : null;
      })}

      {items.length === activeKeys.length || filterBtn}

      {!!activeKeys.length && (
        <Button size="small" startIcon={<FilterAltOffOutlined />} onClick={handleClearFilter}>
          {lag("form:clear")}
        </Button>
      )}
    </Stack>
  );
};

/* ========== ITEM ========== */

export const FilterItem = ({ config }: { config: FilterFieldItem }) => {
  const key = config.name;
  const Icon = getFilterIcon(config);
  const { openKey, setOpenKey, values, size } = useFilterForm();
  const hasValue = !!values[key];
  const chipRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (openKey === key && !!chipRef.current) {
      setOpen(true);
    } else {
      setOpen(false);
    }
  }, [openKey, key, chipRef]);

  const label = hasValue
    ? `${config.label}: ${getFilterLabel(values[key], config)}`.trim()
    : config.label;

  return (
    <>
      <Tooltip title={label}>
        <Chip
          ref={chipRef}
          icon={
            <Icon
              sx={(theme) => ({
                fontSize:
                  size === "small"
                    ? theme.typography.body2.fontSize
                    : theme.typography.body1.fontSize,
              })}
            />
          }
          size="medium"
          label={
            hasValue
              ? `${config.label}: ${getFilterLabel(values[key], config)}`.trim()
              : config.label
          }
          variant="filled"
          sx={(theme) => ({
            bgcolor: hasValue ? theme.palette.action.selected : "transparent",

            color: theme.palette.text.primary,

            fontSize:
              size === "small" ? theme.typography.body2.fontSize : theme.typography.body1.fontSize,

            fontWeight: hasValue
              ? theme.typography.fontWeightMedium
              : theme.typography.fontWeightRegular,

            cursor: "pointer",
            maxWidth: 400,
          })}
          color={hasValue ? "primary" : "default"}
          onClick={() => setOpenKey(open ? null : key)}
        />
      </Tooltip>
      <Popover
        open={open}
        anchorEl={chipRef.current}
        onClose={() => setOpenKey(null)}
        className="filter-form-master"
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
      >
        <FilterItemInputWrapper config={config} />
      </Popover>
    </>
  );
};

interface FilterItemInputWrapperProps {
  config: FilterFieldItem;
}

export const FilterItemInputWrapper = (props: FilterItemInputWrapperProps) => {
  const { config } = props;
  const { values, lag, size, onDeleteItem, onChangeValue } = useFilterForm();
  const defaultValuve = values[config.name];

  const form = useForm({
    defaultValues: {
      [config.name]: defaultValuve,
    },
  });
  const value = form.watch(config.name);

  const handleSubmit = (values: Record<string, any>) => {
    for (let [key, value] of Object.entries(values)) {
      if (value === undefined || value === null || value === "") {
        return;
      }
      onChangeValue(key, value);
    }
  };

  const commonProps = {
    value,
    onValueChange: (value: any) => {
      form.setValue(config.name, value);
    },
    size,
  };

  let Component = <FilterTextField {...props} {...commonProps} />;

  switch (config.type) {
    case "autocomplete":
      Component = <FilterAutocompleteField {...props} {...commonProps} />;
      break;
    case "radio":
      Component = <FilterSelectField {...props} {...commonProps} />;
      break;
    case "toggle":
    case "select":
      if (config.isArray) {
        Component = <FilterMultiSelectField {...props} {...commonProps} />;
      } else {
        Component = <FilterSelectField {...props} {...commonProps} />;
      }
      break;
    case "number":
      Component = <FilterNumberField {...props} {...commonProps} />;
      break;
    case "date":
      Component = <FilterDateField {...props} {...commonProps} />;
      break;
    case "dateTime":
      Component = <FilterDateTimeField {...props} {...commonProps} />;
      break;
    case "checkbox":
      Component = <FilterMultiSelectField {...props} {...commonProps} />;
      break;
  }

  return (
    <Box className="filter-item-popover" sx={{ maxHeight: "50vh", position: "relative" }}>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <Stack
          direction={"row"}
          justifyContent={"space-between"}
          alignItems={"center"}
          spacing={2}
          sx={{
            px: FILTER_FORM_SIZE[size],
            py: 0.5,
            backgroundColor: "background.paper",
            borderBottom: 1,
            borderColor: "divider",
            position: "sticky",
            top: 0,
            zIndex: 1,
          }}
        >
          <Typography variant="body2">{config.label}</Typography>
          <Box>
            {config.hideDelete ?? (
              <Button
                size={"small"}
                color="error"
                startIcon={<DeleteOutlineOutlined />}
                type="button"
                onClick={() => onDeleteItem(config.name)}
              >
                {lag("delete")}
              </Button>
            )}
          </Box>
        </Stack>
        <Box>{Component}</Box>
        <Stack
          direction={"row"}
          justifyContent={"space-between"}
          sx={{
            p: FILTER_FORM_SIZE[size],
            backgroundColor: "background.paper",
            borderTop: 1,
            borderColor: "divider",
            position: "sticky",
            bottom: 0,
          }}
        >
          <Box>
            {value && !config.hideDelete && (
              <Button
                size="small"
                color="inherit"
                type="button"
                onClick={() => form.setValue(config.name, config.isArray ? [] : "")}
              >
                {lag("form:clear")}
              </Button>
            )}
          </Box>
          <Button size="small" variant="contained" type="submit">
            {lag("form:save")}
          </Button>
        </Stack>
      </form>
    </Box>
  );
};
