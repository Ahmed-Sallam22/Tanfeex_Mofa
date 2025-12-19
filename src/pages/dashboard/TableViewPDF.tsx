import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useExportToPdfMutation, type TransactionReportData } from "@/api/transfer.api";
import ksaMinistryLogo from "../../assets/ksa_ministry_text.svg";
import saudiLogo from "../../assets/saudilogotext.png";
import tanfeezLogo from "../../assets/Tanfeezletter.png";

// Table columns configuration
const tableColumns = [
  {
    key: "program",
    label: "البرنامج/المشروع",
    rowSpan: 2,
    align: "center" as const,
  },
  {
    key: "economicClassification",
    label: "التصنيف الاقتصادي",
    rowSpan: 2,
    align: "center" as const,
  },
  {
    key: "documentNumber",
    label: "رقم السند",
    rowSpan: 2,
    align: "center" as const,
  },
  {
    key: "discussionType",
    label: "نوع المناقلة",
    rowSpan: 2,
    align: "center" as const,
  },
  {
    key: "amount",
    label: "المبلغ",
    colSpan: 2,
    subColumns: [
      { key: "amountFrom", label: "منه", align: "center" as const },
      { key: "amountTo", label: "اليه", align: "center" as const },
    ],
  },
  {
    key: "description",
    label: "الوصف",
    rowSpan: 2,
    align: "right" as const,
  },
  {
    key: "justifications",
    label: "المبررات",
    rowSpan: 2,
    align: "right" as const,
  },
];

// Type for table row data
interface TableRowData {
  id: number;
  program: string;
  economicClassification: string;
  documentNumber: string;
  discussionType: string;
  amountFrom: string;
  amountTo: string;
  description: string;
  justifications: string;
}

// Type for the API response when multiple IDs are provided
interface MultipleTransactionsResponse {
  count: number;
  error_count: number;
  success_count: number;
  transactions: TransactionReportData[];
}

// Helper function to transform API data to table format
const transformApiDataToTableData = (apiData: TransactionReportData[]): TableRowData[] => {
  return apiData.map((transaction, index) => {
    // Get first transfer's segment data for program/classification if available
    const firstTransfer = transaction.transfers?.[0];
    // Use segment_11 (عنصر الميزانية) for program/project column
    const segment11 = firstTransfer?.segments?.segment_11;
    // Use segment_5 (الموقع الجغرافي) for economic classification
    // const segment5 = firstTransfer?.segments?.segment_5;

    // Get from_code and from_name, fallback to to_code and to_name if from is empty
    const programCode = segment11?.from_code || segment11?.to_code || "";
    const programName = segment11?.from_name || segment11?.to_name || "-";

    return {
      id: transaction.transaction_id || index + 1,
      program: programCode ? `${programCode} - ${programName}` : programName,
      economicClassification: "-",
      documentNumber: transaction.code || transaction.transaction_id?.toString() || "-",
      discussionType: transaction.transfer_type || transaction.type || "-",
      amountFrom: transaction.summary?.total_from_center?.toString() || "0",
      amountTo: transaction.summary?.total_to_center?.toString() || "0",
      description: transaction.notes || "-",
      justifications: transaction.notes || "-",
    };
  });
};

// Page Header Component - will repeat on each printed page
const PageHeader = () => (
  <div className="page-header flex items-center justify-between px-10 py-6">
    <div className="flex-shrink-0">
      <img src={saudiLogo} alt="شعار السعودية" className="h-16 w-auto object-contain" />
    </div>
    <div className="flex-shrink-0">
      <img src={tanfeezLogo} alt="شعار تنفيذ" className="h-40 w-auto object-contain" />
    </div>
    <div className="flex-shrink-0">
      <img src={ksaMinistryLogo} alt="شعار الوزارة" className="h-16 w-auto object-contain" />
    </div>
  </div>
);

// Page Footer Component - will repeat on each printed page
const PageFooter = () => (
  <div className="page-footer flex items-center justify-between px-10 py-6">
    {/* Right - مدير الادارة */}
    <div className="text-center">
      <p className="font-bold text-lg mb-8">اعتماد مدير الادارة</p>
      <div className="border-t border-gray-400 w-48 mx-auto pt-2">
        <p className="text-gray-500">التوقيع</p>
      </div>
    </div>

    {/* Left - وكيل الوزارة */}
    <div className="text-center">
      <p className="font-bold text-lg mb-8">اعتماد وكيل الوزارة</p>
      <div className="border-t border-gray-400 w-48 mx-auto pt-2">
        <p className="text-gray-500">التوقيع</p>
      </div>
    </div>
  </div>
);

