import {
  useContext,
  createContext,
  useRef,
  type MutableRefObject,
  forwardRef,
  useMemo,
  useState,
  type SetStateAction,
  type Dispatch,
  useCallback,
} from "react";
import { useTranslation } from "react-i18next";
import {
  type ConfirmPopupType,
  type ContextMenuStateHeadType,
  type ContextMenuStateType,
  type DataTableAction,
  type DataTableCellActionFn,
  type DataTableCellDef,
  type DataTableColumnDef,
  DataTableKeys,
  type DataTableDirectionType,
  type DataTableWrapperProps,
} from "./type";
import type { TFunction } from "i18next";
import { DeleteOutlineOutlined, EditOutlined } from "@mui/icons-material";
import type { PopoverPosition } from "@mui/material";

type DataTableContextType<T> = Omit<
  DataTableWrapperProps,
  "columns" | "resizable" | "columnFilter" | "displayColumns"
> & {
  keyName: string;
  lag: TFunction<"translation", undefined>;
  containerRef: MutableRefObject<HTMLDivElement | null>;

  selectedRows: string[];
  onToggleSelect: (rowId: string) => void;
  onToggleSelectAll: () => void;
  isSelectAll: boolean;
  isSelect: boolean;
  onClearSelect: () => void;
  isEmpty: boolean;
  hasActions: boolean;
  resizable: boolean;

  columnFilter: boolean; // Can or Cannot filter: used for hide button
  columns: DataTableColumnDef<T>[]; // All Columns
  filteredColumns: DataTableColumnDef<T>[]; // Filtered Columns
  displayColumns: string[]; // Filterd Column Keys
  setDisplayColumns: Dispatch<SetStateAction<string[]>>; //Change Filter
  filterColumns: DataTableColumnDef<T>[]; // All Columns can be filtered
  openFilterColumn: Element | PopoverPosition | null;
  setOpenFilterColumn: Dispatch<
    SetStateAction<Element | PopoverPosition | null>
  >;
  getActions: DataTableCellActionFn<T>;

  // Cell
  cellDefs: Record<string, DataTableCellDef>;
  setCellDefs: Dispatch<SetStateAction<Record<string, DataTableCellDef>>>;
  cellCtxMenu: ContextMenuStateType | null;
  setCellCtxMenu: Dispatch<SetStateAction<ContextMenuStateType | null>>;
  headCellCtxMenu: ContextMenuStateHeadType | null;
  setHeadCellCtxMenu: Dispatch<SetStateAction<ContextMenuStateHeadType | null>>;
  confirmPopup: ConfirmPopupType | null;
  setConfirmPopup: Dispatch<SetStateAction<ConfirmPopupType | null>>;

  // Sort
  onChangeSort: (
    columnKey: string,
    orderDirection?: DataTableDirectionType
  ) => void;
};

const DataTableContext = createContext<DataTableContextType<any> | null>(null);

/** ---------------- Provider ---------------- */
type DataTableProviderProps = DataTableWrapperProps & {
  children: React.ReactNode;
};

