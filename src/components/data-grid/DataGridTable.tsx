//@ts-nocheck
import React, { useState } from 'react';
import { DataGridEmpty, TDataGridLayoutCellSpacing } from '.';
import { flexRender, HeaderGroup, Row, Cell } from '@tanstack/react-table';
import { useDataGrid } from '.';
import { cn } from '@/lib/utils';
import { useLocation } from 'react-router';
import { toAbsoluteUrl } from '@/utils';
import { Collapse } from '@mui/material';
import { formatPSTTimestamp, extractValueSections } from '@/utils';

const DataGridTable = <TData,>() => {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [collapsedRows, setCollapsedRows] = useState<Set<string>>(new Set());

  const { table, props } = useDataGrid();
  const location = useLocation();

  const handleRowClick = (rowId: string) => {
    if (!props.isAccordion) return;

    if (props.expandAllRows) {
      setCollapsedRows((prev) => {
        const newSet = new Set(prev);
        newSet.has(rowId) ? newSet.delete(rowId) : newSet.add(rowId);
        return newSet;
      });
    } else {
      setExpandedRows((prev) => {
        const newSet = new Set(prev);
        newSet.has(rowId) ? newSet.delete(rowId) : newSet.add(rowId);
        return newSet;
      });
    }
  };

  const headCellSpacingOptions: Record<TDataGridLayoutCellSpacing, string> = {
    xs: 'px-2.5',
    sm: 'px-3',
    md: 'px-4',
    lg: 'px-6'
  };
  const bodyCellSpacingOptions: Record<TDataGridLayoutCellSpacing, string> = {
    xs: 'p-2.5',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6'
  };

  const headCellSpacing = props.layout?.cellSpacing
    ? headCellSpacingOptions[props.layout?.cellSpacing]
    : headCellSpacingOptions['md'];
  const bodyCellSpacing =
    location.pathname === '/faxes/inbox' ||
    location.pathname === '/faxes/inbox/' ||
    location.pathname === '/orders/inbox' ||
    location.pathname === '/orders/inbox/' ||
    location.pathname === '/orders/spam/' ||
    location.pathname === '/orders/spam'
      ? 'p-0'
      : props.layout?.cellSpacing
        ? bodyCellSpacingOptions[props.layout?.cellSpacing]
        : bodyCellSpacingOptions['md'];

  const cellBorder = props.layout?.cellBorder ?? false;

  return (
    <div className="max-h-[calc(100vh-200px)]">
      <table
        className={cn(
          'w-full align-middle text-left rtl:text-right caption-bottom text-sm',
          props.layout?.classes?.table
        )}
        data-table
      >
        <thead className="sticky top-0 bg-white z-10 shadow-md">
          {table.getHeaderGroups().map((headerGroup: HeaderGroup<TData>, index) => (
            <tr
              key={`headerGroup.id=${index}`}
              className={cn(
                'border-b bg-muted/30 data-[state=selected]:bg-muted ',
                cellBorder && '[&_>:last-child]:border-e-0'
              )}
            >
              {headerGroup.headers.map((header, idx) => (
                <th
                  key={`header.id=${idx}`}
                  colSpan={header.colSpan}
                  className={cn(
                    headCellSpacing,
                    cellBorder && 'border-e',
                    'h-12 text-left rtl:text-right align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pe-0',
                    header.column.columnDef.meta?.headerClassName
                  )}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>

        {table.getRowModel().rows.length ? (
          <tbody className="[&_tr:last-child]:border-0">
            {table.getRowModel().rows.map((row: Row<TData>, index) => {
              const {
                sn_frequency,
                pt_frequency,
                ot_frequency,
                st_frequency,
                hha_frequency,
                msw_frequency,
                description,
                note
              } = row.original;

              const shouldAllowAccordion =
                sn_frequency ||
                pt_frequency ||
                ot_frequency ||
                st_frequency ||
                hha_frequency ||
                msw_frequency ||
                description ||
                note;

              const isExpanded = props.expandAllRows
                ? !collapsedRows.has(row.id)
                : expandedRows.has(row.id);

              return (
                <React.Fragment key={row.id}>
                  <tr
                    onClick={() => shouldAllowAccordion && handleRowClick(row.id)}
                    data-state={row.getIsSelected() ? 'selected' : undefined}
                    className={cn(
                      'border-b hover:bg-muted/30 data-[state=selected]:bg-muted/50',
                      (shouldAllowAccordion || row?.id === 'from_phoneNumber') && 'cursor-pointer',
                      cellBorder && '[&_>:last-child]:border-e-0'
                    )}
                  >
                    {row.getVisibleCells().map((cell: Cell<TData, unknown>, index) => (
                      <td
                        key={`cell.id=${index}`}
                        className={cn(
                          bodyCellSpacing,
                          cellBorder && 'border-e',
                          'align-middle [&:has([role=checkbox])]:pe-0',
                          cell.column.columnDef.meta?.cellClassName
                        )}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>

                  {props.isAccordion && shouldAllowAccordion && (
                    <tr>
                      <td colSpan={row.getVisibleCells().length} className="!p-0 border-b">
                        <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                          <div className="p-4 flex flex-col gap-2 bg-gray-200">
                            {[
                              { key: 'description', label: 'Description' },
                              { key: 'pt_frequency', label: 'PT' },
                              { key: 'st_frequency', label: 'ST' },
                              { key: 'sn_frequency', label: 'SN' },
                              { key: 'ot_frequency', label: 'OT' },
                              { key: 'hha_frequency', label: 'HHA' },
                              { key: 'msw_frequency', label: 'MSW' },
                              { key: 'note', label: 'Note' }
                            ]
                              .flatMap(({ key, label }) => {
                                const rawValue = row.original[key];
                                if (!rawValue) return [];

                                if (rawValue.includes('|')) {
                                  const parsed = extractValueSections(rawValue);
                                  return [
                                    { type: 'parent', label },
                                    ...parsed.map((item) => ({
                                      type: 'child',
                                      label: item.label,
                                      value: item.value
                                    }))
                                  ];
                                }

                                return [{ type: 'flat', label, value: rawValue }];
                              })
                              .map((item, idx) => {
                                if (item.type === 'parent') {
                                  return (
                                    <div key={idx} className="font-bold">
                                      {item.label}:
                                    </div>
                                  );
                                }

                                if (item.type === 'child') {
                                  return (
                                    <div
                                      key={idx}
                                      className="pl-4 flex gap-1 text-sm text-gray-700"
                                    >
                                      <span className="text-gray-500">→</span>
                                      <span className="font-semibold">{item.label}:</span>
                                      <span>{item.value}</span>
                                    </div>
                                  );
                                }

                                return (
                                  <div key={idx}>
                                    <span className="font-bold">{item.label}:</span> {item.value}
                                  </div>
                                );
                              })}
                            {row.original?.approved_by && row.original?.approved_at && (
                              <div className="text-[#0E62FE]">
                                Ready to Schedule by: {row.original?.approved_by?.first_name}{' '}
                                {row.original?.approved_by?.last_name}{' '}
                                {formatPSTTimestamp(row.original?.approved_at)}
                              </div>
                            )}
                          </div>
                        </Collapse>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        ) : null}
      </table>

      {!table.getRowModel().rows.length && (
        <div className="w-full flex items-center justify-start p-10">
          <div className="text-gray-500 text-sm font-medium">
            {props.messages?.empty || 'No data available'}
          </div>
        </div>
      )}
    </div>
  );
};

export { DataGridTable };
