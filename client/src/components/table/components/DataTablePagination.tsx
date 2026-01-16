import { Box, Pagination, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

export type DataTablePaginationProps = DataTablePaginationModel & {
  onChangePage?: (page: number) => void;
  onChangePageSize?: (pageSize: number) => void;
};

export const DataTablePagination = (props: DataTablePaginationProps) => {
  const { t: lag } = useTranslation();
  const {
    pageIndex,
    pageSize,
    totalCount,
    totalPage,
    onChangePage,
    onChangePageSize,
  } = props;
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 2,
        borderTop: 1,
        borderColor: "divider",
      }}
    >
      <Typography variant="body2">
        {totalCount > 0 &&
          lag("cpn:table:footer:caption", {
            totalCount,
            startIndex: pageIndex * pageSize + 1,
            endIndex: Math.min(pageIndex * pageSize + pageSize, totalCount),
          })}
      </Typography>
      <Pagination
        count={totalPage}
        page={pageIndex + 1}
        onChange={(_, page) => onChangePage?.(page - 1)}
        sx={{
          flexGrow: onChangePageSize ? 0 : 1,
          display: "flex",
          justifyContent: "center",
        }}
      />

      {onChangePageSize && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {totalCount > 0 && (
            <>
              <Typography variant="body2">
                {lag("cpn:table:pagination:rowsPerPage")}:
              </Typography>
              <PageSizeSelector
                pageSize={pageSize}
                onPageSizeChange={onChangePageSize}
              />
            </>
          )}
        </Box>
      )}
    </Box>
  );
};

import { Select, MenuItem, FormControl, InputLabel } from "@mui/material";
import type { DataTablePaginationModel } from "../type";

interface PageSizeSelectorProps {
  pageSize: number;
  onPageSizeChange: (pageSize: number) => void;
}

const PAGE_SIZE_OPTIONS = [10, 15, 20, 25, 50, 100];

export const PageSizeSelector = ({
  pageSize,
  onPageSizeChange,
}: PageSizeSelectorProps) => {
  return (
    <FormControl size="small" sx={{ minWidth: 80 }}>
      <InputLabel>Size</InputLabel>
      <Select
        value={pageSize}
        label="Size"
        onChange={(e) => onPageSizeChange(Number(e.target.value))}
      >
        {PAGE_SIZE_OPTIONS.map((size) => (
          <MenuItem key={size} value={size}>
            {size}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
