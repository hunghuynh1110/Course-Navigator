import { IconButtonProps, TableCellProps } from "@mui/material";
import { Ref } from "react";

export type ContextMenuStateType = {
  mouseX: number;
  mouseY: number;
  rowData: any;
  rowIndex: number;
};

export type ContextMenuStateHeadType = {
  mouseX: number;
  mouseY: number;
  columnKey: string;
};

export type ConfirmPopupType = {
  title: string;
  description: string;
  onOk: () => void;
};

export enum DataTableKeys {
  SELECT = "DATATABLE_SELECT",
  ACTION = "DATATABLE_ACTION",
  EMPTY = "DATATABLE_EMPTY",
}

export const DATA_TABLE_KEYS: DataTableKeys[] = [
  DataTableKeys.SELECT,
  DataTableKeys.ACTION,
  DataTableKeys.EMPTY,
];

export type DataTableColumn<T = any> = {
  key?: string; //if key is not exist  key === dataIndex.join
  title: string;
  dataIndex: string | string[];
  width?: number;
  minWidth?: number;
  type?:
    | "number"
    | "text"
    | "bagde"
    | "bagdes"
    | "image"
    | "datetime"
    | "date"
    | "time"
    | "color"
    | "images";
  render?: (value: any, record: T, index: number) => React.ReactNode;
  sticky?: "left" | "right";
  resizable?: boolean;
  sortable?: boolean;
};

export type DataTableColumnDef<T = any> = DataTableColumn<T> & {
  key: string;
};
export interface DataTablePaginationModel {
  pageSize: number;
  pageIndex: number;
  totalCount: number;
  totalPage: number;
}

export const DEFAULT_PAGINATION = {
  pageSize: 0,
  pageIndex: 0,
  totalCount: 0,
  totalPage: 0,
};

export type DataTableAction<T> = IconButtonProps & {
  key: "delete" | "edit" | string;
  icon: React.ComponentType;
  label?: string;
  cellBtnClick: (record: T, index: number) => void;

  isConfirm?: boolean;
  confirmTitle?: string;
  confirmDescription?: string;
};

export type DataTableCellActionFn<T> = (item: T, index: number) => DataTableAction<T>[];

export type DataTableWrapperProps<T = any> = {
  keyName?: string;
  data: T[];
  filters?: React.ReactNode;
  actions?: React.ReactNode;
  editable?: boolean;
  deletable?: boolean;
  onDelete?: (record: T, index: number) => void;
  onEdit?: (record: T, index: number) => void;
  loading?: boolean;
  height?: string | number;
  className?: string;
  pagination?: DataTablePaginationModel;
  onChangePage?: (page: number) => void;
  onChangePageSize?: (pageSize: number) => void;
  onRowClick?: (rowData: T) => void;
  onReload?: () => void;
  onScrollToBottom?: () => void;
  offsetBottom?: number;
  cellActions?: DataTableAction<T>[] | DataTableCellActionFn<T>;
  hideHeader?: boolean;
  resizable?: boolean; // default true

  columns: DataTableColumn<T>[];
  columnFilter?: boolean;
  defaultDisplayColumn?: string[];
  disabledFilterColumn?: string[];

  // select
  selectedRows?: string[];
  defaultSelect?: string[];
  selectable?: boolean;
  onRowSelect?: (selectedIds: string[]) => void;
  headerSelect?: React.ReactNode;

  // active
  activeRows?: string[];
  actionCellProps?: TableCellProps;

  // Sort
  sortable?: boolean; // default false
  sortValue?: DataTableSortDef | null;
  onSort?: (value: DataTableSortDef) => void;
};

export type DataTableDirectionType = "asc" | "desc";

export type DataTableSortDef = {
  order: string; // columnKey
  orderDirection: DataTableDirectionType;
};

export type DataTableWrapperRefProps = {
  getSelect: () => string[];
  onChangeSelect: (rowIds: string[]) => void;
};

export type DataTableWrapperRef = Ref<DataTableWrapperRefProps>;

export type DataTableCellDef = {};
