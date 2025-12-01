import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as RTooltip,
  Legend,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Bar,
} from "recharts";
import { useGetDashboardDataQuery } from "@/api/dashboard.api";
import { useGetAnalyticalReportQuery } from "@/api/analyticalReport.api";
import { useGetSegmentsByTypeQuery } from "@/api/segmentConfiguration.api";
import SharedSelect from "@/shared/SharedSelect";

import { cn } from "@/utils/cn";

interface SelectOption {
  value: string;
  label: string;
}
// ===== Reusable Pieces =====
function LoadingSkeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`}></div>
  );
}

function ErrorState({
  message = "Failed to load data",
  t,
}: {
  message?: string;
  t: (key: string) => string;
}) {
  return (
    <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-black/5">
      <div className="flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <svg
            className="w-8 h-8 text-red-600"
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
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {t("home.errorLoadingDashboard")}
        </h3>
        <p className="text-gray-500 mb-4">{message}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-[#4E8476] text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {t("common.retry")}
        </button>
      </div>
    </div>
  );
}

// ===== Page =====
export default function Home() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  // Filter states for pie charts
  const [controlBudget, setControlBudget] = useState<string>("MOFA_COST_2");
  const [segmentFilter, setSegmentFilter] = useState<string>("all");
  const [selectedSegment, setSelectedSegment] = useState<number | null>(null);

  // Fetch segments for segment_type 11
  const { data: segmentsData } = useGetSegmentsByTypeQuery(11);

  // API call
  const {
    data: dashboardData,
    error,
    refetch: refetchDashboard,
  } = useGetDashboardDataQuery({ type: "all" });

  // Analytical Report API call for pie charts - now dynamic based on filter
  const { data: analyticalData, isLoading: isLoadingAnalytical } =
    useGetAnalyticalReportQuery({
      segment_type_id: 11,
      segment_code: selectedSegment,
      control_budget_name: controlBudget,
      segment_filter: segmentFilter as
        | "all"
        | "with_transfers"
        | "with_funds"
        | "with_both"
        | "with_either",
      transaction_status: "approved",
      page: 1,
      page_size: 20,
    });

  // Budget filter options
  const budgetOptions = [
    { value: "MOFA_COST_2", label: t("analyticalReport.costs") || "التكاليف" },
    { value: "MOFA_CASH", label: t("analyticalReport.liquidity") || "السيولة" },
  ];

  // Segment filter options
  const segmentFilterOptions: SelectOption[] = [
    { value: "all", label: t("analyticalReport.filterOptions.all") },
    {
      value: "with_transfers",
      label: t("analyticalReport.filterOptions.withTransfers"),
    },
    {
      value: "with_funds",
      label: t("analyticalReport.filterOptions.withFunds"),
    },
    { value: "with_both", label: t("analyticalReport.filterOptions.withBoth") },
    {
      value: "with_either",
      label: t("analyticalReport.filterOptions.withEither"),
    },
  ];

  // Segment options from API
  const segmentOptions: SelectOption[] = useMemo(() => {
    if (!segmentsData?.data) return [];
    return segmentsData.data.map((segment) => ({
      value: String(segment.code),
      label: `${segment.code} - ${segment.alias}`,
    }));
  }, [segmentsData]);

  // Filter change handlers
  const handleBudgetChange = (value: string | number) => {
    setControlBudget(String(value));
  };

  const handleSegmentChange = (value: string | number) => {
    setSelectedSegment(value ? Number(value) : null);
  };

  const handleSegmentFilterChange = (value: string | number) => {
    setSegmentFilter(String(value));
  };

  const [year, setYear] = useState<string>("2025");

  // ===== Mock Data =====

  const statusData = useMemo(() => {
    const normalData = dashboardData?.normal;
    if (!normalData) {
      return [
        { name: t("home.approved"), value: 0, color: "#007E77" },
        { name: t("home.pending"), value: 0, color: "#6BE6E4" },
        { name: t("home.rejected"), value: 0, color: "#4E8476" },
      ];
    }

    return [
      {
        name: t("home.approved"),
        value: normalData.approved_transfers,
        color: "#007E77",
      },
      {
        name: t("home.pending"),
        value: normalData.pending_transfers,
        color: "#6BE6E4",
      },
      {
        name: t("home.rejected"),
        value: normalData.rejected_transfers,
        color: "#4E8476",
      },
    ];
  }, [dashboardData?.normal, t]);

  useEffect(() => {
    // if mode or year changes and you want to force a fresh pull
    refetchDashboard();
    // year affects only derived memos in your code; if your APIs support year, add it to args and refetch here too.
  }, [year, refetchDashboard]);

  // Prepare pie chart data with theme colors
  const pieChartsData = useMemo(() => {
    if (!analyticalData?.summary) {
      return {
        exchangeRateData: [],
        totalExpenditureData: [],
        actualExpenditureData: [],
        reservationsData: [],
        exchangeRatePercentage: 0,
        actualPercentage: 0,
        encumbrancePercentage: 0,
      };
    }

    const summary = analyticalData.summary;
    const totalBudget = summary.grand_total_budget || 1; // Avoid division by zero

    // Calculate percentages
    const actualPercentage = (summary.grand_actual / totalBudget) * 100;
    const encumbrancePercentage =
      (summary.grand_encumbrance / totalBudget) * 100;
    const totalActualPercentage =
      (summary.grand_total_actual / totalBudget) * 100;

    // Theme colors - matching the app theme
    const COLORS = {
      primary: "#4E8476", // Main theme green
      secondary: "#6BE6E4", // Teal/cyan accent
      accent: "#007E77", // Dark teal
      light: "#A7F3D0", // Light green
      muted: "#D1D5DB", // Gray for remaining/empty
      warning: "#F59E0B", // Amber
    };

    // 1. مؤشر الصرف (Exchange Rate Indicator) - Total Actual vs Remaining Budget
    const spentAmount = summary.grand_total_actual;
    const remainingBudget = totalBudget - spentAmount;
    const exchangeRateData = [
      {
        name: t("home.spent"),
        value: spentAmount,
        color: COLORS.primary,
      },
      {
        name: t("home.remaining"),
        value: remainingBudget > 0 ? remainingBudget : 0,
        color: COLORS.muted,
      },
    ];

    // 2. نسب اجمالي الصرف (Total Expenditure Ratio) - Breakdown of budget usage
    const totalExpenditureData = [
      {
        name: t("home.encumbrance"),
        value: summary.grand_encumbrance,
        color: COLORS.secondary,
      },
      {
        name: t("home.futures"),
        value: summary.grand_Futures_column || 0,
        color: COLORS.warning,
      },
      {
        name: t("home.actual"),
        value: summary.grand_actual,
        color: COLORS.primary,
      },
      {
        name: t("home.available"),
        value: summary.grand_funds_available,
        color: COLORS.light,
      },
    ].filter((item) => item.value > 0); // Filter out zero values

    // 3. نسبة المنصرف الفعلي (Actual Expenditure Percentage)
    const actualExpenditureData = [
      {
        name: t("home.actual"),
        value: summary.grand_actual,
        color: COLORS.primary,
      },
      {
        name: t("home.remaining"),
        value:
          totalBudget - summary.grand_actual > 0
            ? totalBudget - summary.grand_actual
            : 0,
        color: COLORS.muted,
      },
    ];

    // 4. نسبة الحجوزات (Reservations/Encumbrance Percentage)
    const reservationsData = [
      {
        name: t("home.encumbrance"),
        value: summary.grand_encumbrance,
        color: COLORS.secondary,
      },
      {
        name: t("home.remaining"),
        value:
          totalBudget - summary.grand_encumbrance > 0
            ? totalBudget - summary.grand_encumbrance
            : 0,
        color: COLORS.muted,
      },
    ];

    return {
      exchangeRateData,
      totalExpenditureData,
      actualExpenditureData,
      reservationsData,
      exchangeRatePercentage: totalActualPercentage.toFixed(2),
      actualPercentage: actualPercentage.toFixed(2),
      encumbrancePercentage: encumbrancePercentage.toFixed(2),
    };
  }, [analyticalData, t]);

  // Helper function to format numbers
  const formatValue = (value: number) => {
    if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B`;
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
    return value.toLocaleString();
  };

  // Custom label renderer for pie charts
  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        fontSize={14}
        fontWeight={600}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="space-y-6">
      {/* Error State */}
      {error && (
        <ErrorState message={t("home.failedToLoadDashboardData")} t={t} />
      )}

      {/* Header */}
      {/* Header */}
      <div className={cn("flex items-center justify-between gap-4")}>
        {/* Left side */}
        <h1
          className={cn(
            "text-2xl font-bold text-gray-900",
            isRTL ? "text-right" : "text-left"
          )}
        >
          {t("dashboard") || "Dashboard"}
        </h1>
      </div>
      {/* Transfer Status Chart */}
      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5 animate-fadeIn">
        <div
          className={cn(
            "flex items-center justify-between mb-4"
            // isRTL && "flex-row-reverse"
          )}
        >
          <div className="font-semibold text-gray-900">
            {t("home.transferStatus")}
          </div>
          <div>
            <select
              className="rounded-xl border border-[#F6F6F6] bg-[#F6F6F6] px-3 py-1.5 text-sm  focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              defaultValue="2025"
              onChange={(e) => setYear(e.target.value)}
            >
              <option value="2025">2025</option>
              <option value="2024">2024</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-center">
          {/* Chart */}
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData} barSize={40}>
                <CartesianGrid vertical={false} stroke={"#E5E7EB"} />{" "}
                <XAxis
                  dataKey="name"
                  tickFormatter={(v) => String(v).replace("_", " ")}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  // tick={false} // uncomment to hide labels
                />
                <RTooltip
                  wrapperStyle={{
                    background: "transparent",
                    border: "none",
                    boxShadow: "none",
                  }}
                  contentStyle={{
                    background: "#E5E7EB",
                    color: "#fff",
                    border: "none",
                  }} // keep tooltip pill
                  formatter={(value: number, name: string) => [
                    Number(value).toLocaleString(),
                    String(name).replace("_", " "),
                  ]}
                  labelFormatter={() => ""}
                />
                <Bar dataKey="value" name="Transfers" radius={[8, 8, 0, 0]}>
                  {statusData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Pie Charts Section - مؤشرات الصرف */}
      <div className="space-y-4">
        {/* Filters Section */}
        <div className="bg-white rounded-2xl shadow-sm p-6 ring-1 ring-black/5">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {t("home.expenditureIndicators") || "مؤشرات الصرف"}
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("analyticalReport.segment")}
              </label>
              <SharedSelect
                options={segmentOptions}
                value={selectedSegment ? String(selectedSegment) : ""}
                onChange={handleSegmentChange}
                placeholder={t("analyticalReport.selectSegment")}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("analyticalReport.segmentFilter")}
              </label>
              <SharedSelect
                options={segmentFilterOptions}
                value={segmentFilter}
                onChange={handleSegmentFilterChange}
                placeholder={t("analyticalReport.selectSegmentFilter")}
              />
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        {isLoadingAnalytical ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5"
              >
                <LoadingSkeleton className="h-6 w-32 mb-4" />
                <div className="h-[280px] flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4E8476]"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 1. مؤشر الصرف - Exchange Rate Indicator */}
            <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5 animate-fadeIn">
              <div className="flex items-center justify-between mb-4">
                <div className="font-semibold text-gray-900">
                  {t("home.exchangeRateIndicator")}
                </div>
                <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  {pieChartsData.exchangeRatePercentage}%
                </div>
              </div>
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartsData.exchangeRateData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderCustomizedLabel}
                      outerRadius={100}
                      innerRadius={60}
                      dataKey="value"
                      strokeWidth={0}
                    >
                      {pieChartsData.exchangeRateData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RTooltip
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        const data = payload[0];
                        return (
                          <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
                            <p className="font-medium text-gray-900">
                              {data.name}
                            </p>
                            <p className="text-sm text-gray-600">
                              {formatValue(Number(data.value))}
                            </p>
                          </div>
                        );
                      }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      align="center"
                      iconType="circle"
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 2. نسب اجمالي الصرف - Total Expenditure Ratio */}
            <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5 animate-fadeIn">
              <div className="flex items-center justify-between mb-4">
                <div className="font-semibold text-gray-900">
                  {t("home.totalExpenditureRatio")}
                </div>
              </div>
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartsData.totalExpenditureData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderCustomizedLabel}
                      outerRadius={100}
                      innerRadius={60}
                      dataKey="value"
                      strokeWidth={0}
                    >
                      {pieChartsData.totalExpenditureData.map(
                        (entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        )
                      )}
                    </Pie>
                    <RTooltip
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        const data = payload[0];
                        return (
                          <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
                            <p className="font-medium text-gray-900">
                              {data.name}
                            </p>
                            <p className="text-sm text-gray-600">
                              {formatValue(Number(data.value))}
                            </p>
                          </div>
                        );
                      }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      align="center"
                      iconType="circle"
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 3. نسبة المنصرف الفعلي - Actual Expenditure Percentage */}
            <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5 animate-fadeIn">
              <div className="flex items-center justify-between mb-4">
                <div className="font-semibold text-gray-900">
                  {t("home.actualExpenditurePercentage")}
                </div>
                <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  {pieChartsData.actualPercentage}%
                </div>
              </div>
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartsData.actualExpenditureData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderCustomizedLabel}
                      outerRadius={100}
                      innerRadius={60}
                      dataKey="value"
                      strokeWidth={0}
                    >
                      {pieChartsData.actualExpenditureData.map(
                        (entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        )
                      )}
                    </Pie>
                    <RTooltip
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        const data = payload[0];
                        return (
                          <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
                            <p className="font-medium text-gray-900">
                              {data.name}
                            </p>
                            <p className="text-sm text-gray-600">
                              {formatValue(Number(data.value))}
                            </p>
                          </div>
                        );
                      }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      align="center"
                      iconType="circle"
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 4. نسبة الحجوزات - Reservations Percentage */}
            <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5 animate-fadeIn">
              <div className="flex items-center justify-between mb-4">
                <div className="font-semibold text-gray-900">
                  {t("home.reservationsPercentage")}
                </div>
                <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  {pieChartsData.encumbrancePercentage}%
                </div>
              </div>
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartsData.reservationsData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderCustomizedLabel}
                      outerRadius={100}
                      innerRadius={60}
                      dataKey="value"
                      strokeWidth={0}
                    >
                      {pieChartsData.reservationsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RTooltip
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        const data = payload[0];
                        return (
                          <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
                            <p className="font-medium text-gray-900">
                              {data.name}
                            </p>
                            <p className="text-sm text-gray-600">
                              {formatValue(Number(data.value))}
                            </p>
                          </div>
                        );
                      }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      align="center"
                      iconType="circle"
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
