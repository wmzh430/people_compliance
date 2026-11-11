import { useState, useCallback, useMemo, useEffect } from 'react';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu.tsx';
import { ChevronDown, ChevronUp, Filter } from 'lucide-react';
import { KeenIcon } from '@/components';
import { useClinicians } from '../../context/CliniciansContext';

interface IValueFilterProps {
  column: any;
  tempFilter: any;
  setTempFilter: any;
}

interface IGroupItemProps {
  grouped_value: string;
  count: string;
}

const ValueFilter = ({ column, tempFilter, setTempFilter }: IValueFilterProps) => {
  const [isFilterOpen, setIsFilterOpen] = useState(true);
  const [search, setSearch] = useState('');
  // Local state for filtering

  const { clinicianGroupFields, setFilter, filter, clinicians } = useClinicians();

  const columnId = useMemo(() => {
    switch (column.id) {
      case 'employee_id':
      case 'provider_name':
      case 'region':
        return column.id;
      default:
        return undefined;
    }
  }, [column.id]);

  const data = useMemo(() => {
    if (column.id == 'provider_name') {
      return clinicianGroupFields['provider'];
    } else if (column.id == 'region') {
      return [
        { grouped_value: 'North', count: '' },
        { grouped_value: 'South', count: '' }
      ];
    } else {
      return clinicianGroupFields[columnId];
    }
  }, [clinicianGroupFields, columnId]);

  const filteredData = useMemo(() => {
    return data?.filter((item: IGroupItemProps) =>
      item?.grouped_value.toLowerCase().includes(search.toLowerCase())
    );
  }, [data, search]);

  // Toggle selection in tempFilter
  const handleOnClick = (value: string) => {
    setTempFilter((prev: any) =>
      prev.includes(value) ? prev.filter((item: any) => item !== value) : [...prev, value]
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
        <span className="grow">Filter by Value</span>
        {isFilterOpen ? <ChevronUp /> : <ChevronDown />}
      </DropdownMenuItem>

      {isFilterOpen && (
        <div className="mt-3 mb-3 mx-4">
          <div className="relative">
            <KeenIcon
              icon="magnifier"
              className="leading-none text-md text-gray-500 absolute top-1/2 start-0 -translate-y-1/2 ms-3"
            />
            <input
              type="text"
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input input-sm w-full mt-2 ps-8"
            />
          </div>

          <div className="overflow-y-auto max-h-[200px] mt-2">
            {filteredData?.map((item: IGroupItemProps) => (
              <p
                key={item?.grouped_value}
                className={`cursor-pointer hover:bg-gray-200 p-1 m-1 rounded text-xs flex justify-between items-center ${
                  tempFilter.includes(item?.grouped_value) ? 'bg-gray-300 text-black' : ''
                }`}
                onClick={() => handleOnClick(item.grouped_value)}
              >
                {item?.grouped_value}{' '}
                {tempFilter.includes(item?.grouped_value) && (
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
