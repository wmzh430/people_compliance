import { beforeEach, describe, expect, it, vi } from 'vitest';
import apiClient from '@/api/client';
import { fetchClinicians, fetchSingleClinician, updateClinician } from './clinicianService';

vi.mock('@/api/client', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
    patch: vi.fn()
  }
}));

describe('clinicianService', () => {
  const apiClientMock = apiClient as unknown as {
    post: ReturnType<typeof vi.fn>;
    get: ReturnType<typeof vi.fn>;
    patch: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches clinicians with filters', async () => {
    const response = { count: 1, results: [{ id: 1, first_name: 'A', last_name: 'B' }] };
    apiClientMock.post.mockResolvedValue({ data: response });

    const result = await fetchClinicians({ page: 1, search: 'smith' });

    expect(apiClientMock.post).toHaveBeenCalledWith('/clinicians/', { page: 1, search: 'smith' });
    expect(result).toEqual(response);
  });

  it('fetches a single clinician by ID', async () => {
    const clinician = { id: 9, first_name: 'Sam', last_name: 'Lee' };
    apiClientMock.get.mockResolvedValue({ data: clinician });

    const result = await fetchSingleClinician(9);

    expect(apiClientMock.get).toHaveBeenCalledWith('/clinicians/detail/9/');
    expect(result).toEqual(clinician);
  });

  it('updates a clinician record', async () => {
    const updated = { id: 5, first_name: 'Taylor', last_name: 'Fox' };
    apiClientMock.patch.mockResolvedValue({ data: updated });

    const result = await updateClinician(5, { first_name: 'Taylor' });

    expect(apiClientMock.patch).toHaveBeenCalledWith('/clinicians/5/', { first_name: 'Taylor' });
    expect(result).toEqual(updated);
  });
});
