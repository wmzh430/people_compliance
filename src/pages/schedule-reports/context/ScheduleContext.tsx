import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  DATE_DEFAULT,
  getDateFiltersForPreset,
  normalizeStoredDateFilter,
  persistStoredDateFilter
} from '@/constants/dateFilter';
import {
  fetchGrouped,
  fetchSettingGroupData,
  fetchSettings,
  fetchStaffUtilization
} from '@/services/StaffUtilization/staffService';
import { useQuery } from 'react-query';
import { getCurrentWeekRange } from '@/utils/Date.ts';

interface IScheduleContextType {
  scheduleSettings: any | null;
  setScheduleSettings: (value: any) => void;
  refetchSettings: () => void;
  isLoading: boolean;
  staffUtilization: any | null;
  setStaffUtilization: (value: any) => void;
  // staffIsLoading: boolean;
  filter: IFilterContext;
  setFilter: React.Dispatch<React.SetStateAction<IFilterContext>>;
  refetchStaff: () => Promise<void>;
  initialFilterState: IFilterContext;
  groupedFields: any;
  setGroupedFields: any;
  staffIsLoading: boolean;
  settingGroupFields: any;
  setSettingGroupFields: any;
  settingFilters: ISettingFilterContext;
  setSettingFilters: any;
  initialSettingFilterState: ISettingFilterContext;
  selectedDateFilter: string;
  setSelectedDateFilter: React.Dispatch<React.SetStateAction<string>>;
}

interface IFilterItem {
  condition: string;
  value: string;
}

interface IDateItems {
  starting_date: string;
  ending_date: string;
}

interface IFilterRange {
  min: number;
  max: number;
}

interface IFilterSort {
  field: string;
  order: string;
}

export interface IFilterContext {
  isArchived?: any;
  search: string;
  filters_by_value: {
    [key: string]: string[];
  };
  filters_by_conditions: {
    [key: string]:
      | {
          condition: string;
          value: string;
        }
      | {
          min: number;
          max: number;
        };
  };
  sort: {
    field: string;
    order: string;
  };
  dateFilters: IDateItems;
}

export interface ISettingFilterContext {
  filter_by_value: {
    [key: string]: string[];
  };
}

const initialFilterItem: IFilterItem = {
  condition: 'text_contains',
  value: ''
};

const initialRangeItem: IFilterRange = {
  min: 0,
  max: 100
};

const initialSortItem: IFilterSort = {
  field: '',
  order: ''
};

const initialSettingFilterState: ISettingFilterContext = {
  filter_by_value: {
    task_name: []
  }
};

const { startDate, endDate } = getCurrentWeekRange();

const initialFilterState: IFilterContext = {
  search: '',
  filters_by_value: {
    employee_id: [],
    provider_name: [],
    region: [],
    user_type: []
  },
  filters_by_conditions: {
    provider_name: initialFilterItem,
    visit_length: initialRangeItem,
    oasis: initialRangeItem,
    pt_visit_w_supervisory_visit: initialRangeItem,
    evaluation: initialRangeItem,
    visit: initialRangeItem,
    snv_w_lvn_supervision: initialRangeItem
  },
  sort: initialSortItem,
  dateFilters: {
    starting_date: startDate,
    ending_date: endDate
  }
};

const initialState: IScheduleContextType = {
  scheduleSettings: null,
  setScheduleSettings: () => {},
  refetchSettings: () => {},
  isLoading: false,
  staffUtilization: [],
  setStaffUtilization: () => {},
  // staffIsLoading: false,
  filter: initialFilterState,
  setFilter: () => {},
  refetchStaff: async () => {},
  initialFilterState: initialFilterState,
  groupedFields: [],
  setGroupedFields: () => {},
  staffIsLoading: false,
  settingGroupFields: [],
  setSettingGroupFields: () => {},
  settingFilters: initialSettingFilterState,
  setSettingFilters: () => {},
  initialSettingFilterState: initialSettingFilterState,
  selectedDateFilter: '',
  setSelectedDateFilter: () => {}
};

