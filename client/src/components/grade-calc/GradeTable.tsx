import {
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import React from "react";

const GradeTable = () => {
  return (
    <TableContainer>
      <TableHead>
        <TableRow sx={{ fontWeight: "bold" }}>
          <TableCell>Task</TableCell>
          <TableCell>Weight</TableCell>
          <TableCell>Your Score</TableCell>
        </TableRow>
      </TableHead>
      <TableBody></TableBody>
    </TableContainer>
  );
};

export default GradeTable;
