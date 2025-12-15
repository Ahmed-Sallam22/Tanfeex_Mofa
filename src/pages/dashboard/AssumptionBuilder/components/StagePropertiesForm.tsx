import type { Node } from "@xyflow/react";
import { GitBranch, CheckCircle2, XCircle } from "lucide-react";
import { Input } from "@/components/ui";
import { SharedSelect } from "@/shared/SharedSelect";
import { operatorOptions, actionOptions } from "./constants";
import type { StageData } from "./types";
import { ExpressionInput } from "./ExpressionInput";
import type { Datasource } from "@/api/validationWorkflow.api";
import { useTranslation } from "react-i18next";

interface StagePropertiesFormProps {
  selectedNode: Node | null;
  stageData: StageData;
  setStageData: React.Dispatch<React.SetStateAction<StageData>>;
  updateSelectedNode: () => void;
  deleteSelectedNode: () => void;
  datasources?: Datasource[];
  isDatasourcesLoading?: boolean;
}

export const StagePropertiesForm = ({
  selectedNode,
  stageData,
  setStageData,
  updateSelectedNode,
  deleteSelectedNode,
  datasources = [],
  isDatasourcesLoading = false,
}: StagePropertiesFormProps) => {
  const { t } = useTranslation();

  if (!selectedNode) {
    return (
      <div className="text-center py-12 text-gray-400">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-50 flex items-center justify-center">
          <GitBranch className="w-8 h-8 text-gray-300" />
        </div>
        <p className="text-sm">{t("assumptionBuilder.selectStage")}</p>
      </div>
    );
  }

  const getTrueActionMessage = () => {
    const data = stageData.ifTrueActionData;
    if (!data) return "";
    return (data.message || data.note || data.error || "") as string;
  };

  const getFalseActionMessage = () => {
    const data = stageData.ifFalseActionData;
    if (!data) return "";
    return (data.error || data.message || data.note || "") as string;
  };

  const updateTrueAction = (action: string) => {
    const currentMessage = getTrueActionMessage();
    let newData: Record<string, unknown> = {};
    
    if (action === "proceed_to_step") {
      newData = { message: currentMessage };
    } else if (action === "complete_success") {
      newData = { message: currentMessage };
    } else if (action === "complete_failure") {
      newData = { error: currentMessage };
    }

    setStageData((prev) => ({
      ...prev,
      ifTrueAction: action,
      ifTrueActionData: newData,
    }));
  };

  const updateFalseAction = (action: string) => {
    const currentMessage = getFalseActionMessage();
    let newData: Record<string, unknown> = {};
    
    if (action === "proceed_to_step") {
      newData = { message: currentMessage };
    } else if (action === "complete_success") {
      newData = { message: currentMessage };
    } else if (action === "complete_failure") {
      newData = { error: currentMessage };
    }

    setStageData((prev) => ({
      ...prev,
      ifFalseAction: action,
      ifFalseActionData: newData,
    }));
  };

  const updateTrueMessage = (value: string) => {
    const action = stageData.ifTrueAction;
    const key = action === "complete_failure" ? "error" : "message";
    
    setStageData((prev) => ({
      ...prev,
      ifTrueActionData: {
        ...prev.ifTrueActionData,
        [key]: value,
      },
    }));
  };

  const updateFalseMessage = (value: string) => {
    const action = stageData.ifFalseAction;
    const key = action === "complete_failure" ? "error" : "message";
    
    setStageData((prev) => ({
      ...prev,
      ifFalseActionData: {
        ...prev.ifFalseActionData,
        [key]: value,
      },
    }));
  };

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t("assumptionBuilder.stageName")}
        </label>
        <Input
          placeholder={t("assumptionBuilder.stageName")}
          value={stageData.name}
          onChange={(e) =>
            setStageData((prev) => ({
              ...prev,
              name: e.target.value,
            }))
          }
        />
      </div>

      {selectedNode.type === "condition" && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("assumptionBuilder.leftHandSide")}
            </label>
            <ExpressionInput
              value={stageData.leftSide}
              onChange={(value) =>
                setStageData((prev) => ({
                  ...prev,
                  leftSide: value,
                }))
              }
              placeholder="e.g., datasource:Transaction_Total_From + 100"
              datasources={datasources}
              isLoading={isDatasourcesLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("assumptionBuilder.operation")}
            </label>
            <SharedSelect
              options={operatorOptions}
              value={stageData.operator}
              onChange={(value) =>
                setStageData((prev) => ({
                  ...prev,
                  operator: String(value),
                }))
              }
              placeholder={t("assumptionBuilder.selectOperator")}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("assumptionBuilder.rightHandSide")}
            </label>
            <ExpressionInput
              value={stageData.rightSide}
              onChange={(value) =>
                setStageData((prev) => ({
                  ...prev,
                  rightSide: value,
                }))
              }
              placeholder="e.g., 50000 * datasource:Tax_Rate"
              datasources={datasources}
              isLoading={isDatasourcesLoading}
            />
          </div>

          <div className="border border-green-200 rounded-xl p-4 bg-green-50/50 space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <span className="text-sm font-semibold text-green-700">
                {t("assumptionBuilder.ifTrue")}
              </span>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-green-700 mb-1.5">
                {t("assumptionBuilder.action")}
              </label>
              <SharedSelect
                options={actionOptions}
                value={stageData.ifTrueAction}
                onChange={(value) => updateTrueAction(String(value))}
                placeholder={t("assumptionBuilder.selectAction")}
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-green-700 mb-1.5">
                {stageData.ifTrueAction === "complete_failure" 
                  ? t("assumptionBuilder.errorMessage")
                  : t("assumptionBuilder.successMessage")}
              </label>
              <Input
                placeholder={
                  stageData.ifTrueAction === "complete_failure"
                    ? t("assumptionBuilder.enterErrorMessage")
                    : t("assumptionBuilder.enterSuccessMessage")
                }
                value={getTrueActionMessage()}
                onChange={(e) => updateTrueMessage(e.target.value)}
                className="bg-white border-green-200 focus:border-green-400 text-sm"
              />
            </div>
          </div>

          <div className="border border-red-200 rounded-xl p-4 bg-red-50/50 space-y-3">
            <div className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-500" />
              <span className="text-sm font-semibold text-red-600">
                {t("assumptionBuilder.ifFalse")}
              </span>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-red-600 mb-1.5">
                {t("assumptionBuilder.action")}
              </label>
              <SharedSelect
                options={actionOptions}
                value={stageData.ifFalseAction}
                onChange={(value) => updateFalseAction(String(value))}
                placeholder={t("assumptionBuilder.selectAction")}
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-red-600 mb-1.5">
                {stageData.ifFalseAction === "complete_success"
                  ? t("assumptionBuilder.successMessage")
                  : t("assumptionBuilder.errorMessage")}
              </label>
              <Input
                placeholder={
                  stageData.ifFalseAction === "complete_success"
                    ? t("assumptionBuilder.enterSuccessMessage")
                    : t("assumptionBuilder.enterErrorMessage")
                }
                value={getFalseActionMessage()}
                onChange={(e) => updateFalseMessage(e.target.value)}
                className="bg-white border-red-200 focus:border-red-400 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("assumptionBuilder.failureMessage")}
            </label>
            <Input
              placeholder={t("assumptionBuilder.enterFailureMessage")}
              value={stageData.failureMessage || ""}
              onChange={(e) =>
                setStageData((prev) => ({
                  ...prev,
                  failureMessage: e.target.value,
                }))
              }
            />
          </div>
        </>
      )}

      <div className="flex gap-2 pt-4">
        <button
          onClick={updateSelectedNode}
          className="flex-1 px-4 py-2.5 bg-[#00B7AD] text-white rounded-xl text-sm font-medium hover:bg-[#009B92] transition-colors"
        >
          {t("assumptionBuilder.updateStage")}
        </button>
        <button
          onClick={deleteSelectedNode}
          className="px-4 py-2.5 bg-red-50 text-red-500 rounded-xl text-sm font-medium hover:bg-red-100 transition-colors"
        >
          {t("assumptionBuilder.delete")}
        </button>
      </div>
    </div>
  );
};
