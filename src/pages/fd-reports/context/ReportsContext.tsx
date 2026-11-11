import React, { createContext, useContext, useEffect, useState } from 'react';
import { useQuery } from 'react-query';
import { getReports, groupReportsByField, IReport } from '@/services/Admin/adminService.ts';
import {
  DATE_ALL,
  DATE_CUSTOM,
  DATE_DEFAULT,
  getDateFiltersForPreset,
  normalizeStoredDateFilter,
  persistStoredDateFilter,
  rangeOf
} from '@/constants/dateFilter';
import { getCurrentWeekRange } from '@/utils/Date.ts';
import { getEndOfSaturdayPST } from '@/utils';

const { startDate: starting_date, endDate: ending_date } = getCurrentWeekRange();

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
  filterByValue: Record<string, string[]>;
  dateFilters: IDateItems;
  sort: any;
}

interface IReportsContextType {
  reports: IReport[];
  filter: IFilterContext;
  setFilter: React.Dispatch<React.SetStateAction<IFilterContext>>;
  isReportsLoading: boolean;
  isReportsFetching: boolean;
  isReportsRefreshing: boolean;
  isReportsError: boolean;
  reportsRefetch: any;
  groupedFields: any | null;
  handleResetFilters: React.Dispatch<any>;
  selectedDateFilter: string;
  setSelectedDateFilter: React.Dispatch<React.SetStateAction<string>>;
  initialFilterState: IFilterContext;
  groupedQuery: any;
}

const initialFilterItem: IFilterItem = {
  filter_type: 'text_contains',
  filter_value: ''
};

const initialFilterState: IFilterContext = {
  isArchived: false,
  search: '',
  filters: {
    task_name: initialFilterItem,
    provider_name: initialFilterItem,
    patient_name: initialFilterItem,
    medical_record_number: initialFilterItem,
    archer_status: initialFilterItem
  },
  filterByValue: {},
  dateFilters: {
    starting_date: starting_date,
    ending_date: ending_date
  },
  sort: {}
};

const initialState: IReportsContextType = {
  reports: [],
  filter: initialFilterState,
  setFilter: () => {},
  isReportsLoading: false,
  isReportsFetching: false,
  isReportsRefreshing: false,
  isReportsError: false,
  reportsRefetch: () => {},
  groupedFields: null,
  handleResetFilters: () => {},
  selectedDateFilter: '',
  setSelectedDateFilter: () => {},
  initialFilterState: initialFilterState,
  groupedQuery: () => {}
};

const ReportsContext = createContext<IReportsContextType>(initialState);

