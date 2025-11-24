import SearchBar from "@/shared/SearchBar";
import { SharedTable } from "@/shared/SharedTable";
import type { TableColumn, TableRow } from "@/shared/SharedTable";
import { SharedSelect } from "@/shared/SharedSelect";
import type { SelectOption } from "@/shared/SharedSelect";
import { useMemo, useState } from "react";
import {
  useGetSegmentsFundQuery,
  type SegmentFundItem,
} from "@/api/reports.api";
import { useGetSegmentTypesQuery } from "@/api/segmentConfiguration.api";

export default function Reports() {
  // State management
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("");
  const [selectedBudget, setSelectedBudget] = useState<string>("MOFA_CASH");
  const [isChangingSelection, setIsChangingSelection] =
    useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  // Column filters state - will be passed to API
  const [columnFilters, setColumnFilters] = useState<{ [key: string]: string }>(
    {}
  );

  // Fetch segment types for dynamic column names
  const { data: segmentTypesData } = useGetSegmentTypesQuery();

  // Only make API call when period is selected (budget has default)
  const {
    data: reportResponse,
    isLoading,
    error,
    isFetching,
  } = useGetSegmentsFundQuery(
    {
      control_budget_name: selectedBudget,
      period_name: selectedPeriod,
      page: currentPage,
      page_size: itemsPerPage,
      // Pass column filters to API
      segment5: columnFilters.segment5,
      segment9: columnFilters.segment9,
      segment11: columnFilters.segment11,
      budget: columnFilters.budget,
      encumbrance: columnFilters.encumbrance,
      funds_available: columnFilters.funds_available,
      commitment: columnFilters.commitment,
      obligation: columnFilters.obligation,
      actual: columnFilters.actual,
      other: columnFilters.other,
    },
    {
      skip: !selectedPeriod, // Skip query if period not selected
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
    reportResponse?.data?.map((item: SegmentFundItem, index: number) => ({
      id: item.id || index + 1,
      control_budget_name: safeValue(item.Control_budget_name),
      period_name: safeValue(item.Period_name),
      segment5: safeValue(item.segment5),
      segment9: safeValue(item.segment9),
      segment11: safeValue(item.segment11),
      budget: item.Budget || 0,
      encumbrance: item.Encumbrance || 0,
      funds_available: item.Funds_available || 0,
      commitment: item.Commitment || 0,
      obligation: item.Obligation || 0,
      actual: item.Actual || 0,
      other: item.Other || 0,
      created_at: safeValue(item.Created_at),
      // Include original item for detail view
      original: item,
    })) || [];

  // Helper function to translate segment names
  const getSegmentHeader = (segmentNumber: number): string => {
    const translations: Record<number, string> = {
      5: "MOFA GEOGRAPHIC CLASS",
      9: "MOFA_COST_CENTER",
      11: "MOFA_BUDGET",
    };

    if (translations[segmentNumber]) {
      return translations[segmentNumber];
    }

    // Fallback to API segment name if no translation exists
    const segment = segmentTypesData?.data?.find(
      (s) => s.segment_type_oracle_number === segmentNumber
    );
    return segment?.segment_name || `Segment ${segmentNumber}`;
  };

  // Get segment names from segment types data (kept for backward compatibility if needed elsewhere)
  const getSegmentName = (oracleNumber: number): string => {
    return getSegmentHeader(oracleNumber);
  };

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
      id: "period_name",
      header: "Period Name",
      accessor: "period_name",
      minWidth: 120,
      render: (value) => (
        <span className="text-[#282828]">{safeValue(value)}</span>
      ),
    },
    {
      id: "segment5",
      header: getSegmentName(5),
      accessor: "segment5",
      minWidth: 150,
      render: (value) => (
        <span className="text-[#282828]">{safeValue(value)}</span>
      ),
    },
    {
      id: "segment9",
      header: getSegmentName(9),
      accessor: "segment9",
      minWidth: 150,
      render: (value) => (
        <span className="text-[#282828]">{safeValue(value)}</span>
      ),
    },
    {
      id: "segment11",
      header: getSegmentName(11),
      accessor: "segment11",
      minWidth: 150,
      render: (value) => (
        <span className="text-[#282828]">{safeValue(value)}</span>
      ),
    },
    {
      id: "budget",
      header: "Budget",
      accessor: "budget",
      showSum: true,
      minWidth: 140,
      render: (value) => (
        <span className="font-medium text-[#282828]">
          {formatNumber(Number(value))}
        </span>
      ),
    },
    {
      id: "encumbrance",
      header: "Encumbrance",
      accessor: "encumbrance",
      showSum: true,
      minWidth: 140,
      render: (value) => (
        <span className="font-medium text-[#282828]">
          {formatNumber(Number(value))}
        </span>
      ),
    },
    {
      id: "funds_available",
      header: "Funds Available",
      accessor: "funds_available",
      showSum: true,
      minWidth: 140,
      render: (value) => (
        <span className="font-medium">{formatNumber(Number(value))}</span>
      ),
    },
    {
      id: "commitment",
      header: "Commitment",
      accessor: "commitment",
      showSum: true,
      minWidth: 120,
      render: (value) => (
        <span className="font-medium text-[#282828]">
          {formatNumber(Number(value))}
        </span>
      ),
    },
    {
      id: "obligation",
      header: "Obligation",
      accessor: "obligation",
      showSum: true,
      minWidth: 120,
      render: (value) => (
        <span className="font-medium text-[#282828]">
          {formatNumber(Number(value))}
        </span>
      ),
    },
    {
      id: "actual",
      header: "Actual",
      accessor: "actual",
      showSum: true,
      minWidth: 120,
      render: (value) => (
        <span className="font-medium text-[#282828]">
          {formatNumber(Number(value))}
        </span>
      ),
    },
    {
      id: "other",
      header: "Other",
      accessor: "other",
      showSum: true,
      minWidth: 120,
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

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handler for column filter changes - will trigger API call
  const handleColumnFilterChange = (filters: { [key: string]: string }) => {
    setColumnFilters(filters);
    setCurrentPage(1); // Reset to first page when filters change
  };

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
        includesI(r.period_name, q) ||
        includesI(r.segment5, q) ||
        includesI(r.segment9, q) ||
        includesI(r.segment11, q);

      // numeric fields
      const numHit =
        numMatches(r.budget, q) ||
        numMatches(r.encumbrance, q) ||
        numMatches(r.funds_available, q) ||
        numMatches(r.commitment, q) ||
        numMatches(r.obligation, q) ||
        numMatches(r.actual, q) ||
        numMatches(r.other, q);

      return textHit || numHit;
    });
  }, [numMatches, searchQuery, transformedData]);

  // Determine if we should show loading (initial load, refetching, or changing selection)
  const shouldShowLoading = isLoading || isFetching || isChangingSelection;

  // Select options for periods (format: month-year like 1-25, 2-25, etc.)
  const periodOptions: SelectOption[] = [
    { value: "1-25", label: "January 2025" },
    { value: "1-24", label: "January 2024" },
    { value: "1-23", label: "January 2023" },
  ];

  // Select options for control budget
  const budgetOptions: SelectOption[] = [
    { value: "MOFA_CASH", label: "MOFA CASH" },
    { value: "MOFA_COST_2", label: "MOFA COST 2" },
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
      {selectedPeriod ? (
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

      {/* Note: Column filters are now enabled in the table by default */}
      {/* You can disable them by adding showColumnFilters={false} to SharedTable */}

      {/* Report Table */}
      {!selectedPeriod ? (
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
            title="Segment Funds Report"
            columns={reportColumns}
            data={filteredData}
            maxHeight="600px"
            className="shadow-lg"
            showPagination={true}
            currentPage={currentPage}
            onPageChange={handlePageChange}
            itemsPerPage={itemsPerPage}
            totalCount={
              reportResponse?.total_records_in_db || reportResponse?.count
            }
            hasNext={!!reportResponse?.next}
            hasPrevious={!!reportResponse?.previous}
            showActions={false}
            showFooter={true}
            showColumnSelector={true}
            showColumnFilters={true} // Column filters enabled - search under each column header
            onColumnFilterChange={handleColumnFilterChange} // Pass filter changes to API
            // Set to false to disable: showColumnFilters={false}
          />
        </div>
      )}
    </div>
  );
}