const TableViewPDF = () => {
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();
  const [exportToPdf, { isLoading }] = useExportToPdfMutation();
  const [tableData, setTableData] = useState<TableRowData[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const idsParam = searchParams.get("ids");

    // Protection: Redirect if no IDs provided
    if (!idsParam || idsParam.trim() === "") {
      setError(t("messages.selectAtLeastOne"));
      // Redirect to transfer page after 2 seconds
      setTimeout(() => {
        window.location.href = "/app/transfer";
      }, 2000);
      return;
    }

    const ids = idsParam
      .split(",")
      .map((id) => Number(id))
      .filter((id) => !isNaN(id));

    // Protection: Validate IDs
    if (ids.length === 0) {
      setError(t("messages.invalidData"));
      setTimeout(() => {
        window.location.href = "/app/transfer";
      }, 2000);
      return;
    }

    // Fetch report data from API
    exportToPdf({ transaction_ids: ids })
      .unwrap()
      .then((response: TransactionReportData | TransactionReportData[] | MultipleTransactionsResponse) => {
        console.log("Table PDF API Response:", response);

        // Ensure response is always an array
        let dataArray: TransactionReportData[];

        // Check if response has transactions property (multiple IDs)
        if (
          response &&
          typeof response === "object" &&
          "transactions" in response &&
          Array.isArray(response.transactions)
        ) {
          dataArray = response.transactions;
          console.log("Multiple transactions response, count:", (response as MultipleTransactionsResponse).count);
        }
        // Check if response is directly an array
        else if (Array.isArray(response)) {
          dataArray = response;
        }
        // Single transaction object
        else if (response && typeof response === "object" && "transaction_id" in response) {
          dataArray = [response as TransactionReportData];
        }
        // Invalid response
        else {
          setError(t("common.noData"));
          setTimeout(() => {
            window.location.href = "/app/transfer";
          }, 2000);
          return;
        }

        // Validate data array
        if (dataArray.length === 0) {
          setError(t("common.noData"));
          setTimeout(() => {
            window.location.href = "/app/transfer";
          }, 2000);
          return;
        }

        // Transform API data to table format
        const transformedData = transformApiDataToTableData(dataArray);
        console.log("Setting table data, length:", transformedData.length, transformedData);
        setTableData(transformedData);
      })
      .catch((err) => {
        console.error("Error fetching table data:", err);
        setError(t("messages.exportError"));
        // Redirect to transfer page after error
        setTimeout(() => {
          window.location.href = "/app/transfer";
        }, 2000);
      });
  }, [searchParams, exportToPdf, t]);

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4E8476] mx-auto mb-4"></div>
          <p className="text-gray-600">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center max-w-md p-8 bg-white rounded-lg shadow-lg">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{t("common.error")}</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#4E8476]"></div>
            <span>{t("messages.redirecting")}</span>
          </div>
        </div>
      </div>
    );
  }

  if (!tableData || tableData.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-gray-400 text-4xl mb-4">📄</div>
          <p className="text-gray-600">{t("common.noData")}</p>
        </div>
      </div>
    );
  }

  return (
    <div dir="rtl" className="flex flex-col min-h-screen bg-white" style={{ fontFamily: "Arial, sans-serif" }}>
      {/* Print Button - Hidden when printing */}
      <div className="print:hidden flex justify-end p-4">
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
            />
          </svg>
          طباعة PDF
        </button>
      </div>

      {/* Header - Fixed at top */}
      <div className="flex-shrink-0">
        <PageHeader />
      </div>

      {/* Main Content - Takes remaining space */}
      <div className="flex-1 px-8 py-4 overflow-auto">
        {/* Data Table */}
        <table className="data-table w-full border-collapse border border-gray-400">
          <thead>
            {/* First header row */}
            <tr className="bg-gray-100">
              {tableColumns.map((col) => (
                <th
                  key={col.key}
                  className={`border border-gray-400 px-3 py-3 text-${col.align} font-bold`}
                  rowSpan={col.rowSpan}
                  colSpan={col.colSpan}>
                  {col.label}
                </th>
              ))}
            </tr>
            {/* Second header row for sub-columns */}
            <tr className="bg-gray-100">
              {tableColumns
                .filter((col) => col.subColumns)
                .flatMap((col) => col.subColumns!)
                .map((subCol) => (
                  <th key={subCol.key} className={`border border-gray-400 px-3 py-2 text-${subCol.align} font-bold`}>
                    {subCol.label}
                  </th>
                ))}
            </tr>
          </thead>
          <tbody>
            {tableData.map((row, index) => (
              <tr key={`${row.id}-${index}`} className="hover:bg-gray-50">
                {tableColumns.map((col) => {
                  // Handle columns with sub-columns
                  if (col.subColumns) {
                    return col.subColumns.map((subCol) => (
                      <td key={subCol.key} className={`border border-gray-400 px-3 py-3 text-${subCol.align}`}>
                        {row[subCol.key as keyof typeof row]}
                      </td>
                    ));
                  }
                  // Handle regular columns
                  return (
                    <td key={col.key} className={`border border-gray-400 px-3 py-3 text-${col.align}`}>
                      {row[col.key as keyof typeof row]}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer - Fixed at bottom */}
      <div className="flex-shrink-0">
        <PageFooter />
      </div>
    </div>
  );
};

export default TableViewPDF;
