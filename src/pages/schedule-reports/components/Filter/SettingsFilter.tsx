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
import ValueFilter from '@/pages/schedule-reports/components/Filter/SettingValueFilter.tsx';
import { useFilter } from '@/pages/fd-reports/context/FilterContext.tsx';
import { useReports } from '@/pages/fd-reports/context/ReportsContext.tsx';
import { KeenIcon } from '@/components';
import { useSchedule } from '@/pages/schedule-reports/context/ScheduleContext.tsx';

interface IFilterProps {
  title: string;
  column: any;
  isDate: boolean;
  data?: any;
}

const SettingsFilter: React.FC<IFilterProps> = ({ title, column, isDate, data }) => {
  const { refetchSettings, setSettingFilters, initialSettingFilterState, settingFilters } =
    useSchedule();
  const [isOpen, setIsOpen] = useState(false);

  // const mapColumns = () => {
  //   switch (column.id) {
  //     case 'provider_name':
  //     case 'patient_name':
  //     case 'medical_record_number':
  //     case 'archer_status':
  //     case 'region':
  //       return column.id;
  //
  //     case 'taskName':
  //       return 'task_name';
  //
  //     case 'status':
  //       return 'status_category';
  //
  //     case 'targetDate':
  //       return 'target_date';
  //
  //     default:
  //       return undefined;
  //   }
  // };
  //
  const columnId = column?.id == 'task_name' ? 'task_name' : '';
  //
  const handleCancel = async () => {
    await setSettingFilters((prevState: any) => ({
      ...prevState,
      filter_by_value: {
        ...prevState.filter_by_value,
        [columnId]: initialSettingFilterState.filter_by_value[columnId]
      }
    }));
    refetchSettings();
    setIsOpen(false);
  };
  //
  const isActive =
    settingFilters.filter_by_value[columnId] && settingFilters.filter_by_value[columnId].length > 0;

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn('-ms-3 h-8 data-[state=open]:bg-accent !ring-0 !ring-offset-0')}
        >
          <span
            className={`text-sm ${isActive && columnId == 'task_name' ? 'font-bold text-black' : ''}`}
          >
            {title}
          </span>
          {isActive && columnId == 'task_name' && (
            <KeenIcon icon="filter" className="text-primary" />
          )}
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
              onClick={() => column.toggleSorting(false)}
              isChecked={column.getIsSorted() === 'asc'}
              icon={<ArrowUp />}
              name={'Asc'}
            />
            <SortingFilters
              onClick={() => column.toggleSorting(true)}
              isChecked={column.getIsSorted() === 'desc'}
              icon={<ArrowDown />}
              name={'Desc'}
            />
          </>
        )}
        {/*{columnId !== 'region' && columnId !== 'target_date' && <DropdownMenuSeparator />}*/}
        {/*{columnId !== 'status_category' && columnId !== 'region' && columnId !== 'target_date' && (*/}
        {/*  <ConditionFilters isDate={isDate} column={column} />*/}
        {/*)}*/}
        {/*{columnId !== 'target_date' && (*/}
        <>
          {column.id === 'task_name' && (
            <>
              <DropdownMenuSeparator />
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
                  className="btn btn-sm btn-dark text-white w-[60px] text-center flex justify-center"
                  onClick={() => {
                    refetchSettings();
                    setIsOpen(false);
                  }}
                >
                  Ok
                </button>
              </div>
            </>
          )}
        </>
        {/*)}*/}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default SettingsFilter;
