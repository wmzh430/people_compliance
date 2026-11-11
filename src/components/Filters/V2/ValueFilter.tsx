import { useState, useEffect } from 'react';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu.tsx';
import { ChevronDown, ChevronUp, Filter } from 'lucide-react';
import { KeenIcon } from '@/components';
import { capitalizeFirstLetter } from '@/utils';
import { useReferral } from '@/pages/referrals/context/ReferralContext';

interface IValueFilterProps {
  column: any;
  groupedFields: any;
  metadataField?: string;
  onApply?: () => void;
  contextHook?: () => any; // Add context hook prop
}

interface IGroupItemProps {
  grouped_value: string;
  display_value: string;
  count: number;
}

const ValueFilter = ({
  column,
  groupedFields,
  metadataField,
  onApply,
  contextHook
}: IValueFilterProps) => {
  const [isFilterOpen, setIsFilterOpen] = useState(true);
  const [search, setSearch] = useState('');
  const [localSelectedValues, setLocalSelectedValues] = useState<string[]>([]);
  const [forceUpdate, setForceUpdate] = useState(0);

  // Use provided context hook or fall back to Referral context
  let context: any = null;
  let filters: any = null;
  let setFilters: any = null;

  if (contextHook) {
    try {
      context = contextHook();
      filters = context.filters || context.filter;
      setFilters = context.setFilters || context.setFilter;
    } catch (error) {
      console.warn('Context hook failed, falling back to Referral context:', error);
      // Fall back to Referral context
      try {
        const referralContext = useReferral();
        filters = referralContext.filters;
        setFilters = referralContext.setFilters;
      } catch (fallbackError) {
        console.error('Both context hook and Referral context failed:', fallbackError);
        return null; // Don't render if we can't get context
      }
    }
  } else {
    // No context hook provided, try to use Referral context
    try {
      const referralContext = useReferral();
      filters = referralContext.filters;
      setFilters = referralContext.setFilters;
    } catch (error) {
      console.warn('Referral context not available:', error);
      return null; // Don't render without context
    }
  }

  // Ensure we have the required functions
  if (!setFilters) {
    console.error('ValueFilter: No setFilter function available from context');
    return null; // Don't render if we can't set filters
  }

  // Use metadataField if provided, otherwise fallback to column.id
  const fieldName = metadataField || column.id;

  // Check if this is a boolean field
  const isBooleanField = fieldName === 'is_existing_patient';

  // Special handling for merged field - it's a boolean but behaves differently
  const isMergedField = fieldName === 'merged';

  // Special handling for is_checked_out field - it's a boolean but behaves differently
  const isCheckedOutField = fieldName === 'is_checked_out';

  const data = groupedFields;

  // Get the current filter values for this field directly from context
  const currentFilterValues = (filters?.metadata as any)?.[fieldName];

  // Initialize localSelectedValues when component mounts or filter changes
  useEffect(() => {
    if (isBooleanField || isMergedField || isCheckedOutField) {
      // Handle boolean fields and merged field
      if (currentFilterValues === true) {
        setLocalSelectedValues(['true']);
      } else if (currentFilterValues === false) {
        setLocalSelectedValues(['false']);
      } else {
        setLocalSelectedValues([]);
      }
    } else {
      // Handle array fields
      if (Array.isArray(currentFilterValues)) {
        setLocalSelectedValues(currentFilterValues);
      } else {
        setLocalSelectedValues([]);
      }
    }
  }, [currentFilterValues, isBooleanField, isMergedField, isCheckedOutField, fieldName]);

  // Force re-render when filter changes
  useEffect(() => {
    setForceUpdate((prev) => prev + 1);
  }, [(filters?.metadata as any)?.[fieldName]]);

  // Watch for filter metadata changes
  useEffect(() => {
    const currentValue = (filters?.metadata as any)?.[fieldName];

    if (currentValue !== currentFilterValues) {
      // Force update local state if filter changed externally
      if (isBooleanField || isMergedField || isCheckedOutField) {
        if (currentValue === true) {
          setLocalSelectedValues(['true']);
        } else if (currentValue === false) {
          setLocalSelectedValues(['false']);
        } else {
          setLocalSelectedValues([]);
        }
      } else {
        if (Array.isArray(currentValue)) {
          setLocalSelectedValues(currentValue);
        } else {
          setLocalSelectedValues([]);
        }
      }
    }
  }, [
    filters?.metadata,
    fieldName,
    isBooleanField,
    isMergedField,
    isCheckedOutField,
    currentFilterValues,
    localSelectedValues
  ]);

  // Handle filtered data based on search input
  const filteredData = data?.filter((item: IGroupItemProps) => {
    const searchLower = search.toLowerCase();
    return (
      String(item?.grouped_value).toLowerCase().includes(searchLower) ||
      String(item?.display_value).toLowerCase().includes(searchLower)
    );
  });

  // Toggle selection of values
  const handleOnClick = (value: string) => {
    setLocalSelectedValues((prev) => {
      const newValues = prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value];

      return newValues;
    });
  };

  // Check if a value is selected (using local state)
  const isValueSelected = (value: string) => {
    return localSelectedValues.includes(value);
  };

  // Apply the local changes to the main filter
  const handleApply = () => {
    setFilters((prevFilters: any) => {
      let newValue;

      if (isBooleanField) {
        // For boolean fields, convert the selected value to boolean
        if (localSelectedValues.length === 0) {
          newValue = null; // No selection means no filter
        } else if (localSelectedValues.includes('true')) {
          newValue = true;
        } else if (localSelectedValues.includes('false')) {
          newValue = false;
        } else {
          newValue = null;
        }
      } else if (isMergedField || isCheckedOutField) {
        // Special handling for merged and is_checked_out fields
        if (localSelectedValues.length === 0) {
          newValue = null; // No selection means no filter
        } else if (localSelectedValues.length === 2) {
          newValue = null; // Both selected means no filter
        } else if (localSelectedValues.includes('true') && !localSelectedValues.includes('false')) {
          newValue = true; // Only "Yes" selected
        } else if (localSelectedValues.includes('false') && !localSelectedValues.includes('true')) {
          newValue = false; // Only "No" selected
        } else {
          newValue = null; // Fallback
        }
      } else {
        // For array fields, use the selected values directly
        newValue = localSelectedValues;
      }

      const newFilter = {
        ...prevFilters,
        page: 1,
        metadata: {
          ...prevFilters.metadata,
          [fieldName]: newValue
        }
      };

      // Force a re-render after filter update
      setTimeout(() => setForceUpdate((prev) => prev + 1), 0);

      return newFilter;
    });

    // Call onApply callback if provided
    if (onApply) {
      onApply();
    }
  };

  // Clear local changes and reset to current filter state
  const handleClear = () => {
    // Immediately clear the filter
    setFilters((prevFilters: any) => {
      let newValue;

      if (isBooleanField || isMergedField || isCheckedOutField) {
        newValue = null; // Clear boolean fields
      } else {
        newValue = []; // Clear array fields
      }

      const newFilter = {
        ...prevFilters,
        page: 1,
        metadata: {
          ...prevFilters.metadata,
          [fieldName]: newValue
        }
      };

      return newFilter;
    });

    // Clear local state
    setLocalSelectedValues([]);

    // Call onApply callback if provided to trigger refetch
    if (onApply) {
      onApply();
    }
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
                  isValueSelected(item.grouped_value) ? 'bg-gray-300 text-black' : ''
                }`}
                onClick={() => handleOnClick(item?.grouped_value)}
              >
                {item.display_value ||
                  (isNaN(Number(item?.grouped_value))
                    ? capitalizeFirstLetter(item?.grouped_value)
                    : Number(item?.grouped_value) === 0
                      ? 'False'
                      : Number(item?.grouped_value) === 1
                        ? 'True'
                        : Math.floor(Number(item?.grouped_value)))}
                {isValueSelected(item.grouped_value) && (
                  <KeenIcon icon="check" className="text-green-500" />
                )}
              </p>
            ))}
          </div>

          {/* Action buttons */}
          <div className="space-x-1 mt-4 mb-1 justify-end flex">
            <button className="btn text-red-600 btn-sm" onClick={handleClear}>
              Clear
            </button>
            <button
              className="btn btn-sm btn-dark text-white w-[60px] text-center flex justify-center"
              onClick={handleApply}
            >
              Ok
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ValueFilter;
