import { createApi } from '@reduxjs/toolkit/query/react';
import { customBaseQuery } from './baseQuery';

export interface TransferDetail {
  transfer_id: number;
  approved_budget: string;
  available_budget: string;
  from_center: string;
  to_center: string;
  reason: string | null;
  account_code: number;
  account_name: string;
  project_code: string;
  project_name: string;
  cost_center_code: number;
  cost_center_name: string;
  done: number;
  encumbrance: string;
  actual: string;
  file: string | null;
  transaction: number;
  validation_errors?: string[];
  // New financial fields
  budget_adjustments?: string;
  commitments?: string;
  expenditures?: string;
  initial_budget?: string;
  obligations?: string;
  other_consumption?: string;
}

export interface TransferDetailsSummary {
  transaction_id: string;
  total_transfers: number;
  total_from: number;
  total_to: number;
  balanced: boolean;
  status: string;
  period: string;
}

export interface TransferDetailsStatus {
  status: string;
}

export interface TransferDetailsResponse {
  summary: TransferDetailsSummary;
  transfers: TransferDetail[];
  status: TransferDetailsStatus;
}

export interface UpdateTransferDetailRequest {
  transfer_id: number;
  from_center?: string;
  to_center?: string;
  cost_center_code?: number;
}

export interface UpdateTransferDetailResponse {
  success: boolean;
  message?: string;
}

export interface CreateTransferData {
  transaction: number;
  approved_budget: number;
  available_budget: number;
  to_center: number;
  encumbrance: number;
  actual: number;
  done: number;
  from_center: number;
  [key: string]: string | number; // Support dynamic segment fields (e.g., segment5, segment9, etc.)
}

export interface CreateTransferRequest {
  transfers: CreateTransferData[];
}

export interface CreateTransferResponse {
  success: boolean;
  message?: string;
  created_transfers?: number[];
}

export interface SubmitTransferRequest {
  transaction: number;
}

export interface SubmitTransferResponse {
  success: boolean;
  message?: string;
}

export interface ExcelUploadRequest {
  file: File;
  transaction: number;
}

export interface ExcelUploadResponse {
  success: boolean;
  message?: string;
  created_transfers?: number[];
}

export interface ReopenTransferRequest {
  transaction: number;
  action: string;
}

export interface ReopenTransferResponse {
  success: boolean;
  message?: string;
}

export interface FinancialDataParams {
  segments: Record<string, string | number>; // Dynamic segments (e.g., { Segment5: "100", Segment9: "200" })
}

export interface FinancialDataRecord {
  id: number;
  segment5?: string;
  segment9?: string;
  segment11?: string;
  budget: number;
  encumbrance: number;
  funds_available: number;
  commitment: number;
  obligation: number;
  actual: number;
  other: number;
  period_name: string;
  control_budget_name: string;
  created_at?: string;
}

export interface FinancialDataResponse {
  message: string;
  count: number;
  total_records_in_db?: number;
  filters_applied?: Record<string, string>;
  data: FinancialDataRecord[]; // Direct array, not nested
}

export const transferDetailsApi = createApi({
  reducerPath: 'transferDetailsApi',
  baseQuery: customBaseQuery,
  tagTypes: ['TransferDetails'],
  endpoints: (builder) => ({
    getTransferDetails: builder.query<TransferDetailsResponse, string>({
      query: (transactionId) => ({
        url: `/transfers/`,
        method: 'GET',
        params: {
          transaction: transactionId,
        },
      }),
      providesTags: (_result, _error, transactionId) => [
        { type: 'TransferDetails', id: transactionId }
      ],
    }),
    updateTransferDetail: builder.mutation<UpdateTransferDetailResponse, UpdateTransferDetailRequest>({
      query: ({ transfer_id, ...body }) => ({
        url: `/transfers/${transfer_id}/`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_result, _error, { transfer_id }) => [
        { type: 'TransferDetails', id: 'LIST' },
        { type: 'TransferDetails', id: transfer_id.toString() }
      ],
    }),
    createTransfer: builder.mutation<CreateTransferResponse, CreateTransferData[]>({
      query: (transfers) => ({
        url: `/transfers/create/`,
        method: 'POST',
        body: transfers,
      }),
      invalidatesTags: ['TransferDetails'],
    }),
    submitTransfer: builder.mutation<SubmitTransferResponse, SubmitTransferRequest>({
      query: (body) => ({
        url: `/transfers/submit/`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['TransferDetails'],
    }),
    getFinancialData: builder.query<FinancialDataResponse, FinancialDataParams>({
      query: ({ segments }) => {
        // Build query params from dynamic segments
        const params = new URLSearchParams();
        Object.entries(segments).forEach(([key, value]) => {
          params.append(key, value.toString());
        });
        
        return {
          url: `/accounts-entities/segments/get_segment_fund/?${params.toString()}`,
          method: 'GET',
        };
      },
      providesTags: ['TransferDetails'],
    }),
    uploadExcel: builder.mutation<ExcelUploadResponse, ExcelUploadRequest>({
      query: ({ file, transaction }) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('transaction', transaction.toString());
        
        return {
          url: `/transfers/excel-upload/`,
          method: 'POST',
          body: formData,
          formData: true,
        };
      },
      invalidatesTags: ['TransferDetails'],
    }),
    reopenTransfer: builder.mutation<ReopenTransferResponse, ReopenTransferRequest>({
      query: (body) => ({
        url: `/transfers/reopen/`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['TransferDetails'],
    }),
  }),
});

export const {
  useGetTransferDetailsQuery,
  useUpdateTransferDetailMutation,
  useCreateTransferMutation,
  useSubmitTransferMutation,
  useGetFinancialDataQuery,
  useUploadExcelMutation,
  useReopenTransferMutation,
} = transferDetailsApi;
