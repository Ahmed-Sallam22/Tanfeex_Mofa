// Types for workflow data
export interface ConditionData {
  id: string;
  name: string;
  leftSide: string;
  operator: string;
  rightSide: string;
  leftDataType: string;
  rightDataType: string;
}

export interface WorkflowData {
  name: string;
  executionPoint: string;
  description: string;
  isDefault: boolean;
  conditions: ConditionData[];
  workflowId?: number; // Optional workflow ID for updates
}

// Custom Node Types
export interface ConditionNodeData extends Record<string, unknown> {
  label?: string;
  leftSide?: string;
  operator?: string;
  rightSide?: string;
  leftDataType?: string;
  rightDataType?: string;
}

export interface ActionNodeData extends Record<string, unknown> {
  label?: string;
}

// Draggable block items
export interface BlockItem {
  type: string;
  label: string;
  icon: React.ReactNode;
  color: string;
}

// Stage data for editing
export interface StageData {
  name: string;
  leftSide: string;
  leftDataType: string;
  operator: string;
  rightSide: string;
  rightDataType: string;
}
