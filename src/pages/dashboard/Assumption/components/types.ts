// Dummy type definition
export type AssumptionTemplate = {
  id: number;
  code: string;
  name: string;
  transfer_type: string;
  description: string;
  version: number;
  is_active: boolean;
};

export type AssumptionFormData = {
  code: string;
  name: string;
  transferType: string;
  description: string;
  version: number;
  isActive: boolean;
};