const ScheduleContext = createContext<IScheduleContextType>(initialState);

export const ScheduleProvider = ({ children }: any) => {
  const getInitialFilters = (): IFilterContext => {
    const stored = localStorage.getItem('scheduleFilters');
    return stored ? JSON.parse(stored) : initialFilterState;
  };

  const getInitialDateFilter = (): string => {
    const stored = localStorage.getItem('scheduleDateFilter');
    return normalizeStoredDateFilter(stored, DATE_DEFAULT);
  };
  const [scheduleSettings, setScheduleSettings] = useState<any>();
  const [staffUtilization, setStaffUtilization] = useState<any>();
  const [filter, setFilter] = useState<IFilterContext>(getInitialFilters());
  const [groupedFields, setGroupedFields] = useState<any>();
  const [isQueryEnabled, setIsQueryEnabled] = useState(false);
  const [settingGroupFields, setSettingGroupFields] = useState<any>();
  const [settingFilters, setSettingFilters] = useState<any>(initialSettingFilterState);
  const [selectedDateFilter, setSelectedDateFilter] = useState<string>(getInitialDateFilter());

  const { data, refetch, isLoading } = useQuery(
    ['scheduleSettings', settingFilters],
    () => fetchSettings(settingFilters),
    {
      enabled: false,
      onSuccess: (data) => {
        setScheduleSettings(data);
      },
      onError: (error: any) => {
        console.error('Failed to fetch schedule settings:', error);
      }
    }
  );

  const groupedReportsQuery = useQuery(['groupedReports'], () => fetchGrouped(), {
    enabled: false,
    onSuccess: (data) => {
      setGroupedFields(data);
    },
    onError: (error: any) => {
      console.error('Failed to group reports:', error);
    }
  });

  const settingGroupedReportsQuery = useQuery(
    ['settingGroupedReports'],
    () => fetchSettingGroupData(),
    {
      enabled: false,
      onSuccess: (data) => {
        setSettingGroupFields(data);
      },
      onError: (error: any) => {
        console.error('Failed to group reports:', error);
      }
    }
  );

  const staffUtilizationQuery = useQuery(
    ['staffUtilization', filter],
    () => fetchStaffUtilization(filter),
    {
      enabled: isQueryEnabled,
      onSuccess: (data) => {
        setStaffUtilization(data);
      }
    }
  );

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
    await staffUtilizationQuery.refetch();
  };

  useEffect(() => {
    localStorage.setItem('scheduleFilters', JSON.stringify(filter));
    persistStoredDateFilter('scheduleDateFilter', selectedDateFilter);
  }, [filter, selectedDateFilter]);

  useEffect(() => {
    refetch();
    staffUtilizationQuery.refetch();
    groupedReportsQuery.refetch();
    settingGroupedReportsQuery.refetch();
  }, []);

  return (
    <ScheduleContext.Provider
      value={{
        scheduleSettings,
        setScheduleSettings,
        refetchSettings: refetch,
        isLoading,
        staffUtilization,
        setStaffUtilization,
        filter,
        setFilter,
        refetchStaff: async () => {
          await staffUtilizationQuery.refetch();
        },
        initialFilterState,
        groupedFields,
        setGroupedFields,
        staffIsLoading: staffUtilizationQuery.isLoading,
        settingGroupFields,
        setSettingGroupFields,
        settingFilters,
        setSettingFilters,
        initialSettingFilterState,
        selectedDateFilter,
        setSelectedDateFilter
      }}
    >
      {children}
    </ScheduleContext.Provider>
  );
};

export const useSchedule = (): IScheduleContextType => {
  const context = useContext(ScheduleContext);
  if (!context) {
    throw new Error('useSchedule must be used within a ScheduleProvider');
  }
  return context;
};
