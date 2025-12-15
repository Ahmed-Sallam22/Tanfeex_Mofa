import type { Node } from "@xyflow/react";
import { GitBranch } from "lucide-react";
import { Input } from "@/components/ui";
import { SharedSelect } from "@/shared/SharedSelect";
import { operatorOptions } from "./constants";
import type { StageData } from "./types";
import { ExpressionInput } from "./ExpressionInput";
import type { Datasource } from "@/api/validationWorkflow.api";

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
  if (!selectedNode) {
    return (
      <div className="text-center py-12 text-gray-400">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-50 flex items-center justify-center">
          <GitBranch className="w-8 h-8 text-gray-300" />
        </div>
        <p className="text-sm">Select a stage to edit its properties</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Stage Name</label>
        <Input
          placeholder="Enter Stage name"
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Left Hand Side (LHS)</label>
            <ExpressionInput
              value={stageData.leftSide}
              onChange={(value) =>
                setStageData((prev) => ({
                  ...prev,
                  leftSide: value,
                }))
              }
              placeholder="e.g., {{Transaction_Total_From}} + 100"
              datasources={datasources}
              isLoading={isDatasourcesLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Operation</label>
            <SharedSelect
              options={operatorOptions}
              value={stageData.operator}
              onChange={(value) =>
                setStageData((prev) => ({
                  ...prev,
                  operator: String(value),
                }))
              }
              placeholder="Select Operator"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Right Hand Side (RHS)</label>
            <ExpressionInput
              value={stageData.rightSide}
              onChange={(value) =>
                setStageData((prev) => ({
                  ...prev,
                  rightSide: value,
                }))
              }
              placeholder="e.g., 50000 * {{Tax_Rate}}"
              datasources={datasources}
              isLoading={isDatasourcesLoading}
            />
          </div>
        </>
      )}

      <div className="flex gap-2 pt-4">
        <button
          onClick={updateSelectedNode}
          className="flex-1 px-4 py-2.5 bg-[#00B7AD] text-white rounded-xl text-sm font-medium hover:bg-[#009B92] transition-colors">
          Update Stage
        </button>
        <button
          onClick={deleteSelectedNode}
          className="px-4 py-2.5 bg-red-50 text-red-500 rounded-xl text-sm font-medium hover:bg-red-100 transition-colors">
          Delete
        </button>
      </div>
    </div>
  );
};
