import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type { RootState } from '../app/store';
import { showSessionExpired, setCredentials } from '../features/auth/authSlice';

const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_BASE_URL2 || '/api',
  prepareHeaders: (headers, { getState }) => {
    const state = getState() as RootState;
    const token = state.auth?.tokens?.token;
    if (token) headers.set('Authorization', `Bearer ${token}`);
    return headers;
  },
});

export const customBaseQuery: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);
  
  if (result.error && result.error.status === 401) {
    const state = api.getState() as RootState;
    const refreshToken = state.auth?.tokens?.refresh;
    
    if (refreshToken && state.auth.isAuthenticated) {
      // Try to refresh the token
      const refreshResult = await baseQuery(
        {
          url: '/auth/token-refresh/',
          method: 'POST',
          body: { refresh: refreshToken },
        },
        api,
        extraOptions
      );
      
      if (refreshResult.data) {
        const refreshData = refreshResult.data as { token: string; refresh: string };
        
        // Update tokens in the store
        const currentUser = state.auth.user;
        const currentUserLevel = state.auth.userLevel;
        const currentUserLevelName = state.auth.user_level_name;
        
        if (currentUser && currentUserLevel !== null) {
          api.dispatch(setCredentials({
            data: currentUser,
            user_level: currentUserLevel,
            user_level_name: currentUserLevelName || '',
            message: 'Token refreshed',
            token: refreshData.token,
            refresh: refreshData.refresh,
          }));
          
          // Retry the original request with new token
          result = await baseQuery(args, api, extraOptions);
        }
      } else {
        // Refresh failed, show session expired modal
        api.dispatch(showSessionExpired());
      }
    } else {
      // No refresh token available, show session expired modal
      if (state.auth.isAuthenticated) {
        api.dispatch(showSessionExpired());
      }
    }
  }
  
  // if (result.error && result.error.status !== 401) {
  //   // Show error toast for other errors
  //   const message = (result.error.data as { message?: string })?.message || 'An error occurred';
  //   toast.error(message);
  // }
  
  return result;
};
