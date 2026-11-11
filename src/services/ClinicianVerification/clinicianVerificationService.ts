import apiClient from '@/api/client';

export interface IVerificationRecord {
  id: number;
  clinician: number;
  clinician_name: string;
  clinician_suffix: string;
  clinician_employee_type: string;
  status: string;
  pdf_path: string | null;
  error_message: string | null;
  verified_at: string;
  created_at: string;
  updated_at: string;
}

export interface IVerificationListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: IVerificationRecord[];
}

export const fetchVerifications = async (params: {
  month?: string;
  status?: string;
  search?: string;
  clinician_id?: number;
  page?: number;
  page_size?: number;
}): Promise<IVerificationListResponse> => {
  const response = await apiClient.get('/clinician-verification/verifications/', { params });
  return response.data;
};

export const fetchVerificationDetail = async (id: number): Promise<IVerificationRecord> => {
  const response = await apiClient.get(`/clinician-verification/verifications/${id}/`);
  return response.data;
};
