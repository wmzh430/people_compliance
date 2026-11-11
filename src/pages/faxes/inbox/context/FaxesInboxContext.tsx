import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  fetchInboxGroupFields,
  fetchInboxList,
  fetchSingleFaxInbox,
  fetchCategories,
  fetchTags,
  fetchRejection,
  fetchSinglePDF,
  fetchLastSeen
} from '@/services/Faxes/inboxService.ts';
import { useQuery } from 'react-query';
import {
  DATE_DEFAULT,
  normalizeStoredDateFilter,
  persistStoredDateFilter
} from '@/constants/dateFilter';
import { getCurrentWeekRange } from '@/utils/Date.ts';
import { IFaxesInboxContext, IFilterContext, IFilterSort } from '@/pages/faxes/inbox/interface.ts';
import { getEndOfSaturdayPST } from '@/utils';

const initialSortItem: IFilterSort = {
  field: '',
  order: ''
};

const { startDate, endDate } = getCurrentWeekRange();

const normalizeFaxInboxStatus = (status?: string) => {
  if (!status) {
    return 'Active';
  }

  if (status === 'New') {
    return 'All';
  }

  return status;
};

const initialFilterState: IFilterContext = {
  status: 'Active',
  search: '',
  page: 1,
  page_size: 200,
  filters_by_value: {
    category: [],
    sub_category: [],
    to_phoneNumber: [],
    from_phoneNumber: [],
    patient_name: [],
    assignee: [],
    is_accepted: []
  },
  filters_by_conditions: {},
  sort: initialSortItem,
  dateFilters: {
    starting_date: startDate,
    ending_date: endDate
  },
  isArchived: false
};

const initialState: IFaxesInboxContext = {
  faxesInbox: {},
  setFilters: () => {},
  filters: initialFilterState,
  isLoading: false,
  isQueryEnabled: false,
  refetch: async () => {},
  initialFilterState: initialFilterState,
  selectedDateFilter: 'this_week',
  setSelectedDateFilter: () => {},
  inboxGroupFields: [],
  fetchSingleFaxQuery: () => {},
  fetchRejectionReason: () => {},
  categories: {},
  tags: [],
  refetchTags: async () => {},
  refetchGroupFields: async () => {},
  lastSeenData: [],
  refetchSeenInbox: () => {}
};

const FaxesInboxContext = createContext<IFaxesInboxContext>(initialState);

