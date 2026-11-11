//@ts-nocheck
import React, { useMemo, useState } from 'react';
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

interface IFilterProps {
  title: string;
  column: any;
  isDate: boolean;
  data?: any;
  filter: any;
  setFilter: any;
  refetch: any;
  initialFilterState: any;
  groupedFields: any;
  isActionButton?: boolean;
  isOrder?: boolean;
}

const GenericFilter: React.FC<IFilterProps> = ({
  title,
  column,
  isDate,
  refetch,
  filter: _filterFromParent,
  setFilter,
  initialFilterState,
  groupedFields,
  isActionButton,
  isOrder
}) => {
  const [isOpen, setIsOpen] = useState(false);
  // Live filter state from context — do not use the `filter` prop for display (column defs
  // are memoized without `filters` in deps so the dropdown is not unmounted on each toggle).
  const { inboxGroupFields, filters, setFilters } = isOrder ? useOrdersInbox() : useFaxesInbox();

  const mapColumns = () => {
    switch (column?.id) {
      case 'employee_id':
        return 'employee_id';
      case 'provider_name':
        return 'provider';
      case 'total_visit_length':
        return 'visit_length';
      case 'oasis':
        return 'oasis';
      case 'pt_visit_supervisory':
        return 'pt_visit_w_supervisory_visit';
      case 'snv_lvn_supervision':
        return 'snv_w_lvn_supervision';
      case 'evaluation':
        return 'evaluation';
      case 'visit':
        return 'visit';
      case 'suffix':
        return 'suffix';
      case 'region':
        return 'region';
      case 'from_phoneNumber':
        return 'from_phoneNumber';
      case 'to_phoneNumber':
        return 'to_phoneNumber';
      case 'category':
        return 'category';
      case 'sub_category':
        return 'sub_category';
      case 'lastModifiedTime':
        return 'lastModifiedTime';
      case 'creationTime':
        return 'creationTime';
      case 'patient_name':
        return 'patient_name';
      case 'transmitted':
        return 'transmitted';
      case 'assignee':
        return 'assignee';
      case 'is_accepted':
        return 'is_accepted';
      case 'department':
        return 'department';
      case 'is_existing_patient':
        return 'is_existing_patient';

      default:
        return '';
    }
  };

  const columnId = mapColumns();

  const handleCancel = async () => {
    if (columnId == 'provider') {
      await setFilter((prevState) => ({
        ...prevState,
        filters_by_conditions: {
          ...prevState.filters_by_conditions,
          [columnId]: initialFilterState.filters_by_conditions[columnId]
        },
        filters_by_value: {
          ...prevState.filters_by_value,
          [column.id]: initialFilterState.filters_by_value[columnId]
        },
        sort: {
          ...prevState.sort,
          [columnId]: initialFilterState.sort
        }
      }));
    } else {
      await setFilter((prevState) => ({
        ...prevState,
        filters_by_conditions: {
          ...prevState.filters_by_conditions,
          [columnId]: initialFilterState?.filters_by_conditions[columnId]
        },
        filters_by_value: {
          ...prevState.filters_by_value,
          [columnId]: initialFilterState?.filters_by_value[columnId]
        },
        sort: {
          ...prevState.sort,
          [columnId]: initialFilterState?.sort
        }
      }));
    }
    refetch();
    setIsOpen(false);
  };

  const handleSorting = async (order: 'asc' | 'desc') => {
    if (columnId == 'visit_length') {
      await setFilter((prevState) => ({
        ...prevState,
        sort: {
          field: 'total_visit_length',
          order
        }
      }));
    } else {
      await setFilter((prevState) => ({
        ...prevState,
        sort: {
          field: columnId,
          order
        }
      }));
    }
    refetch();
  };

  const handleIsFilterActive = () => {
    if (columnId == 'provider') {
      return (
        (filters.filters_by_conditions['provider_name']?.value &&
          filters.filters_by_value['provider_name']?.value !== '') ||
        (filters.filters_by_value['provider_name'] &&
          filters.filters_by_value['provider_name'].length > 0)
      );
    } else if (columnId == 'total_visit_length') {
      return (
        filters.filters_by_conditions['visit_length']?.min != 0 &&
        filters.filters_by_conditions['visit_length']?.max != 100
      );
    } else if (columnId == 'suffix') {
      return false;
    } else if (columnId == 'region') {
      return filters.filters_by_value['region'] && filters.filters_by_value['region'].length > 0;
    } else if (columnId == 'employee_id') {
      return (
        filters.filters_by_value['employee_id'] &&
        filters.filters_by_value['employee_id'].length > 0
      );
    } else if (columnId === 'category') {
      return (
        filters.filters_by_value['category'] && filters.filters_by_value['category']?.length > 0
      );
    } else if (columnId === 'sub_category') {
      return (
        filters.filters_by_value['sub_category'] &&
        filters.filters_by_value['sub_category'].length > 0
      );
    } else if (columnId === 'to_phoneNumber') {
      return (
        filters.filters_by_value['to_phoneNumber'] &&
        filters.filters_by_value['to_phoneNumber'].length > 0
      );
    } else if (columnId === 'from_phoneNumber') {
      return (
        filters.filters_by_value['from_phoneNumber'] &&
        filters.filters_by_value['from_phoneNumber'].length > 0
      );
    } else if (columnId === 'creationTime') {
      return (
        filters.filters_by_value['creationTime'] &&
        filters.filters_by_value['creationTime'].length > 0
      );
    } else if (columnId === 'is_existing_patient') {
      return (
        filters.filters_by_value['is_existing_patient'] &&
        filters.filters_by_value['is_existing_patient'].length > 0
      );
    } else if (columnId === 'lastModifiedTime') {
      return (
        filters.filters_by_value['lastModifiedTime'] &&
        filters.filters_by_value['lastModifiedTime'].length > 0
      );
    } else if (columnId === 'patient_name') {
      return (
        filters.filters_by_value['patient_name'] &&
        filters.filters_by_value['patient_name'].length > 0
      );
    } else if (columnId === 'department') {
      return (
        filters.filters_by_value['department'] && filters.filters_by_value['department'].length > 0
      );
    } else if (columnId === 'assignee') {
      return (
        filters.filters_by_value['assignee'] && filters.filters_by_value['assignee'].length > 0
      );
    } else if (columnId === 'is_accepted') {
      return (
        filters.filters_by_value['is_accepted'] &&
        filters.filters_by_value['is_accepted'].length > 0
      );
    } else {
      return (
        (filters.filters_by_conditions[columnId]?.value &&
          filters.filters_by_value[columnId]?.value !== '') ||
        (filters.filters_by_value[columnId] && filters.filters_by_value[columnId].length > 0) ||
        filters.filters_by_conditions[columnId]?.min != 0 ||
        filters.filters_by_conditions[columnId]?.max != 100
      );
    }
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
          <span className={`text-sm ${isActive ? 'font-bold text-black' : ''}`}>{title}</span>
          {isActive && <KeenIcon icon="filter" className="text-primary" />}
          {filters.sort.field === column.id && filters.sort.order === 'desc' ? (
            <ArrowDown className="!size-[0.825rem]" />
          ) : filters.sort.field === column.id && filters.sort.order === 'asc' ? (
            <ArrowUp className="!size-[0.825rem]" />
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
              isChecked={filters.sort.field === column.id && filters.sort.order === 'asc'}
              icon={<ArrowUp />}
              name={'Asc'}
            />
            <SortingFilters
              onClick={() => handleSorting('desc')}
              isChecked={filters.sort.field === column.id && filters.sort.order === 'desc'}
              icon={<ArrowDown />}
              name={'Desc'}
            />
          </>
        )}
        {columnId !== 'suffix' && isActionButton && <DropdownMenuSeparator />}
        {/*{column.id === 'provider_name' && <ConditionFilters column={column} />}*/}
        {[
          'category',
          'sub_category',
          'to_phoneNumber',
          'from_phoneNumber',
          'patient_name',
          'assignee',
          'is_accepted',
          'department',
          'is_existing_patient'
        ].includes(column.id) && (
          <ValueFilter
            column={column}
            setFilter={setFilter}
            groupedFields={groupedFields}
            isOrder={isOrder}
          />
        )}
        {/* {column.id !== 'provider_name' &&
          column.id !== 'employee_id' &&
          column.id != 'suffix' &&
          column.id != 'region' && <RangeFilter column={column} />}*/}

        {isActionButton && (
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

export default GenericFilter;
