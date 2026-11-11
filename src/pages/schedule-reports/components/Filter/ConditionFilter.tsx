import React, { useState } from 'react';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu.tsx';
import { ChevronDown, ChevronUp, Filter } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select.tsx';
import { useSchedule } from '../../context/ScheduleContext';

interface IConditionProps {
  column: { id: string };
}

const ConditionFilters = ({ column }: IConditionProps) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const { filter, setFilter } = useSchedule();

  const columnId = column.id; // Use column dynamically

  const formatCondition = (condition: string) => {
    return condition.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const handleConditionChange = (value: string) => {
    setFilter((prevState) => ({
      ...prevState,
      filters_by_conditions: {
        ...prevState.filters_by_conditions,
        [columnId]: {
          condition: value,
          value:
            typeof prevState.filters_by_conditions[columnId] === 'object' &&
            'value' in prevState.filters_by_conditions[columnId]
              ? prevState.filters_by_conditions[columnId].value
              : ''
        }
      }
    }));
  };

  const handleTextFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFilter((prevState) => ({
      ...prevState,
      filters_by_conditions: {
        ...prevState.filters_by_conditions,
        [columnId]: {
          condition:
            typeof prevState.filters_by_conditions[columnId] === 'object' &&
            'condition' in prevState.filters_by_conditions[columnId]
              ? prevState.filters_by_conditions[columnId].condition
              : '',
          value
        }
      }
    }));
  };

  const condition =
    filter.filters_by_conditions[columnId] &&
    'condition' in filter.filters_by_conditions[columnId] &&
    filter.filters_by_conditions[columnId].condition;

  const filterValue =
    filter.filters_by_conditions[columnId] && 'value' in filter.filters_by_conditions[columnId]
      ? filter.filters_by_conditions[columnId].value
      : '';

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
        <div className="mb-3 mt-2 mx-4">
          <Select value={condition || ''} onValueChange={handleConditionChange}>
            <SelectTrigger className="w-full">
              <SelectValue>{formatCondition(condition || 'Select')}</SelectValue>
            </SelectTrigger>
            <SelectContent side="bottom">
              <SelectItem value="text_contains">Text Contains</SelectItem>
              <SelectItem value="text_starts_with">Text Starts With</SelectItem>
              <SelectItem value="text_ends_with">Text Ends With</SelectItem>
              <SelectItem value="is_equal">Is Equal</SelectItem>
            </SelectContent>
          </Select>

          {['text_contains', 'text_starts_with', 'text_ends_with', 'is_equal'].includes(
            condition || ''
          ) && (
            <div className="mt-2">
              <input
                type="text"
                placeholder="Enter value"
                value={filterValue || ''}
                onChange={handleTextFilterChange}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default ConditionFilters;
