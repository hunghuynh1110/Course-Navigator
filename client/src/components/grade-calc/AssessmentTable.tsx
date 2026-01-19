import { useEffect, useState } from "react";
import { DataTable } from "../table";
import { DataTableColumn } from "../table/type";
import { supabase } from "@/supabaseClient";
import { Assessment } from "@/types/assessment";
import { Box, Chip, TextField, Typography } from "@mui/material";
import { z } from "zod";
import GradeTable from "./GradeTable";

const MAX_SCORE = 100;

export async function fetchCourseData(
  courseId: string
): Promise<Assessment[] | null> {
  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .eq("id", courseId)
    .single();

  if (error || !data) {
    console.error("Error fetching course data:", error);
    return null;
  }

  return data.raw_data.assessments;
}

const calculateStats = (
  scores: Record<string, { score: number | null; weight: number }>
) => {
  let totalScore = 0;
  let completedWeight = 0;

  Object.values(scores).forEach((item) => {
    if (item.score !== null) {
      totalScore += item.score * item.weight;
      completedWeight += item.weight;
    }
  });

  return {
    totalScore: parseFloat(totalScore.toFixed(2)),
    completedWeight,
  };
};

const scoreSchema = z
  .string()
  .regex(/^\d+(\.\d+)?$/)
  .transform(Number);

const convertScore = (score: string): number | null => {
  if (score === "") return null;

  // Handle fraction case like "20/20" or "100/100"
  if (score.includes("/")) {
    const parts = score.split("/");
    if (parts.length === 2) {
      const numerator = parseFloat(parts[0]);
      const denominator = parseFloat(parts[1]);
      if (!isNaN(numerator) && !isNaN(denominator) && denominator !== 0) {
        return Math.min(
          Math.max((numerator / denominator) * 100, 0),
          MAX_SCORE
        );
      }
    }
  }
  if (score.includes("%")) {
    const numericPart = parseFloat(score.replace("%", ""));
    if (!isNaN(numericPart)) {
      return Math.min(Math.max(numericPart, 0), MAX_SCORE);
    }
  }

  const result = scoreSchema.safeParse(score);
  if (!result.success) return null;

  return Math.min(Math.max(result.data, 0), MAX_SCORE);
};

const AssessmentTable = ({ courseId }: { courseId: string }) => {
  const [assessments, setAssessments] = useState<Assessment[] | null>(null);

  const [scores, setScores] = useState<
    Record<string, { score: number | null; weight: number }>
  >({});

  useEffect(() => {
    async function init() {
      try {
        const assessments = await fetchCourseData(courseId);
        if (assessments) {
          setAssessments(assessments);
          const initialScores = assessments.reduce(
            (acc, curr) => ({
              ...acc,
              [curr.category]: { score: null, weight: curr.weight },
            }),
            {}
          );
          setScores(initialScores);
        }
      } catch (error) {
        console.error("Failed to fetch course data:", error);
      }
    }

    init();
  }, [courseId]);

  const processWeight = (weight: number) => {
    return weight === 0 ? "Pass/Fail" : `${weight * 100}%`;
  };

  const columns: DataTableColumn[] = [
    {
      title: "Task",
      dataIndex: "task",
      key: "task",
    },
    {
      title: "Weight",
      dataIndex: "weight",
      key: "weight",
      render: (_value, record) => processWeight(record.weight),
    },
    {
      type: "number",
      title: "Your Score",
      dataIndex: "yourScore",
      key: "yourScore",
      render: (_value, record) =>
        assessments?.find((a) => a.category === record.task)?.weight === 0 ? (
          <Chip label="Pass/Fail" />
        ) : (
          <TextField
            placeholder={"90, 9/10, 90%"}
            defaultValue={scores[record.task]?.score ?? ""}
            onChange={(e) => {
              setScores((prev) => ({
                ...prev,
                [record.task]: {
                  score: convertScore(e.target.value),
                  weight: record.weight,
                },
              }));
            }}
          />
        ),
    },
  ];

  const data = assessments?.map((assessment) => ({
    task: assessment.category,
    weight: assessment.weight,
    yourScore: scores[assessment.category],
  }));

  if (!assessments) return <div>Loading...</div>;

  const { totalScore, completedWeight } = calculateStats(scores);

  return (
    <Box mt={5}>
      <DataTable columns={columns} data={data || []} hideHeader={true} />
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" gutterBottom>
          Current Score: {totalScore.toFixed(2)}% /{" "}
          {(completedWeight * 100).toFixed(0)}%
        </Typography>
      </Box>
      <GradeTable
        currentScore={totalScore}
        remainingWeight={1 - completedWeight}
      />
    </Box>
  );
};

export default AssessmentTable;
