import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  useGetAnalyticalReportQuery,
  type SegmentTransferData,
} from "../../api/analyticalReport.api";
import DashboardHeader from "../../shared/DashboardHeader";
import SharedSelect from "../../shared/SharedSelect";
import { formatNumber } from "../../utils/formatNumber";

interface SelectOption {
  value: string;
  label: string;
}

export default function AnalyticalReport() {
  const { t } = useTranslation();
  const [controlBudget, setControlBudget] = useState<string>("MOFA_COST_2");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 20;

  // Fetch analytical report data
  const { data, isLoading, error, refetch } = useGetAnalyticalReportQuery({
    segment_type_id: 11,
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

  const handleBudgetChange = (value: string | number) => {
    setControlBudget(String(value));
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Calculate total expenditure for each row
  const calculateTotalExpenditure = (segment: SegmentTransferData) => {
    return (
      segment.actual_sum +
      segment.encumbrance_sum +
      segment.commitment_sum +
      segment.other_sum
    );
  };

  // Calculate remaining for each row
  const calculateRemaining = (segment: SegmentTransferData) => {
    const totalExpenditure = calculateTotalExpenditure(segment);
    return segment.total_budget_sum - totalExpenditure;
  };

  // Calculate indicator percentage
  const calculateIndicator = (segment: SegmentTransferData) => {
    if (segment.total_budget_sum === 0) return 0;
    const remaining = calculateRemaining(segment);
    return (remaining / segment.total_budget_sum) * 100;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />

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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("analyticalReport.controlBudget")}
              </label>
              <SharedSelect
                options={budgetOptions}
                value={controlBudget}
                onChange={handleBudgetChange}
                placeholder={t("analyticalReport.selectControlBudget")}
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
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="flex items-center justify-center p-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4E8476] mx-auto mb-4"></div>
                  <p className="text-gray-600">
                    {t("analyticalReport.loadingData")}
                  </p>
                </div>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center p-12">
                <div className="text-center">
                  <svg
                    className="w-16 h-16 text-red-500 mx-auto mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p className="text-gray-900 font-semibold mb-2">
                    {t("analyticalReport.errorLoadingData")}
                  </p>
                  <button
                    onClick={() => refetch()}
                    className="mt-4 px-4 py-2 bg-[#4E8476] text-white rounded-md hover:bg-[#3d6a5e] transition-colors"
                  >
                    {t("analyticalReport.refreshData")}
                  </button>
                </div>
              </div>
            ) : !data?.segments || data.segments.length === 0 ? (
              <div className="flex items-center justify-center p-12">
                <p className="text-gray-600">
                  {t("analyticalReport.noDataAvailable")}
                </p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      {t(
                        "analyticalReport.columns.economicClassificationNumber"
                      )}
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      {t("analyticalReport.columns.economicClassificationName")}
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      {t("analyticalReport.columns.itemProgramProjectNumber")}
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      {t("analyticalReport.columns.itemProgramProjectName")}
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      {t("analyticalReport.columns.initialBudget")}
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      {t("analyticalReport.columns.decrease")}
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      {t("analyticalReport.columns.transferredFrom")}
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      {t("analyticalReport.columns.transferredTo")}
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      {t("analyticalReport.columns.additionalFund")}
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      {t("analyticalReport.columns.budgetAfterAdjustment")}
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      {t("analyticalReport.columns.encumbranceInProgress")}
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      {t("analyticalReport.columns.commitments")}
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      {t("analyticalReport.columns.actualExpenditure")}
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      {t("analyticalReport.columns.totalExpenditure")}
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      {t("analyticalReport.columns.remaining")}
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      {t("analyticalReport.columns.indicator")}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.segments.map(
                    (segment: SegmentTransferData, index: number) => {
                      const totalExpenditure =
                        calculateTotalExpenditure(segment);
                      const remaining = calculateRemaining(segment);
                      const indicator = calculateIndicator(segment);

                      return (
                        <tr
                          key={segment.segment_code + index}
                          className="hover:bg-gray-50"
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {segment.mapping_code || segment.segment_code}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {segment.segment_alias}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {segment.segment_code}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {segment.segment_alias}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatNumber(segment.initial_budget_sum)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatNumber(segment.total_decrease_fund)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatNumber(segment.total_from_center)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatNumber(segment.total_to_center)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatNumber(segment.total_additional_fund)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                            {formatNumber(segment.total_budget_sum)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatNumber(segment.encumbrance_sum)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatNumber(segment.commitment_sum)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatNumber(segment.actual_sum)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                            {formatNumber(totalExpenditure)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                            {formatNumber(remaining)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
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
                          </td>
                        </tr>
                      );
                    }
                  )}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {data?.pagination && data.pagination.total_pages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={!data.pagination.has_previous}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t("common.previous")}
                </button>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!data.pagination.has_next}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t("common.next")}
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    {t("analyticalReport.page")}{" "}
                    <span className="font-medium">{currentPage}</span>{" "}
                    {t("analyticalReport.of")}{" "}
                    <span className="font-medium">
                      {data.pagination.total_pages}
                    </span>
                  </p>
                </div>
                <div>
                  <nav
                    className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                    aria-label="Pagination"
                  >
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={!data.pagination.has_previous}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">{t("common.previous")}</span>
                      <svg
                        className="h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={!data.pagination.has_next}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">{t("common.next")}</span>
                      <svg
                        className="h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
