import { DropdownMenuItem } from '@/components/ui/dropdown-menu.tsx';
import { Check } from 'lucide-react';
import React, { ReactElement } from 'react';

interface SortingFiltersProps {
  onClick: () => void;
  isChecked: boolean;
  icon: ReactElement;
  name: string;
}

const SortingFilters: React.FC<SortingFiltersProps> = ({ onClick, isChecked, icon, name }) => {
  return (
    <DropdownMenuItem onClick={onClick}>
      {React.cloneElement(icon, { className: '!size-[0.825rem] text-muted-foreground/90' })}
      <span className="grow">Sort {name}</span>
      {isChecked && <Check className="size-4 text-muted-foreground/90" />}
    </DropdownMenuItem>
  );
};

export default SortingFilters;
