import type { TableColumn } from "@/shared/SharedTable";
import type { ValidationWorkflow } from "./types";

// Helper function to format execution point for display
const formatExecutionPoint = (executionPoint: string): string => {
  const map: Record<string, string> = {
    general: "General",
    on_transfer_submit: "On Transfer Submit",
    on_transfer_approve: "On Transfer Approve",
    on_fund_request: "On Fund Request",
    on_adjustment: "On Adjustment",
  };
  return map[executionPoint] || executionPoint;
};

// Helper function to format date
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const getValidationWorkflowColumns = (
  onDescriptionClick: (workflow: ValidationWorkflow) => void
): TableColumn[] => [
  {
    id: "name",
    header: "Name",
    render: (_, row) => {
      const workflow = row as unknown as ValidationWorkflow;
      return (
        <span className="text-sm text-gray-900 font-medium">
          {workflow.name}
        </span>
      );
    },
  },
  {
    id: "description",
    header: "Description",
    render: (_, row) => {
      const workflow = row as unknown as ValidationWorkflow;
      return (
        <button
          onClick={() => onDescriptionClick(workflow)}
          className="text-sm text-gray-900 bg-gray-100 p-2 rounded-md truncate max-w-xs hover:bg-gray-200 transition-colors cursor-pointer text-left"
          title="Click to view full description"
        >
          Description
        </button>
      );
    },
  },
  {
    id: "execution_point",
    header: "Execution Point",
    render: (_, row) => {
      const workflow = row as unknown as ValidationWorkflow;
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {formatExecutionPoint(workflow.execution_point)}
        </span>
      );
    },
  },
  {
    id: "status",
    header: "Status",
    render: (_, row) => {
      const workflow = row as unknown as ValidationWorkflow;
      const statusColors: Record<string, string> = {
        active: "bg-green-100 text-green-800",
        inactive: "bg-red-100 text-red-800",
        draft: "bg-yellow-100 text-yellow-800",
      };
      return (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
            statusColors[workflow.status] || "bg-gray-100 text-gray-800"
          }`}
        >
          {workflow.status}
        </span>
      );
    },
  },
  {
    id: "is_default",
    header: "Default",
    render: (_, row) => {
      const workflow = row as unknown as ValidationWorkflow;
      return (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            workflow.is_default
              ? "bg-purple-100 text-purple-800"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          {workflow.is_default ? "Yes" : "No"}
        </span>
      );
    },
  },
  {
    id: "created_by_username",
    header: "Created By",
    render: (_, row) => {
      const workflow = row as unknown as ValidationWorkflow;
      return (
        <span className="text-sm text-gray-900">
          {workflow.created_by_username}
        </span>
      );
    },
  },
  {
    id: "updated_at",
    header: "Last Updated",
    render: (_, row) => {
      const workflow = row as unknown as ValidationWorkflow;
      return (
        <span className="text-sm text-gray-500">
          {formatDate(workflow.updated_at)}
        </span>
      );
    },
  },
];

// Alias for backward compatibility
export const getAssumptionColumns = getValidationWorkflowColumns;
