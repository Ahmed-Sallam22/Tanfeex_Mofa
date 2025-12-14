import {
  ReactFlow,
  Background,
  useReactFlow,
  type Node,
  type Edge,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Plus, Minus } from "lucide-react";
import { ConditionNode } from "./ConditionNode";
import { SuccessNode } from "./SuccessNode";
import { FailNode } from "./FailNode";

// Define node types
const nodeTypes = {
  condition: ConditionNode,
  success: SuccessNode,
  fail: FailNode,
};

interface WorkflowCanvasProps {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  onNodeClick: (event: React.MouseEvent, node: Node) => void;
  onPaneClick: () => void;
  onDragOver: (event: React.DragEvent) => void;
  onDrop: (event: React.DragEvent) => void;
}

const ZoomControls = () => {
  const { zoomIn, zoomOut } = useReactFlow();

  return (
    <div className="absolute bottom-4 z-50 left-4 flex flex-col bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <button
        onClick={() => zoomIn({ duration: 300 })}
        className="p-2.5 hover:bg-gray-50 transition-colors border-b border-gray-100 cursor-pointer"
        aria-label="Zoom in">
        <Plus className="w-4 h-4 text-gray-600" />
      </button>
      <button
        onClick={() => zoomOut({ duration: 300 })}
        className="p-2.5 hover:bg-gray-50 transition-colors cursor-pointer"
        aria-label="Zoom out">
        <Minus className="w-4 h-4 text-gray-600" />
      </button>
    </div>
  );
};

export const WorkflowCanvas = ({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onNodeClick,
  onPaneClick,
  onDragOver,
  onDrop,
}: WorkflowCanvasProps) => {
  return (
    <div className="flex-1 relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        onDragOver={onDragOver}
        onDrop={onDrop}
        nodeTypes={nodeTypes}
        fitView
        className="bg-[#FAFAFA]">
        <Background color="#575555" gap={16} size={1} />
        <ZoomControls />
      </ReactFlow>
    </div>
  );
};
