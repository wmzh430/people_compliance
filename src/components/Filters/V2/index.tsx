//@ts-nocheck
import React, { useMemo, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button.tsx';
import { cn } from '@/lib/utils.ts';
import { ArrowDown, ArrowUp, ChevronsUpDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu.tsx';
import SortingFilters from '@/pages/fd-reports/components/Filter/SortingFilters.tsx';
import ConditionFilters from './ConditionFilter';
import { KeenIcon } from '@/components';
import ValueFilter from './ValueFilter';
import RangeFilter from './RangeFilter';
import { useFaxesInbox } from '@/pages/faxes/inbox/context/FaxesInboxContext';
import { useOrdersInbox } from '@/pages/orders/inbox/context/OrdersInboxContext';
import { useReferral } from '@/pages/referrals/context/ReferralContext';

interface IFilterProps {
  title: string;
  column: any;
  filter?: any;
  setFilter?: any;
  refetch: any;
  initialFilterState?: any;
  groupedFields: any;
  isActionButton?: boolean;
  isValueFilter?: boolean;
  contextHook?: () => any; // Add context hook prop
  metadataField?: string;
  sortField?: string;
}

const FilterV2: React.FC<IFilterProps> = ({
  title,
  column,
  refetch,
  filter,
  setFilter,
  initialFilterState,
  groupedFields,
  isActionButton,
  isValueFilter,
  contextHook,
  metadataField,
  sortField
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Use provided context hook or fall back to Referral context
  let contextFilters: any = null;
  let activeFilters: any = null;
  let setActiveFilters: any = null;

  if (contextHook) {
    try {
      contextFilters = contextHook();
      activeFilters = filter || contextFilters.filters || contextFilters.filter;
      setActiveFilters = setFilter || contextFilters.setFilters || contextFilters.setFilter;
    } catch (error) {
      console.warn('Context hook failed, falling back to Referral context:', error);
      // Fall back to Referral context
      try {
        const referralContext = useReferral();
        activeFilters = filter || referralContext.filters;
        setActiveFilters = setFilter || referralContext.setFilters;
      } catch (fallbackError) {
        console.error('Both context hook and Referral context failed:', fallbackError);
        activeFilters = filter;
        setActiveFilters = setFilter;
      }
    }
  } else {
    // No context hook provided, try to use Referral context
    try {
      const referralContext = useReferral();
      activeFilters = filter || referralContext.filters;
      setActiveFilters = setFilter || referralContext.setFilters;
    } catch (error) {
      console.warn('Referral context not available, using props only:', error);
      activeFilters = filter;
      setActiveFilters = setFilter;
    }
  }

  // Ensure we have the required functions
  if (!setActiveFilters) {
    console.error('FilterV2: No setFilter function available from props or context');
    return null; // Don't render if we can't set filters
  }

  const columnId = column?.id;

  // Get the metadata field name for this column
  const getMetadataField = (columnId: string) => {
    // Map column IDs to metadata field names
    const fieldMapping: { [key: string]: string } = {
      status: 'statuses',
      order_id: 'order_ids',
      order_delivery_preference: 'preferences',
      is_merged: 'merged',
      is_checked_out: 'is_checked_out',
      // Referral-specific mappings
      source: 'sources',
      sources: 'sources',
      is_existing_patient: 'is_existing_patient',
      // OrderReceived-specific mappings
      merged: 'merged',
      preferences: 'preferences',
      // OrdersManagement-specific mappings
      delivery_preference: 'preferences',
      ring_central_status: 'ringcentral_statuses'
      // Add more mappings as needed
    };

    return fieldMapping[columnId] || columnId;
  };

  function getColumnId(id: string) {
    switch (id) {
      case 'physician_name':
        return 'physician';
      case 'patient_name':
        return 'patient';
      case 'order_type':
        return 'order_type';
      case 'ordered':
        return 'ordered_at';
      default:
        return id;
    }
  }

  const resolvedMetadataField = metadataField || getMetadataField(columnId);
  const resolvedSortField = sortField || getColumnId(columnId);

  const handleCancel = async () => {
    // Reset the specific metadata field to its initial state
    const initialState = initialFilterState || contextFilters?.initialFilterState || activeFilters;
    await setActiveFilters((prevState: any) => ({
      ...prevState,
      metadata: {
        ...prevState.metadata,
        [resolvedMetadataField]: initialState?.metadata?.[resolvedMetadataField] || []
      }
    }));
    refetch();
    setIsOpen(false);
  };

  const handleSorting = async (order: 'asc' | 'desc') => {
    const sortValue = order === 'desc' ? `-${resolvedSortField}` : resolvedSortField;

    await setActiveFilters((prevState: any) => ({
      ...prevState,
      metadata: {
        ...prevState.metadata,
        order_by: sortValue
      }
    }));
    refetch();
  };

  const handleIsFilterActive = () => {
    // Check if the metadata field has values (excluding query, order_by, from_date, to_date)
    // Use the filter prop passed from parent, not the context filters
    const metadataValue = activeFilters?.metadata?.[resolvedMetadataField];

    if (Array.isArray(metadataValue)) {
      return metadataValue.length > 0;
    } else if (typeof metadataValue === 'boolean') {
      return metadataValue !== null && metadataValue !== undefined;
    } else if (metadataValue !== null && metadataValue !== undefined && metadataValue !== '') {
      return true;
    }

    return false;
  };

  const isActive = handleIsFilterActive();

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn('-ms-3 h-8 data-[state=open]:bg-accent !ring-0 !ring-offset-0')}
        >
          <span className={cn('text-sm', isActive && 'font-bold text-black')}>{title}</span>

          {isActive && <KeenIcon icon="filter" className="text-primary" />}

          {activeFilters?.metadata?.order_by === resolvedSortField ||
          activeFilters?.metadata?.order_by === `-${resolvedSortField}` ? (
            activeFilters?.metadata?.order_by?.startsWith('-') ? (
              <ArrowDown className="!size-[0.825rem]" />
            ) : (
              <ArrowUp className="!size-[0.825rem]" />
            )
          ) : (
            <ChevronsUpDown className="!size-[0.825rem]" />
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="min-w-[300px] max-h-[500px] overflow-y-auto">
        {column.getCanSort() && (
          <>
            <SortingFilters
              onClick={() => handleSorting('asc')}
              isChecked={activeFilters?.metadata?.order_by === resolvedSortField}
              icon={<ArrowUp />}
              name={'Asc'}
            />
            <SortingFilters
              onClick={() => handleSorting('desc')}
              isChecked={activeFilters?.metadata?.order_by === `-${resolvedSortField}`}
              icon={<ArrowDown />}
              name={'Desc'}
            />
          </>
        )}

        {isValueFilter && (
          <>
            <DropdownMenuSeparator />
            <ValueFilter
              column={column}
              groupedFields={groupedFields}
              metadataField={resolvedMetadataField}
              onApply={() => {
                refetch();
                setIsOpen(false);
              }}
              contextHook={contextHook}
            />
          </>
        )}

        {isActionButton && !isValueFilter && (
          <div className="space-x-1 mt-4 mb-1 justify-end flex">
            <button className="btn text-red-600 btn-sm" onClick={handleCancel}>
              Clear
            </button>
            <button
              className="btn btn-sm btn-dark text-white w-[60px] text-center flex justify-center"
              onClick={() => {
                refetch();
                setIsOpen(false);
              }}
            >
              Ok
            </button>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default FilterV2;
