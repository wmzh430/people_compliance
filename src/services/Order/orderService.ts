import apiClient from '@/api/client.ts';
import { normalizeApiDateFilters } from '@/constants/dateFilter';
import { IFilterContext } from '@/pages/faxes/inbox/interface.ts';
import { log } from 'console';

export interface IPhysician {
  name: string;
  first_name: string;
  last_name: string;
  suffix: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  phone: string;
  fax: string;
  upin: string | null;
  npi: string;
  state_license: string | null;
  expiration_date: string | null;
  contact: string | null;
  liaison_last: string | null;
  liaison_first: string | null;
  comment: string | null;
  physician_access: string;
  community_care_number: string | null;
  pecos: string;
  order_delivery_preference: string;
}

export interface IOrder {
  id: number;
  order_id: string;
  status: string;
  physician_name: string;
  patient_id: number;
  order_type: string | null;
  pa: string;
  fax_sent_at: string | null;
  fax_received_at: string | null;
  ordered: string;
  created_at: string;
}

export interface IOrderReceived {
  id: string;
  order_id: string;
  physician_name: string;
  order_type: string;
  status: string;
  physician: {
    order_delivery_preference: string;
  };
  ordered: string;
  created_at: string;
  name: string;
}

export interface IOrderToSend {
  id: string;
  physician: IPhysician;
  orders: Array<{
    order_id: string;
    patient_name: string;
  }>;
  merged_pdf_s3_path?: string;
  pdf_url?: string;
  status: string;
  ring_central_status?: string;
  created_at: string;
  updated_at: string;
  last_try_at?: string;
}

export interface IOrdersResponse {
  request: {
    page: number;
    per_page: number;
    metadata: {
      query: string;
    };
  };
  total_pages: number;
  total_elements: number;
  items: IOrderToSend[];
}

