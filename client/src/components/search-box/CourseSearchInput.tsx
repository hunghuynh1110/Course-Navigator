import { useState, useEffect } from "react";
import type { KeyboardEvent } from "react";
import {
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

export interface FilterOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface FilterConfig {
  id: string;
  label: string;
  options: FilterOption[];
  defaultValue?: string;
}

interface CourseSearchInputProps {
  onAddCourse: (code: string) => Promise<boolean> | void; // Return true if success (to clear input)
  existingCourses?: string[];
  onSearchResults?: (courses: string[]) => void;
  filters?: FilterConfig[];
  onFiltersChange?: (filters: Record<string, string>) => void;
  disableLiveSearch?: boolean;
  value?: string;
  onInputChange?: (value: string) => void;
  clearOnSearch?: boolean;
}

const CourseSearchInput = ({
  onAddCourse,
  existingCourses,
  onSearchResults,
  filters = [],
  onFiltersChange,
  disableLiveSearch = false,
  value: propValue,
  onInputChange: propOnInputChange,
  clearOnSearch = true,
}: CourseSearchInputProps) => {
  const [internalValue, setInternalValue] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isControlled = propValue !== undefined;
  const inputValue = isControlled ? propValue : internalValue;

  const setInputValue = (val: string) => {
    if (!isControlled) {
      setInternalValue(val);
    }
    propOnInputChange?.(val);
  };

  // Initialize filters with default values or empty string
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>(
    () => {
      const initial: Record<string, string> = {};
      filters.forEach((f) => {
        initial[f.id] = f.defaultValue || "";
      });
      return initial;
    },
  );

  // Debounce logic for live search
  useEffect(() => {
    if (disableLiveSearch) return;

    if (!inputValue.trim()) {
      onSearchResults?.([]);
      return;
    }

    const timer = setTimeout(() => {
      onSearchResults?.([inputValue.trim()]);
    }, 1000);

    return () => clearTimeout(timer);
  }, [inputValue, onSearchResults, disableLiveSearch]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    setInputValue(value);
    if (error) setError("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
  };

  const handleAdd = async () => {
    const trimmedInput = inputValue.trim();
    if (!trimmedInput) return;

    // Check duplicate
    if (existingCourses?.includes(trimmedInput)) {
      setError("Course already added");
      setInputValue("");
      if (!disableLiveSearch) onSearchResults?.([]);
      return;
    }

    setLoading(true);
    try {
      // Delegate validation to parent
      const success = await onAddCourse(trimmedInput);

      // If parent returns explicit true (or undefined/void treated as generic success if we strictly assume void is success? No, let's treat boolean as indicator)
      // Actually typical pattern: if promise resolves, it's success?
      // Let's assume onAddCourse returns boolean: true = success/clear, false = fail/keep.
      if (success !== false) {
        if (clearOnSearch) {
          setInputValue("");
        }
        setError("");
        if (!disableLiveSearch) onSearchResults?.([]);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to add course");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange =
    (filterId: string) => (event: SelectChangeEvent) => {
      const value = event.target.value;
      const newFilters = { ...activeFilters, [filterId]: value };
      setActiveFilters(newFilters);

      if (onFiltersChange) {
        onFiltersChange(newFilters);
      }
    };

  return (
    <Box
      display="flex"
      gap={{ xs: 1, md: 2 }}
      alignItems="center"
      width="100%"
      flexWrap={{ xs: "wrap", md: "nowrap" }}
    >
      {filters.map((filter) => (
        <FormControl
          key={filter.id}
          sx={{
            minWidth: 120,
            flexGrow: { xs: 1, md: 0 },
            flexBasis: { xs: "calc(50% - 16px)", md: "auto" },
          }}
        >
          <InputLabel>{filter.label}</InputLabel>
          <Select
            value={activeFilters[filter.id] || ""}
            label={filter.label}
            onChange={handleFilterChange(filter.id)}
          >
            {filter.options.map((opt) => (
              <MenuItem
                key={opt.value}
                value={opt.value}
                disabled={opt.disabled}
              >
                {opt.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      ))}

      <TextField
        fullWidth
        label="Search Course Code"
        variant="outlined"
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        error={!!error}
        disabled={loading}
        // helperText={error || "Type to search, press Enter to add"}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
        sx={{
          flexGrow: 1,
          minWidth: { xs: "100%", md: "200px" },
          mt: { xs: 1, md: 0 },
        }}
      />
    </Box>
  );
};

export default CourseSearchInput;
