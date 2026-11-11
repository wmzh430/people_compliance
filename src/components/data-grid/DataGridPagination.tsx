import React from 'react';
import { useDataGrid } from '.';
import { ChevronRightIcon, ChevronLeftIcon } from 'lucide-react';
import { IconButton } from '@mui/material';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { IoMail, IoMailOpen } from 'react-icons/io5';
import { Tooltip } from '@mui/material';
import { KeenIcon } from '../keenicons';
import { GiCardboardBoxClosed } from 'react-icons/gi';
import { FaBoxOpen } from 'react-icons/fa6';
import { IoIosMail, IoIosMailOpen } from 'react-icons/io';
import { FaArrowDownWideShort, FaArrowUpWideShort } from 'react-icons/fa6';

const DataGridPagination = () => {
  const { table, totalRows, props } = useDataGrid();
  const {
    paginationData,
    setPaginationData,
    refetch,
    paginationDataCount,
    selectedIds,
    handleReadStatus,
    handleArchiveStatus,
    handleBulkSend,
    handleBulkPrint,
    orderSelectedIds,
    readStatus,
    archiveStatus,
    expandAllRows,
    setExpandAllRows,
    page,
    bulkSendDisabled,
    bulkSendDisabledReason
  } = props;

  const btnBaseClasses = 'size-7 p-0 text-[13px]';
  const btnArrowClasses = btnBaseClasses + ' rtl:transform rtl:rotate-180';
  const pageIndex = paginationData
    ? paginationData?.page - 1
    : table.getState().pagination.pageIndex;
  const pageSize = paginationData
    ? (paginationData?.page_size ?? paginationData?.per_page)
    : table.getState().pagination.pageSize;
  const from = pageIndex * pageSize + 1;
  const to = Math.min(
    (pageIndex + 1) * pageSize,
    paginationDataCount ? paginationDataCount : totalRows
  );

  // Replace placeholders in paginationInfo
  const paginationInfo = props.pagination?.info
    ? props.pagination.info
        .replace('{from}', from.toString())
        .replace('{to}', to.toString())
        .replace('{count}', String(paginationDataCount ? paginationDataCount : totalRows))
    : `${from} - ${to} of ${String(paginationDataCount ? paginationDataCount : totalRows)}`;

  // Pagination limit logic
  const pageCount = paginationDataCount
    ? Math.floor(paginationDataCount / (paginationData?.page_size || paginationData?.per_page))
    : table.getPageCount();
  const paginationMoreLimit = 10;

  // Determine the start and end of the pagination group
  const currentGroupStart = Math.floor(pageIndex / paginationMoreLimit) * paginationMoreLimit;
  const currentGroupEnd = paginationData
    ? Math.min(currentGroupStart + paginationMoreLimit, pageCount) + 1
    : Math.min(currentGroupStart + paginationMoreLimit, pageCount);

  // Render page buttons based on the current group
  const renderPageButtons = () => {
    const buttons = [];
    for (let i = currentGroupStart; i < currentGroupEnd; i++) {
      buttons.push(
        <Button
          key={i}
          variant="ghost"
          className={cn(btnBaseClasses, 'text-muted-foreground', {
            'bg-accent text-accent-foreground': pageIndex === i
          })}
          onClick={async () => {
            if (setPaginationData) {
              await setPaginationData((prev: any) => ({
                ...prev,
                page: i + 1
              }));
              if (refetch) {
                refetch();
              }
            } else {
              table.setPageIndex(i);
            }
          }}
        >
          {i + 1}
        </Button>
      );
    }
    return buttons;
  };

  // Render a "previous" ellipsis button if there are previous pages to show
  const renderEllipsisPrevButton = () => {
    if (currentGroupStart > 0) {
      return (
        <Button
          className={btnBaseClasses}
          variant="ghost"
          onClick={async () => {
            if (setPaginationData) {
              await setPaginationData((prev: any) => ({
                ...prev,
                page: paginationData?.page - 1
              }));
              if (refetch) {
                refetch();
              }
            } else {
              table.setPageIndex(currentGroupStart - 1);
            }
          }}
        >
          ...
        </Button>
      );
    }
    return null;
  };

  const renderEllipsisNextButton = () => {
    if (currentGroupEnd < pageCount) {
      return (
        <Button
          className={btnBaseClasses}
          variant="ghost"
          onClick={async () => {
            if (setPaginationData) {
              await setPaginationData((prev: any) => ({
                ...prev,
                page: paginationData?.page + 1
              }));
              if (refetch) {
                refetch();
              }
            } else {
              table.setPageIndex(currentGroupEnd);
            }
          }}
        >
          ...
        </Button>
      );
    }
    return null;
  };

  return (
    <div
      className="flex flex-col md:flex-row justify-between items-center gap-2 md:gap-4 mt-0 mb-0"
      data-pagination
    >
      <div className="flex items-center space-x-2 order-2 md:order-1 pb-0">
        <div className="text-sm text-muted-foreground">Rows per page</div>
        <Select
          value={`${paginationData ? (paginationData.page_size ?? paginationData.per_page) : table.getState().pagination.pageSize}`}
          onValueChange={async (value) => {
            const newPageSize = Number(value);
            if (setPaginationData) {
              // Check if paginationData exists and set the page accordingly
              await setPaginationData((prev: any) => ({
                ...prev,
                page_size: newPageSize,
                page: paginationData ? paginationData.page : 1 // Default to 1 if paginationData is not available
              }));
              if (refetch) {
                refetch();
              }
            } else {
              table.setPageSize(Number(value));
            }
          }}
        >
          <SelectTrigger className="w-[70px]" size="sm">
            <SelectValue
              placeholder={
                paginationData ? paginationData.page : table.getState().pagination.pageSize
              }
            />
          </SelectTrigger>
          <SelectContent side="top">
            {props.pagination?.sizes?.map((pageSize) => (
              <SelectItem key={pageSize} value={`${pageSize}`}>
                {pageSize}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {props?.isAccordion && (
          <Tooltip title={expandAllRows ? 'Collapse All' : 'Expand All'}>
            <IconButton
              onClick={() => setExpandAllRows((prev: any) => !prev)}
              sx={{
                backgroundColor: expandAllRows ? 'primary.main' : 'white.100',
                color: expandAllRows ? 'white' : 'grey.800',
                '&:hover': {
                  backgroundColor: expandAllRows ? 'primary.dark' : 'grey.200'
                },
                border: '1px solid #DCE0E9',
                borderRadius: 1.5,
                width: 32,
                height: 32
              }}
            >
              {expandAllRows ? <FaArrowUpWideShort /> : <FaArrowDownWideShort color="#4B5675" />}
            </IconButton>
          </Tooltip>
        )}
        {orderSelectedIds?.length > 0 && (
          <>
            {handleBulkPrint && page === 'merge-print' ? (
              <div className="flex gap-2">
                <Tooltip
                  title={
                    bulkSendDisabled
                      ? bulkSendDisabledReason || 'Bulk send is disabled'
                      : 'Bulk Send Orders'
                  }
                >
                  <span>
                    <button
                      onClick={handleBulkSend}
                      disabled={bulkSendDisabled}
                      className={bulkSendDisabled ? 'opacity-50 cursor-not-allowed' : ''}
                    >
                      <KeenIcon icon="paper-plane" className="text-xl text-blue-400" />
                    </button>
                  </span>
                </Tooltip>
                <Tooltip title={`Bulk Print Orders`}>
                  <button onClick={handleBulkPrint}>
                    <KeenIcon icon="printer" className="text-xl text-blue-400" />
                  </button>
                </Tooltip>
              </div>
            ) : (
              <div>
                {handleBulkPrint ? (
                  <Tooltip title={`Bulk Print Orders`}>
                    <button onClick={handleBulkPrint}>
                      <KeenIcon icon="printer" className="text-xl text-blue-400" />
                    </button>
                  </Tooltip>
                ) : (
                  <Tooltip
                    title={
                      bulkSendDisabled
                        ? bulkSendDisabledReason || 'Bulk send is disabled'
                        : 'Upload & Check In Orders'
                    }
                  >
                    <span>
                      <button
                        onClick={handleBulkSend}
                        disabled={bulkSendDisabled}
                        className={
                          bulkSendDisabled ? 'opacity-50 cursor-not-allowed text-blue-400' : ''
                        }
                      >
                        <KeenIcon
                          icon="basket-ok"
                          className={
                            bulkSendDisabled
                              ? 'text-xl text-blue-400 opacity-60'
                              : 'text-xl text-blue-400'
                          }
                        />
                      </button>
                    </span>
                  </Tooltip>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {selectedIds?.length > 0 ? (
        <div className="flex items-center gap-3 ">
          <Tooltip title={`Mark as ${readStatus}`}>
            <button onClick={handleReadStatus}>
              {readStatus === 'Read' ? (
                <IoIosMail size={25} className="text-xl text-blue-400" />
              ) : (
                readStatus === 'Unread' && (
                  <IoIosMailOpen size={25} className="text-xl text-blue-400" />
                )
              )}
            </button>
          </Tooltip>
          <Tooltip title={`${archiveStatus ? 'Unarchive' : 'Archive'} Faxes`}>
            <button onClick={handleArchiveStatus}>
              {archiveStatus ? (
                <FaBoxOpen size={25} className="text-xl text-red-600" />
              ) : (
                <GiCardboardBoxClosed size={25} className="text-xl text-red-600" />
              )}
            </button>
          </Tooltip>
        </div>
      ) : (
        <></>
      )}

      <div className="flex items-center gap-2 order-1 md:order-2 pt-0 md:pt-0">
        <div className="text-sm text-muted-foreground">{paginationInfo}</div>
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            className={btnArrowClasses}
            onClick={async () => {
              if (setPaginationData) {
                await setPaginationData((prev: any) => ({
                  ...prev,
                  page: paginationData?.page - 1
                }));
                if (refetch) {
                  refetch();
                }
              } else {
                table.previousPage();
              }
            }}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Go to previous page</span>
            <ChevronLeftIcon className="size-4" />
          </Button>

          {renderEllipsisPrevButton()}

          <>{renderPageButtons()}</>

          {renderEllipsisNextButton()}

          <Button
            variant="ghost"
            className={btnArrowClasses}
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Go to next page</span>
            <ChevronRightIcon className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export { DataGridPagination };
