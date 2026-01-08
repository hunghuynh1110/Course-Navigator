import { useEffect } from "react";
import ReactFlow, {
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Position,
  type Node,
  type Edge,
  ConnectionLineType,
} from "reactflow";
import dagre from "dagre";
import "reactflow/dist/style.css"; // Bắt buộc phải import CSS
import { Box } from "@mui/material";
import type { Course } from "@/types/course";

// --- CẤU HÌNH KÍCH THƯỚC NODE ---
const nodeWidth = 172;
const nodeHeight = 36;

// --- HÀM TỰ ĐỘNG SẮP XẾP VỊ TRÍ (AUTO LAYOUT) ---
const getLayoutedElements = (nodes: Node[], edges: Edge[]) => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  // Hướng vẽ: 'TB' = Top to Bottom (Trên xuống dưới), 'LR' = Trái sang phải
  dagreGraph.setGraph({ rankdir: "TB" });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.targetPosition = Position.Top;
    node.sourcePosition = Position.Bottom;

    // Tinh chỉnh lại vị trí một chút cho cân giữa
    node.position = {
      x: nodeWithPosition.x - nodeWidth / 2,
      y: nodeWithPosition.y - nodeHeight / 2,
    };

    return node;
  });

  return { nodes: layoutedNodes, edges };
};

export default function CourseGraph({ courses }: { courses: Course[] }) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    // 1. Chuyển đổi dữ liệu thô thành Nodes
    const flowNodes: Node[] = courses.map((course) => ({
      id: course.id,
      data: { label: `${course.id}` }, // Nội dung hiển thị trong ô
      position: { x: 0, y: 0 }, // Vị trí tạm, sẽ được dagre sửa lại
      style: {
        border: "1px solid #777",
        borderRadius: "8px",
        background: "white",
        fontSize: "12px",
        width: nodeWidth,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        textAlign: "center",
      },
    }));

    // 2. Chuyển đổi dữ liệu thô thành Edges (Mũi tên)
    const flowEdges: Edge[] = [];
    courses.forEach((course) => {
      if (
        course.raw_data.prerequisites_list &&
        course.raw_data.prerequisites_list.length > 0
      ) {
        course.raw_data.prerequisites_list.forEach((prereqId) => {
          flowEdges.push({
            id: `e-${prereqId}-${course.id}`,
            source: prereqId,
            target: course.id,
            type: ConnectionLineType.SmoothStep,
            style: { stroke: "#1976d2" },
          });
        });
      }
    });

    // 3. Áp dụng thuật toán sắp xếp Layout
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      flowNodes,
      flowEdges
    );

    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  }, [setNodes, setEdges, courses]);

  return (
    // Container phải có chiều cao cụ thể thì React Flow mới hiện được
    <Box
      sx={{
        width: "100%",
        height: "500px",
        border: "1px solid #ddd",
        borderRadius: 2,
      }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodesDraggable={false}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView // Tự động zoom để vừa khít màn hình
        attributionPosition="bottom-right"
      >
        <Controls />
        <Background gap={12} size={1} />
      </ReactFlow>
    </Box>
  );
}