// Fetch orders with server-side filters, sorting, and pagination.
export const fetchOrderList = async (filters: IFilterContext) => {
  try {
    const response = await apiClient.post('/orders/', {
      status: filters.status,
      search: filters.search,
      filters_by_value: filters.filters_by_value,
      filters_by_conditions: filters.filters_by_conditions,
      sort: filters.sort,
      date_filters: normalizeApiDateFilters(filters.dateFilters),
      isArchived: filters.isArchived,
      page: filters.page,
      page_size: filters.page_size,
      document_type: filters.document_type
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch reports:', error);
    throw error;
  }
};

// Fetch order grouping metadata for filter dropdowns.
export const fetchOrderGroupFields = async (filters: any) => {
  try {
    const response = await apiClient.post(`/orders/grouped/`, {
      status: filters?.status,
      date_filters: normalizeApiDateFilters(filters?.dateFilters),
      document_type: filters?.document_type
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch settings:', error);
    throw error;
  }
};

// Fetch merged orders list ready for sending/faxing.
export const fetchOrdersToSend = async (
  page: number = 1,
  per_page: number = 200,
  metadata: {
    query: string;
    statuses: string[];
    ringcentral_statuses: string[];
    order_ids: Record<string, any>;
    preferences: string[];
    merged: boolean | null;
    is_checked_out: boolean | null;
    from_date: string | null;
    to_date: string | null;
  } = {
    query: '',
    statuses: [],
    ringcentral_statuses: [],
    order_ids: {},
    preferences: [],
    merged: null,
    is_checked_out: null,
    from_date: null,
    to_date: null
  }
): Promise<IOrdersResponse> => {
  try {
    const response = await apiClient.post('/orders_management/merged_orders/paginated/', {
      page,
      per_page,
      metadata
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch orders to send:', error);
    throw error;
  }
};

// Trigger sending of merged orders by IDs.
export const sendOrders = async (order_ids: string[]): Promise<any> => {
  try {
    const response = await apiClient.post('/orders_management/merged_orders/send/', {
      merged_ids: order_ids
    });
    return response.data;
  } catch (error) {
    console.error('Failed to send orders:', error);
    throw error;
  }
};

// Fetch KPI counts by order type.
export const fetchOrdersCountByType = async (filters?: any) => {
  try {
    const response = await apiClient.get('/orders_management/orders-count-by-type');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch orders count by type:', error);
    throw error;
  }
};

// Fetch KPI counts by order status.
export const fetchOrdersCountByStatus = async (filters?: any) => {
  try {
    const response = await apiClient.get('/orders_management/orders-count-by-status');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch orders count by status:', error);
    throw error;
  }
};

// Fetch order aging metrics for dashboards.
export const fetchOrdersAging = async (filters?: any) => {
  try {
    const response = await apiClient.get('/orders_management/orders-aging');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch orders aging:', error);
    throw error;
  }
};

// Fetch counts grouped by physician.
export const fetchOrdersCountByPhysician = async (filters?: any) => {
  try {
    const response = await apiClient.get('/orders_management/orders-count-by-physician');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch orders count by physician:', error);
    throw error;
  }
};

// Fetch time-series counts for orders created by interval.
export const fetchOrdersCreatedOverTime = async (
  interval: 'day' | 'week' | 'month',
  filters?: any
) => {
  try {
    const response = await apiClient.get('/orders_management/orders-created-over-time', {
      params: {
        interval,
        ...filters
      }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch orders created over time:', error);
    throw error;
  }
};

// Fetch physician ranking by slowest turnaround.
export const fetchTopSlowestPhysicians = async (filters?: any) => {
  try {
    const response = await apiClient.get('/orders_management/top-slowest-physicians/');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch top slowest physicians:', error);
    throw error;
  }
};

// Fetch paginated list of orders pending signature.
export const fetchOrderSignatureList = async (
  page: number = 1,
  per_page: number = 200,
  metadata: {
    query: string;
    statuses: string[];
    order_ids: string[];
    preferences: string[];
    merged: boolean | null;
    from_date: string | null;
    to_date: string | null;
  } = {
    query: '',
    statuses: [],
    order_ids: [],
    preferences: [],
    merged: null,
    from_date: null,
    to_date: null
  }
) => {
  try {
    const response = await apiClient.post('/orders_management/orders/', {
      page,
      per_page,
      metadata: {
        ...metadata,
        statuses:
          metadata.statuses.length > 0
            ? metadata.statuses
            : ['KINSSER_PENDING_PHYSICIAN_SIGNATURE', 'PENDING_PHYSICIAN_SIGNATURE']
      }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch order signature list:', error);
    throw error;
  }
};

// Fetch orders for bulk PDF print.
export const fetchOrderPrintList = async (filters?: any) => {
  try {
    const response = await apiClient.post('/orders_management/bulk_pdf_print/');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch order signature list:', error);
    throw error;
  }
};

// Fetch orders grouped by status for operational views.
export const fetchOrdersByStatus = async (
  page: number = 1,
  per_page: number = 200,
  metadata: {
    query: string;
    statuses: string[];
    order_ids: string[];
    preferences: string[];
    merged: boolean | null;
    from_date: string | null;
    to_date: string | null;
  } = {
    query: '',
    statuses: [],
    order_ids: [],
    preferences: [],
    merged: null,
    from_date: null,
    to_date: null
  }
) => {
  try {
    const response = await apiClient.post(`/orders_management/orders/`, {
      page,
      per_page,
      metadata: {
        ...metadata,
        statuses:
          metadata.statuses.length > 0 ? metadata.statuses : ['DOWNLOADED_PDF', 'GENERATED_BARCODE']
      }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch orders by status:', error);
    throw error;
  }
};

// Fetch archived orders list.
export const fetchOrdersArchived = async (
  page: number = 1,
  per_page: number = 200,
  metadata: {
    query: string;
    statuses: string[];
    order_ids: string[];
    preferences: string[];
    merged: boolean | null;
    from_date: string | null;
    to_date: string | null;
  } = {
    query: '',
    statuses: [],
    order_ids: [],
    preferences: [],
    merged: null,
    from_date: null,
    to_date: null
  }
) => {
  try {
    const response = await apiClient.post(`/orders_management/orders/`, {
      page,
      per_page,
      metadata: {
        ...metadata,
        statuses: metadata.statuses.length > 0 ? metadata.statuses : ['ARCHIVED']
      }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch Archived orders by status:', error);
    throw error;
  }
};

// Request server-side bulk PDF generation for order IDs.
export const bulkPdfForPrint = async (order_ids: number[]): Promise<any> => {
  try {
    const response = await apiClient.post('/orders_management/request_merged_orders/', {
      order_ids
    });
    return response.data;
  } catch (error) {
    console.error('Failed to generate bulk PDF for print:', error);
    throw error;
  }
};

// Fetch received faxes by filters and pagination.
export const fetchReceivedFaxes = async (
  page: number = 1,
  page_size: number = 10
): Promise<any> => {
  try {
    const response = await apiClient.post('/orders_management/get-received-faxes/', {
      params: {
        page,
        page_size
      }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch received faxes:', error);
    throw error;
  }
};

// Fetch orders extracted from received faxes.
export const fetchFaxReceivedOrders = async (
  page: number = 1,
  per_page: number = 200,
  metadata: {
    query: string;
    statuses: string[];
    order_ids: string[];
    preferences: string[];
    merged: boolean | null;
    from_date: string | null;
    to_date: string | null;
  } = {
    query: '',
    statuses: [],
    order_ids: [],
    preferences: [],
    merged: null,
    from_date: null,
    to_date: null
  }
): Promise<any> => {
  try {
    const response = await apiClient.post('/orders_management/orders/', {
      page,
      per_page,
      metadata: {
        ...metadata,
        statuses:
          metadata.statuses.length > 0
            ? metadata.statuses
            : ['FAX_RECEIVED', 'UPLOAD_CONFIRMED', 'TASK_UPLOADED']
      }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch fax received orders:', error);
    throw error;
  }
};

// Fetch referrals with server-side filters and pagination.
export const fetchReferralPDFs = async (filters: any): Promise<any> => {
  try {
    const response = await apiClient.post('/referrals/', {
      page: filters?.page ?? 1,
      per_page: filters?.per_page ?? 200,
      metadata: {
        query: filters?.metadata?.query ?? '',
        statuses: filters?.metadata?.statuses ?? [],
        sources: filters?.metadata?.sources ?? [],
        sender: filters?.metadata?.sender ?? [],
        patient_name: filters?.metadata?.patient_name ?? [],
        marketers: filters?.metadata?.marketers ?? [],
        assignees: filters?.metadata?.assignees ?? [],
        is_existing_patient: filters?.metadata?.is_existing_patient ?? null,
        from_date: filters?.metadata?.from_date ?? null,
        to_date: filters?.metadata?.to_date ?? null,
        order_by: filters?.metadata?.order_by ?? '-created_at'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch referrals:', error);
    throw error;
  }
};

// Fetch internal referral list.
export const fetchInternalReferrals = async (): Promise<any> => {
  try {
    const response = await apiClient.get('/referrals/internal-referrals/');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch internal referrals:', error);
    throw error;
  }
};

// Fetch marketer list for assignment.
export const fetchMarketers = async (): Promise<any> => {
  try {
    const response = await apiClient.get('/referrals/marketer/list/');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch marketers:', error);
    throw error;
  }
};

// Upload internal referrer data for association.
export const uploadInternalReferrer = async (internal_referrer: any) => {
  try {
    console.log('internal_referrer', internal_referrer);
    const response = await apiClient.post(
      '/referrals/internal-referrals/assign/',
      internal_referrer
    );
    return response.data;
  } catch (error) {
    console.error('Failed to fetch internal referrals:', error);
    throw error;
  }
};

// Assign a marketer to a referral.
export const assignMarketer = async (marketerAssignment: {
  referral_id: number;
  marketer_id: string | null;
  source: string;
}) => {
  try {
    console.log('marketerAssignment', marketerAssignment);
    const response = await apiClient.post('/referrals/marketer/assign/', marketerAssignment);
    return response.data;
  } catch (error) {
    console.error('Failed to assign marketer:', error);
    throw error;
  }
};

// Upload a referral PDF file via multipart form data.
export const uploadReferralPDF = async (file: File): Promise<any> => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post('/referrals/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to upload PDF:', error);
    throw error;
  }
};

export const normalizeReferralUploadObjectKey = (objectKey: string): string => {
  if (objectKey.includes('/')) {
    return objectKey;
  }

  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `media/referrals/${year}/${month}/${day}/${objectKey}`;
};

// Upload a referral PDF directly to S3 via backend proxy with an explicit object key.
export const submitReferralPDFUrls = async (
  file: File,
  objectKey: string
): Promise<{ bucket: string; object_key: string; file_url: string }> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('object_key', normalizeReferralUploadObjectKey(objectKey));

    const response = await apiClient.post('/core/s3/upload/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    if (response.data?.errors) {
      console.error('API returned errors:', response.data.errors);
      throw new Error(response.data.errors.required || 'Failed to submit PDF');
    }
    console.log(response.data);

    return response.data;
  } catch (error) {
    console.error('Failed to submit PDF:', error);
    throw new Error('Failed to submit PDF');
  }
};

// Toggle the archived flag on a single referral row.
// Referral inbox uses the referral detail PATCH route so `is_archive` stays on
// the Referral model instead of the RingCentral fax table.
export const updateReferralArchiveStatus = async (
  referralId: number,
  is_archive: boolean
): Promise<any> => {
  try {
    const response = await apiClient.patch(`/referrals/${referralId}/`, {
      is_archive
    });
    return response.data;
  } catch (error) {
    console.error('Failed to update referral archive status:', error);
    throw error;
  }
};

type UploadReferralPDFsResponse = {
  message: string;
  pdfs: Array<{ id: number; pdf_id: number; url: string }>;
  referrals: Array<{ id: number; pdf_id: number; url: string }>;
  duplicate_count?: number;
  duplicate_pdfs?: Array<Record<string, unknown>>;
  created_count?: number;
  error?: string;
};

// Register uploaded referral PDF URLs with the legacy-compatible referral upload endpoint.
export const uploadReferralPDFs = async (pdfs: string[]): Promise<UploadReferralPDFsResponse> => {
  try {
    const payload = { pdfs };

    const response = await apiClient.post('/referrals/upload-pdfs/', payload, {
      headers: {
        accept: 'application/json'
      }
    });

    if (response.data?.errors) {
      console.error('API returned errors:', response.data.errors);
      throw new Error(response.data.errors.required || 'Failed to upload referral PDFs');
    }

    return response.data;
  } catch (error) {
    console.error('Failed to upload referral PDFs:', error);
    const message =
      (error as any)?.response?.data?.error ||
      (error as any)?.response?.data?.message ||
      'Failed to upload referral PDFs';
    throw new Error(message);
  }
};

// Manually upload orders for processing (admin action).
export const manualUploadOrders = async (order_ids: string[]): Promise<any> => {
  try {
    const response = await apiClient.post('/orders_management/manual-upload-orders/', {
      order_ids
    });
    return response.data;
  } catch (error) {
    console.error('Failed to manually upload orders:', error);
    throw error;
  }
};
