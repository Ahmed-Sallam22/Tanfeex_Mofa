import { createApi } from '@reduxjs/toolkit/query/react';
import { customBaseQuery } from './baseQuery';

// Types for Validation Workflow
export interface ValidationWorkflow {
  id: number;
  name: string;
  description: string;
  execution_point: string;
  status: 'draft' | 'active' | 'inactive';
  is_default: boolean;
  created_by: number;
  created_by_username: string;
  created_at: string;
  updated_at: string;
}

export interface ValidationWorkflowListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: ValidationWorkflow[];
}

export interface CreateValidationWorkflowRequest {
  name: string;
  description: string;
  execution_point: string;
  status: 'draft' | 'active' | 'inactive';
  step_ids?: number[];
}

export interface UpdateValidationWorkflowRequest {
  name?: string;
  description?: string;
  execution_point?: string;
  status?: 'draft' | 'active' | 'inactive';
  step_ids?: number[];
}

// Execution Point Types
export interface ExecutionPoint {
  code: string;
  name: string;
  description: string;
  category: string;
  allowed_datasources: string[];
}

export interface ExecutionPointsResponse {
  execution_points: ExecutionPoint[];
  total_count: number;
}

// Status options for the select dropdown
export const statusOptions = [
  { value: 'draft', label: 'Draft' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

export const validationWorkflowApi = createApi({
  reducerPath: 'validationWorkflowApi',
  baseQuery: customBaseQuery,
  tagTypes: ['ValidationWorkflow', 'ExecutionPoints'],
  endpoints: (builder) => ({
    // Get execution points
    getExecutionPoints: builder.query<ExecutionPointsResponse, void>({
      query: () => ({
        url: '/validations/execution-points/',
        method: 'GET',
      }),
      providesTags: ['ExecutionPoints'],
    }),

    // Get all validation workflows
    getValidationWorkflows: builder.query<ValidationWorkflowListResponse, void>({
      query: () => ({
        url: '/validations/workflows/',
        method: 'GET',
      }),
      providesTags: ['ValidationWorkflow'],
    }),

    // Get single validation workflow by ID
    getValidationWorkflow: builder.query<ValidationWorkflow, number>({
      query: (id) => ({
        url: `/validations/workflows/${id}/`,
        method: 'GET',
      }),
      providesTags: (_result, _error, id) => [{ type: 'ValidationWorkflow', id }],
    }),

    // Create new validation workflow
    createValidationWorkflow: builder.mutation<ValidationWorkflow, CreateValidationWorkflowRequest>({
      query: (body) => ({
        url: '/validations/workflows/',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['ValidationWorkflow'],
    }),

    // Update validation workflow
    updateValidationWorkflow: builder.mutation<ValidationWorkflow, { id: number; body: UpdateValidationWorkflowRequest }>({
      query: ({ id, body }) => ({
        url: `/validations/workflows/${id}/`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['ValidationWorkflow'],
    }),

    // Delete validation workflow
    deleteValidationWorkflow: builder.mutation<void, number>({
      query: (id) => ({
        url: `/validations/workflows/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['ValidationWorkflow'],
    }),
  }),
});

export const {
  useGetExecutionPointsQuery,
  useGetValidationWorkflowsQuery,
  useGetValidationWorkflowQuery,
  useCreateValidationWorkflowMutation,
  useUpdateValidationWorkflowMutation,
  useDeleteValidationWorkflowMutation,
} = validationWorkflowApi;
