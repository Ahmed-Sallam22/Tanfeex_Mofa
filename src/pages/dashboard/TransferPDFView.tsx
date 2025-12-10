import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { TransferPDFPreview } from "@/components/TransferPDFPreview";
import type { TransferReportData } from "@/components/TransferPDFPreview";
import { useExportToPdfMutation } from "@/api/transfer.api";
import { useTranslation } from "react-i18next";

// Type for the API response when multiple IDs are provided
interface MultipleTransactionsResponse {
  count: number;
  error_count: number;
  success_count: number;
  transactions: TransferReportData[];
}

export default function TransferPDFView() {
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();
  const [exportToPdf, { isLoading }] = useExportToPdfMutation();
  const [reportData, setReportData] = useState<TransferReportData[] | null>(
    null
  );
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
      .then(
        (
          response:
            | TransferReportData
            | TransferReportData[]
            | MultipleTransactionsResponse
        ) => {
          console.log("PDF API Response:", response);

          // Ensure response is always an array
          let dataArray: TransferReportData[];

          // Check if response has transactions property (multiple IDs)
          if (
            response &&
            typeof response === "object" &&
            "transactions" in response &&
            Array.isArray(response.transactions)
          ) {
            dataArray = response.transactions;
            console.log(
              "Multiple transactions response, count:",
              (response as MultipleTransactionsResponse).count
            );
          }
          // Check if response is directly an array
          else if (Array.isArray(response)) {
            dataArray = response;
          }
          // Single transaction object
          else if (
            response &&
            typeof response === "object" &&
            "transaction_id" in response
          ) {
            dataArray = [response as TransferReportData];
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

          console.log(
            "Setting report data, length:",
            dataArray.length,
            dataArray
          );
          setReportData(dataArray);
        }
      )
      .catch((err) => {
        console.error("Error fetching report:", err);
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

  const handleDownloadPDF = () => {
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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {t("common.error")}
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#4E8476]"></div>
            <span>{t("messages.redirecting")}</span>
          </div>
        </div>
      </div>
    );
  }

  if (!reportData || reportData.length === 0) {
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
    <div className="min-h-screen bg-gray-50">
      {/* Print controls - hidden when printing */}
      <div className="no-print sticky top-0 z-50 bg-white shadow-md py-4 px-6 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            {t("transfer.transferReport")}
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            {reportData.length}{" "}
            {reportData.length === 1
              ? t("common.transaction")
              : t("common.transactions")}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 px-4 py-2 bg-[#4E8476] text-white rounded hover:bg-[#3d6b5f] transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            {t("common.download")} PDF
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
              />
            </svg>
            {t("common.print")}
          </button>
          <button
            onClick={() => window.close()}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
          >
            {t("common.close")}
          </button>
        </div>
      </div>

      {/* Report content */}
      <div className="max-w-[210mm] mx-auto my-8 bg-white shadow-lg print:shadow-none print:my-0">
        {reportData.map((data, index) => (
          <div
            key={data.transaction_id || `transaction-${index}`}
            className={index > 0 ? "page-break" : ""}
          >
            <div className="p-12">
              <TransferPDFPreview data={data} />
            </div>
          </div>
        ))}
      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          .no-print {
            display: none !important;
          }
          
          body {
            margin: 0;
            padding: 0;
          }
          
          .page-break {
            page-break-before: always;
          }
          
          @page {
            size: A4;
            margin: 20mm;
          }
        }
      `}</style>
    </div>
  );
}
