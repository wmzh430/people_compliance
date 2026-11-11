import React, { useState } from 'react';
import { DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu.tsx';
import { ChevronDown, ChevronUp, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button.tsx';
import { capitalizeFirstLetter } from '@/utils';
import { Calendar } from '@/components/ui/calendar.tsx';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select.tsx';
import { useReports } from '@/pages/fd-reports/context/ReportsContext.tsx';
import { KeenIcon } from '@/components';
import { DATE_TOMORROW } from '@/constants/dateFilter';

interface IConditionProps {
  isDate: boolean;
  column: any;
}

const ConditionFilters = ({ isDate, column }: IConditionProps) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [displayDate, setDisplayDate] = useState<any>(null);

  const { filter, setFilter } = useReports();

  const dateFilterPills = ['past_week', 'this_week', 'next_week', DATE_TOMORROW, 'custom_date'];

  const mapColumns = () => {
    switch (column.id) {
      case 'provider_name':
      case 'patient_name':
      case 'medical_record_number':
      case 'archer_status':
        return column.id;

      case 'taskName':
        return 'task_name';

      case 'status':
        return 'status_category';

      case 'targetDate':
        return 'target_date';

      case 'disciplines':
        return 'disciplines';

      default:
        return undefined;
    }
  };

  const columnId = mapColumns();

  const formatDate = (date: Date | null) => {
    if (!date) return '';
    const year = date.getFullYear();
    const month = `0${date.getMonth() + 1}`.slice(-2);
    const day = `0${date.getDate()}`.slice(-2);
    return `${year}-${month}-${day}`;
  };

  const handleDateFilterChange = (pill: string, value: Date | null | undefined) => {
    // @ts-ignore
    setFilter((prevState) => ({
      ...prevState,
      dateFilters: {
        ...prevState.dateFilters,
        filter_type: pill,
        filter_value: value ? formatDate(value) : ''
      }
    }));
    if (pill === 'custom_date') {
      setShowCalendar(true);
    } else {
      setShowCalendar(false);
    }
  };

  const handleConditionChange = (value: string) => {
    setFilter((prevState) => ({
      ...prevState,
      filters: {
        ...prevState.filters,
        [columnId]: {
          ...prevState.filters[columnId],
          filter_type: value
        }
      }
    }));
  };

  const handleTextFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFilter((prevState) => ({
      ...prevState,
      filters: {
        ...prevState.filters,
        [columnId]: {
          ...prevState.filters[columnId],
          filter_value: value
        }
      }
    }));
  };

  const renderDateFilters = () => {
    return dateFilterPills.map((pill) => (
      <p
        key={pill}
        className={`cursor-pointer hover:bg-gray-200 p-1 m-1 rounded text-xs flex justify-between items-center ${
          'filter_type' in filter.dateFilters && filter.dateFilters.filter_type === pill
            ? 'bg-gray-300 text-black'
            : ''
        }`}
        onClick={() => handleDateFilterChange(pill, null)}
      >
        {capitalizeFirstLetter(pill.replace('_', ' '))}
      </p>
    ));
  };

  const renderTextFilter = () => {
    const options = [
      { value: 'is_empty', label: 'Is Empty' },
      { value: 'is_not_empty', label: 'Is Not Empty' },
      { value: 'text_starts_with', label: 'Text Starts With' },
      { value: 'text_contains', label: 'Text Contains' },
      { value: 'text_equals', label: 'Text Equals' }
    ];

    return (
      <div className="mb-3 mt-2 mx-4">
        <Select value={filter.filters[columnId]?.filter_type} onValueChange={handleConditionChange}>
          <SelectTrigger className="!" size="sm">
            <SelectValue>
              {capitalizeFirstLetter(
                options.find((option) => option.value === filter.filters[columnId]?.filter_type)
                  ?.label || 'Select'
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent side="bottom">
            <SelectItem value="None">None</SelectItem>
            <DropdownMenuSeparator />
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {['text_starts_with', 'text_contains', 'text_equals'].includes(
          filter.filters[columnId]?.filter_type
        ) && (
          <div className="mt-2">
            <input
              type="text"
              placeholder="Enter value"
              value={filter.filters[columnId]?.filter_value}
              onChange={handleTextFilterChange}
              className="input input-sm w-full"
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <DropdownMenuItem
        onClick={(e) => {
          e.preventDefault();
          setIsFilterOpen((prev) => !prev);
        }}
      >
        <Filter className="!size-[0.825rem] text-muted-foreground/90" />
        <span className="grow">Filter by Condition</span>
        {isFilterOpen ? <ChevronUp /> : <ChevronDown />}
      </DropdownMenuItem>
      {isFilterOpen && (
        <div className="flex flex-col">
          {isDate ? (
            <>
              {/*<div className="flex flex-col gap-x-2 mt-3 mb-3">{renderDateFilters()}</div>*/}

              {/*{showCalendar && (*/}
              {/*  <div className="flex w-full justify-center items-center">*/}
              {/*    <Calendar*/}
              {/*      mode="single"*/}
              {/*      selected={*/}
              {/*        !('filter_value' in filter.dateFilters)*/}
              {/*          ? undefined*/}
              {/*          : new Date(filter.dateFilters.filter_value)*/}
              {/*      }*/}
              {/*      onSelect={(day) => handleDateFilterChange('custom_date', day)}*/}
              {/*      className="w-full"*/}
              {/*    />*/}
              {/*  </div>*/}
              {/*)}*/}
            </>
          ) : (
            renderTextFilter()
          )}
        </div>
      )}
    </>
  );
};

export default ConditionFilters;
