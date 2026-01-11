import { useState, useEffect } from "react";
import type { KeyboardEvent } from "react";
import { TextField, InputAdornment } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

interface CourseSearchInputProps {
  onAddCourse: (code: string) => void; // Triggered on Enter to add to saved list
  existingCourses: string[]; // To check for duplicates
  onSearchResults: (courses: string[]) => void; // To show live search results
}

const CourseSearchInput = ({
  onAddCourse,
  existingCourses,
  onSearchResults,
}: CourseSearchInputProps) => {
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState("");

  // Debounce logic for live search
  useEffect(() => {
    if (!inputValue.trim()) {
      // If empty, clear search results
      onSearchResults([]);
      return;
    }

    const timer = setTimeout(() => {
      // Simulate search - in real app, this would call Supabase
      // For now, just pass the search term to parent
      onSearchResults([inputValue.trim()]);
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
      onSearchResults([]); // Clear search results
      return;
    }

    // Mock Validation: Check if course code exists
    const isValid = mockValidateCourse(trimmedInput);

    if (isValid) {
      onAddCourse(trimmedInput);
      // RESET everything
      setInputValue("");
      setError("");
      onSearchResults([]); // Clear search results to reset the course display
    } else {
      setError("Invalid course code");
      setInputValue("");
      onSearchResults([]); // Clear search results
    }
  };

  // Mock validation function
  const mockValidateCourse = (code: string) => {
    // Simulate valid if it starts with letters and has numbers (e.g. COMP123)
    return /^[A-Z]{3,4}\d{3,4}[A-Z]*$/.test(code);
  };

  return (
    <TextField
      fullWidth
      label="Search or Add Course"
      variant="outlined"
      value={inputValue}
      onChange={handleInputChange}
      onKeyDown={handleKeyDown}
      error={!!error}
      // helperText={error || "Type to search, press Enter to add"}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon />
          </InputAdornment>
        ),
      }}
    />
  );
};

export default CourseSearchInput;
