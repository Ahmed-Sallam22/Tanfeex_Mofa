import type { Node } from "@xyflow/react";
import { GitBranch } from "lucide-react";
import { Input } from "@/components/ui";
import { SharedSelect } from "@/shared/SharedSelect";
import { operatorOptions, dataTypeOptions } from "./constants";
import type { StageData } from "./types";

interface StagePropertiesFormProps {
  selectedNode: Node | null;
  stageData: StageData;
  setStageData: React.Dispatch<React.SetStateAction<StageData>>;
  updateSelectedNode: () => void;
  deleteSelectedNode: () => void;
}

export const StagePropertiesForm = ({
  selectedNode,
  stageData,
  setStageData,
  updateSelectedNode,
  deleteSelectedNode,
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
            <div className="flex gap-2">
              <Input
                placeholder="Enter Left Hand Side"
                value={stageData.leftSide}
                onChange={(e) =>
                  setStageData((prev) => ({
                    ...prev,
                    leftSide: e.target.value,
                  }))
                }
                className="flex-1"
              />
              <div className="w-[120px]">
                <SharedSelect
                  options={dataTypeOptions}
                  value={stageData.leftDataType}
                  onChange={(value) =>
                    setStageData((prev) => ({
                      ...prev,
                      leftDataType: String(value),
                    }))
                  }
                  placeholder="Select Data"
                />
              </div>
            </div>
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
            <div className="flex gap-2">
              <Input
                placeholder="Enter Right Hand Side"
                value={stageData.rightSide}
                onChange={(e) =>
                  setStageData((prev) => ({
                    ...prev,
                    rightSide: e.target.value,
                  }))
                }
                className="flex-1"
              />
              <div className="w-[120px]">
                <SharedSelect
                  options={dataTypeOptions}
                  value={stageData.rightDataType}
                  onChange={(value) =>
                    setStageData((prev) => ({
                      ...prev,
                      rightDataType: String(value),
                    }))
                  }
                  placeholder="Select Data"
                />
              </div>
            </div>
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
