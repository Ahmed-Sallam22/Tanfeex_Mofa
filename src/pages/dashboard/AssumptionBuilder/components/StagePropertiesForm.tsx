import type { Node } from "@xyflow/react";
import { GitBranch } from "lucide-react";
import { Input } from "@/components/ui";
import { SharedSelect } from "@/shared/SharedSelect";
import { operatorOptions } from "./constants";
import type { StageData } from "./types";
import { ExpressionInput } from "./ExpressionInput";
import type { Datasource } from "@/api/validationWorkflow.api";
import { useTranslation } from "react-i18next";

interface StagePropertiesFormProps {
  selectedNode: Node | null;
  stageData: StageData;
  setStageData: React.Dispatch<React.SetStateAction<StageData>>;
  deleteSelectedNode: () => void;
  datasources?: Datasource[];
  isDatasourcesLoading?: boolean;
}

export const StagePropertiesForm = ({
  selectedNode,
  stageData,
  setStageData,
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
        </>
      )}

      <div className="flex justify-end pt-4">
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
