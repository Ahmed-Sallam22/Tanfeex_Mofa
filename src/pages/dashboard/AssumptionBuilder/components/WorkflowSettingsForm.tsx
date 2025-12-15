import { Input, Toggle } from "@/components/ui";
import { SharedSelect } from "@/shared/SharedSelect";
import { executionPointOptions } from "./constants";
import type { WorkflowData } from "./types";

interface WorkflowSettingsFormProps {
  workflowData: WorkflowData;
  setWorkflowData: React.Dispatch<React.SetStateAction<WorkflowData>>;
  buildWorkflowJSON: () => void;
  isSaving?: boolean;
}

export const WorkflowSettingsForm = ({
  workflowData,
  setWorkflowData,
  buildWorkflowJSON,
  isSaving = false,
}: WorkflowSettingsFormProps) => {
  return (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
        <Input
          placeholder="Enter Segment name"
          value={workflowData.name}
          onChange={(e) =>
            setWorkflowData((prev) => ({
              ...prev,
              name: e.target.value,
            }))
          }
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Execution Point</label>
        <SharedSelect
          options={executionPointOptions}
          value={workflowData.executionPoint}
          onChange={(value) =>
            setWorkflowData((prev) => ({
              ...prev,
              executionPoint: String(value),
            }))
          }
          placeholder="Select Execution Point"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
        <textarea
          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00B7AD] focus:border-transparent resize-none bg-white"
          rows={4}
          placeholder="Enter Segment Description"
          value={workflowData.description}
          onChange={(e) =>
            setWorkflowData((prev) => ({
              ...prev,
              description: e.target.value,
            }))
          }
        />
      </div>

      <div className="flex items-center justify-between pt-2">
        <span className="text-sm font-medium text-gray-700">Set as Default Workflow</span>
        <Toggle
          id="defaultWorkflow"
          label=""
          checked={workflowData.isDefault}
          onChange={(checked) =>
            setWorkflowData((prev) => ({
              ...prev,
              isDefault: checked,
            }))
          }
        />
      </div>

      {/* Save Button */}
      <div className="pt-4">
        <button
          onClick={() => {
            buildWorkflowJSON();
          }}
          disabled={isSaving}
          className="w-full px-4 py-2.5 bg-[#00B7AD] text-white rounded-xl text-sm font-medium hover:bg-[#009B92] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
          {isSaving ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            </>
          ) : (
            "Save Workflow"
          )}
        </button>
      </div>
    </div>
  );
};
