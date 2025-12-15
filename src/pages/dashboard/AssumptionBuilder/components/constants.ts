import type { SelectOption } from "@/shared/SharedSelect";

// Operator options for conditions
export const operatorOptions: SelectOption[] = [
  { value: "==", label: "Equal (==)" },
  { value: "!=", label: "Not Equal (!=)" },
  { value: ">", label: "Greater Than (>)" },
  { value: "<", label: "Less Than (<)" },
  { value: ">=", label: "Greater or Equal (>=)" },
  { value: "<=", label: "Less or Equal (<=)" },
  { value: "contains", label: "Contains" },
  { value: "startsWith", label: "Starts With" },
  { value: "endsWith", label: "Ends With" },
];

// Data type options
export const dataTypeOptions: SelectOption[] = [
  { value: "text", label: "Text" },
  { value: "number", label: "Number" },
  { value: "boolean", label: "Boolean" },
  { value: "field", label: "Field Reference" },
];

// Execution point options
export const executionPointOptions: SelectOption[] = [
  { value: "before_create", label: "Before Create" },
  { value: "after_create", label: "After Create" },
  { value: "before_update", label: "Before Update" },
  { value: "after_update", label: "After Update" },
  { value: "before_delete", label: "Before Delete" },
  { value: "after_delete", label: "After Delete" },
];

// Action options for if_true_action and if_false_action
export const actionOptions: SelectOption[] = [
  { value: "proceed_to_step", label: "Proceed to Next Step" },
  { value: "complete_success", label: "Complete Success" },
  { value: "complete_failure", label: "Complete Failure" },
];
