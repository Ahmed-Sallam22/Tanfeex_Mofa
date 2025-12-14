import type { TableColumn } from "@/shared/SharedTable";
import type { AssumptionTemplate } from "./types";

export const getAssumptionColumns = (onDescriptionClick: (assumption: AssumptionTemplate) => void): TableColumn[] => [
  {
    id: "code",
    header: "Code",
    render: (_, row) => {
      const assumption = row as unknown as AssumptionTemplate;
      return <span className="text-sm text-gray-900 font-medium">{assumption.code}</span>;
    },
  },
  {
    id: "name",
    header: "Name",
    render: (_, row) => {
      const assumption = row as unknown as AssumptionTemplate;
      return <span className="text-sm text-gray-900">{assumption.name}</span>;
    },
  },
  {
    id: "transfer_type",
    header: "Transfer Type",
    render: (_, row) => {
      const assumption = row as unknown as AssumptionTemplate;
      return <span className="text-sm text-gray-900">{assumption.transfer_type}</span>;
    },
  },
  {
    id: "description",
    header: "Description",
    render: (_, row) => {
      const assumption = row as unknown as AssumptionTemplate;

      return (
        <button
          onClick={() => onDescriptionClick(assumption)}
          className="text-sm text-gray-900 bg-gray-100 p-2 rounded-md truncate max-w-xs hover:bg-gray-200 transition-colors cursor-pointer text-left"
          title="Click to view full description">
          Description
        </button>
      );
    },
  },
  {
    id: "version",
    header: "Version",
    render: (_, row) => {
      const assumption = row as unknown as AssumptionTemplate;
      return <span className="text-sm text-gray-900">v.{assumption.version}</span>;
    },
  },
  {
    id: "is_active",
    header: "Status",
    render: (_, row) => {
      const assumption = row as unknown as AssumptionTemplate;
      return (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            assumption.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}>
          {assumption.is_active ? "Active" : "Inactive"}
        </span>
      );
    },
  },
];
