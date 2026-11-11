import apiClient from '@/api/client';
import { normalizeApiDateFilters } from '@/constants/dateFilter';

export const ONLY_USERS_QUERY_KEY = 'onlyUsers';
export const ONLY_USERS_QUERY_OPTIONS = {
  staleTime: Number.POSITIVE_INFINITY,
  cacheTime: Number.POSITIVE_INFINITY,
  refetchOnMount: false,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false
} as const;

export interface AddMemberPayload {
  username: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  profile_picture?: string;
}

export interface CreateRolePayload {
  name: string;
}

export interface AssignPermissionsPayload {
  role_id: number;
  permission_ids: number[];
}

export interface AssignDepartmentPayload {
  user_id: string;
  department_id: string;
}

export interface FilterCondition {
  filter_type: 'text_starts_with' | 'text_contains' | 'text_equals';
  filter_value: string;
}

interface IFilterItem {
  filter_type: string;
  filter_value: string;
}
interface IDateItems {
  starting_date: string;
  ending_date: string;
}

interface IFilterContext {
  isArchived: boolean | string;
  search: string;
  filters: Record<string, IFilterItem>;
  filterByValue:
    | {
        task_name: string[];
        provider_name: string[];
        patient_name: string[];
        // status_category: string[];
        target_date: string[];
        medical_record_number: string[];
        archer_status: string[];
      }
    | {};
  dateFilters: IDateItems;
  sort: any;
}

export interface FilterDatePayload {
  patient_last?: string;
  patient_first?: string;
  task_name?: string;
  medical_record_number?: string;
}

export interface Role {
  id: number;
  name: string;
  permissions: any[];
}

export interface IReport {
  id: number;
  provider_name: string;
  patient_name: string;
  medical_record_number: string;
  task_name: string;
  target_date: string;
  status: string;
  sn_frequency: string;
  pt_frequency: string;
  ot_frequency: string;
  st_frequency: string;
  hha_frequency: string;
  msw_frequency: string;
  archer_status: string;
  status_category: string;
  patient_first?: string;
  patient_last?: string;
  dietician?: boolean;
  has_signature?: boolean;
  description?: string;
  note?: string;
}

export interface Permissons {
  id: number;
  name: string;
  codename: string;
  content_type: number;
}

// Create a new user account (admin-only).
export const addMember = async (payload: AddMemberPayload): Promise<void> => {
  try {
    await apiClient.post('/auth/signup/', payload);
  } catch (error) {
    console.error('Failed to add member:', error);
    throw error;
  }
};

// Create a new role in the authorization system.
export const createRole = async (payload: CreateRolePayload): Promise<void> => {
  try {
    await apiClient.post('/auth/roles/', payload);
  } catch (error) {
    console.error('Failed to create role:', error);
    throw error;
  }
};

// List all available roles for admin management screens.
export const getRoles = async (): Promise<Role[]> => {
  try {
    const response = await apiClient.get('/auth/roles/');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch roles:', error);
    throw error;
  }
};

// Filter schedule reports with server-side search and sort.
export const getReports = async (filters: IFilterContext): Promise<IReport[]> => {
  try {
    const response = await apiClient.post('/schedule-reports/filter/', {
      filters: filters.filters,
      isArchived: filters.isArchived,
      date_filters: normalizeApiDateFilters(filters.dateFilters),
      search: filters.search,
      filter_by_value: filters.filterByValue,
      sort: filters.sort
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch reports:', error);
    throw error;
  }
};

// Fetch a single report record by ID.
export const getSingleReport = async (reportId: number | undefined): Promise<IReport> => {
  try {
    const response = await apiClient.post('/schedule-reports/get-schedule-report/', {
      report_id: reportId
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch report:', error);
    throw error;
  }
};

// Update a report record (admin/editor action).
export const updateReport = async (id: number, data: { [key: string]: any }): Promise<IReport> => {
  try {
    const response = await apiClient.put(`/schedule-reports/${id}/`, data);
    return response.data;
  } catch (error) {
    console.error('Failed to update report:', error);
    throw error;
  }
};

// List permissions available for role assignment.
export const getPermissions = async (): Promise<Permissons[]> => {
  try {
    const response = await apiClient.get('/auth/permissions/list_permissions/');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch reports:', error);
    throw error;
  }
};

// Assign permissions to a role.
export const assignPermissions = async (payload: AssignPermissionsPayload): Promise<any> => {
  try {
    const response = await apiClient.post('/auth/permissions/assign_permissions/', payload);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch reports:', error);
    throw error;
  }
};

// Update Archer status on a schedule report row.
export const updateFDStatus = async ({
  payload,
  row_id
}: {
  payload: any;
  row_id: any;
}): Promise<any> => {
  try {
    const response = await apiClient.patch(
      `/schedule-reports/${row_id}/update-archer-status/`,
      payload
    );
    return response.data;
  } catch (error) {
    console.error('Failed to fetch reports:', error);
    throw error;
  }
};

// Group reports by server-side aggregation for filters/summary UI.
export const groupReportsByField = async (
  isArchived: boolean | string,
  dateFilters: any
): Promise<any> => {
  try {
    const response = await apiClient.post('/schedule-reports/group-data/', {
      isArchived,
      date_filters: dateFilters
    });
    return response.data;
  } catch (error) {
    console.error('Failed to group reports:', error);
    throw error;
  }
};

// Fetch all users for admin management screens.
export const fetchUsers = async (): Promise<any> => {
  try {
    const response = await apiClient.get('/auth/users/');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch users:', error);
    throw error;
  }
};

// Fetch all non-marketer users.
export const fetchOnlyUsers = async (): Promise<any> => {
  try {
    const response = await apiClient.get('/auth/users/?exclude_marketer=true');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch onlyUsers:', error);
    throw error;
  }
};

// Fetch a single user record by ID.
export const fetchSingleUser = async (userID: string): Promise<any> => {
  try {
    const response = await apiClient.get(`/auth/users/${userID}/`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch single user:', error);
    throw error;
  }
};

// Update user profile and role/department details.
export const updateUserInformation = async ({
  payload,
  userID
}: {
  payload: any;
  userID: any;
}): Promise<any> => {
  try {
    const response = await apiClient.put(`/auth/users/${userID}/update/`, payload);
    return response.data;
  } catch (error) {
    console.error('Failed to update user information:', error);
    throw error;
  }
};

// List departments for assignment and filters.
export const fetchDepartments = async (): Promise<any> => {
  try {
    const response = await apiClient.get('/department/list/');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch departments:', error);
    throw error;
  }
};

// Assign a user to a department.
export const assignDepartment = async (payload: AssignDepartmentPayload): Promise<any> => {
  try {
    const response = await apiClient.post('/department/assign/', payload);
    return response.data;
  } catch (error) {
    console.error('Failed to assign department:', error);
    throw error;
  }
};

// Delete a user account (admin-only).
export const deleteUser = async (userID: string): Promise<any> => {
  try {
    const response = await apiClient.delete(`/auth/users/${userID}/delete/`);
    return response.data;
  } catch (error) {
    console.error('Failed to delete users:', error);
    throw error;
  }
};

// Fetch report-related fax logs for auditing.
export const getFaxLogs = async (reportId: number | undefined): Promise<any> => {
  try {
    const response = await apiClient.get(`/schedule-reports/${reportId}/history/`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch logs:', error);
    throw error;
  }
};

// Fetch region list for filters and user assignment.
export const fetchRegions = async (): Promise<any> => {
  try {
    const response = await apiClient.get('/regions/');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch regions:', error);
    throw error;
  }
};
