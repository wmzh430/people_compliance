import { createContext, useContext, useEffect, useState } from 'react';
import { groupReportsByField } from '@/services/Admin/adminService.ts';
import { useQuery } from 'react-query';

interface IFilterContextType {
  groupedFields: any | null;
  setGroupedFields: (value: any) => void;
  filterByValue: {
    task_name: string[];
    provider_name: string[];
    patient_name: string[];
    status_category: string[];
    target_date: string[];
    medical_record_number: string[];
    archer_status: string[];
  };
  setFilterByValue: (value: any) => void;
}

const initialState: IFilterContextType = {
  groupedFields: null,
  setGroupedFields: () => {},
  filterByValue: {
    task_name: [],
    provider_name: [],
    patient_name: [],
    status_category: [],
    target_date: [],
    medical_record_number: [],
    archer_status: []
  },
  setFilterByValue: () => {}
};
const FilterContext = createContext<IFilterContextType>(initialState);

export const FilterProvider = ({ children }: any) => {
  const [groupedFields, setGroupedFields] = useState<any>();
  const [filterByValue, setFilterByValue] = useState<IFilterContextType['filterByValue']>(
    initialState.filterByValue
  );

  // const groupedReportsQuery = useQuery(['groupedReports'], () => groupReportsByField(), {
  //   enabled: false,
  //   onSuccess: (data) => {
  //     setGroupedFields(data);
  //   },
  //   onError: (error: any) => {
  //     console.error('Failed to group reports:', error);
  //   }
  // });

  // useEffect(() => {
  //   groupedReportsQuery.refetch();
  // }, []);

  return (
    <FilterContext.Provider
      value={{
        groupedFields,
        setGroupedFields,
        filterByValue,
        setFilterByValue
      }}
    >
      {children}
    </FilterContext.Provider>
  );
};

export const useFilter = (): IFilterContextType => {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('useFilter must be used within a FilterProvider');
  }
  return context;
};
