import { createApi } from '@reduxjs/toolkit/query/react';
import { customBaseQuery } from './baseQuery';

export interface SegmentTransferData {
  segment_code: string;
  segment_alias: string;
  mapping_code: string | null;
  total_from_center: number;
  total_to_center: number;
  total_additional_fund: number;
  total_decrease_fund: number;
  transfers_as_source: number;
  transfers_as_destination: number;
  net_change: number;
  transfer_ids_as_source: number[];
  transfer_ids_as_destination: number[];
  has_transfers: boolean;
  exchange_rate: number;
  total_budget_sum: number;
  budget_adjustments_sum: number;
  funds_available_sum: number;
  actual_sum: number;
  encumbrance_sum: number;
  commitment_sum: number;
  obligation_sum: number;
  other_sum: number;
  budget_ptd_sum: number;
  initial_budget_sum: number;
}

export interface AnalyticalReportSummary {
  total_segments: number;
  segments_with_transfers: number;
  segments_without_transfers: number;
  total_segments_in_funds: number;
  grand_total_from_center: number;
  grand_total_to_center: number;
  grand_total_additional_fund: number;
  grand_total_decrease_fund: number;
  grand_total_net: number;
  grand_total_budget: number;
  grand_funds_available: number;
  grand_actual: number;
  grand_exchange_rate: number;
}

export interface AnalyticalReportPagination {
  page: number;
  page_size: number;
  total_count: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
}

export interface AnalyticalReportResponse {
  segment_type_id: number;
  segment_column: string;
  control_budget_name: string;
  pagination: AnalyticalReportPagination;
  summary: AnalyticalReportSummary;
  segments: SegmentTransferData[];
}

export interface AnalyticalReportParams {
  segment_type_id: number;
  control_budget_name: string;
  transaction_status?: string;
  page?: number;
  page_size?: number;
}

export const analyticalReportApi = createApi({
  reducerPath: 'analyticalReportApi',
  baseQuery: customBaseQuery,
  tagTypes: ['AnalyticalReport'],
  endpoints: (builder) => ({
    getAnalyticalReport: builder.query<AnalyticalReportResponse, AnalyticalReportParams>({
      query: (params: AnalyticalReportParams) => ({
        url: '/accounts-entities/segment_transfer_aggregation/',
        params: {
          segment_type_id: params.segment_type_id,
          control_budget_name: params.control_budget_name,
          transaction_status: params.transaction_status || 'approved',
          page: params.page || 1,
          page_size: params.page_size || 20,
        },
      }),
      providesTags: ['AnalyticalReport'],
    }),
  }),
});

export const { useGetAnalyticalReportQuery } = analyticalReportApi;
