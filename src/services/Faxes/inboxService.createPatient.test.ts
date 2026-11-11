import { beforeEach, describe, expect, it, vi } from 'vitest';
import apiClient from '@/api/client';
import {
  fetchCreatePatientAutomationStatus,
  fetchCreatePatientDraft,
  retryCreatePatientAutomation,
  saveCreatePatientDraft,
  submitCreatePatientAutomation
} from './inboxService';

vi.mock('@/api/client', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn()
  }
}));

describe('inboxService create-patient APIs', () => {
  const apiClientMock = apiClient as unknown as {
    get: ReturnType<typeof vi.fn>;
    post: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches create-patient draft', async () => {
    apiClientMock.get.mockResolvedValue({ data: { first_name: 'John' } });

    const result = await fetchCreatePatientDraft(123, 'portal');

    expect(apiClientMock.get).toHaveBeenCalledWith('/referrals/portal/123/create-patient/');
    expect(result).toEqual({ first_name: 'John' });
  });

  it('saves create-patient draft', async () => {
    apiClientMock.post.mockResolvedValue({ data: { last_name: 'Doe' } });

    const result = await saveCreatePatientDraft(44, 'fax', { last_name: 'Doe' });

    expect(apiClientMock.post).toHaveBeenCalledWith(
      '/referrals/fax/44/create-patient/',
      { last_name: 'Doe' },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    expect(result).toEqual({ last_name: 'Doe' });
  });

  it('submits create-patient automation', async () => {
    apiClientMock.post.mockResolvedValue({ data: { status: 'queued', id: 99 } });

    const result = await submitCreatePatientAutomation(99, 'portal', {
      run_duplicate_check: true
    });

    expect(apiClientMock.post).toHaveBeenCalledWith(
      '/referrals/portal/99/create-patient/submit/',
      { run_duplicate_check: true },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    expect(result).toEqual({ status: 'queued', id: 99 });
  });

  it('retries create-patient automation', async () => {
    apiClientMock.post.mockResolvedValue({ data: { status: 'queued' } });

    const result = await retryCreatePatientAutomation(99, 'portal');

    expect(apiClientMock.post).toHaveBeenCalledWith(
      '/referrals/portal/99/create-patient/automation/retry/'
    );
    expect(result).toEqual({ status: 'queued' });
  });

  it('fetches create-patient automation status', async () => {
    apiClientMock.get.mockResolvedValue({ data: { status: 'processing', id: 4 } });

    const result = await fetchCreatePatientAutomationStatus(4, 'fax');

    expect(apiClientMock.get).toHaveBeenCalledWith(
      '/referrals/fax/4/create-patient/automation/status/'
    );
    expect(result).toEqual({ status: 'processing', id: 4 });
  });
});
