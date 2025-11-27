import { useState, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  useGetAnalyticalReportQuery,
  type SegmentTransferData,
} from "../../api/analyticalReport.api";
import { useGetSegmentsByTypeQuery } from "../../api/segmentConfiguration.api";
import SharedSelect from "../../shared/SharedSelect";
import {
  SharedTable,
  type TableColumn,
  type TableRow,
} from "../../shared/SharedTable";
import { formatNumber } from "../../utils/formatNumber";

interface SelectOption {
  value: string;
  label: string;
}

export default function AnalyticalReport() {
  const { t } = useTranslation();
  const [controlBudget, setControlBudget] = useState<string>("MOFA_COST_2");
  const [selectedSegment, setSelectedSegment] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 10;

  // Fetch segments for segment_type 11
  const { data: segmentsData } = useGetSegmentsByTypeQuery(11);

  // Fetch analytical report data
  const { data } = useGetAnalyticalReportQuery({
    segment_type_id: 11,
    segment_Code: selectedSegment,
    control_budget_name: controlBudget,
    transaction_status: "approved",
    page: currentPage,
    page_size: pageSize,
  });

  // Budget options
  const budgetOptions: SelectOption[] = [
    { value: "MOFA_CASH", label: t("analyticalReport.liquidity") },
    { value: "MOFA_COST_2", label: t("analyticalReport.costs") },
  ];

  // Segment options from API
  const segmentOptions: SelectOption[] = useMemo(() => {
    if (!segmentsData?.data) return [];
    return segmentsData.data.map((segment) => ({
      value: String(segment.id),
      label: `${segment.code} - ${segment.alias}`,
    }));
  }, [segmentsData]);

  const handleBudgetChange = (value: string | number) => {
    setControlBudget(String(value));
    setCurrentPage(1);
  };

  const handleSegmentChange = (value: string | number) => {
    setSelectedSegment(value ? Number(value) : null);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Calculate total expenditure for each row
  const calculateTotalExpenditure = useCallback(
    (segment: SegmentTransferData) => {
      return (
        segment.actual_sum +
        segment.encumbrance_sum +
        segment.commitment_sum +
        segment.other_sum
      );
    },
    []
  );

  // Calculate remaining for each row
  const calculateRemaining = useCallback(
    (segment: SegmentTransferData) => {
      const totalExpenditure = calculateTotalExpenditure(segment);
      return segment.total_budget_sum - totalExpenditure;
    },
    [calculateTotalExpenditure]
  );

  // Calculate indicator percentage
  const calculateIndicator = useCallback(
    (segment: SegmentTransferData) => {
      if (segment.total_budget_sum === 0) return 0;
      const remaining = calculateRemaining(segment);
      return (remaining / segment.total_budget_sum) * 100;
    },
    [calculateRemaining]
  );

  // Define table columns
  const columns: TableColumn[] = useMemo(
    () => [
      {
        id: "economicClassificationNumber",
        header: t("analyticalReport.columns.economicClassificationNumber"),
        accessor: "mapping_code",
        render: (_value: unknown, row: TableRow) => {
          const segment = row as unknown as SegmentTransferData;
          return segment.mapping_code || segment.segment_code;
        },
      },
      {
        id: "economicClassificationName",
        header: t("analyticalReport.columns.economicClassificationName"),
        accessor: "segment_alias",
      },
      {
        id: "itemProgramProjectNumber",
        header: t("analyticalReport.columns.itemProgramProjectNumber"),
        accessor: "segment_code",
      },
      {
        id: "itemProgramProjectName",
        header: t("analyticalReport.columns.itemProgramProjectName"),
        accessor: "segment_alias",
      },
      {
        id: "initialBudget",
        header: t("analyticalReport.columns.initialBudget"),
        accessor: "initial_budget_sum",
        render: (value: unknown) => formatNumber(value as number),
        showSum: true,
      },
      {
        id: "decrease",
        header: t("analyticalReport.columns.decrease"),
        accessor: "total_decrease_fund",
        render: (value: unknown) => formatNumber(value as number),
        showSum: true,
      },
      {
        id: "transferredFrom",
        header: t("analyticalReport.columns.transferredFrom"),
        accessor: "total_from_center",
        render: (value: unknown) => formatNumber(value as number),
        showSum: true,
      },
      {
        id: "transferredTo",
        header: t("analyticalReport.columns.transferredTo"),
        accessor: "total_to_center",
        render: (value: unknown) => formatNumber(value as number),
        showSum: true,
      },
      {
        id: "additionalFund",
        header: t("analyticalReport.columns.additionalFund"),
        accessor: "total_additional_fund",
        render: (value: unknown) => formatNumber(value as number),
        showSum: true,
      },
      {
        id: "budgetAfterAdjustment",
        header: t("analyticalReport.columns.budgetAfterAdjustment"),
        accessor: "total_budget_sum",
        render: (value: unknown) => formatNumber(value as number),
        showSum: true,
      },
      {
        id: "encumbranceInProgress",
        header: t("analyticalReport.columns.encumbranceInProgress"),
        accessor: "encumbrance_sum",
        render: (value: unknown) => formatNumber(value as number),
        showSum: true,
      },
      {
        id: "commitments",
        header: t("analyticalReport.columns.commitments"),
        accessor: "commitment_sum",
        render: (value: unknown) => formatNumber(value as number),
        showSum: true,
      },
      {
        id: "actualExpenditure",
        header: t("analyticalReport.columns.actualExpenditure"),
        accessor: "actual_sum",
        render: (value: unknown) => formatNumber(value as number),
        showSum: true,
      },
      {
        id: "totalExpenditure",
        header: t("analyticalReport.columns.totalExpenditure"),
        accessor: "totalExpenditure",
        render: (_value: unknown, row: TableRow) => {
          const segment = row as unknown as SegmentTransferData;
          const totalExpenditure = calculateTotalExpenditure(segment);
          return formatNumber(totalExpenditure);
        },
        showSum: true,
      },
      {
        id: "remaining",
        header: t("analyticalReport.columns.remaining"),
        accessor: "remaining",
        render: (_value: unknown, row: TableRow) => {
          const segment = row as unknown as SegmentTransferData;
          const remaining = calculateRemaining(segment);
          return formatNumber(remaining);
        },
        showSum: true,
      },
      {
        id: "indicator",
        header: t("analyticalReport.columns.indicator"),
        accessor: "indicator",
        render: (_value: unknown, row: TableRow) => {
          const segment = row as unknown as SegmentTransferData;
          const indicator = calculateIndicator(segment);
          return (
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                indicator >= 75
                  ? "bg-green-100 text-green-800"
                  : indicator >= 50
                  ? "bg-yellow-100 text-yellow-800"
                  : indicator >= 25
                  ? "bg-orange-100 text-orange-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {indicator.toFixed(2)}%
            </span>
          );
        },
      },
    ],
    [t, calculateTotalExpenditure, calculateRemaining, calculateIndicator]
  );

  // Convert segments to table rows
  const tableData: TableRow[] = useMemo(() => {
    return (data?.segments || []).map(
      (segment) => segment as unknown as TableRow
    );
  }, [data?.segments]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6 space-y-6">
        {/* Page Title */}
        <h1 className="text-2xl font-bold text-gray-900">
          {t("analyticalReport.title")}
        </h1>
        {/* Filters Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {t("analyticalReport.filters")}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>

              <SharedSelect
                options={budgetOptions}
                value={controlBudget}
                onChange={handleBudgetChange}
                placeholder={t("analyticalReport.selectControlBudget")}
              />
            </div>
            <div>
              <SharedSelect
                options={segmentOptions}
                value={selectedSegment ? String(selectedSegment) : ""}
                onChange={handleSegmentChange}
                placeholder={t("analyticalReport.selectSegment")}
              />
            </div>
          </div>
        </div>

        {/* Summary Section */}
        {data?.summary && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {t("analyticalReport.summary")}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">
                  {t("analyticalReport.totalSegments")}
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {data.summary.total_segments}
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">
                  {t("analyticalReport.segmentsWithTransfers")}
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {data.summary.segments_with_transfers}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">
                  {t("analyticalReport.segmentsWithoutTransfers")}
                </p>
                <p className="text-2xl font-bold text-gray-600">
                  {data.summary.segments_without_transfers}
                </p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">
                  {t("analyticalReport.grandTotalFromCenter")}
                </p>
                <p className="text-xl font-bold text-orange-600">
                  {formatNumber(data.summary.grand_total_from_center)}
                </p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">
                  {t("analyticalReport.grandTotalToCenter")}
                </p>
                <p className="text-xl font-bold text-purple-600">
                  {formatNumber(data.summary.grand_total_to_center)}
                </p>
              </div>
              <div className="bg-indigo-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">
                  {t("analyticalReport.grandTotalNet")}
                </p>
                <p className="text-xl font-bold text-indigo-600">
                  {formatNumber(data.summary.grand_total_net)}
                </p>
              </div>
              <div className="bg-teal-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">
                  {t("analyticalReport.grandTotalBudget")}
                </p>
                <p className="text-xl font-bold text-teal-600">
                  {formatNumber(data.summary.grand_total_budget)}
                </p>
              </div>
              <div className="bg-cyan-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">
                  {t("analyticalReport.grandFundsAvailable")}
                </p>
                <p className="text-xl font-bold text-cyan-600">
                  {formatNumber(data.summary.grand_funds_available)}
                </p>
              </div>
              <div className="bg-pink-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">
                  {t("analyticalReport.grandActual")}
                </p>
                <p className="text-xl font-bold text-pink-600">
                  {formatNumber(data.summary.grand_actual)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Table Section */}
        <SharedTable
          columns={columns}
          data={tableData}
          showPagination={true}
          currentPage={currentPage}
          onPageChange={handlePageChange}
          totalCount={data?.pagination?.total_count}
          hasNext={data?.pagination?.has_next}
          hasPrevious={data?.pagination?.has_previous}
          itemsPerPage={pageSize}
          showFooter={true}
          showColumnFilters={false}
          className="bg-white rounded-lg shadow-sm"
        />
      </div>
    </div>
  );
}
