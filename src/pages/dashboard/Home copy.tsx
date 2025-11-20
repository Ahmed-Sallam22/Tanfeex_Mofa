/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RTooltip,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import { format, subDays, differenceInDays } from "date-fns";
import { useGetDashboardDataQuery } from "@/api/dashboard.api";
import {
  SharedTable,
  type TableColumn,
  type TableRow,
} from "@/shared/SharedTable";
const COLORS = {
  primary: "#4E8476",
  success: "#16A34A",
  warning: "#F59E0B",
  danger: "#EF4444",
  gray100: "#F3F4F6",
  gray300: "#E5E7EB",
  gray500: "#6B7280",
  text: "#111827",
};

// ===== Reusable Pieces =====
function LoadingSkeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`}></div>
  );
}

function ChartLoadingSkeleton() {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
      <LoadingSkeleton className="h-6 w-32 mb-4" />
      <div className="h-[280px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="text-gray-500 text-sm">Loading chart...</span>
        </div>
      </div>
    </div>
  );
}

function StatCardSkeleton() {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5">
      <div className="flex justify-between items-center">
        <LoadingSkeleton className="h-4 w-24" />
        <LoadingSkeleton className="h-3 w-6" />
      </div>
      <LoadingSkeleton className="h-8 w-20 mt-2" />
      <div className="flex justify-between items-center mt-2">
        <LoadingSkeleton className="h-3 w-20" />
        <LoadingSkeleton className="h-3 w-8" />
      </div>
    </div>
  );
}

function ErrorState({ message = "Failed to load data" }: { message?: string }) {
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
          Error Loading Dashboard
        </h3>
        <p className="text-gray-500 mb-4">{message}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-[#4E8476] text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Retry
        </button>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  subtitle,
  delta,
  trend = "up", // 'up' | 'down' | 'flat'
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  delta?: string;
  trend?: "up" | "down" | "flat";
}) {
  const isUp = trend === "up";
  const isDown = trend === "down";
  const arrow = isUp ? "↗" : isDown ? "↘" : "→";
  const deltaColor = isUp
    ? "text-green-600"
    : isDown
    ? "text-red-600"
    : "text-gray-500";

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5">
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-500">{title}</div>
        <span className={`text-xs font-medium ${deltaColor}`}>{arrow}</span>
      </div>
      <div className="mt-2 text-2xl font-meduim text-gray-900">{value}</div>
      <div className="flex justify-between items-center">
        <div className="mt-1 text-xs text-[#282828]">{subtitle}</div>
        <span className={`text-xs font-medium ${deltaColor}`}>{delta}</span>
      </div>
    </div>
  );
}

function DotLegend({ items }: { items: { label: string; color: string }[] }) {
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {items.map((it) => (
        <div
          key={it.label}
          className="flex items-center gap-2 text-sm text-gray-700"
        >
          <span
            className="h-3 w-3 rounded-full"
            style={{ background: it.color }}
          />
          {it.label}
        </div>
      ))}
    </div>
  );
}

function SimpleTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: any[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg bg-white px-3 py-2 text-sm shadow ring-1 ring-black/10">
      <div className="font-semibold text-gray-800">{label}</div>
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-2">
          <span
            className="h-2 w-2 rounded-full"
            style={{ background: p.color || p.fill }}
          />
          <span className="text-gray-700">{p.name ?? p.dataKey}:</span>
          <span className="font-medium text-gray-900">{p.value}</span>
        </div>
      ))}
    </div>
  );
}
function DailyTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: any[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  // label is "yyyy-MM-dd"
  const [y, m, d] = String(label).split("-").map(Number);
  const formatted = `${d}/${m}/${y}`;
  const v = payload[0]?.value ?? 0;

  return (
    <div className="rounded-xl bg-[#4E8476] text-white px-3 py-1.5 text-sm shadow">
      {formatted} | <span className="font-semibold">Req: {v}</span>
    </div>
  );
}
// ===== Page =====
export default function Home() {
  const { t } = useTranslation();

  // Mode & Date Range
  const [mode, setMode] = useState<"all" | "normal" | "smart">("all");
  // const [from, setFrom] = useState<string>(format(subDays(new Date(), 7), "yyyy-MM-dd"));
  const [to] = useState<string>(format(new Date(), "yyyy-MM-dd"));

  // API call
  const {
    data: dashboardData,
    isLoading,
    error,
  } = useGetDashboardDataQuery({ type: mode });

  // Process request dates for timeline table (only for normal data)
  const requestTimelineData: TableRow[] = useMemo(() => {
    if (!dashboardData?.normal?.request_dates) return [];

    const now = new Date();
    return dashboardData.normal.request_dates
      .map((dateString, index) => {
        try {
          const requestDate = new Date(dateString);
          // Convert to Cairo time (UTC+2)
          const cairoTime = new Date(
            requestDate.getTime() + 2 * 60 * 60 * 1000
          );
          const daysDifference = differenceInDays(now, requestDate);

          return {
            id: `${index}`,
            requestDate: format(cairoTime, "dd/MM/yyyy HH:mm:ss"),
            daysSince: daysDifference,
            originalDate: dateString,
          };
        } catch (error) {
          console.error("Error parsing date:", dateString, error);
          return null;
        }
      })
      .filter((item): item is NonNullable<typeof item> => item !== null)
      .sort(
        (a, b) =>
          new Date(b.originalDate).getTime() -
          new Date(a.originalDate).getTime()
      );
  }, [dashboardData?.normal?.request_dates]);

  // Table columns for request timeline
  const timelineColumns: TableColumn[] = [
    {
      id: "requestDate",
      header: "Request Date (Cairo Time)",
      accessor: "requestDate",
      render: (value) => (
        <span className="text-sm text-gray-900">{String(value)}</span>
      ),
    },
    {
      id: "daysSince",
      header: "Number of Days",
      accessor: "daysSince",
      render: (value) => (
        <span className="text-sm font-medium">{String(value)} days ago</span>
      ),
    },
  ];

  // Process request_dates to count requests per day
  const timeline = useMemo(() => {
    const requestDates = dashboardData?.normal?.request_dates || [];

    if (requestDates.length === 0) {
      // Fallback to mock data if no API data
      return Array.from({ length: 14 }).map((_, i) => {
        const d = subDays(new Date(to), 13 - i);
        const base = 260 + Math.sin(i / 2) * 80 + (i % 3) * 20;
        return {
          date: format(d, "yyyy-MM-dd"),
          requests: Math.round(base),
        };
      });
    }

    // Group requests by date
    const requestsByDate: Record<string, number> = {};

    requestDates.forEach((dateString) => {
      try {
        const date = new Date(dateString);
        const dateKey = format(date, "yyyy-MM-dd");
        requestsByDate[dateKey] = (requestsByDate[dateKey] || 0) + 1;
      } catch (error) {
        console.error("Error parsing date:", dateString, error);
      }
    });

    // Get all unique dates and sort them
    const allDates = Object.keys(requestsByDate).sort();

    if (allDates.length === 0) {
      // Fallback if no valid dates
      return Array.from({ length: 14 }).map((_, i) => {
        const d = subDays(new Date(to), 13 - i);
        return {
          date: format(d, "yyyy-MM-dd"),
          requests: 0,
        };
      });
    }

    // Create timeline with all dates that have requests
    return allDates.map((date) => ({
      date,
      requests: requestsByDate[date],
    }));
  }, [dashboardData?.normal?.request_dates, to]);

  // ===== Mock Data =====
  const stats = useMemo(() => {
    const normalData = dashboardData?.normal;
    if (!normalData) {
      return [
        {
          title: "Total Transfers",
          value: 0,
          subtitle: "from last month",
          delta: "-",
          trend: "flat" as const,
        },
        {
          title: "Total Approved",
          value: 0,
          subtitle: "from last month",
          delta: "-",
          trend: "flat" as const,
        },
        {
          title: "Total Pending",
          value: 0,
          subtitle: "from last month",
          delta: "-",
          trend: "flat" as const,
        },
        {
          title: "Total Rejected",
          value: 0,
          subtitle: "from last month",
          delta: "-",
          trend: "flat" as const,
        },
      ];
    }

    return [
      {
        title: "Total Transfers",
        value: normalData.total_transfers,
        subtitle: "from last month",
        delta: "+10%",
        trend: "up" as const,
      },
      {
        title: "Total Approved",
        value: normalData.approved_transfers,
        subtitle: "from last month",
        delta: "-2%",
        trend: "down" as const,
      },
      {
        title: "Total Pending",
        value: normalData.pending_transfers,
        subtitle: "from last month",
        delta: "-2%",
        trend: "down" as const,
      },
      {
        title: "Total Rejected",
        value: normalData.rejected_transfers,
        subtitle: "from last month",
        delta: "-2%",
        trend: "down" as const,
      },
    ];
  }, [dashboardData?.normal]);

  const transferCategories = useMemo(() => {
    const normalData = dashboardData?.normal;
    if (!normalData) {
      return [
        { code: "FAD", value: 0 },
        { code: "AFR", value: 0 },
        { code: "FAR", value: 0 },
      ];
    }

    return [
      { code: "FAD", value: normalData.total_transfers_fad },
      { code: "AFR", value: normalData.total_transfers_afr },
      { code: "FAR", value: normalData.total_transfers_far },
    ];
  }, [dashboardData?.normal]);

  const statusData = useMemo(() => {
    const normalData = dashboardData?.normal;
    if (!normalData) {
      return [
        { name: "Approved", value: 0, color: COLORS.success },
        { name: "Pending", value: 0, color: COLORS.warning },
        { name: "Rejected", value: 0, color: COLORS.danger },
      ];
    }

    return [
      {
        name: "Approved",
        value: normalData.approved_transfers,
        color: COLORS.success,
      },
      {
        name: "Pending",
        value: normalData.pending_transfers,
        color: COLORS.warning,
      },
      {
        name: "Rejected",
        value: normalData.rejected_transfers,
        color: COLORS.danger,
      },
    ];
  }, [dashboardData?.normal]);

  const pendingByLevel = useMemo(() => {
    const normalData = dashboardData?.normal;
    if (!normalData?.pending_transfers_by_level) {
      return [
        { level: "Level 4", value: 0 },
        { level: "Level 3", value: 0 },
        { level: "Level 2", value: 0 },
        { level: "Level 1", value: 0 },
      ];
    }

    return [
      { level: "Level 4", value: normalData.pending_transfers_by_level.Level4 },
      { level: "Level 3", value: normalData.pending_transfers_by_level.Level3 },
      { level: "Level 2", value: normalData.pending_transfers_by_level.Level2 },
      { level: "Level 1", value: normalData.pending_transfers_by_level.Level1 },
    ];
  }, [dashboardData?.normal]);

  // Smart Dashboard Data Processing
  const smartCostCenterChart = useMemo(() => {
    const smartData = dashboardData?.smart;
    if (!smartData?.cost_center_totals) return [];

    return smartData.cost_center_totals.map((center) => ({
      name: `CC ${center.cost_center_code}`,
      from: center.total_from_center,
      to: center.total_to_center,
    }));
  }, [dashboardData?.smart]);

  const smartAccountCodeChart = useMemo(() => {
    const smartData = dashboardData?.smart;
    if (!smartData?.account_code_totals) return [];

    return smartData.account_code_totals.map((account) => ({
      name: `AC ${account.account_code}`,
      from: account.total_from_center,
      to: account.total_to_center,
    }));
  }, [dashboardData?.smart]);

  const smartCombinationsChart = useMemo(() => {
    const smartData = dashboardData?.smart;
    if (!smartData?.filtered_combinations) return [];

    return smartData.filtered_combinations.map((combo, index) => ({
      name: `${combo.cost_center_code}-${combo.account_code}`,
      from: combo.total_from_center,
      to: combo.total_to_center,
      id: index,
    }));
  }, [dashboardData?.smart]);

  return (
    <div className="space-y-6">
      {/* Error State */}
      {error && (
        <ErrorState message="Failed to load dashboard data. Please try again." />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            {t("dashboard") || "Dashboard"}
          </h1>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          {/* Mode */}
          <div className="relative">
            <select
              value={mode}
              onChange={(e) =>
                setMode(e.target.value as "all" | "normal" | "smart")
              }
              className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              disabled={isLoading}
            >
              <option value="all">All</option>
              <option value="normal">Normal</option>
              <option value="smart">Smart</option>
            </select>
          </div>

          {/* Loading indicator in header */}
          {isLoading && (
            <div className="flex items-center gap-2 text-blue-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="text-sm">Loading...</span>
            </div>
          )}

          {/* Date range */}
          {/* <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm">
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="outline-none"
            />
            <span className="text-gray-400">–</span>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="outline-none"
            />
          </div> */}
        </div>
      </div>

      {/* Stats */}
      {(mode === "normal" || mode === "all") && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <StatCardSkeleton key={i} />
              ))
            : stats.map((s, index) => (
                <div
                  key={s.title}
                  className="animate-fadeIn"
                  style={{
                    animationDelay: `${index * 0.1}s`,
                    opacity: 0,
                    animation: `fadeIn 0.6s ease-out ${index * 0.1}s forwards`,
                  }}
                >
                  <StatCard
                    title={s.title}
                    value={s.value.toLocaleString()}
                    subtitle={s.subtitle}
                    delta={s.delta}
                    trend={s.trend}
                  />
                </div>
              ))}
        </div>
      )}

      {/* Charts Row 1 */}
      {(mode === "normal" || mode === "all") && (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          {isLoading ? (
            <>
              <ChartLoadingSkeleton />
              <ChartLoadingSkeleton />
            </>
          ) : (
            <>
              {/* Transfer Categories */}
              <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5 animate-fadeIn">
                <div className="mb-4 font-semibold text-gray-900">
                  Transfer Categories
                </div>
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={transferCategories} barSize={40}>
                      <CartesianGrid vertical={false} stroke={COLORS.gray300} />
                      <XAxis
                        dataKey="code"
                        style={{ fontSize: 12 }}
                        tick={{ fill: COLORS.gray500 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        style={{ fontSize: 14 }}
                        tick={{ fill: COLORS.gray500 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <RTooltip content={<SimpleTooltip />} />
                      {/* أول اتنين رمادي، الأخيرة Primary زي الصورة */}
                      <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                        {transferCategories.map((_, i) => (
                          <Cell
                            key={i}
                            fill={
                              i === transferCategories.length - 1
                                ? COLORS.primary
                                : COLORS.gray300
                            }
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Transfer Status (Donut) */}
              <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5 animate-fadeIn">
                <div className="mb-4 font-semibold text-gray-900">
                  Transfer Status
                </div>
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={80}
                        outerRadius={95}
                        paddingAngle={1}
                        cornerRadius={2}
                      >
                        {statusData.map((entry, i) => (
                          <Cell key={`slice-${i}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RTooltip content={<SimpleTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <DotLegend
                  items={[
                    { label: "Approved", color: COLORS.success },
                    { label: "Pending", color: COLORS.warning },
                    { label: "Rejected", color: COLORS.danger },
                  ]}
                />
              </div>
            </>
          )}
        </div>
      )}

      {/* Charts Row 2 */}
      {(mode === "normal" || mode === "all") && (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          {isLoading ? (
            <>
              <ChartLoadingSkeleton />
              <ChartLoadingSkeleton />
            </>
          ) : (
            <>
              {/* Requests Timeline (Area) */}
              {/* Requests Timeline */}
              <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5 animate-fadeIn">
                <div className="mb-4 font-semibold text-gray-900">
                  Requests Timeline
                </div>

                <div className="h-[260px]">
                  <ResponsiveContainer width="100%" height="100%">
                    {(() => {
                      // use your dataset here (timeline or weeklyTimeline)
                      const chartData = timeline; // <-- or weeklyTimeline
                      const xKey = "date"; // <-- "label" if you use weeklyTimeline
                      const startTick = chartData[0]?.[xKey];
                      const endTick = chartData.at(-2)?.[xKey];

                      return (
                        <AreaChart
                          data={chartData}
                          margin={{ left: 8, right: 8 }}
                        >
                          <defs>
                            <linearGradient
                              id="areaFill"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="5%"
                                stopColor={COLORS.primary}
                                stopOpacity={0.25}
                              />
                              <stop
                                offset="95%"
                                stopColor={COLORS.primary}
                                stopOpacity={0}
                              />
                            </linearGradient>
                          </defs>

                          <CartesianGrid
                            vertical={false}
                            stroke={COLORS.gray300}
                          />

                          {/* Only show first & last ticks, bold */}
                          <XAxis
                            dataKey={xKey}
                            ticks={[startTick!, endTick!].filter(Boolean)}
                            tick={{ fill: COLORS.text, fontWeight: 700 }}
                            interval={0}
                            axisLine={false}
                            tickLine={false}
                            tickMargin={12}
                            style={{ fontSize: 14 }}
                          />

                          <YAxis
                            domain={[0, "dataMax + 50"]}
                            tick={{ fill: COLORS.gray500 }}
                            axisLine={false}
                            tickLine={false}
                            width={28}
                            style={{ fontSize: 12 }}
                          />

                          <RTooltip
                            content={<DailyTooltip />}
                            cursor={{
                              stroke: COLORS.primary,
                              strokeWidth: 2,
                              fill: "transparent",
                            }} // vertical line
                            wrapperStyle={{ outline: "none" }}
                          />

                          <Area
                            type="monotone"
                            dataKey="requests"
                            stroke={COLORS.primary}
                            fill="url(#areaFill)"
                            strokeWidth={3}
                            dot={false}
                            activeDot={{
                              r: 5,
                              fill: "#fff",
                              stroke: COLORS.primary,
                              strokeWidth: 3,
                            }}
                          />
                        </AreaChart>
                      );
                    })()}
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Pending by Level (Horizontal Bars) */}
              <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5 animate-fadeIn">
                <div className="mb-4 font-semibold text-gray-900">
                  Pending by Level
                </div>
                <div className="h-[260px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={pendingByLevel}
                      layout="vertical"
                      margin={{ left: 30, right: 16 }}
                      barSize={30}
                    >
                      <CartesianGrid
                        horizontal={false}
                        stroke={COLORS.gray300}
                      />
                      <XAxis type="number" hide />
                      <YAxis
                        style={{ fontSize: 13 }}
                        type="category"
                        dataKey="level"
                        tick={{ fill: COLORS.gray500 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <RTooltip content={<SimpleTooltip />} />
                      <Bar
                        dataKey="value"
                        style={{ touchAction: "none" }}
                        fill={COLORS.primary}
                        radius={[0, 8, 8, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Request Timeline Pipeline Table - Only for Normal mode */}
      {(mode === "normal" || mode === "all") && dashboardData?.normal && (
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
          <div className="mb-4 font-semibold text-gray-900">
            Request Timeline Pipeline
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">
                Loading timeline data...
              </span>
            </div>
          ) : error ? (
            <div className="flex justify-center items-center h-32 text-red-600">
              Failed to load timeline data
            </div>
          ) : (
            <SharedTable
              columns={timelineColumns}
              data={requestTimelineData}
              showPagination={false}
              itemsPerPage={10}
              currentPage={1}
              maxHeight="800px"
              className="mt-4"
            />
          )}
        </div>
      )}

      {/* Smart Dashboard Section - Only for Smart mode */}
      {(mode === "smart" || mode === "all") && (
        <div className="space-y-6">
          {isLoading ? (
            <>
              {/* Smart Charts Row 1 Loading */}
              <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                <ChartLoadingSkeleton />
                <ChartLoadingSkeleton />
              </div>
              {/* Smart Charts Row 2 Loading */}
              <div className="grid grid-cols-1 gap-6">
                <ChartLoadingSkeleton />
              </div>
              {/* Smart Data Table Loading */}
              <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
                <LoadingSkeleton className="h-6 w-32 mb-4" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="p-4 border rounded-lg">
                      <LoadingSkeleton className="h-4 w-24 mb-2" />
                      <LoadingSkeleton className="h-6 w-20 mb-1" />
                      <LoadingSkeleton className="h-6 w-20" />
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : dashboardData?.smart ? (
            <>
              {/* Smart Charts Row 1 */}
              <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                {/* Cost Center Analysis Chart */}
                <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5 animate-fadeIn">
                  <div className="mb-4 font-semibold text-gray-900">
                    Cost Center Analysis
                  </div>
                  <div className="h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={smartCostCenterChart} barSize={30}>
                        <CartesianGrid
                          vertical={false}
                          stroke={COLORS.gray300}
                        />
                        <XAxis
                          dataKey="name"
                          style={{ fontSize: 11 }}
                          tick={{ fill: COLORS.gray500 }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          style={{ fontSize: 12 }}
                          tick={{ fill: COLORS.gray500 }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <RTooltip content={<SimpleTooltip />} />
                        <Bar
                          dataKey="from"
                          fill={COLORS.primary}
                          radius={[4, 4, 0, 0]}
                          name="From Center"
                        />
                        <Bar
                          dataKey="to"
                          fill={COLORS.success}
                          radius={[4, 4, 0, 0]}
                          name="To Center"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <DotLegend
                    items={[
                      { label: "From Center", color: COLORS.primary },
                      { label: "To Center", color: COLORS.success },
                    ]}
                  />
                </div>

                {/* Account Code Analysis Chart */}
                <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5 animate-fadeIn">
                  <div className="mb-4 font-semibold text-gray-900">
                    Account Code Analysis
                  </div>
                  <div className="h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={smartAccountCodeChart} barSize={30}>
                        <CartesianGrid
                          vertical={false}
                          stroke={COLORS.gray300}
                        />
                        <XAxis
                          dataKey="name"
                          style={{ fontSize: 11 }}
                          tick={{ fill: COLORS.gray500 }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          style={{ fontSize: 12 }}
                          tick={{ fill: COLORS.gray500 }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <RTooltip content={<SimpleTooltip />} />
                        <Bar
                          dataKey="from"
                          fill={COLORS.warning}
                          radius={[4, 4, 0, 0]}
                          name="From Center"
                        />
                        <Bar
                          dataKey="to"
                          fill={COLORS.danger}
                          radius={[4, 4, 0, 0]}
                          name="To Center"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <DotLegend
                    items={[
                      { label: "From Center", color: COLORS.warning },
                      { label: "To Center", color: COLORS.danger },
                    ]}
                  />
                </div>
              </div>

              {/* Smart Charts Row 2 */}
              <div className="grid grid-cols-1 gap-6">
                {/* Combinations Analysis Chart */}
                <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5 animate-fadeIn">
                  <div className="mb-4 font-semibold text-gray-900">
                    Cost Center & Account Code Combinations
                  </div>
                  <div className="h-[320px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={smartCombinationsChart} barSize={40}>
                        <CartesianGrid
                          vertical={false}
                          stroke={COLORS.gray300}
                        />
                        <XAxis
                          dataKey="name"
                          style={{ fontSize: 10 }}
                          tick={{ fill: COLORS.gray500 }}
                          axisLine={false}
                          tickLine={false}
                          angle={-45}
                          textAnchor="end"
                          height={80}
                        />
                        <YAxis
                          style={{ fontSize: 12 }}
                          tick={{ fill: COLORS.gray500 }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <RTooltip content={<SimpleTooltip />} />
                        <Bar
                          dataKey="from"
                          fill={COLORS.primary}
                          radius={[4, 4, 0, 0]}
                          name="From Center"
                        />
                        <Bar
                          dataKey="to"
                          fill={COLORS.success}
                          radius={[4, 4, 0, 0]}
                          name="To Center"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <DotLegend
                    items={[
                      { label: "From Center", color: COLORS.primary },
                      { label: "To Center", color: COLORS.success },
                    ]}
                  />
                </div>
              </div>

              {/* Smart Dashboard Data Tables */}
              <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5 animate-fadeIn">
                <div className="mb-4 font-semibold text-gray-900">
                  Detailed Analysis
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {dashboardData.smart.cost_center_totals.map((center) => (
                    <div
                      key={center.cost_center_code}
                      className="p-4 border rounded-lg"
                    >
                      <div className="text-sm font-medium text-gray-700">
                        Cost Center: {center.cost_center_code}
                      </div>
                      <div className="text-lg font-semibold text-gray-900">
                        From: {center.total_from_center.toLocaleString()}
                      </div>
                      <div className="text-lg font-semibold text-gray-900">
                        To: {center.total_to_center.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : null}
        </div>
      )}
    </div>
  );
}
