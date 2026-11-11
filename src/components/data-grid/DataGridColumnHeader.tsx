import { HTMLAttributes } from 'react';
import { Column } from '@tanstack/react-table';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import Filter from '@/pages/fd-reports/components/Filter';
import ScheduleFilter from '@/pages/schedule-reports/components/Filter/ScheduleFIlter';
import SettingsFilter from '@/pages/schedule-reports/components/Filter/SettingsFilter.tsx';
import ClinicianFilter from '@/pages/clinicians/components/Filters';
import GenericFilter from '@/components/Filters/ColumnFilters';
import FilterV2 from '@/components/Filters/V2';

interface IDataGridColumnHeader<TData, TValue> extends HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>;
  title?: string;
  data?: any;
  isFilter?: boolean;
  isRange?: boolean;
  isDate?: boolean;
  isStaff?: boolean;
  isStaffSetting?: boolean;
  isClinical?: boolean; // Fixed spelling
  isGenericFilter?: boolean;
  refetch?: any;
  filter?: any;
  setFilter?: any;
  initialFilterState?: any;
  groupedFields?: any;
  isActionButton?: boolean;
  isOrder?: boolean;
  isV2Filter?: boolean;
  isValueFilter?: boolean;
}

export function DataGridColumnHeader<TData, TValue>({
  column,
  title = '',
  className,
  data,
  isFilter,
  isRange,
  isStaff = false,
  isStaffSetting = false,
  isDate = false,
  isClinical = false, // Fixed spelling
  isGenericFilter = false,
  refetch,
  filter,
  setFilter,
  initialFilterState,
  groupedFields,
  isActionButton,
  isOrder = false,
  isV2Filter = false,
  isValueFilter = false
}: IDataGridColumnHeader<TData, TValue>) {
  if (isFilter) {
    if (isClinical) {
      return <ClinicianFilter title={title} column={column} isDate={false} />;
    }
    if (isStaff) {
      return isStaffSetting ? (
        <SettingsFilter title={title} column={column} isDate={isDate} />
      ) : (
        <ScheduleFilter title={title} column={column} isDate={isDate} />
      );
    }
    return <Filter title={title} column={column} isDate={isDate} />;
  }

  if (isGenericFilter) {
    return (
      <GenericFilter
        title={title}
        column={column}
        isDate={false}
        filter={filter}
        setFilter={setFilter}
        refetch={refetch}
        initialFilterState={initialFilterState}
        groupedFields={groupedFields}
        isActionButton={isActionButton}
        isOrder={isOrder}
      />
    );
  }

  if (isV2Filter) {
    return (
      <FilterV2
        title={title}
        column={column}
        filter={filter}
        setFilter={setFilter}
        refetch={refetch}
        initialFilterState={initialFilterState}
        groupedFields={groupedFields}
        isActionButton={isActionButton}
        isValueFilter={isValueFilter}
      />
    );
  }

  // Default button if no filter is applied
  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          '-ms-3 h-8 data-[state=open]:bg-accent !ring-0 !ring-offset-0 cursor-default',
          className
        )}
      >
        <span className="text-sm">{title}</span>
      </Button>
    </div>
  );
}
