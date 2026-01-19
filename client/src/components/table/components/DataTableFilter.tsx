import {
  IconButton,
  Popover,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Tooltip,
  Typography,
  Box,
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import { useDataTableCxt } from "../context";
import { useMemo } from "react";

export const DataTableFilter: React.FC = () => {
  const {
    lag,
    displayColumns,
    setDisplayColumns,
    filterColumns,
    columns,
    openFilterColumn,
    setOpenFilterColumn,
    disabledFilterColumn = [],
  } = useDataTableCxt();

  const open = Boolean(openFilterColumn);
  const id = open ? "table-filter-popover" : undefined;

  const handleClose = () => {
    setOpenFilterColumn(null);
  };

  // Danh sách cột được phép filter
  const canFilterKeys = useMemo(() => {
    return filterColumns.map((e) => e.key);
  }, [filterColumns]);

  const allKeys = columns.map((col) => col.key);

  const allChecked =
    canFilterKeys.length > 0 &&
    canFilterKeys.every((k) => displayColumns.includes(k));

  const someChecked =
    canFilterKeys.length > 0 &&
    canFilterKeys.some((k) => displayColumns.includes(k));

  const handleToggleColumn = (key: string) => {
    setDisplayColumns((prev: string[]) => {
      if (prev.includes(key)) {
        return prev.filter((k) => k !== key);
      }
      return [...prev, key];
    });
  };

  const handleToggleAll = () => {
    setDisplayColumns((prev: string[]) => {
      const isAllChecked =
        displayColumns.length > 0 &&
        canFilterKeys.every((k) => prev.includes(k));

      if (isAllChecked) {
        return allKeys.filter((e) => !canFilterKeys.includes(e));
      }
      return [...disabledFilterColumn, ...canFilterKeys];
    });
  };

  return (
    <Popover
      id={id}
      open={open}
      anchorEl={
        openFilterColumn instanceof Element ? openFilterColumn : undefined
      }
      onClose={handleClose}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "left",
      }}
      anchorReference={
        openFilterColumn && "top" in openFilterColumn
          ? "anchorPosition"
          : "anchorEl"
      }
      anchorPosition={
        openFilterColumn && "top" in openFilterColumn
          ? openFilterColumn
          : undefined
      }
      transformOrigin={{
        vertical: "top",
        horizontal: "left",
      }}
    >
      <div style={{ maxHeight: 300, overflowY: "auto" }}>
        <Box
          sx={{
            p: 1,
            backgroundColor: "background.paper",
            zIndex: 1,
            borderBottom: 1,
            borderColor: "divider",
          }}
          className="sticky top-0"
        >
          <Typography variant="h6">
            {lag("cpn:table:filterCol:title")}
          </Typography>
        </Box>
        <FormGroup sx={{ p: 1 }}>
          {/* Checkbox tổng */}
          <FormControlLabel
            control={
              <Checkbox
                size="small"
                checked={allChecked}
                indeterminate={!allChecked && someChecked}
                onChange={handleToggleAll}
              />
            }
            label={lag("cpn:table:filterCol:allCols")}
            slotProps={{
              typography: {
                sx: {
                  fontWeight: 500,
                },
              },
            }}
          />

          {/* Checkbox từng cột */}
          {filterColumns.map((col) => {
            const checked = displayColumns.includes(col.key);

            return (
              <FormControlLabel
                key={col.key}
                control={
                  <Checkbox
                    size="small"
                    checked={checked}
                    onChange={() => handleToggleColumn(col.key)}
                  />
                }
                label={col.title ?? col.key}
              />
            );
          })}
        </FormGroup>
      </div>
    </Popover>
  );
};

export const DataTableFilterBtn = () => {
  const { lag, setOpenFilterColumn } = useDataTableCxt();
  return (
    <Tooltip title={lag("cpn:table:filterCol:title")}>
      <IconButton
        size="small"
        onClick={(e) => setOpenFilterColumn(e.currentTarget)}
      >
        <FilterListIcon fontSize="small" />
      </IconButton>
    </Tooltip>
  );
};
