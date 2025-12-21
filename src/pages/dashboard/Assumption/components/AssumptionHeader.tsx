import { useTranslation } from "react-i18next";

interface ValidationWorkflowHeaderProps {
  onCreateNew: () => void;
}

export const AssumptionHeader = ({ onCreateNew }: ValidationWorkflowHeaderProps) => {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-2xl font-semibold text-gray-900">{t("assumptions.validationWorkflows")}</h1>

      <button
        onClick={onCreateNew}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#4E8476] text-white text-sm font-medium rounded-lg hover:bg-[#3d6b5f] transition-colors">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 1V15M1 8H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {t("assumptions.createNewValidationWorkflow")}
      </button>
    </div>
  );
};

// Alias for backward compatibility
export const ValidationWorkflowHeader = AssumptionHeader;
