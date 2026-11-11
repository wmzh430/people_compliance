import apiClient from '@/api/client';
import { normalizeApiDateFilters } from '@/constants/dateFilter';
import { ISettingFilterContext } from '@/pages/schedule-reports/context/ScheduleContext.tsx';

export interface ISettingFormValues {
  task_name: string;
  visit_length: string;
  visit_type: string;
}

interface IFilterContext {
  search: string;
  filters_by_value?: {
    [key: string]: string[];
  };
  filters_by_conditions?: {
    [key: string]:
      | {
          condition: string;
          value: string;
        }
      | {
          min: number;
          max: number;
        };
  };
  sort: {
    field: string;
    order: string;
  };
  dateFilters: {
    starting_date: string;
    ending_date: string;
  };
}

// Fetch staff utilization settings with optional filters.
export const fetchSettings = async (filters: ISettingFilterContext): Promise<any> => {
  try {
    const response = await apiClient.post(`/staff_utilization/`, {
      filter_by_value: filters.filter_by_value
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch settings:', error);
    throw error;
  }
};

// Fetch grouped utilization data for filter controls.
export const fetchGrouped = async () => {
  try {
    const response = await apiClient.get(`/staff_utilization/grouped-data/`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch settings:', error);
    throw error;
  }
};

// Fetch staff utilization report with filters and sorting.
export const fetchStaffUtilization = async (filters: IFilterContext): Promise<any> => {
  try {
    const response = await apiClient.post('/staff_utilization/report/', {
      search: filters.search,
      filters_by_value: filters.filters_by_value,
      filters_by_conditions: filters.filters_by_conditions,
      sort: filters.sort,
      date_filters: normalizeApiDateFilters(filters.dateFilters)
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch reports:', error);
    throw error;
  }
};

// Fetch a single utilization setting by ID.
export const fetchSingleSetting = async (settingId: number | undefined): Promise<any> => {
  try {
    const response = await apiClient.get(`/staff_utilization/${settingId}/`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch single setting:', error);
    throw error;
  }
};

// Update an existing utilization setting.
export const updateSetting = async (
  settingId: number,
  data: { [key: string]: any }
): Promise<any> => {
  try {
    const response = await apiClient.put(`/staff_utilization/${settingId}/update/`, data);
    return response.data;
  } catch (error) {
    console.error('Failed to update settings data:', error);
    throw error;
  }
};

// Delete a utilization setting by ID.
export const deleteSetting = async (settingId: number): Promise<any> => {
  try {
    const response = await apiClient.delete(`/staff_utilization/${settingId}/delete/`);
    return response.data;
  } catch (error) {
    console.error('Failed to delete settings data:', error);
    throw error;
  }
};

// Create a new utilization setting.
export const createSetting = async (data: ISettingFormValues): Promise<any> => {
  try {
    const response = await apiClient.post(`/staff_utilization/create/`, data);
    return response.data;
  } catch (error) {
    console.error('Failed to create settings data:', error);
    throw error;
  }
};

// Fetch the last-crawled timestamp for staff utilization from KinsserCrawlerDates.
export const fetchCrawlerDate = async (crawler: string): Promise<{ last_fetched: string }> => {
  const response = await apiClient.post('/staff_utilization/crawler-date/', { crawler });
  return response.data;
};

// Fetch aggregated task-name counts for utilization.
export const fetchSettingGroupData = async () => {
  try {
    const response = await apiClient.get(`/staff_utilization/task-name-count/`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch settings:', error);
    throw error;
  }
};
