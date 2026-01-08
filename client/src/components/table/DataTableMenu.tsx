import { ListItemIcon, ListItemText, Menu, MenuItem } from "@mui/material";
import { useDataTableCxt } from "./context";
import { useEffect, useRef } from "react";

export const DataTableMenu = () => {
  const { cellCtxMenu, setCellCtxMenu, getActions, setConfirmPopup } =
    useDataTableCxt();
  const paperRef = useRef<HTMLDivElement | null>(null);

  const handleClose = () => {
    setCellCtxMenu(null);
  };

  useEffect(() => {
    if (!cellCtxMenu) return;

    const handleMouseDown = (event: MouseEvent) => {
      const target = event.target as Node;

      // nếu click trong menu thì bỏ qua
      if (paperRef.current && paperRef.current.contains(target)) {
        return;
      }

      // click chỗ khác → đóng menu
      setCellCtxMenu(null);
    };

    document.addEventListener("mousedown", handleMouseDown);
    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
    };
  }, [cellCtxMenu, setCellCtxMenu]);

  return (
    <>
      <Menu
        open={cellCtxMenu !== null}
        onClose={handleClose}
        anchorReference="anchorPosition"
        anchorPosition={
          cellCtxMenu !== null
            ? { top: cellCtxMenu.mouseY, left: cellCtxMenu.mouseX }
            : undefined
        }
        slotProps={{
          root: {
            sx: {
              pointerEvents: "none",
            },
          },
          paper: {
            sx: {
              pointerEvents: "auto",
            },
            ref: paperRef,
          },
          backdrop: {
            sx: { display: "none" },
          },
        }}
      >
        {cellCtxMenu &&
          getActions(cellCtxMenu.rowData, cellCtxMenu.rowIndex).map(
            (action) => {
              const Icon = action.icon;

              const handleClick = () => {
                handleClose();
                if (cellCtxMenu) {
                  if (
                    action.isConfirm &&
                    action.confirmDescription &&
                    action.confirmTitle
                  ) {
                    setConfirmPopup({
                      description: action.confirmDescription,
                      title: action.confirmTitle,
                      onOk: () => {
                        action.cellBtnClick(
                          cellCtxMenu.rowData,
                          cellCtxMenu.rowIndex
                        );
                      },
                    });
                    return;
                  }
                  action.cellBtnClick(
                    cellCtxMenu.rowData,
                    cellCtxMenu.rowIndex
                  );
                }
              };

              return (
                <MenuItem
                  key={action.key}
                  onClick={() => {
                    handleClick();
                  }}
                >
                  <ListItemIcon>
                    <Icon />
                  </ListItemIcon>
                  <ListItemText primary={action.label ?? action.key} />
                </MenuItem>
              );
            }
          )}
      </Menu>
    </>
  );
};
