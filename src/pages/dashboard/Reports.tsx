import SearchBar from "@/shared/SearchBar";
import { SharedTable } from "@/shared/SharedTable";
import type { TableColumn, TableRow } from "@/shared/SharedTable";
import { SharedSelect } from "@/shared/SharedSelect";
import type { SelectOption } from "@/shared/SharedSelect";
import { useMemo, useState } from "react";
import {
  useGetBalanceReportQuery,
  type BalanceReportItem,
} from "@/api/reports.api";

export default function Reports() {
  // State management
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("");
  const [selectedBudget, setSelectedBudget] =
    useState<string>("MIC_HQ_MONTHLY");
  const [isChangingSelection, setIsChangingSelection] =
    useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  // Only make API call when both selections are made
  const {
    data: reportResponse,
    isLoading,
    error,
    isFetching,
  } = useGetBalanceReportQuery(
    {
      control_budget_name: selectedBudget,
      as_of_period: selectedPeriod,
      page: currentPage,
      page_size: itemsPerPage,
    },
    {
      skip: !selectedPeriod || !selectedBudget, // Skip query if selections not made
    }
  );

  // Handle null/empty values
  const safeValue = (value: unknown, fallback: string = "-") => {
    if (value === null || value === undefined || value === "") {
      return fallback;
    }
    return String(value);
  };

  // Format numbers with commas
  const formatNumber = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  // Transform API data to table format - no client-side filtering with server pagination
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const transformedData: TableRow[] =
    reportResponse?.data?.data?.map(
      (item: BalanceReportItem, index: number) => ({
        id: index + 1,
        control_budget_name: safeValue(item.control_budget_name),
        ledger_name: safeValue(item.ledger_name),
        as_of_period: safeValue(item.as_of_period),
        segment1: safeValue(item.segment1),
        segment2: safeValue(item.segment2),
        segment3: safeValue(item.segment3),
        encumbrance_ytd: item.encumbrance_ytd || 0,
        other_ytd: item.other_ytd || 0,
        actual_ytd: item.actual_ytd || 0,
        funds_available_asof: item.funds_available_asof || 0,
        budget_ytd: item.budget_ytd || 0,
        budget_adjustments: item.budget_adjustments || 0,
        commitments: item.commitments || 0,
        expenditures: item.expenditures || 0,
        initial_budget: item.initial_budget || 0,
        obligations: item.obligations || 0,
        other_consumption: item.other_consumption || 0,
        total_budget: item.total_budget || 0,
        total_consumption: item.total_consumption || 0,
        // Include original item for detail view
        original: item,
      })
    ) || [];

  // Table columns configuration
  const reportColumns: TableColumn[] = [
    {
      id: "control_budget_name",
      header: "Control Budget Name",
      accessor: "control_budget_name",
      minWidth: 180,
      render: (value) => (
        <span className="font-medium text-[#282828]">{safeValue(value)}</span>
      ),
    },
    {
      id: "ledger_name",
      header: "Ledger Name",
      accessor: "ledger_name",
      minWidth: 150,
      render: (value) => (
        <span className="text-[#282828]">{safeValue(value)}</span>
      ),
    },
    {
      id: "as_of_period",
      header: "As Of Period",
      accessor: "as_of_period",
      minWidth: 120,
      render: (value) => (
        <span className="text-[#282828]">{safeValue(value)}</span>
      ),
    },
    {
      id: "segment1",
      header: "Legal Entity",
      accessor: "segment1",
      minWidth: 120,
      render: (value) => (
        <span className="text-[#282828]">{safeValue(value)}</span>
      ),
    },
    {
      id: "segment2",
      header: "Account",
      accessor: "segment2",
      minWidth: 120,
      render: (value) => (
        <span className="text-[#282828]">{safeValue(value)}</span>
      ),
    },
    {
      id: "segment3",
      header: "Project",
      accessor: "segment3",
      minWidth: 120,
      render: (value) => (
        <span className="text-[#282828]">{safeValue(value)}</span>
      ),
    },
    {
      id: "encumbrance_ytd",
      header: "Encumbrance PTD",
      accessor: "encumbrance_ytd",
      showSum: true,
      minWidth: 140,
      render: (value) => (
        <span className="font-medium text-[#282828]">
          {formatNumber(Number(value))}
        </span>
      ),
    },
    {
      id: "other_ytd",
      header: "Other PTD",
      accessor: "other_ytd",
      showSum: true,
      minWidth: 120,
      render: (value) => (
        <span className="font-medium text-[#282828]">
          {formatNumber(Number(value))}
        </span>
      ),
    },
    {
      id: "actual_ytd",
      header: "Actual PTD",
      accessor: "actual_ytd",
      showSum: true,
      minWidth: 120,
      render: (value) => (
        <span className="font-medium text-[#282828]">
          {formatNumber(Number(value))}
        </span>
      ),
    },
    {
      id: "funds_available_asof",
      header: "Funds Available",
      accessor: "funds_available_asof",
      showSum: true,
      minWidth: 140,
      render: (value) => (
        <span className="font-medium">{formatNumber(Number(value))}</span>
      ),
    },
    {
      id: "budget_ytd",
      header: "Budget PTD",
      accessor: "budget_ytd",
      showSum: true,
      minWidth: 120,
      render: (value) => (
        <span className="font-medium ">{formatNumber(Number(value))}</span>
      ),
    },
    {
      id: "budget_adjustments",
      header: "Budget Adjustments",
      accessor: "budget_adjustments",
      showSum: true,
      minWidth: 150,
      render: (value) => (
        <span className="font-medium text-[#282828]">
          {formatNumber(Number(value))}
        </span>
      ),
    },
    {
      id: "commitments",
      header: "Commitments",
      accessor: "commitments",
      showSum: true,
      minWidth: 120,
      render: (value) => (
        <span className="font-medium text-[#282828]">
          {formatNumber(Number(value))}
        </span>
      ),
    },
    {
      id: "expenditures",
      header: "Expenditures",
      accessor: "expenditures",
      showSum: true,
      minWidth: 120,
      render: (value) => (
        <span className="font-medium text-[#282828]">
          {formatNumber(Number(value))}
        </span>
      ),
    },
    {
      id: "initial_budget",
      header: "Initial Budget",
      accessor: "initial_budget",
      showSum: true,
      minWidth: 130,
      render: (value) => (
        <span className="font-medium text-[#282828]">
          {formatNumber(Number(value))}
        </span>
      ),
    },
    {
      id: "obligations",
      header: "Obligations",
      accessor: "obligations",
      showSum: true,
      minWidth: 120,
      render: (value) => (
        <span className="font-medium text-[#282828]">
          {formatNumber(Number(value))}
        </span>
      ),
    },
    {
      id: "other_consumption",
      header: "Other Consumption",
      accessor: "other_consumption",
      showSum: true,
      minWidth: 150,
      render: (value) => (
        <span className="font-medium text-[#282828]">
          {formatNumber(Number(value))}
        </span>
      ),
    },
    {
      id: "total_budget",
      header: "Total Budget",
      accessor: "total_budget",
      showSum: true,
      minWidth: 130,
      render: (value) => (
        <span className="font-medium text-[#282828]">
          {formatNumber(Number(value))}
        </span>
      ),
    },
    {
      id: "total_consumption",
      header: "Total Consumption",
      accessor: "total_consumption",
      showSum: true,
      minWidth: 150,
      render: (value) => (
        <span className="font-medium text-[#282828]">
          {formatNumber(Number(value))}
        </span>
      ),
    },
  ];

  // Event handlers
  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
  };

  const handleSearchSubmit = (text: string) => {
    console.log("Search submitted:", text);
  };

  const handlePeriodChange = (value: string) => {
    setIsChangingSelection(true);
    setSelectedPeriod(value);
    setCurrentPage(1); // Reset to first page when changing period
    // Reset changing selection after a brief delay to show loading
    setTimeout(() => setIsChangingSelection(false), 100);
  };

  const handleBudgetChange = (value: string) => {
    setIsChangingSelection(true);
    setSelectedBudget(value);
    setCurrentPage(1); // Reset to first page when changing budget
    // Reset changing selection after a brief delay to show loading
    setTimeout(() => setIsChangingSelection(false), 100);
  };

  // const handlePageChange = (page: number) => {
  //   setCurrentPage(page);
  // };
  // helpers (place above component return)
  const includesI = (hay: unknown, needle: string) =>
    String(hay ?? "")
      .toLowerCase()
      .includes(needle.toLowerCase());

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const numMatches = (n: unknown, q: string) => {
    const v = Number(n);
    if (Number.isNaN(v)) return false;
    const raw = String(v);
    const pretty = new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(v);
    return includesI(raw, q) || includesI(pretty, q);
  };

  const filteredData: TableRow[] = useMemo(() => {
    const q = searchQuery.trim();
    if (!q) return transformedData;

    return transformedData.filter((r) => {
      // text fields
      const textHit =
        includesI(r.control_budget_name, q) ||
        includesI(r.ledger_name, q) ||
        includesI(r.as_of_period, q) ||
        includesI(r.segment1, q) ||
        includesI(r.segment2, q) ||
        includesI(r.segment3, q);

      // numeric fields
      const numHit =
        numMatches(r.encumbrance_ytd, q) ||
        numMatches(r.other_ytd, q) ||
        numMatches(r.actual_ytd, q) ||
        numMatches(r.funds_available_asof, q) ||
        numMatches(r.budget_ytd, q) ||
        numMatches(r.budget_adjustments, q) ||
        numMatches(r.commitments, q) ||
        numMatches(r.expenditures, q) ||
        numMatches(r.initial_budget, q) ||
        numMatches(r.obligations, q) ||
        numMatches(r.other_consumption, q) ||
        numMatches(r.total_budget, q) ||
        numMatches(r.total_consumption, q);

      return textHit || numHit;
    });
  }, [numMatches, searchQuery, transformedData]);

  // Determine if we should show loading (initial load, refetching, or changing selection)
  const shouldShowLoading = isLoading || isFetching || isChangingSelection;

  // Select options for periods (months)
  const periodOptions: SelectOption[] = [
    { value: "jan-25", label: "January 2025" },
    { value: "feb-25", label: "February 2025" },
    { value: "mar-25", label: "March 2025" },
    { value: "apr-25", label: "April 2025" },
    { value: "may-25", label: "May 2025" },
    { value: "jun-25", label: "June 2025" },
    { value: "jul-25", label: "July 2025" },
    { value: "aug-25", label: "August 2025" },
    { value: "sep-25", label: "September 2025" },
    { value: "oct-25", label: "October 2025" },
    { value: "nov-25", label: "November 2025" },
    { value: "dec-25", label: "December 2025" },
  ];

  // Select options for control budget
  const budgetOptions: SelectOption[] = [
    { value: "MIC_HQ_MONTHLY", label: "MIC HQ Monthly" },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold tracking-wide">Reports</h1>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="relative">
            <SharedSelect
              title="Period"
              options={periodOptions}
              value={selectedPeriod}
              onChange={(value) => handlePeriodChange(String(value))}
              placeholder="Select period"
              required
            />
            {isChangingSelection && selectedPeriod && (
              <div className="absolute top-2 right-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              </div>
            )}
          </div>
          <div className="relative">
            <SharedSelect
              title="Control Budget Name"
              options={budgetOptions}
              value={selectedBudget}
              onChange={(value) => handleBudgetChange(String(value))}
              placeholder="Select budget"
              required
            />
            {isChangingSelection && selectedBudget && (
              <div className="absolute top-2 right-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              </div>
            )}
          </div>
        </div>
      </div>
      {selectedPeriod && selectedBudget ? (
        <div className="my-4 bg-white p-4 rounded-lg shadow-sm">
          <SearchBar
            placeholder="Search reports..."
            value={searchQuery}
            onChange={handleSearchChange}
            onSubmit={handleSearchSubmit}
            dir="ltr"
            debounce={250}
          />
        </div>
      ) : null}

      {/* Report Table */}
      {!selectedPeriod || !selectedBudget ? (
        <></>
      ) : shouldShowLoading ? (
        <div className="flex justify-center items-center h-64 bg-white rounded-lg">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading report data...</span>
        </div>
      ) : error ? (
        <div className="flex justify-center items-center h-64 bg-white rounded-lg">
          <div className="text-center">
            <div className="text-red-500 text-lg mb-2">⚠️</div>
            <p className="text-gray-600">Failed to load report data</p>
            <button
              className="mt-2 px-4 py-2 bg-[#4E8476] text-white rounded hover:bg-blue-700"
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </div>
        </div>
      ) : transformedData.length === 0 ? (
        <div className="flex justify-center items-center h-64 bg-white rounded-lg">
          <div className="text-center">
            <div className="text-gray-400 text-2xl mb-2">📄</div>
            <p className="text-gray-600">
              {searchQuery
                ? "No data found matching your search"
                : "No report data found"}
            </p>
            {searchQuery && (
              <button
                className="mt-2 px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                onClick={() => setSearchQuery("")}
              >
                Clear Search
              </button>
            )}
          </div>
        </div>
      ) : (
        <div>
          {isFetching && !isLoading && !isChangingSelection && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 text-blue-700">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-sm">Refreshing report data...</span>
              </div>
            </div>
          )}

          <SharedTable
            title="Balance Report"
            columns={reportColumns}
            data={filteredData}
            maxHeight="600px"
            className="shadow-lg"
            showPagination={false}
            totalCount={
              reportResponse?.data?.total_records || reportResponse?.data?.count
            }
            hasNext={!!reportResponse?.data?.next}
            hasPrevious={!!reportResponse?.data?.previous}
            showActions={false}
            showFooter={true}
            showColumnSelector={true}
          />
        </div>
      )}
    </div>
  );
}
