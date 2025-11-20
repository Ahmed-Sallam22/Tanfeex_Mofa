import { createApi } from '@reduxjs/toolkit/query/react';
import { customBaseQuery } from './baseQuery';

export interface SegmentType {
  segment_id: number;
  segment_name: string;
  segment_type: string;
  segment_type_oracle_number: number;
  segment_type_is_required: boolean;
  segment_type_has_hierarchy: boolean;
  segment_type_display_order: number;
  segment_type_status: string;
  description: string;
  total_segments: number;
}

export interface SegmentTypesResponse {
  message: string;
  total_types: number;
  data: SegmentType[];
}

export const segmentConfigurationApi = createApi({
  reducerPath: 'segmentConfigurationApi',
  baseQuery: customBaseQuery,
  tagTypes: ['SegmentTypes'],
  endpoints: (builder) => ({
    // Get all segment types
    getSegmentTypes: builder.query<SegmentTypesResponse, void>({
      query: () => ({
        url: '/accounts-entities/segment-types/',
        method: 'GET',
      }),
      providesTags: ['SegmentTypes'],
    }),

    // Create segment type (if needed in the future)
    createSegmentType: builder.mutation<SegmentType, Partial<SegmentType>>({
      query: (segmentType) => ({
        url: '/accounts-entities/segment-types/',
        method: 'POST',
        body: segmentType,
      }),
      invalidatesTags: ['SegmentTypes'],
    }),

    // Update segment type (if needed in the future)
    updateSegmentType: builder.mutation<
      SegmentType,
      { id: number; data: Partial<SegmentType> }
    >({
      query: ({ id, data }) => ({
        url: `/accounts-entities/segment-types/${id}/`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['SegmentTypes'],
    }),

    // Delete segment type (if needed in the future)
    deleteSegmentType: builder.mutation<void, number>({
      query: (id) => ({
        url: `/accounts-entities/segment-types/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['SegmentTypes'],
    }),

    // Toggle required status
    toggleSegmentRequired: builder.mutation<
      SegmentType,
      { id: number; is_required: boolean }
    >({
      query: ({ id, is_required }) => ({
        url: `/accounts-entities/segment-types/${id}/`,
        method: 'PATCH',
        body: { segment_type_is_required: is_required },
      }),
      invalidatesTags: ['SegmentTypes'],
    }),

    // Toggle hierarchy status
    toggleSegmentHierarchy: builder.mutation<
      SegmentType,
      { id: number; has_hierarchy: boolean }
    >({
      query: ({ id, has_hierarchy }) => ({
        url: `/accounts-entities/segment-types/${id}/`,
        method: 'PATCH',
        body: { segment_type_has_hierarchy: has_hierarchy },
      }),
      invalidatesTags: ['SegmentTypes'],
    }),
  }),
});

export const {
  useGetSegmentTypesQuery,
  useCreateSegmentTypeMutation,
  useUpdateSegmentTypeMutation,
  useDeleteSegmentTypeMutation,
  useToggleSegmentRequiredMutation,
  useToggleSegmentHierarchyMutation,
} = segmentConfigurationApi;
