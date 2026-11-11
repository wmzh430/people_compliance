import { beforeEach, describe, expect, it, vi } from 'vitest';
import apiClient from '@/api/client';
import {
  createSetting,
  deleteSetting,
  fetchCrawlerDate,
  fetchGrouped,
  fetchSettingGroupData,
  fetchSettings,
  fetchSingleSetting,
  fetchStaffUtilization,
  updateSetting
} from './staffService';

vi.mock('@/api/client', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
    put: vi.fn(),
    delete: vi.fn()
  }
}));

describe('staffService', () => {
  const apiClientMock = apiClient as unknown as {
    post: ReturnType<typeof vi.fn>;
    get: ReturnType<typeof vi.fn>;
    put: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches utilization settings', async () => {
    apiClientMock.post.mockResolvedValue({ data: { results: [] } });

    const result = await fetchSettings({ filter_by_value: { task_name: ['A'] } });

    expect(apiClientMock.post).toHaveBeenCalledWith('/staff_utilization/', {
      filter_by_value: { task_name: ['A'] }
    });
    expect(result).toEqual({ results: [] });
  });

  it('fetches grouped data', async () => {
    apiClientMock.get.mockResolvedValue({ data: { groups: [] } });

    const result = await fetchGrouped();

    expect(apiClientMock.get).toHaveBeenCalledWith('/staff_utilization/grouped-data/');
    expect(result).toEqual({ groups: [] });
  });

  it('fetches staff utilization report', async () => {
    apiClientMock.post.mockResolvedValue({ data: { rows: [] } });

    const result = await fetchStaffUtilization({
      search: '',
      sort: { field: 'created_at', order: 'desc' },
      dateFilters: { starting_date: '2024-01-01', ending_date: '2024-01-31' }
    });

    expect(apiClientMock.post).toHaveBeenCalledWith('/staff_utilization/report/', {
      search: '',
      filters_by_value: undefined,
      filters_by_conditions: undefined,
      sort: { field: 'created_at', order: 'desc' },
      date_filters: { starting_date: '2024-01-01', ending_date: '2024-01-31' }
    });
    expect(result).toEqual({ rows: [] });
  });

  it('fetches a single setting', async () => {
    apiClientMock.get.mockResolvedValue({ data: { id: 5 } });

    const result = await fetchSingleSetting(5);

    expect(apiClientMock.get).toHaveBeenCalledWith('/staff_utilization/5/');
    expect(result).toEqual({ id: 5 });
  });

  it('updates a setting', async () => {
    apiClientMock.put.mockResolvedValue({ data: { id: 2, task_name: 'PT' } });

    const result = await updateSetting(2, { task_name: 'PT' });

    expect(apiClientMock.put).toHaveBeenCalledWith('/staff_utilization/2/update/', {
      task_name: 'PT'
    });
    expect(result).toEqual({ id: 2, task_name: 'PT' });
  });

  it('deletes a setting', async () => {
    apiClientMock.delete.mockResolvedValue({ data: { deleted: true } });

    const result = await deleteSetting(9);

    expect(apiClientMock.delete).toHaveBeenCalledWith('/staff_utilization/9/delete/');
    expect(result).toEqual({ deleted: true });
  });

  it('creates a setting', async () => {
    apiClientMock.post.mockResolvedValue({ data: { id: 3 } });

    const result = await createSetting({
      task_name: 'SN',
      visit_length: '30',
      visit_type: 'home'
    });

    expect(apiClientMock.post).toHaveBeenCalledWith('/staff_utilization/create/', {
      task_name: 'SN',
      visit_length: '30',
      visit_type: 'home'
    });
    expect(result).toEqual({ id: 3 });
  });

  it('fetches task name counts', async () => {
    apiClientMock.get.mockResolvedValue({ data: { counts: [] } });

    const result = await fetchSettingGroupData();

    expect(apiClientMock.get).toHaveBeenCalledWith('/staff_utilization/task-name-count/');
    expect(result).toEqual({ counts: [] });
  });

  it('fetches crawler dates', async () => {
    apiClientMock.post.mockResolvedValue({
      data: { crawler: 'clinician', last_fetched: '2026-04-17T10:00:00Z' }
    });

    const result = await fetchCrawlerDate('clinician');

    expect(apiClientMock.post).toHaveBeenCalledWith('/staff_utilization/crawler-date/', {
      crawler: 'clinician'
    });
    expect(result).toEqual({ crawler: 'clinician', last_fetched: '2026-04-17T10:00:00Z' });
  });
});
