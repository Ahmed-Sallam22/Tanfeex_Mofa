import {
  SharedTable,
  type TableRow as SharedTableRow,
} from "@/shared/SharedTable";
import type { ValidationWorkflow } from "./types";
import { getValidationWorkflowColumns } from "./tableColumns";

interface ValidationWorkflowsTableProps {
  workflows: ValidationWorkflow[];
  onEdit: (row: SharedTableRow) => void;
  onDelete: (row: SharedTableRow) => void;
  onDescriptionClick: (workflow: ValidationWorkflow) => void;
  currentPage: number;
  onPageChange: (page: number) => void;
  itemsPerPage: number;
  totalCount?: number;
}

export const AssumptionsTable = ({
  workflows,
  onEdit,
  onDelete,
  onDescriptionClick,
  currentPage,
  onPageChange,
  itemsPerPage,
  totalCount,
}: ValidationWorkflowsTableProps) => {
  const columns = getValidationWorkflowColumns(onDescriptionClick);
  const total = totalCount ?? workflows.length;
  const shouldShowPagination = total > itemsPerPage;

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <SharedTable
        title="Validation Workflows List"
        columns={columns}
        data={workflows as unknown as SharedTableRow[]}
        showFooter={false}
        maxHeight="600px"
        showActions={true}
        onDelete={onDelete}
        onEdit={onEdit}
        showPagination={shouldShowPagination}
        currentPage={currentPage}
        onPageChange={onPageChange}
        itemsPerPage={itemsPerPage}
      />
    </div>
  );
};

// Alias for backward compatibility
export const ValidationWorkflowsTable = AssumptionsTable;
