import React, { createContext, ReactNode, useContext, useState, useEffect } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import { IFilterSort } from '@/pages/faxes/inbox/interface.ts';
import {
  fetchReferralPDFs,
  submitReferralPDFUrls as submitReferralPDFUrlsService
} from '@/services/Order/orderService';

const initialSortItem: IFilterSort = {
  field: '',
  order: ''
};

export interface IReferralFilterContext {
  page: number;
  per_page: number;
  metadata: {
    query: string;
    statuses: string[];
    sources: string[];
    sender: string[];
    patient_name: string[];
    marketers: string[];
    assignees: string[];
    sub_categories: string[];
    from_date: string | null;
    to_date: string | null;
    order_by: string;
  };
  filters_by_conditions: Record<string, any>;
  sort: IFilterSort;
  dateFilters: {
    starting_date: string;
    ending_date: string;
  };
  document_type?: string;
}

export interface IReferralContext {
  initialFilterState: IReferralFilterContext;
  referralPDFs: any;
  marketers: any;
  refetchReferrals: () => void;
  filters: IReferralFilterContext;
  setFilters: (
    filters: IReferralFilterContext | ((prev: IReferralFilterContext) => IReferralFilterContext)
  ) => void;
  refetch: () => Promise<any>;
  isLoading: boolean;
  selectedDateFilter: string;
  setSelectedDateFilter: (date: string) => void;
  referralIds: string[];
  handleRowSelect: (row: any) => void;
  handleRowClick: (row: any) => void;
  handleReadStatus: (status: string) => void;
  handleDepartmentSelection: (departmentId: string | null, referralId: string) => void;
  handleUserSelection: (userId: string | null, referralId: string) => void;
  submitReferralPDFUrls: (
    file: File,
    objectKey: string
  ) => Promise<{ bucket: string; object_key: string; file_url: string }>;
}

const ReferralContext = createContext<IReferralContext | undefined>(undefined);

// LocalStorage key for filters
const ORDER_REFERRAL_FILTERS_KEY = 'orderReferralFilters';

// Function to get filters from localStorage
const getFiltersFromStorage = (): IReferralFilterContext => {
  try {
    const storedFilters = localStorage.getItem(ORDER_REFERRAL_FILTERS_KEY);
    if (storedFilters) {
      const parsedFilters = JSON.parse(storedFilters);
      // Ensure all required fields exist with fallbacks
      return {
        page: parsedFilters.page || 1,
        per_page: parsedFilters.per_page || 200,
        metadata: {
          query: parsedFilters.metadata?.query || '',
          statuses: parsedFilters.metadata?.statuses || [],
          sources: parsedFilters.metadata?.sources || [],
          sender: parsedFilters.metadata?.sender || [],
          patient_name: parsedFilters.metadata?.patient_name || [],
          marketers: parsedFilters.metadata?.marketers || [],
          assignees: parsedFilters.metadata?.assignees || [],
          sub_categories: parsedFilters.metadata?.sub_categories || [],
          from_date: parsedFilters.metadata?.from_date || null,
          to_date: parsedFilters.metadata?.to_date || null,
          order_by: parsedFilters.metadata?.order_by || '-created_at'
        },
        filters_by_conditions: parsedFilters.filters_by_conditions || {},
        sort: parsedFilters.sort || initialSortItem,
        dateFilters: {
          starting_date: parsedFilters.dateFilters?.starting_date || '',
          ending_date: parsedFilters.dateFilters?.ending_date || ''
        }
      };
    }
  } catch (error) {
    console.error('Error parsing filters from localStorage:', error);
  }

  // Return default filters if nothing in localStorage or error
  return {
    page: 1,
    per_page: 200,
    metadata: {
      query: '',
      statuses: [],
      sources: [],
      sender: [],
      patient_name: [],
      marketers: [],
      assignees: [],
      sub_categories: [],
      from_date: null,
      to_date: null,
      order_by: '-created_at'
    },
    filters_by_conditions: {},
    sort: initialSortItem,
    dateFilters: {
      starting_date: '',
      ending_date: ''
    }
  };
};

