import { useCallback, useState, useEffect } from "react";
import { useLocation, useParams } from "react-router-dom";
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
  useGetValidationWorkflowQuery,
} from "../../../api/validationWorkflow.api";

// Initial nodes and edges
const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

export default function AssumptionBuilder() {
  const location = useLocation();
  const { id: urlWorkflowId } = useParams<{ id: string }>();
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [activeTab, setActiveTab] = useState<"properties" | "settings">(
    "settings"
  );
  const [isLeftSidebarCollapsed, setIsLeftSidebarCollapsed] = useState(false);
  const [isRightSidebarCollapsed, setIsRightSidebarCollapsed] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

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

  // Get workflow ID from URL params or location state
  const workflowIdFromState = (location.state as { workflowId?: number })?.workflowId;
  const currentWorkflowId = urlWorkflowId ? parseInt(urlWorkflowId) : workflowIdFromState;

  // Fetch workflow data if we have a workflow ID
  const { data: workflowApiData, isLoading: isWorkflowLoading } = useGetValidationWorkflowQuery(
    currentWorkflowId!,
    {
      skip: !currentWorkflowId,
    }
  );

  // Fetch datasources based on execution point
  const { data: datasourcesData, isLoading: isDatasourcesLoading } =
    useGetDatasourcesQuery(workflowData.executionPoint, {
      skip: !workflowData.executionPoint, // Skip if no execution point selected
    });

  // Show loading state while fetching workflow
  const isLoadingWorkflow = isWorkflowLoading && currentWorkflowId;

  // Load workflow data from API response
  useEffect(() => {
    if (workflowApiData && !isInitialized) {
      // Set workflow data
      setWorkflowData({
        name: workflowApiData.name || "",
        executionPoint: workflowApiData.execution_point || "",
        description: workflowApiData.description || "",
        isDefault: workflowApiData.is_default ?? true,
        conditions: [],
        workflowId: workflowApiData.id,
      });

      // Convert steps to nodes
      if (workflowApiData.steps && workflowApiData.steps.length > 0) {
        const stepNodes: Node[] = workflowApiData.steps.map((step, index) => ({
          id: `condition-${step.id}`,
          type: "condition",
          position: {
            x: 250,
            y: 100 + index * 180, // Stack nodes vertically
          },
          data: {
            id: step.id,
            label: step.name,
            leftSide: step.left_expression,
            operator: step.operation,
            rightSide: step.right_expression,
            leftDataType: "text",
            rightDataType: "text",
            ifTrueAction: step.if_true_action,
            ifTrueActionData: step.if_true_action_data,
            ifFalseAction: step.if_false_action,
            ifFalseActionData: step.if_false_action_data,
            failureMessage: step.failure_message,
            isActive: step.is_active,
          },
        }));

        setNodes(stepNodes);

        // Create edges based on step actions
        const stepEdges: Edge[] = [];
        workflowApiData.steps.forEach((step) => {
          const sourceNodeId = `condition-${step.id}`;

          // Check if true action points to another step
          if (step.if_true_action === "proceed_to_step" || step.if_true_action === "proceed_to_step_by_id") {
            const nextStepId = (step.if_true_action_data as { next_step_id?: number })?.next_step_id;
            if (nextStepId) {
              stepEdges.push({
                id: `edge-${step.id}-true-${nextStepId}`,
                source: sourceNodeId,
                target: `condition-${nextStepId}`,
                sourceHandle: "true",
                type: "smoothstep",
                style: { stroke: "#22C55E", strokeWidth: 2 },
                label: "True",
                labelStyle: { fill: "#22C55E", fontWeight: 500 },
                markerEnd: { type: MarkerType.ArrowClosed, color: "#22C55E" },
              });
            }
          }

          // Check if false action points to another step
          if (step.if_false_action === "proceed_to_step" || step.if_false_action === "proceed_to_step_by_id") {
            const nextStepId = (step.if_false_action_data as { next_step_id?: number })?.next_step_id;
            if (nextStepId) {
              stepEdges.push({
                id: `edge-${step.id}-false-${nextStepId}`,
                source: sourceNodeId,
                target: `condition-${nextStepId}`,
                sourceHandle: "false",
                type: "smoothstep",
                style: { stroke: "#9CA3AF", strokeWidth: 2 },
                label: "False",
                labelStyle: { fill: "#9CA3AF", fontWeight: 500 },
                markerEnd: { type: MarkerType.ArrowClosed, color: "#9CA3AF" },
              });
            }
          }
        });

        setEdges(stepEdges);
      }

      setIsInitialized(true);
    }
  }, [workflowApiData, isInitialized, setNodes, setEdges]);

  // Load workflow data from navigation state if available (fallback for creating new workflow)
  useEffect(() => {
    if (location.state && !currentWorkflowId) {
      const { name, executionPoint, description, isDefault } =
        location.state as WorkflowData;
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
  }, [location.state, currentWorkflowId]);

  // Stage properties (for selected node)
  const [stageData, setStageData] = useState<StageData>({
    name: "",
    leftSide: "",
    leftDataType: "text",
    operator: "==",
    rightSide: "",
    rightDataType: "text",
    ifTrueAction: "complete_success",
    ifTrueActionData: { message: "" },
    ifFalseAction: "complete_failure",
    ifFalseActionData: { error: "" },
    failureMessage: "",
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
        ifTrueAction: (node.data.ifTrueAction as string) || "complete_success",
        ifTrueActionData: (node.data.ifTrueActionData as Record<string, unknown>) || { message: "" },
        ifFalseAction: (node.data.ifFalseAction as string) || "complete_failure",
        ifFalseActionData: (node.data.ifFalseActionData as Record<string, unknown>) || { error: "" },
        failureMessage: (node.data.failureMessage as string) || "",
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
          ifTrueAction: "complete_success",
          ifTrueActionData: { message: "" },
          ifFalseAction: "complete_failure",
          ifFalseActionData: { error: "" },
          failureMessage: "",
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
              ifTrueAction: stageData.ifTrueAction,
              ifTrueActionData: stageData.ifTrueActionData,
              ifFalseAction: stageData.ifFalseAction,
              ifFalseActionData: stageData.ifFalseActionData,
              failureMessage: stageData.failureMessage,
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
        ifTrueAction?: string;
        ifTrueActionData?: Record<string, unknown>;
        ifFalseAction?: string;
        ifFalseActionData?: Record<string, unknown>;
        failureMessage?: string;
      };

      // Find connections for this node to determine proceed_to_step actions
      const trueEdge = edges.find(
        (e) => e.source === node.id && e.sourceHandle === "true"
      );
      const falseEdge = edges.find(
        (e) => e.source === node.id && e.sourceHandle === "false"
      );

      // Use stageData values if set
      const ifTrueAction = nodeData.ifTrueAction || "complete_success";
      let ifTrueActionData: Record<string, unknown> = nodeData.ifTrueActionData ? { ...nodeData.ifTrueActionData } : {};
      const ifFalseAction = nodeData.ifFalseAction || "complete_failure";
      let ifFalseActionData: Record<string, unknown> = nodeData.ifFalseActionData ? { ...nodeData.ifFalseActionData } : {};

      // Handle proceed_to_step with edge connection
      if ((ifTrueAction === "proceed_to_step" || ifTrueAction === "proceed_to_step_by_id") && trueEdge) {
        const targetNode = nodes.find((n) => n.id === trueEdge.target);
        if (targetNode && (targetNode.data as { id?: number }).id) {
          // Use edge target's step ID
          ifTrueActionData = {
            ...ifTrueActionData,
            next_step_id: (targetNode.data as { id?: number }).id,
          };
        }
      }

      if ((ifFalseAction === "proceed_to_step" || ifFalseAction === "proceed_to_step_by_id") && falseEdge) {
        const targetNode = nodes.find((n) => n.id === falseEdge.target);
        if (targetNode && (targetNode.data as { id?: number }).id) {
          // Use edge target's step ID
          ifFalseActionData = {
            ...ifFalseActionData,
            next_step_id: (targetNode.data as { id?: number }).id,
          };
        }
      }

      // Ensure action data has proper structure based on action type
      if (ifTrueAction === "complete_success" && !ifTrueActionData.message) {
        ifTrueActionData = { message: "Step completed successfully" };
      } else if (ifTrueAction === "complete_failure" && !ifTrueActionData.error) {
        ifTrueActionData = { error: "Validation failed" };
      }

      if (ifFalseAction === "complete_success" && !ifFalseActionData.message) {
        ifFalseActionData = { message: "Step completed successfully" };
      } else if (ifFalseAction === "complete_failure" && !ifFalseActionData.error) {
        ifFalseActionData = { error: "Validation failed" };
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
        failure_message: nodeData.failureMessage || undefined,
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

  // Show loading overlay while fetching workflow
  if (isLoadingWorkflow) {
    return (
      <div className="h-[calc(100vh-137px)] flex items-center justify-center bg-[#FAFAFA]">
        <div className="flex flex-col items-center gap-4">
          <svg className="animate-spin h-10 w-10 text-[#00B7AD]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-gray-500">Loading workflow...</p>
        </div>
      </div>
    );
  }

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
