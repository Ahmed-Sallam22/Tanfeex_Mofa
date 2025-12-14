import { SharedTable, type TableRow as SharedTableRow } from "@/shared/SharedTable";
import type { AssumptionTemplate } from "./types";
import { getAssumptionColumns } from "./tableColumns";

interface AssumptionsTableProps {
  assumptions: AssumptionTemplate[];
  onEdit: (row: SharedTableRow) => void;
  onDelete: (row: SharedTableRow) => void;
  onDescriptionClick: (assumption: AssumptionTemplate) => void;
  currentPage: number;
  onPageChange: (page: number) => void;
  itemsPerPage: number;
}

export const AssumptionsTable = ({
  assumptions,
  onEdit,
  onDelete,
  onDescriptionClick,
  currentPage,
  onPageChange,
  itemsPerPage,
}: AssumptionsTableProps) => {
  const columns = getAssumptionColumns(onDescriptionClick);
  const shouldShowPagination = assumptions.length > itemsPerPage;

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <SharedTable
        title="Assumptions List"
        columns={columns}
        data={assumptions as unknown as SharedTableRow[]}
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
