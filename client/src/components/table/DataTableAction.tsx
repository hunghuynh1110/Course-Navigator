import { IconButton, Tooltip, IconButtonProps } from "@mui/material";
import { DataTableAction } from "./type";
import { useDataTableCxt } from "./context";

type DataTableActionProps<T> = {
  action: DataTableAction<T>;
  record: T;
  index: number;
};

export const DataTableCellAction = <T,>({
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

type DataTableActionsProps<T> = {
  row: T;
  rowIndex: number;
};

export const DataTableActions = <T,>({
  row,
  rowIndex,
}: DataTableActionsProps<T>) => {
  const { getActions } = useDataTableCxt();
  if (!getActions) return null;

  return (
    <>
      {getActions(row, rowIndex).map((action) => (
        <DataTableCellAction<T>
          key={action.key}
          action={action}
          record={row}
          index={rowIndex}
        />
      ))}
    </>
  );
};
