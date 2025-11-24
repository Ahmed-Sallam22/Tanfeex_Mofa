import { createApi } from '@reduxjs/toolkit/query/react';
import { customBaseQuery } from './baseQuery';

export interface TransferItem {
  transaction_id: number;
  transaction_date: string;
  amount: number;
  status: string;
  requested_by: string;
  user_id: number;
  request_date: string;
  code: string;
  notes:string;
  budget_control: string;
  gl_posting_status: string;
  approvel_1: string;
  approvel_2: string;
  approvel_3: string;
  approvel_4: string;
  approvel_1_date: string | null;
  approvel_2_date: string | null;
  approvel_3_date: string | null;
  approvel_4_date: string | null;
  status_level: number;
  attachment: string;
  fy: string | null;
  group_id: number | null;
  interface_id: number | null;
  reject_group_id: number | null;
  reject_interface_id: number | null;
  approve_group_id: number | null;
  approve_interface_id: number | null;
  report: string;
  type: string;
}

export interface TransferListResponse {
  results: TransferItem[];
  count: number;
  next: string | null;
  previous: string | null;
}

export interface TransferListParams {
  page?: number;
  page_size?: number;
  code?: string;
}

export interface CreateTransferRequest {
  transaction_date: string;
  budget_control: string;
  notes: string;
  type: string;
}

export interface UpdateTransferRequest {
  transaction_date: string;
  notes: string;
  type: string;
}

export interface TransferResponse {
  transaction_id: number;
  message: string;
}

export interface TransferStatusResponse {
  transaction_id: number;
  workflow_status: string;
  stages: {
    order_index: number;
    name: string;
    decision_policy: string;
    status: string;
  }[];
}

export interface OracleStatusStep {
  step_number: number;
  step_name: string;
  status: string;
  message: string;
  request_id: string | null;
  document_id: string | null;
  group_id: string | null;
  created_at: string;
  completed_at: string;
}

export interface OracleActionGroup {
  action_type: string;
  steps: OracleStatusStep[];
}

export interface OracleStatusResponse {
  transaction_id: string;
  total_records: number;
  action_groups: OracleActionGroup[];
}

export const transferApi = createApi({
  reducerPath: 'transferApi',
  baseQuery: customBaseQuery,
  tagTypes: ['Transfer'],
  endpoints: (builder) => ({
    getTransferList: builder.query<TransferListResponse, TransferListParams>({
      query: ({ page = 1, page_size = 10, code = 'FAR' } = {}) => ({
        url: `/budget/transfers/list/`,
        method: 'GET',
        params: {
          page,
          page_size,
          code,
        },
      }),
      providesTags: ['Transfer'],
    }),
    createTransfer: builder.mutation<TransferResponse, CreateTransferRequest>({
      query: (body) => ({
        url: `/budget/transfers/create/`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Transfer'],
    }),
    updateTransfer: builder.mutation<TransferResponse, { id: number; body: UpdateTransferRequest }>({
      query: ({ id, body }) => ({
        url: `/budget/transfers/${id}/update/`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Transfer'],
    }),
    deleteTransfer: builder.mutation<TransferResponse, number>({
      query: (id) => ({
        url: `/budget/transfers/${id}/delete/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Transfer'],
    }),
    getTransferStatus: builder.query<TransferStatusResponse, number>({
      query: (transactionId) => ({
        url: `/budget/transfers/status/?transaction_id=${transactionId}`,
        method: 'GET',
      }),
      providesTags: ['Transfer'],
    }),
    getOracleStatus: builder.query<OracleStatusResponse, number>({
      query: (transactionId) => ({
        url: `/budget/transfers/Oracle/Status/?transaction_id=${transactionId}`,
        method: 'GET',
      }),
    }),
  }),
});

export const { 
  useGetTransferListQuery,
  useCreateTransferMutation,
  useUpdateTransferMutation,
  useDeleteTransferMutation,
  useGetTransferStatusQuery,
  useGetOracleStatusQuery,
} = transferApi;
