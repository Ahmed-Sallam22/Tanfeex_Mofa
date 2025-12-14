import { useCallback, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  addEdge,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type Connection,
  MarkerType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { BlocksSidebar } from "./components/BlocksSidebar";
import { PropertiesSidebar } from "./components/PropertiesSidebar";
import { WorkflowCanvas } from "./components/WorkflowCanvas";
import type { WorkflowData, StageData } from "./components/types";

// Initial nodes and edges
const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

export default function AssumptionBuilder() {
  const location = useLocation();
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [activeTab, setActiveTab] = useState<"properties" | "settings">("settings");
  const [isLeftSidebarCollapsed, setIsLeftSidebarCollapsed] = useState(false);
  const [isRightSidebarCollapsed, setIsRightSidebarCollapsed] = useState(false);

  // Workflow settings
  const [workflowData, setWorkflowData] = useState<WorkflowData>({
    name: "",
    executionPoint: "",
    description: "",
    isDefault: true,
    conditions: [],
  });

  // Load workflow data from navigation state if available
  useEffect(() => {
    if (location.state) {
      const { name, executionPoint, description, isDefault } = location.state as WorkflowData;
      if (name || executionPoint) {
        setWorkflowData({
          name: name || "",
          executionPoint: executionPoint || "",
          description: description || "",
          isDefault: isDefault ?? true,
          conditions: [],
        });
      }
    }
  }, [location.state]);

  // Stage properties (for selected node)
  const [stageData, setStageData] = useState<StageData>({
    name: "",
    leftSide: "",
    leftDataType: "text",
    operator: "==",
    rightSide: "",
    rightDataType: "text",
  });

  const onConnect = useCallback(
    (params: Connection) => {
      const sourceHandle = params.sourceHandle;
      let edgeStyle = {};
      let labelText = "";

      if (sourceHandle === "true") {
        edgeStyle = { stroke: "#22C55E", strokeWidth: 2 };
        labelText = "True";
      } else if (sourceHandle === "false") {
        edgeStyle = { stroke: "#9CA3AF", strokeWidth: 2 };
        labelText = "False";
      }

      setEdges((eds) =>
        addEdge(
          {
            ...params,
            type: "smoothstep",
            style: edgeStyle,
            label: labelText,
            labelStyle: {
              fill: sourceHandle === "true" ? "#22C55E" : "#9CA3AF",
              fontWeight: 500,
            },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: sourceHandle === "true" ? "#22C55E" : "#9CA3AF",
            },
          },
          eds
        )
      );
    },
    [setEdges]
  );

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
    setActiveTab("properties");
    if (node.data) {
      setStageData({
        name: (node.data.label as string) || "",
        leftSide: (node.data.leftSide as string) || "",
        leftDataType: (node.data.leftDataType as string) || "text",
        operator: (node.data.operator as string) || "==",
        rightSide: (node.data.rightSide as string) || "",
        rightDataType: (node.data.rightDataType as string) || "text",
      });
    }
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
    setActiveTab("settings");
  }, []);

  // Handle drop from sidebar
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData("application/reactflow");
      const label = event.dataTransfer.getData("application/label");

      if (!type) return;

      const position = {
        x: event.clientX - 400,
        y: event.clientY - 100,
      };

      const newNode: Node = {
        id: `${type}-${Date.now()}`,
        type,
        position,
        data: {
          label,
          leftSide: "",
          operator: "==",
          rightSide: "",
          leftDataType: "text",
          rightDataType: "text",
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [setNodes]
  );

  const onDragStart = (event: React.DragEvent, nodeType: string, label: string) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.setData("application/label", label);
    event.dataTransfer.effectAllowed = "move";
  };

  // Update selected node data
  const updateSelectedNode = useCallback(() => {
    if (!selectedNode) return;

    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === selectedNode.id) {
          return {
            ...node,
            data: {
              ...node.data,
              label: stageData.name,
              leftSide: stageData.leftSide,
              leftDataType: stageData.leftDataType,
              operator: stageData.operator,
              rightSide: stageData.rightSide,
              rightDataType: stageData.rightDataType,
            },
          };
        }
        return node;
      })
    );
  }, [selectedNode, stageData, setNodes]);

  // Delete selected node
  const deleteSelectedNode = useCallback(() => {
    if (!selectedNode) return;
    setNodes((nds) => nds.filter((node) => node.id !== selectedNode.id));
    setEdges((eds) => eds.filter((edge) => edge.source !== selectedNode.id && edge.target !== selectedNode.id));
    setSelectedNode(null);
  }, [selectedNode, setNodes, setEdges]);

  // Build workflow JSON for API - available for future use
  const buildWorkflowJSON = useCallback(() => {
    const workflow = {
      ...workflowData,
      nodes: nodes.map((node) => ({
        id: node.id,
        type: node.type,
        position: node.position,
        data: node.data,
      })),
      edges: edges.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        sourceHandle: edge.sourceHandle,
      })),
    };
    console.log("Workflow JSON:", JSON.stringify(workflow, null, 2));
    return workflow;
  }, [workflowData, nodes, edges]);

  return (
    <div className="h-[calc(100vh-137px)] flex flex-col bg-[#FAFAFA] overflow-hidden">
      <div className="flex-1 flex overflow-hidden relative">
        <BlocksSidebar
          onDragStart={onDragStart}
          isCollapsed={isLeftSidebarCollapsed}
          onToggleCollapse={() => setIsLeftSidebarCollapsed(!isLeftSidebarCollapsed)}
        />

        <WorkflowCanvas
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          onDragOver={onDragOver}
          onDrop={onDrop}
        />

        <PropertiesSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          selectedNode={selectedNode}
          stageData={stageData}
          setStageData={setStageData}
          workflowData={workflowData}
          setWorkflowData={setWorkflowData}
          updateSelectedNode={updateSelectedNode}
          deleteSelectedNode={deleteSelectedNode}
          buildWorkflowJSON={buildWorkflowJSON}
          isCollapsed={isRightSidebarCollapsed}
          onToggleCollapse={() => setIsRightSidebarCollapsed(!isRightSidebarCollapsed)}
        />
      </div>
    </div>
  );
}
