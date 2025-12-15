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
import toast from "react-hot-toast";
import { BlocksSidebar } from "./components/BlocksSidebar";
import { PropertiesSidebar } from "./components/PropertiesSidebar";
import { WorkflowCanvas } from "./components/WorkflowCanvas";
import type { WorkflowData, StageData } from "./components/types";
import {
  useBulkCreateStepsMutation,
  useBulkUpdateStepsMutation,
  useGetDatasourcesQuery,
} from "../../../api/validationWorkflow.api";

// Initial nodes and edges
const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

export default function AssumptionBuilder() {
  const location = useLocation();
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [activeTab, setActiveTab] = useState<"properties" | "settings">(
    "settings"
  );
  const [isLeftSidebarCollapsed, setIsLeftSidebarCollapsed] = useState(false);
  const [isRightSidebarCollapsed, setIsRightSidebarCollapsed] = useState(false);

  // API Mutations
  const [bulkCreateSteps, { isLoading: isCreating }] =
    useBulkCreateStepsMutation();
  const [bulkUpdateSteps, { isLoading: isUpdating }] =
    useBulkUpdateStepsMutation();

  // Workflow settings
  const [workflowData, setWorkflowData] = useState<WorkflowData>({
    name: "",
    executionPoint: "",
    description: "",
    isDefault: true,
    conditions: [],
  });

  // Fetch datasources based on execution point
  const { data: datasourcesData, isLoading: isDatasourcesLoading } = useGetDatasourcesQuery(
    workflowData.executionPoint,
    {
      skip: !workflowData.executionPoint, // Skip if no execution point selected
    }
  );

  // Load workflow data from navigation state if available
  useEffect(() => {
    if (location.state) {
      const { name, executionPoint, description, isDefault, workflowId } =
        location.state as WorkflowData & { workflowId?: number };
      if (name || executionPoint) {
        setWorkflowData({
          name: name || "",
          executionPoint: executionPoint || "",
          description: description || "",
          isDefault: isDefault ?? true,
          conditions: [],
          workflowId: workflowId, // Store workflow ID for updates
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

  const onDragStart = (
    event: React.DragEvent,
    nodeType: string,
    label: string
  ) => {
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
    setEdges((eds) =>
      eds.filter(
        (edge) =>
          edge.source !== selectedNode.id && edge.target !== selectedNode.id
      )
    );
    setSelectedNode(null);
  }, [selectedNode, setNodes, setEdges]);

  // Build workflow JSON and save to API
  const buildWorkflowJSON = useCallback(async () => {
    if (!workflowData.workflowId) {
      toast.error("Workflow ID is required. Please create a workflow first.");
      return;
    }

    // Map nodes to validation steps
    const steps = nodes.map((node, index) => {
      const nodeData = node.data as {
        id?: number;
        label?: string;
        leftSide?: string;
        operator?: string;
        rightSide?: string;
        leftDataType?: string;
        rightDataType?: string;
      };

      // Find connections for this node
      const trueEdge = edges.find(
        (e) => e.source === node.id && e.sourceHandle === "true"
      );
      const falseEdge = edges.find(
        (e) => e.source === node.id && e.sourceHandle === "false"
      );

      // Determine actions based on connections
      let ifTrueAction = "complete_success";
      let ifTrueActionData: Record<string, unknown> = {
        message: "Step completed successfully",
      };
      let ifFalseAction = "complete_failure";
      let ifFalseActionData: Record<string, unknown> = {
        error: "Validation failed",
      };

      if (trueEdge) {
        const targetNode = nodes.find((n) => n.id === trueEdge.target);
        if (targetNode && (targetNode.data as { id?: number }).id) {
          ifTrueAction = "proceed_to_step_by_id";
          ifTrueActionData = {
            next_step_id: (targetNode.data as { id?: number }).id,
            note: `Proceed to ${
              (targetNode.data as { label?: string }).label || "next step"
            }`,
          };
        }
      }

      if (falseEdge) {
        const targetNode = nodes.find((n) => n.id === falseEdge.target);
        if (targetNode && (targetNode.data as { id?: number }).id) {
          ifFalseAction = "proceed_to_step_by_id";
          ifFalseActionData = {
            next_step_id: (targetNode.data as { id?: number }).id,
            note: `Proceed to ${
              (targetNode.data as { label?: string }).label || "next step"
            }`,
          };
        }
      }

      return {
        id: nodeData.id,
        name: (nodeData.label as string) || `Step ${index + 1}`,
        description: `Validation step: ${nodeData.label || ""}`,
        order: index + 1,
        left_expression: (nodeData.leftSide as string) || "",
        operation: (nodeData.operator as string) || "==",
        right_expression: (nodeData.rightSide as string) || "",
        if_true_action: ifTrueAction,
        if_true_action_data: ifTrueActionData,
        if_false_action: ifFalseAction,
        if_false_action_data: ifFalseActionData,
        failure_message: `${nodeData.label || "Step"} validation failed`,
        is_active: true,
      };
    });

    try {
      // Check if we're creating new steps or updating existing ones
      const hasExistingSteps = steps.some((step) => step.id);

      if (hasExistingSteps) {
        // Bulk update existing steps
        const updates = steps
          .filter((step) => step.id)
          .map((step) => ({
            step_id: step.id,
            name: step.name,
            description: step.description,
            order: step.order,
            left_expression: step.left_expression,
            operation: step.operation,
            right_expression: step.right_expression,
            if_true_action: step.if_true_action,
            if_true_action_data: step.if_true_action_data,
            if_false_action: step.if_false_action,
            if_false_action_data: step.if_false_action_data,
            failure_message: step.failure_message,
            is_active: step.is_active,
          }));

        const result = await bulkUpdateSteps({ updates }).unwrap();
        toast.success(
          `Successfully updated ${result.updated_steps.length} steps`
        );
        console.log("Updated steps:", result);
      } else {
        // Bulk create new steps - remove id field for creation
        const stepsForCreation = steps.map((step) => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { id, ...stepWithoutId } = step;
          return stepWithoutId;
        });

        const result = await bulkCreateSteps({
          workflow_id: workflowData.workflowId,
          steps: stepsForCreation,
        }).unwrap();

        toast.success(
          `Successfully created ${result.created_steps.length} steps`
        );
        console.log("Created steps:", result);

        // Update nodes with the returned IDs
        setNodes((nds) =>
          nds.map((node, index) => ({
            ...node,
            data: {
              ...node.data,
              id: result.created_steps[index]?.id,
            },
          }))
        );
      }
    } catch (error) {
      console.error("Error saving workflow steps:", error);
      toast.error("Failed to save workflow steps. Please try again.");
    }
  }, [workflowData, nodes, edges, bulkCreateSteps, bulkUpdateSteps, setNodes]);

  return (
    <div className="h-[calc(100vh-137px)] flex flex-col bg-[#FAFAFA] overflow-hidden">
      <div className="flex-1 flex overflow-hidden relative">
        <BlocksSidebar
          onDragStart={onDragStart}
          isCollapsed={isLeftSidebarCollapsed}
          onToggleCollapse={() =>
            setIsLeftSidebarCollapsed(!isLeftSidebarCollapsed)
          }
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
          onToggleCollapse={() =>
            setIsRightSidebarCollapsed(!isRightSidebarCollapsed)
          }
          isSaving={isCreating || isUpdating}
          datasources={datasourcesData?.datasources || []}
          isDatasourcesLoading={isDatasourcesLoading}
        />
      </div>
    </div>
  );
}
