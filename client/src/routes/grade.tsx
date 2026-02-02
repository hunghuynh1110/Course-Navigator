import AssessmentTable from "@/components/grade-calc/AssessmentTable";
import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { Box, Typography, Button } from "@mui/material";
import { fetchCourseAssessments } from "@/utils/courseUtils";
import { calculateStats, convertScore } from "@/utils/gradeUtils";
import GradeTable from "@/components/grade-calc/GradeTable";
import { Assessment } from "@/types/assessment";
import CourseSearchInput from "@/components/search-box/CourseSearchInput";
import { useSnackbar } from "notistack";

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
  const { enqueueSnackbar } = useSnackbar();

  const [inputValue, setInputValue] = useState(searchCourse || "");
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

  const handleValidateAndSearch = useCallback(
    async (code: string) => {
      if (!code) return false;
      const normalizedCode = code.toUpperCase();

      // Check validation locally first (simple format) or go straight to DB?
      // User requested "incorrect course code" notification.
      // Let's verify against DB.

      try {
        const assessments = await fetchCourseAssessments(normalizedCode);
        if (!assessments) {
          enqueueSnackbar(`Course ${normalizedCode} not found in database.`, {
            variant: "error",
            autoHideDuration: 3000,
          });
          return false;
        }

        // Found! Navigate.
        setCourseId(normalizedCode);
        navigate({
          to: "/grade",
          search: {
            course: normalizedCode,
          },
        });
        return true;
      } catch (error) {
        console.error("Validation error:", error);
        enqueueSnackbar("Error verifying course code.", { variant: "error" });
        return false;
      }
    },
    [navigate, enqueueSnackbar],
  );

  return (
    <Box sx={{ px: { xs: 0, md: "10%", lg: "15%" }, mx: "auto" }}>
      <Box
        sx={{
          display: "flex",
          gap: 2,
          flexDirection: { xs: "column", md: "row" },
        }}
      >
        <CourseSearchInput
          onAddCourse={handleValidateAndSearch}
          disableLiveSearch={true}
          value={inputValue}
          onInputChange={setInputValue}
          clearOnSearch={false}
        />
        <Button
          variant="contained"
          sx={{
            height: "56px",
            width: { xs: "100%", md: "15%" },
            fontWeight: "",
            fontSize: "1.2rem",
          }}
          onClick={() => handleValidateAndSearch(inputValue)}
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
