import { beforeEach, describe, expect, it, vi } from 'vitest';
import apiClient from '@/api/client';
import axios from 'axios';
import { backendConfig } from '@/config';
import { getCurrentUser, login, logout, refreshToken } from './authService';

vi.mock('@/api/client', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn()
  }
}));

vi.mock('axios', () => ({
  default: {
    post: vi.fn()
  }
}));

describe('authService', () => {
  const apiClientMock = apiClient as unknown as {
    post: ReturnType<typeof vi.fn>;
    get: ReturnType<typeof vi.fn>;
  };
  const axiosMock = axios as unknown as {
    post: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('logs in with credentials and returns user payload', async () => {
    const user = {
      id: 1,
      email: 'user@example.com',
      username: 'user@example.com',
      first_name: 'Test',
      last_name: 'User'
    };
    apiClientMock.post.mockResolvedValue({ data: { user } });

    const result = await login('user@example.com', 'password');

    expect(apiClientMock.post).toHaveBeenCalledWith(
      '/auth/login/',
      { username: 'user@example.com', password: 'password' },
      { withCredentials: true }
    );
    expect(result).toEqual({ auth: { access: '', refresh: '' }, user });
  });

  it('fetches the current user', async () => {
    const user = { id: 2, email: 'current@example.com' };
    apiClientMock.get.mockResolvedValue({ data: { user } });

    const result = await getCurrentUser();

    expect(apiClientMock.get).toHaveBeenCalledWith('/auth/me/');
    expect(result).toEqual({ user });
  });

  it('logs out by calling the logout endpoint', async () => {
    apiClientMock.post.mockResolvedValue({ data: {} });

    await logout();

    expect(apiClientMock.post).toHaveBeenCalledWith('/auth/logout/', {});
  });

  it('passes logout metadata to the logout endpoint', async () => {
    apiClientMock.post.mockResolvedValue({ data: {} });

    await logout({ reason: 'inactivity' });

    expect(apiClientMock.post).toHaveBeenCalledWith('/auth/logout/', { reason: 'inactivity' });
  });

  it('refreshes tokens with the refresh endpoint', async () => {
    axiosMock.post.mockResolvedValue({ data: { access: 'a', refresh: 'r' } });

    const result = await refreshToken('refresh-token');

    expect(axiosMock.post).toHaveBeenCalledWith(`${backendConfig.baseUrl}/auth/token/refresh/`, {
      refresh: 'refresh-token'
    });
    expect(result).toEqual({ auth: { access: 'a', refresh: 'r' } });
  });
});