// Function to save filters to localStorage
const saveFiltersToStorage = (filters: IReferralFilterContext) => {
  try {
    localStorage.setItem(ORDER_REFERRAL_FILTERS_KEY, JSON.stringify(filters));
  } catch (error) {
    console.error('Error saving filters to localStorage:', error);
  }
};

export const ReferralProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize filters from localStorage
  const [filters, setFilters] = useState<IReferralFilterContext>(() => getFiltersFromStorage());

  const [selectedDateFilter, setSelectedDateFilter] = useState<string>('all_time');
  const [referralIds, setReferralIds] = useState<string[]>([]);

  // Save filters to localStorage whenever they change
  useEffect(() => {
    saveFiltersToStorage(filters);
  }, [filters]);

  const {
    data: referralPDFs,
    isLoading,
    refetch: refetchReferrals
  } = useQuery({
    queryKey: ['referrals', filters, selectedDateFilter],
    queryFn: () => fetchReferralPDFs(filters)
  });

  const marketers: any[] = [];
  const refetch = async () => ({ data: marketers });

  const queryClient = useQueryClient();

  // Optimistically update a single referral row in cache
  const updateReferralInCache = (referralId: number, partial: Record<string, any>) => {
    queryClient.setQueryData(['referrals', filters, selectedDateFilter], (oldData: any) => {
      if (!oldData) return oldData;
      const updateList = (list: any[]) =>
        list.map((r: any) => (r.id === referralId ? { ...r, ...partial } : r));
      if (Array.isArray(oldData.results)) {
        return { ...oldData, results: updateList(oldData.results) };
      }
      if (Array.isArray(oldData)) {
        return updateList(oldData);
      }
      return oldData;
    });
  };

  const handleRowSelect = (row: any) => {
    if (!row || !row.original) return;
    const id = row.original.id;
    setReferralIds((prev) =>
      prev.includes(id) ? prev.filter((existingId) => existingId !== id) : [...prev, id]
    );
  };

  const handleRowClick = (row: any) => {
    // Handle row click logic
  };

  const handleReadStatus = (status: string) => {
    // Handle read status logic
  };

  const handleDepartmentSelection = (departmentId: string | null, referralId: string) => {
    // Optimistically set internal_referrer/marketer on the row
    updateReferralInCache(Number(referralId), { marketer: departmentId });
  };

  const handleUserSelection = (userId: string | null, referralId: string) => {
    // Optimistically set assignee on the row
    updateReferralInCache(Number(referralId), { assignee: userId });
  };

  const submitReferralPDFUrls = async (file: File, objectKey: string) => {
    try {
      const result = await submitReferralPDFUrlsService(file, objectKey);
      return result;
    } catch (error) {
      console.error('Error submitting referral PDF URLs:', error);
      throw error;
    }
  };

  const initialFilterState: IReferralFilterContext = {
    page: 1,
    per_page: 200,
    metadata: {
      query: '',
      statuses: [],
      sources: [],
      sender: [],
      patient_name: [],
      marketers: [],
      assignees: [],
      sub_categories: [],
      from_date: null,
      to_date: null,
      order_by: '-created_at'
    },
    filters_by_conditions: {},
    sort: initialSortItem,
    dateFilters: {
      starting_date: '',
      ending_date: ''
    }
  };

  return (
    <ReferralContext.Provider
      value={{
        initialFilterState,
        marketers,
        refetchReferrals,
        referralPDFs,
        filters,
        setFilters,
        refetch,
        isLoading,
        selectedDateFilter,
        setSelectedDateFilter,
        referralIds,
        handleRowSelect,
        handleRowClick,
        handleReadStatus,
        handleDepartmentSelection,
        handleUserSelection,
        submitReferralPDFUrls
      }}
    >
      {children}
    </ReferralContext.Provider>
  );
};

export const useReferral = () => {
  const context = useContext(ReferralContext);
  if (context === undefined) {
    throw new Error('useReferral must be used within a ReferralProvider');
  }
  return context;
};
