//@ts-nocheck
import React, { useEffect } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Row } from '@tanstack/react-table';

export interface IDataGridRowSelectProps<TData> {
  row: Row<TData>;
  onSelect?: (id: string, isSelected: boolean) => void;
}

const DataGridRowSelect = <TData,>({ row, onSelect }: IDataGridRowSelectProps<TData>) => {
  const isSelected = row.getIsSelected();
  const rowId = row.original?.fax_id;

  useEffect(() => {
    onSelect(rowId, isSelected);
  }, [isSelected]);

  return (
    <Checkbox
      checked={isSelected}
      onCheckedChange={(value) => row.toggleSelected(!!value)}
      aria-label="Select row"
      className="align-[inherit] mx-4"
    />
  );
};

export { DataGridRowSelect };
