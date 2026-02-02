import AssessmentTable from "@/components/grade-calc/AssessmentTable";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  TextField,
  Box,
  Typography,
  InputAdornment,
  Button,
} from "@mui/material";
import { fetchCourseAssessments } from "@/utils/courseUtils";
import { calculateStats, convertScore } from "@/utils/gradeUtils";
import GradeTable from "@/components/grade-calc/GradeTable";
import { Assessment } from "@/types/assessment";
import SearchIcon from "@mui/icons-material/Search";

type Search = {
  course: string;
};

export const Route = createFileRoute("/grade")({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>): Search => {
    return {
      course: typeof search.course === "string" ? search.course : "",
    };
  },
});

function RouteComponent() {
  const { course: searchCourse } = Route.useSearch();
  const navigate = Route.useNavigate();

  const [inputValue, setInputValue] = useState(searchCourse);
  const [courseId, setCourseId] = useState<string | null>(searchCourse);
  const [assessments, setAssessments] = useState<Assessment[] | null>(null);
  const [scores, setScores] = useState<
    Record<string, { score: number | null; weight: number }>
  >({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function init() {
      if (!courseId) return;
      setIsLoading(true);
      try {
        const assessments = await fetchCourseAssessments(courseId);
        if (assessments) {
          setAssessments(assessments);
          const initialScores = assessments.reduce(
            (acc, curr) => ({
              ...acc,
              [curr.assesment_task]: { score: null, weight: curr.weight },
            }),
            {},
          );
          setScores(initialScores);
        } else {
          setAssessments(null);
          setScores({});
        }
      } catch (error) {
        console.error("Failed to fetch course data:", error);
        setAssessments(null);
      } finally {
        setIsLoading(false);
      }
    }

    init();
  }, [courseId]);

  const handleScoreChange = (task: string, _field: string, value: string) => {
    setScores((prev) => ({
      ...prev,
      [task]: {
        score: convertScore(value),
        weight: prev[task]?.weight || 0,
      },
    }));
  };

  const { totalScore, completedWeight } = calculateStats(scores);

  return (
    <Box sx={{ px: { xs: 0, md: "10%", lg: "15%" }, mx: "auto" }}>
      <Box
        sx={{
          display: "flex",
          gap: 2,
          flexDirection: { xs: "column", md: "row" },
        }}
      >
        <TextField
          fullWidth
          label="Course ID"
          value={inputValue.toUpperCase()}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              setCourseId(inputValue);
              navigate({
                to: "/grade",
                search: {
                  course: inputValue,
                },
              });
            }
          }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        <Button
          variant="contained"
          sx={{
            height: "56px",
            width: { xs: "100%", md: "15%" },
            fontWeight: "",
            fontSize: "1.2rem",
          }}
          onClick={() => {
            setCourseId(inputValue);
            navigate({
              to: "/grade",
              search: {
                course: inputValue,
              },
            });
          }}
        >
          GO
        </Button>
      </Box>

      {courseId && (assessments || isLoading) && (
        <Box mt={5}>
          <AssessmentTable
            assessments={assessments || []}
            scores={scores}
            onScoreChange={handleScoreChange}
            loading={isLoading}
          />
          <Box
            sx={{
              margin: "1rem",
              justifyContent: "center",
              display: "flex",
              alignItems: "center",
              fontSize: "1.5rem",
              fontWeight: "bold",
            }}
          >
            <Typography variant="h4" gutterBottom>
              Current Score: {totalScore.toFixed(2)}%
            </Typography>
          </Box>
          <GradeTable
            currentScore={totalScore}
            remainingWeight={1 - completedWeight}
          />
        </Box>
      )}
    </Box>
  );
}
