import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router';

import { DataGridColumnHeader, KeenIcon } from '@/components';
import Grid from '@/pages/fd-reports/components/Table/Grid';
import { useOIGReports } from './context/OIGReportsContext';
import { IVerificationRecord } from '@/services/ClinicianVerification/clinicianVerificationService';
import { Dialog, DialogBody, DialogContent, DialogHeader } from '@/components/ui/dialog';
import PDFViewer from '@/components/PDF';
import { requestS3PreSign } from '@/services/s3Service';
import apiClient from '@/api/client';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

const STATUS_CONFIG: Record<string, { icon: string; color: string; label: string }> = {
  match_not_found: { icon: 'shield-tick', color: 'success', label: 'Clear' },
  no_results: { icon: 'shield-tick', color: 'success', label: 'Clear' },
  match_found: { icon: 'shield-cross', color: 'danger', label: 'Excluded' },
  inconclusive: { icon: 'information-2', color: 'warning', label: 'Inconclusive' },
  error: { icon: 'shield-cross', color: 'danger', label: 'Error' },
  pending: { icon: 'time', color: 'gray', label: 'Pending' }
};
const STATUS_FALLBACK = { icon: 'minus-circle', color: 'gray', label: 'Not Verified' };
const EMPLOYEE_TYPE_CONFIG: Record<string, { icon: string; color: string }> = {
  'Part-time': { icon: 'time', color: 'info' },
  Contract: { icon: 'tablet-text-down', color: 'warning' },
  'Full-time': { icon: 'brifecase-tick', color: 'primary' },
  Staff: { icon: 'people', color: 'success' }
};
const SUFFIX_CONFIG: Record<string, { icon: string; color: string }> = {
  PT: { icon: 'people', color: 'warning' },
  OT: { icon: 'people', color: 'danger' },
  LVN: { icon: 'people', color: 'info' },
  PTA: { icon: 'people', color: 'success' },
  COTA: { icon: 'people', color: 'primary' },
  RN: { icon: 'people', color: 'dark' },
  'N/A': { icon: 'minus-circle', color: 'gray' }
};
const STATUS_FILTER_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'match_not_found', label: 'Clear' },
  { value: 'match_found', label: 'Excluded' },
  { value: 'inconclusive', label: 'Inconclusive' },
  { value: 'error', label: 'Error' },
  { value: 'pending', label: 'Pending' }
];

const formatVerifiedDate = (dateStr: string | null) => {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit'
  });
};

