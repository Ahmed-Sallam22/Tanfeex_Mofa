import SharedModal from "@/shared/SharedModal";
import { Input, Toggle } from "@/components/ui";
import { SharedSelect } from "@/shared/SharedSelect";
import { transferTypeOptions } from "./constants";

interface AssumptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  mode: "create" | "edit";
  code: string;
  setCode: (value: string) => void;
  name: string;
  setName: (value: string) => void;
  transferType: string;
  setTransferType: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  version: number;
  setVersion: (value: number) => void;
  isActive: boolean;
  setIsActive: (value: boolean) => void;
}

export const AssumptionModal = ({
  isOpen,
  onClose,
  onSave,
  mode,
  code,
  setCode,
  name,
  setName,
  transferType,
  setTransferType,
  description,
  setDescription,
  version,
  setVersion,
  isActive,
  setIsActive,
}: AssumptionModalProps) => {
  return (
    <SharedModal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === "create" ? "Create Assumption" : "Edit Assumption"}
      size="md">
      <>
        <div className="p-6 space-y-5 max-h-[calc(100vh-200px)] overflow-y-auto">
          {/* Code */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Code</label>
            <Input placeholder="Enter Code" value={code} onChange={(e) => setCode(e.target.value)} />
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
            <Input placeholder="Enter Assumption name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          {/* Transfer Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Transfer Type</label>
            <SharedSelect
              options={transferTypeOptions}
              value={transferType}
              onChange={(value) => setTransferType(String(value))}
              placeholder="Select Transfer Type"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00B7AD] focus:border-transparent resize-none bg-white"
              rows={4}
              placeholder="Enter Assumption Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Version */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Version</label>
            <Input
              type="number"
              placeholder="Enter Version"
              value={version}
              onChange={(e) => setVersion(Number(e.target.value))}
            />
          </div>

          {/* Is Active */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-sm font-medium text-gray-700">Active Status</span>
            <Toggle id="isActive" label="" checked={isActive} onChange={(checked) => setIsActive(checked)} />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 p-6 pt-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button
            onClick={onSave}
            className="px-4 py-2 text-sm font-medium text-white bg-[#00B7AD] rounded-md hover:bg-[#009B92] transition-colors">
            {mode === "create" ? "Create" : "Save"}
          </button>
        </div>
      </>
    </SharedModal>
  );
};
