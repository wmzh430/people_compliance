import React, { createContext, useContext, useEffect, useState } from 'react';
import { useQuery } from 'react-query';
import {
  fetchClinicians,
  Clinician,
  FetchCliniciansPayload,
  ClinicianResponse,
  fetchCliniciansGroupData
} from '@/services/Clinicians/clinicianService.ts';

interface ICliniciansFilterState {
  search: string;
  page: number;
  page_size: number;
  sort: any;
  filters: Record<string, any>;
  filter_by_value: {
    [key: string]: string[];
  };
}

interface ICliniciansContextType {
  clinicians: ClinicianResponse | undefined;
  isCliniciansLoading: boolean;
  isCliniciansError: boolean;
  cliniciansRefetch: () => void;
  updatePage: (page: number) => void;
  updateSearchQuery: (search: string) => void;
  filter: ICliniciansFilterState;
  setFilter: React.Dispatch<React.SetStateAction<ICliniciansFilterState>>;
  clinicianGroupFields: any;
  setClinicianGroupFields: any;
  initialFilterState: ICliniciansFilterState;
}

const initialFilterState: ICliniciansFilterState = {
  search: '',
  page: 1,
  page_size: 200,
  sort: {},
  filters: {},
  filter_by_value: {
    region: []
  }
};

const initialState: ICliniciansContextType = {
  clinicians: undefined,
  isCliniciansLoading: false,
  isCliniciansError: false,
  cliniciansRefetch: () => {},
  updatePage: () => {},
  updateSearchQuery: () => {},
  filter: initialFilterState,
  setFilter: () => {},
  clinicianGroupFields: [],
  setClinicianGroupFields: () => {},
  initialFilterState: initialFilterState
};

const CliniciansContext = createContext<ICliniciansContextType>(initialState);

export const CliniciansProvider = ({ children }: { children: React.ReactNode }) => {
  const [filter, setFilter] = useState<ICliniciansFilterState>(initialFilterState);
  const [clinicianGroupFields, setClinicianGroupFields] = useState<any>();
  const [isQueryEnabled, setIsQueryEnabled] = useState(false);

  const {
    data: clinicians,
    isLoading: isCliniciansLoading,
    isError: isCliniciansError,
    refetch: cliniciansRefetch
  } = useQuery(['clinicians', filter], () => fetchClinicians(filter), {
    enabled: false
  });

  const cliniciansGroupedQuery = useQuery(
    ['clinicianGroupFields'],
    () => fetchCliniciansGroupData(),
    {
      enabled: false,
      onSuccess: (data) => {
        setClinicianGroupFields(data);
      },
      onError: (error: any) => {
        console.error('Failed to group clinicians:', error);
      }
    }
  );

  const updatePage = (page: number) => {
    setFilter((prev) => ({ ...prev, page }));
  };

  const updateSearchQuery = (search: string) => {
    setFilter((prev) => ({ ...prev, search }));
  };

  useEffect(() => {
    cliniciansRefetch();
    cliniciansGroupedQuery.refetch();
  }, []);

  return (
    <CliniciansContext.Provider
      value={{
        clinicians,
        isCliniciansLoading,
        isCliniciansError,
        cliniciansRefetch,
        updatePage,
        updateSearchQuery,
        clinicianGroupFields,
        setClinicianGroupFields,
        filter,
        setFilter,
        initialFilterState
      }}
    >
      {children}
    </CliniciansContext.Provider>
  );
};

export const useClinicians = (): ICliniciansContextType => {
  const context = useContext(CliniciansContext);
  if (!context) {
    throw new Error('useClinicians must be used within a CliniciansProvider');
  }
  return context;
};