export const DataTableProvider = forwardRef(
  <T,>({ children, keyName = "id", ...props }: DataTableProviderProps) => {
    //#region i18n & Props

    const { t: lag } = useTranslation();

    const {
      data,
      selectedRows = [],
      onRowSelect,
      editable,
      deletable,
      cellActions,
      columns: _columns,
      selectable,
      resizable: _resizable = true,
      columnFilter: _columnFilter = true,
      defaultDisplayColumn,
      onEdit,
      onDelete,
      disabledFilterColumn = [],
      sortValue,
      onSort,
    } = props;

    //#endregion i18n & Props

    //#region Config & Flags

    const resizable = _resizable;
    const columnFilter = _columnFilter;

    //#endregion Config & Flags

    //#region Columns

    const hasActions = useMemo(
      () => editable || deletable || !!(cellActions && cellActions.length > 0),
      [editable, deletable, cellActions]
    );

    const columns: DataTableColumnDef[] = useMemo(() => {
      const rs = _columns.map((col) => ({
        key: Array.isArray(col.dataIndex)
          ? col.dataIndex.join("")
          : col.dataIndex,
        ...col,
      }));

      if (selectable) {
        rs.unshift({
          key: DataTableKeys.SELECT,
          title: lag("cpn:table:columns:select"),
          dataIndex: [],
          sticky: "left",
        });
      }

      if (hasActions) {
        rs.push({
          key: DataTableKeys.ACTION,
          title: lag("cpn:table:columns:action"),
          dataIndex: [],
          sticky: "right",
        });
      }

      return rs;
    }, [_columns, selectable, hasActions, lag]);

    const [displayColumns, setDisplayColumns] = useState<string[]>(() => {
      return defaultDisplayColumn ?? columns.map((e) => e.key);
    });

    const filterColumns = useMemo(
      () => columns.filter((col) => !disabledFilterColumn.includes(col.key)),
      [disabledFilterColumn, columns]
    );

    const filteredColumns = useMemo(
      () => columns.filter((col) => displayColumns.includes(col.key)),
      [columns, displayColumns]
    );

    const [openFilterColumn, setOpenFilterColumn] = useState<
      Element | PopoverPosition | null
    >(null);

    //#endregion Columns

    //#region Cell Definitions & Layout

    const [cellDefs, setCellDefs] = useState<Record<string, DataTableCellDef>>(
      columns.reduce((acc, curr) => {
        acc[curr.key] = {};
        return acc;
      }, {} as Record<string, DataTableCellDef>)
    );

    const containerRef = useRef<HTMLDivElement | null>(null);

    const isEmpty = useMemo(() => data.length > 0, [JSON.stringify(data)]);

    //#endregion Cell Definitions & Layout

    //#region Selection
    const isSelectAll = useMemo(
      () => selectedRows.length === data.length,
      [selectedRows, data]
    );

    const isSelect = useMemo(() => selectedRows.length > 0, [selectedRows]);

    // Toggle 1 row
    const onToggleSelect = useCallback(
      (rowId: string) => {
        onRowSelect?.(
          selectedRows.includes(rowId)
            ? selectedRows.filter((id) => id !== rowId)
            : [...selectedRows, rowId]
        );
      },
      [selectedRows, onRowSelect]
    );

    // Toggle all rows
    const onToggleSelectAll = useCallback(() => {
      const allIds = data.map((e) => e.id);
      onRowSelect?.(isSelectAll ? [] : allIds);
    }, [isSelectAll, data, onRowSelect]);

    // Clear selection
    const onClearSelect = useCallback(() => {
      onRowSelect?.([]);
    }, [onRowSelect]);

    //#endregion Selection

    //#region Actions & Context Menu

    const [confirmPopup, setConfirmPopup] = useState<ConfirmPopupType | null>(
      null
    );

    const getActions: DataTableCellActionFn<T> = useCallback(
      (row: T, index: number) => {
        const rs: DataTableAction<T>[] = [];

        if (editable && onEdit) {
          rs.push({
            key: "edit",
            icon: EditOutlined,
            label: lag("cpn:table:actions:edit"),
            cellBtnClick: onEdit,
          });
        }

        if (deletable && onDelete) {
          rs.push({
            key: "delete",
            icon: DeleteOutlineOutlined,
            label: lag("cpn:table:actions:delete"),
            color: "error",
            isConfirm: true,
            confirmTitle: lag("cpn:table:actions:delete"),
            confirmDescription: lag("cpn:confirmDialog:description"),
            cellBtnClick: onDelete,
          });
        }

        if (cellActions) {
          rs.push(
            ...(Array.isArray(cellActions)
              ? cellActions
              : cellActions(row, index))
          );
        }

        return rs;
      },
      [cellActions, deletable, onDelete, editable, onEdit, lag]
    );

    const [cellCtxMenu, setCellCtxMenu] = useState<ContextMenuStateType | null>(
      null
    );

    const [headCellCtxMenu, setHeadCellCtxMenu] =
      useState<ContextMenuStateHeadType | null>(null);

    //#endregion Actions & Context Menu

    //#region Sort
    const onChangeSort = useCallback(
      (columnKey: string, _orderBy?: DataTableDirectionType) => {
        const preOrderBy = sortValue?.orderDirection;
        const orderDirection =
          _orderBy ?? (preOrderBy === "asc" ? "desc" : "asc");
        onSort?.({ order: columnKey, orderDirection });
      },
      [onSort, sortValue]
    );
    //#endregion Sort

    return (
      <DataTableContext.Provider
        value={{
          ...props,
          lag,
          containerRef,
          selectedRows,
          keyName,
          onToggleSelect,
          onToggleSelectAll,
          isSelectAll,
          isSelect,
          onClearSelect,
          isEmpty,
          hasActions,
          columns,
          cellDefs,
          setCellDefs,
          resizable,
          getActions,

          cellCtxMenu,
          setCellCtxMenu,
          headCellCtxMenu,
          setHeadCellCtxMenu,
          confirmPopup,
          setConfirmPopup,

          columnFilter,
          displayColumns,
          setDisplayColumns,
          filteredColumns,
          filterColumns,
          openFilterColumn,
          setOpenFilterColumn,
          onChangeSort,
        }}
      >
        {children}
      </DataTableContext.Provider>
    );
  }
);

export function useDataTableCxt<T>(): DataTableContextType<T> {
  const ctx = useContext(DataTableContext);
  if (!ctx)
    throw new Error("useDataTable must be used within <DataTableProvider>");
  return ctx;
}
