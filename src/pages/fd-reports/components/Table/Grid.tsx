import React, { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton.tsx';
import { IReport } from '@/services/Admin/adminService.ts';
import { DataGrid } from '@/components';
import { useReactTable, getCoreRowModel } from '@tanstack/react-table';

interface IGridProps {
  data: IReport[] | any | null;
  isFetchingReports: boolean;
  isFetchReportsError: boolean;
  fetchReportsError: Error | null;
  columns: any[];
  title?: string;
  onRowClick?: (row: any) => void;
  selectedIds?: any;
  handleReadStatus?: any;
  handleArchiveStatus?: any;
  readStatus?: any;
  archiveStatus?: any;
  paginationData?: any;
  setPaginationData?: (data: any) => void;
  paginationDataCount?: number;
  orderSelectedIds?: any;
  refetch?: any;
  handleBulkSend?: any;
  handleBulkPrint?: any;
  isAccordion?: boolean;
  expandAllRows?: boolean;
  setExpandAllRows?: any;
  page?: any;
  onTableCreated?: (table: any) => void;
  bulkSendDisabled?: boolean;
  bulkSendDisabledReason?: string;
}

const Grid: React.FC<IGridProps> = ({
  data,
  isFetchingReports,
  isFetchReportsError,
  fetchReportsError,
  columns,
  title,
  onRowClick,
  selectedIds,
  handleReadStatus,
  handleArchiveStatus,
  readStatus,
  archiveStatus,
  handleBulkSend,
  handleBulkPrint,
  paginationData,
  orderSelectedIds,
  setPaginationData,
  paginationDataCount,
  page,
  refetch,
  isAccordion = false,
  expandAllRows = false,
  setExpandAllRows,
  onTableCreated,
  bulkSendDisabled,
  bulkSendDisabledReason
}) => {
  const gridData = Array.isArray(data) ? data : [];
  const compactRowSpacing = title === 'F&D Reports' || title === 'Staff Utilization';
  const compactLayout = compactRowSpacing
    ? ({
        cellSpacing: 'xs',
        classes: {
          table:
            '[&_thead>tr>th]:h-10 [&_thead>tr>th]:py-2 [&_tbody>tr>td]:py-2 [&_tbody>tr>td]:text-[13px] [&_tbody>tr>td]:leading-tight'
        }
      } as any)
    : undefined;

  const table = useReactTable({
    data: gridData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    state: {}
  });

  useEffect(() => {
    if (onTableCreated) {
      onTableCreated(table);
    }
  }, [onTableCreated, table]);

  if (isFetchingReports) {
    return (
      <div className="relative min-h-[260px]">
        <div className="mb-4 flex items-center gap-2 text-sm text-gray-500">
          <span className="inline-block size-4 shrink-0 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
          Updating reports...
        </div>
        {Array.from({ length: 8 }).map((_, index) => (
          <Skeleton key={index} className="h-[50px] my-4" />
        ))}
      </div>
    );
  }

  if (isFetchReportsError) {
    return <div className="text-red-500">Error fetching reports: {fetchReportsError?.message}</div>;
  }

  return (
    <div className="space-y-4">
      <DataGrid
        onRowClick={onRowClick}
        columns={columns}
        data={gridData}
        title={title}
        layout={compactLayout}
        rowSelection={true}
        selectedIds={selectedIds}
        handleReadStatus={handleReadStatus}
        handleBulkSend={handleBulkSend}
        handleBulkPrint={handleBulkPrint}
        handleArchiveStatus={handleArchiveStatus}
        readStatus={readStatus}
        archiveStatus={archiveStatus}
        paginationData={paginationData}
        orderSelectedIds={orderSelectedIds}
        setPaginationData={setPaginationData}
        paginationDataCount={paginationDataCount}
        refetch={refetch}
        isAccordion={isAccordion}
        expandAllRows={expandAllRows}
        setExpandAllRows={setExpandAllRows}
        page={page}
        bulkSendDisabled={bulkSendDisabled}
        bulkSendDisabledReason={bulkSendDisabledReason}
      />
    </div>
  );
};

export default Grid;