export const FaxesInboxProvider = ({ children }: any) => {
  const getInitialFilters = (): IFilterContext => {
    const storedFilters = localStorage.getItem('faxesInboxFilters');
    const savedTimestamp = localStorage.getItem('faxesSavedAt');
    const endOfSaturday = getEndOfSaturdayPST();

    if (savedTimestamp && Date.now() > endOfSaturday) {
      localStorage.removeItem('faxesInboxFilters');
      localStorage.removeItem('faxesSavedAt');
      return initialFilterState;
    }

    if (!storedFilters) {
      return initialFilterState;
    }

    const parsedFilters = JSON.parse(storedFilters);
    const normalizedStatus = normalizeFaxInboxStatus(parsedFilters.status);

    // Persisted inbox filters drive both the list query and the archive badge state.
    // The archive toggle in the detail view updates the same underlying `is_archive`
    // field that this status flag eventually maps to.
    return {
      ...parsedFilters,
      status: normalizedStatus,
      isArchived: normalizedStatus === 'Archive'
    };
  };

  const getInitialDateFilter = (): string => {
    const stored = localStorage.getItem('faxesDateFilter');
    const savedAt = localStorage.getItem('faxesDateSavedAt');
    const endOfSaturday = getEndOfSaturdayPST();

    if (savedAt && Date.now() > endOfSaturday) {
      localStorage.removeItem('faxesDateFilter');
      localStorage.removeItem('faxesDateSavedAt');
      return DATE_DEFAULT;
    }

    return normalizeStoredDateFilter(stored, DATE_DEFAULT);
  };

  const [filters, setFilters] = useState<IFilterContext>(getInitialFilters());
  const [isQueryEnabled, setIsQueryEnabled] = useState<boolean>(false);
  const [faxesInbox, setFaxesInbox] = useState<any[]>([]);
  const [selectedDateFilter, setSelectedDateFilter] = useState<string>(getInitialDateFilter());
  const [inboxGroupFields, setInboxGroupFields] = useState<any>();
  const [categories, setCategories] = useState<any>();
  const [tags, setTags] = useState<any>([]);

  const { data, refetch, isLoading } = useQuery(
    ['ringcentral', filters],
    () => fetchInboxList(filters),
    {
      enabled: isQueryEnabled,
      onSuccess: (data) => {
        const ids = data.data.map((fax: any) => fax.fax_id);
        setFaxesInbox(data);
        localStorage.setItem('currentIndex', '0');
        localStorage.setItem('faxIds', JSON.stringify(ids));
      }
    }
  );

  const {
    data: groupFieldsData,
    refetch: refetchGroupFields,
    isLoading: isGroupFieldsLoading
  } = useQuery(['ringcentral-group-fields', filters], () => fetchInboxGroupFields(filters), {
    enabled: false,
    onSuccess: (data) => {
      setInboxGroupFields(data);
    }
  });

  const fetchSingleFaxQuery = (id: number, isOrderType: boolean = false) => {
    return useQuery(['single-fax', id, isOrderType], () => fetchSingleFaxInbox(id, isOrderType), {
      enabled: !!id
    });
  };

  const fetchRejectionReason = (id: number, isOrderType: boolean = false, options: any = {}) => {
    return useQuery(['single-rejection', id, isOrderType], () => fetchRejection(id, isOrderType), {
      enabled: !!id,
      ...options
    });
  };

  const {
    data: categoriesData,
    refetch: refetchCategories,
    isLoading: isCategoriesLoading
  } = useQuery(['categories'], () => fetchCategories(), {
    enabled: false,
    onSuccess: (data) => {
      setCategories(data);
    }
  });

  const { data: lastSeenData, refetch: refetchSeenInbox } = useQuery(
    ['lastSeen'],
    () => fetchLastSeen(),
    {
      enabled: false,
      onSuccess: (data) => {
        return data;
      }
    }
  );

  const {
    data: tagsData,
    refetch: refetchTags,
    isLoading: isTagsLoading
  } = useQuery(['tags'], () => fetchTags(), {
    enabled: false,
    onSuccess: (data) => {
      setTags(data);
    }
  });

  useEffect(() => {
    refetchSeenInbox();
  }, []);

  useEffect(() => {
    localStorage.setItem('faxesInboxFilters', JSON.stringify(filters));
    localStorage.setItem('faxesSavedAt', `${Date.now()}`);
    persistStoredDateFilter('faxesDateFilter', selectedDateFilter);
    localStorage.setItem('faxesDateSavedAt', `${Date.now()}`);
  }, [filters, selectedDateFilter]);

  useEffect(() => {
    refetchGroupFields();
  }, [refetchGroupFields]);

  useEffect(() => {
    refetchCategories();
    refetchTags();
    fetchLastSeen();
  }, [refetchCategories]);

  const contextValue = useMemo(
    () => ({
      faxesInbox,
      setFilters,
      filters,
      isLoading,
      isQueryEnabled,
      refetch,
      setIsQueryEnabled,
      initialFilterState,
      selectedDateFilter,
      inboxGroupFields,
      setSelectedDateFilter,
      fetchSingleFaxQuery,
      fetchRejectionReason,
      categories,
      tags,
      refetchTags,
      refetchGroupFields,
      lastSeenData,
      refetchSeenInbox
    }),
    [
      faxesInbox,
      filters,
      isLoading,
      isQueryEnabled,
      refetch,
      categories,
      tags,
      groupFieldsData,
      refetchSeenInbox
    ]
  );

  return <FaxesInboxContext.Provider value={contextValue}>{children}</FaxesInboxContext.Provider>;
};

export const useFaxesInbox = (): IFaxesInboxContext => {
  const context = useContext(FaxesInboxContext);
  if (!context) {
    throw new Error('useFaxesInbox must be used within a FaxesInboxProvider');
  }
  return context;
};
