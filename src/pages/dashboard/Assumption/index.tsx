import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { type TableRow as SharedTableRow } from "@/shared/SharedTable";
import {
  useGetValidationWorkflowsQuery,
  useGetExecutionPointsQuery,
  useCreateValidationWorkflowMutation,
  useUpdateValidationWorkflowMutation,
  useDeleteValidationWorkflowMutation,
} from "@/api/validationWorkflow.api";
import toast from "react-hot-toast";
import {
  AssumptionHeader,
  AssumptionsTable,
  AssumptionModal,
  DescriptionModal,
  type ValidationWorkflow,
} from "./components";

export default function Assumption() {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [isDescriptionModalOpen, setIsDescriptionModalOpen] = useState(false);
  const [isWorkflowModalOpen, setIsWorkflowModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedWorkflow, setSelectedWorkflow] =
    useState<ValidationWorkflow | null>(null);

  // Workflow form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [executionPoint, setExecutionPoint] = useState("");
  const [status, setStatus] = useState<"draft" | "active" | "inactive">(
    "draft"
  );

  // API hooks
  const {
    data: workflowsData,
    isLoading,
    error,
  } = useGetValidationWorkflowsQuery();
  const { data: executionPointsData } = useGetExecutionPointsQuery();
  const [createWorkflow, { isLoading: isCreating }] =
    useCreateValidationWorkflowMutation();
  const [updateWorkflow, { isLoading: isUpdating }] =
    useUpdateValidationWorkflowMutation();
  const [deleteWorkflow] = useDeleteValidationWorkflowMutation();

  const workflows = workflowsData?.results || [];
  const executionPoints = executionPointsData?.execution_points || [];

  const handleCreateNewWorkflow = () => {
    setModalMode("create");
    resetForm();
    setIsWorkflowModalOpen(true);
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setExecutionPoint("");
    setStatus("draft");
  };

  const handleSaveWorkflow = async () => {
    if (!name.trim()) {
      toast.error("Please enter a workflow name");
      return;
    }
    if (!executionPoint) {
      toast.error("Please select an execution point");
      return;
    }
    if (!status) {
      toast.error("Please select a status");
      return;
    }

    try {
      if (modalMode === "create") {
        const createdWorkflow = await createWorkflow({
          name: name.trim(),
          description: description.trim(),
          execution_point: executionPoint,
          status,
          step_ids: [], // Empty - no steps when creating
        }).unwrap();
        toast.success("Validation workflow created successfully");

        // Navigate to AssumptionBuilder with the created workflow ID
        navigate(`/app/AssumptionBuilder/${createdWorkflow.id}`);
      } else if (selectedWorkflow) {
        // Build update payload with only changed fields
        const updatePayload: Record<string, unknown> = {};
        if (name.trim() !== selectedWorkflow.name)
          updatePayload.name = name.trim();
        if (description.trim() !== selectedWorkflow.description)
          updatePayload.description = description.trim();
        if (executionPoint !== selectedWorkflow.execution_point)
          updatePayload.execution_point = executionPoint;
        if (status !== selectedWorkflow.status) updatePayload.status = status;

        if (Object.keys(updatePayload).length > 0) {
          await updateWorkflow({
            id: selectedWorkflow.id,
            body: updatePayload,
          }).unwrap();
          toast.success("Validation workflow updated successfully");
        } else {
          toast("No changes to save", { icon: "ℹ️" });
        }
      }

      resetForm();
      setIsWorkflowModalOpen(false);
      setSelectedWorkflow(null);
    } catch (err) {
      console.error("Failed to save workflow:", err);
      toast.error(
        modalMode === "create"
          ? "Failed to create workflow"
          : "Failed to update workflow"
      );
    }
  };

  const handleCloseWorkflowModal = () => {
    setIsWorkflowModalOpen(false);
    resetForm();
    setSelectedWorkflow(null);
  };

  const handleEdit = (row: SharedTableRow) => {
    const workflow = row as unknown as ValidationWorkflow;
    setSelectedWorkflow(workflow);
    setModalMode("edit");

    // Populate form with existing data
    setName(workflow.name);
    setDescription(workflow.description);
    setExecutionPoint(workflow.execution_point);
    setStatus(workflow.status);

    setIsWorkflowModalOpen(true);
  };

  const handleDelete = async (row: SharedTableRow) => {
    const workflow = row as unknown as ValidationWorkflow;
    try {
      await deleteWorkflow(workflow.id).unwrap();
      toast.success("Validation workflow deleted successfully");
    } catch (err) {
      console.error("Failed to delete workflow:", err);
      toast.error("Failed to delete validation workflow");
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleDescriptionClick = (workflow: ValidationWorkflow) => {
    setSelectedWorkflow(workflow);
    setIsDescriptionModalOpen(true);
  };

  const handleNameClick = (workflow: ValidationWorkflow) => {
    // Navigate to AssumptionBuilder with the workflow ID
    navigate(`/app/AssumptionBuilder/${workflow.id}`);
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64 bg-white rounded-lg">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">
          Loading validation workflows...
        </span>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg text-red-600">
          Error: Failed to load validation workflows
        </div>
      </div>
    );
  }

  return (
    <div>
      <AssumptionHeader onCreateNew={handleCreateNewWorkflow} />

      <AssumptionsTable
        workflows={workflows}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onDescriptionClick={handleDescriptionClick}
        onNameClick={handleNameClick}
        currentPage={currentPage}
        onPageChange={handlePageChange}
        itemsPerPage={itemsPerPage}
        totalCount={workflowsData?.count}
        executionPoints={executionPoints}
      />

      <DescriptionModal
        isOpen={isDescriptionModalOpen}
        onClose={() => setIsDescriptionModalOpen(false)}
        workflow={selectedWorkflow}
      />

      <AssumptionModal
        isOpen={isWorkflowModalOpen}
        onClose={handleCloseWorkflowModal}
        onSave={handleSaveWorkflow}
        mode={modalMode}
        name={name}
        setName={setName}
        description={description}
        setDescription={setDescription}
        executionPoint={executionPoint}
        setExecutionPoint={setExecutionPoint}
        status={status}
        setStatus={(value) =>
          setStatus(value as "draft" | "active" | "inactive")
        }
        isLoading={isCreating || isUpdating}
      />
    </div>
  );
}
