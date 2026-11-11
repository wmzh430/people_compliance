import apiClient from '@/api/client';
import { AuthModel, UserModel } from '@/auth';
import axios from 'axios';
import { backendConfig } from '@/config';

const backendUrl = backendConfig.baseUrl;

// Auth login via backend; expects server to set session cookies (withCredentials).
export const login = async (
  email: string,
  password: string
): Promise<{ auth: AuthModel; user: UserModel }> => {
  const response = await apiClient.post(
    '/auth/login/',
    { username: email, password },
    {
      withCredentials: true
    }
  );

  // TODO(security): If access/refresh tokens are required, return/store them here explicitly.
  return {
    auth: { access: '', refresh: '' },
    user: response.data.user
  };
};

// Fetch the current authenticated user from the backend session.
export const getCurrentUser = async (): Promise<{ user: UserModel }> => {
  const response = await apiClient.get('/auth/me/');
  return {
    user: response.data.user
  };
};

// Invalidate the session on the backend.
export const logout = async (payload?: { reason?: string }): Promise<void> => {
  await apiClient.post('/auth/logout/', payload ?? {});
};

// Refresh a JWT access token using a refresh token (non-cookie flow).
export const refreshToken = async (refresh_token: string): Promise<any> => {
  const response = await axios.post(`${backendUrl}/auth/token/refresh/`, {
    refresh: refresh_token
  });
  return {
    auth: { access: response.data.access, refresh: response.data.refresh }
  };
};

// Request a password reset link via email (forgot-password flow).
export const requestPasswordResetLink = async (email: string): Promise<void> => {
  await apiClient.post('/auth/forgot-password/', { email });
};

// Reset password using the token from the email link.
export const resetPassword = async (
  uid: string,
  token: string,
  newPassword: string,
  confirmPassword: string
): Promise<void> => {
  await apiClient.post('/auth/reset-password/', {
    uid,
    token,
    new_password: newPassword,
    confirm_password: confirmPassword
  });
};
