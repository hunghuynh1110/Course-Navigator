import { Select, MenuItem, FormControl, InputLabel } from "@mui/material";

interface PageSizeSelectorProps {
  pageSize: number;
  onPageSizeChange: (pageSize: number) => void;
}

const PAGE_SIZE_OPTIONS = [10, 15, 20, 25, 50, 100];

export const PageSizeSelector = ({ pageSize, onPageSizeChange }: PageSizeSelectorProps) => {
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
