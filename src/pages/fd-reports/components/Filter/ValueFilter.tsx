import { useState, useCallback, useMemo, useEffect } from 'react';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu.tsx';
import { ChevronDown, ChevronUp, Filter } from 'lucide-react';
import { KeenIcon } from '@/components';
import { useReports } from '@/pages/fd-reports/context/ReportsContext.tsx';

interface IValueFilterProps {
  column: any;
}

interface IGroupItemProps {
  grouped_value: string;
  count: string;
}

const ValueFilter = ({ column }: IValueFilterProps) => {
  const [isFilterOpen, setIsFilterOpen] = useState(true);
  const [search, setSearch] = useState('');

  const { groupedFields, setFilter, filter } = useReports();

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

  const data = useMemo(() => {
    if (columnId == 'dietician' || columnId == 'has_signature') {
      return [
        {
          grouped_value: 'Yes',
          count: ''
        },
        {
          grouped_value: 'No',
          count: ''
        }
      ];
    } else {
      return groupedFields[columnId];
    }
  }, [groupedFields, columnId]);

  const handleSelectAll = useCallback(() => {
    const allValues = data?.map((item: IGroupItemProps) => item?.grouped_value);
    if (allValues) {
      setFilter((prevFilter) => ({
        ...prevFilter,
        filterByValue: {
          ...prevFilter.filterByValue,
          [columnId]: allValues
        }
      }));
    }
  }, [data, columnId, setFilter]);

  const handleClearAll = useCallback(() => {
    setFilter((prevFilter) => ({
      ...prevFilter,
      filterByValue: {
        ...prevFilter.filterByValue,
        [columnId]: []
      }
    }));
  }, [columnId, setFilter]);

  const filteredData = data?.filter((item: IGroupItemProps) =>
    item?.grouped_value.toLowerCase().includes(search.toLowerCase())
  );

  const handleOnClick = (value: string) => {
    setFilter((prevFilter) => {
      return {
        ...prevFilter,
        filterByValue: {
          ...prevFilter.filterByValue,
          [columnId]: !prevFilter.filterByValue[columnId]?.includes(value)
            ? [...(prevFilter.filterByValue[columnId] || []), value]
            : prevFilter.filterByValue[columnId].filter((item) => item !== value)
        }
      };
    });
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
        <span className="grow">Filter by Value</span>
        {isFilterOpen ? <ChevronUp /> : <ChevronDown />}
      </DropdownMenuItem>

      {isFilterOpen && (
        <div className="mt-3 mb-3 mx-4">
          {/*<div className="space-x-2 mb-2">*/}
          {/*  <button onClick={handleSelectAll} className="btn btn-xs btn-dark">*/}
          {/*    Select All*/}
          {/*  </button>*/}
          {/*  <button onClick={handleClearAll} className="btn btn-xs btn-danger">*/}
          {/*    Clear*/}
          {/*  </button>*/}
          {/*</div>*/}

          <div className="relative">
            <KeenIcon
              icon="magnifier"
              className="leading-none text-md text-gray-500 absolute top-1/2 start-0 -translate-y-1/2 ms-3"
            />
            <input
              type="text"
              placeholder="Search"
              value={search}
              onChange={(e) => {
                e.preventDefault();
                setSearch(e.target.value);
              }}
              className="input input-sm w-full mt-2 ps-8"
            />
          </div>

          <div className="overflow-y-auto max-h-[200px] mt-2">
            {filteredData?.map((item: IGroupItemProps) => (
              <p
                key={item?.grouped_value}
                className={`cursor-pointer hover:bg-gray-200 p-1 m-1 rounded text-xs flex justify-between items-center ${
                  filter.filterByValue[columnId]?.includes(item?.grouped_value)
                    ? 'bg-gray-300 text-black'
                    : ''
                }`}
                onClick={() => handleOnClick(item.grouped_value)}
              >
                {isNaN(Number(item?.grouped_value))
                  ? item?.grouped_value
                  : Math.floor(Number(item?.grouped_value))}{' '}
                {columnId !== 'dietician' && <></>}{' '}
                {filter.filterByValue[columnId]?.includes(item?.grouped_value) && (
                  <KeenIcon icon="check" className="text-green-500" />
                )}
              </p>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default ValueFilter;
