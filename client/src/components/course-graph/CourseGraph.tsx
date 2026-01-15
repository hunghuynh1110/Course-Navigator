import { useEffect, useState, useCallback } from "react";
import ReactFlow, {
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Position,
  type Node,
  type Edge,
  ConnectionLineType,
  MarkerType,
} from "reactflow";
import dagre from "dagre";
import "reactflow/dist/style.css";
import { Box } from "@mui/material";
import type { Course, Status } from "@/types/course";
import CourseGraphPopup from "./CourseGraphPopup";

// --- CONFIG ---
const nodeWidth = 172;
const nodeHeight = 36;

const getLayoutedElements = (nodes: Node[], edges: Edge[]) => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  dagreGraph.setGraph({ rankdir: "TB" });

  // 1. Separate nodes into connected and isolated
  const connectedNodeIds = new Set<string>();
  edges.forEach((edge) => {
    connectedNodeIds.add(edge.source);
    connectedNodeIds.add(edge.target);
  });

  const connectedNodes: Node[] = [];
  const isolatedNodes: Node[] = [];

  nodes.forEach((node) => {
    if (connectedNodeIds.has(node.id)) {
      connectedNodes.push(node);
    } else {
      isolatedNodes.push(node);
    }
  });

  // 2. Layout connected nodes with Dagre
  connectedNodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  let maxX = 0;

  const layoutedConnectedNodes = connectedNodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.targetPosition = Position.Top;
    node.sourcePosition = Position.Bottom;

    node.position = {
      x: nodeWithPosition.x - nodeWidth / 2,
      y: nodeWithPosition.y - nodeHeight / 2,
    };

    if (node.position.x + nodeWidth > maxX) {
      maxX = node.position.x + nodeWidth;
    }

    return node;
  });

  // 3. Layout isolated nodes in a grid to the right
  const startX = maxX > 0 ? maxX + 100 : 0; // spacing from main graph
  const startY = 0;
  const cols = 4; // Number of columns for isolated nodes
  const spacingX = 20;
  const spacingY = 20;

  const layoutedIsolatedNodes = isolatedNodes.map((node, index) => {
    const col = index % cols;
    const row = Math.floor(index / cols);

    node.targetPosition = Position.Top;
    node.sourcePosition = Position.Bottom;

    node.position = {
      x: startX + col * (nodeWidth + spacingX),
      y: startY + row * (nodeHeight + spacingY),
    };

    return node;
  });

  return {
    nodes: [...layoutedConnectedNodes, ...layoutedIsolatedNodes],
    edges,
  };
};

const getStatusColor = (status: Status | "Blocked") => {
  switch (status) {
    case "Passed":
      return "#a5d6a7"; // Green
    case "Failed":
      return "#ef9a9a"; // Red
    case "Blocked":
      return "#757575"; // Dark Gray
    case "Not Started":
    default:
      return "#e0e0e0"; // Light Gray
  }
};

interface CourseGraphProps {
  courses: Course[];
  nodesStatus: Record<string, Status | "Blocked">;
  // Changed to accept a bulk update map
  onStatusChange: (updates: Record<string, Status>) => void;
}

export default function CourseGraph({
  courses,
  nodesStatus,
  onStatusChange,
}: CourseGraphProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const flowNodes: Node[] = courses.map((course) => {
      const status = nodesStatus[course.id] || "Not Started";
      return {
        id: course.id,
        data: { label: `${course.id}` },
        position: { x: 0, y: 0 },
        style: {
          border: "1px solid #777",
          borderRadius: "8px",
          background: getStatusColor(status),
          fontSize: "12px",
          width: nodeWidth,
          height: nodeHeight,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          color: status === "Blocked" ? "white" : "black",
          fontWeight: "bold",
        },
      };
    });

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
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: "#1976d2",
            },
          });
        });
      }
    });

    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      flowNodes,
      flowEdges
    );

    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  }, [setNodes, setEdges, courses, nodesStatus]);

  const onNodeClick = (_event: React.MouseEvent, node: Node) => {
    const course = courses.find((c) => c.id === node.id);
    if (course) {
      setSelectedCourse(course);
      setOpen(true);
    }
  };

  // --- CASCADING LOGIC ---
  const handleSaveStatus = useCallback(
    (courseId: string, newStatus: Status) => {
      const updates: Record<string, Status> = {};

      // 1. Update the target node
      updates[courseId] = newStatus;

      // 2. If Passed, find all recursive prerequisites and Mark them as Passed
      if (newStatus === "Passed") {
        const queue = [courseId];
        const visited = new Set<string>();

        while (queue.length > 0) {
          const currentId = queue.shift()!;
          if (visited.has(currentId)) continue;
          visited.add(currentId);

          const courseObj = courses.find((c) => c.id === currentId);
          if (courseObj && courseObj.raw_data.prerequisites_list) {
            for (const prereqId of courseObj.raw_data.prerequisites_list) {
              // Only update if not already passed (optimization)
              // But we can just force update to be safe
              updates[prereqId] = "Passed";
              queue.push(prereqId);
            }
          }
        }
      }

      onStatusChange(updates);
      setOpen(false);
    },
    [courses, onStatusChange]
  );

  return (
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
        onNodeClick={onNodeClick}
        nodesDraggable={false}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        attributionPosition="bottom-right"
      >
        <Controls />
        <Background gap={12} size={1} />
      </ReactFlow>

      <CourseGraphPopup
        course={selectedCourse}
        open={open}
        currentStatus={
          (selectedCourse
            ? nodesStatus[selectedCourse.id]
            : "Not Started") as Status
        }
        onClose={() => setOpen(false)}
        onSave={handleSaveStatus}
      />
    </Box>
  );
}
