import React, { Dispatch, SetStateAction } from 'react';

export interface IFilterContext {
  status: string;
  search: string;
  document_type?: string;
  page: number;
  page_size: number;
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
  dateFilters: {
    starting_date: string;
    ending_date: string;
  };
  isArchived: boolean;
}

export interface IFaxesInboxContext {
  faxesInbox: any;
  setFilters: Dispatch<SetStateAction<IFilterContext>>;
  filters: IFilterContext;
  isLoading: boolean;
  isQueryEnabled: boolean;
  refetch: any;
  initialFilterState: IFilterContext;
  selectedDateFilter: string;
  setSelectedDateFilter: React.Dispatch<React.SetStateAction<string>>;
  inboxGroupFields: any;
  fetchSingleFaxQuery: any;
  fetchPDFUrl?: any;
  fetchRejectionReason: any;
  categories: any;
  tags: Array<[]>;
  refetchTags: any;
  refetchGroupFields: any;
  lastSeenData: [];
  refetchSeenInbox?: any;
}

export interface IFilterItem {
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

export interface IFilterSort {
  field: string;
  order: string;
}

export interface ISettingFilterContext {
  filter_by_value: {
    [key: string]: string[];
  };
}
