import { useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  SharedTable,
  type TableColumn,
  type TableRow as SharedTableRow,
} from "@/shared/SharedTable";
import SharedModal from "@/shared/SharedModal";
import {
  useGetWorkflowTemplatesQuery,
  useDeleteWorkflowTemplateMutation,
  type WorkflowTemplate,
} from "@/api/workflow.api";
import toast from "react-hot-toast";

export default function WorkFlow() {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [isDescriptionModalOpen, setIsDescriptionModalOpen] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] =
    useState<WorkflowTemplate | null>(null);

  // Fetch workflow templates data
  const {
    data: workflowData,
    error,
    isLoading,
  } = useGetWorkflowTemplatesQuery();

  // Delete workflow mutation
  const [deleteWorkflowTemplate] = useDeleteWorkflowTemplateMutation();

  const handleCreateNewWorkflow = () => {
    navigate("/app/AddWorkFlow");
  };

  const handleEdit = (row: SharedTableRow) => {
    const workflow = row as unknown as WorkflowTemplate;
    navigate(`/app/EditWorkFlow/${workflow.id}`);
  };

  const handleDelete = async (row: SharedTableRow) => {
    const workflow = row as unknown as WorkflowTemplate;
    try {
      await deleteWorkflowTemplate(workflow.id).unwrap();
      toast.success("Workflow template deleted successfully");
      // Success feedback could be added here (toast notification, etc.)
    } catch (error) {
      console.error("Failed to delete workflow template:", error);
      toast.error("Failed to delete workflow template");
      // Error feedback could be added here
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleDescriptionClick = (workflow: WorkflowTemplate) => {
    setSelectedWorkflow(workflow);
    setIsDescriptionModalOpen(true);
  };

  // Define columns for the workflows table
  const columns: TableColumn[] = [
    {
      id: "code",
      header: "Code",
      render: (_, row) => {
        const workflow = row as unknown as WorkflowTemplate;
        return (
          <span className="text-sm text-gray-900 font-medium">
            {workflow.code}
          </span>
        );
      },
    },
    {
      id: "name",
      header: "Name",
      render: (_, row) => {
        const workflow = row as unknown as WorkflowTemplate;
        return <span className="text-sm text-gray-900">{workflow.name}</span>;
      },
    },
    {
      id: "transfer_type",
      header: "Transfer Type",
      render: (_, row) => {
        const workflow = row as unknown as WorkflowTemplate;
        return (
          <span className="text-sm text-gray-900">
            {workflow.transfer_type}
          </span>
        );
      },
    },
    {
      id: "description",
      header: "Description",
      render: (_, row) => {
        const workflow = row as unknown as WorkflowTemplate;

        return (
          <button
            onClick={() => handleDescriptionClick(workflow)}
            className="text-sm text-gray-900 bg-gray-100 p-2 rounded-md truncate max-w-xs hover:bg-gray-200 transition-colors cursor-pointer text-left"
            title="Click to view full description"
          >
            Description
          </button>
        );
      },
    },
    {
      id: "version",
      header: "Version",
      render: (_, row) => {
        const workflow = row as unknown as WorkflowTemplate;
        return (
          <span className="text-sm text-gray-900">v.{workflow.version}</span>
        );
      },
    },
    {
      id: "is_active",
      header: "Status",
      render: (_, row) => {
        const workflow = row as unknown as WorkflowTemplate;
        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              workflow.is_active
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {workflow.is_active ? "Active" : "Inactive"}
          </span>
        );
      },
    },
  ];

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64 bg-white rounded-lg">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading workflows...</span>
      </div>
    );
  }

  // Show error state
  if (error) {
    const errorMessage =
      "data" in error
        ? JSON.stringify(error.data)
        : "message" in error
        ? error.message
        : "Failed to load workflows";

    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg text-red-600">Error: {errorMessage}</div>
      </div>
    );
  }

  const workflows = workflowData?.results || [];
  const shouldShowPagination = workflows.length > itemsPerPage;

  return (
    <div>
      {/* Header with title and Create New Workflow button */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">WorkFlows</h1>

        <button
          onClick={handleCreateNewWorkflow}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#4E8476] text-white text-sm font-medium rounded-lg hover:bg-[#3d6b5f] transition-colors"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M8 1V15M1 8H15"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Create New Workflow
        </button>
      </div>

      {/* Workflows List Table */}
      <div className="bg-white rounded-lg shadow-sm">
        <SharedTable
          title="Workflows List"
          columns={columns}
          data={workflows as unknown as SharedTableRow[]}
          showFooter={false}
          maxHeight="600px"
          showActions={true}
          onDelete={handleDelete}
          onEdit={handleEdit}
          showPagination={shouldShowPagination}
          currentPage={currentPage}
          onPageChange={handlePageChange}
          itemsPerPage={itemsPerPage}
        />
      </div>

      {/* Description Modal */}
      <SharedModal
        isOpen={isDescriptionModalOpen}
        onClose={() => setIsDescriptionModalOpen(false)}
        title="Workflow Description"
        size="md"
      >
        <div className="p-4">
          {selectedWorkflow && (
            <div className="space-y-4">
              <div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-900 leading-relaxed">
                    {selectedWorkflow.description || "No description available"}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end mt-6">
            <button
              onClick={() => setIsDescriptionModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </SharedModal>
    </div>
  );
}
