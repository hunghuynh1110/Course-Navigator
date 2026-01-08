import { GridColDef } from "@mui/x-data-grid";
import { DataTableColumn, DataTableSortDef } from "./type";

export const DEFAULT_COL_DEF: Partial<GridColDef> = {
  filterable: false,
};

export const DATATABLE_FILTER_POPUP_POSITION = {
  top: 4,
  left: 4,
};

export const DATATABLE_CELL_WIDTH = 64;

export const convertColumnGrid = <T = any>(
  col: DataTableColumn<T>
): GridColDef => {
  const field = Array.isArray(col.dataIndex)
    ? col.dataIndex.join(".")
    : col.dataIndex;

  const mapType = (): GridColDef["type"] => {
    switch (col.type) {
      case "number":
        return "number";
      case "date":
        return "date";
      case "datetime":
        return "dateTime";
      case "time":
        return "dateTime"; // DataGrid không có type "time"
      default:
        return "string";
    }
  };

  const isDateType =
    col.type === "date" || col.type === "datetime" || col.type === "time";

  const def: GridColDef = {
    field,
    headerName: col.title,
    width: col.width,
    minWidth: col.minWidth,
    type: mapType(),
    sortable: false,
    valueGetter: isDateType
      ? (v: any) => {
          if (!v) return null;
          if (v instanceof Date) return v;

          const d = new Date(v);
          return isNaN(d.getTime()) ? null : d;
        }
      : undefined,

    renderCell: col?.render
      ? (params) =>
          col.render!(
            params.value,
            params.row as T,
            params.api.getRowIndexRelativeToVisibleRows(params.id)
          )
      : undefined,
  };

  return {
    ...DEFAULT_COL_DEF,
    ...def,
    ...col, // giữ lại các thuộc tính GridColDef khác
    field: def.field,
    headerName: def.headerName,
    type: def.type,
    width: def.width,
    minWidth: def.minWidth,
    sortable: def.sortable,
    valueGetter: def.valueGetter,
    renderCell: def.renderCell,
  };
};

export const getSortValeFromObject = (
  params: Record<string, any>
): DataTableSortDef | null => {
  if (params.order && params.orderDirection) {
    return {
      order: params.order,
      orderDirection: params.orderDirection,
    };
  }
  return null;
};
