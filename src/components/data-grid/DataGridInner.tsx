import { cn } from '@/lib/utils';
import { useDataGrid, DataGridLoader, DataGridTable, DataGridPagination } from '.';
import { ScrollableTable } from './ScrollableTable';
import { flexRender, HeaderGroup } from '@tanstack/react-table';
import { useEffect } from 'react';

const DataGridInner = () => {
  const { props, table, loading } = useDataGrid();

  return (
    <div
      className={cn(
        'grid',
        props.layout?.card &&
          `
        card
        [&>[data-container]]:border-x-0
        [&>[data-container]]:rounded-none
        [&>[data-container]>[data-table]>thead>tr>th:first-child]:px-5
        [&>[data-container]>[data-table]>tbody>tr>td:first-child]:px-5  
        [&>[data-toolbar]]:p-5
      `,
        props.layout?.classes?.root
      )}
    >
      {props.toolbar && props.toolbar}

      {table.getRowModel().rows.length > 0 && (
        <div className="left-0 bg-white px-4 pt-0 pb-0 -mt-2" data-pagination>
          <DataGridPagination />
        </div>
      )}
      {props.title === 'F&D Reports' ? (
        <div className="overflow-x-scroll table-responsive">
          <div
            className="child-rotator inline-block min-w-full border rounded-lg overflow-scroll"
            data-table
          >
            <DataGridTable />
          </div>
          {loading && <DataGridLoader />}
        </div>
      ) : (
        <ScrollableTable
          className={cn(
            'relative w-full border rounded-lg table-responsive',
            props.layout?.classes?.container
          )}
          data-container
        >
          <div className="inline-block min-w-max w-full overflow-auto child-rotator" data-table>
            <DataGridTable />
          </div>
          {loading && <DataGridLoader />}
        </ScrollableTable>
      )}
      <style>{`
        /* Rotate outer container so the horizontal scrollbar renders at the top */
        .table-responsive { transform: rotateX(180deg) !important; overflow-x: scroll !important; scrollbar-gutter: stable both-edges; }
        /* Rotate immediate child back to normal */
        .table-responsive > .child-rotator { transform: rotateX(180deg) !important; }
        /* Always show scrollbar track and style it */
        .table-responsive { scrollbar-width: inherit; scrollbar-color: #94a3b8 #f1f5f9; }
        .table-responsive::-webkit-scrollbar { height: 8px; }
        .table-responsive::-webkit-scrollbar-track { background: #f1f5f9; }
        .table-responsive::-webkit-scrollbar-thumb { background-color: #94a3b8; border-radius: 9999px; }
      `}</style>
    </div>
  );
};

export { DataGridInner };
