import { useState, useEffect } from 'react';
import { useSchedule } from '../../context/ScheduleContext';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { Slider } from '@mui/material';

const RangeFilter = ({ column }: { column: any }) => {
  const [isFilterOpen, setIsFilterOpen] = useState(true);
  const { setFilter, filter } = useSchedule();

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

      default:
        return '';
    }
  };

  const columnId = mapColumns();

  // Initialize range values from filter state or fallback to defaults
  const [value, setValue] = useState<number[]>([0, 100]);

  useEffect(() => {
    if (columnId && filter.filters_by_conditions[columnId]) {
      const filterCondition = filter.filters_by_conditions[columnId];

      // Check if filterCondition is an object with min & max properties
      if ('min' in filterCondition && 'max' in filterCondition) {
        setValue([filterCondition.min ?? 0, filterCondition.max ?? 100]);
      }
    }
  }, [filter, columnId]);

  const handleChange = (_event: Event, newValue: number | number[]) => {
    if (!columnId) return; // Prevent errors if columnId is undefined

    setValue(newValue as number[]);

    setFilter((prev) => ({
      ...prev,
      filters_by_conditions: {
        ...prev.filters_by_conditions,
        [columnId]: {
          ...(prev.filters_by_conditions[columnId] || {}),
          min: (newValue as number[])[0],
          max: (newValue as number[])[1]
        }
      }
    }));
  };

  return (
    <>
      <DropdownMenuItem
        onClick={(e) => {
          e.preventDefault();
          setIsFilterOpen((prev) => !prev);
        }}
        className="flex items-center"
      >
        <Filter className="!size-[0.825rem] text-muted-foreground/90" />
        <span className="grow">Filter by Range</span>
        {isFilterOpen ? <ChevronUp /> : <ChevronDown />}
      </DropdownMenuItem>

      {isFilterOpen && (
        <div className="form-group row mb-4 mx-3">
          <div className="col-lg-8 col-md-9 col-sm-12">
            {/* Label Row */}
            <div className="flex justify-between text-sm text-muted-foreground mb-[-10px] mt-[10px]">
              <span>0</span>
              <span>100</span>
            </div>

            {/* Slider */}
            <Slider
              getAriaLabel={() => 'Range Filter'}
              value={value}
              onChange={handleChange}
              valueLabelDisplay="auto"
              min={0}
              max={100}
              sx={{
                color: '#6366F1',
                height: 6,
                '& .MuiSlider-thumb': {
                  width: 16,
                  height: 16,
                  backgroundColor: 'white',
                  border: '2px solid #6366F1',
                  '&:hover': {
                    boxShadow: '0px 0px 8px rgba(99, 102, 241, 0.5)'
                  }
                },
                '& .MuiSlider-track': {
                  height: 6,
                  borderRadius: 4,
                  backgroundColor: '#6366F1'
                },
                '& .MuiSlider-rail': {
                  height: 6,
                  borderRadius: 4,
                  backgroundColor: '#E5E7EB'
                }
              }}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default RangeFilter;
