import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useGetAuditLogsQuery } from "@/api/logs.api";
import { SharedTable } from "@/shared/SharedTable";
import type { TableColumn } from "@/shared/SharedTable";
import type { AuditLog } from "@/api/logs.api";
import { useSelector } from "react-redux";
import type { RootState } from "@/app/store";
import { useNavigate } from "react-router-dom";
import SearchBar from "@/shared/SearchBar";

const AuditLogsPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  // Get user role from Redux store
  const user = useSelector((state: RootState) => state.auth.user);
  const userRole = user?.role?.toLowerCase();

  // Redirect if not admin or superadmin
  useEffect(() => {
    if (userRole && userRole !== "admin" && userRole !== "superadmin") {
      navigate("/app/access-denied");
    }
  }, [userRole, navigate]);

  // Fetch audit logs
  const { data, error } = useGetAuditLogsQuery({
    page: currentPage,
    page_size: pageSize,
    search: searchTerm,
  });

  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  // Get severity badge color
  const getSeverityColor = (severity: string) => {
    switch (severity.toUpperCase()) {
      case "INFO":
        return "bg-blue-100 text-blue-800";
      case "WARNING":
        return "bg-yellow-100 text-yellow-800";
      case "ERROR":
        return "bg-red-100 text-red-800";
      case "CRITICAL":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "SUCCESS":
        return "bg-green-100 text-green-800";
      case "FAILURE":
      case "ERROR":
        return "bg-red-100 text-red-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Get action type badge color
  const getActionTypeColor = (actionType: string) => {
    switch (actionType.toUpperCase()) {
      case "CREATE":
        return "bg-green-100 text-green-800";
      case "READ":
        return "bg-blue-100 text-blue-800";
      case "UPDATE":
        return "bg-yellow-100 text-yellow-800";
      case "DELETE":
        return "bg-red-100 text-red-800";
      case "LOGIN":
        return "bg-purple-100 text-purple-800";
      case "LOGOUT":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-[#F6F6F6] text-[#282828]";
    }
  };

  // Define columns for the table
  const columns: TableColumn[] = [
    {
      id: "audit_id",
      header: t("logs.auditId"),
      accessor: "audit_id",
      sortable: true,
      width: 80,
      render: (value) => (
        <span className="font-mono text-sm text-[#282828]">
          #{String(value)}
        </span>
      ),
    },
    {
      id: "timestamp",
      header: t("logs.timestamp"),
      sortable: true,
      width: 180,
      render: (value) => (
        <span className="text-sm text-gray-600">
          {formatTimestamp(value as string)}
        </span>
      ),
    },
    {
      id: "username",
      header: t("logs.username"),
      sortable: true,
      width: 120,
      render: (_value, row) => {
        const log = row as unknown as AuditLog;
        return (
          <div className="flex flex-col">
            <span className="font-medium text-[#282828]">{log.username}</span>
            <span className="text-xs text-gray-500">
              {log.user_display.role}
            </span>
          </div>
        );
      },
    },
    {
      id: "action_type",
      header: t("logs.actionType"),
      sortable: true,
      width: 100,
      render: (value) => (
        <span
          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getActionTypeColor(
            value as string
          )}`}
        >
          {value as string}
        </span>
      ),
    },
    {
      id: "action_description",
      header: t("logs.actionDescription"),
      sortable: false,
      width: 250,
      render: (_value, row) => {
        const log = row as unknown as AuditLog;
        return (
          <div className="flex flex-col">
            <span className="text-sm text-[#282828] truncate">
              {log.action_description}
            </span>
            {log.module && (
              <span className="text-xs text-gray-500">
                {t("logs.module")}: {log.module}
              </span>
            )}
          </div>
        );
      },
    },
    {
      id: "endpoint",
      header: t("logs.endpoint"),
      sortable: false,
      width: 200,
      render: (_value, row) => {
        const log = row as unknown as AuditLog;
        return (
          <div className="flex flex-col">
            <span className="font-mono text-xs text-[#282828] truncate">
              {log.endpoint}
            </span>
            <span className="text-xs text-gray-500">{log.request_method}</span>
          </div>
        );
      },
    },
    {
      id: "status",
      header: t("logs.status"),
      sortable: true,
      width: 100,
      render: (value) => (
        <span
          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
            value as string
          )}`}
        >
          {value as string}
        </span>
      ),
    },
    {
      id: "severity",
      header: t("logs.severity"),
      sortable: true,
      width: 100,
      render: (value) => (
        <span
          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(
            value as string
          )}`}
        >
          {value as string}
        </span>
      ),
    },
    {
      id: "ip_address",
      header: t("logs.ipAddress"),
      sortable: false,
      width: 130,
      render: (value) => (
        <span className="font-mono text-sm text-gray-600">
          {value as string}
        </span>
      ),
    },
    {
      id: "duration_ms",
      header: t("logs.duration"),
      sortable: true,
      width: 100,
      render: (value) => (
        <span className="text-sm text-gray-600">
          {value !== null ? `${value}ms` : "-"}
        </span>
      ),
    },
  ];

  // Handle search
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page on new search
  };

  // Calculate total pages
  const totalPages = data ? Math.ceil(data.count / pageSize) : 0;

  if (!userRole || (userRole !== "admin" && userRole !== "superadmin")) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#282828] mb-2">
            {t("logs.title")}
          </h1>
          <p className="text-gray-500">{t("logs.description")}</p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <SearchBar
            value={searchTerm}
            onChange={handleSearch}
            placeholder={t("logs.searchPlaceholder")}
          />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-4 shadow-sm ring-1 ring-black/5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{t("logs.totalLogs")}</p>
                <p className="text-2xl font-bold text-[#282828]">
                  {data?.count || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-[#E8F5F1] rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-[#4E8476]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm ring-1 ring-black/5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{t("logs.currentPage")}</p>
                <p className="text-2xl font-bold text-[#282828]">
                  {currentPage} / {totalPages || 1}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm ring-1 ring-black/5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{t("logs.pageSize")}</p>
                <p className="text-2xl font-bold text-[#282828]">{pageSize}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm ring-1 ring-black/5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  {t("logs.resultsShowing")}
                </p>
                <p className="text-2xl font-bold text-[#282828]">
                  {data?.results?.length || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-yellow-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <svg
                className="w-5 h-5 text-red-600 mr-2"
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
              <p className="text-red-800">{t("logs.errorLoadingLogs")}</p>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-black/5 overflow-hidden">
          <SharedTable
            data={(data?.results as unknown as Record<string, unknown>[]) || []}
            columns={columns}
            currentPage={currentPage}
            totalCount={data?.count}
            hasNext={!!data?.next}
            hasPrevious={!!data?.previous}
            onPageChange={setCurrentPage}
            showPagination={true}
            itemsPerPage={pageSize}
          />
        </div>
      </div>
    </div>
  );
};

export default AuditLogsPage;
