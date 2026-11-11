import { beforeEach, describe, expect, it, vi } from 'vitest';
import apiClient from '@/api/client';
import { fetchAppMetadata, fetchLastSync, fetchLastSyncSent } from './coreService';

vi.mock('@/api/client', () => ({
  default: {
    get: vi.fn()
  }
}));

describe('coreService', () => {
  const apiClientMock = apiClient as unknown as {
    get: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches app metadata', async () => {
    apiClientMock.get.mockResolvedValue({
      data: { APP_ENV: 'prod', APP_VERSION: '2026.04.27.0', GIT_SHA: 'abcdef123456' }
    });

    const result = await fetchAppMetadata();

    expect(apiClientMock.get).toHaveBeenCalledWith('/core/app-metadata/');
    expect(result).toEqual({
      APP_ENV: 'prod',
      APP_VERSION: '2026.04.27.0',
      GIT_SHA: 'abcdef123456'
    });
  });

  it('fetches last task sync timestamps', async () => {
    apiClientMock.get.mockResolvedValue({ data: { tasks: [] } });

    const result = await fetchLastSync('crawler-a');

    expect(apiClientMock.get).toHaveBeenCalledWith('/core/celery/last-tasks');
    expect(result).toEqual({ tasks: [] });
  });

  it('fetches successful task timestamps', async () => {
    apiClientMock.get.mockResolvedValue({ data: { tasks: ['a'] } });

    const result = await fetchLastSyncSent('crawler-b');

    expect(apiClientMock.get).toHaveBeenCalledWith('/core/celery/successful-tasks', {});
    expect(result).toEqual({ tasks: ['a'] });
  });
});
