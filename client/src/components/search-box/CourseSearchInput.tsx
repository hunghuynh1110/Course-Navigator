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
  onAddCourse: (code: string) => void; // Triggered on Enter to add to saved list
  existingCourses: string[]; // To check for duplicates
  onSearchResults?: (courses: string[]) => void; // To show live search results
  filters?: FilterConfig[];
  onFiltersChange?: (filters: Record<string, string>) => void;
}

const CourseSearchInput = ({
  onAddCourse,
  existingCourses,
  onSearchResults,
  filters = [],
  onFiltersChange,
}: CourseSearchInputProps) => {
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState("");

  // Initialize filters with default values or empty string
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>(
    () => {
      const initial: Record<string, string> = {};
      filters.forEach((f) => {
        initial[f.id] = f.defaultValue || "";
      });
      return initial;
    }
  );

  // Debounce logic for live search
  useEffect(() => {
    if (!inputValue.trim()) {
      // If empty, clear search results
      onSearchResults?.([]);
      return;
    }

    const timer = setTimeout(() => {
      // Simulate search - in real app, this would call Supabase
      // For now, just pass the search term to parent
      onSearchResults?.([inputValue.trim()]);
    }, 1000);

    return () => clearTimeout(timer);
  }, [inputValue, onSearchResults]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Force uppercase
    const value = e.target.value.toUpperCase();
    setInputValue(value);

    // Clear error when user types
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
    if (existingCourses.includes(trimmedInput)) {
      setError("Course already added");
      setInputValue("");
      onSearchResults?.([]); // Clear search results
      return;
    }

    // Mock Validation: Check if course code exists
    const isValid = mockValidateCourse(trimmedInput);
    const isValid2 = mockValidateCourse2(trimmedInput);
    if (isValid) {
      onAddCourse(trimmedInput);
      // RESET everything
      setInputValue("");
      setError("");
      onSearchResults?.([]); // Clear search results to reset the course display
    } else if (isValid2) {
      setInputValue("");
      onSearchResults?.([]); // Clear search results
    } else {
      setError("Invalid course code");
      setInputValue("");
      onSearchResults?.([]); // Clear search results
    }
  };

  // Mock validation function
  const mockValidateCourse = (code: string) => {
    // Simulate valid if it starts with letters and has numbers (e.g. COMP123)
    return /^[A-Z]{3,4}\d{3,4}[A-Z]*$/.test(code);
  };
  const mockValidateCourse2 = (code: string) => {
    // Simulate valid if it starts with letters only (e.g. COMP)
    return /^[A-Z]{3,4}$/.test(code);
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
      gap={2}
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
