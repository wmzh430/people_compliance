import apiClient from '@/api/client.ts';
import { normalizeApiDateFilters } from '@/constants/dateFilter';
import { IFilterContext } from '@/pages/faxes/inbox/interface.ts';

export const KIND_FAX = 'fax' as const;
export const KIND_REF = 'referral' as const;
export const KIND_ORDER = 'order' as const;

type InboxDocumentKind = typeof KIND_FAX | typeof KIND_REF | typeof KIND_ORDER;

const getInboxStatusRequestValue = (status?: string) => {
  if (!status) {
    return 'All';
  }

  if (status === 'Active') {
    return 'Unarchive';
  }

  if (status === 'New') {
    return 'All';
  }

  return status;
};

const getInboxArchivedRequestValue = (filters: IFilterContext) => {
  // The list endpoints use a separate archived filter from the detail action.
  // "Archive" requests archived rows, "Active" requests non-archived rows, and
  // "All" leaves the archive flag unconstrained.
  if (filters.status === 'Archive') {
    return true;
  }

  if (filters.status === 'Active') {
    return false;
  }

  if (filters.status === 'All') {
    return 'all';
  }

  return filters.isArchived;
};

const docKind = (kind: boolean | InboxDocumentKind = KIND_FAX): InboxDocumentKind => {
  if (kind === true) {
    return KIND_REF;
  }

  if (kind === false) {
    return KIND_FAX;
  }

  return kind;
};

const sourceOf = (source?: string) => (source === KIND_FAX ? KIND_FAX : 'portal');

const buildSingleDocumentEndpoint = (
  id: number | string,
  kind: boolean | InboxDocumentKind = KIND_FAX
) => {
  const doc = docKind(kind);
  return doc === KIND_FAX ? `/ringcentral/fax/${id}` : `/referrals/${id}/`;
};

const buildNoteEndpoint = (noteId: number, kind: boolean | InboxDocumentKind) => {
  const doc = docKind(kind);
  return doc === KIND_FAX ? `/ringcentral/fax/notes/${noteId}/` : `/referrals/notes/${noteId}/`;
};

const buildReferralDocumentEndpoint = (
  recordId: number | string,
  source: string | undefined,
  suffix: string
) => `/referrals/${sourceOf(source)}/${recordId}${suffix}`;

const buildFaxDocumentEndpoint = (faxId: number | string, suffix: string) =>
  `/ringcentral/fax/${faxId}${suffix}`;

