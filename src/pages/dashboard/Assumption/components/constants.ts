import type { AssumptionTemplate } from "./types";

// Dummy data
export const dummyAssumptions: AssumptionTemplate[] = [
  {
    id: 1,
    code: "ASM-001",
    name: "Budget Transfer Assumption",
    transfer_type: "Internal",
    description:
      "This assumption validates budget transfers between internal departments ensuring proper authorization and fund availability.",
    version: 1,
    is_active: true,
  },
  {
    id: 2,
    code: "ASM-002",
    name: "External Payment Assumption",
    transfer_type: "External",
    description:
      "Validates external payment transfers including vendor payments, contractor fees, and external obligations.",
    version: 2,
    is_active: true,
  },
  {
    id: 3,
    code: "ASM-003",
    name: "Fund Adjustment Assumption",
    transfer_type: "Adjustment",
    description: "Handles fund adjustments for corrections, reallocations, and budget modifications.",
    version: 1,
    is_active: false,
  },
  {
    id: 4,
    code: "ASM-004",
    name: "Project Transfer Assumption",
    transfer_type: "Project",
    description: "Manages transfers between different projects ensuring compliance with project budgets and timelines.",
    version: 3,
    is_active: true,
  },
  {
    id: 5,
    code: "ASM-005",
    name: "Emergency Transfer Assumption",
    transfer_type: "Emergency",
    description: "Expedited transfer process for emergency situations with relaxed approval requirements.",
    version: 1,
    is_active: true,
  },
];

// Transfer type options
export const transferTypeOptions = [
  { value: "Internal", label: "Internal" },
  { value: "External", label: "External" },
  { value: "Adjustment", label: "Adjustment" },
  { value: "Project", label: "Project" },
  { value: "Emergency", label: "Emergency" },
];
