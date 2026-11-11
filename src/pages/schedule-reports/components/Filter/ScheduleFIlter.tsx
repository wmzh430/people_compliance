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
import { useSchedule } from '../../context/ScheduleContext';
import { KeenIcon } from '@/components';
import ValueFilter from './ValueFilter';
import RangeFilter from './RangeFilter';

interface IFilterProps {
  title: string;
  column: any;
  isDate: boolean;
  data?: any;
}

const ScheduleFilter: React.FC<IFilterProps> = ({ title, column, isDate }) => {
  const { refetchStaff, setFilter, initialFilterState, filter } = useSchedule();
  const [isOpen, setIsOpen] = useState(false);

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
      case 'user_type':
        return 'user_type';

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
          [columnId]: initialFilterState.filters_by_conditions[columnId]
        },
        filters_by_value: {
          ...prevState.filters_by_value,
          [columnId]: initialFilterState.filters_by_value[columnId]
        },
        sort: {
          ...prevState.sort,
          [columnId]: initialFilterState.sort
        }
      }));
    }
    refetchStaff();
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
    refetchStaff();
  };

  const handleIsFilterActive = () => {
    if (columnId == 'provider') {
      return (
        (filter.filters_by_conditions['provider_name']?.value &&
          filter.filters_by_value['provider_name']?.value !== '') ||
        (filter.filters_by_value['provider_name'] &&
          filter.filters_by_value['provider_name'].length > 0)
      );
    } else if (columnId == 'total_visit_length') {
      return (
        filter.filters_by_conditions['visit_length']?.min != 0 &&
        filter.filters_by_conditions['visit_length']?.max != 100
      );
    } else if (columnId == 'user_type') {
      return (
        filter.filters_by_value['user_type'] && filter.filters_by_value['user_type'].length > 0
      );
    } else if (columnId == 'region') {
      return filter.filters_by_value['region'] && filter.filters_by_value['region'].length > 0;
    } else if (columnId == 'employee_id') {
      return (
        filter.filters_by_value['employee_id'] && filter.filters_by_value['employee_id'].length > 0
      );
    } else {
      return (
        (filter.filters_by_conditions[columnId]?.value &&
          filter.filters_by_value[columnId]?.value !== '') ||
        (filter.filters_by_value[columnId] && filter.filters_by_value[columnId].length > 0) ||
        filter.filters_by_conditions[columnId]?.min != 0 ||
        filter.filters_by_conditions[columnId]?.max != 100
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
          {filter.sort.field === column.id && filter.sort.order === 'desc' ? (
            <ArrowDown className="!size-[0.825rem]" />
          ) : filter.sort.field === column.id && filter.sort.order === 'asc' ? (
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
              isChecked={filter.sort.field === column.id && filter.sort.order === 'asc'}
              icon={<ArrowUp />}
              name={'Asc'}
            />
            <SortingFilters
              onClick={() => handleSorting('desc')}
              isChecked={filter.sort.field === column.id && filter.sort.order === 'desc'}
              icon={<ArrowDown />}
              name={'Desc'}
            />
          </>
        )}
        <DropdownMenuSeparator />
        {column.id === 'provider_name' && <ConditionFilters column={column} />}
        {['provider_name', 'employee_id', 'region', 'suffix', 'user_type'].includes(column.id) && (
          <ValueFilter column={column} />
        )}
        {column.id !== 'provider_name' &&
          column.id !== 'employee_id' &&
          column.id != 'user_type' &&
          column.id != 'region' && <RangeFilter column={column} />}

        <div className="space-x-1 mt-4 mb-1 justify-end flex">
          <button className="btn text-red-600 btn-sm" onClick={handleCancel}>
            Clear
          </button>
          <button
            className="btn btn-sm btn-dark text-white w-[60px] text-center flex justify-center"
            onClick={() => {
              refetchStaff();
              setIsOpen(false);
            }}
          >
            Ok
          </button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ScheduleFilter;
