import { ListItemIcon, ListItemText, Menu, MenuItem } from "@mui/material";
import { useDataTableCxt } from "../context";
import { useEffect, useRef } from "react";
import { FilterListOutlined, VisibilityOffOutlined } from "@mui/icons-material";

export const DataTableHeadMenu = () => {
  const { lag, headCellCtxMenu, setHeadCellCtxMenu, setDisplayColumns, setOpenFilterColumn } =
    useDataTableCxt();
  const paperRef = useRef<HTMLDivElement | null>(null);

  const handleClose = () => {
    setHeadCellCtxMenu(null);
  };

  useEffect(() => {
    if (!headCellCtxMenu) return;

    const handleMouseDown = (event: MouseEvent) => {
      const target = event.target as Node;

      // nếu click trong menu thì bỏ qua
      if (paperRef.current && paperRef.current.contains(target)) {
        return;
      }

      // click chỗ khác → đóng menu
      setHeadCellCtxMenu(null);
    };

    document.addEventListener("mousedown", handleMouseDown);
    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
    };
  }, [headCellCtxMenu, setHeadCellCtxMenu]);
  return (
    <>
      <Menu
        open={headCellCtxMenu !== null}
        onClose={handleClose}
        anchorReference="anchorPosition"
        anchorPosition={
          headCellCtxMenu !== null
            ? { top: headCellCtxMenu.mouseY, left: headCellCtxMenu.mouseX }
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
        <MenuItem
          onClick={() => {
            if (headCellCtxMenu) {
              setDisplayColumns((pre) => {
                return pre.filter((e) => e !== headCellCtxMenu.columnKey);
              });
              setHeadCellCtxMenu(null);
            }
          }}
        >
          <ListItemIcon>
            <VisibilityOffOutlined />
          </ListItemIcon>
          <ListItemText primary={lag("cpn:table:filterCol:hideColumn")} />
        </MenuItem>

        <MenuItem
          onClick={() => {
            if (headCellCtxMenu) {
              setOpenFilterColumn({
                left: headCellCtxMenu.mouseX,
                top: headCellCtxMenu.mouseY,
              });
              setHeadCellCtxMenu(null);
            }
          }}
        >
          <ListItemIcon>
            <FilterListOutlined />
          </ListItemIcon>
          <ListItemText primary={lag("cpn:table:filterCol:openFilterColumnPopup")} />
        </MenuItem>
      </Menu>
    </>
  );
};
