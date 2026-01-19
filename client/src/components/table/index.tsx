import { forwardRef, useEffect, useRef, type ReactElement } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Typography,
} from "@mui/material";
import CachedOutlinedIcon from "@mui/icons-material/CachedOutlined";
import { ClearOutlined } from "@mui/icons-material";

import { DataTableProvider, useDataTableCxt } from "./context";
import type { DataTableWrapperProps, DataTableWrapperRef } from "./type";
import { DataTableWrapperInnerStyled } from "./style";
import { DataTableHeadMenu } from "./components/DataTableHeadMenu";
import {
  DataTableFilter,
  DataTableFilterBtn,
} from "./components/DataTableFilter";
import { DataTablePagination } from "./components/DataTablePagination";
import { DataTableContainer } from "./components/DataTableContainer";
import { DataTableMenu } from "./components/DataTableMenu";

export * from "./components/DataTableContainer";
export * from "./components/DataTableCell";
export * from "./components/DataTableMenu";
export * from "./components/DataTablePagination";
export * from "./type";
export * from "./util";

export const DataTable = forwardRef<DataTableWrapperRef, DataTableWrapperProps>(
  function DataTable(props, ref): ReactElement {
    return (
      <DataTableProvider {...props} ref={ref as any}>
        <DataTableInner />
      </DataTableProvider>
    );
  }
);

export const DataTableInner = () => {
  const {
    data,
    filters,
    actions,
    loading,
    height = "auto",
    className,
    pagination,
    onChangePage,
    onChangePageSize,
    onReload,
    onScrollToBottom,
    offsetBottom = 20,
    hideHeader,
    containerRef,
    isSelect,
    selectedRows,
    onClearSelect,
    headerSelect,
    resizable,
    confirmPopup,
    setConfirmPopup,
    columnFilter,
    lag,
  } = useDataTableCxt();

  const preScrollTop = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current || loading) return;

      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      if (scrollTop + clientHeight + offsetBottom >= scrollHeight) {
        preScrollTop.current = scrollTop;
        onScrollToBottom?.();
      }
    };

    const el = containerRef.current;
    if (el) el.addEventListener("scroll", handleScroll);
    return () => el?.removeEventListener("scroll", handleScroll);
  }, [containerRef, loading, offsetBottom, onScrollToBottom, data]);

  useEffect(() => {
    containerRef.current?.scrollTo({
      top: preScrollTop.current,
      behavior: "auto",
    });
  }, [data, containerRef]);

  const wrapperClassName = [className, resizable ? "resizable" : ""]
    .filter(Boolean)
    .join(" ");

  return (
    <DataTableWrapperInnerStyled
      className={wrapperClassName}
      sx={{ height, display: "flex", flexDirection: "column", width: "100%" }}
    >
      <DataTableFilter />
      <DataTableMenu />
      <DataTableHeadMenu />

      {!hideHeader && (
        <Box
          sx={{
            py: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            maxHeight: 80,
            position: "relative",
            borderBottom: 1,
            borderColor: "divider",
          }}
        >
          {isSelect && (
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                zIndex: 10,
                display: "flex",
                alignItems: "center",
                gap: 2,
                px: 2,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <IconButton onClick={() => onClearSelect()}>
                  <ClearOutlined />
                </IconButton>
                <Typography>
                  {lag("cpn:table:header:select:label", {
                    selectLength: selectedRows.length,
                  })}
                </Typography>
              </Box>

              <Box sx={{ flex: 1 }}>{headerSelect}</Box>
            </Box>
          )}

          {/* Filters (horizontal scroll bằng MUI) */}
          <Box sx={{ flex: 1, px: 1, overflowX: "auto" }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                width: "max-content",
              }}
            >
              {filters}
            </Box>
          </Box>

          {/* Actions */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, px: 1 }}>
            {actions}
            {columnFilter && <DataTableFilterBtn />}
            <IconButton size="small" onClick={() => onReload?.()}>
              <CachedOutlinedIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      )}

      <DataTableContainer />

      {pagination && (
        <DataTablePagination
          {...pagination}
          onChangePage={onChangePage}
          onChangePageSize={onChangePageSize}
        />
      )}

      <Dialog
        open={!!confirmPopup}
        onClose={() => setConfirmPopup(null)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {confirmPopup?.title ?? lag("cpn:confirmDialog:title")}
        </DialogTitle>
        <DialogContent sx={{ minWidth: 400 }}>
          <DialogContentText id="alert-dialog-description">
            {confirmPopup?.description || lag("cpn:confirmDialog:description")}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            color="inherit"
            variant="text"
            onClick={() => setConfirmPopup(null)}
          >
            {lag("cpn:confirmDialog:cancelText")}
          </Button>
          <Button
            onClick={() => {
              confirmPopup?.onOk();
              setConfirmPopup(null);
            }}
            autoFocus
            color="error"
            variant="contained"
          >
            {lag("cpn:confirmDialog:okText")}
          </Button>
        </DialogActions>
      </Dialog>
    </DataTableWrapperInnerStyled>
  );
};
