import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { type TableRow as SharedTableRow } from "@/shared/SharedTable";
// import {
//   useGetAssumptionTemplatesQuery,
//   useDeleteAssumptionTemplateMutation,
// } from "@/api/assumption.api";
import toast from "react-hot-toast";
import {
  AssumptionHeader,
  AssumptionsTable,
  AssumptionModal,
  DescriptionModal,
  dummyAssumptions,
  type AssumptionTemplate,
} from "./components";

export default function Assumption() {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [isDescriptionModalOpen, setIsDescriptionModalOpen] = useState(false);
  const [isAssumptionModalOpen, setIsAssumptionModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedAssumption, setSelectedAssumption] = useState<AssumptionTemplate | null>(null);
  const [assumptions, setAssumptions] = useState<AssumptionTemplate[]>(dummyAssumptions);

  // Assumption form state
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [transferType, setTransferType] = useState("");
  const [description, setDescription] = useState("");
  const [version, setVersion] = useState(1);
  const [isActive, setIsActive] = useState(true);

  // Fetch assumption templates data - COMMENTED OUT
  // const { data: assumptionData, error, isLoading } = useGetAssumptionTemplatesQuery();

  // Delete assumption mutation - COMMENTED OUT
  // const [deleteAssumptionTemplate] = useDeleteAssumptionTemplateMutation();

  // Mock loading and error states
  const isLoading = false;
  const error = null;

  const handleCreateNewAssumption = () => {
    setModalMode("create");
    resetForm();
    setIsAssumptionModalOpen(true);
  };

  const resetForm = () => {
    setCode("");
    setName("");
    setTransferType("");
    setDescription("");
    setVersion(1);
    setIsActive(true);
  };

  const handleSaveAssumption = () => {
    if (!code.trim()) {
      toast.error("Please enter a code");
      return;
    }
    if (!name.trim()) {
      toast.error("Please enter an assumption name");
      return;
    }
    if (!transferType) {
      toast.error("Please select a transfer type");
      return;
    }

    if (modalMode === "create") {
      // Navigate to AssumptionBuilder with assumption data
      navigate("/app/AssumptionBuilder", {
        state: {
          code,
          name,
          transferType,
          description,
          version,
          isActive,
        },
      });
    } else {
      // Edit mode - update the assumption in local state
      if (selectedAssumption) {
        setAssumptions((prev) =>
          prev.map((item) =>
            item.id === selectedAssumption.id
              ? {
                  ...item,
                  code,
                  name,
                  transfer_type: transferType,
                  description,
                  version,
                  is_active: isActive,
                }
              : item
          )
        );
        toast.success("Assumption updated successfully");
      }
    }

    resetForm();
    setIsAssumptionModalOpen(false);
    setSelectedAssumption(null);
  };

  const handleCloseAssumptionModal = () => {
    setIsAssumptionModalOpen(false);
    resetForm();
    setSelectedAssumption(null);
  };

  const handleEdit = (row: SharedTableRow) => {
    const assumption = row as unknown as AssumptionTemplate;
    setSelectedAssumption(assumption);
    setModalMode("edit");

    // Populate form with existing data
    setCode(assumption.code);
    setName(assumption.name);
    setTransferType(assumption.transfer_type);
    setDescription(assumption.description);
    setVersion(assumption.version);
    setIsActive(assumption.is_active);

    setIsAssumptionModalOpen(true);
  };

  const handleDelete = async (row: SharedTableRow) => {
    const assumption = row as unknown as AssumptionTemplate;
    try {
      // API call commented out
      // await deleteAssumptionTemplate(assumption.id).unwrap();

      // Dummy delete - remove from local state
      setAssumptions((prev) => prev.filter((item) => item.id !== assumption.id));
      toast.success("Assumption template deleted successfully");
    } catch (error) {
      console.error("Failed to delete assumption template:", error);
      toast.error("Failed to delete assumption template");
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleDescriptionClick = (assumption: AssumptionTemplate) => {
    setSelectedAssumption(assumption);
    setIsDescriptionModalOpen(true);
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64 bg-white rounded-lg">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading assumptions...</span>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg text-red-600">Error: Failed to load assumptions</div>
      </div>
    );
  }

  return (
    <div>
      <AssumptionHeader onCreateNew={handleCreateNewAssumption} />

      <AssumptionsTable
        assumptions={assumptions}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onDescriptionClick={handleDescriptionClick}
        currentPage={currentPage}
        onPageChange={handlePageChange}
        itemsPerPage={itemsPerPage}
      />

      <DescriptionModal
        isOpen={isDescriptionModalOpen}
        onClose={() => setIsDescriptionModalOpen(false)}
        assumption={selectedAssumption}
      />

      <AssumptionModal
        isOpen={isAssumptionModalOpen}
        onClose={handleCloseAssumptionModal}
        onSave={handleSaveAssumption}
        mode={modalMode}
        code={code}
        setCode={setCode}
        name={name}
        setName={setName}
        transferType={transferType}
        setTransferType={setTransferType}
        description={description}
        setDescription={setDescription}
        version={version}
        setVersion={setVersion}
        isActive={isActive}
        setIsActive={setIsActive}
      />
    </div>
  );
}
