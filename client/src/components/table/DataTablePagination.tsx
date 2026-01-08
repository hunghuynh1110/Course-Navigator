import { Box, Pagination, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { PageSizeSelector } from "../wrapper/page-size-selector";
import { DataTablePaginationModel } from "./type";

// ==========================
// Props Definition
// ==========================

export type DataTablePaginationProps = DataTablePaginationModel & {
  onChangePage?: (page: number) => void;
  onChangePageSize?: (pageSize: number) => void;
};

export const DataTablePagination = (props: DataTablePaginationProps) => {
  const { t: lag } = useTranslation();
  const { pageIndex, pageSize, totalCount, totalPage, onChangePage, onChangePageSize } = props;
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
              <Typography variant="body2">{lag("cpn:table:pagination:rowsPerPage")}:</Typography>
              <PageSizeSelector pageSize={pageSize} onPageSizeChange={onChangePageSize} />
            </>
          )}
        </Box>
      )}
    </Box>
  );
};
