import React, { createContext, useContext, useState } from 'react';
import { useQuery } from 'react-query';
import {
  fetchVerifications,
  IVerificationListResponse
} from '@/services/ClinicianVerification/clinicianVerificationService';

interface IOIGReportsContextType {
  selectedMonth: string;
  setSelectedMonth: React.Dispatch<React.SetStateAction<string>>;
  selectedStatus: string;
  setSelectedStatus: React.Dispatch<React.SetStateAction<string>>;
  verifications: IVerificationListResponse | undefined;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
  search: string;
  setSearch: React.Dispatch<React.SetStateAction<string>>;
  pagination: {
    page: number;
    page_size: number;
  };
  setPagination: React.Dispatch<
    React.SetStateAction<{
      page: number;
      page_size: number;
    }>
  >;
}

const getCurrentMonth = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

const OIGReportsContext = createContext<IOIGReportsContextType | null>(null);

export const OIGReportsProvider = ({ children }: { children: React.ReactNode }) => {
  const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentMonth());
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [search, setSearch] = useState<string>('');
  const [pagination, setPagination] = useState<{ page: number; page_size: number }>({
    page: 1,
    page_size: 200
  });

  const {
    data: verifications,
    isLoading,
    isError,
    refetch
  } = useQuery(
    [
      'oigVerifications',
      selectedMonth,
      selectedStatus,
      search,
      pagination.page,
      pagination.page_size
    ],
    () =>
      fetchVerifications({
        month: selectedMonth,
        status: selectedStatus !== 'all' ? selectedStatus : undefined,
        search: search.trim() || undefined,
        page: pagination.page,
        page_size: pagination.page_size
      }),
    { keepPreviousData: true }
  );

  return (
    <OIGReportsContext.Provider
      value={{
        selectedMonth,
        setSelectedMonth,
        selectedStatus,
        setSelectedStatus,
        verifications,
        isLoading,
        isError,
        refetch,
        search,
        setSearch,
        pagination,
        setPagination
      }}
    >
      {children}
    </OIGReportsContext.Provider>
  );
};

export const useOIGReports = (): IOIGReportsContextType => {
  const context = useContext(OIGReportsContext);
  if (!context) {
    throw new Error('useOIGReports must be used within an OIGReportsProvider');
  }
  return context;
};
