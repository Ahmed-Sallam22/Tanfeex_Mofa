import { Handle, Position, type NodeProps } from "@xyflow/react";
import { GitBranch, CheckCircle, XCircle } from "lucide-react";
import type { ConditionNodeData } from "./types";

export const ConditionNode = ({ data, selected }: NodeProps) => {
  const nodeData = data as ConditionNodeData;

  // Get action display text
  const getTrueActionLabel = () => {
    const action = nodeData.ifTrueAction as string;
    if (action === "proceed_to_step") return "Proceed to Step";
    if (action === "complete_success") return "Success";
    if (action === "complete_failure") return "Failure";
    return "Success";
  };

  const getFalseActionLabel = () => {
    const action = nodeData.ifFalseAction as string;
    if (action === "proceed_to_step") return "Proceed to Step";
    if (action === "complete_success") return "Success";
    if (action === "complete_failure") return "Failure";
    return "Failure";
  };

  return (
    <div
      className={`bg-white rounded-2xl shadow-md border ${
        selected ? "border-[#00B7AD] border-2" : "border-gray-100"
      } min-w-[320px] p-5`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-[#00B7AD] !w-3 !h-3"
      />

      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-[#E8F8F7] flex items-center justify-center">
          <GitBranch className="w-5 h-5 text-[#00B7AD]" />
        </div>
        <span className="font-semibold text-gray-800 text-base">
          {String(nodeData.label || "Check Type")}
        </span>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-gray-400 font-medium">
          <span>Left Hand Side</span>
          <span>Right Hand Side</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex-1 bg-gray-50 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 border border-gray-100">
            {String(nodeData.leftSide || "type")}
          </div>
          <span className="text-gray-400 font-bold text-lg px-2">
            {String(nodeData.operator || "==")}
          </span>
          <div className="flex-1 bg-gray-50 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 border border-gray-100">
            {String(nodeData.rightSide || "FAR")}
          </div>
        </div>

        {/* Action Display Section */}
        <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
          {/* True Action */}
          <div className="flex-1 flex items-start gap-2 bg-green-50 rounded-lg px-3 py-2 border border-green-100">
            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-green-700">True</div>
              <div className="text-xs text-green-600 truncate">
                {getTrueActionLabel()}
              </div>
            </div>
          </div>

          {/* False Action */}
          <div className="flex-1 flex items-start gap-2 bg-red-50 rounded-lg px-3 py-2 border border-red-100">
            <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-red-600">False</div>
              <div className="text-xs text-red-500 truncate">
                {getFalseActionLabel()}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        id="true"
        className="!bg-green-500 !w-3 !h-3"
        style={{ left: "25%" }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="false"
        className="!bg-gray-300 !w-3 !h-3"
        style={{ left: "75%" }}
      />
    </div>
  );
};
