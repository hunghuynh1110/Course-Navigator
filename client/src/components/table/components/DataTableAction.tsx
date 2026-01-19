import {
  IconButton,
  Tooltip,
  type IconButtonProps,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import type { DataTableAction } from "../type";
import { useDataTableCxt } from "../context";
import { useMemo, useState } from "react";
import { MoreVertOutlined } from "@mui/icons-material";

type DataTableActionProps<T> = {
  action: DataTableAction<T>;
  record: T;
  index: number;
};

export const DataTableCellInlineAction = <T,>({
  action,
  record,
  index,
}: DataTableActionProps<T>) => {
  const { setConfirmPopup } = useDataTableCxt();
  const {
    key,
    icon: Icon,
    label,
    cellBtnClick,
    isConfirm,
    confirmTitle,
    confirmDescription,
    onClick,
    size,
    ...btnProps
  } = action;

  // ⬇️ Không confirm: click là chạy luôn
  const handleClick: IconButtonProps["onClick"] = (e) => {
    e.stopPropagation();
    cellBtnClick(record, index);
    onClick?.(e);
  };

  return (
    <Tooltip title={label ?? ""}>
      <IconButton
        {...btnProps}
        size={size ?? "small"}
        onClick={(e) => {
          if (isConfirm && confirmTitle && confirmDescription) {
            setConfirmPopup({
              title: confirmTitle,
              description: confirmDescription,
              onOk: () => handleClick(e),
            });
            return;
          }

          handleClick(e);
        }}
      >
        <Icon />
      </IconButton>
    </Tooltip>
  );
};

type DataTableCollapseActionsProps<T> = {
  actions: DataTableAction<T>[];
  record: T;
  index: number;
};

export function DataTableCollapseActions<T>({
  actions,
  record,
  index,
}: DataTableCollapseActionsProps<T>) {
  const { size } = useDataTableCxt();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleOpen = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
  };

  const handleClose = () => setAnchorEl(null);

  if (!actions.length) return null;

  return (
    <>
      <IconButton size={size} onClick={handleOpen}>
        <MoreVertOutlined />
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <MenuItem
              key={action.key}
              onClick={() => {
                action.cellBtnClick(record, index);
                handleClose();
              }}
            >
              <ListItemIcon>
                <Icon />
              </ListItemIcon>
              <ListItemText>{action.label}</ListItemText>
            </MenuItem>
          );
        })}
      </Menu>
    </>
  );
}

type DataTableActionsProps<T> = {
  row: T;
  rowIndex: number;
};

export const DataTableActions = <T,>({
  row,
  rowIndex,
}: DataTableActionsProps<T>) => {
  const { getActions, actionType } = useDataTableCxt();
  if (!getActions) return null;

  const actions = useMemo(() => {
    return getActions(row, rowIndex);
  }, [getActions, row, rowIndex]);

  return (
    <>
      {actionType === "collapse" ? (
        <DataTableCollapseActions
          actions={actions}
          record={row}
          index={rowIndex}
        />
      ) : (
        actions.map((action) => (
          <DataTableCellInlineAction<T>
            key={action.key}
            action={action}
            record={row}
            index={rowIndex}
          />
        ))
      )}
    </>
  );
};
