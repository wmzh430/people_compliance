import React, { useState, useCallback, useEffect } from 'react';
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
import ValueFilter from './ValueFilter';

import { useClinicians } from '@/pages/clinicians/context/CliniciansContext.tsx';

interface IFilterProps {
  title: string;
  column: any;
  isDate: boolean;
  data?: any;
}

const Filter: React.FC<IFilterProps> = ({ title, column }) => {
  const { cliniciansRefetch, setFilter, filter, initialFilterState } = useClinicians();
  const [isOpen, setIsOpen] = useState(false);
  const [tempFilter, setTempFilter] = useState<string[]>([]);

  const mapColumns = () => {
    switch (column.id) {
      case 'provider_name':
      case 'patient_name':
      case 'medical_record_number':
      case 'archer_status':
      case 'region':
      case 'dietician':
        return column.id;

      case 'taskName':
        return 'task_name';

      case 'status':
        return 'status_category';

      case 'targetDate':
        return 'target_date';

      default:
        return undefined;
    }
  };

  const columnId = mapColumns();

  const handleCancel = async () => {
    await setFilter((prevState) => ({
      ...prevState,
      filter_by_value: {
        ...prevState.filter_by_value,
        [columnId]: initialFilterState.filter_by_value[columnId] || []
      }
    }));

    cliniciansRefetch();
    setIsOpen(false);
  };

  const handleSorting = async (order: 'asc' | 'desc') => {
    await setFilter((prevState) => ({
      ...prevState,
      sort: {
        field: column.id,
        direction: order
      }
    }));
    cliniciansRefetch();
  };

  useEffect(() => {
    setTempFilter(filter.filter_by_value.region || []);
  }, [filter.filter_by_value.region]);

  const applyFilter = useCallback(async () => {
    await setFilter((prevFilter) => ({
      ...prevFilter,
      filter_by_value: {
        region: tempFilter
      }
    }));

    cliniciansRefetch();
    setIsOpen(false);
  }, [tempFilter, setFilter]);

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn('-ms-3 h-8 data-[state=open]:bg-accent !ring-0 !ring-offset-0')}
        >
          <span className={`text-sm`}>{title}</span>
          {/*{isActive && <KeenIcon icon="filter" className="text-primary" />}*/}
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
              isChecked={column.getIsSorted() === 'asc'}
              icon={<ArrowUp />}
              name={'Asc'}
            />
            <SortingFilters
              onClick={() => handleSorting('desc')}
              isChecked={column.getIsSorted() === 'desc'}
              icon={<ArrowDown />}
              name={'Desc'}
            />
          </>
        )}
        {/*{columnId !== 'region' && columnId !== 'target_date' && <DropdownMenuSeparator />}*/}
        {/*{columnId !== 'status_category' && columnId != 'dietician' && columnId !== 'region' && columnId !== 'target_date' && (*/}
        {/*  // <ConditionFilters isDate={isDate} column={column} />*/}
        {/*  <></>*/}
        {/*)}*/}
        {columnId === 'region' && (
          <>
            <ValueFilter column={column} tempFilter={tempFilter} setTempFilter={setTempFilter} />

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
                  applyFilter();
                }}
              >
                Ok
              </button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default Filter;
