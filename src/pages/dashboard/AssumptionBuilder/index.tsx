import { useCallback, useState, useEffect, useRef } from "react";
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
  useDeleteValidationStepMutation,
  useGetDatasourcesQuery,
  useGetValidationWorkflowQuery,
} from "../../../api/validationWorkflow.api";

// Type for original node data (from API)
interface OriginalNodeData {
  id: number;
  label: string;
  leftSide: string;
  operator: string;
  rightSide: string;
  ifTrueAction: string;
  ifTrueActionData: Record<string, unknown>;
  ifFalseAction: string;
  ifFalseActionData: Record<string, unknown>;
  failureMessage: string;
}

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

  // Track original node data from API (to detect changes)
  const originalNodesDataRef = useRef<Map<string, OriginalNodeData>>(new Map());

  // API Mutations
  const [bulkCreateSteps, { isLoading: isCreating }] =
    useBulkCreateStepsMutation();
  const [bulkUpdateSteps, { isLoading: isUpdating }] =
    useBulkUpdateStepsMutation();
  const [deleteValidationStep, { isLoading: isDeleting }] =
    useDeleteValidationStepMutation();

  // Workflow settings
  const [workflowData, setWorkflowData] = useState<WorkflowData>({
    name: "",
    executionPoint: "",
    description: "",
    isDefault: true,
    conditions: [],
  });

  // Get workflow ID from URL params or location state
  const workflowIdFromState = (location.state as { workflowId?: number })
    ?.workflowId;
  const currentWorkflowId = urlWorkflowId
    ? parseInt(urlWorkflowId)
    : workflowIdFromState;

  // Fetch workflow data if we have a workflow ID
  const {
    data: workflowApiData,
    isLoading: isWorkflowLoading,
    refetch,
  } = useGetValidationWorkflowQuery(currentWorkflowId!, {
    skip: !currentWorkflowId,
  });

  // Fetch datasources based on execution point
  const { data: datasourcesData, isLoading: isDatasourcesLoading } =
    useGetDatasourcesQuery(workflowData.executionPoint, {
      skip: !workflowData.executionPoint, // Skip if no execution point selected
    });

  // Show loading state while fetching workflow
  const isLoadingWorkflow = isWorkflowLoading && currentWorkflowId;

  // Reset initialization when workflow ID changes or component mounts
  useEffect(() => {
    if (currentWorkflowId) {
      setIsInitialized(false);
      // Refetch the workflow data when the page loads or ID changes
      refetch();
    }
  }, [currentWorkflowId, refetch]);

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
        const allNodes: Node[] = [];
        const allEdges: Edge[] = [];

        // Track which steps connect to which (for layout calculation)
        const stepConnections = new Map<
          number,
          { trueTarget?: number; falseTarget?: number }
        >();

        // Track which steps have action nodes (not proceed_to_step)
        const stepHasActionNodes = new Map<
          number,
          { hasTrue: boolean; hasFalse: boolean }
        >();

        // First pass: build connection map and check for action nodes
        workflowApiData.steps.forEach((step) => {
          const connections: { trueTarget?: number; falseTarget?: number } = {};
          const hasActions = { hasTrue: false, hasFalse: false };

          if (
            step.if_true_action === "proceed_to_step" ||
            step.if_true_action === "proceed_to_step_by_id"
          ) {
            connections.trueTarget = (
              step.if_true_action_data as { next_step_id?: number }
            )?.next_step_id;
          } else if (
            step.if_true_action === "complete_success" ||
            step.if_true_action === "complete_failure"
          ) {
            hasActions.hasTrue = true;
          }

          if (
            step.if_false_action === "proceed_to_step" ||
            step.if_false_action === "proceed_to_step_by_id"
          ) {
            connections.falseTarget = (
              step.if_false_action_data as { next_step_id?: number }
            )?.next_step_id;
          } else if (
            step.if_false_action === "complete_success" ||
            step.if_false_action === "complete_failure"
          ) {
            hasActions.hasFalse = true;
          }

          stepConnections.set(step.id, connections);
          stepHasActionNodes.set(step.id, hasActions);
        });

        // Calculate positions based on flow - use tree layout
        const nodePositions = new Map<
          number,
          { x: number; y: number; level: number }
        >();
        const processedSteps = new Set<number>();

        // Find root step (initial_step or first step)
        const initialStepId =
          workflowApiData.initial_step || workflowApiData.steps[0]?.id;

        // Layout constants - significantly increased spacing
        const CONDITION_NODE_HEIGHT = 0; // Approximate height of condition node
        const ACTION_NODE_HEIGHT = 180; // Approximate height of action node
        const ACTION_NODE_OFFSET_Y = 220; // Vertical offset for action nodes from condition
        const ACTION_NODE_OFFSET_X = 220; // Horizontal offset for action nodes from condition
        const MIN_VERTICAL_GAP = 0; // Minimum gap between nodes

        // Calculate vertical spacing: if previous node has action children, add extra space
        const getVerticalSpacing = (prevStepId: number | null) => {
          if (!prevStepId) return 0;
          const prevActions = stepHasActionNodes.get(prevStepId);
          if (prevActions && (prevActions.hasTrue || prevActions.hasFalse)) {
            // Previous node has action children, need more space
            return (
              CONDITION_NODE_HEIGHT +
              ACTION_NODE_OFFSET_Y +
              ACTION_NODE_HEIGHT +
              MIN_VERTICAL_GAP
            );
          }
          // No action children, just normal spacing
          return CONDITION_NODE_HEIGHT + MIN_VERTICAL_GAP;
        };

        // BFS to assign levels and positions - track cumulative Y position
        const queue: Array<{
          stepId: number;
          level: number;
          xOffset: number;
          prevStepId: number | null;
        }> = [];
        if (initialStepId) {
          queue.push({
            stepId: initialStepId,
            level: 0,
            xOffset: 0,
            prevStepId: null,
          });
        }

        let maxLevel = 0;
        const levelYPositions = new Map<number, number>(); // Track Y position for each level
        levelYPositions.set(0, 80); // Starting Y position

        while (queue.length > 0) {
          const { stepId, level, xOffset, prevStepId } = queue.shift()!;

          if (processedSteps.has(stepId)) continue;
          processedSteps.add(stepId);

          maxLevel = Math.max(maxLevel, level);

          // Calculate Y position based on previous level
          let currentY = levelYPositions.get(level);
          if (currentY === undefined) {
            // Calculate based on previous level's position and spacing
            const prevLevelY = levelYPositions.get(level - 1) || 80;
            const spacing = getVerticalSpacing(prevStepId);
            currentY = prevLevelY + spacing;
            levelYPositions.set(level, currentY);
          }

          // Calculate position
          const x = 400 + xOffset;
          const y = currentY;

          nodePositions.set(stepId, { x, y, level });

          // Add connected steps to queue
          const connections = stepConnections.get(stepId);
          if (connections) {
            if (
              connections.trueTarget &&
              !processedSteps.has(connections.trueTarget)
            ) {
              queue.push({
                stepId: connections.trueTarget,
                level: level + 1,
                xOffset: xOffset - 100,
                prevStepId: stepId,
              });
            }
            if (
              connections.falseTarget &&
              !processedSteps.has(connections.falseTarget)
            ) {
              queue.push({
                stepId: connections.falseTarget,
                level: level + 1,
                xOffset: xOffset + 100,
                prevStepId: stepId,
              });
            }
          }
        }

        // Process any unprocessed steps (disconnected nodes)
        let lastY = Math.max(...Array.from(levelYPositions.values())) || 80;
        workflowApiData.steps.forEach((step) => {
          if (!processedSteps.has(step.id)) {
            lastY +=
              CONDITION_NODE_HEIGHT +
              ACTION_NODE_OFFSET_Y +
              ACTION_NODE_HEIGHT +
              MIN_VERTICAL_GAP;
            nodePositions.set(step.id, {
              x: 400,
              y: lastY,
              level: maxLevel + 1,
            });
          }
        });

        // Second pass: create nodes and edges
        workflowApiData.steps.forEach((step) => {
          const conditionNodeId = `condition-${step.id}`;
          const position = nodePositions.get(step.id) || {
            x: 400,
            y: 100,
            level: 0,
          };

          // Store original data for tracking changes
          originalNodesDataRef.current.set(conditionNodeId, {
            id: step.id,
            label: step.name,
            leftSide: step.left_expression,
            operator: step.operation,
            rightSide: step.right_expression,
            ifTrueAction: step.if_true_action,
            ifTrueActionData: step.if_true_action_data as Record<
              string,
              unknown
            >,
            ifFalseAction: step.if_false_action,
            ifFalseActionData: step.if_false_action_data as Record<
              string,
              unknown
            >,
            failureMessage: step.failure_message || "",
          });

          // Create condition node
          const conditionNode: Node = {
            id: conditionNodeId,
            type: "condition",
            position: {
              x: position.x,
              y: position.y,
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
          };
          allNodes.push(conditionNode);

          // Handle if_true_action
          if (step.if_true_action === "complete_success") {
            const message =
              (step.if_true_action_data as { message?: string })?.message || "";
            const successNodeId = `success-${step.id}-true`;

            // Create success node - position to the left and below
            const successNode: Node = {
              id: successNodeId,
              type: "success",
              position: {
                x: position.x - ACTION_NODE_OFFSET_X,
                y: position.y + ACTION_NODE_OFFSET_Y,
              },
              data: {
                label: "Action: Success",
                message: message,
                actionType: "complete_success",
              },
            };
            allNodes.push(successNode);

            // Create edge from condition to success
            allEdges.push({
              id: `edge-${step.id}-true-success`,
              source: conditionNodeId,
              target: successNodeId,
              sourceHandle: "true",
              type: "smoothstep",
              style: { stroke: "#22C55E", strokeWidth: 2 },
              label: "True",
              labelStyle: { fill: "#22C55E", fontWeight: 500 },
              markerEnd: { type: MarkerType.ArrowClosed, color: "#22C55E" },
            });
          } else if (step.if_true_action === "complete_failure") {
            const error =
              (step.if_true_action_data as { error?: string })?.error || "";
            const failNodeId = `fail-${step.id}-true`;

            // Create fail node for true action - position to the left and below
            const failNode: Node = {
              id: failNodeId,
              type: "fail",
              position: {
                x: position.x - ACTION_NODE_OFFSET_X,
                y: position.y + ACTION_NODE_OFFSET_Y,
              },
              data: {
                label: "Action: Fail",
                error: error,
                actionType: "complete_failure",
              },
            };
            allNodes.push(failNode);

            // Create edge from condition to fail
            allEdges.push({
              id: `edge-${step.id}-true-fail`,
              source: conditionNodeId,
              target: failNodeId,
              sourceHandle: "true",
              type: "smoothstep",
              style: { stroke: "#22C55E", strokeWidth: 2 },
              label: "True",
              labelStyle: { fill: "#22C55E", fontWeight: 500 },
              markerEnd: { type: MarkerType.ArrowClosed, color: "#22C55E" },
            });
          } else if (
            step.if_true_action === "proceed_to_step" ||
            step.if_true_action === "proceed_to_step_by_id"
          ) {
            const nextStepId = (
              step.if_true_action_data as { next_step_id?: number }
            )?.next_step_id;
            if (nextStepId) {
              allEdges.push({
                id: `edge-${step.id}-true-${nextStepId}`,
                source: conditionNodeId,
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

          // Handle if_false_action
          if (step.if_false_action === "complete_failure") {
            const error =
              (step.if_false_action_data as { error?: string })?.error || "";
            const failNodeId = `fail-${step.id}-false`;

            // Create fail node - position to the right and below
            const failNode: Node = {
              id: failNodeId,
              type: "fail",
              position: {
                x: position.x + ACTION_NODE_OFFSET_X,
                y: position.y + ACTION_NODE_OFFSET_Y,
              },
              data: {
                label: "Action: Fail",
                error: error,
                actionType: "complete_failure",
              },
            };
            allNodes.push(failNode);

            // Create edge from condition to fail
            allEdges.push({
              id: `edge-${step.id}-false-fail`,
              source: conditionNodeId,
              target: failNodeId,
              sourceHandle: "false",
              type: "smoothstep",
              style: { stroke: "#EF4444", strokeWidth: 2 },
              label: "False",
              labelStyle: { fill: "#EF4444", fontWeight: 500 },
              markerEnd: { type: MarkerType.ArrowClosed, color: "#EF4444" },
            });
          } else if (step.if_false_action === "complete_success") {
            const message =
              (step.if_false_action_data as { message?: string })?.message ||
              "";
            const successNodeId = `success-${step.id}-false`;

            // Create success node for false action - position to the right and below
            const successNode: Node = {
              id: successNodeId,
              type: "success",
              position: {
                x: position.x + ACTION_NODE_OFFSET_X,
                y: position.y + ACTION_NODE_OFFSET_Y,
              },
              data: {
                label: "Action: Success",
                message: message,
                actionType: "complete_success",
              },
            };
            allNodes.push(successNode);

            // Create edge from condition to success
            allEdges.push({
              id: `edge-${step.id}-false-success`,
              source: conditionNodeId,
              target: successNodeId,
              sourceHandle: "false",
              type: "smoothstep",
              style: { stroke: "#EF4444", strokeWidth: 2 },
              label: "False",
              labelStyle: { fill: "#EF4444", fontWeight: 500 },
              markerEnd: { type: MarkerType.ArrowClosed, color: "#EF4444" },
            });
          } else if (
            step.if_false_action === "proceed_to_step" ||
            step.if_false_action === "proceed_to_step_by_id"
          ) {
            const nextStepId = (
              step.if_false_action_data as { next_step_id?: number }
            )?.next_step_id;
            if (nextStepId) {
              allEdges.push({
                id: `edge-${step.id}-false-${nextStepId}`,
                source: conditionNodeId,
                target: `condition-${nextStepId}`,
                sourceHandle: "false",
                type: "smoothstep",
                style: { stroke: "#EF4444", strokeWidth: 2 },
                label: "False",
                labelStyle: { fill: "#EF4444", fontWeight: 500 },
                markerEnd: { type: MarkerType.ArrowClosed, color: "#EF4444" },
              });
            }
          }
        });

        setNodes(allNodes);
        setEdges(allEdges);
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

  // Auto-update node when stageData changes (Feature 1)
  useEffect(() => {
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
              // Update message/error/actionType for success/fail nodes
              message: stageData.message,
              error: stageData.error,
              actionType: stageData.actionType,
            },
          };
        }
        return node;
      })
    );
  }, [stageData, selectedNode, setNodes]);

  const onConnect = useCallback(
    (params: Connection) => {
      const sourceHandle = params.sourceHandle;
      let edgeStyle = {};
      let labelText = "";

      if (sourceHandle === "true") {
        edgeStyle = { stroke: "#22C55E", strokeWidth: 2 };
        labelText = "True";
      } else if (sourceHandle === "false") {
        edgeStyle = { stroke: "#EF4444", strokeWidth: 2 };
        labelText = "False";
      }

      const sourceNode = nodes.find((n) => n.id === params.source);
      const isSourceCondition = sourceNode?.type === "condition";

      // Rule 1: Each condition handle can only have ONE outgoing edge
      if (isSourceCondition) {
        const existingEdgeFromHandle = edges.find(
          (edge) =>
            edge.source === params.source &&
            edge.sourceHandle === params.sourceHandle
        );

        if (existingEdgeFromHandle) {
          const oldTargetNode = nodes.find((n) => n.id === existingEdgeFromHandle.target);

          // Delete old target if it's success/fail and different from new target
          if (
            oldTargetNode &&
            (oldTargetNode.type === "success" || oldTargetNode.type === "fail") &&
            existingEdgeFromHandle.target !== params.target
          ) {
            setNodes((nds) =>
              nds.filter((node) => node.id !== existingEdgeFromHandle.target)
            );
          }

          // Remove old edge
          setEdges((eds) => eds.filter((edge) => edge.id !== existingEdgeFromHandle.id));
        }
      }

      // Rule 2: Each node can only have ONE incoming edge
      // Find any existing edge that goes TO the same target
      const existingEdgeToTarget = edges.find(
        (edge) => edge.target === params.target
      );

      if (existingEdgeToTarget) {
        // Just remove the old incoming edge, don't delete any nodes
        setEdges((eds) => eds.filter((edge) => edge.id !== existingEdgeToTarget.id));
      }

      // Add the new edge
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            type: "smoothstep",
            style: edgeStyle,
            label: labelText,
            labelStyle: {
              fill: sourceHandle === "true" ? "#22C55E" : "#EF4444",
              fontWeight: 500,
            },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: sourceHandle === "true" ? "#22C55E" : "#EF4444",
            },
          },
          eds
        )
      );
    },
    [setEdges, edges, nodes, setNodes]
  );

  // Handle edge deletion - only delete the edge, not the nodes
  const onEdgesDelete = useCallback(
    (edgesToDelete: Edge[]) => {
      // Just delete the edges, don't touch the nodes
      setEdges((eds) =>
        eds.filter((edge) => !edgesToDelete.some((e) => e.id === edge.id))
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
        ifTrueActionData: (node.data.ifTrueActionData as Record<
          string,
          unknown
        >) || { message: "" },
        ifFalseAction:
          (node.data.ifFalseAction as string) || "complete_failure",
        ifFalseActionData: (node.data.ifFalseActionData as Record<
          string,
          unknown
        >) || { error: "" },
        failureMessage: (node.data.failureMessage as string) || "",
        // For success/fail nodes, load message/error/actionType (auto-determined by node type)
        message: (node.data.message as string) || "",
        error: (node.data.error as string) || "",
        actionType:
          node.type === "success"
            ? "complete_success"
            : node.type === "fail"
            ? "complete_failure"
            : "",
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
    (event: React.DragEvent, position: { x: number; y: number }) => {
      event.preventDefault();

      const type = event.dataTransfer.getData("application/reactflow");
      const label = event.dataTransfer.getData("application/label");

      if (!type) return;

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

  // Delete selected node (and associated action nodes if it's a condition)
  const deleteSelectedNode = useCallback(async () => {
    if (!selectedNode) return;

    // Get the node ID to delete
    const nodeIdToDelete = selectedNode.id;
    const nodeData = selectedNode.data as { id?: number };

    // Start with the selected node
    let nodeIdsToDelete = [nodeIdToDelete];

    if (selectedNode.type === "condition") {
      // Extract the step ID from condition node ID (format: "condition-{stepId}")
      const stepIdMatch = nodeIdToDelete.match(/^condition-(\d+)$/);
      if (stepIdMatch) {
        const stepId = stepIdMatch[1];
        // Add associated action nodes to delete list
        nodeIdsToDelete = [
          nodeIdToDelete,
          `success-${stepId}-true`,
          `success-${stepId}-false`,
          `fail-${stepId}-true`,
          `fail-${stepId}-false`,
        ];
      } else {
        // For manually created condition nodes (without step ID pattern)
        // Find all nodes connected to this condition via edges
        const connectedNodeIds = edges
          .filter((edge) => edge.source === nodeIdToDelete)
          .map((edge) => edge.target);

        nodeIdsToDelete = [nodeIdToDelete, ...connectedNodeIds];
      }

      // If the node has an ID (saved in database), call the delete API
      if (nodeData.id) {
        try {
          await deleteValidationStep(nodeData.id).unwrap();
          toast.success("Step deleted successfully");

          // Remove from original data ref
          originalNodesDataRef.current.delete(nodeIdToDelete);
        } catch (error) {
          console.error("Error deleting step:", error);
          toast.error("Failed to delete step. Please try again.");
          return; // Don't remove from UI if API call fails
        }
      }
    }
    // For success/fail nodes, only delete that specific node (not the condition)
    // nodeIdsToDelete already contains just [nodeIdToDelete]

    // Filter out nodes to delete
    setNodes((nds) => nds.filter((node) => !nodeIdsToDelete.includes(node.id)));

    // Filter out edges connected to any of the deleted nodes
    setEdges((eds) =>
      eds.filter(
        (edge) =>
          !nodeIdsToDelete.includes(edge.source) &&
          !nodeIdsToDelete.includes(edge.target)
      )
    );

    setSelectedNode(null);
  }, [selectedNode, edges, setNodes, setEdges, deleteValidationStep]);

  // Helper function to find the next step connected via edges
  const findNextStepFromNode = useCallback(
    (
      conditionNodeId: string,
      isTrue: boolean
    ): { action: string; actionData: Record<string, unknown> } => {
      const handleId = isTrue ? "true" : "false";

      // Current condition node and its stored data (may contain custom messages)
      const currentCondition = nodes.find((n) => n.id === conditionNodeId);
      const currentCondData = (currentCondition?.data || {}) as Record<
        string,
        unknown
      >;

      // Helper to safely read fields from unknown record
      const getStringField = (
        src: Record<string, unknown> | undefined,
        key: string
      ): string | undefined => {
        if (!src) return undefined;
        const val = src[key];
        return typeof val === "string" ? val : undefined;
      };

      // First: direct connection from condition handle to another condition
      const directEdgeToCondition = edges.find(
        (e) => e.source === conditionNodeId && e.sourceHandle === handleId
      );
      if (directEdgeToCondition) {
        const targetNode = nodes.find(
          (n) => n.id === directEdgeToCondition.target
        );
        if (targetNode && targetNode.type === "condition") {
          const targetData = (targetNode.data || {}) as Record<string, unknown>;
          if (typeof targetData.id === "number") {
            // prefer note from current condition data, then fallback
            const note =
              getStringField(
                currentCondData as Record<string, unknown>,
                "note"
              ) ||
              getStringField(
                currentCondData as Record<string, unknown>,
                "message"
              ) ||
              (isTrue ? "Condition passed" : "Condition failed");

            return {
              action: "proceed_to_step_by_id",
              actionData: { next_step_id: targetData.id as number, note },
            };
          } else {
            const message =
              getStringField(
                currentCondData as Record<string, unknown>,
                "message"
              ) ||
              (isTrue ? "Proceeding to next step" : "Moving to fallback step");
            return { action: "proceed_to_step", actionData: { message } };
          }
        }
      }

      // Next: check for an action node (success/fail) coming from this condition
      // Find the edge with the matching handle (true or false)
      const edgeFromCondition = edges.find(
        (e) => e.source === conditionNodeId && e.sourceHandle === handleId
      );

      console.log(
        `🔗 Looking for ${
          isTrue ? "TRUE" : "FALSE"
        } edge from ${conditionNodeId}:`,
        edgeFromCondition
      );

      let actionNodeId: string | undefined;
      if (edgeFromCondition) {
        const targetNode = nodes.find((n) => n.id === edgeFromCondition.target);
        console.log(`🎯 Target node:`, targetNode);
        // Accept success or fail nodes, we'll determine action by node type
        if (
          targetNode &&
          (targetNode.type === "success" || targetNode.type === "fail")
        ) {
          actionNodeId = edgeFromCondition.target;
        }
      }

      // If we have an action node, prefer reading its message/error and whether it links further
      if (actionNodeId) {
        const actionNode = nodes.find((n) => n.id === actionNodeId);
        const actionData = (actionNode?.data || {}) as Record<string, unknown>;

        // If the action node links to another condition, handle proceed_to_step_by_id/proceed_to_step
        const edgeToNextStep = edges.find((e) => e.source === actionNodeId);
        if (edgeToNextStep) {
          const targetNode = nodes.find((n) => n.id === edgeToNextStep.target);
          if (targetNode && targetNode.type === "condition") {
            const targetData = (targetNode.data || {}) as Record<
              string,
              unknown
            >;
            if (typeof targetData.id === "number") {
              // use action node message as note if present
              const note =
                getStringField(actionData, "message") ||
                getStringField(actionData, "error") ||
                getStringField(
                  currentCondData as Record<string, unknown>,
                  "note"
                ) ||
                (isTrue ? "Condition passed" : "Condition failed");
              return {
                action: "proceed_to_step_by_id",
                actionData: { next_step_id: targetData.id as number, note },
              };
            } else {
              const message =
                getStringField(actionData, "message") ||
                getStringField(actionData, "error") ||
                getStringField(
                  currentCondData as Record<string, unknown>,
                  "message"
                ) ||
                (isTrue
                  ? "Proceeding to next step"
                  : "Moving to fallback step");
              return { action: "proceed_to_step", actionData: { message } };
            }
          }
        }

        // Otherwise, return the action indicated by the action node type
        // Success node = complete_success, Fail node = complete_failure
        const actionNodeType = actionNode?.type;

        console.log(`📍 Action node for ${isTrue ? "TRUE" : "FALSE"} path:`, {
          actionNodeId,
          actionNodeType,
          actionData,
          message: getStringField(actionData, "message"),
          error: getStringField(actionData, "error"),
        });

        if (actionNodeType === "success") {
          const finalMessage =
            getStringField(actionData, "message") ||
            getStringField(
              currentCondData as Record<string, unknown>,
              "message"
            ) ||
            "";
          return {
            action: "complete_success",
            actionData: { message: finalMessage },
          };
        }
        if (actionNodeType === "fail") {
          // allow error or message field (flexible)
          const error =
            getStringField(actionData, "error") ||
            getStringField(actionData, "message") ||
            getStringField(
              currentCondData as Record<string, unknown>,
              "error"
            ) ||
            "";
          return { action: "complete_failure", actionData: { error } };
        }
      }

      // Fallback: use stored condition data (allow swapped actions/messages)
      const storedTrue =
        currentCondData?.ifTrueAction ||
        (isTrue ? "complete_success" : "complete_failure");
      const storedFalse =
        currentCondData?.ifFalseAction ||
        (isTrue ? "complete_failure" : "complete_success");

      if (isTrue) {
        if (storedTrue === "complete_success") {
          const msg =
            getStringField(
              currentCondData as Record<string, unknown>,
              "message"
            ) ||
            getStringField(
              currentCondData as Record<string, unknown>,
              "ifTrueActionData"
            ) ||
            "";
          return { action: "complete_success", actionData: { message: msg } };
        }
        if (storedTrue === "complete_failure") {
          const err =
            getStringField(
              currentCondData as Record<string, unknown>,
              "error"
            ) ||
            getStringField(
              currentCondData as Record<string, unknown>,
              "message"
            ) ||
            "";
          return { action: "complete_failure", actionData: { error: err } };
        }
      } else {
        if (storedFalse === "complete_success") {
          const msg =
            getStringField(
              currentCondData as Record<string, unknown>,
              "message"
            ) || "";
          return { action: "complete_success", actionData: { message: msg } };
        }
        if (storedFalse === "complete_failure") {
          const err =
            getStringField(
              currentCondData as Record<string, unknown>,
              "error"
            ) ||
            getStringField(
              currentCondData as Record<string, unknown>,
              "message"
            ) ||
            "";
          return { action: "complete_failure", actionData: { error: err } };
        }
      }

      // final fallback
      return isTrue
        ? { action: "complete_success", actionData: { message: "" } }
        : { action: "complete_failure", actionData: { error: "" } };
    },
    [edges, nodes]
  );

  // Build workflow JSON and save to API
  const buildWorkflowJSON = useCallback(async () => {
    if (!workflowData.workflowId) {
      toast.error("Workflow ID is required. Please create a workflow first.");
      return;
    }

    // Filter only condition nodes (not success/fail nodes)
    const conditionNodes = nodes.filter((node) => node.type === "condition");

    // Separate new steps (no id) from existing steps (has id)
    const newSteps: Array<{
      name: string;
      description: string;
      order: number;
      left_expression: string;
      operation: string;
      right_expression: string;
      if_true_action: string;
      if_true_action_data: Record<string, unknown>;
      if_false_action: string;
      if_false_action_data: Record<string, unknown>;
      failure_message: string;
      is_active: boolean;
    }> = [];

    const existingStepsUpdates: Array<{
      step_id: number;
      [key: string]: unknown;
    }> = [];

    conditionNodes.forEach((node, index) => {
      const nodeData = node.data as {
        id?: number;
        label?: string;
        leftSide?: string;
        operator?: string;
        rightSide?: string;
        ifTrueAction?: string;
        ifTrueActionData?: Record<string, unknown>;
        ifFalseAction?: string;
        ifFalseActionData?: Record<string, unknown>;
        failureMessage?: string;
      };

      // Determine actions based on edge connections
      const truePathResult = findNextStepFromNode(node.id, true);
      const falsePathResult = findNextStepFromNode(node.id, false);

      console.log("🔍 Node:", node.id);
      console.log("✅ True path:", truePathResult);
      console.log("❌ False path:", falsePathResult);

      const ifTrueAction = truePathResult.action;
      const ifTrueActionData = truePathResult.actionData;
      const ifFalseAction = falsePathResult.action;
      const ifFalseActionData = falsePathResult.actionData;
      const failureMessage =
        nodeData.failureMessage ||
        `${nodeData.label || "Step"} validation failed`;

      if (nodeData.id) {
        // Existing step - only send changed fields
        const originalData = originalNodesDataRef.current.get(node.id);
        const changes: { step_id: number; [key: string]: unknown } = {
          step_id: nodeData.id,
        };

        // Compare each field and only add if changed
        if (originalData) {
          if (nodeData.label !== originalData.label) {
            changes.name = nodeData.label;
          }
          if (nodeData.leftSide !== originalData.leftSide) {
            changes.left_expression = nodeData.leftSide;
          }
          if (nodeData.operator !== originalData.operator) {
            changes.operation = nodeData.operator;
          }
          if (nodeData.rightSide !== originalData.rightSide) {
            changes.right_expression = nodeData.rightSide;
          }
          if (ifTrueAction !== originalData.ifTrueAction) {
            changes.if_true_action = ifTrueAction;
          }
          if (
            JSON.stringify(ifTrueActionData) !==
            JSON.stringify(originalData.ifTrueActionData)
          ) {
            changes.if_true_action_data = ifTrueActionData;
          }
          if (ifFalseAction !== originalData.ifFalseAction) {
            changes.if_false_action = ifFalseAction;
          }
          if (
            JSON.stringify(ifFalseActionData) !==
            JSON.stringify(originalData.ifFalseActionData)
          ) {
            changes.if_false_action_data = ifFalseActionData;
          }
          if (failureMessage !== originalData.failureMessage) {
            changes.failure_message = failureMessage;
          }

          // Only add to updates if there are actual changes (more than just step_id)
          if (Object.keys(changes).length > 1) {
            existingStepsUpdates.push(changes);
          }

          // No original data found, send all fields
          existingStepsUpdates.push({
            step_id: nodeData.id,
            name: nodeData.label || `Step ${index + 1}`,
            left_expression: nodeData.leftSide || "",
            operation: nodeData.operator || "==",
            right_expression: nodeData.rightSide || "",
            if_true_action: ifTrueAction,
            if_true_action_data: ifTrueActionData,
            if_false_action: ifFalseAction,
            if_false_action_data: ifFalseActionData,
            failure_message: failureMessage,
          });
        }
      } else {
        // New step - include all fields
        newSteps.push({
          name: nodeData.label || `Step ${index + 1}`,
          description: `Validation step: ${nodeData.label || ""}`,
          order: index + 1,
          left_expression: nodeData.leftSide || "",
          operation: nodeData.operator || "==",
          right_expression: nodeData.rightSide || "",
          if_true_action: ifTrueAction,
          if_true_action_data: ifTrueActionData,
          if_false_action: ifFalseAction,
          if_false_action_data: ifFalseActionData,
          failure_message: failureMessage,
          is_active: true,
        });
      }
    });

    try {
      const promises: Promise<unknown>[] = [];

      // Create new steps if any
      if (newSteps.length > 0) {
        const createPromise = bulkCreateSteps({
          workflow_id: workflowData.workflowId!,
          steps: newSteps,
        })
          .unwrap()
          .then((result) => {
            // Handle both `created_steps` and `steps` response formats
            const createdSteps = result.created_steps || result.steps || [];
            const stepCount = result.created_count || createdSteps.length;

            toast.success(`Successfully created ${stepCount} steps`);
            console.log("Created steps:", result);

            // Update nodes with the returned IDs and store original data
            const newStepNodes = conditionNodes.filter(
              (node) => !(node.data as { id?: number }).id
            );
            setNodes((nds) =>
              nds.map((node) => {
                const newStepIndex = newStepNodes.findIndex(
                  (n) => n.id === node.id
                );
                if (newStepIndex !== -1 && createdSteps[newStepIndex]) {
                  const createdStep = createdSteps[newStepIndex];
                  const nodeData = node.data as Record<string, unknown>;

                  // Store original data for future change detection
                  if (createdStep.id !== undefined) {
                    originalNodesDataRef.current.set(node.id, {
                      id: createdStep.id,
                      label: (nodeData.label as string) || "",
                      leftSide: (nodeData.leftSide as string) || "",
                      operator: (nodeData.operator as string) || "==",
                      rightSide: (nodeData.rightSide as string) || "",
                      ifTrueAction:
                        (nodeData.ifTrueAction as string) || "complete_success",
                      ifTrueActionData:
                        (nodeData.ifTrueActionData as Record<
                          string,
                          unknown
                        >) || {},
                      ifFalseAction:
                        (nodeData.ifFalseAction as string) ||
                        "complete_failure",
                      ifFalseActionData:
                        (nodeData.ifFalseActionData as Record<
                          string,
                          unknown
                        >) || {},
                      failureMessage: (nodeData.failureMessage as string) || "",
                    });
                  }

                  return {
                    ...node,
                    data: {
                      ...node.data,
                      id: createdStep.id,
                    },
                  };
                }
                return node;
              })
            );
          });
        promises.push(createPromise);
      }

      // Update existing steps if any have changes
      if (existingStepsUpdates.length > 0) {
        const updatePromise = bulkUpdateSteps({ updates: existingStepsUpdates })
          .unwrap()
          .then((result) => {
            toast.success(
              `Successfully updated ${
                result.updated_count ||
                result.steps?.length ||
                existingStepsUpdates.length
              } steps`
            );
            console.log("Updated steps:", result);

            // Update original data ref with new values
            existingStepsUpdates.forEach((update) => {
              const node = conditionNodes.find(
                (n) => (n.data as { id?: number }).id === update.step_id
              );
              if (node) {
                const currentOriginal = originalNodesDataRef.current.get(
                  node.id
                );
                if (currentOriginal) {
                  // Merge updates into original data
                  originalNodesDataRef.current.set(node.id, {
                    ...currentOriginal,
                    ...(update.name !== undefined && {
                      label: update.name as string,
                    }),
                    ...(update.left_expression !== undefined && {
                      leftSide: update.left_expression as string,
                    }),
                    ...(update.operation !== undefined && {
                      operator: update.operation as string,
                    }),
                    ...(update.right_expression !== undefined && {
                      rightSide: update.right_expression as string,
                    }),
                    ...(update.if_true_action !== undefined && {
                      ifTrueAction: update.if_true_action as string,
                    }),
                    ...(update.if_true_action_data !== undefined && {
                      ifTrueActionData: update.if_true_action_data as Record<
                        string,
                        unknown
                      >,
                    }),
                    ...(update.if_false_action !== undefined && {
                      ifFalseAction: update.if_false_action as string,
                    }),
                    ...(update.if_false_action_data !== undefined && {
                      ifFalseActionData: update.if_false_action_data as Record<
                        string,
                        unknown
                      >,
                    }),
                    ...(update.failure_message !== undefined && {
                      failureMessage: update.failure_message as string,
                    }),
                  });
                }
              }
            });
          });
        promises.push(updatePromise);
      }

      if (promises.length === 0) {
        toast.success("No changes to save");
        return;
      }

      await Promise.all(promises);
    } catch (error) {
      console.error("Error saving workflow steps:", error);
      toast.error("Failed to save workflow steps. Please try again.");
    }
  }, [
    workflowData,
    nodes,
    bulkCreateSteps,
    bulkUpdateSteps,
    setNodes,
    findNextStepFromNode,
  ]);

  // Show loading overlay while fetching workflow
  if (isLoadingWorkflow) {
    return (
      <div className="h-[calc(100vh-137px)] flex items-center justify-center bg-[#FAFAFA]">
        <div className="flex flex-col items-center gap-4">
          <svg
            className="animate-spin h-10 w-10 text-[#00B7AD]"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
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
          onEdgesDelete={onEdgesDelete}
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
          deleteSelectedNode={deleteSelectedNode}
          buildWorkflowJSON={buildWorkflowJSON}
          isCollapsed={isRightSidebarCollapsed}
          onToggleCollapse={() =>
            setIsRightSidebarCollapsed(!isRightSidebarCollapsed)
          }
          isSaving={isCreating || isUpdating || isDeleting}
          datasources={datasourcesData?.datasources || []}
          isDatasourcesLoading={isDatasourcesLoading}
        />
      </div>
    </div>
  );
}

// https://youtube.com/shorts/p0kjVrGME9g?si=jvm4M0yyu8UyaUqW
