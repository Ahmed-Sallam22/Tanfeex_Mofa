import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  SharedTable,
  type TableColumn,
  type TableRow as SharedTableRow,
  type TableRow,
} from "@/shared/SharedTable";
import SharedModal from "@/shared/SharedModal";
import { useGetTransferDetailsQuery } from "@/api/transferDetails.api";
import { useBulkApproveRejectTransferMutation } from "@/api/pendingTransfer.api";
import toast from "react-hot-toast";
import { formatNumber } from "@/utils/formatNumber";

interface TransferTableRow {
  id: string;
  to: number;
  from: number;
  encumbrance: number;
  availableBudget: number;
  actual: number;
  accountName: string;
  projectName: string;
  accountCode: string;
  projectCode: string;
  approvedBudget?: number;
  costCenterCode?: string;
  costCenterName?: string;
  other_ytd?: number;
  period?: string;
  budget_adjustments?: string;
  commitments?: string;
  expenditures?: string;
  initial_budget?: string;
  obligations?: string;
  other_consumption?: string;
}

export default function PendingAdjustmentsDetails() {
  const { id } = useParams<{ id: string }>();
  console.log(id);

  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Use the transaction ID from params, default to 82 for testing
  const transactionId = id;

  // Fetch data from adjd-transfers API
  const {
    data: apiData,
    error,
    isLoading,
  } = useGetTransferDetailsQuery(String(transactionId));

  // State for processed rows
  const [rows, setRows] = useState<TransferTableRow[]>([]);

  // Process API data when it loads
  useEffect(() => {
    if (apiData?.transfers && apiData.transfers.length > 0) {
      const processedRows = apiData.transfers.map((transfer) => ({
        id: transfer.transfer_id.toString(),
        to: parseFloat(transfer.to_center),
        from: parseFloat(transfer.from_center),
        encumbrance: parseFloat(transfer.encumbrance),
        availableBudget: parseFloat(transfer.available_budget),
        actual: parseFloat(transfer.actual),
        accountName:
          transfer.account_name && transfer.account_name.trim() !== ""
            ? transfer.account_name
            : transfer.account_code.toString(),
        projectName:
          transfer.project_name && transfer.project_name.trim() !== ""
            ? transfer.project_name
            : transfer.project_code || "",
        accountCode: transfer.account_code.toString(),
        projectCode: transfer.project_code || "",
        approvedBudget: parseFloat(transfer.approved_budget),
        costCenterCode: transfer.cost_center_code.toString(),
        costCenterName:
          transfer.cost_center_name && transfer.cost_center_name.trim() !== ""
            ? transfer.cost_center_name
            : transfer.cost_center_code.toString(),
        other_ytd: 0,
        period: "",
        budget_adjustments: transfer.budget_adjustments || "0",
        commitments: transfer.commitments || "0",
        expenditures: transfer.expenditures || "0",
        initial_budget: transfer.initial_budget || "0",
        obligations: transfer.obligations || "0",
        other_consumption: transfer.other_consumption || "0",
      }));
      setRows(processedRows);
    } else {
      // If no API data, set a default row
      setRows([
        {
          id: "default-1",
          to: 0,
          from: 0,
          encumbrance: 0,
          availableBudget: 0,
          actual: 0,
          accountName: "General Operations",
          projectName: "Project Alpha",
          accountCode: "ACC001",
          projectCode: "PRJ001",
          approvedBudget: 0,
          costCenterCode: "",
          costCenterName: "",
          other_ytd: 0,
          period: "",
          budget_adjustments: "0",
          commitments: "0",
          expenditures: "0",
          initial_budget: "0",
          obligations: "0",
          other_consumption: "0",
        },
      ]);
    }
  }, [apiData]);

  // Check if pagination should be shown
  const shouldShowPagination = rows.length > 10;

  const handleBack = () => {
    navigate("/app/PendingRequests");
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Keep the old columns for the main transfer table
    const columnsDetails: TableColumn[] = [
         {
        id: "costCenterCode",
        header: "Legal Entity",
  
        render: (_, row) => {
          const transferRow = row as unknown as TransferTableRow;
          return (
            <span className="text-sm text-gray-900">
              {transferRow.costCenterCode || ""}
            </span>
          );
        },
      },
      {
        id: "accountCode",
        header: "Account Code",
  
        render: (_, row) => {
          const transferRow = row as unknown as TransferTableRow;
          return (
            <span className="text-sm text-gray-900">
              {transferRow.accountCode}
            </span>
          );
        },
      },
  
      {
        id: "projectCode",
        header: "Project Code",
  
        render: (_, row) => {
          const transferRow = row as unknown as TransferTableRow;
          return (
            <span className="text-sm text-gray-900">
              {transferRow.projectCode}
            </span>
          );
        },
      },
     
      {
        id: "encumbrance",
        header: "Encumbrance",
        showSum: true,
  
        render: (_, row) => {
          const transferRow = row as unknown as TransferTableRow;
          const value = transferRow.encumbrance || 0;
          return (
            <span className="text-sm text-gray-900">{formatNumber(value)}</span>
          );
        },
      },
      {
        id: "availableBudget",
        header: "Available Budget",
        showSum: true,
  
        render: (_, row) => {
          const transferRow = row as unknown as TransferTableRow;
          const value = transferRow.availableBudget || 0;
          return (
            <span className="text-sm text-gray-900">{formatNumber(value)}</span>
          );
        },
      },
      {
        id: "actual",
        header: "Actual",
        showSum: true,
  
        render: (_, row) => {
          const transferRow = row as unknown as TransferTableRow;
          const value = transferRow.actual || 0;
          return (
            <span className="text-sm text-gray-900">{formatNumber(value)}</span>
          );
        },
      },
      {
        id: "budget_adjustments",
        header: "Budget Adjustments",
        showSum: true,
  
        render: (_, row) => {
          const transferRow = row as unknown as TransferTableRow;
          const value = Number(transferRow.budget_adjustments) || 0;
          return (
            <span className="text-sm text-gray-900">{formatNumber(value)}</span>
          );
        },
      },
      {
        id: "commitments",
        header: "Commitments",
        showSum: true,
  
        render: (_, row) => {
          const transferRow = row as unknown as TransferTableRow;
          const value = Number(transferRow.commitments) || 0;
          return (
            <span className="text-sm text-gray-900">{formatNumber(value)}</span>
          );
        },
      },
      {
        id: "expenditures",
        header: "Expenditures",
        showSum: true,
  
        render: (_, row) => {
          const transferRow = row as unknown as TransferTableRow;
          const value = Number(transferRow.expenditures) || 0;
          return (
            <span className="text-sm text-gray-900">{formatNumber(value)}</span>
          );
        },
      },
      {
        id: "initial_budget",
        header: "Initial Budget",
        showSum: true,
  
        render: (_, row) => {
          const transferRow = row as unknown as TransferTableRow;
          const value = Number(transferRow.initial_budget) || 0;
          return (
            <span className="text-sm text-gray-900">{formatNumber(value)}</span>
          );
        },
      },
      {
        id: "obligations",
        header: "Obligations",
        showSum: true,
  
        render: (_, row) => {
          const transferRow = row as unknown as TransferTableRow;
          const value = Number(transferRow.obligations) || 0;
          return (
            <span className="text-sm text-gray-900">{formatNumber(value)}</span>
          );
        },
      },
      {
        id: "other_consumption",
        header: "Other Consumption",
        showSum: true,
  
        render: (_, row) => {
          const transferRow = row as unknown as TransferTableRow;
          const value = Number(transferRow.other_consumption) || 0;
          return (
            <span className="text-sm text-gray-900">{formatNumber(value)}</span>
          );
        },
      },
      {
        id: "approvedBudget",
        header: "Approved Budget",
        showSum: true,
  
        render: (_, row) => {
          const transferRow = row as unknown as TransferTableRow;
          const value = transferRow.approvedBudget || 0;
          return (
            <span className="text-sm text-gray-900">{formatNumber(value)}</span>
          );
        },
      },
      {
        id: "other_ytd",
        header: "Other YTD",
        showSum: true,
  
        render: (_, row) => {
          const transferRow = row as unknown as TransferTableRow;
          const value = transferRow.other_ytd || 0;
          return (
            <span className="text-sm text-gray-900">{formatNumber(value)}</span>
          );
        },
      },
      {
        id: "period",
        header: "Period",
  
        render: (_, row) => {
          const transferRow = row as unknown as TransferTableRow;
          return (
            <span className="text-sm text-gray-900">
              {transferRow.period || ""}
            </span>
          );
        },
      },
      {
        id: "costCenterName",
        header: "Legal Entity",
  
        render: (_, row) => {
          const transferRow = row as unknown as TransferTableRow;
          return (
            <span className="text-sm text-gray-900">
              {transferRow.costCenterName || ""}
            </span>
          );
        },
      },
      {
        id: "accountName",
        header: "Account Name",
  
        render: (_, row) => {
          const transferRow = row as unknown as TransferTableRow;
          return (
            <span className="text-sm text-gray-900">
              {transferRow.accountName}
            </span>
          );
        },
      },
      {
        id: "projectName",
        header: "Project Name",
  
        render: (_, row) => {
          const transferRow = row as unknown as TransferTableRow;
          return (
            <span className="text-sm text-gray-900">
              {transferRow.projectName}
            </span>
          );
        },
      },
       {
        id: "from",
        header: "From",
        showSum: true,
  
        render: (_, row) => {
          const transferRow = row as unknown as TransferTableRow;
          return (
            <span className="text-sm text-gray-900">
              {formatNumber(transferRow.from)}
            </span>
          );
        },
      },
    {
        id: "to",
        header: "To",
        showSum: true,
  
        render: (_, row) => {
          const transferRow = row as unknown as TransferTableRow;
          return (
            <span className="text-sm text-gray-900">
              {formatNumber(transferRow.to)}
            </span>
          );
        },
      },
     
    ];
  const [isApproveModalOpen, setIsApproveModalOpen] = useState<boolean>(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState<boolean>(false);
  const [selectedRow, setSelectedRow] = useState<TableRow | null>(null);
  const [bulkApproveRejectTransfer] = useBulkApproveRejectTransferMutation();

  const [reason, setReason] = useState<string>("");

  const handleApprove = (row: TableRow) => {
    console.log(row);

    setSelectedRow(row);
    setReason(""); // Clear reason when opening modal
    setIsApproveModalOpen(true);
  };

  const handleReject = (row: TableRow) => {
    setSelectedRow(row);
    setReason(""); // Clear reason when opening modal
    setIsRejectModalOpen(true);
  };
  const confirmApprove = async () => {
    if (id) {
      try {
        const ACTION_APPROVE = "approve";
        await bulkApproveRejectTransfer({
          transaction_id: [parseInt(id)],
          decide: [ACTION_APPROVE],
          reason: reason ? [reason] : [],
          other_user_id: [],
        }).unwrap();
        console.log("Transfer approved successfully:", selectedRow);
        toast.success("Transfer approved successfully");
        navigate("/app/PendingRequests");
        setReason(""); // Clear reason after success
      } catch (error) {
        console.error("Error approving transfer:", error);
        // Handle error (show toast notification, etc.)
      }
    }
    setIsApproveModalOpen(false);
    setSelectedRow(null);
  };

  const confirmReject = async () => {
    if (id) {
      try {
        const ACTION_REJECT = "reject";
        await bulkApproveRejectTransfer({
          transaction_id: [parseInt(id)],
          decide: [ACTION_REJECT],
          reason: reason ? [reason] : [],
          other_user_id: [],
        }).unwrap();
        console.log("Transfer rejected successfully:", id);
        toast.success("Transfer rejected successfully");
        navigate("/app/PendingRequests");

        setReason(""); // Clear reason after success
      } catch (error) {
        console.error("Error rejecting transfer:", error);
        // Handle error (show toast notification, etc.)
      }
    }
    setIsRejectModalOpen(false);
    setSelectedRow(null);
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64 bg-white rounded-lg">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading transfers...</span>
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
        : "Failed to load transfer details";

    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg text-red-600">Error: {errorMessage}</div>
      </div>
    );
  }

  return (
    <div>
      {/* Header with back button */}
      <div className="flex items-center gap-2 mb-6">
        <button
          onClick={handleBack}
          className="flex items-center gap-2  cursor-pointer py-2 text-lg text-[#4E8476] hover:text-[#4E8476] "
        >
          Pendeing Fund Requests
        </button>
        <span className="text-[#737373] text-lg">/</span>
        <h1 className="text-lg  text-[#737373] font-light tracking-wide">
          Code
        </h1>
      </div>

      <div>
        <SharedTable
          columns={columnsDetails}
          data={rows as unknown as SharedTableRow[]}
          showFooter={true}
          maxHeight="600px"
          showPagination={shouldShowPagination}
          currentPage={currentPage}
          onPageChange={handlePageChange}
          itemsPerPage={itemsPerPage}
          addRowButtonText="Add New Row"
          showColumnSelector={true}
        />
      </div>
      <div className="flex justify-end items-center bg-white rounded-md shadow-sm  mt-4 p-3 w-full">
        {/* زرار Reject */}
        <button
          onClick={() => handleReject(selectedRow!)}
          className="px-4 py-1.5 border border-[#D44333] text-[#D44333] rounded-md hover:bg-red-50 transition"
        >
          Reject
        </button>

        {/* مسافة صغيرة */}
        <div className="w-3" />

        {/* زرار Approve */}
        <button
          onClick={() => handleApprove(selectedRow!)}
          className="px-4 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
        >
          Approve
        </button>
      </div>

      {/* Approve Modal */}
      <SharedModal
        isOpen={isApproveModalOpen}
        onClose={() => {
          setIsApproveModalOpen(false);
          setReason(""); // Clear reason when closing modal
        }}
        title="Approve Budget Request"
        size="md"
      >
        <div className="p-4">
          <div className="flex items-center gap-3 mb-4">
            <p className="text-sm text-[#282828]">
              {" "}
              You're about to approve this budget request. Once approved, the
              requester will be notified, and the process will move to the next
              stage. Are you sure you want to continue?
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#282828] mb-2">
              Reason (Optional)
            </label>
            <textarea
              rows={7}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 text-sm resize-none py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-sm placeholder:text-[#AFAFAF]"
              placeholder="Add any comments or notes (optional)..."
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={() => {
                setIsApproveModalOpen(false);
                setReason(""); // Clear reason when cancelling
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700  border border-gray-300 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={confirmApprove}
              className="px-4 py-2 text-sm font-medium text-white bg-[#00A350]  border border-green-600 rounded-md hover:bg-green-700 transition-colors"
            >
              Approve
            </button>
          </div>
        </div>
      </SharedModal>

      {/* Reject Modal */}
      <SharedModal
        isOpen={isRejectModalOpen}
        onClose={() => {
          setIsRejectModalOpen(false);
          setReason(""); // Clear reason when closing modal
        }}
        title="Reject Transfer"
        size="md"
      >
        <div className="p-4">
          <div className="flex items-center gap-3 mb-4">
            <div>
              <p className="text-sm text-[#282828]">
                You're about to reject this budget request. This action cannot
                be undone. Please provide a clear reason for rejection so the
                requester understands the next steps.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#282828] mb-2">
              Reason for rejection (Optional)
            </label>
            <textarea
              rows={7}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 text-sm resize-none py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-sm placeholder:text-[#AFAFAF]"
              placeholder="Describe the reason for rejection (optional)..."
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={() => {
                setIsRejectModalOpen(false);
                setReason(""); // Clear reason when cancelling
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700  border border-gray-300 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={confirmReject}
              className="px-4 py-2 text-sm font-medium text-white bg-[#D44333] border border-red-600 rounded-md hover:bg-red-700 transition-colors"
            >
              Reject Transfer
            </button>
          </div>
        </div>
      </SharedModal>
    </div>
  );
}