// Fetch fax inbox list with filters and pagination.
export const fetchInboxList = async (filters: IFilterContext) => {
  try {
    const response = await apiClient.post('/ringcentral/', {
      status: getInboxStatusRequestValue(filters.status),
      search: filters.search,
      filters_by_value: filters.filters_by_value,
      filters_by_conditions: filters.filters_by_conditions,
      sort: filters.sort,
      date_filters: normalizeApiDateFilters(filters.dateFilters),
      isArchived: getInboxArchivedRequestValue(filters),
      page: filters.page,
      page_size: filters.page_size
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch inbox list:', error);
    throw error;
  }
};

// Mark fax items as read/unread.
// The detail view now uses the fax detail PATCH route directly, so this helper is mainly
// for list/preview flows that still want a shared convenience wrapper.
export const updateReadStatus = async ({ payload }: { payload: any }): Promise<any> => {
  try {
    const faxIds = Array.isArray(payload?.fax_ids) ? payload.fax_ids : [];
    const readStatus = payload?.readStatus;

    if (!faxIds.length) {
      throw new Error('fax_ids must be a non-empty list.');
    }

    const responses = await Promise.all(
      faxIds.map((faxId: number | string) =>
        apiClient.patch(`/ringcentral/fax/${faxId}/`, {
          readStatus
        })
      )
    );

    const firstResponse = responses[0]?.data;
    return {
      message:
        firstResponse?.message ||
        `${responses.length} fax${responses.length === 1 ? '' : 'es'} updated successfully.`,
      updated_fax_count: responses.length,
      readStatus: firstResponse?.fax?.readStatus || readStatus
    };
  } catch (error) {
    console.error('Failed to update read status:', error);
    throw error;
  }
};

// Archive/unarchive fax items.
// This is the service used by the fax detail buttons and any bulk inbox actions that
// need to flip the persisted `is_archive` flag on one or more fax rows.
export const updateArchiveStatus = async ({ payload }: { payload: any }): Promise<any> => {
  try {
    const response = await apiClient.post(`/ringcentral/fax/update-archive-status/`, payload);
    return response.data;
  } catch (error) {
    console.error('Failed to update archive:', error);
    throw error;
  }
};

// Reject a fax with a feedback payload.
export const rejectFax = async ({ rejectPayload }: { rejectPayload: any }): Promise<any> => {
  try {
    const response = await apiClient.post(`/ringcentral/fax/add-category-feedback/`, rejectPayload);
    return response.data;
  } catch (error) {
    console.error('Failed to reject fax:', error);
    throw error;
  }
};

// Update fax acceptance/status flag.
export const updateFaxStatus = async ({ updatePayload }: { updatePayload: any }): Promise<any> => {
  try {
    const response = await apiClient.patch(`/ringcentral/fax/update-is-accepted/`, updatePayload);
    return response.data;
  } catch (error) {
    console.error('Failed to accept fax:', error);
    throw error;
  }
};

// Fetch grouped inbox metadata for filter controls.
export const fetchInboxGroupFields = async (filters: any) => {
  try {
    const response = await apiClient.post(`/ringcentral/grouped/`, {
      status: getInboxStatusRequestValue(filters?.status),
      date_filters: normalizeApiDateFilters(filters?.dateFilters),
      isArchived: getInboxArchivedRequestValue(filters)
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch inbox group fields:', error);
    throw error;
  }
};

// Fetch a single inbox record by ID.
export const fetchSingleFaxInbox = async (
  id: number | string,
  kind: boolean | InboxDocumentKind = KIND_FAX
) => {
  try {
    const endpoint = buildSingleDocumentEndpoint(id, kind);
    const response = await apiClient.get(endpoint);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch single fax:', error);
    throw error;
  }
};

// Add a note to a fax/referral.
export const addNote = async ({ payload }: { payload: any }, kind: boolean | InboxDocumentKind) => {
  try {
    const endpoint = docKind(kind) === KIND_FAX ? `/ringcentral/fax/notes/` : `/referrals/notes/`;
    const response = await apiClient.post(endpoint, {
      ...payload
    });
    return response.data;
  } catch (error) {
    console.error('Failed to add note:', error);
    throw error;
  }
};

// Delete a fax/referral note by ID.
export const deleteNote = async (note_id: number, kind: boolean | InboxDocumentKind) => {
  try {
    const response = await apiClient.delete(buildNoteEndpoint(note_id, kind));
    return response.data;
  } catch (error) {
    console.error('Failed to delete note:', error);
    throw error;
  }
};

// Update note content for a fax/referral.
export const updateNote = async (
  note_id: number,
  content: any,
  kind: boolean | InboxDocumentKind
) => {
  try {
    const isReferral = docKind(kind) !== KIND_FAX;
    const response = await apiClient.put(buildNoteEndpoint(note_id, kind), {
      content: content,
      ...(isReferral ? { referral_id: note_id } : {})
    });
    return response.data;
  } catch (error) {
    console.error('Failed to update note:', error);
    throw error;
  }
};

// Assign a single fax/referral to a user.
export const assignAssignee = async (source: string, id: number, assignee_id: any) => {
  try {
    const response = await apiClient.post(`/referrals/assignee/assign/`, {
      source: source,
      referral_id: id,
      assignee_id: assignee_id === '' || assignee_id === 'null' ? null : assignee_id
    });
    return response.data;
  } catch (error) {
    console.error('Failed to assign assignee:', error);
    throw error;
  }
};

// Bulk assign faxes/referrals to a user.
export const assignAssigneeFaxes = async (
  fax_id: number,
  assignee_id: any,
  kind: boolean | InboxDocumentKind = KIND_FAX,
  source?: string
) => {
  try {
    const normalizedAssigneeId = assignee_id === '' || assignee_id === 'null' ? null : assignee_id;
    const isReferral = docKind(kind) !== KIND_FAX;
    const endpoint = isReferral ? `/referrals/assignee/assign/` : `/ringcentral/fax/assign-admin/`;
    const payload = isReferral
      ? {
          referral_id: fax_id,
          assignee_id: normalizedAssigneeId,
          source: sourceOf(source)
        }
      : {
          fax_id: fax_id,
          assignee_id: normalizedAssigneeId
        };

    const response = await apiClient.post(endpoint, payload);
    return response.data;
  } catch (error) {
    console.error('Failed to assign assignee:', error);
    throw error;
  }
};

// Assign a fax to a department.
export const assignFaxDepartment = async (fax_id: number, department_id: any) => {
  try {
    const normalizedDepartmentId =
      department_id === '' || department_id === 'null' ? null : department_id;
    const response = await apiClient.post(`/ringcentral/fax/assign-department/`, {
      fax_id: fax_id,
      department_id: normalizedDepartmentId
    });
    return response.data;
  } catch (error) {
    console.error('Failed to asign department to fax:', error);
    throw error;
  }
};

// Update fax/referral details (conditional endpoint by type).
export const updateFaxDetails = async (
  data: Record<string, any>,
  kind: boolean | InboxDocumentKind
) => {
  const endPoint =
    docKind(kind) !== KIND_FAX
      ? `/referrals/update-details/`
      : buildFaxDocumentEndpoint(data?.fax_id, `/`);
  try {
    const response = await apiClient.patch(endPoint, data, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to update fax details:', error);
    throw error;
  }
};

// Log a user action against a fax item.
export const buildActionLogPayload = (
  data: Record<string, any> | undefined,
  action: string,
  options?: { isReferrals?: boolean; isReports?: boolean }
) => {
  if (options?.isReports) {
    return null;
  }

  if (options?.isReferrals) {
    const documentId = data?.id ?? data?.document_id ?? data?.fax_id;
    if (documentId === undefined || documentId === null) {
      return null;
    }

    return {
      document_id: documentId,
      source: data?.source ?? 'portal',
      action
    };
  }

  const faxId = data?.fax_id;
  if (faxId === undefined || faxId === null) {
    return null;
  }

  return {
    fax_id: faxId,
    action
  };
};

export const actionLog = async (data: Record<string, any>) => {
  try {
    const response = await apiClient.post(`/ringcentral/fax/log-action/`, {
      ...data
    });
    return response.data;
  } catch (error) {
    console.error('Failed to add action log:', error);
    throw error;
  }
};

// Fetch available fax categories.
export const fetchCategories = async () => {
  try {
    const response = await apiClient.get(`/ringcentral/fax/categories/`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    throw error;
  }
};

// Fetch last viewed metadata for inbox.
export const fetchLastSeen = async () => {
  try {
    const response = await apiClient.get(`/ringcentral/fax/last-viewed/`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch last seen:', error);
    throw error;
  }
};

// Fetch available fax tags.
export const fetchTags = async () => {
  try {
    const response = await apiClient.get(`/ringcentral/fax/tags/`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch tags:', error);
    throw error;
  }
};

// Create a new fax tag.
export const createTag = async (tag_name: string) => {
  try {
    const response = await apiClient.post(`/ringcentral/fax/tags/`, {
      name: tag_name
    });
    return response.data;
  } catch (error) {
    console.error('Failed to create tag:', error);
    throw error;
  }
};

// Assign tags to a fax item.
export const assignTags = async (fax_id: any, tag_ids: any) => {
  try {
    const response = await apiClient.post(`/ringcentral/fax/assign-tags/`, {
      fax_id: fax_id,
      tag_ids: tag_ids
    });
    return response.data;
  } catch (error) {
    console.error('Failed to assign tags:', error);
    throw error;
  }
};

// Fetch rejection feedback for a fax/referral.
export const fetchRejection = async (
  fax_id: number,
  kind: boolean | InboxDocumentKind = KIND_FAX
) => {
  try {
    const endpoint =
      docKind(kind) !== KIND_FAX
        ? `/referrals/${fax_id}/feedback-reason/`
        : `/ringcentral/fax/${fax_id}/feedback-reason/`;
    const response = await apiClient.get(endpoint);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch rejection:', error);
    throw error;
  }
};

// Fetch a single fax PDF by file name.
export const fetchSinglePDF = async (
  fax_id: number,
  kind: boolean | InboxDocumentKind = KIND_FAX,
  source?: string
) => {
  try {
    const endpoint =
      docKind(kind) !== KIND_FAX
        ? `/referrals/create_presigned_url/${sourceOf(source)}/${fax_id}/`
        : `/ringcentral/fax/create_presigned_url/${fax_id}/`;
    const response = await apiClient.get(endpoint);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch PDF:', error);
    throw error;
  }
};

// Fetch subcategories for a selected category.
export const fetchSubCategories = async (category_name: string) => {
  try {
    const response = await apiClient.post(`/ringcentral/fax/subcategories/`, {
      category_name: category_name
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch subcategories:', error);
    throw error;
  }
};

// Fetch patient demographic fields for a fax/referral.
export const fetchDemographic = async (
  fax_id: number,
  kind: boolean | InboxDocumentKind = KIND_FAX,
  source?: string
) => {
  try {
    const endpoint =
      docKind(kind) !== KIND_FAX
        ? buildReferralDocumentEndpoint(fax_id, source, '/demographics/')
        : buildFaxDocumentEndpoint(fax_id, '/demographics');
    const response = await apiClient.get(endpoint);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch demographics:', error);
    throw error;
  }
};

// Update patient demographic fields for a fax/referral.
export const updateDemoghraphic = async (
  data: Record<string, any>,
  fax_id: number,
  kind: boolean | InboxDocumentKind = KIND_FAX,
  source?: string
) => {
  try {
    const endpoint =
      docKind(kind) !== KIND_FAX
        ? buildReferralDocumentEndpoint(fax_id, source, '/update-demographics/')
        : buildFaxDocumentEndpoint(fax_id, '/update-demographics/');
    const response = await apiClient.patch(endpoint, {
      ...data
    });
    return response.data;
  } catch (error) {
    console.error('Failed to update fax demographics:', error);
    throw error;
  }
};

// Fetch medical records data for a fax/referral.
export const fetchReocrds = async (
  fax_id: number,
  kind: boolean | InboxDocumentKind = KIND_FAX,
  source?: string
) => {
  try {
    const endpoint =
      docKind(kind) !== KIND_FAX
        ? buildReferralDocumentEndpoint(fax_id, source, '/medical-records/')
        : buildFaxDocumentEndpoint(fax_id, '/medical-records');
    const response = await apiClient.get(endpoint);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch medical-records:', error);
    throw error;
  }
};

// Update medical records fields for a fax/referral.
export const updateRecords = async (
  data: Record<string, any>,
  fax_id: number,
  kind: boolean | InboxDocumentKind = KIND_FAX,
  source?: string
) => {
  try {
    const endpoint =
      docKind(kind) !== KIND_FAX
        ? buildReferralDocumentEndpoint(fax_id, source, '/update-medical-records/')
        : buildFaxDocumentEndpoint(fax_id, '/update-medical-records/');
    const response = await apiClient.patch(endpoint, {
      ...data
    });
    return response.data;
  } catch (error) {
    console.error('Failed to update fax medical-records:', error);
    throw error;
  }
};

// Add feedback for medical records classification.
export const addFeedback = async (data: Record<string, any>) => {
  try {
    const response = await apiClient.post(`/ringcentral/fax/feedback/medical-records/`, {
      ...data
    });
    return response.data;
  } catch (error) {
    console.error('Failed to add feedback for medical-records:', error);
    throw error;
  }
};

// Fetch feedback history for a specific record field.
export const getFeedbackHistory = async (recordId: number, fieldName: string) => {
  try {
    const response = await apiClient.put(`/ringcentral/fax/feedback/${recordId}/${fieldName}/`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch feedback history:', error);
    throw error;
  }
};

// ── EHR Attachment (Attach to EHR tab) ──

// Fetch EHR task options, optionally filtered by task type ("Order" or "Misc").
export const fetchEhrTasks = async (taskType?: string) => {
  try {
    const params = taskType ? { task_type: taskType } : {};
    const response = await apiClient.get('/ringcentral/fax/ehr-tasks/', { params });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch EHR tasks:', error);
    throw error;
  }
};

// Fetch active clinicians for the Assign To dropdown, with optional search.
export const fetchEhrClinicians = async (search?: string) => {
  try {
    const params = search ? { search } : {};
    const response = await apiClient.get('/ringcentral/fax/ehr-clinicians/', { params });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch EHR clinicians:', error);
    throw error;
  }
};

// Fetch the saved EHR attachment for a fax.
export const fetchEhrAttachment = async (faxId: number) => {
  try {
    const response = await apiClient.get(`/ringcentral/fax/${faxId}/ehr-attachment/`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch EHR attachment:', error);
    throw error;
  }
};

// Save (create or update) the EHR attachment for a fax.
export const saveEhrAttachment = async (faxId: number, data: Record<string, any>) => {
  try {
    const response = await apiClient.post(`/ringcentral/fax/${faxId}/ehr-attachment/`, data);
    return response.data;
  } catch (error) {
    console.error('Failed to save EHR attachment:', error);
    throw error;
  }
};

// Retry a failed EHR upload for a fax.
export const retryEhrAttachment = async (faxId: number) => {
  try {
    const response = await apiClient.post(`/ringcentral/fax/${faxId}/ehr-attachment/retry/`);
    return response.data;
  } catch (error) {
    console.error('Failed to retry EHR attachment upload:', error);
    throw error;
  }
};

export interface CreatePatientDuplicateMatch {
  referral_id: number;
  first_name: string | null;
  last_name: string | null;
  date_of_birth: string | null;
  patient_name_norm: string | null;
}

export interface CreatePatientDuplicateCheckResponse {
  is_duplicate: boolean;
  matches: CreatePatientDuplicateMatch[];
}

export interface CreatePatientSubmitRequest {
  run_duplicate_check?: boolean;
}

export type CreatePatientAutomationStatus =
  | 'draft'
  | 'queued'
  | 'processing'
  | 'READY_TO_SCHEDULE'
  | 'failed';

export interface CreatePatientAutomationStatusResponse {
  id: number;
  referral_id: number;
  referral_status: string | null;
  status: CreatePatientAutomationStatus;
  attempt_count: number;
  last_error: string | null;
  celery_task_id: string | null;
  queued_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  payload_hash: string | null;
  wellsky_patient_identifier: string | null;
  wellsky_episode_url: string | null;
  elapsed_seconds: number | null;
  pdf_attachment_status: string | null;
  pdf_attachment_error: string | null;
  created_at: string;
  updated_at: string;
}

// Fetch saved Create Patient draft for referral management records.
export const fetchCreatePatientDraft = async (
  recordId: number | string,
  source: string = 'portal'
): Promise<Record<string, unknown>> => {
  try {
    const response = await apiClient.get(
      buildReferralDocumentEndpoint(recordId, source, '/create-patient/')
    );
    return response.data;
  } catch (error) {
    console.error('Failed to fetch Create Patient draft:', error);
    throw error;
  }
};

// Save Create Patient draft for referral management records.
export const saveCreatePatientDraft = async (
  recordId: number | string,
  source: string = 'portal',
  data: Record<string, any>
): Promise<Record<string, unknown>> => {
  try {
    const response = await apiClient.post(
      buildReferralDocumentEndpoint(recordId, source, '/create-patient/'),
      data,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Failed to save Create Patient draft:', error);
    throw error;
  }
};

// Submit saved Create Patient draft to backend automation queue.
export const submitCreatePatientAutomation = async (
  recordId: number | string,
  source: string = 'portal',
  payload: CreatePatientSubmitRequest = {}
): Promise<CreatePatientAutomationStatusResponse> => {
  try {
    const response = await apiClient.post(
      buildReferralDocumentEndpoint(recordId, source, '/create-patient/submit/'),
      payload,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Failed to submit Create Patient automation:', error);
    throw error;
  }
};

// Retry failed Create Patient automation job.
export const retryCreatePatientAutomation = async (
  recordId: number | string,
  source: string = 'portal'
): Promise<CreatePatientAutomationStatusResponse> => {
  try {
    const response = await apiClient.post(
      buildReferralDocumentEndpoint(recordId, source, '/create-patient/automation/retry/')
    );
    return response.data;
  } catch (error) {
    console.error('Failed to retry Create Patient automation:', error);
    throw error;
  }
};

// Fetch latest Create Patient automation status snapshot.
export const fetchCreatePatientAutomationStatus = async (
  recordId: number | string,
  source: string = 'portal'
): Promise<CreatePatientAutomationStatusResponse> => {
  try {
    const response = await apiClient.get(
      buildReferralDocumentEndpoint(recordId, source, '/create-patient/automation/status/')
    );
    return response.data;
  } catch (error) {
    console.error('Failed to fetch Create Patient automation status:', error);
    throw error;
  }
};