export const ReportsProvider = ({ children }: { children: React.ReactNode }) => {
  const syncDateFiltersToSelectedRange = (
    filters: IFilterContext,
    selectedFilter: string
  ): IFilterContext => {
    const hasRange = !!filters.dateFilters?.starting_date && !!filters.dateFilters?.ending_date;

    if (hasRange || selectedFilter === DATE_ALL || selectedFilter === DATE_CUSTOM) {
      return filters;
    }

    const selectedRange = rangeOf(selectedFilter);
    if (!selectedRange) {
      return filters;
    }

    const [starting_date, ending_date] = selectedRange.split(' - ');
    return {
      ...filters,
      dateFilters: {
        starting_date,
        ending_date
      }
    };
  };

  const getInitialFilters = (selectedFilter: string): IFilterContext => {
    const storedFilters = localStorage.getItem('reportsFilters');
    const savedTimestamp = localStorage.getItem('reportsSavedAt');
    const endOfSaturday = getEndOfSaturdayPST();

    if (savedTimestamp && Date.now() > endOfSaturday) {
      localStorage.removeItem('reportsFilters');
      localStorage.removeItem('reportsSavedAt');
      return initialFilterState;
    }

    const filters = storedFilters ? JSON.parse(storedFilters) : initialFilterState;
    return syncDateFiltersToSelectedRange(filters, selectedFilter);
  };

  const getInitialDateFilter = (): string => {
    const stored = localStorage.getItem('reportsDateFilter');
    const savedAt = localStorage.getItem('reportsDateSavedAt');
    const endOfSaturday = getEndOfSaturdayPST();

    if (savedAt && Date.now() > endOfSaturday) {
      localStorage.removeItem('reportsDateFilter');
      localStorage.removeItem('reportsDateSavedAt');
      return DATE_DEFAULT;
    }

    if (!stored) {
      return DATE_DEFAULT;
    }

    return normalizeStoredDateFilter(stored, DATE_DEFAULT);
  };

  const initialSelectedDateFilter = getInitialDateFilter();
  const [filter, setFilter] = useState<IFilterContext>(() =>
    getInitialFilters(initialSelectedDateFilter)
  );
  const [isQueryEnabled, setIsQueryEnabled] = useState<any>(false);
  const [groupedFields, setGroupedFields] = useState<any>();
  const [reportsData, setReportsData] = useState<IReport[]>([]);
  const [selectedDateFilter, setSelectedDateFilter] = useState<string>(initialSelectedDateFilter);
  const [isReportsRefreshing, setIsReportsRefreshing] = useState(false);

  useEffect(() => {
    setIsQueryEnabled(!!filter.search || filter.isArchived === 'all' || filter.isArchived);
  }, [filter.search, filter.isArchived]);

  const reportsQuery = useQuery(['reports', filter], () => getReports(filter), {
    enabled: isQueryEnabled,
    onSuccess: (data) => {
      setReportsData(data);
    }
  });

  const groupedReportsQuery = useQuery({
    queryKey: [
      'groupedReports',
      filter.isArchived,
      filter.dateFilters.starting_date,
      filter.dateFilters.ending_date
    ],
    queryFn: () => groupReportsByField(filter.isArchived, filter.dateFilters),
    enabled: true,
    onSuccess: (data) => {
      setGroupedFields(data);
    },
    onError: (error: any) => {
      console.error('Failed to group reports:', error);
    }
  });

  const reportsRefetch = async () => {
    setIsReportsRefreshing(true);
    try {
      return await reportsQuery.refetch();
    } finally {
      setIsReportsRefreshing(false);
    }
  };

  const handleResetFilters = async () => {
    const currentWeek = getDateFiltersForPreset(DATE_DEFAULT);
    await setFilter({
      ...initialFilterState,
      dateFilters: {
        starting_date: currentWeek.starting_date || '',
        ending_date: currentWeek.ending_date || ''
      }
    });
    await setSelectedDateFilter(DATE_DEFAULT);
    await reportsRefetch();
  };

  useEffect(() => {
    localStorage.setItem('reportsFilters', JSON.stringify(filter));
    localStorage.setItem('reportsSavedAt', `${Date.now()}`);
    persistStoredDateFilter('reportsDateFilter', selectedDateFilter);
    localStorage.setItem('reportsDateSavedAt', `${Date.now()}`);
  }, [filter, selectedDateFilter]);

  useEffect(() => {
    reportsQuery.refetch();
  }, []);

  return (
    <ReportsContext.Provider
      value={{
        reports: reportsData ?? [],
        filter,
        setFilter,
        isReportsLoading: reportsQuery.isLoading,
        isReportsFetching: reportsQuery.isFetching,
        isReportsRefreshing,
        isReportsError: reportsQuery.isError,
        reportsRefetch,
        groupedQuery: groupedReportsQuery.refetch,
        groupedFields,
        handleResetFilters,
        selectedDateFilter,
        setSelectedDateFilter,
        initialFilterState
      }}
    >
      {children}
    </ReportsContext.Provider>
  );
};

export const useReports = (): IReportsContextType => {
  const context = useContext(ReportsContext);
  if (!context) {
    throw new Error('useReports must be used within a ReportsProvider');
  }
  return context;
};