const OIGReports = () => {
  const navigate = useNavigate();
  const {
    selectedMonth,
    setSelectedMonth,
    selectedStatus,
    setSelectedStatus,
    verifications,
    isLoading,
    isError,
    refetch,
    search,
    setSearch,
    pagination,
    setPagination
  } = useOIGReports();

  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [selectedPdfUrl, setSelectedPdfUrl] = useState<string | null>(null);
  const [selectedPdfName, setSelectedPdfName] = useState<string>('');
  const [isPdfResolving, setIsPdfResolving] = useState(false);
  const [pdfLoadError, setPdfLoadError] = useState<string>('');
  const [pageNumber, setPageNumber] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const monthInputRef = useRef<HTMLInputElement | null>(null);
  const pageRefs = useRef([]);

  useEffect(() => {
    return () => {
      if (selectedPdfUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(selectedPdfUrl);
      }
    };
  }, [selectedPdfUrl]);

  const deriveS3Key = (path: string): string => {
    if (path.startsWith('https://')) {
      try {
        const url = new URL(path);
        return url.pathname.replace(/^\//, '');
      } catch {
        return path;
      }
    }
    return path;
  };

  const handleViewPdf = async (record: IVerificationRecord) => {
    if (!record.pdf_path) return;
    setSelectedPdfName(record.clinician_name);
    setPdfModalOpen(true);
    setIsPdfResolving(true);
    setPdfLoadError('');
    setSelectedPdfUrl((prev) => {
      if (prev?.startsWith('blob:')) URL.revokeObjectURL(prev);
      return null;
    });
    try {
      const key = deriveS3Key(record.pdf_path);
      const resp = await requestS3PreSign(key);
      const url = resp?.url || resp?.presigned_url || resp?.signed_url;
      if (url) {
        setSelectedPdfUrl(url);
        setIsPdfResolving(false);
        return;
      }
      throw new Error('No presigned URL returned');
    } catch (error) {
      try {
        const response = await apiClient.get(
          `/clinician-verification/verifications/${record.id}/pdf/`,
          { responseType: 'blob' }
        );
        const blobUrl = URL.createObjectURL(response.data);
        setSelectedPdfUrl(blobUrl);
        setIsPdfResolving(false);
      } catch (fallbackError) {
        console.error('Failed to load OIG PDF:', fallbackError || error);
        setPdfLoadError('Failed to load PDF');
        setSelectedPdfUrl(null);
        setIsPdfResolving(false);
      }
    }
  };

  const openMonthPicker = () => {
    const input = monthInputRef.current;
    if (!input) return;
    const pickerInput = input as HTMLInputElement & { showPicker?: () => void };
    if (typeof pickerInput.showPicker === 'function') {
      pickerInput.showPicker();
      return;
    }
    input.focus();
    input.click();
  };

  const columns = [
    {
      accessorFn: (row: IVerificationRecord) => row.clinician_name,
      id: 'clinician_name',
      name: 'Clinician Name',
      isVisible: true,
      header: ({ column }: any) => <DataGridColumnHeader title="Clinician Name" column={column} />,
      enableSorting: true,
      cell: (info: any) => {
        const row: IVerificationRecord = info.row.original;
        return (
          <button
            className="text-primary hover:underline font-medium text-left"
            onClick={() => navigate(`/oig-reports/clinician/${row.clinician}`)}
          >
            {row.clinician_name}
          </button>
        );
      },
      meta: { className: 'min-w-[200px]', cellClassName: 'text-gray-800 font-normal' }
    },
    {
      accessorFn: (row: IVerificationRecord) => row.clinician_suffix,
      id: 'clinician_suffix',
      name: 'Suffix',
      isVisible: true,
      header: ({ column }: any) => <DataGridColumnHeader title="Suffix" column={column} />,
      enableSorting: true,
      cell: (info: any) => {
        const row: IVerificationRecord = info.row.original;
        const suffix = row.clinician_suffix || 'N/A';
        const config = SUFFIX_CONFIG[suffix] || { icon: 'people', color: 'gray' };
        return (
          <span
            className={`badge font-sm badge-${config.color} shrink-0 badge-outline rounded-[30px] whitespace-nowrap gap-1`}
          >
            <KeenIcon icon={config.icon} />
            {suffix}
          </span>
        );
      },
      meta: { className: 'min-w-[120px]', cellClassName: 'text-gray-800 font-normal' }
    },
    {
      accessorFn: (row: IVerificationRecord) => row.clinician_employee_type,
      id: 'clinician_employee_type',
      name: 'Employee Type',
      isVisible: true,
      header: ({ column }: any) => <DataGridColumnHeader title="Employee Type" column={column} />,
      enableSorting: true,
      cell: (info: any) => {
        const row: IVerificationRecord = info.row.original;
        const employeeType = row.clinician_employee_type || 'N/A';
        const config = EMPLOYEE_TYPE_CONFIG[employeeType] || {
          icon: 'help-circle',
          color: 'gray'
        };
        return (
          <span
            className={`badge font-sm badge-${config.color} shrink-0 badge-outline rounded-[30px] whitespace-nowrap gap-1`}
          >
            <KeenIcon icon={config.icon} />
            {employeeType}
          </span>
        );
      },
      meta: { className: 'min-w-[160px]', cellClassName: 'text-gray-800 font-normal' }
    },
    {
      accessorFn: (row: IVerificationRecord) => row.status,
      id: 'status',
      name: 'Status',
      isVisible: true,
      header: ({ column }: any) => <DataGridColumnHeader title="Status" column={column} />,
      enableSorting: true,
      cell: (info: any) => {
        const row: IVerificationRecord = info.row.original;
        const { icon, color, label } =
          row.status && STATUS_CONFIG[row.status] ? STATUS_CONFIG[row.status] : STATUS_FALLBACK;
        return (
          <span
            className={`badge font-sm badge-${color} shrink-0 badge-outline rounded-[30px] whitespace-nowrap gap-1`}
          >
            <KeenIcon icon={icon} />
            {label}
          </span>
        );
      },
      meta: { className: 'min-w-[140px]', cellClassName: 'text-gray-800 font-normal' }
    },
    {
      accessorFn: (row: IVerificationRecord) => row.status,
      id: 'warning',
      name: 'Alert',
      isVisible: true,
      header: () => <span className="text-xs font-medium text-gray-600">Alert</span>,
      enableSorting: false,
      cell: (info: any) => {
        const row: IVerificationRecord = info.row.original;
        if (row.status === 'match_found' || row.status === 'inconclusive') {
          return <KeenIcon icon="information-2" className="text-danger text-lg" />;
        }
        return null;
      },
      meta: { className: 'min-w-[70px]', cellClassName: 'text-center' }
    },
    {
      accessorFn: (row: IVerificationRecord) => row.verified_at,
      id: 'verified_at',
      name: 'Verified At',
      isVisible: true,
      header: ({ column }: any) => <DataGridColumnHeader title="Verified At" column={column} />,
      enableSorting: true,
      cell: (info: any) => {
        const row: IVerificationRecord = info.row.original;
        return formatVerifiedDate(row.verified_at);
      },
      meta: { className: 'min-w-[140px]', cellClassName: 'text-gray-800 font-normal' }
    },
    {
      accessorFn: (row: IVerificationRecord) => row.pdf_path,
      id: 'pdf',
      name: 'PDF',
      isVisible: true,
      header: () => <span className="text-xs font-medium text-gray-600">PDF</span>,
      enableSorting: false,
      cell: (info: any) => {
        const row: IVerificationRecord = info.row.original;
        if (!row.pdf_path) return <span className="text-gray-400 text-xs">—</span>;
        return (
          <button
            className="btn btn-sm btn-icon btn-light"
            onClick={(e) => {
              e.stopPropagation();
              handleViewPdf(row);
            }}
          >
            <KeenIcon icon="eye" className="text-primary text-base" />
          </button>
        );
      },
      meta: { className: 'min-w-[80px]', cellClassName: 'text-center' }
    }
  ];

  const scrollToThumbnail = (page: number) => {
    const thumbnail = document.getElementById(`pdf-thumbnail-${page}`);
    if (thumbnail) {
      thumbnail.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <>
      <div className="flex flex-wrap justify-between items-center gap-2 border-b-0">
        <h3 className="card-title font-medium text-sm">
          Total Reports: {verifications?.count ?? 0}
        </h3>
        <div className="flex gap-x-2 items-center">
          <div className="relative">
            <KeenIcon
              icon="magnifier"
              className="leading-none text-md absolute top-1/2 start-0 -translate-y-1/2 ms-3"
            />
            <input
              type="text"
              placeholder="Search"
              className="input input-sm ps-8 w-[300px] mt-1"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
            />
          </div>
          <Select
            value={selectedStatus}
            onValueChange={(value) => {
              setSelectedStatus(value);
              setPagination((prev) => ({ ...prev, page: 1 }));
            }}
          >
            <SelectTrigger className="w-[160px] mt-1" size="sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent side="bottom">
              {STATUS_FILTER_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="w-[180px] mt-1 cursor-pointer" onClick={openMonthPicker}>
            <input
              ref={monthInputRef}
              type="month"
              className="input input-sm w-full cursor-pointer"
              value={selectedMonth}
              onChange={(e) => {
                setSelectedMonth(e.target.value);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
            />
          </div>
        </div>
      </div>

      <Grid
        data={verifications?.results ?? []}
        columns={columns}
        isFetchingReports={isLoading}
        isFetchReportsError={isError}
        fetchReportsError={null}
        title="OIG Reports"
        paginationData={pagination}
        setPaginationData={setPagination}
        paginationDataCount={verifications?.count ?? 0}
        refetch={refetch}
        onRowClick={(row: any) => {
          const original = row.original ?? row;
          navigate(`/oig-reports/clinician/${original.clinician}`);
        }}
      />

      <Dialog open={pdfModalOpen} onOpenChange={setPdfModalOpen}>
        <DialogContent className="container-fixed max-w-[auto] pt-7.5 w-[1000px] max-h-[95vh]">
          <DialogHeader className="p-0 border-0">
            <div className="flex items-center justify-between flex-wrap grow gap-5 pb-7.5">
              <h1 className="text-xl font-semibold leading-none text-gray-900">
                OIG Report — {selectedPdfName}
              </h1>
            </div>
          </DialogHeader>
          <DialogBody className="max-h-[600px] h-full overflow-auto bg-gray-100 scrollable-y p-3 mb-5">
            {isPdfResolving ? (
              <div className="h-[520px] flex items-center justify-center text-gray-500 text-lg">
                Loading PDF...
              </div>
            ) : selectedPdfUrl ? (
              <PDFViewer
                file={selectedPdfUrl}
                isReports={true}
                isActions={true}
                pageNumber={pageNumber}
                setPageNumber={setPageNumber}
                setCurrentPage={setCurrentPage}
                currentPage={currentPage}
                pageRefs={pageRefs}
                scrollToThumbnail={scrollToThumbnail}
              />
            ) : (
              <div className="h-[520px] flex items-center justify-center text-gray-500 text-lg">
                {pdfLoadError || 'PDF not found'}
              </div>
            )}
          </DialogBody>
        </DialogContent>
      </Dialog>
    </>
  );
};

export { OIGReports };
