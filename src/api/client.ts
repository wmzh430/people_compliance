import axios from 'axios';
import { broadcastSessionLogout, createSessionTabId } from '@/auth/sessionSync';
import { backendConfig } from '@/config';
import {
  isBackendAvailabilityError,
  markBackendHealthy,
  markBackendUnhealthy
} from '@/api/backendHealth';

const MAINTENANCE_PATH = '/error/maintenance';
const MAINTENANCE_STATUSES = new Set([502, 503, 504]);
const LOGIN_PATH = '/auth/login';
const AUTH_STORAGE_KEY = 'auth';
const CURRENT_USER_STORAGE_KEY = 'currentUser';
// These endpoints should not recursively trigger refresh attempts. Login/logout/reset
// either establish or intentionally tear down auth state, so a 401 here is terminal.
const PUBLIC_AUTH_ENDPOINTS = new Set([
  '/auth/login/',
  '/auth/logout/',
  '/auth/forgot-password/',
  '/auth/reset-password/'
]);

// This promise is intentionally module-scoped so a single browser tab collapses multiple
// simultaneous 401s into one refresh request. It does not coordinate across tabs, so two
// different tabs can still race each other when they refresh the same cookie session.
let refreshPromise: Promise<void> | null = null;
let hasTriggeredLoginRedirect = false;
const clientSessionTabId = createSessionTabId();
// Use a dedicated client for refresh so the request is not affected by any global axios
// interceptors or future request decoration. Refresh must be the cleanest possible call:
// send cookies, do not attach bearer headers, and do not recurse into this interceptor chain.
const refreshClient = axios.create({
  withCredentials: true
});

const clearLegacyAuthState = () => {
  localStorage.removeItem(AUTH_STORAGE_KEY);
};

const clearSessionState = () => {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
};

const redirectToLogin = () => {
  if (hasTriggeredLoginRedirect) {
    return;
  }

  hasTriggeredLoginRedirect = true;
  clearSessionState();

  if (window.location.pathname !== LOGIN_PATH) {
    window.location.replace(LOGIN_PATH);
  }
};

const shouldSkipRefresh = (url?: string) => {
  if (!url) {
    return false;
  }

  if (url.includes('/auth/token/refresh/')) {
    return true;
  }

  return Array.from(PUBLIC_AUTH_ENDPOINTS).some((endpoint) => url.includes(endpoint));
};

const logUnauthorized = (error: any, context: string) => {
  // const request = error?.config;
  // console.info('[apiClient] 401 Unauthorized', {
  //   context,
  //   method: request?.method,
  //   url: request?.url,
  //   status: error?.response?.status,
  //   retry: Boolean(request?._retry)
  // });
};

const refreshSession = async () => {
  if (!refreshPromise) {
    refreshPromise = refreshClient
      .post(`${backendConfig.baseUrl}/auth/token/refresh/`, {}, { withCredentials: true })
      .then(() => {
        // Legacy localStorage auth should stay empty in the cookie-based model. If an older
        // build or user action repopulated it, clear it after a successful refresh so future
        // requests do not accidentally drift back to bearer-token auth.
        clearLegacyAuthState();
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
};

// Shared API client for backend calls. Cookies carry auth tokens.
const apiClient = axios.create({
  baseURL: backendConfig.baseUrl,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
});

apiClient.interceptors.request.use((config) => {
  // This client uses cookie-based auth. Do not auto-attach legacy bearer tokens
  // from localStorage, because backend auth prefers Authorization over cookies.
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    if (isBackendAvailabilityError(error)) {
      markBackendUnhealthy();
    }

    if (MAINTENANCE_STATUSES.has(status)) {
      if (window.location.pathname !== MAINTENANCE_PATH) {
        window.location.replace(MAINTENANCE_PATH);
      }
      return Promise.reject(error);
    }

    const originalRequest = error.config;
    const requestUrl = originalRequest?.url;

    if (status === 401) {
      logUnauthorized(error, 'response');
    }

    // 401 handling policy:
    // 1. Skip refresh for auth bootstrap/end-session endpoints.
    // 2. Attempt one refresh for regular application requests.
    // 3. Replay the original request exactly once against the renewed cookie session.
    // 4. If refresh fails, clear client-side session state and redirect to login.
    if (
      status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !shouldSkipRefresh(requestUrl)
    ) {
      originalRequest._retry = true;

      try {
        // Refresh via cookie once, then replay failed requests against the renewed session.
        await refreshSession();

        if (originalRequest.headers?.Authorization) {
          // Defensive cleanup: if any caller manually attached Authorization, remove it before
          // replay so backend cookie auth remains the single source of truth.
          delete originalRequest.headers.Authorization;
        }

        return apiClient(originalRequest);
      } catch (refreshError) {
        logUnauthorized(refreshError, 'refresh-failed');
        broadcastSessionLogout(clientSessionTabId, 'session-invalidated');
        redirectToLogin();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use((response) => {
  markBackendHealthy();
  return response;
});

export default apiClient;
