import apiClient from '@/api/client';

export type AppMetadata = {
  APP_ENV: string;
  APP_VERSION: string;
  GIT_SHA?: string;
};

export const fetchAppMetadata = async (): Promise<AppMetadata> => {
  const response = await apiClient.get('/core/app-metadata/');
  return response.data;
};

// Fetch last background task timestamps (backend ignores crawler arg).
export const fetchLastSync = async (crawler: string) => {
  // eslint-disable-next-line no-useless-catch
  try {
    const response = await apiClient.get('/core/celery/last-tasks');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Fetch successful background task timestamps (backend ignores crawler arg).
export const fetchLastSyncSent = async (crawler: string) => {
  // eslint-disable-next-line no-useless-catch
  try {
    const response = await apiClient.get('/core/celery/successful-tasks', {});

    return response.data;
  } catch (error) {
    throw error;
  }
};
