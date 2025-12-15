import type { Node } from "@xyflow/react";
import { GitBranch, CheckCircle2, XCircle, ArrowRight, PartyPopper, AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui";
import { SharedSelect } from "@/shared/SharedSelect";
import { operatorOptions, actionOptions } from "./constants";
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

  // Helper to get the message from action data based on action type
  const getTrueActionMessage = () => {
    const data = stageData.ifTrueActionData;
    if (!data) return "";
    // Check all possible keys
    if (data.message) return data.message as string;
    if (data.note) return data.note as string;
    if (data.error) return data.error as string;
    return "";
  };

  const getFalseActionMessage = () => {
    const data = stageData.ifFalseActionData;
    if (!data) return "";
    // Check all possible keys
    if (data.error) return data.error as string;
    if (data.message) return data.message as string;
    if (data.note) return data.note as string;
    return "";
  };

  const getTrueNextStepId = () => {
    const data = stageData.ifTrueActionData;
    if (!data) return "";
    return data.next_step_id ? String(data.next_step_id) : "";
  };

  const getFalseNextStepId = () => {
    const data = stageData.ifFalseActionData;
    if (!data) return "";
    return data.next_step_id ? String(data.next_step_id) : "";
  };

  // Update action data based on action type
  const updateTrueActionData = (key: string, value: string | number) => {
    setStageData((prev) => {
      const newData = { ...prev.ifTrueActionData };
      
      // If changing action type, reset the data structure
      if (key === "action") {
        if (value === "proceed_to_step" || value === "proceed_to_step_by_id") {
          return {
            ...prev,
            ifTrueAction: String(value),
            ifTrueActionData: { 
              next_step_id: newData.next_step_id || null,
              message: newData.message || newData.note || "" 
            },
          };
        } else if (value === "complete_success") {
          return {
            ...prev,
            ifTrueAction: String(value),
            ifTrueActionData: { message: newData.message || newData.note || "" },
          };
        } else if (value === "complete_failure") {
          return {
            ...prev,
            ifTrueAction: String(value),
            ifTrueActionData: { error: newData.error || newData.message || "" },
          };
        }
      }
      
      // Update specific field
      newData[key] = value;
      return {
        ...prev,
        ifTrueActionData: newData,
      };
    });
  };

  const updateFalseActionData = (key: string, value: string | number) => {
    setStageData((prev) => {
      const newData = { ...prev.ifFalseActionData };
      
      // If changing action type, reset the data structure
      if (key === "action") {
        if (value === "proceed_to_step" || value === "proceed_to_step_by_id") {
          return {
            ...prev,
            ifFalseAction: String(value),
            ifFalseActionData: { 
              next_step_id: newData.next_step_id || null,
              message: newData.message || newData.note || "" 
            },
          };
        } else if (value === "complete_success") {
          return {
            ...prev,
            ifFalseAction: String(value),
            ifFalseActionData: { message: newData.message || newData.note || "" },
          };
        } else if (value === "complete_failure") {
          return {
            ...prev,
            ifFalseAction: String(value),
            ifFalseActionData: { error: newData.error || newData.message || "" },
          };
        }
      }
      
      // Update specific field
      newData[key] = value;
      return {
        ...prev,
        ifFalseActionData: newData,
      };
    });
  };

  // Get icon for action type
  const getActionIcon = (action: string) => {
    switch (action) {
      case "proceed_to_step":
      case "proceed_to_step_by_id":
        return <ArrowRight className="w-4 h-4" />;
      case "complete_success":
        return <PartyPopper className="w-4 h-4" />;
      case "complete_failure":
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  // Render action-specific fields
  const renderTrueActionFields = () => {
    const action = stageData.ifTrueAction;
    
    return (
      <div className="space-y-3">
        {(action === "proceed_to_step" || action === "proceed_to_step_by_id") && (
          <div>
            <label className="block text-xs font-medium text-green-700 mb-1.5">
              Next Step ID (Optional - Use edge connections)
            </label>
            <Input
              type="number"
              placeholder="Step ID (or connect via edge)"
              value={getTrueNextStepId()}
              onChange={(e) => updateTrueActionData("next_step_id", e.target.value ? Number(e.target.value) : "")}
              className="bg-white border-green-200 focus:border-green-400 text-sm"
            />
          </div>
        )}
        
        <div>
          <label className="block text-xs font-medium text-green-700 mb-1.5">
            {action === "complete_failure" ? "Error Message" : "Success Message"}
          </label>
          <Input
            placeholder={action === "complete_failure" ? "Enter error message" : "Enter success message"}
            value={getTrueActionMessage()}
            onChange={(e) => {
              const key = action === "complete_failure" ? "error" : "message";
              updateTrueActionData(key, e.target.value);
            }}
            className="bg-white border-green-200 focus:border-green-400 text-sm"
          />
        </div>
      </div>
    );
  };

  const renderFalseActionFields = () => {
    const action = stageData.ifFalseAction;
    
    return (
      <div className="space-y-3">
        {(action === "proceed_to_step" || action === "proceed_to_step_by_id") && (
          <div>
            <label className="block text-xs font-medium text-red-600 mb-1.5">
              Next Step ID (Optional - Use edge connections)
            </label>
            <Input
              type="number"
              placeholder="Step ID (or connect via edge)"
              value={getFalseNextStepId()}
              onChange={(e) => updateFalseActionData("next_step_id", e.target.value ? Number(e.target.value) : "")}
              className="bg-white border-red-200 focus:border-red-400 text-sm"
            />
          </div>
        )}
        
        <div>
          <label className="block text-xs font-medium text-red-600 mb-1.5">
            {action === "complete_success" ? "Success Message" : "Error Message"}
          </label>
          <Input
            placeholder={action === "complete_success" ? "Enter success message" : "Enter error message"}
            value={getFalseActionMessage()}
            onChange={(e) => {
              const key = action === "complete_success" ? "message" : "error";
              updateFalseActionData(key, e.target.value);
            }}
            className="bg-white border-red-200 focus:border-red-400 text-sm"
          />
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Stage Name
        </label>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Left Hand Side (LHS)
            </label>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Operation
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
              placeholder="Select Operator"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Right Hand Side (RHS)
            </label>
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

          {/* If True Action Section */}
          <div className="border border-green-200 rounded-xl p-4 bg-green-50/50">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <span className="text-sm font-semibold text-green-700">If True (Condition Met)</span>
              {getActionIcon(stageData.ifTrueAction)}
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-green-700 mb-1.5">Action</label>
                <SharedSelect
                  options={actionOptions}
                  value={stageData.ifTrueAction}
                  onChange={(value) => updateTrueActionData("action", String(value))}
                  placeholder="Select Action"
                />
              </div>
              
              {renderTrueActionFields()}
            </div>
          </div>

          {/* If False Action Section */}
          <div className="border border-red-200 rounded-xl p-4 bg-red-50/50">
            <div className="flex items-center gap-2 mb-3">
              <XCircle className="w-5 h-5 text-red-500" />
              <span className="text-sm font-semibold text-red-600">If False (Condition Not Met)</span>
              {getActionIcon(stageData.ifFalseAction)}
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-red-600 mb-1.5">Action</label>
                <SharedSelect
                  options={actionOptions}
                  value={stageData.ifFalseAction}
                  onChange={(value) => updateFalseActionData("action", String(value))}
                  placeholder="Select Action"
                />
              </div>
              
              {renderFalseActionFields()}
            </div>
          </div>

          {/* Failure Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Failure Message (Optional)
            </label>
            <Input
              placeholder="Enter failure message for this step"
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
          Update Stage
        </button>
        <button
          onClick={deleteSelectedNode}
          className="px-4 py-2.5 bg-red-50 text-red-500 rounded-xl text-sm font-medium hover:bg-red-100 transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  );
};
