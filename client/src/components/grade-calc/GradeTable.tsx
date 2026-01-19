import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";

type GradeTableProps = {
  currentScore: number;
  remainingWeight: number; // 0.0 to 1.0 (e.g. 0.7 for 70%)
};

const GRADE_CUTOFFS = [
  { grade: 1, cutoff: 0 },
  { grade: 2, cutoff: 30 },
  { grade: 3, cutoff: 45 },
  { grade: 4, cutoff: 50 },
  { grade: 5, cutoff: 65 },
  { grade: 6, cutoff: 75 },
  { grade: 7, cutoff: 85 },
];

export default function GradeTable({
  currentScore,
  remainingWeight,
}: GradeTableProps) {
  // Convert remaining weight to points (e.g., 0.7 -> 70 points)
  const remainingPoints = remainingWeight * 100;

  return (
    <TableContainer component={Paper} elevation={0} sx={{ mt: 4 }}>
      <Table sx={{ minWidth: 650 }}>
        <TableHead sx={{ bgcolor: "#2E1B4E" }}>
          <TableRow>
            <TableCell sx={{ color: "white", fontWeight: "bold" }}>
              Grade
            </TableCell>
            <TableCell sx={{ color: "white", fontWeight: "bold" }}>
              Cutoff (%)
            </TableCell>
            <TableCell sx={{ color: "white", fontWeight: "bold" }}>
              Required (%)
            </TableCell>
            <TableCell sx={{ color: "white", fontWeight: "bold" }}>
              Required Score
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {GRADE_CUTOFFS.map((row, index) => {
            const neededPoints = row.cutoff - currentScore;

            const safeNeeded = Math.max(0, neededPoints);

            let requiredPercent = 0;
            if (remainingPoints > 0) {
              requiredPercent = (safeNeeded / remainingPoints) * 100;
            } else {
              requiredPercent = safeNeeded > 0 ? Infinity : 0;
            }

            let bgcolor = "inherit";
            if (neededPoints <= 0) {
              bgcolor = "#1B5E20"; // Green for achieved
            } else if (requiredPercent > 100) {
              bgcolor = "#4E1B1B"; // Red/Brown for impossible
            } else {
              bgcolor = "#2E1B4E";
            }

            // Text display
            const requiredScoreText =
              neededPoints <= 0
                ? "0"
                : `${safeNeeded.toFixed(1)}/${remainingPoints.toFixed(0)}`;

            return (
              <TableRow key={row.grade} sx={{ bgcolor }}>
                <TableCell sx={{ color: "white" }}>{row.grade}</TableCell>
                <TableCell sx={{ color: "white" }}>{row.cutoff}</TableCell>
                <TableCell sx={{ color: "white" }}>
                  {requiredPercent.toFixed(2)}
                </TableCell>
                <TableCell sx={{ color: "white" }}>
                  {requiredScoreText}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
