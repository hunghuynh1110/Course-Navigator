import { DataTable } from "../table";
import { DataTableColumn } from "../table/type";
import { Assessment } from "@/types/assessment";
import { Box, Chip, TextField, Skeleton, LinearProgress } from "@mui/material";
import { processWeight } from "@/utils/gradeUtils";

type AssessmentTableProps = {
  assessments: Assessment[];
  scores: Record<string, { score: number | null; weight: number }>;
  onScoreChange: (task: string, field: string, value: string) => void;
  loading?: boolean;
};

const AssessmentTable = ({
  assessments,
  scores,
  onScoreChange,
  loading,
}: AssessmentTableProps) => {
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
      render: (_value, record) => {
        return (
          <>
            {processWeight(record.weight)}
            {record.flags?.is_hurdle ? (
              <Chip
                label="Hurdle"
                color="error"
                size="small"
                sx={{ ml: 1, zoom: 0.7 }}
              />
            ) : (
              ""
            )}
          </>
        );
      },
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
              onScoreChange(record.task, "score", e.target.value);
            }}
            size="small"
          />
        ),
    },
  ];

  const data = assessments?.map((assessment) => ({
    task: assessment.category,
    weight: assessment.weight,
    yourScore: scores[assessment.category]?.score,
    flags: assessment.flags,
  }));

  if (loading) {
    return (
      <Box mt={5}>
        <LinearProgress />
        <Box sx={{ mt: 2 }}>
          <Skeleton
            variant="rectangular"
            height={50}
            sx={{ mb: 1, borderRadius: 1 }}
          />
          {[1, 2, 3].map((i) => (
            <Skeleton
              key={i}
              variant="rectangular"
              height={60}
              sx={{ mb: 1, borderRadius: 1 }}
            />
          ))}
        </Box>
      </Box>
    );
  }

  if (!assessments) return <div>No assessments found.</div>;

  return (
    <Box mt={5}>
      <DataTable columns={columns} data={data || []} hideHeader={true} />
    </Box>
  );
};

export default AssessmentTable;
