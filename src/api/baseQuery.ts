import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
// import { toast } from 'react-hot-toast';
import type { RootState } from '../app/store';
import { clearAuth, setCredentials } from '../features/auth/authSlice';

const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_BASE_URL || '/api',
  prepareHeaders: (headers, { getState }) => {
    const state = getState() as RootState;
    const token = state.auth?.tokens?.token;
    if (token) headers.set('Authorization', `Bearer ${token}`);
    return headers;
  },
});

// Helper function to handle logout and redirect
const handleUnauthorized = (api: { dispatch: (action: unknown) => void }) => {
  // Clear all auth data from localStorage
  localStorage.removeItem('auth');
  localStorage.clear();
  
  // Clear auth state in Redux
  api.dispatch(clearAuth());
  
  // Redirect to login page
  window.location.href = '/auth/sign-in';
};

// Helper function to handle access denied
const handleAccessDenied = () => {
  // Redirect to access denied page (inside app layout)
  window.location.href = '/app/access-denied';
};

// Helper function to handle not found
const handleNotFound = () => {
  // Redirect to not found page (inside app layout)
  window.location.href = '/app/not-found';
};

export const customBaseQuery: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);
  
  // Handle 404 Not Found
  if (result.error && result.error.status === 404) {
    handleNotFound();
    return result;
  }
  
  // Handle 403 Forbidden - Access Denied
  if (result.error && result.error.status === 403) {
    handleAccessDenied();
    return result;
  }
  
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
        // Refresh failed - clear auth and redirect to login
        handleUnauthorized(api);
      }
    } else {
      // No refresh token available or not authenticated - redirect to login
      if (state.auth.isAuthenticated) {
        handleUnauthorized(api);
      }
    }
  }
  
  // if (result.error && result.error.status !== 401) {
  //   // Show error toast for other errors
  //   // const message = (result.error.data as { message?: string })?.message || 'An error occurred';
  //   // toast.error(message);
  // }
  
  return result;
};
