import {
  TableCell,
  Chip,
  TableCellProps,
  Box,
  Checkbox,
  SxProps,
  Theme,
  IconButton,
} from "@mui/material";
import { DataTableColumnDef, DataTableKeys } from "./type";
import { useDataTableCxt } from "./context";
import { ReactNode, useEffect, useMemo, useState } from "react";
import { DATATABLE_CELL_WIDTH } from "./util";
import { DataTableActions } from "./DataTableAction";
import { ArrowDownward, ArrowUpward } from "@mui/icons-material";
import { getValueFromPath } from "@/utils/common";
import { formatDate, formatDateTime, formatTime } from "@/utils/datetime";
import { Image, ImageGroup } from "../image";
import { cn } from "@/lib/utils";

export type DataTableCellProps<T> = {
  col: DataTableColumnDef<T>;
  row: T & Record<string, any>;
  rowIndex: number;
  cellProps?: TableCellProps;
};

export const DataTableCell = <T,>(props: DataTableCellProps<T>) => {
  const { selectedRows, keyName, onToggleSelect, actionCellProps, setCellCtxMenu, getActions } =
    useDataTableCxt();
  const { col, row, rowIndex } = props;
  const key = col.key || "" + rowIndex;
  const { sortable: _cellSortable = true } = col;
  const value = getValueFromPath(row, col.dataIndex);
  let el = value;

  if (col.key === DataTableKeys.SELECT) {
    el = (
      <Checkbox
        checked={selectedRows.includes(String(row[keyName] as string))}
        onChange={(event) => {
          event.stopPropagation();
          onToggleSelect(row[keyName]);
        }}
      />
    );
  } else if (col.key === DataTableKeys.ACTION) {
    el = <DataTableActions row={row} rowIndex={rowIndex} />;
  } else {
    switch (col.type) {
      case "bagde":
        el = <Chip>{value}</Chip>;
        break;
      case "bagdes":
        el = (
          <div className="flex flex-wrap gap-2" key={key}>
            {value?.map((item: any, index: number) => (
              <Chip key={item + index}>{item}</Chip>
            ))}
          </div>
        );
        break;
      case "number":
        el = <span>{value}</span>;
        break;
      case "date":
        el = <span>{formatDate(value, "dd/MM/yyyy")}</span>;
        break;
      case "datetime":
        el = <span>{formatDateTime(value)}</span>;
        break;
      case "time":
        el = <span>{formatTime(value)}</span>;
        break;

      case "image":
        el = (
          <Image src={value} width={80} height="auto" alt="Image not found" className="rounded" />
        );
        break;
      case "images":
        el = <ImageGroup srcs={value} />;
        break;
    }
  }

  const sx: SxProps<Theme> = useMemo(() => {
    return () => {
      if (col.key === DataTableKeys.SELECT) {
        return {
          position: "sticky",
          left: 0,
          zIndex: 1,
        };
      }
      return {};
    };
  }, [col]);

  return (
    <TableCell
      className={cn(
        "data-table-cell",
        col.key === DataTableKeys.ACTION ? actionCellProps?.className : ""
      )}
      padding={col.key === DataTableKeys.SELECT ? "checkbox" : undefined}
      sx={sx}
      onContextMenu={(e) => {
        e.stopPropagation();
        e.preventDefault();

        const hasActions = getActions(row, rowIndex).length > 0;
        if (e && hasActions)
          setCellCtxMenu({
            mouseX: e.clientX + 2,
            mouseY: e.clientY - 6,
            rowData: row,
            rowIndex,
          });
      }}
    >
      {col.render ? col.render(value, row, rowIndex) : el}
    </TableCell>
  );
};

export type DataTableHeadCellProps<T> = Omit<DataTableCellProps<T>, "row" | "rowIndex"> & {
  children?: ReactNode;
  lastCol: boolean;
};

export const DataTableHeadCell = <T,>(props: DataTableHeadCellProps<T>) => {
  const { col, children, cellProps, lastCol } = props;
  const {
    resizable = true,
    setHeadCellCtxMenu,
    sortValue,
    onChangeSort,
    sortable,
  } = useDataTableCxt<T>();
  const [hover, setHover] = useState(false);
  const { sortable: _cellSortable = false } = col;
  const cellSortable = _cellSortable === false ? false : sortable;
  const hasValue = sortValue && sortValue.order === col.key;
  const [width, setWidth] = useState(() => {
    const w = col.width ?? DATATABLE_CELL_WIDTH;
    return w;
  });
  const minWidth = col.minWidth ?? DATATABLE_CELL_WIDTH;

  const handleResizeStart = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (disableResize) return;

    const cell =
      (e.currentTarget.closest("th,td") as HTMLElement) ??
      (e.currentTarget.parentElement as HTMLElement);

    if (!cell) return;

    const rect = cell.getBoundingClientRect();
    const startX = e.clientX;
    const startWidth = width ?? rect.width;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const diff = moveEvent.clientX - startX;
      const newWidth = Math.max(minWidth, startWidth + diff); // có thể tăng/giảm

      setWidth(newWidth);
    };

    const onMouseUp = () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      document.body.style.cursor = "default";
    };

    document.body.style.cursor = "col-resize";
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  const disableResize = useMemo(() => lastCol || col.key === DataTableKeys.SELECT, [col, lastCol]);

  useEffect(() => {
    if (resizable && lastCol && !width) {
      console.error("If Resizable is present, the last column must be passed a width parameter.");
    }
  }, [lastCol, width]);

  const sortCpn = useMemo(() => {
    if (!cellSortable) return;
    const SortIcon = sortValue?.orderDirection === "desc" ? ArrowDownward : ArrowUpward;

    return (
      <Box className="data-table-sort">
        <IconButton size="small" onClick={() => onChangeSort(col.key)}>
          <SortIcon fontSize="small" />
        </IconButton>
      </Box>
    );
  }, [cellSortable, sortValue]);

  return (
    <TableCell
      {...cellProps}
      className={cn(
        cellProps?.className,
        resizable && "resizable-cell",
        lastCol ? "last-cell" : "",
        cellSortable ? "sortable" : "",
        sortValue ? `${sortValue.orderDirection}` : ""
      )}
      sx={{
        ...cellProps?.sx,
        width,
        minWidth,
        zIndex: col.sticky ? 4 : 3,
      }}
      onContextMenu={(e) => {
        e.stopPropagation();
        e.preventDefault();
        setHeadCellCtxMenu({
          mouseX: e.clientX + 2,
          mouseY: e.clientY - 6,
          columnKey: col.key,
        });
      }}
      onMouseOver={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <Box
        className="data-table-head-cell-data"
        sx={{ display: "flex", alignItems: "center", gap: 1 }}
      >
        {children}
        {(hasValue || hover) && <>{sortCpn}</>}
      </Box>
      {resizable && (
        <Box
          className={cn("resizable-handle", disableResize ? "resizable-handle-disabled" : "")}
          onMouseDown={handleResizeStart}
          sx={(theme) => ({ display: lastCol ? "none" : undefined })}
        />
      )}
    </TableCell>
  );
};
