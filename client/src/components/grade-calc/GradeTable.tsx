import { useEffect, useState } from "react";
import { DataTable } from "../table";
import { DataTableColumn } from "../table/type";
import { supabase } from "@/supabaseClient";
import { Assessment } from "@/types/assessment";
import { Box, Chip, TextField, Typography } from "@mui/material";
import { z } from "zod";

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

const calculateFinalScore = (
  scores: Record<string, { score: number; weight: number }>
) => {
  return Object.values(scores).reduce(
    (acc, curr) => acc + curr.score * curr.weight,
    0
  );
};

const scoreSchema = z
  .string()
  .regex(/^\d+(\.\d+)?$/)
  .transform(Number);

const convertScore = (score: string) => {
  if (score === "") return 0;

  const result = scoreSchema.safeParse(score);
  if (!result.success) return 0;

  return Math.min(Math.max(result.data, 0), MAX_SCORE);
};

const GradeTable = ({ courseId }: { courseId: string }) => {
  const [assessments, setAssessments] = useState<Assessment[] | null>(null);

  const [scores, setScores] = useState<
    Record<string, { score: number; weight: number }>
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
              [curr.category]: { score: 0, weight: curr.weight },
            }),
            {}
          );
          console.log("initialScores", initialScores);
          setScores(initialScores);
        }
      } catch (error) {
        console.error("Failed to fetch course data:", error);
      }
    }

    init();
  }, [courseId]);

  console.log("scores", scores);

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
            placeholder={"0, 100"}
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
  console.log("scores", scores);

  if (!assessments) return <div>Loading...</div>;

  return (
    <Box mt={5}>
      <DataTable columns={columns} data={data || []} hideHeader={true} />
      <Typography>Final Score: {calculateFinalScore(scores)}</Typography>
    </Box>
  );
};

export default GradeTable;
