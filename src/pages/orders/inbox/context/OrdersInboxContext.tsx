import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  fetchInboxGroupFields,
  fetchInboxList,
  fetchSingleFaxInbox,
  fetchCategories,
  fetchTags,
  fetchRejection,
  fetchSinglePDF
} from '@/services/Faxes/inboxService.ts';
import { useQuery } from 'react-query';
import {
  DATE_DEFAULT,
  normalizeStoredDateFilter,
  persistStoredDateFilter
} from '@/constants/dateFilter';
import { getCurrentWeekRange } from '@/utils/Date.ts';
import { IFaxesInboxContext, IFilterContext, IFilterSort } from '@/pages/faxes/inbox/interface.ts';
import { fetchOrderList } from '@/services/Order/orderService';
import { fetchOrderGroupFields } from '@/services/Order/orderService';
import { getEndOfSaturdayPST } from '@/utils';

const initialSortItem: IFilterSort = {
  field: '',
  order: ''
};

const { startDate, endDate } = getCurrentWeekRange();

const initialFilterState: IFilterContext = {
  status: 'New',
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
  fetchPDFUrl: () => {},
  fetchRejectionReason: () => {},
  categories: {},
  tags: [],
  refetchTags: async () => {},
  refetchGroupFields: async () => {},
  lastSeenData: []
};

const OrdersInboxContext = createContext<IFaxesInboxContext>(initialState);

export const OrdersInboxProvider = ({
  children,
  documentType
}: {
  children: ReactNode;
  documentType: string;
}) => {
  const getInitialFilters = (): IFilterContext => {
    const storedFilters = localStorage.getItem('ordersInboxFilters');
    const savedTimestamp = localStorage.getItem('ordersSavedAt');
    const endOfSaturday = getEndOfSaturdayPST();

    if (savedTimestamp && Date.now() > endOfSaturday) {
      localStorage.removeItem('ordersInboxFilters');
      localStorage.removeItem('ordersSavedAt');
      return initialFilterState;
    }

    const parsedFilters = storedFilters ? JSON.parse(storedFilters) : initialFilterState;

    return {
      ...parsedFilters,
      document_type: documentType
    };
  };

  const getInitialDateFilter = (): string => {
    const stored = localStorage.getItem('ordersDateFilter');
    const savedAt = localStorage.getItem('ordersDateSavedAt');
    const endOfSaturday = getEndOfSaturdayPST();

    if (savedAt && Date.now() > endOfSaturday) {
      localStorage.removeItem('ordersDateFilter');
      localStorage.removeItem('ordersDateSavedAt');
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
  const [lastSeenData, setlastSeenData] = useState<any>();

  const { data, refetch, isLoading } = useQuery(
    ['ringcentral', filters],
    () => fetchOrderList(filters),
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
  } = useQuery(['ringcentral-group-fields', filters], () => fetchOrderGroupFields(filters), {
    enabled: false,
    onSuccess: (data) => {
      setInboxGroupFields(data);
    }
  });

  const fetchSingleFaxQuery = (id: number) => {
    return useQuery(['single-fax', id], () => fetchSingleFaxInbox(id), {
      enabled: !!id
    });
  };

  const fetchPDFUrl = (id: number) => {
    return useQuery(['single-fax-pdf', id], () => fetchSinglePDF(id), {
      enabled: !!id
    });
  };

  const fetchRejectionReason = (id: number) => {
    return useQuery(['single-rejection', id], () => fetchRejection(id), {
      enabled: !!id
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
    localStorage.setItem('ordersInboxFilters', JSON.stringify(filters));
    localStorage.setItem('ordersSavedAt', `${Date.now()}`);
    persistStoredDateFilter('ordersDateFilter', selectedDateFilter);
    localStorage.setItem('ordersDateSavedAt', `${Date.now()}`);
  }, [filters, selectedDateFilter]);

  useEffect(() => {
    refetchGroupFields();
  }, [refetchGroupFields]);

  useEffect(() => {
    refetchCategories();
    refetchTags();
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
      fetchPDFUrl,
      categories,
      tags,
      refetchTags,
      refetchGroupFields,
      lastSeenData
    }),
    [faxesInbox, filters, isLoading, isQueryEnabled, refetch, categories, tags, groupFieldsData]
  );

  return <OrdersInboxContext.Provider value={contextValue}>{children}</OrdersInboxContext.Provider>;
};

export const useOrdersInbox = (): IFaxesInboxContext => {
  const context = useContext(OrdersInboxContext);
  if (!context) {
    throw new Error('useOrdersInbox must be used within a OrdersInboxProvider');
  }
  return context;
};
