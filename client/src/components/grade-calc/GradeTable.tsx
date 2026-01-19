import { DataTable } from "../table";
import { DataTableColumn } from "../table/type";

const GradeTable = () => {
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
    },
    {
      title: "Your Score",
      dataIndex: "yourScore",
      key: "yourScore",
    },
  ];
  const data = [
    {
      task: "Task 1",
      weight: "10%",
      yourScore: "10",
    },
    {
      task: "Task 2",
      weight: "20%",
      yourScore: "20",
    },
    {
      task: "Task 3",
      weight: "30%",
      yourScore: "30",
    },
  ];
  return <DataTable columns={columns} data={data} />;
};

export default GradeTable;
