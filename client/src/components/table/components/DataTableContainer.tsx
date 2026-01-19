import { Table, TableContainer, TableHead, TableRow, TableBody, Checkbox } from "@mui/material";
import { DataTableCell, DataTableHeadCell } from "./DataTableCell";
import { useDataTableCxt } from "../context";
import { DataTableKeys } from "../type";

export const DataTableContainer = () => {
  const {
    keyName,
    data,
    filteredColumns,
    onRowClick,
    containerRef,
    activeRows = [],

    selectedRows,
    onToggleSelectAll,
  } = useDataTableCxt();

  return (
    <TableContainer ref={containerRef} sx={{ flex: 1, position: "relative" }}>
      <Table
        stickyHeader
        size="small"
        sx={{
          tableLayout: "fixed",
        }}
      >
        <TableHead>
          <TableRow>
            {filteredColumns.map((col, index) => {
              const lastCol = index === filteredColumns.length - 1;
              const commonProps = {
                col,
                lastCol,
              };

              const cellProps = {
                sx: { zIndex: 3, position: "sticky" },
              };

              if (col.key === DataTableKeys.SELECT) {
                return (
                  <DataTableHeadCell
                    key={col.key}
                    {...commonProps}
                    cellProps={{
                      padding: "checkbox",
                      style: {
                        width: 64,
                        left: 0,
                      },
                      ...cellProps,
                    }}
                  >
                    <Checkbox
                      indeterminate={selectedRows.length > 0 && selectedRows.length < data.length}
                      checked={data.length > 0 && selectedRows.length === data.length}
                      onChange={() => onToggleSelectAll()}
                      sx={{ p: 0 }}
                    />
                  </DataTableHeadCell>
                );
              }

              if (col.key === DataTableKeys.ACTION) {
                return (
                  <DataTableHeadCell
                    {...commonProps}
                    key={col.key}
                    cellProps={{ ...cellProps }}
                  ></DataTableHeadCell>
                );
              }

              return (
                <DataTableHeadCell {...commonProps} key={col.key} cellProps={{ ...cellProps }}>
                  {col.title}
                </DataTableHeadCell>
              );
            })}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row, rowIndex) => {
            const active = activeRows.includes(row[keyName]);
            return (
              <TableRow
                key={(row as any).id ?? rowIndex}
                hover
                sx={{ cursor: onRowClick ? "pointer" : "default" }}
                onClick={() => onRowClick?.(row)}
                classes={{
                  root: [active ? "data-table-row-active" : ""].join(" "),
                }}
              >
                {filteredColumns.map((col) => {
                  return <DataTableCell key={col.key} col={col} row={row} rowIndex={rowIndex} />;
                })}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
