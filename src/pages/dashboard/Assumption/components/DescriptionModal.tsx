import SharedModal from "@/shared/SharedModal";
import type { AssumptionTemplate } from "./types";

interface DescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  assumption: AssumptionTemplate | null;
}

export const DescriptionModal = ({ isOpen, onClose, assumption }: DescriptionModalProps) => {
  return (
    <SharedModal isOpen={isOpen} onClose={onClose} title="Assumption Description" size="md">
      <div className="p-4">
        {assumption && (
          <div className="space-y-4">
            <div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-900 leading-relaxed">
                  {assumption.description || "No description available"}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors">
            Close
          </button>
        </div>
      </div>
    </SharedModal>
  );
};
