import { createApi } from '@reduxjs/toolkit/query/react';
import { customBaseQuery } from './baseQuery';

export interface UserDisplay {
  id: number;
  username: string;
  role: string;
}

export interface AuditLog {
  audit_id: number;
  user: number;
  username: string;
  user_display: UserDisplay;
  action_type: string;
  action_description: string;
  severity: string;
  endpoint: string;
  request_method: string;
  ip_address: string;
  object_repr: string | null;
  status: string;
  error_message: string | null;
  timestamp: string;
  duration_ms: number | null;
  module: string | null;
  changes: Record<string, unknown>;
  metadata_dict: {
    status_code?: number;
    query_params?: Record<string, string[]>;
    [key: string]: unknown;
  };
}

export interface AuditLogsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: AuditLog[];
}

export interface GetLogsParams {
  page?: number;
  page_size?: number;
  search?: string;
  action_type?: string;
  severity?: string;
  status?: string;
  module?: string;
  username?: string;
  start_date?: string;
  end_date?: string;
}

export const logsApi = createApi({
  reducerPath: 'logsApi',
  baseQuery: customBaseQuery,
  tagTypes: ['Logs'],
  endpoints: (builder) => ({
    // Get audit logs
    getAuditLogs: builder.query<AuditLogsResponse, GetLogsParams>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        
        if (params.page) queryParams.append('page', params.page.toString());
        if (params.page_size) queryParams.append('page_size', params.page_size.toString());
        if (params.search) queryParams.append('search', params.search);
        if (params.action_type) queryParams.append('action_type', params.action_type);
        if (params.severity) queryParams.append('severity', params.severity);
        if (params.status) queryParams.append('status', params.status);
        if (params.module) queryParams.append('module', params.module);
        if (params.username) queryParams.append('username', params.username);
        if (params.start_date) queryParams.append('start_date', params.start_date);
        if (params.end_date) queryParams.append('end_date', params.end_date);

        const queryString = queryParams.toString();
        return {
          url: `/auth/audit/logs/${queryString ? `?${queryString}` : ''}`,
          method: 'GET',
        };
      },
      providesTags: ['Logs'],
    }),

    // Get single audit log details
    getAuditLogDetail: builder.query<AuditLog, number>({
      query: (auditId) => ({
        url: `/auth/audit/logs/${auditId}/`,
        method: 'GET',
      }),
      providesTags: (_result, _error, auditId) => [{ type: 'Logs', id: auditId }],
    }),
  }),
});

export const {
  useGetAuditLogsQuery,
  useGetAuditLogDetailQuery,
  useLazyGetAuditLogsQuery,
} = logsApi;
