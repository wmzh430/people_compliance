import React, { useState } from 'react';
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
import ConditionFilters from '@/pages/fd-reports/components/Filter/ConditionFilters.tsx';
import ValueFilter from '@/pages/fd-reports/components/Filter/ValueFilter.tsx';
import { useFilter } from '@/pages/fd-reports/context/FilterContext.tsx';
import { useReports } from '@/pages/fd-reports/context/ReportsContext.tsx';
import { KeenIcon } from '@/components';

interface IFilterProps {
  title: string;
  column: any;
  isDate: boolean;
  data?: any;
}

const Filter: React.FC<IFilterProps> = ({ title, column, isDate, data }) => {
  const { reportsRefetch, setFilter, initialFilterState, filter } = useReports();
  const [isOpen, setIsOpen] = useState(false);

  const mapColumns = () => {
    switch (column.id) {
      case 'provider_name':
      case 'patient_name':
      case 'medical_record_number':
      case 'archer_status':
      case 'region':
      case 'dietician':
      case 'has_signature':
        return column.id;

      case 'taskName':
        return 'task_name';

      case 'status':
        return 'status_category';

      case 'target_date':
        return 'target_date';

      case 'discipline':
        return 'discipline';

      case 'insurance':
        return 'insurance';
      case 'approved_at':
        return 'approved_at';
      case 'scheduled_at':
        return 'scheduled_at';
      case 'delay_time':
        return 'delay_time';
      default:
        return undefined;
    }
  };

  const columnId = mapColumns();

  const handleCancel = async () => {
    await setFilter((prevState) => ({
      ...prevState,
      filters: {
        ...prevState.filters,
        [columnId]: initialFilterState.filters[columnId]
      },
      dateFilters: {
        ...prevState.dateFilters,
        [columnId]: initialFilterState.dateFilters
      },
      filterByValue: {
        ...prevState.filterByValue,
        [columnId]: initialFilterState.filterByValue[columnId]
      }
    }));
    reportsRefetch();
    setIsOpen(false);
  };

  const handleSorting = async (order: 'asc' | 'desc') => {
    await setFilter((prevState) => ({
      ...prevState,
      sort: {
        field: column.id,
        order: order
      }
    }));
    reportsRefetch();
  };

  const isActive =
    (filter.filters[columnId]?.filter_value && filter.filters[columnId]?.filter_value !== '') ||
    (filter.filterByValue[columnId] && filter.filterByValue[columnId].length > 0);

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
          {column.getIsSorted() === 'desc' ? (
            <ArrowDown className="!size-[0.825rem]" />
          ) : column.getIsSorted() === 'asc' ? (
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
              onClick={() => {
                if (column.id === 'provider_name' || column.id === 'patient_name') {
                  handleSorting('asc');
                  column.toggleSorting(false);
                } else {
                  column.toggleSorting(false);
                }
              }}
              isChecked={column.getIsSorted() === 'asc'}
              icon={<ArrowUp />}
              name={'Asc'}
            />
            <SortingFilters
              onClick={() => {
                if (column.id === 'provider_name' || column.id === 'patient_name') {
                  handleSorting('desc');
                  column.toggleSorting(true);
                } else {
                  column.toggleSorting(true);
                }
              }}
              isChecked={column.getIsSorted() === 'desc'}
              icon={<ArrowDown />}
              name={'Desc'}
            />
          </>
        )}
        {columnId !== 'region' && <DropdownMenuSeparator />}
        {columnId !== 'status_category' &&
          columnId != 'dietician' &&
          columnId != 'has_signature' &&
          columnId !== 'region' &&
          columnId !== 'target_date' &&
          columnId !== 'discipline' &&
          columnId !== 'insurance' &&
          columnId !== 'delay_time' &&
          columnId !== 'approved_at' &&
          columnId !== 'scheduled_at' && <ConditionFilters isDate={isDate} column={column} />}
        {/* {columnId !== 'target_date' && ( */}
        <>
          <ValueFilter column={column} />

          <div className="space-x-1 mt-4 mb-1 justify-end flex">
            <button
              className="btn text-red-600 btn-sm"
              onClick={() => {
                handleCancel();
              }}
            >
              Clear
            </button>
            <button
              className="btn btn-sm btn-dark text-white"
              onClick={() => {
                reportsRefetch();
                setIsOpen(false);
              }}
            >
              Ok
            </button>
          </div>
        </>
        {/* )} */}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default Filter;
