import { Handle, Position, type NodeProps } from "@xyflow/react";
import { CheckCircle } from "lucide-react";
import type { ActionNodeData } from "./types";

export const SuccessNode = ({ data, selected }: NodeProps) => {
  const nodeData = data as ActionNodeData;
  return (
    <div
      className={`bg-white rounded-2xl shadow-md border ${
        selected ? "border-green-500 border-2" : "border-gray-100"
      } min-w-[220px] p-5`}>
      <Handle type="target" position={Position.Top} className="!bg-green-500 !w-3 !h-3" />

      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
          <CheckCircle className="w-5 h-5 text-green-600" />
        </div>
        <div>
          <span className="font-semibold text-gray-800 text-base block">{String(nodeData.label || "Success")}</span>
          <p className="text-xs text-gray-400 mt-0.5">Workflow completes successfully</p>
        </div>
      </div>
    </div>
  );
};
