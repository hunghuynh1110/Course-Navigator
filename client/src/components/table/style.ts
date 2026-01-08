import { Paper, styled } from "@mui/material";

export const DataTableWrapperInnerStyled = styled(Paper)(({ theme }) => ({
  table: {
    tr: {
      "&.data-table-row-active": {
        td: {
          backgroundColor: "rgba(var(--beca-palette-primary-mainChannel) / 0.1)",
        },
      },
    },

    ".resizable-cell": {
      userSelect: "none",

      ".resizable-handle": {
        position: "absolute",
        right: 0,
        top: "50%",
        transform: "translateY(-50%)",
        height: "64%",
        width: "1.24px",
        background: theme.palette.divider,
        borderRadius: 4,
        zIndex: 2,
        "&:not(.resizable-handle-disabled)": {
          cursor: "col-resize",
          "&:hover": {
            background: theme.palette.primary.main,
            width: "3.2px", // sửa from `with`
          },
        },
      },

      "&:nth-last-of-type(1)::after": {
        display: "none",
      },
    },

    td: {
      "&.data-table-cell": {
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
      },
    },
  },
}));
