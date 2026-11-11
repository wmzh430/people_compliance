import apiClient from '@/api/client';

export interface FetchCliniciansPayload {
  page: number;
  search: string;
}

export interface Clinician {
  id: number;
  first_name: string;
  last_name: string;
  suffix?: string;
  employee_id: string;
  employee_type: string;
  user_type: string;
  primary_branch: string;
  email_address: string;
  phone_1?: string | null;
  phone_2?: string | null;
  city: string;
  state: string;
  zip_code: string;
  region: string;
  created_at?: string;
  updated_at?: string;
  address_1?: string;
  address_2?: string;
  payroll_start_date?: string;
  hire_date?: string;
  date_of_birth?: string;
  verification_status?: string | null;
  is_active?: boolean;
  exclude_from_oig?: boolean;
}

export interface ClinicianResponse {
  count: number;
  results: Clinician[];
}

// Fetch clinicians list with pagination and search filters.
export const fetchClinicians = async (
  payload: FetchCliniciansPayload
): Promise<ClinicianResponse> => {
  try {
    const response = await apiClient.post('/clinicians/', payload);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch clinicians:', error);
    throw error;
  }
};

// Fetch clinician details by ID (ID must be defined).
export const fetchSingleClinician = async (clinicianId: number | undefined): Promise<Clinician> => {
  try {
    const response = await apiClient.get(`/clinicians/detail/${clinicianId}/`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch clinician:', error);
    throw error;
  }
};

// Patch clinician record with partial updates.
export const updateClinician = async (
  clinicianId: number,
  data: { [key: string]: any }
): Promise<Clinician> => {
  try {
    const response = await apiClient.patch(`/clinicians/${clinicianId}/`, data);
    return response.data;
  } catch (error) {
    console.error('Failed to update clinician data:', error);
    throw error;
  }
};

// Fetch aggregated clinician group data for reporting filters.
export const fetchCliniciansGroupData = async () => {
  try {
    const response = await apiClient.get(`/clinicians/group-data/`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch clinicains grouped data:', error);
    throw error;
  }
};
